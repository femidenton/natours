//const { stringify } = require("querystring");
const Tour = require("../models/tourModel");
const ApiFeatures = require("../utils/apiFeatures");

// FAT models, THIN controllers v

// middleware function to check for valid ID in the url
//param functions get access to the 'val' argument
// exports.checkID = (req, res, next, val) => {
//   console.log(`Tour ID is ${val}`);
//   if (val > tours.length) {
//     return res.status(404).json({
//       status: "failed",
//       data: "Invalid ID"
//     });
//   }
//   next();
// };

//to validate the body ie make sure that the name and the price are not empty
// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(404).json({
//       status: "failed",
//       message: "Params not filled"
//     });
//   }
//   next();
// };

// Route Handlers
// middleware that works for a specific route.

//a middleware that sets the query string to get the top 5 cheap tours
exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingAverage,price";
  // req.query.fields = "name,ratingAverage,price,summary,difficulty";
  next();
};

//to get how many tours start in a given month of the year
exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      {
        //Deconstructs an array field from the input documents and then output one document for each element in the array. Each output document is the input document with the value of the array field replaced by the element
        // each document has an array of 3 startDates, $unwind takes each on and makes it a singule document with 1 startDate.
        $unwind: "$startDates" // breaks down the startDates array within a document in a way that that it creates several documents with one startDate
      },
      {
        $match: {
          // display tours that are in 2021 only
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: "$startDates" }, // $month is an aggregate operator (Date) to extract the month from the Date object
          numOfTours: { $sum: 1 },
          tours: { $push: "$name" } // add the name of the tours in an array
        }
      },
      {
        $addFields: { month: "$_id" } // adds field to output.
      },
      {
        $project: {
          // decides what field will show or be hidden
          _id: 0
        }
      },
      {
        sort: { numTourStarts: -1 }
      },
      {
        $limit: 12
      }
    ]);
    res.status(200).json({
      status: "success",
      data: {
        plan
      }
    });
  } catch (err) {
    res.status(404).json({
      message: err
    });
    console.log(err);
  }
};

// Using data aggregation pipeline (a mongodb feature) to get key stats.
// A pipeline is defined that all documents from a certain collection go thru, where they are processed setp by step in order to transform them into aggregated result
// Aggregation pipeline can be used to calculate avegares, min or max values etc
// function used in a route
exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      //pipleine created and pass in an array of stages. Each document will pass through the stages one by one as it is defined
      {
        $match: { ratingsAverage: { $gte: 4.5 } } // use 'match' to filter certain documents eg selct documents with average ratong of 4.5
        // match statge is usually a preliminary stage to prepare for the next stage
      },

      {
        $group: {
          // groups documents together using 'accumulators' ie calculating avg, sum etc
          _id: "$difficulty", //_id is the most important because its where we specify what we are grouping by
          //accumulators
          numTours: { $sum: 1 },
          numRatings: { $sum: "$ratingsQuantity" },
          avgRating: { $avg: "$ratingsAverage" },
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" }
        }
      },
      {
        sort: { avgPrice: 1 } // sort by average price in ascending order. Using 'avgPrice' because that is the output from the previous stage that will be used as the input of this stage
      }
    ]);
    res.status(200).json({
      status: "success",
      data: {
        stats
      }
    });
  } catch (err) {
    res.status(404).json({
      message: err
    });
    console.log(err);
  }
};

exports.getAllTours = async (req, res) => {
  try {
    // * EXECUTE QUERY
    const features = new ApiFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;
    // console.log(req.query);
    res.status(200).json({
      status: "success",
      results: (await tours).length,
      data: {
        tours
      }
    });
  } catch (err) {
    res.status(404).json({
      message: err
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    // const id = parseInt(req.params.id);
    const tour = await Tour.findById(req.params.id);
    console.log(tour);
    //const tour = Tour.findOne({ _id: req.params.id });

    res.status(200).json({
      status: "success",
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err
    });
  }
};

exports.updateTours = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true, //returns the object after its been updated
      runValidators: true //validations are enabled when updating a document
    });
    res.status(200).json({
      status: "success",
      tour
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: "success",
      data: null
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err
    });
  }
};
exports.createTour = async (req, res) => {
  //One way of saving a new document
  //const newTour = new Tour(req.body)
  //newTour.save() //to access the data saved, use .then() since newTour.save() is a Promise
  // same as Model.prototype.save(). Model.prototype means an object (newTour) created from a Class (Tour)
  //better way of adding a new document. use async await to get access to the data stored instead of using .then()
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        tour: newTour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Invalid data sent!"
    });
  }
};
