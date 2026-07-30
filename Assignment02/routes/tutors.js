const express = require('express');
const createError = require('http-errors');

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
 * @param {Date|string} value Stored date.
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
 * Normalize a text form value.
 *
 * @param {unknown} value Untrusted submitted value.
 * @param {number} maximumLength Maximum accepted length.
 * @returns {string} Trimmed text.
 */
function normalizeText(value, maximumLength) {
  if (typeof value !== 'string') {
    return '';
  }

  return value
    .trim()
    .slice(0, maximumLength);
}

/**
 * Normalize tutor form data before validation and storage.
 *
 * Only approved tutor fields are copied from req.body. Unexpected
 * submitted properties cannot be inserted into MongoDB.
 *
 * @param {Object} body Express request body.
 * @returns {Object} Normalized tutor information.
 */
function normalizeTutorForm(body) {
  return {
    name: normalizeText(
      body.name,
      80
    ),

    subject: normalizeText(
      body.subject,
      100
    ),

    courseCode: normalizeText(
      body.courseCode,
      20
    ).toUpperCase(),

    skills: normalizeText(
      body.skills,
      250
    ),

    availability: normalizeText(
      body.availability,
      150
    ),

    tutoringFormat: normalizeText(
      body.tutoringFormat,
      30
    ),

    location: normalizeText(
      body.location,
      100
    ),

    contactEmail: normalizeText(
      body.contactEmail,
      150
    ).toLowerCase(),

    experienceLevel: normalizeText(
      body.experienceLevel,
      30
    ),

    description: normalizeText(
      body.description,
      600
    )
  };
}

/**
 * Prepare tutor form data for HBS.
 *
 * Boolean properties restore selected dropdown options after a
 * validation error without requiring an HBS comparison helper.
 *
 * @param {Object} tutorData Tutor data.
 * @returns {Object} Tutor form view model.
 */
function prepareTutorFormData(tutorData) {
  const data = tutorData || {};

  return {
    name: data.name || '',
    subject: data.subject || '',
    courseCode: data.courseCode || '',
    skills: data.skills || '',
    availability: data.availability || '',

    tutoringFormat:
      data.tutoringFormat || '',

    location:
      data.location || '',

    contactEmail:
      data.contactEmail || '',

    experienceLevel:
      data.experienceLevel || '',

    description:
      data.description || '',

    isOnline:
      data.tutoringFormat === 'Online',

    isInPerson:
      data.tutoringFormat === 'In person',

    isHybrid:
      data.tutoringFormat === 'Hybrid',

    isBeginner:
      data.experienceLevel === 'Beginner',

    isIntermediate:
      data.experienceLevel === 'Intermediate',

    isAdvanced:
      data.experienceLevel === 'Advanced',

    isExpert:
      data.experienceLevel === 'Expert'
  };
}

/**
 * Convert Mongoose validation errors into readable messages.
 *
 * @param {Error} error Error returned by Mongoose.
 * @returns {Array<string>} Validation messages.
 */
function getValidationMessages(error) {
  if (
    !error ||
    error.name !== 'ValidationError' ||
    !error.errors
  ) {
    return [];
  }

  return Object.keys(error.errors).map(
    function (fieldName) {
      return error.errors[fieldName].message;
    }
  );
}

/**
 * Determine whether a route parameter has a valid MongoDB ObjectId
 * format.
 *
 * @param {string} tutorId Tutor record ID.
 * @returns {boolean} True when the ID is a 24-character hexadecimal
 * ObjectId.
 */
function isValidTutorId(tutorId) {
  return (
    typeof tutorId === 'string' &&
    /^[a-f0-9]{24}$/i.test(tutorId)
  );
}

/**
 * Convert tutor database records into public view objects.
 *
 * @param {Array<Object>} tutorRecords Tutor records.
 * @returns {Array<Object>} Public tutor view models.
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
 * Prepare tutor records for the management dashboard.
 *
 * @param {Array<Object>} tutorRecords Tutor records.
 * @returns {Array<Object>} Management view models.
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
      initials:
        createInitials(tutor.name),

      creatorName:
        creatorName,

      createdDate:
        formatDate(tutor.createdAt),

      updatedDate:
        formatDate(tutor.updatedAt)
    };
  });
}

/**
 * Prepare one tutor record for the deletion-confirmation page.
 *
 * @param {Object} tutor Tutor database record.
 * @returns {Object} Delete confirmation view model.
 */
function prepareDeleteTutor(tutor) {
  const creatorName =
    tutor.createdBy &&
    tutor.createdBy.displayName
      ? tutor.createdBy.displayName
      : 'Seed or legacy record';

  return {
    ...tutor,

    initials:
      createInitials(tutor.name),

    creatorName:
      creatorName,

    createdDate:
      formatDate(tutor.createdAt),

    updatedDate:
      formatDate(tutor.updatedAt)
  };
}

