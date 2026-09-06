class API_Error extends Error {
    constructor(statusCode, message, errors=[], stack="") {
        super(message);
        this.statusCode = statusCode;
        this.errors= errors;
        this.success= false;
        this.data = null;
        this.isOperational = true;
        this.stack = stack ? stack : Error.captureStackTrace(this, this.constructor);
    };

    static badRequest(message="Bad request") {
        return new API_Error(400, message);
    };

    static unauthorized(message="Unauthorized") {
        return new API_Error(401, message);
    };

    static conflict(message="Conflict") {
        return new API_Error(409, message);
    };

    static forbidden(message="Forbidden") {
        return new API_Error(412, message);
    };

    static notFound(message="Not found") {
        return new API_Error(404, message);
    };

    static internalServerError(message="Internal Server Error") {
        return new API_Error(500, message);
    };
};

export { API_Error };
