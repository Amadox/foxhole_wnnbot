"use strict";
const Discord = require('discord.js');
const logger = require('./src/logger.js');
const auth = require('./auth.json');
const config = require('./config.json');

const Warcorr = require('./src/warcorr.js');
let warcorr = new Warcorr();

/**
 * @type {Discord.Client}
 */
const client = new Discord.Client();

client.on('ready', () => {
    logger.info('Connected, Logged in as: ');
    logger.info(client.user.username + ' - (ID ' + client.user.id + ')');

    client.user.setPresence({
        game: {
            name: "Foxtrot"
        }
    });
    warcorr.setClient(client);
});

client.on('message', (message) => {
    if (message.content.substring(0, 1) === '!') {
        let args = message.content.substring(1).split(' ');
        const cmd = args[0];
        args = args.splice(1);

        switch(cmd) {
            case 'channelID':
                if(config.admins.indexOf(message.author.id) === -1) {
                    logger.info('Unauthorized Command: ' + message.content);
                    break;
                }
                if(message.guild) {
                    message.author.send(`The channel ID for '${message.channel.name}' on Server '${message.guild.name}' is ${message.channel.id}`);
                } else {
                    message.author.send(`Your private message channel ID is ${message.channel.id}`);
                }
                break;
        }
    }
});

client.login(auth.token);