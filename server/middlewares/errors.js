var error = module.exports = {};
//
class AppError extends Error {
    constructor(args) {
        super();
        this.message = args.message;
        this.code = args.code;
        Error.captureStackTrace(this, AppError);
    }
}

AppError.prototype.name = "AppError";

class ValidationError extends AppError {
    constructor(args) {
        super(args);
        this.message = args.message;
        this.code = 400;
        this.invalidFields = args.invalidFields;
        Error.captureStackTrace(this, error.Error);
    }
}

ValidationError.prototype.name = "ValidationError";

error.AppError = AppError;
error.ValidationError = ValidationError;
