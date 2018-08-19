var request = require("request");
var passportConfig = require('./../../passport-config');
var config = require('./../../predix-config');

module.exports = function (req, res, next) {
    req.session.destroy();
    req.logout();
    passportConfig.reset(); //reset auth tokens
    res.redirect(config.uaaURL +'/logout?redirect='+encodeURIComponent(process.env.ssoLogoutUrl+process.env.appUrl));
};