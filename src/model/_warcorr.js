const sqlite3 = require('sqlite3').verbose();
const logger = require('../logger.js');

module.exports = class WarcorrRepository {
    /**
     * @param {string} tableName
     * @param {string[]} columns
     */
    constructor(tableName, columns) {
        this.db = new sqlite3.Database('./data/warcorr.sqlite');
        this.tableName = tableName;
        this.columns = columns || [];
    }

    /**
     * @param {{}} obj
     * @returns {Promise}
     */
    create(obj) {
        return (new Promise((resolve, reject) => {
            if(!this.tableName) {
                reject({message: `Table Name for this model hasn't been set.`});
            }

            if(!this.columns || !this.columns.length) {
                reject({message: `Columns for this model haven't been set.`});
            }

            const prefixed = this.prefixKeys(obj);

            this.db.run(`INSERT INTO ${this.tableName} (${this.columns.join(", ")}) VALUES (${Object.keys(prefixed).join(', ')})`, prefixed, (err) => {
                if(err) {
                    reject(err);
                } else {
                    this.getBy(obj).then((row) => {
                        resolve(row);
                    }, (err) => {
                        reject(err);
                    });
                }
            });
        })).catch((err) => {
            logger.error(err);
        });
    }

    /**
     * @param {number} uid
     * @returns {Promise}
     */
    get(uid) {
        return this.getBy({
            'uid': uid
        });
    }

    /**
     * @param {{}} obj
     * @returns {Promise}
     */
    getBy(obj) {
        return (new Promise((resolve, reject) => {
            if(!this.tableName) {
                reject({message: `Table Name for this model hasn't been set.`});
            }

            let pairs = [];
            Object.keys(obj).forEach((key) => {
                pairs.push(`${key} = :${key}`);
            });

            this.db.get(`SELECT * FROM ${this.tableName} WHERE ${pairs.join(' AND ')}`, this.prefixKeys(obj), (err, row) => {
                err ? reject(err): resolve(row);
            });
        })).catch((err) => {
            logger.error(err);
        });
    }

    /**
     * @returns {Promise}
     */
    all() {
        return (new Promise((resolve, reject) => {
            if(!this.tableName) {
                reject({message: `Table Name for this model hasn't been set.`});
            }

            this.db.all(`SELECT * FROM ${this.tableName}`, (err, rows) => {
                err ? reject(err): resolve(rows);
            });
        })).catch((err) => {
            logger.error(err);
        });
    }

    /**
     * @param {number|{}} uid
     * @param {{}|null} obj
     * @returns {Promise}
     */
    update(uid, obj) {

        return (new Promise((resolve, reject) => {
            if(!this.tableName) {
                reject({message: `Table Name for this model hasn't been set.`});
            }

            if(typeof obj === 'undefined' && typeof uid !== 'number') {
                obj = uid;
                uid = obj.uid;
            }

            let pairs = [];
            Object.keys(obj).forEach((key) => {
               pairs.push(`${key} = :${key}`);
            });

            this.db.run(`UPDATE ${this.tableName} SET ${pairs.join(', ')}`, this.prefixKeys(obj), (err, rows) => {
                err ? reject(err): resolve(rows);
            });
        })).catch((err) => {
            logger.error(err);
        });
    }

    /**
     * @param {{}} object
     * @param {string} prefix
     * @returns {{}}
     */
    prefixKeys(object, prefix) {
        prefix = prefix || ':';
        let ret = {};
        Object.keys(object).forEach((key) => {
           ret[prefix+key] = object[key];
        });
        return ret;
    }
};