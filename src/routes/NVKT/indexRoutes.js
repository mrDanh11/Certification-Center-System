const thanhtoanRoutes = require("./thanhtoanRoutes");
const viewsRoutes = require("./viewsRoutes");
const phieudangkyRoutes = require("./phieudangkyRoutes");

module.exports = (app) => {

    app.use('/NVKT/ThanhToan', thanhtoanRoutes)

    app.use('/NVKT/PhieuDangKy', phieudangkyRoutes)

    app.use('/NVKT',viewsRoutes)
}