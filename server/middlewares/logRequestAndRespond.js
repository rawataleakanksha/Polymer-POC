let pJson = require('prettyjson');

module.exports = function (req, res, next) {
    console.log("\n");
    console.log(" __________LogRequestAndRespond.js__________");
    // console.log("__________________________________________________");
    console.log("url   : ", req.url);
    let response = req.response;
    //if router is present for the request, 'req' must have a 'response' element
    if (typeof response === "undefined") {
        next("404-invalid request(req.response not available)");
    } else {
        if (req.url !== "/getmytasks" && req.url !== "/getalltasks") {
            // console.log("req.response : ", pJson.render(response));
        }
        res.json(response);
    }
};