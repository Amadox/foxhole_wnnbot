module.exports = function(data) {
    "use strict";

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
};
