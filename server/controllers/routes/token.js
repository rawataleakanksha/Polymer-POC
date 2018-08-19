var request = require("request");

module.exports = function (req, res, next) {
    console.log("\n");
    console.log("__________ token.js__________");
    // console.log("______________________________");
    req.response = req.session.passport.user.ticket.access_token;
    next();
};