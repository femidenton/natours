class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // * BUILD QUERY. ensure that keywords like 'page', 'sort', 'limit' aren't included in the query object
    // 1A) Filtering
    //add the query string into a new object
    const queryObj = { ...this.queryString };
    const excludedFiles = ["page", "sort", "limit"];
    excludedFiles.forEach((el) => delete queryObj[el]);

    // 1B) Advanced Filtering ie greater than, less than filtering
    let queryStr = JSON.stringify(queryObj);
    // add the '$' to make it a mongodb query
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // // result of query is gotten synchronously (without using 'await') and stored so that pagination and sorting can be applied
    // // as soon as 'await' is used, the query is executed and come back with the documents that match the query.
    // //if done like this there would be no way to impelement pagination, sorting ect
    // // so its first stored into a Query (because Tour.find() returns a query) and can change all the methods to the query before 'await' can be applied to the query

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" "); // in the case of multiple sort parameters
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      console.log(JSON.stringify(fields));
      this.query = this.query.select("name price");
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit; // all the docs that come before the requested document ie one page 2 skip 10 results or on page 3, skip 20 and start on the 21
    //page 1 1-10; page 2 11-20; page 3 21-30
    this.query = this.query.skip(skip).limit(limit);
    if (this.queryString.page) {
      const numOfDocs = this.query.countDocuments();
      if (skip >= numOfDocs) {
        throw new Error("This page doesn't exist");
      }
    }
    return this;
  }
}

module.exports = ApiFeatures;
