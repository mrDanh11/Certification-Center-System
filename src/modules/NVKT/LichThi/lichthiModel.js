const { Query } = require('pg');
const { pool, sql_Int } = require('../../../config/db');

const lichthi = {
  LayTTLichThi: async (maLichThi) => {
    const query = `
		SELECT * FROM LichThi lt
        JOIN ChungChi cc ON cc.ChungChiID=lt.ChungChiID
        WHERE lt.BaiThiID = '${maLichThi}';
		`;
		try {
			console.log(query);
            await pool.connect()
			const result = await pool.request().query(query);
            const test = result.recordset
			if(test) return test 
            else return [];
		} catch (err) {
			throw new Error('Error get information in lich thi: ' + err.message);
		}
	},

  LayDSLichThi: async (ChungChiID) => {
    await pool.connect();
    try {
      let request;
      request = pool.request();
      data = await request
        .input('ChungChiID', sql_Int, ChungChiID)
        .query(`
          SELECT * FROM LichThi lt WHERE
          lt.ChungChiID = @ChungChiID
      `);
      return { success: true, data: data.recordset };
    } catch (err) {
      console.error('Error query LichThi:', err);
      return { success: false, error: err.message };
    }
  },
}

module.exports = lichthi;
