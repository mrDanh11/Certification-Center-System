const viewsRoutes = require("./viewsRoutes");
const tiepnhankhachhangRoutes = require('./tiepnhankhachhangRoutes');
const taophieudangkyRoutes = require('./taophieudangkyRoutes');
const khachhangRoutes = require('./khachhangRoutes');
const chungchiRoutes = require('./chungchiRoutes');
const thisinhRoutes = require('./thisinhRoutes');
const phieudangkyRoutes = require('./phieudangkyRoutes');
const dangkymonRoutes = require('./dangkymonRoutes');
const lichthiRoutes = require('./lichthiRoutes');
const danhsachDKthiRoutes = require('./danhsachDKthiRoutes')
const kqcRoutes = require('./ketquachungchiRoutes');

module.exports = (app) => {

    app.use('/NVTN', viewsRoutes)
    app.use('/NVTN/tiepnhan', tiepnhankhachhangRoutes);
    app.use('/NVTN/taophieu', taophieudangkyRoutes);
    app.use('/NVTN/dangkymon', dangkymonRoutes)
    app.use('/NVTN/api/khachhang', khachhangRoutes);
    app.use('/NVTN/api/chungchi', chungchiRoutes);
    app.use('/NVTN/api/thisinh', thisinhRoutes);
    app.use('/NVTN/api/phieudangky', phieudangkyRoutes);
    app.use('/NVTN/api/lichthi', lichthiRoutes);
    app.use('/NVTN/api/danhsachDKThi', danhsachDKthiRoutes);
    app.use('/NVTN/KetQuaChungChi', kqcRoutes);
}
