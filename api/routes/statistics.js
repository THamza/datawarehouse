const express = require("express");
const router = express.Router({mergeParams: true});

const {
  getStatistics
} = require("../handlers/statistics");


router.route("/")
  .get(getStatistics)

module.exports = router;
