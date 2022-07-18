//const fs = require("fs");
const express = require("express");
const morgan = require("morgan");

//route handlers imported from routes folder
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

// Good practise to assign express module to a variable
const app = express();

//These middlewares are functions that process incoming requests before they reach the target controller.
//Middleware(express.json()): a function that can modify the incoming request data. It stands btw the request and response
// a step which the request goes throu while being processed
// because Express doesnt put body data on the request, middleware needs to be used to get that data
app.use(express.json());

//Built-in Express middleware to serve static files in the file system
app.use(express.static(`${__dirname}`)); // defines the root directory to access static files

//3rd party middleware
app.use(morgan("dev"));

//custom middleware
// applies to every single request
//global middleware should be declared before the route handlers
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.requestTime);
  next(); // this is used to move to the next middleware function. Else there would be no response
});

//Routers (route middleware imported from routes folder) set the root
app.use("/api/v1/tours", tourRouter); // apllies the tourRouter middleware to /api/v1/tours
app.use("/api/v1/users", userRouter); // apllies the userRouter middleware to /api/v1/users

module.exports = app;
