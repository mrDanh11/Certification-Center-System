const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        res.render('NVTNPage/tiepnhankhachhang', {
            layout: 'NVTN/NVTNmain',
            title: 'Tiếp nhận khách hàng Page',
            scripts: '<script src="/js/NVTN/tiepnhankhachhang.js"></script>',
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

