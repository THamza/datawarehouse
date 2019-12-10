const db = require('../../db');
const mailer = require('../utils/mailer');
const Role = require('../../db/models/enums/roles');

exports.addUser = async function(req, res, next) {
  try {
    const { host } = req.headers;
    const {
      email,
      firstname,
      lastname,
      major,
      school,
      password,
      phoneNumber
    } = req.body;
    const user = await db.User.create({
      profile: { email, firstname, lastname, major, school, phoneNumber },
      authentication: { password }
    });
    await mailer.sendVerificationEmail(host, user);
    return res.status(200).json({
      message: `A verification email has been sent to ${email}`
    });
  } catch (err) {
    if (err.code === 11000) {
      return next({
        status: 409,
        message: 'Sorry, that username and/or email is taken'
      });
    }
    return next(err);
  }
};

exports.getUsersMinimal = async (req, res, next) => {
  try {
    let { role } = req.query;
    role = role.toLowerCase();
    let defaultResponse = {
      users: []
    };
    let users = await db.User.find({ role })
      .select('profile.firstname profile.lastname')
      .sort({ firstname: 'asc' });
    return res.status(200).json(users.length > 0 ? { users } : defaultResponse);
  } catch (err) {
    return next(err);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    let { role } = req.query;
    let defaultResponse = { users: [] };
    let users = await db.User.find(
      { role },
      {
        profile: 1,
        'authentication.active': 1,
        role: 1,
        hoursWorked: 1,
        blocked: 1,
        maxHours: 1,
        services: 1,
        createdAt: 1
      }
    )
      .populate({ path: 'services', select: 'title' })
      .sort({ firstname: 'asc' });
    return res.status(200).json(users.length > 0 ? { users } : defaultResponse);
  } catch (err) {
    return next(err);
  }
};

exports.getUser = async function(req, res, next) {
  try {
    const { uid } = req.params;
    const { role } = req.user;
    let user;
    if (role === Role.Manager) {
      [user] = await db.User.find({ _id: uid })
        .populate({
          path: 'assignments',
          match: { status: 'approved' },
          populate: { path: 'unit', select: 'unitCode unitTitle' }
        })
        .populate({ path: 'services', select: 'title' })
        .select(
          'profile authentication.active hoursWorked maxHours role services blocked'
        );
    } else if (role === Role.ServiceProvider || role === Role.Learner) {
      [user] = await db.User.find({ _id: uid })
        .populate({ path: 'services', select: 'title' })
        .select('profile authentication.active services');
    }
    // const userSessions = await db.Session.find({ serviceProvider })

    return res.status(200).json(user);
  } catch (e) {
    next(e);
  }
};

exports.patchUser = async function(req, res, next) {
  try {
    const { uid } = req.params;
    const { blocked } = req.body;
    const user = await db.User.findOneAndUpdate(
      { _id: uid },
      { $set: { blocked } },
      { new: true }
    )
      .populate({
        path: 'assignments',
        match: { status: 'approved' },
        populate: { path: 'unit', select: 'unitCode unitTitle' }
      })
      .populate({ path: 'services', select: 'title' })
      .select(
        'profile authentication.active hoursWorked maxHours role services blocked'
      );
    // const userSessions = await db.Session.find({ serviceProvider })

    return res.status(200).json(user);
  } catch (e) {
    next(e);
  }
};

exports.deleteUser = async function(req, res, next) {
  try {
    const { uid } = req.params;
    await db.User.findByIdAndRemove(uid);
    return res.status(200).json({ message: 'user deleted successfully!' });
  } catch (e) {
    return next(e);
  }
};

exports.editUserByManager = async function(req, res, next) {
  try {
    const { uid } = req.params;
    let {
      email,
      firstname,
      lastname,
      major,
      school,
      phoneNumber,
      role,
      maxHours
    } = req.body;
    let user = await db.User.findOneAndUpdate(
      { _id: uid },
      {
        $set: {
          profile: {
            email,
            firstname,
            lastname,
            major,
            school,
            phoneNumber
          },
          role,
          maxHours
        }
      },
      {
        new: true
      }
    )
      .populate({
        path: 'assignments',
        match: { status: 'approved' },
        populate: { path: 'unit', select: 'unitCode unitTitle' }
      })
      .populate({ path: 'services', select: 'title' })
      .select(
        'profile authentication.active hoursWorked maxHours role services blocked'
      );
    return res.status(200).json(user);
  } catch (e) {
    return next(e);
  }
};

