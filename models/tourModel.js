const mongoose = require("mongoose");
const slugify = require("slugify");

// FAT models, THIN controllers. A good chunk of validation is done here in the model

// create a Mongoose schema
const tourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxLength: [40, "A tour name should be less than or equal to 40"], //string validator only
      minLength: [10, "A tour name should be greater than or equal to 10"] //string validator only
    },
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"]
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have group size"]
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        // validator only works with Strings
        //to specify that the difficulty can only be easy, medium or difficult. Any other answer wouldnt be allowed
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either easy, medium or difficult"
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"], // validator works with numbers and dates
      max: [5, "Rating must be below 5.0"]
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: true
    },
    priceDiscount: {
      type: Number,
      validate: {
        // custom validator
        validator: function (val) {
          //val being the user input
          return this.price > val ? true : false;
        }
      }
    },
    summary: {
      type: String,
      trim: true, //removes whitespace in the begining and end of the string
      required: [true, "A tour must have a description"]
    },
    description: {
      type: String
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"]
    },
    images: [String], //used to signify and array of strings
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false // to hide a specific field in the schema
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

//Virtual Properties: properties added to the schema but not saved into the db
tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7; // this keyword refers to the model schema
});

//MONGOOSE MIDDLEWARE (PRE OR POST HOOKS)
/**
 * Used to make something happen between two events eg when a document is saved to the db (event)
 * a function can run between when the save command is issued and the actual saving (PRE HOOK- before event)
 * or after the actual saving (POST-HOOK, after the event)
 * 4 Types of middleware in Mongoose
 * - Document, Query, Aggregate and Model middleware
 */

/**
 * Document Middleware
 * middleware that can act on the currently processed document
 * runs before the .save() and .create() . DOesn't work for .insertMany() or update()
 */
tourSchema.pre("save", function (next) {
  //console.log(this); //this keyword refers to the currently processed document
  this.slug = slugify(this.name, { lower: true });
  next();
});

//post- hook function / middlewarethat triggers after the event
tourSchema.post("save", function (doc, next) {
  // console.log(doc); // refers to the document that has been saved into the database
  next();
});

/**
 * QUERY MIDDLEWARE
 * can run functions BEFORE a certain query is executed ie runs before the .find()
 * Processing queries and not documents
 */
// this only works for .find() and not findById, findOne, findAndUpdate etc. can use regex to make it work for any method that starts with find
// tourSchema.pre("find", function (next) {
tourSchema.pre(/^find/, function (next) {
  console.log(this); // the 'this' keyword here points to the current query object. as a query object, u can chain all the query methods to it
  this.start = Date.now();
  this.find({ secretTour: { $ne: true } }); //tours that aren't sectreTours
  next();
});

//Post event Query Middleware. Runs AFTER the query is executed. It therefore has access to all the documents returned from the query
tourSchema.post(/^find/, function (docs, next) {
  //console.log(docs); //doc refers to all the documents returned from the query execution
  console.log(
    `Query execution time is ${this.start - Date.now()} millisecinds`
  );
  next();
});

/**
 * AGGREGATION MIDDLEWARE
 * can add hooks before or after aggregation happens
 */
tourSchema.pre("aggregate", function (next) {
  // console.log(this) // refers to the current aggregation object and this.pipeline holds the aggregation array
  //to add an stage to the aggragation array before it gets executed
  this.pipeline.unshift({ match: { secretTour: { $ne: true } } });
});
// using schema as an argument, create the model
const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
