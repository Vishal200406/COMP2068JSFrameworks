const express = require('express');

const Tutor = require('../models/tutor');

const router = express.Router();

/**
 * Generate one or two initials for a tutor profile.
 *
 * @param {string} name Complete tutor name.
 * @returns {string} Tutor initials.
 */
function createInitials(name) {
  if (!name || typeof name !== 'string') {
    return 'T';
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(function (part) {
      return part.charAt(0).toUpperCase();
    })
    .join('');
}

/**
 * Convert Tutor documents into plain view objects containing initials.
 *
 * @param {Array<Object>} tutorRecords Tutor records from MongoDB.
 * @returns {Array<Object>} Tutor records prepared for HBS.
 */
function prepareTutors(tutorRecords) {
  return tutorRecords.map(function (tutor) {
    return {
      ...tutor,
      initials: createInitials(tutor.name)
    };
  });
}

/**
 * Escape characters that have a special meaning inside a regular
 * expression.
 *
 * This prevents user-entered search text from changing the intended
 * MongoDB regular-expression query.
 *
 * @param {string} value User-entered search value.
 * @returns {string} Escaped regular-expression value.
 */
function escapeRegularExpression(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Search the original Tutor fields for direct text matches.
 *
 * This search is attempted before fuzzy searching so exact course
 * codes and ordinary keywords do not return unrelated profiles.
 *
 * @param {string} searchTerm Search term entered by the visitor.
 * @returns {Promise<Array<Object>>} Matching tutor records.
 */
async function findDirectMatches(searchTerm) {
  const escapedSearchTerm =
    escapeRegularExpression(searchTerm);

  const searchExpression = new RegExp(
    escapedSearchTerm,
    'i'
  );

  return Tutor.find({
    $or: [
      {
        name: searchExpression
      },
      {
        subject: searchExpression
      },
      {
        courseCode: searchExpression
      },
      {
        skills: searchExpression
      },
      {
        availability: searchExpression
      },
      {
        tutoringFormat: searchExpression
      },
      {
        location: searchExpression
      },
      {
        experienceLevel: searchExpression
      },
      {
        description: searchExpression
      }
    ]
  })
    .sort({
      name: 1
    })
    .lean()
    .exec();
}

/**
 * Use the instructor-required fuzzy-search package when a direct
 * database-field search does not find any matching tutors.
 *
 * @param {string} searchTerm Search term entered by the visitor.
 * @returns {Promise<Array<Object>>} Fuzzy tutor matches.
 */
async function findFuzzyMatches(searchTerm) {
  const fuzzyResults = await Tutor.fuzzySearch({
    query: searchTerm,
    minSize: 2,
    prefixOnly: true,
    exact: false
  })
    .limit(12)
    .lean()
    .exec();

  /*
   * Remove extremely weak results where the package provides a
   * confidence score of zero or less.
   */
  return fuzzyResults.filter(function (tutor) {
    return (
      typeof tutor.confidenceScore !== 'number' ||
      tutor.confidenceScore > 0
    );
  });
}

/**
 * Display the public, read-only tutor directory.
 *
 * Examples:
 * /tutors
 * /tutors?search=javascript
 * /tutors?search=COMP%202068
 */
router.get('/', async function (req, res, next) {
  const searchTerm =
    typeof req.query.search === 'string'
      ? req.query.search.trim().slice(0, 100)
      : '';

  const hasSearchInput = Boolean(searchTerm);

  const searchTooShort =
    hasSearchInput && searchTerm.length < 2;

  try {
    let tutorRecords;
    let searchPerformed = false;
    let searchMethod = '';

    if (hasSearchInput && !searchTooShort) {
      /*
       * Direct matching gives precise results for values such as:
       * COMP 2068, JavaScript, Online, and Barrie Campus.
       */
      tutorRecords =
        await findDirectMatches(searchTerm);

      searchPerformed = true;

      if (tutorRecords.length > 0) {
        searchMethod = 'direct';
      } else {
        /*
         * Fuzzy searching is used as a fallback for misspellings
         * and terms that do not directly occur in the stored data.
         */
        tutorRecords =
          await findFuzzyMatches(searchTerm);

        searchMethod = 'fuzzy';
      }
    } else {
      /*
       * Display all tutors alphabetically when no valid search has
       * been entered.
       */
      tutorRecords = await Tutor.find()
        .sort({
          name: 1
        })
        .lean()
        .exec();
    }

    const tutors = prepareTutors(tutorRecords);
    const resultCount = tutors.length;

    res.render('tutors/index', {
      title: 'Tutor Directory',
      tutors: tutors,
      searchTerm: searchTerm,
      hasSearchInput: hasSearchInput,
      searchPerformed: searchPerformed,
      searchTooShort: searchTooShort,
      hasTutors: resultCount > 0,
      searchMethod: searchMethod,
      resultCount: resultCount,
      resultCountText:
        resultCount +
        (resultCount === 1
          ? ' tutor profile'
          : ' tutor profiles')
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;