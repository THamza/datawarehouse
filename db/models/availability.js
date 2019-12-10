const mongoose = require('mongoose');
const db = require('../index');

const availabilitySchema = mongoose.Schema(
  {
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
    booked: {
      type: Boolean,
      default: false
    },
    createdBy: {
      // SERVICE PROVIDER OR COORDINATOR
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

availabilitySchema.index(
  { serviceProvider: 1, date: 1, startTime: 1, endTime: 1 },
  { unique: true }
);

const Availability = mongoose.model('Availability', availabilitySchema);

module.exports = Availability;
