const db = require('../../db');
const { createToken } = require('../middleware/auth');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const mongoose = require('mongoose');

const studentDimensionCSV = createCsvWriter({
  path: './studentDimension.csv',
  header: [
    { id: 'studentNaturalKey', title: 'studentNaturalKey', default: null },
    { id: 'studentKey', title: 'studentKey', default: null },
    { id: 'AUID', title: 'AUID', default: null },
    { id: 'firstName', title: 'firstName', default: null },
    { id: 'lastName', title: 'lastName', default: null },
    { id: 'school', title: 'school', default: null },
    { id: 'major', title: 'major', default: null },
    { id: 'email', title: 'email', default: null },
    { id: 'phoneNumber', title: 'phoneNumber', default: null },
    { id: 'blocked', title: 'isBlocked', default: null },
    { id: 'role', title: 'role', default: null },
    { id: 'maxHours', title: 'maxHours', default: null },
    { id: 'active', title: 'active', default: null }
  ]
});

const factTableCSV = createCsvWriter({
  path: './factTable.csv',
  header: [
    { id: 'sessionNaturalKey', title: 'sessionNaturalKey', default: null },
    { id: 'sessionKey', title: 'sessionKey', default: null },
    { id: 'requestedDateKey', title: 'requestedDateKey', default: null },
    { id: 'requestedTimeKey', title: 'requestedTimeKey', default: null },
    { id: 'startDateKey', title: 'startDateKey', default: null },
    { id: 'startTimeKey', title: 'startTimeKey', default: null },
    { id: 'endDateKey', title: 'endDateKey', default: null },
    { id: 'endTimeKey', title: 'endTimeKey', default: null },
    { id: 'tutorKey', title: 'tutorKey', default: null },
    { id: 'tutorSchool', title: 'tutorSchool', default: null },
    { id: 'tutorMajor', title: 'tutorMajor', default: null },
    { id: 'studentKey', title: 'studentKey', default: null },
    { id: 'studentSchool', title: 'studentSchool', default: null },
    { id: 'studentMajor', title: 'studentMajor', default: null },
    { id: 'courseKey', title: 'courseKey', default: null },
    { id: 'type', title: 'type', default: null },
    { id: 'status', title: 'status', default: null },
    { id: 'didAttend', title: 'didAttend', default: null },
    { id: 'cancellationReason', title: 'cancellationReason', default: null },
    { id: 'topic', title: 'topic', default: null },
    { id: 'professor', title: 'professor', default: null },
    { id: 'location', title: 'location', default: null },
    { id: 'duration', title: 'duration', default: 0 }
  ]
});

exports.login = async function(req, res, next) {
  try {
    const { email, password } = req.body;
    let user = await db.User.findOne({ 'profile.email': email });
    let {
      authentication: { active },
      _id: id,
      profile: { imageUrl, firstname, lastname },
      role,
      services
    } = user;
    if (!active)
      return next({
        status: 401,
        message: 'Please activate your account first !'
      });
    let isMatch = await user.comparePassword(password);
    if (isMatch) {
      const fullname = `${firstname} ${lastname}`;
      let token = createToken({
        id,
        role,
        email,
        imageUrl,
        fullname,
        services
      });
      return res.status(200).json({
        id,
        role,
        email,
        services,
        imageUrl,
        fullname,
        token
      });
    } else {
      return next({
        status: 401,
        message: 'Wrong credentials'
      });
    }
  } catch (e) {
    return next({
      status: 401,
      message: 'Wrong credentials'
    });
  }
};

exports.generateStudentDimenssion = async function(req, res, next) {
  try {
    let inc = 0;
    let records = [];
    let users = await db.User.find({});
    users.forEach(user => {
      inc++;
      records.push({
        studentNaturalKey: user._id,
        studentKey: inc,
        AUID: user.AUID,
        firstName: user.profile.firstname,
        lastName: user.profile.lastname,
        school: user.profile.school,
        major: user.profile.major,
        email: user.profile.email,
        phoneNumber: user.profile.phoneNumber,
        blocked: user.blocked.toString(),
        role: user.role,
        active: user.authentication.active,
        maxHours: user.maxHours
      });
    });

    return studentDimensionCSV
      .writeRecords(records)
      .then(() => {
        console.log('...Done');
      })
      .then(() => {
        return res.status(200).json({
          status: '...Conversion Completed'
        });
      });
  } catch (e) {
    console.log(e);
    return next({
      status: 401,
      message: 'Wrong credentials'
    });
  }
};

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

