const warcorrMapLocationRepository = require('./model/warcorr_map_location.js');
const warcorrMessageNewsRepository = require('./model/warcorr_message_news.js');

const ENABLE_PROPAGANDA = false;
module.exports = function(data) {
    "use strict";

    warcorrMapLocationRepository.create({
        'uid_map': data.map.uid,
        'name': data.details.location,
    }).then((mapLocation) => {
        warcorrMessageNewsRepository.create({
            'uid_message': data.message.uid,
            'faction': data.details.faction,
            'action': data.details.action,
            'uid_map_location': mapLocation.uid,
        });
    });

    if(ENABLE_PROPAGANDA) {
        const wardenPropaganda = {
            Wardens: [
                'We have now secured **{townName}**. The civilian population sighs with relief.',
                '**{townName}** is now firmly in our hands. March on, brothers!',
                'Civilians cheer as we fortify **{townName}** against colonial attacks.',
            ],
            Colonials: [
                'The enemy has brutally taken control over **{townName}**.',
                '**{townName}** has fallen into enemy hands. We need to free it!',
                'The Colonial Invaders have started to fortify **{townName}**. Pray for the local population...',
            ]
        };

        const factionMessages = wardenPropaganda[data.details.faction] || [];
        let randomMessage = factionMessages[Math.floor(Math.random()*factionMessages.length)];
        randomMessage = randomMessage.replace('{townName}', data.details.location);

        const messagePrefix = `[${data.server.name} - ${data.map.name}]`;
        const message = `${messagePrefix} ${randomMessage}`;
        const messageWithStats = `${message} The **${data.details.faction}** now have **${data.details.towns_owned} of ${data.details.towns_total}** towns.`;
        this.broadcastForServer(data.server.name, messageWithStats);
    } else {
        const messagePrefix = `[${data.server.name} - ${data.map.name}]`;
        const message = `${messagePrefix} ${data.message.content}`;
        this.broadcastForServer(data.server.name, message);
    }
};
