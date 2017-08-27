const warcorrMessageStatsRepository = require('./model/warcorr_message_stats.js');

const ENABLE_STATBROADCAST = false;
module.exports = function(data) {
    "use strict";

    warcorrMessageStatsRepository.create({
        'uid_message': data.message.uid,
        'total_enlistments': data.details.total_enlistments,
        'casualties_colonials': data.details.casualties_colonials,
        'casualties_wardens': data.details.casualties_wardens,
    });

    if(ENABLE_STATBROADCAST) {
        const messagePrefix = `[${data.server.name} - ${data.map.name}]`;
        const message = `${messagePrefix} ${data.message.content}`;
        this.broadcastForServer(data.server.name, message);
    }
};
