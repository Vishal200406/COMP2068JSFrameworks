# TutorConnect Directory

TutorConnect Directory is a full-stack web application developed for the COMP 2068 JavaScript Frameworks course. The application provides a centralized directory where students can search for peer tutors using names, subjects, course codes, skills, availability, location, tutoring format, and experience level.

Public users can browse and search tutor profiles. Registered users can log in and access a protected dashboard where they can create, edit, and delete tutor records.

## Live Application

[TutorConnect Directory](https://tutorconnect-omega.vercel.app/)

## GitHub Repository

[COMP2068JSFrameworks Repository](https://github.com/Vishal200406/COMP2068JSFrameworks.git)

## Project Location

The application is located in:

```text
Assignment02
```

## Features

### Public Features

- Responsive home page
- Public read-only tutor directory
- Tutor profile cards
- Keyword search
- Fuzzy search for misspelled terms
- Search by tutor name
- Search by subject
- Search by course code
- Search by skills
- Search by availability
- Search by tutoring format
- Search by location
- Search by experience level
- Responsive design for desktop, tablet, and mobile devices

### Authentication Features

- Local account registration
- Email and password login
- GitHub OAuth login
- Secure password hashing with bcrypt
- MongoDB-backed sessions
- Persistent login sessions
- Secure logout
- Protected management routes
- Authentication-based navigation

### CRUD Features

Authenticated users can perform all four CRUD operations:

- **Create:** Add a new tutor profile
- **Read:** View tutor records in the public directory and management dashboard
- **Update:** Edit an existing tutor record
- **Delete:** Review a confirmation page and permanently delete a tutor record

## Technologies Used

### Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- Passport.js
- Passport Local
- Passport GitHub
- Express Session
- Connect Mongo
- bcryptjs

### Frontend

- Handlebars
- Bootstrap 5
- HTML5
- Custom CSS

### Deployment

- Vercel
- MongoDB Atlas
- GitHub

## Main NPM Packages

| Package | Purpose |
|---|---|
| `express` | Web application framework |
| `mongoose` | MongoDB object data modelling |
| `mongoose-fuzzy-searching` | Fuzzy keyword search |
| `hbs` | Handlebars view engine |
| `passport` | Authentication middleware |
| `passport-local` | Email and password authentication |
| `passport-github2` | GitHub OAuth authentication |
| `express-session` | Session management |
| `connect-mongo` | MongoDB session storage |
| `bcryptjs` | Password hashing |
| `dotenv` | Environment-variable management |
| `morgan` | HTTP request logging |
| `http-errors` | HTTP error handling |

## Project Structure

```text
Assignment02/
├── api/
│   └── index.js
├── bin/
│   └── www
├── config/
│   ├── database.js
│   └── passport.js
├── middleware/
│   └── auth.js
├── models/
│   ├── tutor.js
│   └── user.js
├── public/
│   └── stylesheets/
│       └── style.css
├── routes/
│   ├── index.js
│   ├── tutors.js
│   └── users.js
├── scripts/
│   └── seedTutors.js
├── views/
│   ├── tutors/
│   │   ├── delete.hbs
│   │   ├── edit.hbs
│   │   ├── index.hbs
│   │   ├── manage.hbs
│   │   └── new.hbs
│   ├── users/
│   │   ├── login.hbs
│   │   └── register.hbs
│   ├── error.hbs
│   ├── index.hbs
│   └── layout.hbs
├── .env.example
├── .gitignore
├── app.js
├── package.json
├── package-lock.json
└── vercel.json
```

## Application Routes

### Public Routes

| Method | Route | Description |
|---|---|---|
| GET | `/` | Displays the home page |
| GET | `/tutors` | Displays the public tutor directory |
| GET | `/tutors?search=keyword` | Searches tutor records |
| GET | `/users/register` | Displays the registration page |
| POST | `/users/register` | Creates a local account |
| GET | `/users/login` | Displays the login page |
| POST | `/users/login` | Authenticates a local user |
| GET | `/users/github` | Starts GitHub authentication |
| GET | `/users/github/callback` | Completes GitHub authentication |
| POST | `/users/logout` | Logs the user out |

### Protected Routes

| Method | Route | Description |
|---|---|---|
| GET | `/tutors/manage` | Displays the management dashboard |
| GET | `/tutors/new` | Displays the Add Tutor form |
| POST | `/tutors/new` | Creates a tutor record |
| GET | `/tutors/:id/edit` | Displays the Edit Tutor form |
| POST | `/tutors/:id/edit` | Updates a tutor record |
| GET | `/tutors/:id/delete` | Displays the deletion-confirmation page |
| POST | `/tutors/:id/delete` | Permanently deletes a tutor record |

## Local Installation

### 1. Clone the repository

```bash
git clone https://github.com/Vishal200406/COMP2068JSFrameworks.git
```

### 2. Open the project folder

```bash
cd COMP2068JSFrameworks/Assignment02
```

### 3. Install dependencies

```bash
npm install
```

### 4. Create the environment file

Create a `.env` file inside the `Assignment02` folder.

```env
MONGODB_URI=your-mongodb-atlas-connection-string
SESSION_SECRET=your-session-secret

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:3000/users/github/callback
```

The `.env` file must not be committed to GitHub.

### 5. Seed sample tutor records

```bash
npm run seed
```

### 6. Start the application

```bash
npm start
```

Open:

```text
http://localhost:3000
```

## Environment Variables

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `SESSION_SECRET` | Secret used to sign application sessions |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret |
| `GITHUB_CALLBACK_URL` | GitHub OAuth callback URL |

### Local GitHub Callback

```text
http://localhost:3000/users/github/callback
```

### Production GitHub Callback

```text
https://tutorconnect-omega.vercel.app/users/github/callback
```

## NPM Scripts

### Start the application

```bash
npm start
```

### Seed tutor records

```bash
npm run seed
```

## Database Collections

### Tutors

The `tutors` collection stores:

- Tutor name
- Subject
- Course code
- Skills
- Availability
- Tutoring format
- Location
- Contact email
- Experience level
- Description
- Record creator
- Creation date
- Last updated date
- Fuzzy-search data

### Users

The `users` collection stores local and GitHub user accounts.

Local accounts store:

- Display name
- Email address
- Hashed password
- Authentication provider

GitHub accounts store:

- GitHub profile ID
- GitHub username
- Display name
- Avatar URL
- Authentication provider

Plain-text passwords are never stored.

### Sessions

The `sessions` collection stores authenticated Express sessions using `connect-mongo`.

## Search Functionality

TutorConnect first performs a direct case-insensitive search across tutor fields. When no direct match is found, the application uses the `mongoose-fuzzy-searching` package.

Example direct searches:

```text
COMP 2068
JavaScript
Online
Barrie Campus
```

Example fuzzy searches:

```text
javscript
authentcation
servr-side
```

## Validation and Security

The application includes:

- Server-side form validation
- Password hashing with bcrypt
- Protected management routes
- MongoDB-backed sessions
- HTTP-only session cookies
- Secure production cookies
- Normalized form data
- MongoDB ObjectId validation
- Safe error handling
- Delete confirmation before permanent deletion
- POST requests for deletion
- Environment variables for private credentials
- Hidden production stack traces

## Deployment

The application is deployed using Vercel:

[https://tutorconnect-omega.vercel.app/](https://tutorconnect-omega.vercel.app/)

The deployment uses:

- `api/index.js` as the Vercel serverless entry point
- `vercel.json` for routing
- MongoDB Atlas for database storage
- MongoDB Atlas for session storage
- Vercel environment variables
- GitHub OAuth authentication
- Node.js 20

The Vercel root directory is:

```text
Assignment02
```

## Testing

The following features were tested:

- Home page
- Public tutor directory
- Keyword search
- Fuzzy search
- Registration validation
- Duplicate-email validation
- Local login
- GitHub login
- Session persistence
- Logout
- Route protection
- Tutor creation
- Tutor editing
- Delete confirmation
- Permanent deletion
- Invalid record ID handling
- Responsive design
- Production deployment

## External Resources and Assistance

External documentation and AI assistance were used for learning, debugging, deployment guidance, code organization, comments, and documentation.

Resources used include:

- Express Documentation  
  https://expressjs.com/

- Mongoose Documentation  
  https://mongoosejs.com/

- Passport Documentation  
  https://www.passportjs.org/

- GitHub OAuth Documentation  
  https://docs.github.com/en/apps/oauth-apps/building-oauth-apps

- MongoDB Atlas Documentation  
  https://www.mongodb.com/docs/atlas/

- Vercel Documentation  
  https://vercel.com/docs/

- Bootstrap Documentation  
  https://getbootstrap.com/docs/

- mongoose-fuzzy-searching  
  https://github.com/VassilisPallas/mongoose-fuzzy-searching

- bcryptjs  
  https://github.com/dcodeIO/bcrypt.js

- OpenAI ChatGPT  
  https://chatgpt.com/

All code was reviewed, adapted, tested, and integrated by the developer.

## Author

**Vishal**

COMP 2068 — JavaScript Frameworks

Individual Assignment 2

## License

This project was created for academic and educational purposes.