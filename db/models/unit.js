const mongoose = require('mongoose');

const unitSchema = mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true
    },
    unitCode: {
      type: String,
      required: true,
      unique: true
    },
    unitTitle: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    school: {
      type: String
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    serviceProviders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    announcements: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Announcement' }
    ]
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true
    }
  }
);

//to do: add hook for SP

// courseSchema.pre("remove", async function(next){
//   try{
//     let user = await User.findById(this.user);
//     user.courses.remove(this.id);
//     await user.save();
//     return next();
//   }
//   catch(err){
//     return next(err);
//   }
// });

const Unit = mongoose.model('Unit', unitSchema);

module.exports = Unit;
