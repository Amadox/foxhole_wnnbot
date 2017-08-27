const warcorrMessageVictoryRepository = require('./model/warcorr_message_victory.js');

const ENABLE_PROPAGANDA = true;
module.exports = function(data) {
    "use strict";

    let broadcast = (serverName, mapName, message) => {
        const messagePrefix = `[${serverName} - ${mapName}]`;
        let msgText = `${messagePrefix} ${message}`;

        if(serverName === 'Dog6-Europe') {
            msgText = `${msgText} <@Foxtrot Squad>, <@Recruits>`;
        }

        this.broadcastForServer(serverName, msgText);
    };

    warcorrMessageVictoryRepository.create({
        'uid_message': data.message.uid,
        'faction_winner': data.details.faction_winner,
        'faction_loser': data.details.faction_loser,
    });

    if(ENABLE_PROPAGANDA) {
        const wardenPropaganda = {
            Wardens: [
                '**Victory! We\'ve successfully defended {mapName} against the colonial invasion!**',
                '**We have achieved victory over the colonial scum. Glory to the Wardens!**',
                '**Another glorious victory has been achieved! Long live the Warden Empire!**',
            ],
            Colonials: [
                '**All of {mapName} has fallen into enemy hands. We suffered a tragic defeat**.',
                '**We might have suffered defeat this time, but we will not lose the war.**',
                '**The population of {mapName} shudders in terror as the colonial invaders defeat us.**',
            ]
        };

        const factionMessages = wardenPropaganda[data.details.faction_winner] || [];
        let randomMessage = factionMessages[Math.floor(Math.random()*factionMessages.length)];
        randomMessage = randomMessage.replace('{mapName}', data.map.name);
        broadcast(data.server.name, data.map.name, randomMessage);
    } else {
        broadcast(data.server.name, data.map.name, data.message.content);
    }
};
