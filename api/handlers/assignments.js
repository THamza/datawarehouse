const db = require('../../db');
const Status = require('../../db/models/enums/assignmentStatus');
const Roles = require('../../db/models/enums/roles');

exports.addAssignment = async (req, res, next) => {
  try {
    let { serviceProvider, unitId } = req.body;
    let { id, role } = req.user;
    if (role === Roles.ServiceProvider) {
      const assignment = await db.Assignment.create({
        unit: unitId,
        serviceProvider: id,
        createdBy: id,
        updatedBy: id
      });
      await db.User.findOneAndUpdate(
        { _id: id },
        {
          $addToSet: { assignments: assignment._id }
        }
      );
      res.json(assignment);
    }
    // might add coordinator action for future work
  } catch (err) {
    if (err.code === 11000) {
      return next({
        status: 409,
        message: 'Sorry, that assignment already exists !'
      });
    }
    next(err);
  }
};

exports.patchAssignment = async (req, res, next) => {
  try {
    const { aid } = req.params;
    const { id } = req.user;
    let { status } = req.body;
    let oldAssignment = await db.Assignment.findOne({ _id: aid });
    console.log(oldAssignment);
    let assignment;
    switch (oldAssignment.status) {
      case Status.Approved:
        if (status === Status.Rejected) {
          assignment = await db.Assignment.findOneAndUpdate(
            {
              _id: aid
            },
            { $set: { status, updatedBy: id } },
            { new: true }
          )
            .populate({
              path: 'serviceProvider',
              select: 'profile.firstname profile.lastname'
            })
            .populate({ path: 'unit', select: 'unitCode unitTitle' })
            .populate({
              path: 'updatedBy',
              select: 'profile.firstname profile.lastname'
            });
          console.log('status is approved', assignment);
          await db.Unit.findOneAndUpdate(
            { _id: oldAssignment.unit },
            { $pull: { serviceProviders: oldAssignment.serviceProvider } }
          );
          return res.json({ assignment });
        }
        break;
      case Status.Rejected:
        if (status === Status.Approved) {
          assignment = await db.Assignment.findOneAndUpdate(
            {
              _id: aid
            },
            { $set: { status, updatedBy: id } },
            { new: true }
          )
            .populate({
              path: 'serviceProvider',
              select: 'profile.firstname profile.lastname'
            })
            .populate({ path: 'unit', select: 'unitCode unitTitle' })
            .populate({
              path: 'updatedBy',
              select: 'profile.firstname profile.lastname'
            });
          console.log('status is rejected', assignment);

          await db.Unit.findOneAndUpdate(
            { _id: oldAssignment.unit },
            { $push: { serviceProviders: oldAssignment.serviceProvider } }
          );
          return res.json({ assignment });
        }
        break;
      case Status.Requested:
        if (status === Status.Approved || status === Status.Rejected) {
          console.log('i am in here');
          assignment = await db.Assignment.findOneAndUpdate(
            {
              _id: aid
            },
            { $set: { status, updatedBy: id } },
            { new: true }
          )
            .populate({
              path: 'serviceProvider',
              select: 'profile.firstname profile.lastname'
            })
            .populate({ path: 'unit', select: 'unitCode unitTitle' })
            .populate({
              path: 'updatedBy',
              select: 'profile.firstname profile.lastname'
            });
          console.log('status is requested:', assignment);

          if (status === Status.Approved)
            await db.Unit.findOneAndUpdate(
              { _id: oldAssignment.unit },
              { $push: { serviceProviders: oldAssignment.serviceProvider } }
            );
          return res.json({ assignment });
        }
        break;
    }
    res.status(400).json({ error: { message: 'Cannot perform action' } });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.deleteAssignment = async (req, res, next) => {
  try {
    const { aid } = req.params;
    const assignment = await db.Assignment.findOneAndDelete({
      _id: aid,
      status: Status.Requested
    });
    await db.User.findOneAndUpdate(
      { _id: assignment._id },
      {
        $pull: { assignments: assignment._id }
      }
    );
    res.json({ message: 'Availability deleted successfully !' });
  } catch (e) {
    next(e);
  }
};

exports.getAssignments = async (req, res, next) => {
  try {
    const assignments = await db.Assignment.find({})
      .populate({
        path: 'serviceProvider',
        select: 'profile.firstname profile.lastname'
      })
      .populate({ path: 'unit', select: 'unitCode unitTitle service' })
      .populate({
        path: 'updatedBy',
        select: 'profile.firstname profile.lastname'
      })
      .sort({ createdAt: 'desc' });
    res.json({ assignments });
  } catch (e) {
    next(e);
  }
};

exports.getAssignment = async (req, res, next) => {
  try {
    const { aid } = req.params;
    const assignment = await db.Assignment.find({ _id: aid });
    res.json(assignment);
  } catch (e) {
    next(e);
  }
};
