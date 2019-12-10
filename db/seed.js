/* eslint-disable no-await-in-loop */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../', '.env') });
const db = require('./index');
const axios = require('axios');
const fs = require('fs');
const argv = require('minimist')(process.argv.slice(2));
const { promisify } = require('util');
const Role = require('./models/enums/roles');
const faker = require('faker');
const baseUrl = `http://localhost:${process.env.PORT}/api`;
console.log(path.join(__dirname, '../', '.env'));

const units = [
  {
    unitCode: 'ACC 2302',
    unitTitle: 'Accounting Principles II',
    school: 'SBA',
    description: `Default description for SBA class`,
    imageUrl: 'SBA'
  },
  {
    unitCode: 'CSC 3326',
    unitTitle: 'Database Systems',
    school: 'SSE',
    description: `Default description for SSE class`,
    imageUrl: 'SSE'
  },
  {
    unitCode: 'EGR 3301',
    unitTitle: 'Digital Design',
    school: 'SSE',
    description: `Default description for SSE class`,
    imageUrl: 'SSE'
  },
  {
    unitCode: 'ENG 2303',
    unitTitle: 'Technical Writing',
    school: 'SHSS',
    description: `Default description for SHSS class`,
    imageUrl: 'SHSS'
  },
  {
    unitCode: 'FIN 3301',
    unitTitle: 'Principles of Finance',
    school: 'SBA',
    description: `Default description for SBA class`,
    imageUrl: 'SBA'
  },
  {
    unitCode: 'COM 1301',
    unitTitle: 'Public Speaking',
    school: 'SHSS',
    description: `Default description for SHSS class`,
    imageUrl: 'SHSS'
  },
  {
    unitCode: 'PHY 1402',
    unitTitle: 'Physics II',
    school: 'SSE',
    description: `Default description for SSE class`,
    imageUrl: 'SSE'
  },
  {
    unitCode: 'FAS 1220',
    unitTitle: 'Introduction to Critical Thinking',
    school: 'SHSS',
    description: `Default description for SHSS class`,
    imageUrl: 'SHSS'
  },
  {
    unitCode: 'CSC 2302',
    unitTitle: 'Data Structures',
    school: 'SSE',
    description: `Default description for SSE class`,
    imageUrl: 'SSE'
  },
  {
    unitCode: 'LIT 2304',
    unitTitle: 'Introduction to Arabic Literature',
    school: 'SHSS',
    description: `Default description for SHSS class`,
    imageUrl: 'SHSS'
  },
  {
    service: 'mentoring',
    unitCode: 'MTR SBA',
    unitTitle: 'SBA Mentoring',
    school: 'SBA',
    description: `Book your SBA mentor here`,
    imageUrl: 'SBA'
  },
  {
    service: 'mentoring',
    unitCode: 'MTR SSE',
    unitTitle: 'SSE Mentoring',
    school: 'SSE',
    description: `Book your SSE mentor here`,
    imageUrl: 'SSE'
  },
  {
    service: 'mentoring',
    unitCode: 'MTR SHSS',
    unitTitle: 'SHSS Mentoring',
    school: 'SHSS',
    description: `Book your SHSS mentor here`,
    imageUrl: 'SHSS'
  }
];

const majors = [
  {
    major: 'Computer Science',
    school: 'SSE'
  },
  {
    major: 'Business Administration',
    school: 'SBA'
  },
  {
    major: 'Human Resource Development',
    school: 'SHSS'
  },
  {
    major: 'Engineering Management',
    school: 'SSE'
  },
  {
    major: 'Communication Studies',
    school: 'SHSS'
  },
  {
    major: 'General Engineering',
    school: 'SSE'
  },
  {
    major: 'International Studies',
    school: 'SHSS'
  }
];

const services = [
  {
    title: 'Tutoring',
    description: 'Private classes, group lectures and more.'
  },
  {
    title: 'Mentoring',
    description: 'Degree planning and academic guidance.'
  }
];

let serviceProvidersIds;
let coordinator;
let usersDb;
let jwt;

async function rebuildDatabase() {
  await db.connection.dropDatabase();
}

