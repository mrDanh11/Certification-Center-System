const {pool} = require('../../../config/db');

const ChungChi = {
	LayDSChungChi: async () => {
		const query = `
		select ChungChiID, TenChungChi, LoaiChungChi, Gia from ChungChi 
		`;
		try {
      await pool.connect()
			const result = await pool.request()
        .query(query);

      return result.recordset;
		} catch (err) {
			throw new Error('Error get information in ChungChi Model: ' + err.message);
		}
	},
}

module.exports = ChungChi;
