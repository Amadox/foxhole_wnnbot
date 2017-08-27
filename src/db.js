const logger = require('./logger.js');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/warcorr.sqlite');
const configRepo = require('./model/config');

module.exports = initdb;

function initdb() {
    "use strict";
    db.serialize(() => {

        db.run('CREATE TABLE IF NOT EXISTS config (' +
            'key TEXT PRIMARY KEY, ' +
            'value TEXT' +
        ')', () => {
            configRepo.get('version', 0).then((version) => {
                let initialVersion = version;
                logger.info("DB Version: " + initialVersion);
                if(version <= 0) {
                    logger.info("updating to 1");
                    version = update_version1();
                }

                if(version !== initialVersion) {
                    logger.info("DB updated to: " + version);
                }
            });
        });
    });
}

function update_version1() {
    db.run('CREATE TABLE IF NOT EXISTS server (' +
        'uid INTEGER PRIMARY KEY AUTOINCREMENT, ' +
        'name TEXT UNIQUE' +
        ')');

    db.run('CREATE TABLE IF NOT EXISTS map (' +
        'uid INTEGER PRIMARY KEY AUTOINCREMENT, ' +
        'name TEXT UNIQUE' +
        ')');

    db.run('CREATE TABLE IF NOT EXISTS map_location (' +
        'uid INTEGER PRIMARY KEY AUTOINCREMENT, ' +
        'uid_map INTEGER, ' +
        'name TEXT, ' +
        'FOREIGN KEY(uid_map) REFERENCES map(uid), ' +
        'UNIQUE (uid_map, name) ON CONFLICT REPLACE' +
        ')');

    db.run('CREATE TABLE IF NOT EXISTS message (' +
        'uid INTEGER PRIMARY KEY AUTOINCREMENT, ' +
        'date TEXT, ' +
        'uid_server INTEGER, ' +
        'uid_map INTEGER, ' +
        'content TEXT, ' +
        'FOREIGN KEY(uid_server) REFERENCES server(uid), ' +
        'FOREIGN KEY(uid_map) REFERENCES map(uid)' +
        ')');

    db.run('CREATE TABLE IF NOT EXISTS message_stats (' +
        'uid INTEGER PRIMARY KEY AUTOINCREMENT, ' +
        'uid_message INTEGER, ' +
        'total_enlistments INTEGER, ' +
        'casualties_colonials INTEGER, ' +
        'casualties_wardens INTEGER, ' +
        'FOREIGN KEY(uid_message) REFERENCES message(uid)' +
        ')');

    db.run('CREATE TABLE IF NOT EXISTS message_news (' +
        'uid INTEGER PRIMARY KEY AUTOINCREMENT, ' +
        'uid_message INTEGER, ' +
        'faction TEXT, ' +
        'action INTEGER, ' +
        'uid_map_location INTEGER, ' +
        'FOREIGN KEY(uid_message) REFERENCES message(uid), ' +
        'FOREIGN KEY(uid_map_location) REFERENCES map_location(uid)' +
        ')');

    db.run('CREATE TABLE IF NOT EXISTS message_victory (' +
        'uid INTEGER PRIMARY KEY AUTOINCREMENT, ' +
        'uid_message INTEGER, ' +
        'faction_winner TEXT, ' +
        'faction_loser TEXT, ' +
        'FOREIGN KEY(uid_message) REFERENCES message(uid)' +
        ')');

    configRepo.set('version', 1);
    return 1;
}