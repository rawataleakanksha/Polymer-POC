var request = require("request");
let pJson = require('prettyjson');
let USER_INFO = require('../../sample-data/UserInfo');

module.exports = function (req, res, next) {
    console.log("\n");
    console.log("__________ getUserInfo.js__________");
    // console.log("___________________________________");
    if (req.session.userInfo === null || req.session.userInfo === undefined) {
        // console.log("fetching from server...");
        var options = {
            method: 'POST',
            url: process.env.activitiServiceUrl + '/userInfo',
            headers: {
                "Authorization": "bearer " + req.session.passport.user.ticket.access_token
            },
            body: {
                auth: {
                    user: req.user.details.user_name,
                    processDefinitionKey: 'ClassificationApplication',
                    taskDefinitionKey: 'approver'
                },
                data: null,
            },
            json: true
        };
        // console.log("options.body : \n", pJson.render(options.body));
        // console.log("___________________________________");
        //todo remove this 
        // req.response = USER_INFO.dataObj;
        // next();
        request(options, function (error, response, body) {
            if (error) {
                next(error);
            } else if (body) {
                let data = body.dataObj || body.data;
                let exception = body.exception;
                let err = body.error;
                if (data) {
                    if (data.length == 1) {
                        req.session.userInfo = data[0];
                        req.response = data[0];
                        next();
                    } else {
                        next("600-data is empty.");
                    }
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
    } else {
        // console.log("fetching from session...");
        if (req.session.userInfo) {
            req.response = (req.session.userInfo);
            next();
        } else {
            next("600-UserInfo not found in session.");
        }
    }
};