class ApiFeatures {
    constructor(query, queryStr) {
        this.query = query
        this.queryStr = queryStr
    }

    search() {
        // Escape regex special characters so the keyword is matched literally
        const pattern = this.queryStr.keyword ? {
            $regex:String(this.queryStr.keyword).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            $options: "i"
        } : null

        // Search name and aliases
        const keyword = pattern ? { $or: [{ name: pattern }, { aliases: pattern }] } : {}

        this.query = this.query.find({...keyword})
        return this
    }

    filter() {
        const queryCopy = {...this.queryStr}

        const removeFields = ["keyword", "page", "limit"];
        removeFields.forEach(key=>delete queryCopy[key])

        // Strip any client-supplied "$" so only the operators below can be used
        let queryStr = JSON.stringify(queryCopy).replace(/\$/g, "")
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, 
            key => `$${key}`
        )
        this.query = this.query.find(JSON.parse(queryStr))
        return this
    }

    pagination(resultPerPage) {
        const currentPage = Number(this.queryStr.page) || 1

        const skip = resultPerPage * (currentPage - 1)
        this.query = this.query.limit(resultPerPage).skip(skip)

        return this
    }
}

module.exports = ApiFeatures