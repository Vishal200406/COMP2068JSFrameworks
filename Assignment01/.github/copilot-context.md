# GitHub Copilot Context

## Project Overview

This project is a personal portfolio website created for COMP 2068 Assignment 1.

The website represents Vishal Malhotra, a Computer Programming student at Georgian College. It presents his academic background, programming interests, technical skills, selected project ideas, contact information, GitHub profile, and LinkedIn profile.

The website is built using Node.js, Express.js, and the HBS/Handlebars templating engine. It follows the Express Generator project structure and is deployed live on Render.

Live site:

https://portfolio-site-1-5qlj.onrender.com

## Tech Stack

This project uses the following technologies:

### Node.js

Node.js is used as the JavaScript runtime environment for running the server-side application.

### Express.js

Express.js is used as the web framework. It handles routing, middleware, static files, and server-side rendering.

### HBS / Handlebars

HBS is used as the templating engine. It allows the project to render dynamic HTML pages using shared data from the Express routes.

### HTML5

HTML5 is used to structure the website pages and content.

### CSS3

CSS3 is used for custom styling, layout, colors, spacing, responsive design, cards, buttons, and visual branding.

### Bootstrap

Bootstrap is used to support responsive layout, grid structure, navigation, buttons, and mobile-friendly design.

### GitHub

GitHub is used for version control and repository hosting.

### Render

Render is used to host the live deployed version of the portfolio website.

## Project Structure

The project follows an Express Generator-style structure.

```text
Assignment01
│
├── .github
│   ├── copilot-instructions.md
│   └── copilot-context.md
│
├── bin
│   └── www
│
├── public
│   ├── images
│   │   └── profile.jpg
│   │
│   └── stylesheets
│       └── style.css
│
├── routes
│   └── index.js
│
├── views
│   ├── about.hbs
│   ├── contact.hbs
│   ├── error.hbs
│   ├── index.hbs
│   ├── layout.hbs
│   └── projects.hbs
│
├── app.js
├── package.json
├── package-lock.json
├── README.md
└── .gitignore
```

## Routing Structure

All main page routes are handled in:

```text
routes/index.js
```

The project uses one router object, as required by the assignment.

Routes:

```text
/          → Home page
/about     → About Me page
/projects  → Projects page
/contact   → Contact Me page
```

## View Files

All page views are stored inside the `views` folder.

### layout.hbs

This file contains the shared layout for the entire website, including:

* HTML document structure
* Bootstrap CSS link
* Google Fonts link
* Custom CSS link
* Navigation bar
* Main body placeholder
* Footer
* Bootstrap JavaScript link

### index.hbs

This is the Home page. It includes:

* Hero section
* Vishal Malhotra introduction
* Computer Programming identity
* Profile photo
* Call-to-action buttons
* Web development, software development, and database systems cards

### about.hbs

This is the About Me page. It includes:

* Academic background
* Personal introduction
* Technical skills
* Learning focus areas
* Development mindset

### projects.hbs

This is the Projects page. It includes programming-related project cards such as:

* Express Portfolio Website
* Student Course Planner
* Inventory Management System
* Weather Information App
* Library Management System
* Personal Budget Tracker

### contact.hbs

This is the Contact Me page. It includes:

* Contact information
* Email
* GitHub link
* LinkedIn link
* Program information
* Contact form
* Professional links section

### error.hbs

This file displays error messages if a route is not found or another application error occurs.

## Static Assets

Static files are stored inside the `public` folder.

The main stylesheet is:

```text
public/stylesheets/style.css
```

The profile image is stored in:

```text
public/images/profile.jpg
```

## Portfolio Data

The main personal data is stored in `routes/index.js` as a `portfolio` object.

The portfolio object includes:

```text
name
role
email
github
linkedin
```

This data is passed to each HBS view and displayed across the website.

## Deployment

The project is deployed on Render.

Live deployment URL:

https://portfolio-site-1-5qlj.onrender.com

The application runs using:

```text
npm start
```

The start script in `package.json` uses:

```text
node ./bin/www
```

## Current Project Status

The project currently includes:

* Four required pages
* One main router file
* HBS templating
* Shared layout
* Responsive navigation
* Footer with GitHub and LinkedIn links
* Professional portfolio content
* Profile photo support
* Render deployment
* README file
* GitHub Copilot documentation files

## Copilot Usage Notes

Copilot should use this context to understand the project before suggesting changes.

Copilot should not remove required assignment features. Any future suggestions should preserve:

* Express Generator structure
* HBS view engine
* Four-page portfolio requirement
* One-router requirement
* Shared layout
* Personal branding for Vishal Malhotra
* Render deployment compatibility
