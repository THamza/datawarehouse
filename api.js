const express = require('express');
const app = express();
const cors = require('cors');
const passport = require('passport');
const apirouter = require('./api/index');

app.use(cors());

app.use(express.json());

app.use(passport.initialize());

app.use('/api', apirouter);

module.exports = app;
