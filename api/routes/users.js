const express = require('express');
const router = express.Router({ mergeParams: true });
const { loginRequired } = require('../middleware/auth');
const {
  ensureCorrectUserOrHigherPriority,
  ensureHigherPriority
} = require('../middleware/users');

const {
  addUser,
  getUser,
  getUsers,
  deleteUser,
  editUserByManager,
  requestService,
  getServices,
  confirmService,
  deleteServiceRequest,
  getUserAvailability,
  getUsersMinimal,
  getUsersFromSearch,
  getAllServices,
  getAssignments,
  patchUser
} = require('../handlers/users');

router
  .route('/')
  .post(addUser)
  .get(loginRequired, ensureHigherPriority, getUsers);

router.route('/search').get(getUsersFromSearch);

router.route('/minimal').get(getUsersMinimal);

router.route('/units').get(getServices);

router.route('/units/all').get(getAllServices);

router
  .route('/:uid')
  .get(loginRequired, getUser)
  .delete(loginRequired, ensureCorrectUserOrHigherPriority, deleteUser)
  .patch(patchUser)
  .put(editUserByManager);

router.route('/:uid/availability').get(getUserAvailability);

router
  .route('/:uid/units')
  .post(requestService)
  .get(getServices);

router.route('/:uid/assignments').get(getAssignments);

router.route('/:uid/units/confirm').post(confirmService);

router.route('/:uid/units/:unitId').delete(deleteServiceRequest);

module.exports = router;
