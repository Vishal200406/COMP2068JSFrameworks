# GitHub Copilot Instructions

## Project Objective

The objective of this project is to create a personal portfolio website for COMP 2068 Assignment 1 using Node.js, Express.js, and the HBS/Handlebars templating engine.

The portfolio website represents Vishal Malhotra, a Computer Programming student at Georgian College. The site must present a professional student-developer identity and include information about skills, academic background, projects, contact details, GitHub, and LinkedIn.

The project must be hosted live on a cloud service such as Render or Azure and pushed to GitHub for submission.

## Assignment Requirements

GitHub Copilot should help generate and improve code while following these assignment requirements:

1. The website must be a personal portfolio website.
2. The website must include four main pages:

   * Home / Landing Page
   * About Me
   * Projects
   * Contact Me
3. The project must use Node.js and Express.js.
4. The project must use the HBS/Handlebars view engine.
5. The project must follow the Express Generator project structure.
6. All views must be inside the `views` folder.
7. All routing must be handled inside the `routes` folder.
8. Only one router object should be used: `routes/index.js`.
9. Each main section must have its own separate HBS view file.
10. `layout.hbs` must contain the shared website structure, including:

    * HTML document structure
    * CSS links
    * Bootstrap links
    * Shared navigation bar
    * Shared footer
11. The footer must include links to GitHub and LinkedIn.
12. The project must include a README file with:

    * Brief description of the application
    * Live site link
    * GitHub repository link
    * External sources, themes, or templates used
13. The project must include this `.github` folder with:

    * `copilot-instructions.md`
    * `copilot-context.md`

## Coding Rules

When generating or editing code, Copilot should follow these rules:

* Keep the project beginner-friendly and readable.
* Do not add unnecessary frameworks that are not required by the assignment.
* Do not add a database because this assignment does not require one.
* Do not add extra routers unless the assignment requirements change.
* Keep all main routes inside `routes/index.js`.
* Use semantic HTML where possible.
* Use Bootstrap for responsive layout support.
* Use custom CSS for branding and visual polish.
* Keep the website responsive for desktop, tablet, and mobile screens.
* Keep file names clear and consistent.
* Use comments only where they improve clarity.
* Do not commit or reference `node_modules`.
* Do not remove required assignment files.

## Personal Brand Instructions

This project should be customized for Vishal Malhotra.

Personal details:

* Name: Vishal Malhotra
* Program: Computer Programming, Georgian College
* Email: [maliotravishal101@gmail.com](mailto:maliotravishal101@gmail.com)
* GitHub: https://github.com/Vishal200406
* LinkedIn: https://ca.linkedin.com/in/vishal-malhotra-953352417
* Live site: https://portfolio-site-1-5qlj.onrender.com

The website should present Vishal as:

* A Computer Programming student
* A developing web and software developer
* A learner focused on practical programming skills
* Someone interested in web development, databases, software design, APIs, and application development
* A student preparing for co-op, academic projects, and entry-level technology opportunities

## Design and Styling Guidance

The website should use a clean, modern, professional developer portfolio style.

Preferred branding:

* Primary colour: dark navy
* Accent colour: bright blue
* Secondary accent: cyan
* Background colour: light grey or light blue-white
* Font style: clean and modern
* Layout style: card-based, responsive, polished, and easy to navigate

Design should include:

* Clear navigation
* Strong landing page hero section
* Profile photo area
* Project cards
* Skill cards
* Contact information section
* Professional footer
* Mobile-friendly layout

## Page Content Guidance

### Home Page

The Home page should introduce Vishal Malhotra and include:

* Name
* Program
* Short professional introduction
* Profile photo or initials
* Buttons linking to Projects and Contact pages
* Cards showing development interests such as web development, software development, and database systems

### About Me Page

The About Me page should include:

* Academic background
* Computer Programming focus
* Skills being developed
* Technical skills list
* Learning goals
* Professional development mindset

### Projects Page

The Projects page should include project cards related to Computer Programming, such as:

* Express Portfolio Website
* Student Course Planner
* Inventory Management System
* Weather Information App
* Library Management System
* Personal Budget Tracker

Each project should include:

* Project title
* Technology tag
* Description
* Skills demonstrated

### Contact Me Page

The Contact page should include:

* Email
* GitHub link
* LinkedIn link
* Program information
* Contact form
* Professional connection statement

## Review Checklist

Before considering the project complete, verify that:

* The site runs locally with `npm start`.
* The Home page works.
* The About Me page works.
* The Projects page works.
* The Contact Me page works.
* The navbar links work.
* The footer links work.
* The profile photo displays correctly.
* The site is responsive on mobile.
* The README includes the live Render link.
* The `.github` documentation files are included.
* The project is committed and pushed to GitHub.
* The live Render site is working.
