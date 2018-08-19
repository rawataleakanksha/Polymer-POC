var request = require("request");
let pJson = require('prettyjson');
//let pJson = require('prettyjson');
const ALL_TASK = require('../../sample-data/score');

module.exports = function (req, res, next) {
    console.log("\n");
    console.log("__________ getAdhocHistory.js__________");
    // console.log("___________________________________");
    var options = {
        // method: 'GET',
        // url: process.env.classificationRequestUrl + '/getRequestList?requestorSso=' + req.user.details.user_name,
        // json: true
    };
  //  console.log("options.body : \n", pJson.render(options.body));
    // console.log("___________________________________");
 req.response = ALL_TASK;
     next();
    request(options, function (error, response, body) {
        if (error) {
            next(error);
        } else if (body) {
            let data = body || body.dataObj || body.data;
            let exception = body.exception;
            let err = body.error;
            if (data) {
                req.response = data;
                next();
            } else if (exception) {
                next(exception);
            } else if (err) {
                next(err);
            } else {
                next("600-data is empty.");
            }
        } else {
            next("600-body is empty");
        }
       
    });
};