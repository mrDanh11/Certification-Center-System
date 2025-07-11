const { pool } = require('../../../config/db');

const DanhSachCho = {
    LuuDanhSachCho: async (thiSinhID, phieuID, tinhTrang = 0) => {
        const query = `
            INSERT INTO DanhSachCho (ThiSinhID, PhieuID, TinhTrang)
            VALUES (@ThiSinhID, @PhieuID, @TinhTrang)
        `;
        try {
            console.log('DanhSachCho model received:', { thiSinhID, phieuID, tinhTrang });
            await pool.connect();
            await pool.request()
                .input('ThiSinhID', thiSinhID)
                .input('PhieuID', phieuID)
                .input('TinhTrang', tinhTrang)
                .query(query);
            return true;
        } catch (err) {
            throw new Error('Error saving DanhSachCho: ' + err.message);
        }
    }
};

module.exports = DanhSachCho;