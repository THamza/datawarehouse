const express = require('express');
const router = express.Router({ mergeParams: true });
const { loginRequired } = require('../middleware/auth');
const imageUpload = require('../middleware/imageUpload');
const { getMe, editMe, uploadImage } = require('../handlers/me');

router
  .route('/')
  .get(loginRequired, getMe)
  .put(loginRequired, editMe);

router.route('/image').post(loginRequired, imageUpload, uploadImage);

module.exports = router;
