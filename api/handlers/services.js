const db = require('../../db');
const Role = require('../../db/models/enums/roles');

const getServices = async (req, res, next) => {
  try {
    const services = await db.Service.find({});
    res.json(services);
  } catch (err) {
    next(err);
  }
};

const addService = async (req, res, next) => {
  try {
    let { title, description, serviceProviders } = req.body;
    const { id } = req.user;
    let service = await db.Service.create({
      title,
      description,
      createdBy: id
    });
    await Promise.all(
      serviceProviders.map(spId =>
        db.User.findOneAndUpdate(
          { _id: spId },
          {
            $set: {
              role: Role.ServiceProvider
            },
            $push: { services: service._id }
          }
        )
      )
    );
    res.json(service);
  } catch (err) {
    next(err);
  }
};

const deleteService = async (req, res, next) => {
  //delete service + units of that service + pull service from serviceProviders
};

const searchServices = async (req, res, next) => {
  try {
    const { q } = req.query;
    console.log(q);
    let services = await db.Service.find({
      title: { $regex: `${q}`, $options: 'i' }
    }).select('title');
    res.json(services);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getServices,
  addService,
  deleteService,
  searchServices
};
