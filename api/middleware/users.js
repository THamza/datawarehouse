const { requireAuthWithPredicate } = require('../middleware/auth');
const Role = require('../../db/models/enums/roles');

const ensureCorrectUserOrHigherPriority = requireAuthWithPredicate({
  check: (user, req) => {
    const { uid } = req.params;
    return (
      uid === user._id.toString() ||
      user.role === Role.Admin ||
      user.role === Role.Coordinator ||
      user.role === Role.Manager
    );
  },
  message: 'Needs permissions !'
});

const ensureHigherPriority = requireAuthWithPredicate({
  check: user => {
    return (
      user.role === Role.Admin ||
      user.role === Role.Coordinator ||
      user.role === Role.Manager
    );
  },
  message: 'Needs permissions !'
});

module.exports = {
  ensureHigherPriority,
  ensureCorrectUserOrHigherPriority
};
