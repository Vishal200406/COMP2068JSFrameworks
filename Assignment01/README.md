# Vishal Malhotra Portfolio Website

## Live Site

https://portfolio-site-1-5qlj.onrender.com

## GitHub Repository

https://github.com/Vishal200406/COMP2068JSFrameworks

## Project Description

This is a personal portfolio website created for COMP 2068 Assignment 1. The website was built using Node.js, Express.js, and the HBS/Handlebars templating engine. It follows the Express Generator project structure and includes the required four portfolio pages: Home, About Me, Projects, and Contact Me.

The website represents Vishal Malhotra, a Computer Programming student at Georgian College. It presents my academic background, programming interests, technical skills, project ideas, contact information, GitHub profile, and LinkedIn profile in a professional portfolio format.

The goal of this project is to demonstrate my ability to create a structured Express web application using server-side routing, HBS views, a shared layout file, responsive design, and cloud deployment.

## Website Pages

The portfolio includes the following pages:

### Home

The Home page introduces Vishal Malhotra as a Computer Programming student at Georgian College. It includes a professional hero section, profile photo, short introduction, call-to-action buttons, and cards highlighting web development, software development, and database systems.

### About Me

The About Me page provides more detail about my academic background, learning goals, technical skills, programming interests, and development mindset. It explains my focus on programming logic, web application development, and database-driven systems.

### Projects

The Projects page includes programming-related project cards that connect to my Computer Programming studies. These projects include:

* Express Portfolio Website
* Student Course Planner
* Inventory Management System
* Weather Information App
* Library Management System
* Personal Budget Tracker

Each project card includes a description, technology focus, and key skills demonstrated.

### Contact Me

The Contact Me page includes my email address, GitHub profile, LinkedIn profile, program information, and a contact form. It allows visitors to connect with me about programming, web development, academic projects, and technology opportunities.

## Technologies Used

This project uses the following technologies:

* Node.js
* Express.js
* HBS / Handlebars
* HTML5
* CSS3
* Bootstrap 5
* JavaScript
* GitHub
* Render

## Project Structure

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

## Routing

All main routes are defined in one router file:

```text
routes/index.js
```

The project uses the following routes:

```text
/          Home page
/about     About Me page
/projects  Projects page
/contact   Contact Me page
```

This satisfies the assignment requirement that only one router object is required.

## Layout and Design

The website uses a shared `layout.hbs` file for the overall structure of the site. The layout includes:

* HTML document structure
* Bootstrap CSS link
* Google Fonts link
* Custom CSS link
* Shared navigation bar
* Main content area
* Shared footer
* Bootstrap JavaScript link

The footer includes links to my GitHub profile, LinkedIn profile, and email address.

The website design uses a clean and professional developer portfolio style with:

* Dark navy navigation
* Bright blue accent buttons
* Cyan highlights
* Responsive Bootstrap grid
* Card-based project layout
* Profile photo section
* Mobile-friendly navigation

## How to Run Locally

To run this project locally, install the dependencies first:

```bash
npm install
```

Then start the application:

```bash
npm start
```

Open the project in a browser:

```text
http://localhost:3000
```

## Deployment

This website is deployed live using Render.

Live site:

```text
https://portfolio-site-1-5qlj.onrender.com
```

The application uses the following start command:

```bash
npm start
```

## GitHub Copilot Documentation

This project includes the required GitHub Copilot documentation files inside the `.github` folder:

```text
.github/copilot-instructions.md
.github/copilot-context.md
```

The `copilot-instructions.md` file explains the project objective, assignment rules, coding guidance, and personal brand instructions.

The `copilot-context.md` file documents the project tech stack, project structure, routes, views, static assets, deployment information, and current project status.

## External Resources Used

The following external resources were used in this project:

* Express Generator: https://expressjs.com/en/starter/generator.html
* Bootstrap 5: https://getbootstrap.com/
* Google Fonts: https://fonts.google.com/
* Render Hosting: https://render.com/
* Node.js: https://nodejs.org/

## Author

Vishal Malhotra
Computer Programming Student
Georgian College

Email: [maliotravishal101@gmail.com](mailto:maliotravishal101@gmail.com)
GitHub: https://github.com/Vishal200406
LinkedIn: https://ca.linkedin.com/in/vishal-malhotra-953352417
