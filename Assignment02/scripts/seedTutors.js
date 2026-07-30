require('dotenv').config({
  quiet: true
});

const mongoose = require('mongoose');

const connectToDatabase = require('../config/database');
const Tutor = require('../models/tutor');

/**
 * Fictional tutor records used to initialize the development database.
 *
 * The names and profiles are created only for this academic project.
 * Example.com email addresses are reserved for examples and
 * documentation.
 */
const tutorRecords = [
  {
    name: 'Alex Morgan',
    subject: 'JavaScript Fundamentals',
    courseCode: 'COMP 2068',
    skills:
      'JavaScript, Node.js, Express, debugging, REST APIs',
    availability:
      'Monday and Wednesday evenings',
    tutoringFormat: 'Online',
    location: 'Online',
    contactEmail: 'alex.morgan@example.com',
    experienceLevel: 'Advanced',
    description:
      'Alex helps students understand JavaScript fundamentals, Express routing, asynchronous programming, REST APIs, and practical debugging techniques.'
  },
  {
    name: 'Sam Patel',
    subject: 'Database Systems',
    courseCode: 'COMP 2003',
    skills:
      'MongoDB, Mongoose, SQL, database design, queries',
    availability:
      'Saturday and Sunday afternoons',
    tutoringFormat: 'Hybrid',
    location: 'Barrie Campus',
    contactEmail: 'sam.patel@example.com',
    experienceLevel: 'Expert',
    description:
      'Sam supports students with database modelling, MongoDB collections, Mongoose schemas, SQL queries, relationships, and data normalization.'
  },
  {
    name: 'Jordan Lee',
    subject: 'Applied Mathematics',
    courseCode: 'MATH 1002',
    skills:
      'Algebra, calculus, functions, equations, problem solving',
    availability:
      'Tuesday and Thursday afternoons',
    tutoringFormat: 'In person',
    location: 'Barrie Campus Library',
    contactEmail: 'jordan.lee@example.com',
    experienceLevel: 'Advanced',
    description:
      'Jordan provides structured mathematics support using clear examples, guided practice, and step-by-step problem-solving strategies.'
  },
  {
    name: 'Maya Thompson',
    subject: 'Object-Oriented Programming',
    courseCode: 'COMP 1030',
    skills:
      'Java, classes, objects, inheritance, interfaces, unit testing',
    availability:
      'Weekday mornings',
    tutoringFormat: 'Online',
    location: 'Online',
    contactEmail: 'maya.thompson@example.com',
    experienceLevel: 'Intermediate',
    description:
      'Maya helps students strengthen their understanding of Java classes, objects, inheritance, interfaces, testing, and program organization.'
  },
  {
    name: 'Daniel Kim',
    subject: 'Web Design Fundamentals',
    courseCode: 'COMP 1002',
    skills:
      'HTML, CSS, Bootstrap, responsive design, accessibility',
    availability:
      'Friday evenings and Saturday mornings',
    tutoringFormat: 'Hybrid',
    location: 'Downtown Barrie',
    contactEmail: 'daniel.kim@example.com',
    experienceLevel: 'Advanced',
    description:
      'Daniel assists students with semantic HTML, responsive CSS, Bootstrap layouts, accessibility principles, and professional interface design.'
  },
  {
    name: 'Priya Shah',
    subject: 'Programming Logic',
    courseCode: 'COMP 1008',
    skills:
      'Algorithms, pseudocode, loops, arrays, flowcharts, problem solving',
    availability:
      'Monday to Thursday after 5 PM',
    tutoringFormat: 'Online',
    location: 'Online',
    contactEmail: 'priya.shah@example.com',
    experienceLevel: 'Expert',
    description:
      'Priya teaches programming logic through pseudocode, flowcharts, small coding exercises, and practical algorithm-development methods.'
  }
];

/**
 * Insert the fictional tutor records into MongoDB.
 *
 * Existing seed records are identified by their example.com email
 * addresses and removed before the new copies are inserted. Tutor
 * records created manually through the application are not deleted.
 */
async function seedTutors() {
  try {
    await connectToDatabase();

    console.log('MongoDB connected for tutor seeding.');

    const seedEmailAddresses = tutorRecords.map(function (tutor) {
      return tutor.contactEmail;
    });

    const deletionResult = await Tutor.deleteMany({
      contactEmail: {
        $in: seedEmailAddresses
      }
    });

    if (deletionResult.deletedCount > 0) {
      console.log(
        deletionResult.deletedCount +
          ' previous fictional tutor records were removed.'
      );
    }

    const insertedTutors = await Tutor.insertMany(tutorRecords);

    console.log(
      insertedTutors.length +
        ' fictional tutor records were added successfully.'
    );
  } catch (error) {
    console.error('Tutor seeding failed:');
    console.error(error.message);

    process.exitCode = 1;
  } finally {
    /*
     * Close the connection so the terminal process exits after the
     * seed operation finishes.
     */
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }
}

seedTutors();