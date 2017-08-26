(() => {
    "use strict";

    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('./data/warcorr.db');
    db.serialize(() => {

        db.run('CREATE TABLE IF NOT EXISTS server (' +
            'uid INTEGER PRIMARY KEY AUTOINCREMENT, ' +
            'name TEXT' +
        ')');

        db.run('CREATE TABLE IF NOT EXISTS map (' +
            'uid INTEGER PRIMARY KEY AUTOINCREMENT, ' +
            'name TEXT' +
        ')');

        db.run('CREATE TABLE IF NOT EXISTS map_location (' +
            'uid INTEGER PRIMARY KEY AUTOINCREMENT, ' +
            'uid_map INTEGER, ' +
            'name TEXT, ' +
            'FOREIGN KEY(uid_map) REFERENCES map(uid)' +
        ')');

        db.run('CREATE TABLE IF NOT EXISTS message (' +
            'uid INTEGER PRIMARY KEY AUTOINCREMENT, ' +
            'date TEXT, ' +
            'uid_server INTEGER, ' +
            'uid_map INTEGER, ' +
            'msg TEXT, ' +
            'FOREIGN KEY(uid_server) REFERENCES server(uid), ' +
            'FOREIGN KEY(uid_map) REFERENCES map(uid)' +
        ')');

        db.run('CREATE TABLE IF NOT EXISTS message_stats (' +
            'uid INTEGER PRIMARY KEY AUTOINCREMENT, ' +
            'uid_messages INTEGER, ' +
            'total_enlistments INTEGER, ' +
            'casualties_colonials INTEGER, ' +
            'casualties_wardens INTEGER, ' +
            'FOREIGN KEY(uid_messages) REFERENCES message(uid)' +
        ')');

        db.run('CREATE TABLE IF NOT EXISTS message_news (' +
            'uid INTEGER PRIMARY KEY AUTOINCREMENT, ' +
            'uid_messages INTEGER, ' +
            'faction TEXT, ' +
            'action INTEGER, ' +
            'uid_map_location INTEGER, ' +
            'FOREIGN KEY(uid_messages) REFERENCES message(uid), ' +
            'FOREIGN KEY(uid_map_location) REFERENCES map_location(uid)' +
        ')');

        db.run('CREATE TABLE IF NOT EXISTS victory (' +
            'uid INTEGER PRIMARY KEY AUTOINCREMENT, ' +
            'uid_messages INTEGER, ' +
            'faction_winner TEXT, ' +
            'FOREIGN KEY(uid_messages) REFERENCES message(uid)' +
        ')');
    });
    db.close();
})();