exports.requestService = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const { unitId } = req.body;
    const request = await db.User.findOneAndUpdate(
      { _id: uid, 'units.unit': { $ne: unitId } },
      {
        $push: { units: { unit: unitId, status: 'requested' } }
      }
    );
    if (request === null) throw Error('already exists');
    return res.json(request);
  } catch (err) {
    next(err);
  }
};

exports.deleteServiceRequest = async (req, res, next) => {
  try {
    const { uid, unitId } = req.params;
    const request = await db.User.findOneAndUpdate(
      { _id: uid },
      { $pull: { units: { unit: unitId } } }
    );
    return res.json(request);
  } catch (err) {
    next(err);
  }
};

exports.confirmService = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const { unitId } = req.body;
    const confirmation = await db.User.update(
      { _id: uid, 'units.unit': unitId },
      { $set: { 'units.$.status': 'approved' } }
    );
    const unit = await db.Unit.findOneAndUpdate(
      { _id: unitId },
      { $push: { serviceProviders: uid } }
    );
    return res.json(unit);
  } catch (err) {
    next(err);
  }
};

exports.rejectService = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const { unitId } = req.body;
    const rejection = await db.User.update(
      { _id: uid, 'units.unit': unitId },
      { $set: { 'units.$.status': 'rejected' } }
    );
    return res.json(rejection);
  } catch (err) {
    next(err);
  }
};

exports.getAllServices = async (req, res, next) => {
  try {
    console.log('in allservices');
    let units = await db.User.find({ role: 'serviceprovider' })
      .populate({
        path: 'units.unit',
        select: 'unitCode unitTitle service'
      })
      .select('units');
    units = [].concat.apply([], units.map(u => u.units));
    const defaultResponse = {
      units: []
    };
    res.json(units.length > 0 ? { units } : defaultResponse);
  } catch (err) {
    next(err);
  }
};

exports.getAssignments = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const assignments = await db.User.find({
      _id: uid
    })
      .populate({
        path: 'assignments',
        select: '-serviceProvider',
        populate: {
          path: 'unit',
          select: 'unitCode unitTitle service'
        }
      })
      .select('assignments');
    const defaultResponse = {
      assignments: []
    };
    res.json(assignments.length > 0 ? assignments[0] : defaultResponse);
  } catch (err) {
    next(err);
  }
};

exports.getServices = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const units = await db.User.find({
      _id: uid
    })
      .populate({
        path: 'units.unit',
        select: 'unitCode unitTitle service'
      })
      .select('units');
    const defaultResponse = {
      units: []
    };
    res.json(units.length > 0 ? units[0] : defaultResponse);
  } catch (err) {
    next(err);
  }
};

exports.getUserAvailability = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const defaultResponse = {
      availability: []
    };
    const user = await db.User.find({ _id: uid })
      .populate({ path: 'availability' })
      .select('availability');
    res.json(user.length > 0 ? user[0] : defaultResponse);
  } catch (err) {
    next(err);
  }
};

exports.getUsersFromSearch = async (req, res, next) => {
  try {
    const { q, role } = req.query;
    console.log(q);
    let users;
    if (role === 'all')
      users = await db.User.aggregate()
        .project({
          fullname: {
            $concat: ['$profile.firstname', ' ', '$profile.lastname']
          },
          role: '$role'
        })
        .match({
          fullname: { $regex: `${q}`, $options: 'i' },
          $or: [{ role: Role.ServiceProvider }, { role: Role.Learner }]
        });
    else
      users = await db.User.aggregate()
        .project({
          fullname: {
            $concat: ['$profile.firstname', ' ', '$profile.lastname']
          },
          role: '$role'
        })
        .match({ fullname: { $regex: `${q}`, $options: 'i' }, role });
    return res.json(users);
  } catch (err) {
    next(err);
  }
};

exports.addService = async (req, res, next) => {
  try {
    const { role } = req.user; //only managers can do this.
    const { uid } = req.params;
    const { service } = req.body;
    await db.User.findOneAndUpdate(
      { _id: uid },
      { $push: { services: service } }
    );
    return res.json({ message: 'Service successfully added to user.' });
  } catch (err) {
    next(err);
  }
};

// exports.getUserSessions = async (req, res, next) => {
//   try {
//     const { uid } = req.params;
//     const defaultResponse = {
//       sessions: []
//     };
//     const sessions = await db.Session.find({ serviceProvider: uid })
//       .populate({
//         path: 'requestInfo.requester',
//         select: 'profile'
//       })
//       .populate({ path: 'unit', select: 'unitTitle' });
//     res.json(sessions.length > 0 ? { sessions } : defaultResponse);
//   } catch (err) {
//     next(err);
//   }
// };
