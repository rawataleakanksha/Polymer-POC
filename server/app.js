/*******************************************************
The predix-webapp-starter Express web application includes these features:
  * routes to mock data files to demonstrate the UI
  * passport-predix-oauth for authentication, and a sample secure route
  * a proxy module for calling Predix services such as asset and time series
*******************************************************/
'use strict';
let http = require('http'); // needed to integrate with ws package for mock web socket server.
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser'); // used for session cookie
let bodyParser = require('body-parser');
let passport; // only used if you have configured properties for UAA
let session = require('express-session');
let proxy = require('./routes/proxy'); // used when requesting data from real services.
// get config settings from local file or VCAPS env let in the cloud
let config = require('./predix-config');
// configure passport for authentication with UAA
let passportConfig = require('./passport-config');
// getting user information from UAA
let userInfo = require('./routes/user-info');
let sanitizer = require('sanitizer');
let app = express();

let httpServer = http.createServer(app);

let request = require('request');
//let fileUpload = require('express-fileupload');

let developmentToken = "eyJhbGciOiJSUzI1NiIsImtpZCI6ImxlZ2FjeS10b2tlbi1rZXkiLCJ0eXAiOiJKV1QifQ.eyJqdGkiOiIxMmM5NjBmNmRhNDM0N2E1YmVkNzQzZjRmNjM1YTFmMSIsInN1YiI6IjgxZjRjNGRmLThmOGQtNDY0MS04NWIyLTg3M2FkMGNhOGYxOSIsInNjb3BlIjpbImcwMTIxNTU1MyIsIm9wZW5pZCIsImcwMTIzMzA5NSIsImcwMTIwNDk1OSJdLCJjbGllbnRfaWQiOiJkaWdpdGFsX2lwYV9hY3Rpdml0aV9jbGllbnRfZGV2X3Byb2QiLCJjaWQiOiJkaWdpdGFsX2lwYV9hY3Rpdml0aV9jbGllbnRfZGV2X3Byb2QiLCJhenAiOiJkaWdpdGFsX2lwYV9hY3Rpdml0aV9jbGllbnRfZGV2X3Byb2QiLCJncmFudF90eXBlIjoiYXV0aG9yaXphdGlvbl9jb2RlIiwidXNlcl9pZCI6IjgxZjRjNGRmLThmOGQtNDY0MS04NWIyLTg3M2FkMGNhOGYxOSIsIm9yaWdpbiI6ImdlLXNzby1ncm91cHMiLCJ1c2VyX25hbWUiOiI1MDI3NjkxNjciLCJlbWFpbCI6ImFrYW5rc2hhLnJhd2F0YWxlQGdlLmNvbSIsImF1dGhfdGltZSI6MTUzMzkwMDg5MSwicmV2X3NpZyI6IjhmMWFiMDJiIiwiaWF0IjoxNTMzOTAwODkyLCJleHAiOjE1MzM5MDgwOTEsImlzcyI6Imh0dHBzOi8vYThhMmZmYzQtYjA0ZS00ZWMxLWJmZWQtN2E1MWRkNDA4NzI1LnByZWRpeC11YWEucnVuLmF3cy11c3cwMi1wci5pY2UucHJlZGl4LmlvL29hdXRoL3Rva2VuIiwiemlkIjoiYThhMmZmYzQtYjA0ZS00ZWMxLWJmZWQtN2E1MWRkNDA4NzI1IiwiYXVkIjpbImRpZ2l0YWxfaXBhX2FjdGl2aXRpX2NsaWVudF9kZXZfcHJvZCIsIm9wZW5pZCJdfQ.jA8Le8KjRESS0Zqk6NI9QZA71vicoLHfkFYj0NHppRq8aq_Y5FItR4_zudaGwSmDZ7qjQP-u7RpavefAvD4yK3YdwngpkTVT6WEzg8qEF26Nw2tjH-Jqm-6C0I_01Bm5k9EiEJEmJ8FWcb-6zuvK_9wDA2XWIngCQNE1bgCKMF-7ZY1X5laBWmVDMMAlZit3Z2E79-31MF51bo6U3pmp-IMuYahmq935GoFCnY-W9aqxxXiozY3lyPByZzduVdbcE8rWJlb6Kqlh1viobuYgW0oHAOHNaA3DREoPeDAPOZ9p3B7prvA-Cq9nGqCdCeHGMcQoB4WMuU7bCiCGxeuymA";

