const router = require('express').Router();
const {
  getServices,
  addService,
  searchServices
} = require('../handlers/services.js');
const { loginRequired } = require('../middleware/auth');

router
  .route('/')
  .get(getServices)
  .post(loginRequired, addService);

router.route('/search').get(searchServices);

module.exports = router;
