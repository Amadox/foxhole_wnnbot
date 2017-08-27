const WarcorrRepository = require('./_warcorr.js');

class WarcorrServerRepository extends WarcorrRepository {
    constructor() {
        super('server', ['name']);
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

module.exports = new WarcorrServerRepository();