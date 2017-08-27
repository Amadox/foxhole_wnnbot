const WarcorrRepository = require('./_warcorr.js');

class WarcorrMapLocationRepository extends WarcorrRepository {
    constructor() {
        super('map_location', ['uid_map', 'name']);
    }

    /**
     * @param obj
     * @returns {Promise}
     */
    create(obj) {
        return (new Promise((resolve, reject) => {
            this.getBy(obj).then((row) => {
                if(typeof row === 'undefined') {
                    super.create(obj).then((response) => {
                        resolve(response);
                    }, (err) => {
                        reject(err);
                    });
                } else {
                    resolve(row);
                }
            }, (err) => {
                reject(err);
            });
        }));
    }
}

module.exports = new WarcorrMapLocationRepository();