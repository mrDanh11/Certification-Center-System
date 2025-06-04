const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        res.render('NVKTPage/thanhtoan', {
            layout: 'NVKT/NVKTMain',
            title: 'Thanh toán đăng ký Page',
            scripts: '<script src="/js/NVKT/thanhtoan.js"></script>',
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;