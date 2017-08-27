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

        const factionMessages = wardenPropaganda[data.details.faction] || [];
        let randomMessage = factionMessages[Math.floor(Math.random()*factionMessages.length)];
        randomMessage = randomMessage.replace('{townName}', data.details.location);

        const messagePrefix = `[${data.server.name} - ${data.map.name}]`;
        const message = `${messagePrefix} ${randomMessage}`;
        this.broadcastForServer(data.server.name, message);
    } else {
        const messagePrefix = `[${data.server.name} - ${data.map.name}]`;
        const message = `${messagePrefix} ${data.message.content}`;
        this.broadcastForServer(data.server.name, message);
    }
};
