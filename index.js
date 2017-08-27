"use strict";
const auth = require('./auth.json');
const config = require('./config.json');
const logger = require('./src/logger.js');

const initdb = require('./src/db.js');
try {
    initdb();
} catch(err) {
    logger.error(err);
}

const Warcorr = require('./src/warcorr.js');
const warcorr = new Warcorr(config);
warcorr.run(auth.token);
