const { Query } = require('pg');
const {pool} = require('../../../config/db');

const dsdkt = {
	LayDanhSachBaiThi: async (maDangKy) => {
		const query = `
		SELECT * FROM DanhSachDKThi dsbt
        WHERE dsbt.PhieuID = '${maDangKy}'
		`;
		try {
            await pool.connect()
			const result = await pool.request().query(query);
            const test = result.recordset
            if(test) return test 
            else return [];
		} catch (err) {
			throw new Error('Error get information in dsdkthi: ' + err.message);
		}
	},
}

module.exports = dsdkt;