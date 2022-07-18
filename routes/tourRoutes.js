const express = require("express");
const {
  getAllTours,
  createTour,
  getTour,
  updateTours,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  deleteTour
} = require("./../controllers/tourController");

const router = express.Router();

//Param Middleware to check the ID params in the url
//middleware that one runs when there is a certain parameter(s) in the url
//this middleware runs before it hits the getTour, updateTour and deleteTour actions. instead of writing the same ID check code in each action, the param middleware helps with the repetition
//router.param("id", checkID); // checkID only runs when the id parameter is present in the url

//Routers
//route alias: ie middleware that adds par. eg user going to this route to five the top 5 cheapest tours instead of typing it out as a query string
router.route("/top-5-tours").get(aliasTopTours, getAllTours); //a middleware that sets the query string to get the top 5 cheap tours
router.route("/monthly-plan/:year").get(getMonthlyPlan, getAllTours);
router.route("/tour-stats").get(getTourStats);
router.route("/").get(getAllTours).post(createTour);
router.route("/:id").get(getTour).patch(updateTours).delete(deleteTour);

module.exports = router;
