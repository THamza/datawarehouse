const mongoose = require('mongoose');

const messageSchema = mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const message = mongoose.model('Message', messageSchema);

module.exports = message;
