const ENABLE_STATBROADCAST = false;
module.exports = function(data) {
    "use strict";

    if(ENABLE_STATBROADCAST) {
        const messagePrefix = `[${data.server.name} - ${data.map.name}]`;
        const message = `${messagePrefix} ${data.message}`;
        this.broadcastForServer(data.server.name, message);
    }
};
