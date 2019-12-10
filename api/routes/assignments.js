const router = require('express').Router();
const {
  addAssignment,
  getAssignments,
  patchAssignment,
  deleteAssignment
} = require('../handlers/assignments');
const { loginRequired } = require('../middleware/auth');
const { ensureCorrectUserOrHigherPriority } = require('../middleware/users');

router
  .route('/')
  .post(loginRequired, addAssignment)
  .get(getAssignments);

router
  .route('/:aid')
  .patch(loginRequired, patchAssignment)
  .delete(deleteAssignment);

module.exports = router;
