const Discord = require('discord.js');
const logger = require('./logger.js');
const warcorrStats = require('./warcorr_stats.js');
const warcorrTownLost = require('./warcorr_townlost.js');
const warcorrTownTaken = require('./warcorr_towntaken.js');
const warcorrVictory = require('./warcorr_victory.js');
const config = require('../config.json');

module.exports = class Warcorr {

    constructor() {
        this.client = new Discord.Client();

        this.client.on('ready', () => {
            logger.info('Connected, Logged in as: ');
            logger.info(this.client.user.username + ' - (ID ' + this.client.user.id + ')');
        });

        this.client.on('message', (message) => {
            if(config.readChannel === message.channel.id) {
                try {
                    this.processMessage(message.content);
                } catch(err) {
                    logger.error(err);
                }
            }
        });
    }

    run(token) {
        this.client.login(token);
    }

    /**
     * @param {string} message
     */
    processMessage(message) {
        const regexBasic = /^\[([\w\d-\[\].=]*)? - ([\w\d' ]+)?\] (.*)?$/g;
        const matchesBasic = regexBasic.exec(message) || [];

        if(!matchesBasic) {
            logger.error('couldn\'t parse: ' + message);
            return;
        }

        const data = {
            'server': {
                'name': matchesBasic[1],
            },
            'map': {
                'name': matchesBasic[2]
            },
            'message': matchesBasic[3]
        };
        
        const regexStats = /^([\d,]+)? total enlistments, ([\d,]+)? Colonial casualties, ([\d,]+)? Warden casualties.$/g;
        const matchesStats = regexStats.exec(data.message);
        if(matchesStats) {
            logger.info('STATS: ' + message);
            data.type = 'stats';
            data.details = {
                'total_enlistments': parseInt(matchesStats[1].replace(',')),
                'casualties_colonials': parseInt(matchesStats[2].replace(',')),
                'casualties_wardens': parseInt(matchesStats[3].replace(',')),
            };
            warcorrStats.bind(this)(data);
            return;
        }
        
        const regexTownLost = /^The \*\*(\w+)?\*\* have lost \*\*([\w' ]+)?\*\*.$/g;
        const matchesTownLost = regexTownLost.exec(data.message);
        if(matchesTownLost) {
            logger.info('LOST:  ' + message);
            data.type = 'townlost';
            data.details = {
                'faction': matchesTownLost[1],
                'action': 'lost',
                'location': matchesTownLost[2]
            };
            warcorrTownLost.bind(this)(data);
            return;
        }
        
        const regexTownTaken = /^The \*\*(\w+)?\*\* have taken \*\*([\w' ]+)?\*\* and now have (\d+)? of (\d+)? towns.$/g;
        const matchesTownTaken = regexTownTaken.exec(data.message);
        if(matchesTownTaken) {
            logger.info('TAKEN: ' + message);
            data.type = 'towntaken';
            data.details = {
                'faction': matchesTownTaken[1],
                'action': 'taken',
                'location': matchesTownTaken[2],
                'towns_owned': matchesTownTaken[3],
                'towns_total': matchesTownTaken[4],
            };
            warcorrTownTaken.bind(this)(data);
            return;
        }
        
        const regexVictory = /^The \*\*(\w+)?\*\* have defeated the (\w+)?!$/g;
        const matchesVictory = regexVictory.exec(data.message);
        if(matchesVictory) {
            setTimeout(() => {
                logger.info('VCTRY: ' + message);
                data.type = 'victory';
                data.details = {
                    'winner': matchesVictory[1],
                    'loser': matchesVictory[2]
                };
                warcorrVictory.bind(this)(data);
            }, 2000);
            return;
        }

        logger.debug('UNKWN: ' + message);
    }

    broadcastForServer(serverName, message) {
        if(!this.client) return;
        let channels = this.getBroadcastChannels(serverName);
        if(channels.length) {
            channels.forEach((channelID) => {
                this.client.channels.get(channelID).send(message);
            });
        }
    }

    getBroadcastChannels(serverName) {
        let broadcastTo = [];
        broadcastTo = broadcastTo.concat(config.warCorr.writeChannels.all || []);

        for(let serverNamePart in config.warCorr.writeChannels.filtered.serverName) {
            if(config.warCorr.writeChannels.filtered.serverName.hasOwnProperty(serverNamePart)) {
                const channels = config.warCorr.writeChannels.filtered.serverName[serverNamePart];
                if(serverName.indexOf(serverNamePart) !== -1) {
                    broadcastTo = broadcastTo.concat(channels);
                }
            }
        }

        return broadcastTo;
    }
};