const WarcorrRepository = require('./_warcorr.js');

class WarcorrMessageStatsRepository extends WarcorrRepository {
    constructor() {
        super('message_stats', ['uid_message', 'total_enlistments', 'casualties_colonials', 'casualties_wardens']);
    }
}

module.exports = new WarcorrMessageStatsRepository();