/**
 * Escape characters with special meanings in regular expressions.
 *
 * @param {string} value Search value.
 * @returns {string} Escaped search value.
 */
function escapeRegularExpression(value) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&'
  );
}

/**
 * Search stored Tutor fields for direct case-insensitive matches.
 *
 * @param {string} searchTerm Visitor search term.
 * @returns {Promise<Array<Object>>} Direct matches.
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
 * Use the instructor-required fuzzy-search package when no direct
 * match is found.
 *
 * @param {string} searchTerm Visitor search term.
 * @returns {Promise<Array<Object>>} Fuzzy matches.
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

  return fuzzyResults.filter(function (tutor) {
    return (
      typeof tutor.confidenceScore !== 'number' ||
      tutor.confidenceScore > 0
    );
  });
}

/**
 * Display the public read-only tutor directory.
 */
router.get('/', async function (req, res, next) {
  const searchTerm =
    typeof req.query.search === 'string'
      ? req.query.search
          .trim()
          .slice(0, 100)
      : '';

  const hasSearchInput =
    Boolean(searchTerm);

  const searchTooShort =
    hasSearchInput &&
    searchTerm.length < 2;

  try {
    let tutorRecords;
    let searchPerformed = false;
    let searchMethod = '';

    if (
      hasSearchInput &&
      !searchTooShort
    ) {
      tutorRecords =
        await findDirectMatches(
          searchTerm
        );

      searchPerformed = true;

      if (tutorRecords.length > 0) {
        searchMethod = 'direct';
      } else {
        tutorRecords =
          await findFuzzyMatches(
            searchTerm
          );

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
      preparePublicTutors(
        tutorRecords
      );

    const resultCount =
      tutors.length;

    return res.render(
      'tutors/index',
      {
        title: 'Tutor Directory',
        tutors: tutors,
        searchTerm: searchTerm,

        hasSearchInput:
          hasSearchInput,

        searchPerformed:
          searchPerformed,

        searchTooShort:
          searchTooShort,

        hasTutors:
          resultCount > 0,

        searchMethod:
          searchMethod,

        resultCount:
          resultCount,

        resultCountText:
          resultCount +
          (resultCount === 1
            ? ' tutor profile'
            : ' tutor profiles')
      }
    );
  } catch (error) {
    return next(error);
  }
});

/**
 * Display the protected tutor-management dashboard.
 */
router.get(
  '/manage',
  ensureAuthenticated,
  async function (req, res, next) {
    try {
      const tutorRecords =
        await Tutor.find()
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
        prepareManagementTutors(
          tutorRecords
        );

      const tutorCount =
        tutors.length;

      return res.render(
        'tutors/manage',
        {
          title: 'Manage Tutors',
          tutors: tutors,

          hasTutors:
            tutorCount > 0,

          tutorCount:
            tutorCount,

          tutorCountText:
            tutorCount +
            (tutorCount === 1
              ? ' tutor record'
              : ' tutor records')
        }
      );
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * Display the protected Create Tutor form.
 */
router.get(
  '/new',
  ensureAuthenticated,
  function (req, res) {
    return res.render(
      'tutors/new',
      {
        title: 'Add Tutor',

        formData:
          prepareTutorFormData({}),

        errors: []
      }
    );
  }
);

/**
 * Validate and create a tutor record.
 */
router.post(
  '/new',
  ensureAuthenticated,
  async function (req, res, next) {
    const normalizedTutor =
      normalizeTutorForm(req.body);

    const formData =
      prepareTutorFormData(
        normalizedTutor
      );

    try {
      const tutor = new Tutor({
        name:
          normalizedTutor.name,

        subject:
          normalizedTutor.subject,

        courseCode:
          normalizedTutor.courseCode,

        skills:
          normalizedTutor.skills,

        availability:
          normalizedTutor.availability,

        tutoringFormat:
          normalizedTutor.tutoringFormat,

        location:
          normalizedTutor.location,

        contactEmail:
          normalizedTutor.contactEmail,

        experienceLevel:
          normalizedTutor.experienceLevel,

        description:
          normalizedTutor.description,

        createdBy:
          req.user._id
      });

      await tutor.save();

      req.session.successMessage =
        'The tutor record for ' +
        tutor.name +
        ' was created successfully.';

      return res.redirect(
        '/tutors/manage'
      );
    } catch (error) {
      const validationErrors =
        getValidationMessages(error);

      if (
        validationErrors.length > 0
      ) {
        return res.status(400).render(
          'tutors/new',
          {
            title: 'Add Tutor',
            formData: formData,

            errors:
              validationErrors
          }
        );
      }

      return next(error);
    }
  }
);

/**
 * Display a protected Edit Tutor form containing the current record.
 */
router.get(
  '/:id/edit',
  ensureAuthenticated,
  async function (req, res, next) {
    const tutorId = req.params.id;

    if (!isValidTutorId(tutorId)) {
      return next(
        createError(
          404,
          'Tutor record not found.'
        )
      );
    }

    try {
      const tutor = await Tutor.findById(
        tutorId
      )
        .lean()
        .exec();

      if (!tutor) {
        return next(
          createError(
            404,
            'Tutor record not found.'
          )
        );
      }

      return res.render(
        'tutors/edit',
        {
          title: 'Edit Tutor',

          tutorId:
            tutor._id.toString(),

          tutorName:
            tutor.name,

          formData:
            prepareTutorFormData(
              tutor
            ),

          errors: []
        }
      );
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * Validate and update an existing Tutor record.
 */
router.post(
  '/:id/edit',
  ensureAuthenticated,
  async function (req, res, next) {
    const tutorId = req.params.id;

    if (!isValidTutorId(tutorId)) {
      return next(
        createError(
          404,
          'Tutor record not found.'
        )
      );
    }

    const normalizedTutor =
      normalizeTutorForm(req.body);

    const formData =
      prepareTutorFormData(
        normalizedTutor
      );

    try {
      const tutor = await Tutor.findById(
        tutorId
      ).exec();

      if (!tutor) {
        return next(
          createError(
            404,
            'Tutor record not found.'
          )
        );
      }

      /*
       * Assign only approved editable fields. The record ID, creator,
       * and creation date cannot be changed through the form.
       */
      tutor.name =
        normalizedTutor.name;

      tutor.subject =
        normalizedTutor.subject;

      tutor.courseCode =
        normalizedTutor.courseCode;

      tutor.skills =
        normalizedTutor.skills;

      tutor.availability =
        normalizedTutor.availability;

      tutor.tutoringFormat =
        normalizedTutor.tutoringFormat;

      tutor.location =
        normalizedTutor.location;

      tutor.contactEmail =
        normalizedTutor.contactEmail;

      tutor.experienceLevel =
        normalizedTutor.experienceLevel;

      tutor.description =
        normalizedTutor.description;

      /*
       * save() runs schema validation and refreshes plugin-generated
       * fuzzy-search values.
       */
      await tutor.save();

      req.session.successMessage =
        'The tutor record for ' +
        tutor.name +
        ' was updated successfully.';

      return res.redirect(
        '/tutors/manage'
      );
    } catch (error) {
      const validationErrors =
        getValidationMessages(error);

      if (
        validationErrors.length > 0
      ) {
        return res.status(400).render(
          'tutors/edit',
          {
            title: 'Edit Tutor',
            tutorId: tutorId,

            tutorName:
              normalizedTutor.name ||
              'Tutor',

            formData:
              formData,

            errors:
              validationErrors
          }
        );
      }

      return next(error);
    }
  }
);

/**
 * Display the protected delete-confirmation page.
 *
 * This GET route does not modify MongoDB. It displays the exact tutor
 * record and asks the authenticated user to confirm or cancel.
 */
router.get(
  '/:id/delete',
  ensureAuthenticated,
  async function (req, res, next) {
    const tutorId = req.params.id;

    if (!isValidTutorId(tutorId)) {
      return next(
        createError(
          404,
          'Tutor record not found.'
        )
      );
    }

    try {
      const tutor = await Tutor.findById(
        tutorId
      )
        .populate(
          'createdBy',
          'displayName'
        )
        .lean()
        .exec();

      if (!tutor) {
        return next(
          createError(
            404,
            'Tutor record not found.'
          )
        );
      }

      return res.render(
        'tutors/delete',
        {
          title: 'Delete Tutor',

          tutor:
            prepareDeleteTutor(tutor)
        }
      );
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * Permanently delete a tutor after confirmation.
 *
 * Deletion uses POST rather than GET so opening a link, browser
 * prefetching, or loading an image cannot remove a database record.
 */
router.post(
  '/:id/delete',
  ensureAuthenticated,
  async function (req, res, next) {
    const tutorId = req.params.id;

    if (!isValidTutorId(tutorId)) {
      return next(
        createError(
          404,
          'Tutor record not found.'
        )
      );
    }

    try {
      const tutor = await Tutor.findById(
        tutorId
      )
        .select('name')
        .lean()
        .exec();

      if (!tutor) {
        return next(
          createError(
            404,
            'Tutor record not found.'
          )
        );
      }

      const deletionResult =
        await Tutor.deleteOne({
          _id: tutorId
        }).exec();

      /*
       * Mongoose 5 results may expose the deleted count as either
       * deletedCount or n, depending on the MongoDB driver response.
       */
      const deletedCount =
        typeof deletionResult.deletedCount === 'number'
          ? deletionResult.deletedCount
          : deletionResult.n;

      if (!deletedCount) {
        return next(
          createError(
            404,
            'Tutor record not found.'
          )
        );
      }

      req.session.successMessage =
        'The tutor record for ' +
        tutor.name +
        ' was permanently deleted.';

      return res.redirect(
        '/tutors/manage'
      );
    } catch (error) {
      return next(error);
    }
  }
);

module.exports = router;