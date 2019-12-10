const mongoose = require('mongoose');
const User = require('./user');
const Session = require('./session');

const evaluationSchema = mongoose.Schema({
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  },
  report: {
    questions: [
      {
        question: { type: Date },
        answer: { type: String }
      }
    ],
    generalRating: { type: Number },
    comment: { type: String }
  }
});

evaluationSchema.pre('remove', async function(next) {
  try {
    let Session = await Session.findById(this.learningSession);
    Session.evaluation.remove(this.id);
    await Session.save();
    return next();
  } catch (err) {
    return next(err);
  }
});

const Evaluation = mongoose.model('Evaluation', evaluationSchema);

module.exports = Evaluation;
