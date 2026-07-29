const mongoose = require('mongoose');
const mongooseFuzzySearching = require('mongoose-fuzzy-searching');

const { Schema } = mongoose;

/**
 * Tutor schema
 *
 * Each document represents one peer tutor displayed in the
 * TutorConnect Directory.
 */
const tutorSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Tutor name is required.'],
      trim: true,
      minlength: [2, 'Tutor name must contain at least 2 characters.'],
      maxlength: [80, 'Tutor name cannot exceed 80 characters.']
    },

    subject: {
      type: String,
      required: [true, 'Subject is required.'],
      trim: true,
      minlength: [2, 'Subject must contain at least 2 characters.'],
      maxlength: [100, 'Subject cannot exceed 100 characters.']
    },

    courseCode: {
      type: String,
      required: [true, 'Course code is required.'],
      trim: true,
      uppercase: true,
      minlength: [3, 'Course code must contain at least 3 characters.'],
      maxlength: [20, 'Course code cannot exceed 20 characters.']
    },

    skills: {
      type: String,
      required: [true, 'At least one tutoring skill is required.'],
      trim: true,
      maxlength: [250, 'Skills cannot exceed 250 characters.']
    },

    availability: {
      type: String,
      required: [true, 'Availability is required.'],
      trim: true,
      maxlength: [150, 'Availability cannot exceed 150 characters.']
    },

    tutoringFormat: {
      type: String,
      required: [true, 'Tutoring format is required.'],
      enum: {
        values: ['Online', 'In person', 'Hybrid'],
        message: 'Select Online, In person, or Hybrid.'
      }
    },

    location: {
      type: String,
      required: [true, 'Location is required.'],
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters.']
    },

    contactEmail: {
      type: String,
      required: [true, 'Contact email is required.'],
      trim: true,
      lowercase: true,
      maxlength: [150, 'Contact email cannot exceed 150 characters.'],
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Enter a valid contact email address.'
      ]
    },

    experienceLevel: {
      type: String,
      required: [true, 'Experience level is required.'],
      enum: {
        values: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        message:
          'Select Beginner, Intermediate, Advanced, or Expert.'
      }
    },

    description: {
      type: String,
      required: [true, 'Tutor description is required.'],
      trim: true,
      minlength: [
        20,
        'Tutor description must contain at least 20 characters.'
      ],
      maxlength: [
        600,
        'Tutor description cannot exceed 600 characters.'
      ]
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

/*
 * The instructor-required plugin creates fuzzy-search data for these
 * selected fields and adds Tutor.fuzzySearch() to the model.
 */
tutorSchema.plugin(mongooseFuzzySearching, {
  fields: [
    'name',
    'subject',
    'courseCode',
    'skills',
    'availability',
    'tutoringFormat',
    'location',
    'experienceLevel',
    'description'
  ]
});

module.exports = mongoose.model('Tutor', tutorSchema);