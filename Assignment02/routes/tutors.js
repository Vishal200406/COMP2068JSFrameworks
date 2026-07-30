const express = require('express');

const Tutor = require('../models/tutor');

const router = express.Router();

/**
 * Display the public read-only tutor directory.
 *
 * A query-string value such as /tutors?search=javascript activates
 * fuzzy searching. An empty search displays all tutor records.
 */
router.get('/', async function (req, res, next) {
  const searchTerm =
    typeof req.query.search === 'string'
      ? req.query.search.trim()
      : '';

  try {
    let tutors;

    if (searchTerm) {
      /*
       * fuzzySearch is supplied by mongoose-fuzzy-searching.
       * Results are returned as plain objects for safe HBS rendering.
       */
      tutors = await Tutor.fuzzySearch({
        query: searchTerm,
        minSize: 2,
        exact: false
      })
        .lean()
        .exec();
    } else {
      tutors = await Tutor.find()
        .sort({
          name: 1
        })
        .lean()
        .exec();
    }

    res.render('tutors/index', {
      title: 'Tutor Directory',
      tutors: tutors,
      searchTerm: searchTerm,
      hasSearch: Boolean(searchTerm),
      hasTutors: tutors.length > 0,
      resultCount: tutors.length
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;