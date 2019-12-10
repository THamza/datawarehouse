const mongoose = require('mongoose');
const Status = require('../models/enums/assignmentStatus');

const assignmentSchema = mongoose.Schema(
  {
    serviceProvider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit'
    },
    status: {
      type: String,
      default: Status.Requested,
      enum: [Status.Requested, Status.Rejected, Status.Approved]
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

assignmentSchema.index(
  { serviceProvider: 1, status: 1, unit: 1 },
  { unique: true }
);

const Availability = mongoose.model('Assignment', assignmentSchema);

module.exports = Availability;
