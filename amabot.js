"use strict";
const Discord = require('discord.io');
const logger = require('winston');
const low = require('lowdb');
const warcorrHistory = low('data/warcorr/history.json');
const warcorrServers = low('data/warcorr/servers.json');
const warcorrVictories = low('data/warcorr/victories.json');

module.exports = class AmaBot extends Discord.Client {

    constructor(options, config) {
        super(options);
        this.channelsDM = {};
        this.config = config;

        warcorrHistory.defaults({history: []}).write();
        warcorrServers.defaults({}).write();
        warcorrVictories.defaults({victories: []}).write();
    }

    init() {
        this.on('ready', (evt) => {
            logger.info('Connected');
            logger.info('Logged in as: ');
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
            if (message.substring(0, 1) == '!') {
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
            case 'serverJson': {
                if(this.config.admins.indexOf(userID) === -1) {
                    console.log('Unauthorized Command: ' + JSON.stringify(user, userID, channelID, message, evt));
                    break;
                }
                try {
                    let status = warcorrServers.get(args[0]).value();
                    delete status.history;
                    delete status.changes;
                    this.sendMessageToUser({
                        to: userID,
                        message: '```json\n'+JSON.stringify(status, null, 2)+'\n```'
                    });
                    return;
                } catch(err) {
                    logger.info(JSON.stringify(err));
                }
            }
        }
    }

    processMessage(user, userID, channelID, message, evt) {
        if(this.config.channelIDs.read === channelID) {
            this.processWarCorrespondence(message);
            return;
        }
    }

    processWarCorrespondence(message) {
        // hotfix because of wrongly reported server name:
        message = message.replace("Sledge-EU", "Sledge-GERMANY");

        const servernameSep = message.indexOf(" - ");
        const mapSep = message.indexOf('] ');

        const serverName = message.slice(1, servernameSep);
        const mapName = message.slice(servernameSep+3, mapSep);

        const text = message.slice(mapSep+2);

        const totalEnlistSep = text.indexOf(" total enlistments, ");
        const colonialCasualtiesSep = text.indexOf(" Colonial casualties, ");
        const wardenCasualtiesSep = text.indexOf(" Warden casualties.");

        const factionSep1 = text.indexOf('The **');

        const townSepLost1 = text.indexOf('** have lost **');
        const townSepLost2 = text.indexOf('**.');

        const townSepTaken1 = text.indexOf('** have taken **');
        const townSepTaken2 = text.indexOf('** and now have ');
        const townSepTaken3 = text.indexOf(' towns.');

        const defeatSep = text.indexOf('** have defeated the ');

        const data = {
            date: new Date(),
            server: serverName,
            map: mapName,
            msg: text,
        };

        let serverVal = warcorrServers.get(serverName).value();
        if(!serverVal) {
            warcorrServers.set(serverName+'.map', '').write();
            warcorrServers.set(serverName+'.lastUpdate', '').write();
            warcorrServers.set(serverName+'.stats', {}).write();
            warcorrServers.set(serverName+'.changes', []).write();
            warcorrServers.set(serverName+'.history', []).write();
            warcorrServers.set(serverName+'.score.Wardens', 1).write();
            warcorrServers.set(serverName+'.score.Colonials', 1).write();
        }
        warcorrServers.set(serverName+'.map', mapName).write();
        warcorrServers.set(serverName+'.lastUpdate', data.date).write();

        if(totalEnlistSep !== -1 && colonialCasualtiesSep !== -1 && wardenCasualtiesSep !== -1) {
            // [Carbine-ASIA - Weathered Expanse] 145 total enlistments, 35 Colonial casualties, 89 Warden casualties.
            logger.info('STATS: ' + message);

            const totalEnlistments = parseInt(text.slice(0, totalEnlistSep).replace(',', ''));
            const casultiesColonials = parseInt(text.slice(totalEnlistSep + 20, colonialCasualtiesSep).replace(',', ''));
            const casultiesWardens = parseInt(text.slice(colonialCasualtiesSep + 22, wardenCasualtiesSep).replace(',', ''));

            data.stats = {
                totalEnlistments: totalEnlistments,
                casultiesColonials: casultiesColonials,
                casultiesWardens: casultiesWardens,
            };

            warcorrServers.set(serverName+'.stats', data.stats).write();
            warcorrHistory.get('history').push(data).write();
            warcorrServers.get(serverName+'.history').push(data).write();

        } else if(factionSep1 !== -1 && townSepLost1 !== -1 && townSepLost2 !== -1) {
            // [Barracks - Endless Shore] The **Colonials** have lost **Enduring Post**.
            logger.info('LOST:  ' + message);
            const factionName = text.slice(factionSep1 + 6, townSepLost1);
            const townName = text.slice(townSepLost1 + 15, townSepLost2);
            data.change = {
                town: townName,
                from: factionName,
                to: 'neutral',
            };

            const wardenPropaganda = {
                Wardens: [
                    'The colonial scum has invaded **{townName}**. Stop them before they can fortify their position!',
                    '**{townName}** has been taken from us. We need to recapture it!',
                    'Bad news: We lost **{townName}** to the colonial invaders.',
                ],
                Colonials: [
                    'We have gloriously freed **{townName}** from colonial oppression. Time to rebuild!',
                    '**{townName}** is no longer in the enemy\'s hands. We need to secure it!',
                    'The colonials are running away from us at **{townName}** with their tails tugged between their legs.',
                ]
            };

            const factionMessages = wardenPropaganda[factionName] || [];
            let randomMessage = factionMessages[Math.floor(Math.random()*factionMessages.length)];
            randomMessage = randomMessage.replace('{townName}', townName);

            let broadcastMessage = message;
            if(randomMessage) {
                data.wardenPropaganda = randomMessage;
                broadcastMessage = `[${serverName} - ${mapName}] ${randomMessage}`;
            }

            let channels = this.getBroadcastChannels(serverName);
            if(channels.length) {
                this.sendBroadcast({
                    to: channels,
                    message: broadcastMessage
                });
            }

            warcorrServers.get(serverName+'.changes').push({
                date: data.date,
                town: townName,
                from: factionName,
                to: 'neutral',
            }).write();


            const score = warcorrServers.get(serverName+'.score.'+factionName);
            if(score) {
                warcorrServers.set(serverName+'.score.'+factionName, score - 1).write();
            }

            warcorrHistory.get('history').push(data).write();
            warcorrServers.get(serverName+'.history').push(data).write();

        } else if(factionSep1 !== -1 && townSepTaken1 !== -1 && townSepTaken2 !== -1 && townSepTaken3 !== -1) {
            // [Fox4 - Deadlands] The **Colonials** have taken **The Spine** and now have 8 of 10 towns.
            logger.info('TAKEN: ' + message);
            const factionName = text.slice(factionSep1 + 6, townSepTaken1);
            const townName = text.slice(townSepTaken1 + 16, townSepTaken2);
            const status = text.slice(townSepTaken2 + 16, townSepTaken3);
            const score = status.slice(0, status.indexOf(" of"));

            data.change = {
                town: townName,
                from: 'neutral',
                to: factionName,
            };

            const wardenPropaganda = {
                Wardens: [
                    'We have now secured **{townName}**. The civilian population sighs with relief.',
                    '**{townName}** is now firmly in our hands. March on, brothers!',
                    'Civilians cheer as we fortify **{townName}** against colonial attacks.',
                ],
                Colonials: [
                    'The enemy has brutally taken control over **{townName}**',
                    '**{townName}** has fallen into enemy hands. We need to free it!',
                    'The Colonial Invaders have started to fortify **{townName}**. Pray for the local population...',
                ]
            };

            const factionMessages = wardenPropaganda[factionName] || [];
            let randomMessage = factionMessages[Math.floor(Math.random()*factionMessages.length)];
            randomMessage = randomMessage.replace('{townName}', townName);

            let broadcastMessage = message;
            if(randomMessage) {
                data.wardenPropaganda = randomMessage;
                broadcastMessage = `[${serverName} - ${mapName}] ${randomMessage} (${status})`;
            }

            let channels = this.getBroadcastChannels(serverName);
            if(channels.length) {
                this.sendBroadcast({
                    to: channels,
                    message: broadcastMessage
                });
            }

            warcorrServers.set(serverName+'.score.'+factionName, score).write();
            warcorrServers.get(serverName+'.changes').push({
                date: data.date,
                town: townName,
                from: 'neutral',
                to: factionName,
            }).write();
            warcorrHistory.get('history').push(data).write();
            warcorrServers.get(serverName+'.history').push(data).write();

        } else if(factionSep1 !== -1 && defeatSep !== -1) {
            // [Barracks - Endless Shore] The **Wardens** have defeated the Colonials!
            logger.info('VCTRY: ' + message);
            const winnerName = text.slice(factionSep1 + 6, defeatSep);
            const loserName = text.slice(defeatSep + 21, -1);
            data.winner = winnerName;
            data.loser = loserName;

            const victory = {
                date: data.date,
                server: serverName,
                map: mapName,
                winner: winnerName,
            };

            const wardenPropaganda = {
                Wardens: [
                    '**Victory**! We\'ve successfully defended {{mapName}} against the colonial invasion!',
                    'We have achieved **victory** over the colonial scum. Glory to the Wardens!',
                    'Another glorious **victory** has been achieved! Long live the Warden Empire!',
                ],
                Colonials: [
                    'All of {{mapName}} has fallen into enemy hands. We suffered a tragic **defeat**.',
                    'We might have suffered **defeat** this time, but we will not lose the war.',
                    'The population of {{mapName}} shudders in terror as the colonial invaders **defeat** us.',
                ]
            };

            const factionMessages = wardenPropaganda[winnerName] || [];
            let randomMessage = factionMessages[Math.floor(Math.random()*factionMessages.length)];
            randomMessage = randomMessage.replace('{mapName}', mapName);

            let broadcastMessage = message;
            if(randomMessage) {
                data.wardenPropaganda = randomMessage;
                broadcastMessage = `[${serverName} - ${mapName}] ${randomMessage}`;
            }

            let channels = this.getBroadcastChannels(serverName);
            if(channels.length) {
                this.sendBroadcast({
                    to: channels,
                    message: broadcastMessage
                });
            }


            let prev = 0;
            prev = warcorrVictories.get('total.' + winnerName).value() || 0;
            warcorrVictories.set('total.' + winnerName, prev+1);

            prev = warcorrVictories.get('maps.' + mapName + '.' + winnerName).value() || 0;
            warcorrVictories.set('maps.' + mapName + '.' + winnerName, prev+1);

            prev = warcorrVictories.get('servers.' + serverName + '.' + winnerName).value() || 0;
            warcorrVictories.set('servers.' + serverName + '.' + winnerName, prev+1);

            prev = warcorrVictories.get('combined.' + serverName + '.' + mapName + '.' + winnerName).value() || 0;
            warcorrVictories.set('combined.' + serverName + '.' + mapName + '.' + winnerName, prev+1);

            warcorrHistory.get('history').push(data).write();
            warcorrVictories.get('history').push(victory).write();
            warcorrServers.set(serverName+'.changes', []).write();
            warcorrServers.set(serverName+'.history', []).write();

        } else {

            // Unknown
            logger.info('UNKWN: ' + message);
        }
    }

    getBroadcastChannels(serverName) {
        let broadcastTo = [];
        broadcastTo = broadcastTo.concat(this.config.channelIDs.write.all || []);
        for(let serverNamePart in this.config.channelIDs.write.filtered) {
            if(this.config.channelIDs.write.filtered.hasOwnProperty(serverNamePart)) {
                const channels = this.config.channelIDs.write.filtered[serverNamePart];
                if(serverName.indexOf(serverNamePart) !== -1) {
                    broadcastTo = broadcastTo.concat(channels);
                }
            }
        }
        return broadcastTo;
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
