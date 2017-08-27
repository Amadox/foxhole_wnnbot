const sqlite3 = require('sqlite3').verbose();
const logger = require('../logger.js');

class ConfigRepository {
    constructor(tableName, columns) {
        this.db = new sqlite3.Database('./data/warcorr.sqlite');
    }

    /**
     * @param {string} key
     * @param defaultValue
     * @returns {Promise}
     */
    get(key, defaultValue) {
        return (new Promise((resolve, reject) => {
            this.db.get(`SELECT * FROM config WHERE key = ?`, key, (err, row) => {
                if(err) {
                    reject(err);
                }

                else if(row && row.value) {
                    resolve(row.value);
                }

                else if(typeof defaultValue !== 'undefined') {
                    resolve(defaultValue);
                }

                else {
                    resolve(undefined);
                }
            });
        })).catch((err) => {
            logger.error(err);
        });
    }

    /**
     * @param {string} key
     * @param value
     * @returns {Promise}
     */
    set(key, value) {
        return (new Promise((resolve, reject) => {
            this.db.run(`REPLACE INTO config (key, value) VALUES (:key, :value)`, {
                ':key': key,
                ':value': value,
            }, (err) => {
               if(err) {
                   reject(err);
               } else {
                   resolve(true);
               }
            });
        }));
    }
}

module.exports = new ConfigRepository();