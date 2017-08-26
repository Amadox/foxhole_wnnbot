const AmaBot = require('./src/amabot.js');
const logger = require('./src/logger.js');
const auth = require('./auth.json');
const config = require('./config.json');

// Initialize Discord Bot
const bot = new AmaBot({
   token: auth.token,
   autorun: true
}, config);
bot.init();
