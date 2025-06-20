const viewsRoutes = require("./viewsRoutes");
// const tiepnhankhachhangRoutes = require('./tiepnhankhachhangRoutes');
const taophieudangkyRoutes = require('./taophieudangkyRoutes');
const khachhangRoutes = require('./khachhangRoutes');
const chungchiRoutes = require('./chungchiRoutes');
const thisinhRoutes = require('./thisinhRoutes');
const phieudangkyRoutes = require('./phieudangkyRoutes')

module.exports = (app) => {

    app.use('/NVTN', viewsRoutes)
    // app.use('/NVTN/tiepnhan', tiepnhankhachhangRoutes);
    app.use('/NVTN/taophieu', taophieudangkyRoutes);
    app.use('/NVTN/api/khachhang', khachhangRoutes);
    app.use('/NVTN/api/chungchi', chungchiRoutes);
    app.use('/NVTN/api/thisinh', thisinhRoutes);
    app.use('/NVTN/api/phieudangky', phieudangkyRoutes);
}
