# Library-Webserver
A webserver created with Express, MySQL, and Docker

## About
This is a project I created for an Internet Application Development class. It it a library website that allows users to peruse the book database and validated administrators to perform operations on it. The html layout and Dockerfile was provided, but the code was written by me.

## How to run
In a terminal in the root directory, use:
- `docker compose run app1 npm install`
- `docker compose up`
This will start the docker containers with the database and web app. The web app will be listening on localhost, which you can now connect to.
Administrator credentials are stored as an encoded value in the database. Should you want to test the administrative capabilities, a valid username and password pair is HAROLD (username) and dogs (password).

## Tech used
This project makes use of NodeJS, specifically Express, for the web application. It uses Handlebars to serve dynamic webpages. The database is in MySQL, and everything is encapsulated within Docker containers.

<div align="center">
	<code><img width="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/javascript.png" alt="JavaScript" title="JavaScript"/></code>
	<code><img width="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/node_js.png" alt="Node.js" title="Node.js"/></code>
	<code><img width="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/express.png" alt="Express" title="Express"/></code>
	<code><img width="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/mysql.png" alt="MySQL" title="MySQL"/></code>
	<code><img width="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/docker.png" alt="Docker" title="Docker"/></code>
</div>
