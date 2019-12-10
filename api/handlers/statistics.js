const db = require('../../db');
const moment = require('moment');
const Promise = require('bluebird');

exports.getStatistics = async function(req, res, next) {
  try {
    let toReturn = {
      status: 'success',
      success: {
        code: 100,
        message: 'Statistics has been retrieved successfully'
      },
      data: {
        numberOfUsers: 0,
        numberOfFeedback: 0,
        numberOfCourses: 0,
        numberOfLearningSession: 0,
        numberOfActivatedAccounts: 0,
        weeklyTraffic: [],
        yearlyTraffic: {
          course: [],
          feedback: [],
          learningSession: [],
          user: []
        }
      }
    };
    let dt = await db.User.find({});
    toReturn.data.numberOfUsers = dt.length;
    dt = await db.Feedback.find({});
    toReturn.data.numberOfFeedback = dt.length;
    dt = await db.Course.find({});
    toReturn.data.numberOfCourses = dt.length;
    dt = await db.Session.find({});
    console.log(dt);
    toReturn.data.numberOfLearningSession = dt.length;
    dt = await db.User.find({ flag: true });
    toReturn.data.numberOfActivatedAccounts = dt.length;
    let data = [0, 0, 0, 0, 0, 0, 0];
    let today = new Date();
    dt = await db.Session.find({
      updatedAt: { $gte: moment(today).subtract(7, 'days'), $lt: moment(today) }
    }).then(userTokens => {
      return Promise.each(userTokens, userToken => {
        for (let i = 0; i < data.length; i++) {
          data[userToken.updatedAt.getDay()]++;
          break;
        }
      }).then(() => {
        return data;
      });
    });
    toReturn.data.weeklyTraffic = dt;

    data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    dt = await db.Course.find({
      updatedAt: {
        $gte: moment(today).subtract(1, 'years'),
        $lt: moment(today)
      }
    }).then(courses => {
      return Promise.each(courses, course => {
        for (let i = 0; i < data.length; i++) {
          data[course.updatedAt.getMonth()]++;
          break;
        }
      }).then(() => {
        return data;
      });
    });

    toReturn.data.yearlyTraffic.course = dt;

    data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    dt = await db.Feedback.find({
      updatedAt: {
        $gte: moment(today).subtract(1, 'years'),
        $lt: moment(today)
      }
    }).then(feedbacks => {
      return Promise.each(feedbacks, feedback => {
        for (let i = 0; i < data.length; i++) {
          data[feedback.updatedAt.getMonth()]++;
          break;
        }
      }).then(() => {
        return data;
      });
    });

    toReturn.data.yearlyTraffic.feedback = dt;

    data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    dt = await db.Session.find({
      updatedAt: {
        $gte: moment(today).subtract(1, 'years'),
        $lt: moment(today)
      }
    }).then(learningSessions => {
      return Promise.each(learningSessions, learningSession => {
        for (let i = 0; i < data.length; i++) {
          data[learningSession.updatedAt.getMonth()]++;
          break;
        }
      }).then(() => {
        return data;
      });
    });

    toReturn.data.yearlyTraffic.learningSession = dt;

    data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    dt = await db.User.find({
      updatedAt: {
        $gte: moment(today).subtract(1, 'years'),
        $lt: moment(today)
      }
    }).then(users => {
      return Promise.each(users, user => {
        for (let i = 0; i < data.length; i++) {
          data[user.updatedAt.getMonth()]++;
          break;
        }
      }).then(() => {
        return data;
      });
    });

    toReturn.data.yearlyTraffic.user = dt;

    return res.status(200).json(toReturn);
  } catch (e) {
    next(e);
  }
};