async function populateUsers(password) {
  await createCoordinator(password);
  const response = await axios({
    url: `${baseUrl}/login`,
    method: 'POST',
    data: { email: coordinator.profile.email, password }
  });
  jwt = response.data.token;
  await createServices();
  let users = await promisify(fs.readFile)(
    path.resolve(__dirname, './users.txt'),
    'utf8'
  );
  users = users
    .trim()
    .split('\n')
    .map((fullname, idx) => {
      let [firstname, lastname] = fullname.trim().split(/\s+/);
      let index = Math.floor(Math.random() * majors.length);
      let { major, school } = majors[index];
      return {
        profile: {
          email: `${firstname.toLowerCase()}@cle.com`,
          firstname,
          lastname,
          phoneNumber: faker.phone.phoneNumberFormat(),
          major,
          school
        },
        authentication: {
          active: true,
          password: `${firstname
            .toLowerCase()
            .split('')
            .reverse()
            .join('')}`
        },
        role: idx < 30 ? Role.ServiceProvider : Role.Learner,
        services:
          idx < 30 ? (idx > 10 ? [services[0]._id] : [services[1]._id]) : []
      };
    });
  //   await Promise.all(users.map(u => axios.post(`${baseUrl}/users/`, { ...u })));
  console.log('============= password for coordinator: ==================');
  console.log(password);
  console.log('============= password for coordinator: ==================');
  usersDb = await Promise.all(users.map(u => db.User.create({ ...u })));
  serviceProvidersIds = usersDb.reduce((acc, u) => {
    if (u.role === Role.ServiceProvider) acc.push(u._id);
    return acc;
  }, []);
  console.log(serviceProvidersIds);
}

async function createCoordinator(password) {
  coordinator = await db.User.create({
    authentication: { active: true, password },
    profile: {
      email: 'najwa@cle.com',
      firstname: 'Najwa',
      lastname: 'Laabid',
      phoneNumber: '+212 6 77 88 99 44'
    },
    role: Role.Manager
  });
  console.log('Coordinator created: ');
  console.log(JSON.stringify(coordinator));
}

async function createServices() {
  let servicesDb = await Promise.all(
    services.map(s => db.Service.create({ ...s, createdBy: coordinator._id }))
  );
  for (let i = 0; i < services.length; i++) {
    services[i]._id = servicesDb[i]._id;
  }
}

async function createUnits() {
  let unitRequest = [];
  let mentorsIds = [];
  for (let i = 0; i < 10; i++) {
    mentorsIds.push({ _id: usersDb[i]._id, school: usersDb[i].profile.school });
  }
  console.log(mentorsIds);
  let tutorsIds = serviceProvidersIds.slice(9);
  let unitsDb = await Promise.all(
    units.map(async (unit, idx) => {
      let shuffledTutors = tutorsIds.sort(() => 0.5 - Math.random());
      let tutors = shuffledTutors.slice(0, 3);
      let mentors = mentorsIds
        .filter(m => unit.school === m.school)
        .map(m => m._id);
      console.log('mentors: ', mentors);
      unitRequest[idx] = unit.service === 'mentoring' ? mentors : tutors;
      return db.Unit.create({
        ...unit,
        service:
          unit.service === 'mentoring' ? services[1]._id : services[0]._id,
        createdBy: coordinator._id,
        serviceProviders: unit.service === 'mentoring' ? mentors : tutors
      });
    })
  );
  for (let i = 0; i < unitRequest.length; i++) {
    for (let j = 0; j < unitRequest[i].length; j++) {
      let assignment = await db.Assignment.create({
        serviceProvider: unitRequest[i][j],
        unit: unitsDb[i]._id,
        status: 'approved',
        createdBy: unitRequest[i][j],
        updatedBy: coordinator._id
      });
      await db.User.findOneAndUpdate(
        { _id: unitRequest[i][j] },
        { $push: { assignments: assignment._id } }
      );
    }
  }
}

async function createAvailability() {
  let availabilityRequest = [];
  let [month, day, year] = new Date().toLocaleDateString().split('/');
  console.log(new Date().toLocaleDateString());
  console.log(`month: ${month} day: ${day} year: ${year}`);
  const startTimes = ['15:00', '17:00', '20:00'];
  const endTimes = ['17:00', '19:00', '22:00'];
  serviceProvidersIds.map(sp => {
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        availabilityRequest.push({
          serviceProvider: sp,
          date: `${year}-${month}-${Number(day) + i}`,
          startTime: startTimes[j],
          endTime: endTimes[j],
          createdBy: sp
        });
      }
    }
  });
  axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
  try {
    await Promise.all(
      availabilityRequest.map(a => axios.post(`${baseUrl}/availability`, a))
    );
  } catch (err) {
    console.log(err);
  }
}

async function populateDb(password) {
  await populateUsers(password);
  await createUnits();
  await createAvailability();
}

function help() {
  console.log(`You can run this tool with the following commands:
        [-c]                                clear all collections from db
        [-d <coordinatorpassword>]          populate database with units, learners, service providers, and coordinator with <coordinatorpassword>
    `);
}

async function seed() {
  for (let k in argv) {
    switch (k) {
      case 'c':
        await rebuildDatabase();
        break;
      case 'd':
        await populateDb(argv[k]);
        break;
      case 'h':
        help();
        break;
    }
  }
  await db.connection.close();
}

try {
  seed();
} catch (err) {
  console.error(err);
}
