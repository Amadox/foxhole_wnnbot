const Discord = require('discord.js');
const logger = require('./logger.js');
const warcorrStats = require('./warcorr_stats.js');
const warcorrTownLost = require('./warcorr_townlost.js');
const warcorrTownTaken = require('./warcorr_towntaken.js');
const warcorrVictory = require('./warcorr_victory.js');

const warcorrServerRepository = require('./model/warcorr_server.js');
const warcorrMapRepository = require('./model/warcorr_map.js');
const warcorrMessageRepository = require('./model/warcorr_message.js');

module.exports = class Warcorr {

    constructor(config) {
        this.client = new Discord.Client();
        this.config = config;

        this.client.on('ready', () => {
            logger.info('Connected, Logged in as: ');
            logger.info(this.client.user.username + ' - (ID ' + this.client.user.id + ')');
        });

        this.client.on('message', (message) => {
            if(this.config.readChannel === message.channel.id) {
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
    processMessage(originalMessage) {
        const regexBasic = /^\[([\w\d-\[\].=]*)? - ([\w\d' ]+)?\] (.*)?$/g;
        const matchesBasic = regexBasic.exec(originalMessage) || [];

        if(!matchesBasic) {
            logger.error('couldn\'t parse: ' + originalMessage);
            return;
        }

        const data = {
            'date': new Date(),
            'server': {
                'name': matchesBasic[1],
            },
            'map': {
                'name': matchesBasic[2]
            },
            'message': {
                'content': matchesBasic[3]
            }
        };

        Promise.all([
            warcorrServerRepository.create(data.server),
            warcorrMapRepository.create(data.map),
        ]).then(([server, map]) => {
            data.server = server;
            data.map = map;

            const msgObject = {
                'date': data.date,
                'uid_server': data.server.uid,
                'uid_map': data.map.uid,
                'content': data.message.content,
            };

            const regexStats = /^([\d,]+)? total enlistments, ([\d,]+)? Colonial casualties, ([\d,]+)? Warden casualties.$/g;
            const matchesStats = regexStats.exec(data.message.content);
            if(matchesStats) {
                warcorrMessageRepository.create(msgObject).then((msg) => {
                    data.message = msg;
                    logger.info('STATS: ' + originalMessage);
                    data.type = 'stats';
                    data.details = {
                        'total_enlistments': parseInt(matchesStats[1].replace(',')),
                        'casualties_colonials': parseInt(matchesStats[2].replace(',')),
                        'casualties_wardens': parseInt(matchesStats[3].replace(',')),
                    };
                    warcorrStats.bind(this)(data);
                }, (err) => {
                    logger.error(err);
                });
                return;
            }

            const regexTownLost = /^The \*\*(\w+)?\*\* have lost \*\*([\w' ]+)?\*\*.$/g;
            const matchesTownLost = regexTownLost.exec(data.message.content);
            if(matchesTownLost) {
                warcorrMessageRepository.create(msgObject).then((msg) => {
                    data.message = msg;
                    logger.info('LOST:  ' + originalMessage);
                    data.type = 'townlost';
                    data.details = {
                        'faction': matchesTownLost[1],
                        'action': 'lost',
                        'location': matchesTownLost[2]
                    };
                    warcorrTownLost.bind(this)(data);
                }, (err) => {
                    logger.error(err);
                });
                return;
            }

            const regexTownTaken = /^The \*\*(\w+)?\*\* have taken \*\*([\w' ]+)?\*\* and now have (\d+)? of (\d+)? towns.$/g;
            const matchesTownTaken = regexTownTaken.exec(data.message.content);
            if(matchesTownTaken) {
                warcorrMessageRepository.create(msgObject).then((msg) => {
                    data.message = msg;
                    logger.info('TAKEN: ' + originalMessage);
                    data.type = 'towntaken';
                    data.details = {
                        'faction': matchesTownTaken[1],
                        'action': 'taken',
                        'location': matchesTownTaken[2],
                        'towns_owned': matchesTownTaken[3],
                        'towns_total': matchesTownTaken[4],
                    };
                    warcorrTownTaken.bind(this)(data);
                }, (err) => {
                    logger.error(err);
                });
                return;
            }

            const regexVictory = /^The \*\*(\w+)?\*\* have defeated the (\w+)?!$/g;
            const matchesVictory = regexVictory.exec(data.message.content);
            if(matchesVictory) {
                setTimeout(() => {
                    warcorrMessageRepository.create(msgObject).then((msg) => {
                        data.message = msg;
                        logger.info('VCTRY: ' + originalMessage);
                        data.type = 'victory';
                        data.details = {
                            'faction_winner': matchesVictory[1],
                            'faction_loser': matchesVictory[2]
                        };
                        warcorrVictory.bind(this)(data);
                    }, (err) => {
                        logger.error(err);
                    });
                }, 2000);
                return;
            }

            logger.debug('UNKWN: ' + originalMessage);

        }, (err) => {
            logger.error(err);
        });
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
        broadcastTo = broadcastTo.concat(this.config.warCorr.writeChannels.all || []);

        for(let serverNamePart in this.config.warCorr.writeChannels.filtered.serverName) {
            if(this.config.warCorr.writeChannels.filtered.serverName.hasOwnProperty(serverNamePart)) {
                const channels = this.config.warCorr.writeChannels.filtered.serverName[serverNamePart];
                if(serverName.indexOf(serverNamePart) !== -1) {
                    broadcastTo = broadcastTo.concat(channels);
                }
            }
        }

        return broadcastTo;
    }
};
