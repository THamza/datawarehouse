const db = require('../../db/');
const moment = require('moment');
const Status = require('../../db/models/enums/sessionStatus');
const mongoose = require('mongoose');

exports.dashboardManager = async (req, res, next) => {
  try {
    const startOfToday = moment().startOf('day');
    const endOfToday = moment().endOf('day');
    const confirmedSessionsOfToday = await db.Session.find({
      startTime: {
        $gte: startOfToday.toISOString(),
        $lte: endOfToday.toISOString()
      },
      sessionsStatus: Status.Confirmed
    })
      .sort({ startTime: 'asc' })
      .populate({ path: 'unit', select: 'unitCode unitTitle service' })
      .populate({
        path: 'serviceProvider',
        select: 'profile.firstname profile.lastname'
      })
      .populate({
        path: 'requestInfo.requester',
        select: 'profile.firstname profile.lastname'
      });
    const nonConfirmedSessionsOfToday = await db.Session.find({
      startTime: {
        $gte: startOfToday.toISOString(),
        $lte: endOfToday.toISOString()
      },
      sessionsStatus: Status.Requested
    })
      .sort({ startTime: 'asc' })
      .populate({ path: 'unit', select: 'unitCode unitTitle service' })
      .populate({
        path: 'serviceProvider',
        select: 'profile.firstname profile.lastname'
      })
      .populate({
        path: 'requestInfo.requester',
        select: 'profile.firstname profile.lastname'
      });
    let [result] = await db.Session.aggregate([
      { $group: { _id: '$unit', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    let mostRequestedUnit = await db.Unit.findOne({ _id: result._id }).select(
      'unitTitle unitCode service'
    );
    res.json({
      confirmedSessionsOfToday,
      nonConfirmedSessionsOfToday,
      mostRequestedUnit
    });
  } catch (err) {
    next(err);
  }
};

exports.dashboardServiceProvider = async (req, res, next) => {
  try {
    const { id } = req.user;
    const now = new Date();
    const upcomingSessions = await db.Session.find({
      serviceProvider: id,
      sessionStatus: Status.Confirmed,
      startTime: {
        $gte: now
      }
    })
      .sort({ startTime: 'asc' })
      .limit(10)
      .populate({ path: 'unit', select: 'unitCode unitTitle service' })
      .populate({
        path: 'requestInfo.requester',
        select: 'profile.firstname profile.lastname profile.imageUrl'
      });
    const latestSessions = await db.Session.find({
      serviceProvider: id,
      $or: [
        { sessionStatus: Status.Confirmed },
        { sessionStatus: Status.Attended }
      ],
      startTime: {
        $lte: now
      }
    })
      .sort({ startTime: 'desc' })
      .limit(10)
      .populate({ path: 'unit', select: 'unitCode unitTitle service' })
      .populate({
        path: 'requestInfo.requester',
        select: 'profile.firstname profile.lastname'
      });
    const latestRequests = await db.Session.find({
      serviceProvider: id,
      sessionStatus: Status.Requested
    })
      .sort({ startTime: 'desc' })
      .limit(10)
      .populate({ path: 'unit', select: 'unitCode unitTitle service' })
      .populate({
        path: 'requestInfo.requester',
        select: 'profile.firstname profile.lastname'
      });
    let result = await db.Session.aggregate([
      { $match: { serviceProvider: mongoose.Types.ObjectId(id) } },
      { $group: { _id: '$unit', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    console.log('result: ', result);
    const unit = result.length > 0 ? result[0]._id : undefined;
    let mostRequestedUnit = await db.Unit.findOne({ _id: unit }).select(
      'unitTitle unitCode service'
    );
    mostRequestedUnit = mostRequestedUnit ? mostRequestedUnit : {};
    let total = await db.Session.aggregate([
      {
        $match: {
          serviceProvider: mongoose.Types.ObjectId(id),
          $or: [
            { sessionStatus: Status.Attended },
            { sessionStatus: Status.Confirmed }
          ]
        }
      },
      {
        $count: 'totalSessions'
      }
    ]);
    total = total.length > 0 ? total.totalSessions : 0;
    res.json({
      upcomingSessions,
      latestSessions,
      latestRequests,
      mostRequestedUnit,
      totalSessions: total
    });
  } catch (err) {
    next(err);
  }
};
