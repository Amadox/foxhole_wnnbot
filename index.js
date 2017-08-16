const AmaBot = require('./amabot.js');
const logger = require('winston');
const auth = require('./auth.json');
const config = require('./config.json');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
const bot = new AmaBot({
   token: auth.token,
   autorun: true
}, config);
bot.init();
