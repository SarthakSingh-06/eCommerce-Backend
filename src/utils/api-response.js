class API_Response {
    constructor(statusCode, data, message="success") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = true;
    };

    static ok(res, message, data=null) {
        return res
            .status(200)
            .json({
                success: true,
                message, data
            });
    };

    static created(res, message, data=null) {
        return res
            .status(201)
            .json({
                success: true,
                message, data
            });
    };

    static noContent(res) {
        return res
            .status(204)
            .send();
    };
};

export { API_Response };
