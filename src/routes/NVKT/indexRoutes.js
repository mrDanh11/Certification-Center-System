const thanhtoanRoutes = require("./thanhtoanRoutes");
const viewsRoutes = require("./viewsRoutes");
const phieudangkyRoutes = require("./phieudangkyRoutes");
const khachhangRoutes = require("./khachhangRoutes");
const danhsachDKThiRoutes = require("./DanhSachDKThiRoutes");
const lichthiRoutes = require("./lichthiRoutes");
const hoadonRoutes = require("./hoadonRoutes");
const phieuthanhtoanRoutes = require("./phieuthanhtoanRoutes");
const sendemailRoutes = require("./sendemailRoutes");
module.exports = (app) => {

    app.use('/NVKT/ThanhToan', thanhtoanRoutes)

    app.use('/NVKT/PhieuDangKy', phieudangkyRoutes)

    app.use('/NVKT/HoaDon', hoadonRoutes)

    app.use('/NVKT/KhachHang', khachhangRoutes)

    app.use('/NVKT/SendEmail', sendemailRoutes)

    app.use('/NVKT/PhieuThanhToan', phieuthanhtoanRoutes)

    app.use('/NVKT/danhsachDKThi', danhsachDKThiRoutes)

    app.use('/NVKT/lichthi', lichthiRoutes)

    app.use('/NVKT',viewsRoutes)
}