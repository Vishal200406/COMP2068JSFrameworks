require('dotenv').config({ quiet: true });

const mongoose = require('mongoose');

const connectToDatabase = require('../config/database');
const Tutor = require('../models/tutor');

/*
 * Fictional tutor records used to initialize the development database.
 * Example.com addresses are reserved for documentation and sample data.
 */
const tutorRecords = [
  {
    name: 'Alex Morgan',
    subject: 'JavaScript Fundamentals',
    courseCode: 'COMP 2068',
    skills: 'JavaScript, Node.js, Express, debugging, REST APIs',
    availability: 'Monday and Wednesday evenings',
    tutoringFormat: 'Online',
    location: 'Online',
    contactEmail: 'alex.morgan@example.com',
    experienceLevel: 'Advanced',
    description:
      'Alex helps students understand JavaScript fundamentals, Express routing, asynchronous programming, and practical debugging techniques.'
  },
  {
    name: 'Sam Patel',
    subject: 'Database Systems',
    courseCode: 'COMP 2003',
    skills: 'MongoDB, Mongoose, SQL, database design, queries',
    availability: 'Saturday and Sunday afternoons',
    tutoringFormat: 'Hybrid',
    location: 'Barrie Campus',
    contactEmail: 'sam.patel@example.com',
    experienceLevel: 'Expert',
    description:
      'Sam supports students with database modelling, MongoDB collections, Mongoose schemas, SQL queries, and data normalization.'
  },
  {
    name: 'Jordan Lee',
    subject: 'Applied Mathematics',
    courseCode: 'MATH 1002',
    skills: 'Algebra, calculus, functions, equations, problem solving',
    availability: 'Tuesday and Thursday afternoons',
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
    skills: 'Java, classes, inheritance, interfaces, unit testing',
    availability: 'Weekday mornings',
    tutoringFormat: 'Online',
    location: 'Online',
    contactEmail: 'maya.thompson@example.com',
    experienceLevel: 'Intermediate',
    description:
      'Maya helps students strengthen their understanding of Java classes, objects, inheritance, interfaces, and program organization.'
  },
  {
    name: 'Daniel Kim',
    subject: 'Web Design Fundamentals',
    courseCode: 'COMP 1002',
    skills: 'HTML, CSS, Bootstrap, responsive design, accessibility',
    availability: 'Friday evenings and Saturday mornings',
    tutoringFormat: 'Hybrid',
    location: 'Downtown Barrie',
    contactEmail: 'daniel.kim@example.com',
    experienceLevel: 'Advanced',
    description:
      'Daniel assists students with semantic HTML, responsive CSS, Bootstrap layouts, accessibility, and professional interface design.'
  },
  {
    name: 'Priya Shah',
    subject: 'Programming Logic',
    courseCode: 'COMP 1008',
    skills: 'Algorithms, pseudocode, loops, arrays, problem solving',
    availability: 'Monday to Thursday after 5 PM',
    tutoringFormat: 'Online',
    location: 'Online',
    contactEmail: 'priya.shah@example.com',
    experienceLevel: 'Expert',
    description:
      'Priya teaches programming logic through pseudocode, flowcharts, small coding exercises, and practical algorithm-development methods.'
  }
];

/**
 * Insert or refresh the fictional development records.
 */
async function seedTutors() {
  try {
    await connectToDatabase();

    const seedEmails = tutorRecords.map(function (tutor) {
      return tutor.contactEmail;
    });

    /*
     * Remove only the existing sample records. This prevents duplicate
     * seed data without deleting tutor records created through the app.
     */
    await Tutor.deleteMany({
      contactEmail: {
        $in: seedEmails
      }
    });

    await Tutor.insertMany(tutorRecords);

    console.log(
      tutorRecords.length +
        ' fictional tutor records were added successfully.'
    );
  } catch (error) {
    console.error('Tutor seeding failed:');
    console.error(error.message);

    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

seedTutors();