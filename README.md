# Recept & Näring

This application runs a Node/Express server with MongoDB and Cloudinary as cloud storage.


## Get started

To get up and running you'll need to install the dependencies with
```
npm install
```
The application uses the DOTENV npm-package to make use of custom environment variables. To properly use this app, you'll need the credentials to paste into a .env file.

Environment variables are accessible on the process.env object. A simple way to get specific data from it is to use destructuring, like this:
```javascript
const {FIRSTVARIABLE, SECONDVARIABLE} = process.env;
```
The application is available for demo at http://wcag.herokuapp.com/
