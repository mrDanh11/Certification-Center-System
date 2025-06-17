const viewsRoutes = require("./viewsRoutes");
// const tiepnhankhachhangRoutes = require('./tiepnhankhachhangRoutes');
const taophieudangkyRoutes = require('./taophieudangkyRoutes');
const khachhangRoutes = require('./khachhangRoutes');
const chungchiRoutes = require('./chungchiRoutes');

module.exports = (app) => {

    app.use('/NVTN',viewsRoutes)
    // app.use('/NVTN/tiepnhan', tiepnhankhachhangRoutes);
    app.use('/NVTN/taophieu', taophieudangkyRoutes);
    app.use('/api/khachhang', khachhangRoutes);
    app.use('/api/chungchi', chungchiRoutes);
}
