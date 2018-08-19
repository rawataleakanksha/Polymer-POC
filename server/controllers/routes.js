//all routes are defined here
let router = require("express").Router();

//will handle all the errors
let errorHandler = require("../middlewares/errorHandler");
//will log and send the JSON response
let logRequestAndRespond = require("../middlewares/logRequestAndRespond");

// console.log("inside routes");

router.get('/logout', require('./routes/logout'));
router.get('/favicon.ico', require('./routes/favicon'));
router.get('/token', require('./routes/token'));
router.get('/config', require('./routes/config'));
router.get('/getadhochistorydata', require('./routes/getAdhocHistoryData'));

router.use(logRequestAndRespond);

//error handling
router.use(errorHandler);

module.exports = router;