const express = require('express');
const router = express.Router();

//Route connect Home Page
router.get('/', async (req, res) => {
    try {
        res.render('NVTNPage/home', {
            layout: 'NVTN/NVTNMain',
            title: 'Nhân viên tiếp nhận Page',
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;