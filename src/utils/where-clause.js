class WhereClause {
    constructor(baseModel, query) {
        this.baseModel = baseModel;
        this.query = query;
    }

    search() {
        const searchWord = this.query.search ? {
            name: {
                $regex: this.query.search,
                $options: "i",
            },
        } : {};

        this.baseModel = this.baseModel.find({ ...searchWord })
        return this;
    };

    pager(resultsPerPage) {
        const page = Number(this.query.page) || 1;
        const skipValue = (page - 1) * resultsPerPage;

        this.baseModel = this.baseModel.skip(skipValue).limit(resultsPerPage);
        return this;
    };

    filter() {
        const queryCopy = { ...this.query };

        delete queryCopy.search;
        delete queryCopy.page;
        delete queryCopy.limit;

        // Replace gte/lte with MongoDB operators
        const queryStr = JSON.stringify(queryCopy).replace(/\b(gte|lte)\b/g, (match) => `$${match}`);

        const filterQuery = JSON.parse(queryStr);

        this.baseModel = this.baseModel.find(filterQuery);
        return this;
    };
};

export { WhereClause };