exports.generateFactTable = async function(req, res, next) {
  try {
    let inc = 1;
    let records = [];
    let sessions = await db.Session.find({});
    asyncForEach(sessions, async session => {
      let sessionNaturalKey = session._id;
      let sessionKey = inc++;
      let type = session.sessionType;
      let status = session.sessionStatus;
      let didAttend = session.attendance.length ? true : false;
      let topic = session.requestInfo.topic;
      let professor = session.requestInfo.professor;
      let requestedDateKey =
        (
          parseInt(session.requestInfo.requestedAt.getMonth(), 10) + 1
        ).toString() +
        '/' +
        session.requestInfo.requestedAt.getDate() +
        '/' +
        (
          parseInt(session.requestInfo.requestedAt.getYear(), 10) % 100
        ).toString();

      let minutes = session.requestInfo.requestedAt.getMinutes().toString();
      if (minutes.length === 1) minutes = '0' + minutes;
      let requestedTimeKey =
        (
          parseInt(session.requestInfo.requestedAt.getHours(), 10) - 1
        ).toString() +
        ':' +
        minutes;

      let startDateKey =
        (parseInt(session.startTime.getMonth(), 10) + 1).toString() +
        '/' +
        session.startTime.getDate() +
        '/' +
        (parseInt(session.startTime.getYear(), 10) % 100).toString();

      minutes = session.startTime.getMinutes().toString();
      if (minutes.length === 1) minutes = '0' + minutes;
      let startTimeKey =
        (parseInt(session.startTime.getHours(), 10) - 1).toString() +
        ':' +
        minutes;

      let endDateKey =
        (parseInt(session.endTime.getMonth(), 10) + 1).toString() +
        '/' +
        session.endTime.getDate() +
        '/' +
        (parseInt(session.endTime.getYear(), 10) % 100).toString();

      minutes = session.endTime.getMinutes().toString();
      if (minutes.length === 1) minutes = '0' + minutes;

      let endTimeKey =
        parseInt(session.endTime.getHours(), 10).toString() + ':' + minutes;

      let duration = Math.abs(session.startTime - session.endTime) / 60000; //in minutes
      let cancellationReason = session.reason;
      let location = session.location;
      let tutorKey = '';
      let tutorSchool = '';
      let tutorMajor = '';
      await db.User.findOne({
        _id: mongoose.Types.ObjectId(session.serviceProvider)
      }).then(tutor => {
        if (tutor) {
          tutorKey = tutor.AUID;
          tutorSchool = tutor.profile.school;
          tutorMajor = tutor.profile.major;
        }
      });
      let studentKey = '';
      let studentSchool = '';
      let studentMajor = '';
      await db.User.findOne({
        _id: mongoose.Types.ObjectId(session.requestInfo.requester)
      }).then(student => {
        if (student) {
          studentKey = student.AUID;
          studentSchool = student.profile.school;
          studentMajor = student.profile.major;
        }
      });
      let courseKey = '';
      await db.Unit.findOne({
        _id: mongoose.Types.ObjectId(session.unit)
      }).then(unit => {
        if (unit) {
          courseKey = unit.unitCode.replace(/\s/g, '');
        }
      });
      records.push({
        sessionNaturalKey,
        sessionKey,
        tutorKey,
        tutorSchool,
        tutorMajor,
        studentKey,
        studentSchool,
        studentMajor,
        courseKey,
        requestedDateKey,
        requestedTimeKey,
        startDateKey,
        startTimeKey,
        endDateKey,
        endTimeKey,
        type,
        status,
        didAttend,
        topic,
        professor,
        duration,
        cancellationReason,
        location
      });
    }).then(() => {
      return factTableCSV
        .writeRecords(records)
        .then(() => {
          console.log('...Done');
        })
        .then(() => {
          return res.status(200).json({
            status: '...Conversion Completed'
          });
        });
    });
  } catch (e) {
    console.log(e);
    return next({
      status: 401,
      message: 'Wrong credentials'
    });
  }
};

exports.confirmation = async function(req, res, next) {
  try {
    const { token } = req.params;
    const verifToken = await db.VerificationToken.findOneAndDelete({
      token
    });
    if (!verifToken)
      return next({
        status: 400,
        message: 'Token does not exist or account already activated !'
      });
    const { userId: id } = verifToken;
    console.log(id);
    const user = await db.User.findOneAndUpdate(
      { _id: id },
      { 'authentication.active': true },
      { new: true }
    );
    console.log(user);
    res.json({ message: 'user account activated successfully !' });
  } catch (err) {
    next(err);
  }
};