let developmentUser = '502769167'; // SSO Akanksha
//let developmentUser = '503045924'; // SSO Prijil
//let developmentUser = '502770478'; // SSO Manohar
//let developmentUser = '502776264';//SSO Yasir
//let developmentUser = '502744868' //SSO Prachi
let developmentUserEmail = 'prachi.joglekar@ge.com'
//let developmentUserEmail = 'manohar.kumar@ge.com'
// let developmentUserEmail = 'akanksha.rawatale@ge.com'

//for outside rest api calls
// let Client = require('node-rest-client').Client;
/**********************************************************************
       SETTING UP EXRESS SERVER
***********************************************************************/
app.set('trust proxy', 1);
// if running locally, we need to set up the proxy from local config file:
let nodeEnv = process.env.node_env || 'development';
console.log('************ Environment: ' + nodeEnv + '******************');
let ENCRYPTION_KEY;
if (nodeEnv === 'development') {
    let devConfig = require('./localConfig.json')[nodeEnv];
    proxy.setServiceConfig(config.buildVcapObjectFromLocalConfig(devConfig));
    proxy.setUaaConfig(devConfig);
    ENCRYPTION_KEY = sanitizer.sanitize(devConfig.ENCRYPTION_KEY);
} else {
    app.use(require('compression')())
    ENCRYPTION_KEY = sanitizer.sanitize(process.env.ENCRYPTION_KEY); // gzip compression
}
// Session Storage Configuration:
// *** Use this in-memory session store for development only. Use redis for prod. **
let sessionOptions = {
    secret: ENCRYPTION_KEY,
    name: 'cookie_name',
    // give a custom name for your cookie here
    maxAge: 30 * 60 * 1000,
    // expire token after 30 min.
    proxy: true,
    resave: true,
    saveUninitialized: true
    // cookie: {secure: true} // secure cookie is preferred, but not possible in some clouds.
};
app.use(cookieParser(ENCRYPTION_KEY));
app.use(session(sessionOptions));

