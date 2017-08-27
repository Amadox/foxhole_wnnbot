const WarcorrRepository = require('./_warcorr.js');

class WarcorrMessageRepository extends WarcorrRepository {
    constructor() {
        super('message', ['date', 'uid_server', 'uid_map', 'content']);
    }
}

module.exports = new WarcorrMessageRepository();