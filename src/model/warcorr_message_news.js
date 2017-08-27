const WarcorrRepository = require('./_warcorr.js');

class WarcorrMessageNewsRepository extends WarcorrRepository {
    constructor() {
        super('message_news', ['uid_message', 'faction', 'action', 'uid_map_location']);
    }
}

module.exports = new WarcorrMessageNewsRepository();