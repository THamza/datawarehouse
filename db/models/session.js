const mongoose = require('mongoose');
const User = require('./user');
const SessionType = require('./enums/sessions');
const SessionStatus = require('./enums/sessionStatus');

const sessionSchema = mongoose.Schema({
  serviceProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit'
  },
  sessionType: {
    type: String,
    required: true,
    enum: [SessionType.Private, SessionType.PrivateGroup]
  },
  sessionStatus: {
    type: String,
    required: true,
    enum: [
      SessionStatus.Requested,
      SessionStatus.Canceled,
      SessionStatus.Confirmed,
      SessionStatus.Attended
    ],
    default: SessionStatus.Requested
  },
  location: {
    type: String,
    required: true,
    default: ''
  },
  reason: {
    type: String,
    required: true,
    default: ''
  },
  requestInfo: {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    professor: {
      type: String,
      required: true,
      default: ''
    },
    requestedAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    topic: {
      type: String,
      required: true
    }
  },
  manual: {
    type: Boolean,
    required: true,
    default: false
  },
  evaluation: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Evaluation' }],
  attendance: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }]
});

// Implement averageRating as a virtual attribute

// learningSessionSchema.virtual("feedback.averageRating").get(function(){
//   var totalFeedback = this.feedback.length;
//   var ratingSum = 0;
//   this.feedback.forEach(function(element){
//     try {
//       let foundFeedback = await Feedback.findById(element.id);
//       ratingSum += foundFeedback.rating;
//     }
//     catch(err) {
//       next(err);
//     }
//   });
// });

const session = mongoose.model('Session', sessionSchema);

module.exports = session;
