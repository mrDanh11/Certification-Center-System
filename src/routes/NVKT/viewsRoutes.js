const express = require('express');
const router = express.Router();

//Route connect Home Page
router.get('/', async (req, res) => {
    try {
        res.render('NVKTPage/home', {
            layout: 'NVKT/NVKTMain',
            title: 'Nhân viên kế toán Page',
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;