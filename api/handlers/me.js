const db = require('../../db');
const Role = require('../../db/models/enums/roles');

exports.getMe = async (req, res, next) => {
  try {
    const { id, role } = req.user;
    let user;
    if (role === Role.Learner || role === Role.Manager) {
      [user] = await db.User.find({ _id: id })
        .populate({ path: 'services', select: 'title' })
        .select('profile services');
    } else if (role === Role.ServiceProvider) {
      [user] = await db.User.find({ _id: id })
        .populate({ path: 'services', select: 'title' })
        .select('profile services hoursWorked maxHours role');
    }
    return res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.editMe = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { firstname, lastname, email, phoneNumber, major, school } = req.body;
    const user = await db.User.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          profile: { firstname, lastname, email, phoneNumber, major, school }
        }
      },
      { new: true }
    )
      .populate({ path: 'services', select: 'title' })
      .select('profile services');
    return res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.uploadImage = async (req, res, next) => {
  try {
    const { url, public_id } = req.file;
    const { id } = req.user;
    console.log('url: ', url);
    console.log('pub id: ', public_id);
    const user = await db.User.findOneAndUpdate(
      { _id: id },
      { $set: { 'profile.imageUrl': url } },
      { new: true }
    );
    return res.json({ profile: { imageUrl: user.profile.imageUrl } });
  } catch (err) {
    next(err);
  }
};
