"use strict";
const auth = require('./auth.json');

const Warcorr = require('./src/warcorr.js');
const warcorr = new Warcorr();
warcorr.run(auth.token);
