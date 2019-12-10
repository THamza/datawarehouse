const db = require('../../db');
const moment = require('moment');
const Status = require('../../db/models/enums/assignmentStatus');
const SessionStatus = require('../../db/models/enums/sessionStatus');

exports.addUnit = async function(req, res, next) {
  try {
    const { id } = req.user;
    let {
      unitCode,
      unitTitle,
      unitName,
      description,
      service,
      school,
      serviceProviders
    } = req.body;
    let unit = await db.Unit.create({
      unitName,
      unitCode,
      unitTitle,
      description,
      service,
      school,
      createdBy: id,
      serviceProviders
    });
    const assignments = await Promise.all(
      serviceProviders.map(spId =>
        db.Assignment.create({
          serviceProvider: spId,
          unit: unit._id,
          status: Status.Approved,
          createdBy: id,
          updatedBy: id
        })
      )
    );
    await Promise.all(
      assignments.map(assignment =>
        db.User.findOneAndUpdate(
          {
            _id: assignment.serviceProvider
          },
          { $push: { assignments: assignment._id } }
        )
      )
    );
    return res.status(200).json(unit);
  } catch (err) {
    return next(err);
  }
};

exports.getUnit = async function(req, res, next) {
  try {
    let { uid } = req.params;
    let { sid } = req.query;
    let { id: userId } = req.user;
    let [unit] = await db.Unit.find({
      _id: uid,
      service: sid
    }).populate({
      path: 'serviceProviders',
      select:
        'profile.firstname profile.lastname profile.email profile.major profile.imageUrl'
    });
    //add virtual next
    unit = unit.toObject();
    // unit.alreadyOffers = unit.serviceProviders.some(sp =>
    //   sp._id.equals(userId)
    // );
    let userAssignments = await db.Assignment.find({
      serviceProvider: userId,
      unit: uid
    });
    unit.alreadyOffers = userAssignments.length > 0;
    return res.status(200).json(unit);
  } catch (e) {
    next(e);
  }
};

exports.getUnitAvailability = async function(req, res, next) {
  try {
    //if date is tomorrow, check if time is > 9: if yes return []
    let { uid } = req.params;
    let { sid, date } = req.query;
    let { id } = req.user;
    date = new Date(date) || new Date();
    if (
      moment(date).isSame(moment().add(1, 'days'), 'day') &&
      moment().hours() > 21
    )
      return res.status(400).json({
        error: {
          message: `You cannot try booking tomorrow's sessions after 9pm !`
        }
      });
    if (moment(date).isSame(moment(), 'day'))
      return res.status(400).json({
        error: {
          message: 'You cannot try booking a session occuring the same day !'
        }
      });
    const sessions = await db.Session.find({
      'requestInfo.requester': id,
      date: date,
      $or: [
        { sessionStatus: SessionStatus.Confirmed },
        { sessionStatus: SessionStatus.Requested }
      ]
    });
    if (sessions.length > 0)
      return res.status(400).json({
        error: {
          message:
            'You cannot book more than one session per unit during the same day'
        }
      });
    var gtq = moment(date, 'DD-MM-YYYY').isSame(new Date(), 'day')
      ? moment(new Date(), 'DD-MM-YYYY HH:mm')
      : moment(date, 'DD-MM-YYYY');
    var ltq = moment(gtq).endOf('day');
    console.log(
      `first ${gtq} ssecond ${gtq.toISOString()} third ${ltq.toISOString()}`
    );
    let [unit] = await db.Unit.find({
      _id: uid,
      service: sid
    }).populate({
      path: 'serviceProviders',
      match: { availability: { $exists: true, $ne: [] } },
      select:
        'profile.firstname profile.lastname profile.email profile.imageUrl availability',
      populate: {
        path: 'availability',
        select: 'serviceProvider date startTime endTime booked',
        match: {
          startTime: {
            $gte: gtq.toISOString(),
            $lte: ltq.toISOString()
          }
        },
        options: { sort: { startTime: 'asc' } }
      }
    });
    unit.serviceProviders = unit.serviceProviders.filter(
      sp => sp.availability.length > 0
    );
    console.log(unit);
    return res.status(200).json(unit);
  } catch (e) {
    next(e);
  }
};

exports.getUnits = async function(req, res, next) {
  try {
    const { sid } = req.query;
    let courses = await db.Unit.find({
      service: sid
    }).sort({
      unitCode: 'asc'
    });
    return res.status(200).json(courses);
  } catch (err) {
    return next(err);
  }
};

//use this if units ever get large enough to impact performance
exports.getUnitsFromSearch = async (req, res, next) => {
  const { q, sid } = req.query;
  console.log(q);
  let unit = await db.Unit.find({
    $or: [
      {
        unitTitle: { $regex: `${q}`, $options: 'i' }
      },
      { unitCode: { $regex: `${q}`, $options: 'i' } }
    ]
  }).select('unitCode unitTitle');
  return res.json(unit);
};

//use this if units ever get large enough to impact performance
exports.getUnitsPagination = async function(req, res, next) {
  try {
    const { sid, school, page } = req.query;
    const perPage = 5;
    let courses = await db.Unit.find({
      service: sid,
      school
    })
      .skip(page * perPage)
      .limit(5)
      .sort({
        unitCode: 'asc'
      });
    return res.status(200).json(courses);
  } catch (err) {
    return next(err);
  }
};

exports.deleteUnit = async function(req, res, next) {
  try {
    const { uid } = req.params;
    await db.Unit.findOneAndRemove({ _id: uid });
    return res.status(200).json({ message: 'Unit deleted successfully' });
  } catch (e) {
    return next(e);
  }
};

exports.editUnit = async function(req, res, next) {
  try {
    const { uid } = req.params;
    let {
      unitCode,
      unitTitle,
      unitName,
      description,
      imageUrl,
      createdBy
    } = req.body;
    let unit = await db.Unit.findOneAndUpdate(
      { _id: uid },
      { unitCode, unitTitle, unitName, description, imageUrl, createdBy },
      { new: true }
    );
    console.log(unit);
    return res.status(200).json({ message: 'Unit updated successfully !' });
  } catch (e) {
    return next(e);
  }
};
