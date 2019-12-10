const mongoose = require('mongoose');

const serviceSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
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

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
