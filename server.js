//set up for the application and start up the server
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("./index");

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

//create a new instance of Tour in order to add a document into the collection
// const testTour = new Tour({
//   name: "Snow Stormer"
// });

// //save data as a new document
// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log("Didnt work!!!", err);
//   });

//console.log(process.env);

//to start server
const port = 3000;
app.listen(port, () => {
  console.log(`App running at sport ${port}`);
});
