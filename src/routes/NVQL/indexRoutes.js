const viewsRoutes = require('./viewsRoutes')
const taolichthiRoutes = require('./taolichthiRoutes')
const lichthiRoutes = require('./lichthiRoutes')
const phieudonviRoutes = require('./phieudonviRoutes')
const nhanvienRoutes = require('./nhanvienRoutes')
const nhanviencoithiRoutes = require('./nhanviencoithiRoutes')
const phongthiRoutes = require('./phongthiRoutes')

module.exports = (app) => {
    app.use('/NVQL', viewsRoutes)
    app.use('/NVQL/TaoLichThi', taolichthiRoutes)
    app.use('/NVQL/api/lichthi', lichthiRoutes)
    app.use('/NVQL/api/phieudonvi', phieudonviRoutes)
    app.use('/NVQL/api/phongthi', phongthiRoutes)
    app.use('/NVQL/api/nhanvien', nhanvienRoutes)
    app.use('/NVQL/api/nhanviencoithi', nhanviencoithiRoutes)
}