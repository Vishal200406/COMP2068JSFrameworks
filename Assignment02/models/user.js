const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

/**
 * User schema
 *
 * A user can register with a local email/password account or sign in
 * through GitHub. Local accounts store only a password hash, never the
 * original password.
 */
const userSchema = new Schema(
  {
    displayName: {
      type: String,
      required: [true, 'Display name is required.'],
      trim: true,
      minlength: [
        2,
        'Display name must contain at least 2 characters.'
      ],
      maxlength: [
        80,
        'Display name cannot exceed 80 characters.'
      ]
    },

    email: {
      type: String,
      required: [
        function () {
          return this.authProvider === 'local';
        },
        'Email address is required for a local account.'
      ],
      trim: true,
      lowercase: true,
      maxlength: [
        150,
        'Email address cannot exceed 150 characters.'
      ],
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Enter a valid email address.'
      ],
      unique: true,
      sparse: true
    },

    passwordHash: {
      type: String,
      required: [
        function () {
          return this.authProvider === 'local';
        },
        'A password hash is required for a local account.'
      ],
      default: null,
      select: false
    },

    githubId: {
      type: String,
      required: [
        function () {
          return this.authProvider === 'github';
        },
        'A GitHub ID is required for a GitHub account.'
      ],
      unique: true,
      sparse: true
    },

    githubUsername: {
      type: String,
      trim: true,
      maxlength: [
        100,
        'GitHub username cannot exceed 100 characters.'
      ]
    },

    avatarUrl: {
      type: String,
      trim: true,
      maxlength: [
        500,
        'Avatar URL cannot exceed 500 characters.'
      ]
    },

    authProvider: {
      type: String,
      enum: {
        values: ['local', 'github'],
        message:
          'Authentication provider must be local or GitHub.'
      },
      default: 'local',
      required: true
    }
  },
  {
    timestamps: true
  }
);

/**
 * Hash and store a local account password.
 *
 * bcrypt accepts a maximum of 72 UTF-8 bytes. The application checks
 * this limit rather than silently allowing the password to be
 * truncated.
 *
 * @param {string} password Plain-text password supplied during
 * registration.
 * @returns {Promise<void>}
 */
userSchema.methods.setPassword = async function (password) {
  if (typeof password !== 'string') {
    throw new Error('Password must be text.');
  }

  if (password.length < 8) {
    throw new Error(
      'Password must contain at least 8 characters.'
    );
  }

  if (Buffer.byteLength(password, 'utf8') > 72) {
    throw new Error(
      'Password cannot exceed 72 UTF-8 bytes.'
    );
  }

  this.passwordHash = await bcrypt.hash(password, 10);
};

/**
 * Compare a submitted password with the saved bcrypt hash.
 *
 * @param {string} password Plain-text password submitted at login.
 * @returns {Promise<boolean>} True when the password matches.
 */
userSchema.methods.verifyPassword = async function (password) {
  if (
    typeof password !== 'string' ||
    !this.passwordHash
  ) {
    return false;
  }

  return bcrypt.compare(password, this.passwordHash);
};

/**
 * Prevent the password hash from appearing when a User document is
 * converted to JSON.
 */
userSchema.set('toJSON', {
  transform: function (document, returnedObject) {
    delete returnedObject.passwordHash;
    delete returnedObject.__v;

    return returnedObject;
  }
});

module.exports = mongoose.model('User', userSchema);