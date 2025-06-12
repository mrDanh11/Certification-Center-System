const lichthi = require('./lichthiModel');
const lichthiController = {
    LayTTLichThi: async (req, res) => {
        try {
            const {maLichThi} = req.query;
            const infobaithi = await lichthi.LayTTLichThi(maLichThi);
            res.json(infobaithi[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
}
module.exports = lichthiController;