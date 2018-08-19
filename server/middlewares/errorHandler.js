'use strict';

let appErrors = require('./errors.js');
let pJson = require('prettyjson');
/*
 errors can be thrown by the app in a number of ways:

 1. next(String) : 'String' should be in form of 'status-msg' like '400-email not valid'
 2. next(new Error(String)): A new Error object is passed as argument with 'String' described above
 3. next(new errors.Error(opts)): A new custom error object defined in middlewares/errors file
 4. next(new sequelize error): error thrown by sequilize in promise's catch(e)

 */
module.exports = function (err, req, res, next) {
    console.log('\n');
    console.log(`Error occured for url: ${req.url} , status code: ${err.code || err.status},\nError: \n${pJson.render(err)}`);
    let parts;
    // http status code of the error to be respond with
    let status = 500;
    let isError = true;
    /*
     error JSON to be respond with
     fields of JSON:

     1. message: message for the error
     2. code (optional): error code,
     3. invalidFields (optional): in case of invalid input from the user,
     what fields are invalid with reason. e.g. {email:'invalid email format', name:'can't be blank' }
     */

    let errorJson = {
        message: 'Some error occurred'
    };

    if (err === 'invalid_token') {
        status = 400;
        errorJson.message = 'Invalid Token';
        //todo remove below code
        // return;
    } else if (err instanceof appErrors.ValidationError) {
        status = 400;
        errorJson.message = err.message;
        errorJson.invalidFields = err.invalidFields;
    } else if (err instanceof appErrors.AppError) {
        status = 500;
        errorJson = err;
    } else if (err instanceof Error) {
        if (err.message.indexOf('-') === 3) {
            parts = err.message.split('-');
            status = +parts[0];
            errorJson.message = parts.splice(1).join('-');
            if (status === '600') {
                errorJson.message = 'Server Error';
                status = 400;
            }
        } else if (err.code === 'ECONNRESET') {
            status = 400;
            errorJson.message = 'ECONNRESET ' + err.message;
        } else {
            status = 400;
            errorJson.message = err.message || 'Undefined internal server error';
        }
    } else if (typeof err === 'string') {
        parts = err.split('-');

        if (parts.length > 1) {
            status = +parts[0];
            errorJson.message = parts.splice(1).join('-');
            if (status == '600') {
                errorJson.message = 'No Data';
                status = 400;
            }
        } else {
            errorJson.message = err;
        }
    } else {
        status = err.status || 500;
        errorJson.message = err.message || 'Undefined error';
    }

    if (status === 500) {
        errorJson.message = 'Some internal error occurred!';
    }
    req.response = {
        status,
        errorJson,
        isError
    }
    res.json(req.response);
};


function convertValidationError(errorObject) {
    let errorObjectToReturn = {
        message: 'multiple fields have invalid input, please check',
        invalidFields: {}
    };

    if (errorObject.errors.length === 1) {
        errorObjectToReturn.message = errorObject.errors[0].message;
    }

    errorObject.errors.forEach(function (error) {
        errorObjectToReturn.invalidFields[error.path] = error.message;
    });

    return errorObjectToReturn;
}