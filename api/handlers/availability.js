const db = require('../../db');

exports.addAvailability = async (req, res, next) => {
  //created by should come from req.user.id
  try {
    let { date, startTime, endTime } = req.body;
    console.log('date:', date);
    let { id } = req.user;
    console.log(date, startTime, endTime);
    startTime = new Date(`${date} ${startTime}`);
    endTime = new Date(`${date} ${endTime}`);
    const availability = await db.Availability.create({
      serviceProvider: id,
      date,
      startTime,
      endTime,
      createdBy: id
    });
    await db.User.findOneAndUpdate(
      { _id: id },
      { $push: { availability: availability._id } }
    );
    res.json(availability);
  } catch (err) {
    if (err.code === 11000) {
      return next({
        status: 409,
        message: 'Sorry, that availability already exists !'
      });
    }
    next(err);
  }
};

exports.editAvailability = async (req, res, next) => {
  try {
    const { aid } = req.params;
    let { date, startTime, endTime, booked } = req.body;
    startTime = new Date(`${date} ${startTime}`);
    endTime = new Date(`${date} ${endTime}`);
    const availability = await db.Availability.findOneAndUpdate(
      { _id: aid },
      {
        date,
        startTime,
        endTime,
        booked
      },
      { new: true }
    );
    console.log(availability);
    res.json({ message: 'availability updated successfully' });
  } catch (err) {
    next(err);
  }
};

exports.deleteAvailability = async (req, res, next) => {
  try {
    const { aid } = req.params;
    await db.Availability.findOneAndDelete({ _id: aid });
    res.json({ message: 'Availability deleted successfully !' });
    //delete availability from user
  } catch (e) {
    next(e);
  }
};

exports.getAvailability = async (req, res, next) => {
  try {
    const { aid } = req.params;
    const availability = await db.Availability.find(aid);
    res.json(availability);
  } catch (e) {
    next(e);
  }
};