Array.prototype.contains = function (element) {
    return this.indexOf(element) > -1;
};
console.log('UAA is configured?', config.isUaaConfigured());
if (config.isUaaConfigured()) {
    passport = passportConfig.configurePassportStrategy(config);
    app.use(passport.initialize());
    // Also use passport.session() middleware, to support persistent login sessions (recommended).
    app.use(passport.session());
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
//app.use(fileUpload());
app.use(function (req, res, next) {
    // console.log('NEW REQUEST    : ', '[' + req.method + ']', req.url);
    // console.log('WITH PARAMETERS: ', req.body);
    // console.log('WITH HEADERS   : ', req.headers);

    if (nodeEnv === 'development') {
        // console.log('INSIDE DEVELOPMENT');
        req.session.passport = {
            user: {
                ticket: {
                    access_token: developmentToken
                }
            }
        }

        req.user = {
            details: {
                user_name: developmentUser,
                user_email: developmentUserEmail
            }
        }

         process.env.activitiServiceUrl = 'https://ipa-activiti-server-dev.run.aws-usw02-pr.ice.predix.io';
      //  process.env.activitiServiceUrl = 'https://digital-ipa-server.run.aws-usw02-pr.ice.predix.io';
        process.env.activitiUtilUrl = 'https://ipa-activiti-util-dev.run.aws-usw02-pr.ice.predix.io';
        process.env.classificationRequestUrl = 'https://ice-classification-request-dev.run.aws-usw02-pr.ice.predix.io';
        process.env.activitiDataLoad= 'https://ipa-activiti-data-load-dev.run.aws-usw02-pr.ice.predix.io'
        req.session.passport.user.ticket.access_token = developmentToken;
        req.user.details.user_name = developmentUser;
        req.user.details.user_email = developmentUserEmail;
    }
    next();
});

if (!config.isUaaConfigured()) {
    // no restrictions
    app.use(express.static(path.join(__dirname, process.env['base-dir'] ? process.env['base-dir'] : '../public')));

    // mock UAA routes
    app.get(['/login', '/logout'], function (req, res) {
        res.redirect('/');
    })

    app.get('/userinfo', function (req, res) {
        let user = req.user;
        //  console.log('USER DETAILS___________________________',user);
        if (user !== null && user !== undefined) {

            res.send({
                user_name: user.details.user_name,

            });
            console.log('USER DETAILS___________________________', user);
        }
    });

} else {

    //login route redirect to predix uaa login page
    app.get('/login', passport.authenticate('predix', {
        'scope': ''
    }), function (req, res) {
        // The request will be redirected to Predix for authentication, so this
        // function will not be called.
    });

    // route to fetch user info from UAA for use in the browser
    app.get('/userinfo', userInfo(config.uaaURL), function (req, res) {
        let user = req.user;
        if (user !== null && user !== undefined) {
            res.send(user.details);
        }
    });
    // access real Predix services using this route.
    // the proxy will add UAA token and Predix Zone ID.
    app.use(['/predix-api', '/api'],
        passport.authenticate('main', {
            noredirect: true
        }),
        proxy.router);


    //callback route redirects to secure route after login
    app.get('/logout',
        function (req, res) {
            console.log("inside logout");
            req.session.destroy();
            req.logout();
            passportConfig.reset(); //reset auth tokens
            res.redirect(config.uaaURL + '/logout?redirect=' + encodeURIComponent(process.env.ssoLogoutUrl + process.env.appUrl));
            // res.redirect(process.env.appUrl);
        });
    //callback route redirects to secure route after login
    app.get('/callback',
        passport.authenticate('predix', {
            failureRedirect: '/'
        }),
        function (req, res) {
            res.redirect('/');
        });
    // example of calling a custom microservice.
    app.use('/',
        passport.authenticate('main', {
            //noredirect: false //Don't redirect a user to the authentication page, just show an error
            failureRedirect: '/logout' //fixes for auth tocken expiration
        }),
        function (req, res, next) {
            if (req.session.userscope === undefined) {
                let options = {
                    method: 'POST',
                    url: process.env.uaaUrl + '/check_token',
                    form: {
                        token: req.session.passport.user.ticket.access_token
                    },
                    headers: {
                        'Authorization': 'Basic ' + process.env.base64ClientCredential
                    }
                };
                request(options, function (err, response, body) {
                    if (!err && response.statusCode == 200) {
                        let resp = JSON.parse(body);
                        req.session.userscope = resp.scope;
                        next();
                    } else {
                        res.send('<h2>User not authorized to access Activiti Application</h2>');
                        next();
                    }
                });
            } else {
                next();
            }
        },
        function (req, res, next) {

            if (req.session.userscope.contains(process.env.activitiUserScope)) {
                next();
            } else {
                next();
                // res.send('<h2>User not authorized to access Activiti Application 2nd else</h2>');
            }
        },
        express.static(path.join(__dirname, process.env['base-dir'] ? process.env['base-dir'] : '../public'))

    );
    app.get('/token', passport.authenticate('main', {
        noredirect: true
    }), function (req, res, next) {
        req.response = JSON.stringify(req.session.passport.user.ticket.access_token);
        next();
    });
}

//all control goes to routes.js
app.use('/', require('./controllers/routes.js'));

httpServer.listen(process.env.VCAP_APP_PORT || 5000, function () {
    console.log('Server started on port: ' + httpServer.address().port);
});

// for other common APIs like 'contact us' etc.
module.exports = app;