const { Query } = require('pg');
const {pool} = require('../../../config/db');

const lichthi = {
    LayTTLichThi: async (maLichThi) => {
		const query = `
		SELECT * FROM LichThi lt
        JOIN ChungChi cc ON cc.ChungChiID=lt.ChungChiID
        WHERE lt.ChungChiID = '${maLichThi}';
		`;
		try {
            await pool.connect()
			const result = await pool.request().query(query);
            const test = result.recordset
			if(test) return test 
            else return [];
		} catch (err) {
			throw new Error('Error get information in lich thi: ' + err.message);
		}
	},
}

module.exports = lichthi;