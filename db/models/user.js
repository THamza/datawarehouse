const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Role = require('./enums/roles');
const Service = require('./enums/services');

const userSchema = new mongoose.Schema({
  profile: {
    firstname: {
      type: String,
      required: true
    },
    lastname: {
      type: String,
      required: true
    },
    school: {
      type: String
    },
    major: {
      type: String
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    phoneNumber: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      default: ''
    }
  },
  authentication: {
    active: {
      type: Boolean,
      default: false
    },
    password: {
      type: String,
      required: true
    }
  },
  role: {
    type: String,
    enum: [Role.Learner, Role.ServiceProvider, Role.Manager],
    default: Role.Learner
  },
  services: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service'
    }
  ],
  assignments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment'
    }
  ],
  availability: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Availability'
    }
  ],
  blocked: {
    type: Boolean,
    default: false
  },
  hoursWorked: {
    type: Number,
    required: true,
    default: 0
  },
  maxHours: {
    type: Number,
    required: true,
    default: 80
  },
  AUID: {
    type: String,
    required: true
  }
});

userSchema.pre('save', async function(next) {
  try {
    if (!this.isModified('authentication.password')) {
      return next();
    }
    let hashedPassword = await bcrypt.hash(this.authentication.password, 10);
    this.authentication.password = hashedPassword;
    return next();
  } catch (err) {
    return next(err);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword, next) {
  try {
    let isMatch = await bcrypt.compare(
      candidatePassword,
      this.authentication.password
    );
    return isMatch;
  } catch (err) {
    return next(err);
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;
