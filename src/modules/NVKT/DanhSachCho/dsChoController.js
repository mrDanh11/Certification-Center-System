const DanhSachCho = require('./dsChoModel');

const dsChoController = {
    LuuDanhSachCho: async (req, res) => {
        try {
            console.log('Received data for dsCho:', req.body); 
            const { thiSinhID, phieuID, tinhTrang } = req.body;
            const result = await DanhSachCho.LuuDanhSachCho(thiSinhID, phieuID, tinhTrang);
            if (result) {
                res.json({ message: 'Lưu danh sách chờ thành công' });
            } else {
                res.status(400).json({ error: 'Lưu danh sách chờ không thành công' });
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = dsChoController;