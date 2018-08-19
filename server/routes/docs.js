const path = require('path');
const url = require('url');
const proxy = require('./proxy');

module.exports = (predixConfig) => {
    if (predixConfig.isTimeSeriesConfigured()) {
        //  
        return proxy.customProxyMiddleware('/docs', predixConfig.rmdDocsURL, url.parse(predixConfig.rmdDocsURL).path);
    } else {    
        return (req, res, next) => {
            req.url = path.join(req.url, '/ABOUT.md');
            //  
            next();
        };
    }
};
