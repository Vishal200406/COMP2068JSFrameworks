const express = require('express');

const Tutor = require('../models/tutor');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const ensureAuthenticated =
  authMiddleware.ensureAuthenticated;

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
 * Format a MongoDB date for display in an HBS view.
 *
 * @param {Date|string} value Stored date value.
 * @returns {string} Human-readable date.
 */
function formatDate(value) {
  if (!value) {
    return 'Not available';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

/**
 * Convert tutor records into plain view objects.
 *
 * @param {Array<Object>} tutorRecords Tutor records from MongoDB.
 * @returns {Array<Object>} Tutor records prepared for HBS.
 */
function preparePublicTutors(tutorRecords) {
  return tutorRecords.map(function (tutor) {
    return {
      ...tutor,
      initials: createInitials(tutor.name)
    };
  });
}

/**
 * Prepare tutor records for the authenticated management page.
 *
 * @param {Array<Object>} tutorRecords Tutor records from MongoDB.
 * @returns {Array<Object>} Management view records.
 */
function prepareManagementTutors(tutorRecords) {
  return tutorRecords.map(function (tutor) {
    const creatorName =
      tutor.createdBy &&
      tutor.createdBy.displayName
        ? tutor.createdBy.displayName
        : 'Seed or legacy record';

    return {
      ...tutor,
      initials: createInitials(tutor.name),
      creatorName: creatorName,
      createdDate: formatDate(tutor.createdAt),
      updatedDate: formatDate(tutor.updatedAt)
    };
  });
}

/**
 * Escape characters that have a special meaning inside a regular
 * expression.
 *
 * @param {string} value User-entered search value.
 * @returns {string} Escaped value.
 */
function escapeRegularExpression(value) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&'
  );
}

/**
 * Search original Tutor fields for direct text matches.
 *
 * Direct matching is used before fuzzy searching so exact course
 * codes and normal keywords return precise results.
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
 * search does not return any results.
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
   * Remove zero-confidence results when the plugin supplies a numeric
   * confidence score.
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
 * Public examples:
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
      tutorRecords =
        await findDirectMatches(searchTerm);

      searchPerformed = true;

      if (tutorRecords.length > 0) {
        searchMethod = 'direct';
      } else {
        tutorRecords =
          await findFuzzyMatches(searchTerm);

        searchMethod = 'fuzzy';
      }
    } else {
      tutorRecords = await Tutor.find()
        .sort({
          name: 1
        })
        .lean()
        .exec();
    }

    const tutors =
      preparePublicTutors(tutorRecords);

    const resultCount = tutors.length;

    return res.render('tutors/index', {
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
    return next(error);
  }
});

/**
 * Display the authenticated tutor-management dashboard.
 *
 * This route is intentionally defined separately from the public
 * directory. Visitors must have a valid Passport login session.
 */
router.get(
  '/manage',
  ensureAuthenticated,
  async function (req, res, next) {
    try {
      const tutorRecords = await Tutor.find()
        .populate(
          'createdBy',
          'displayName'
        )
        .sort({
          createdAt: -1,
          name: 1
        })
        .lean()
        .exec();

      const tutors =
        prepareManagementTutors(tutorRecords);

      const tutorCount = tutors.length;

      return res.render('tutors/manage', {
        title: 'Manage Tutors',
        tutors: tutors,
        hasTutors: tutorCount > 0,
        tutorCount: tutorCount,
        tutorCountText:
          tutorCount +
          (tutorCount === 1
            ? ' tutor record'
            : ' tutor records')
      });
    } catch (error) {
      return next(error);
    }
  }
);

module.exports = router;