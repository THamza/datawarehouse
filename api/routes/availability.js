const router = require('express').Router();
const {
  addAvailability,
  getAvailability,
  editAvailability,
  deleteAvailability
} = require('../handlers/availability');
const { loginRequired } = require('../middleware/auth');
const { ensureCorrectUserOrHigherPriority } = require('../middleware/users');

router.route('/').post(loginRequired, addAvailability);

router
  .route('/:aid')
  .get(getAvailability)
  .put(editAvailability)
  .delete(deleteAvailability);

module.exports = router;
