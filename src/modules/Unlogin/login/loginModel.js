const {pool} = require('../../../config/db');

const Branch = {
    checkLogin: async (username, password) => {

		const query = `
		select nv.NhanVienID, nv.loaiNV
        from ACCOUNT a
		join NhanVien nv on a.NhanVienID = nv.NhanVienID
        where a.username = '${username}' and  a.password = '${password}'
		`;
		try {
            await pool.connect()
			const result = await pool.request().query(query);
			console.log(result)
            const test = result.recordset
			return test 
		} catch (err) {
			throw new Error('Error fetching tours by location: ' + err.message);
		}
	},
}

module.exports = Branch;