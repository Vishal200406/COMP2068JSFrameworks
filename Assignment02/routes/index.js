var express = require('express');
var router = express.Router();

/**
 * Display the public TutorConnect Directory home page.
 */
router.get('/', function (req, res) {
  res.render('index', {
    title: 'Home',
    pageDescription:
      'Find peer tutors by subject, course code, availability, and tutoring format.'
  });
});

module.exports = router;