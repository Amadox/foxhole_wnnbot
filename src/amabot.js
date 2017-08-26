"use strict";
const Discord = require('discord.io');
const logger = require('./logger.js');
const AmaBot_Warcorr = require('./amabot_warcorr.js');

module.exports = class AmaBot extends Discord.Client {

    constructor(options, config) {
        super(options);
        this.channelsDM = {};
        this.config = config;
        this.warcorr = new AmaBot_Warcorr(this);
    }

    init() {
        this.on('ready', (evt) => {
            logger.info('Connected, Logged in as: ');
            logger.info(this.username + ' - (' + this.id + ')');

            this.setPresence({
                idle_since: null,
                game: {
                    name: "Foxhole"
                }
            });
        });

        this.on('message', (user, userID, channelID, message, evt) => {
            // Our bot needs to know if it will execute a command
            // It will listen for messages that will start with `!`
            if (message.substring(0, 1) === '!') {
                this.processCommand(user, userID, channelID, message, evt);
             } else {
                this.processMessage(user, userID, channelID, message, evt);
             }
        });
    }

    processCommand(user, userID, channelID, message, evt) {

        let args = message.substring(1).split(' ');
        const cmd = args[0];

        args = args.splice(1);
        switch(cmd) {
            case 'channelID':
                if(this.config.admins.indexOf(userID) === -1) {
                    console.log('Unauthorized Command: ' + JSON.stringify(user, userID, channelID, message, evt));
                    break;
                }
                this.sendMessageToUser({
                    to: userID,
                    message: 'channelID is ' + channelID
                });
                return;
        }
    }

    processMessage(user, userID, channelID, message, evt) {
        if(this.config.readChannel === channelID) {
            try {
                this.warcorr.processMessage(message);
            } catch(err) {
                logger.error(err);
            }
        }
    }

    sendBroadcast(options) {
        options = options || {};
        if(!options.to || !options.to.length || !options.message) {
            return Promise.reject('no channelIDs or message given');
        }
        options.to.forEach((channelID) => {
            this.sendMessage({
                to: channelID,
                message: options.message,
            });
        });
    }

    sendMessageToUser(options) {
        options = options || {};
        if(!options.to || !options.message) {
            return Promise.reject('no userID or message given');
        }

        return this.getDMchannelID(options.to)
            .then((channelID) => {
                    this.sendMessage({
                        to: channelID,
                        message: options.message
                    })
                }
            );
    }

    getDMchannelID(userID) {
        return new Promise((resolve, reject) => {
            if(this.channelsDM && this.channelsDM[userID]) {
                resolve(this.channelsDM[userID]);
                return;
            }

            this.createDMChannel(userID, (error, response) => {
                if(error) {
                    logger.info('...error: ' + JSON.stringify(error));
                    reject(error);
                    return;
                }
                this.channelsDM[userID] = response.id;
                resolve(this.channelsDM[userID]);
            });
        });
    }
};
