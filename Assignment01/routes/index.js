const express = require('express');
const router = express.Router();

const portfolio = {
  name: 'Vishal Malhotra',
  role: 'Computer Programming Student at Georgian College',
  email: 'maliotravishal101@gmail.com',
  github: 'https://github.com/Vishal200406',
  linkedin: 'https://ca.linkedin.com/in/vishal-malhotra-953352417'
};

// Home page
router.get('/', function (req, res) {
  res.render('index', {
    title: 'Home',
    isHome: true,
    portfolio
  });
});

// About Me page
router.get('/about', function (req, res) {
  res.render('about', {
    title: 'About Me',
    isAbout: true,
    portfolio
  });
});

// Projects page
router.get('/projects', function (req, res) {
  res.render('projects', {
    title: 'Projects',
    isProjects: true,
    portfolio
  });
});

// Contact Me page
router.get('/contact', function (req, res) {
  res.render('contact', {
    title: 'Contact Me',
    isContact: true,
    portfolio
  });
});

module.exports = router;