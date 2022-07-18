//script to populate the collection (db)

//set up for the application and start up the server
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const Tour = require("../../models/tourModel");

//File only needs to be read once, therefore no need to define it in the express app file(index.js)
dotenv.config({ path: "./config.env" });

//get DB connection string from config.env as an environment variable
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

//connect to db using mongoose
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true
  })
  .then((con) => {
    // console.log(con);
    console.log("DB Connection succesful");
  });

//read file to be imported
//change from JSON to a JS object
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, "utf-8")
);

//function to import data into db
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log("DB import successful");
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

//function to delete data
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log("DB delete successful");
    process.exit();
  } catch (err) {
    console.log("DB delete NOT successful");
  }
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
