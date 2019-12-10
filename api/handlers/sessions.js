/* eslint-disable no-case-declarations */
const db = require('../../db');
const Sessions = require('../../db/models/enums/sessions');
const Roles = require('../../db/models/enums/roles');
const Status = require('../../db/models/enums/sessionStatus');

const addSession = async (req, res, next) => {
  try {
    const { role, id } = req.user;
    let {
      requester,
      aid,
      serviceProvider,
      date,
      startTime,
      endTime,
      unit,
      sessionType,
      topic
    } = req.body;
    switch (role) {
      case Roles.ServiceProvider:
      case Roles.Learner:
        //make sure serviceProvider has an unbooked availability that corresponds to the aid.
        const [availability] = await db.Availability.find({
          _id: aid,
          booked: false
        });
        const [unitSps] = await db.Unit.find({ _id: unit }).select(
          'serviceProviders'
        );
        console.log(unitSps);
        console.log(availability);
        const spOfUnit = unitSps.serviceProviders.some(sp => {
          const bool = sp.equals(availability.serviceProvider);
          console.log(bool);
          return bool;
        });
        const spIsRequester = availability.serviceProvider.equals(id);
        if (spOfUnit && !spIsRequester) {
          console.log('spOfUnit true');
          const session = await db.Session.create({
            serviceProvider: availability.serviceProvider,
            date: availability.date,
            startTime: availability.startTime,
            endTime: availability.endTime,
            sessionType: sessionType,
            unit,
            requestInfo: {
              requester: id,
              topic
            }
          });
          await db.Availability.findOneAndUpdate(
            { _id: aid },
            { booked: true }
          );
          return res.json(session);
        }
        return res.status(spIsRequester ? 401 : 404).json({
          error: { message: spIsRequester ? 'Not authorized' : 'Not found' }
        });
      case Roles.Manager:
        //todo: check if user has availability matching start and end time, and change it as booked, otherwise do nothing.
        const session = await db.Session.create({
          serviceProvider,
          date,
          startTime,
          endTime,
          sessionType,
          unit,
          sessionStatus: Status.Confirmed,
          requestInfo: {
            requester,
            topic
          }
        });
        return res.json(session);
      default:
        return res.status(401).json({ error: { message: 'Unauthorized' } });
    }
  } catch (err) {
    next(err);
  }
};

const addSessionManual = async (req, res, next) => {
  try {
    const { id: userId, role } = req.user;
    const {
      requester,
      sessionType,
      startTime,
      endTime,
      date,
      unit,
      topic
    } = req.body;
    switch (role) {
      case Roles.ServiceProvider:
        const session = await db.Session.create({
          requestInfo: { requester, topic },
          serviceProvider: userId,
          unit,
          date,
          startTime,
          endTime,
          sessionType
        });
        return res.json(session);
      default:
        return res.status(401).json({ error: { message: 'Not authorized' } });
    }
  } catch (err) {
    next(err);
  }
};

const getSessions = async (req, res, next) => {
  try {
    const { uid } = req.query;
    const { role } = req.user;
    const defaultResponse = {
      sessions: []
    };
    let sessions;
    switch (role) {
      case Roles.Learner:
      case Roles.ServiceProvider:
        sessions = await db.Session.find({
          $or: [{ 'requestInfo.requester': uid }, { serviceProvider: uid }]
        })
          .sort({ startTime: 'desc' })
          .populate({
            path: 'serviceProvider',
            select: '_id profile.firstname profile.lastname profile.email'
          })
          .populate({
            path: 'requestInfo.requester',
            select: '_id profile.firstname profile.lastname profile.email'
          })
          .populate({
            path: 'unit',
            select: '_id unitName unitTitle unitCode'
          })
          .populate({
            path: 'attendance',
            select: 'profile.firstname profile.lastname'
          });
        break;
      case Roles.Manager:
        sessions = await db.Session.find()
          .sort({ startTime: 'desc' })
          .populate({
            path: 'serviceProvider',
            select: '_id profile.firstname profile.lastname profile.email'
          })
          .populate({
            path: 'requestInfo.requester',
            select: '_id profile.firstname profile.lastname profile.email'
          })
          .populate({
            path: 'unit',
            select: '_id unitName unitTitle unitCode'
          })
          .populate({
            path: 'attendance',
            select: 'profile.firstname profile.lastname'
          });
        break;
      default:
        return res.status(401).json({ error: { message: 'Not authorized !' } });
    }
    return res.json(sessions.length > 0 ? { sessions } : defaultResponse);
  } catch (err) {
    next(err);
  }
};

const getSession = async (req, res, next) => {
  try {
    const { sid } = req.params;
    const session = await db.Session.findOne({ _id: sid })
      .populate({
        path: 'serviceProvider',
        select: '_id profile.firstname profile.lastname profile.email'
      })
      .populate({
        path: 'requestInfo.requester',
        select: '_id profile.firstname profile.lastname profile.email'
      })
      .populate({
        path: 'unit',
        select: '_id unitName unitTitle unitCode'
      })
      .populate({
        path: 'attendance',
        select: 'profile.firstname profile.lastname'
      });
    return res.json(session);
  } catch (err) {
    next(err);
  }
};

const modifySessionStatus = async (req, res, next) => {
  try {
    //redo for validation and security
    const { sid } = req.params;
    const { status } = req.body;
    const { id: userId, role } = req.user;
    //Only users allowed to change a sessions's status are that session's service provider and the manager
    const toUpdate = await db.Session.find({ _id: sid });
    const canModify =
      toUpdate[0].serviceProvider.equals(userId) || role === Roles.Manager;
    if (canModify) {
      const session = await db.Session.findOneAndUpdate(
        { _id: sid },
        { $set: { sessionStatus: status } },
        { new: true }
      )
        .populate({
          path: 'serviceProvider',
          select: '_id profile.firstname profile.lastname profile.email'
        })
        .populate({
          path: 'requestInfo.requester',
          select: '_id profile.firstname profile.lastname profile.email'
        })
        .populate({
          path: 'unit',
          select: '_id unitName unitTitle unitCode'
        })
        .populate({
          path: 'attendance',
          select: 'profile.firstname profile.lastname'
        });
      if (status === Status.Canceled) {
        await db.Availability.findOneAndUpdate(
          {
            date: session.date,
            startTime: session.startTime,
            endTime: session.endTime,
            serviceProvider: session.serviceProvider
          },
          { $set: { booked: false } }
        );
      }
      return res.json(session);
    }
    res.status(401).json({ error: { message: 'Not authorized !' } });
  } catch (err) {
    next(err);
  }
};

const addAttendance = async (req, res, next) => {
  try {
    const { sid } = req.params;
    const { attendance } = req.body;
    const session = await db.Session.findOneAndUpdate(
      { _id: sid },
      { $set: { attendance, sessionStatus: Status.Attended } },
      { new: true }
    )
      .populate({
        path: 'serviceProvider',
        select: '_id profile.firstname profile.lastname profile.email'
      })
      .populate({
        path: 'requestInfo.requester',
        select: '_id profile.firstname profile.lastname profile.email'
      })
      .populate({
        path: 'unit',
        select: '_id unitName unitTitle unitCode'
      })
      .populate({
        path: 'attendance',
        select: 'profile.firstname profile.lastname'
      });
    return res.json(session);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addSession,
  getSession,
  getSessions,
  addAttendance,
  modifySessionStatus,
  addSessionManual
};
