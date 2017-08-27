const WarcorrRepository = require('./_warcorr.js');

class WarcorrMessageVictoryRepository extends WarcorrRepository {
    constructor() {
        super('message_victory', ['uid_message', 'faction_winner', 'faction_loser']);
    }
}

module.exports = new WarcorrMessageVictoryRepository();