const ENABLE_PROPAGANDA = true;
module.exports = function(data) {
    "use strict";

    if(ENABLE_PROPAGANDA) {
        const wardenPropaganda = {
            Wardens: [
                '@Foxtrot Squad **Victory! We\'ve successfully defended {mapName} against the colonial invasion!**',
                '@Foxtrot Squad **We have achieved victory over the colonial scum. Glory to the Wardens!**',
                '@Foxtrot Squad **Another glorious victory has been achieved! Long live the Warden Empire!**',
            ],
            Colonials: [
                '@Foxtrot Squad **All of {mapName} has fallen into enemy hands. We suffered a tragic defeat**.',
                '@Foxtrot Squad **We might have suffered defeat this time, but we will not lose the war.**',
                '@Foxtrot Squad **The population of {mapName} shudders in terror as the colonial invaders defeat** us.**',
            ]
        };

        const factionMessages = wardenPropaganda[data.details.winner] || [];
        let randomMessage = factionMessages[Math.floor(Math.random()*factionMessages.length)];
        randomMessage = randomMessage.replace('{mapName}', data.map.name);

        const messagePrefix = `[${data.server.name} - ${data.map.name}]`;
        const message = `${messagePrefix} ${randomMessage}`;
        this.broadcastForServer(data.server.name, message);
    } else {
        const messagePrefix = `[${data.server.name} - ${data.map.name}]`;
        const message = `${messagePrefix} ${data.message}`;
        this.broadcastForServer(data.server.name, message);
    }
};
