const dsdkt = require('./danhsachdkthiModel');
const dsdktController = {
    LayDanhSachBaiThi: async (req, res) => {
        try {
            const {maDangKy} = req.query;
            const infodsdkt = await dsdkt.LayDanhSachBaiThi(maDangKy);
            res.json(infodsdkt);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    DangKyBaiThiMoi: async (req, res) => {
      try {
        const {phieuID, BaiThiID} = req.body;
        if (!phieuID || !BaiThiID || isNaN(phieuID) || isNaN(BaiThiID)){
          res.status(400).json({
            success: false,
            message: 'PhieuID or BaiThiID is empty or invalid',
          })
        }
        const result = await dsdkt.DangKyBaiThiMoi(parseInt(phieuID), parseInt(BaiThiID));
        console.log(result);

        if (!result.success){
          return res.status(500).json({
            success: false,
            message: 'Failed to INSERT DSDangKyThi.',
            error: result.error,
          });
        }

        return res.status(200).json({
          success: true,
          DSDangKyThi: {phieuID, BaiThiID},
        });
      }
      catch(error){
        console.error('Unexpected error in getLichThiByChungChiID:', error);
        return res.status(500).json({
          success: false,
          message: 'An unexpected server error occurred.',
        });
      };
    }
}
module.exports = dsdktController;
