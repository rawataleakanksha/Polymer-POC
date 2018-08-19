let request = require("request");
let pJson = require('prettyjson');

let USER_INFO = require('../../sample-data/UserInfo');

module.exports = function (req, res, next) {
    console.log("\n");
    console.log("__________ config.js__________");
    // console.log("______________________________");
    let title = "Intelligent Classification Engine";
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
    // console.log("______________________________");
    // //todo remove this 
    // req.response = {
    //     appHeader: title,
    //     userInfo: USER_INFO.dataObj[0]
    // }
    // next();
    request(options, function (error, response, body) {
        if (error) {
            next(error);
        } else if (body) {
            let userInfo = {};
            let data = body.dataObj || body.data;
            let exception = body.exception;
            let err = body.error;
            if (data && data.length > 0) {
                userInfo = data[0];
                req.session.userInfo = data[0];
                req.userInfo = userInfo;

                req.response = {
                    appHeader: title,
                    userInfo: userInfo
                };
                next();
            } else if (exception) {
                next(exception);
            } else if (err) {
                next(err);
            } else {
                next("400-data is empty.");
            }
        } else {
            next("400-body is empty.");
        }
    });
};