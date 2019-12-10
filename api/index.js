const apirouter = require('express').Router();

const errorHandler = require('./handlers/error');

const usersRoutes = require('./routes/users');

const unitRoutes = require('./routes/units');

const statisticsRoutes = require('./routes/statistics');

const availabilityRoutes = require('./routes/availability');

const authRouter = require('./routes/auth');

const servicesRoutes = require('./routes/services');

const sessionsRoutes = require('./routes/sessions');

const meRoutes = require('./routes/me');

const assignmentRoutes = require('./routes/assignments');

const dashboardRoutes = require('./routes/dashboards');

apirouter.get('/', (req, res) => {
  res.json({ message: 'API is working !' });
});

apirouter.use('/', authRouter);
apirouter.use('/users', usersRoutes);
apirouter.use('/units', unitRoutes);
apirouter.use('/statistics', statisticsRoutes);
apirouter.use('/availability', availabilityRoutes);
apirouter.use('/services', servicesRoutes);
apirouter.use('/sessions', sessionsRoutes);
apirouter.use('/assignments', assignmentRoutes);
apirouter.use('/me', meRoutes);
apirouter.use('/dashboard', dashboardRoutes);
apirouter.use(errorHandler);

module.exports = apirouter;
