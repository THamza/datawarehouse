const mongoose = require('mongoose');

const announcementSchema = mongoose.Schema(
  {
    title: {
      type: String,
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
    description: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    hidden: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true
    }
  }
);

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;
