class ApiFeatures {
  constructor(query, reqQueryObj) {
    this.query = query;
    this.reqQueryObj = reqQueryObj;
  }

  filter() {
    const queryObj = { ...this.reqQueryObj };
    const excludedFields = ['limit', 'sort', 'fields', 'page'];
    excludedFields.forEach((field) => delete queryObj[field]);

    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gt|gte|lt|lte)\b/,
      (match) => `$${match}`
    );
    const filterObj = JSON.parse(queryString);

    this.query = this.query.find(filterObj);
    return this;
  }

  sort() {
    if (this.reqQueryObj.sort) {
      const sortBy = this.reqQueryObj.sort.replace(/,/g, ' ');
      this.query = this.query.sort(sortBy);
    } else {
      // this.query = this.query.sort('-createdAt');
      // this.query = this.query.sort('_id');
    }
    return this;
  }

  selectFields() {
    if (this.reqQueryObj.fields) {
      const fields = this.reqQueryObj.fields.replace(/,/g, ' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = Number(this.reqQueryObj.page) || 1;
    const limit = Number(this.reqQueryObj.limit) || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

export default ApiFeatures;
