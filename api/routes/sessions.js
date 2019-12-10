const router = require('express').Router();

const {
  getSessions,
  getSession,
  addSession,
  modifySessionStatus,
  addSessionManual,
  addAttendance
} = require('../handlers/sessions');
const { loginRequired } = require('../middleware/auth');

router
  .route('/')
  .post(loginRequired, addSession)
  .get(loginRequired, getSessions);

router.route('/manual').post(loginRequired, addSessionManual);

router.route('/:sid/status').patch(loginRequired, modifySessionStatus);

router.route('/:sid/attendance').post(loginRequired, addAttendance);

router.route('/:sid').get(getSession);

module.exports = router;
