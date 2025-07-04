const lichthi = require('./lichthiModel');
const lichthiController = {
    LayTTLichThi: async (req, res) => {
        try {
            // ChungChiID not maLichThi
            const {maLichThi} = req.query;
            const infobaithi = await lichthi.LayTTLichThi(maLichThi);
            res.json(infobaithi[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    LayDSLichThi: async (req, res) => {
      try {
        const { chungChiID } = req.query;

        // Validate parameter
        if (!chungChiID || isNaN(chungChiID)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid or missing ChungChiID. Must be a number.',
          });
        }

        // Call the model function
        const result = await lichthi.LayDSLichThi(parseInt(chungChiID, 10));

        if (!result.success) {
          return res.status(500).json({
            success: false,
            message: 'Failed to fetch LichThi.',
            error: result.error,
          });
        }

        // Successful response
        return res.status(200).json({
          success: true,
          lichthiList: result.data,
        });
      } catch (err) {
        console.error('Unexpected error in getLichThiByChungChiID:', err);
        return res.status(500).json({
          success: false,
          message: 'An unexpected server error occurred.',
        });
      }
    }
}
module.exports = lichthiController;
