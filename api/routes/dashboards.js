const router = require('express').Router();
const {
  dashboardManager,
  dashboardServiceProvider
} = require('../handlers/dashboards');
const { loginRequired } = require('../middleware/auth');

router.route('/').get(loginRequired, dashboardServiceProvider);

router.route('/manager').get(dashboardManager);

module.exports = router;
