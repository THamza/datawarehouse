const mongoose = require('mongoose');
const { toClient } = require('./plugins');
mongoose.connect(`mongodb://localhost:27017/kudos`, {
  useCreateIndex: true,
  keepAlive: true,
  useNewUrlParser: true
});
mongoose.plugin(toClient);
mongoose.set('debug', true);
mongoose.set('useFindAndModify', false);
mongoose.Promise = Promise;

module.exports = {
  User: require('./models/user'),
  Unit: require('./models/unit'),
  Availability: require('./models/availability'),
  Assignment: require('./models/assignment'),
  Evaluation: require('./models/evaluation'),
  Session: require('./models/session'),
  Service: require('./models/service'),
  VerificationToken: require('./models/verificationToken'),
  Announcement: require('./models/announcement'),
  Message: require('./models/message'),
  connection: mongoose.connection
};
