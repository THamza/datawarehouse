const express = require('express');
const authRouter = express.Router();
const { login, confirmation, generateStudentDimenssion, generateFactTable } = require('../handlers/auth');

authRouter.post('/login', login);
authRouter.get('/confirmation/:token', confirmation);

authRouter.get('/generate-student-dimension', generateStudentDimenssion);
authRouter.get('/generate-fact-table', generateFactTable);

module.exports = authRouter;
