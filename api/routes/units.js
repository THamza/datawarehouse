const express = require('express');
const router = express.Router();
const { loginRequired } = require('../middleware/auth');

const {
  addUnit,
  getUnit,
  getUnits,
  deleteUnit,
  editUnit,
  getUnitsFromSearch,
  getUnitAvailability
} = require('../handlers/units');

router
  .route('/')
  .get(loginRequired, getUnits)
  .post(loginRequired, addUnit);

router.route('/search').get(getUnitsFromSearch);

router
  .route('/:uid')
  .get(loginRequired, getUnit)
  .delete(deleteUnit)
  .put(editUnit);

router.route('/:uid/availability').get(loginRequired, getUnitAvailability);

module.exports = router;
