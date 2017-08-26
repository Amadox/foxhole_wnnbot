module.exports = function(data) {
    "use strict";

    const wardenPropaganda = {
        Wardens: [
            '**Victory**! We\'ve successfully defended {mapName} against the colonial invasion!',
            'We have achieved **victory** over the colonial scum. Glory to the Wardens!',
            'Another glorious **victory** has been achieved! Long live the Warden Empire!',
        ],
        Colonials: [
            'All of {mapName} has fallen into enemy hands. We suffered a tragic **defeat**.',
            'We might have suffered **defeat** this time, but we will not lose the war.',
            'The population of {mapName} shudders in terror as the colonial invaders **defeat** us.',
        ]
    };

    const factionMessages = wardenPropaganda[data.details.winner] || [];
    let randomMessage = factionMessages[Math.floor(Math.random()*factionMessages.length)];
    randomMessage = randomMessage.replace('{mapName}', data.map.name);

    const messagePrefix = `[${data.server.name} - ${data.map.name}]`;
    const message = `${messagePrefix} ${randomMessage}`;
    this.broadcastForServer(data.server.name, message);
};
