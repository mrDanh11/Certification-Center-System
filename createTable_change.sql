CREATE DATABASE QuanLyDangKyThi
GO

USE QuanLyDangKyThi;
CREATE LOGIN NVHT WITH PASSWORD = '1234@';
CREATE USER NVHT FOR LOGIN NVHT;
ALTER ROLE db_owner ADD MEMBER NVHT;
GO

USE QuanLyDangKyThi;
SELECT * FROM sys.database_principals WHERE name = 'NVHT';

CREATE TABLE NhanVien (
    NhanVienID INT IDENTITY(1, 1),
    Hoten NVARCHAR(100),
    Ngaysinh DATETIME,
    Diachi NVARCHAR(200),
    loaiNV NVARCHAR(50),
    PRIMARY KEY (NhanVienID),
    CONSTRAINT CHK_nhanvien_type CHECK (loaiNV IN (N'quan ly', N'tiep nhan', N'ke toan', N'nhap lieu'))
);
GO

CREATE TABLE ACCOUNT (
    NhanVienID INT,
    username VARCHAR(50),
    password VARCHAR(50),
    PRIMARY KEY (NhanVienID),
    CONSTRAINT FK_account FOREIGN KEY (NhanVienID) REFERENCES NhanVien(NhanVienID)
);
GO

CREATE TABLE QuanLy (
    NhanVienID INT,
    PRIMARY KEY (NhanVienID),
    CONSTRAINT FK_QuanLy FOREIGN KEY (NhanVienID) REFERENCES NhanVien(NhanVienID)
);
GO

CREATE TABLE TiepNhan (
    NhanVienID INT,
    PRIMARY KEY (NhanVienID),
    CONSTRAINT FK_TiepNhan FOREIGN KEY (NhanVienID) REFERENCES NhanVien(NhanVienID)
);
GO

CREATE TABLE KeToan (
    NhanVienID INT,
    PRIMARY KEY (NhanVienID),
    CONSTRAINT FK_KeToan FOREIGN KEY (NhanVienID) REFERENCES NhanVien(NhanVienID)
);
GO

CREATE TABLE NhapLieu (
    NhanVienID INT,
    PRIMARY KEY (NhanVienID),
    CONSTRAINT FK_NhapLieu FOREIGN KEY (NhanVienID) REFERENCES NhanVien(NhanVienID)
);
GO

CREATE TABLE ChungChi (
    ChungChiID INT IDENTITY(1, 1),
    LoaiChungChi NVARCHAR(100),
    TenChungChi NVARCHAR(100),
    Gia INT,
    PRIMARY KEY(ChungChiID),
);
GO

CREATE TABLE PhongThi (
    PhongThi INT IDENTITY(1,1) PRIMARY KEY,
    TenPhong   NVARCHAR(100) NOT NULL
);
GO

CREATE TABLE LichThi (
    BaiThiID INT IDENTITY(1, 1),
    ChungChiID INT,
    ThoiGianLamBai TIME,
    ThoiGianThi Date,
    DiaDiemThi NVARCHAR(100),
    PhongThi INT,
    PRIMARY KEY (BaiThiID),
    CONSTRAINT FK_LichThi_ChungChiID FOREIGN KEY (ChungChiID) REFERENCES ChungChi(ChungChiID),
    CONSTRAINT FK_LichThi_MaPhongThi FOREIGN KEY (PhongThi) REFERENCES PhongThi(PhongThi)
);
GO

CREATE TABLE NhanVienCoiThi (
    NhanVienID INT,
    BaiThiID INT,
    PRIMARY KEY(NhanVienID, BaiThiID),
    CONSTRAINT FK_NVCoiThi_NhanVienID FOREIGN KEY(NhanVienID) REFERENCES NhanVien(NhanVienID),
    CONSTRAINT FK_NVCoiThi_BaiThiID FOREIGN KEY(BaiThiID) REFERENCES LichThi(BaiThiID),
);
GO

CREATE TABLE KhachHang (
    KhachHangID INT IDENTITY(1, 1),
    Hoten NVARCHAR(100),
    CCCD NVARCHAR(50),
    Phai NVARCHAR(10),
    Email NVARCHAR(100),
    Dienthoai NVARCHAR(50),
    LoaiKH NVARCHAR(50),
    PRIMARY KEY (KhachHangID),
    CONSTRAINT CHK_KH_gender CHECK (Phai IN (N'Nam', N'Nữ')),
    CONSTRAINT CHK_KH_type CHECK (LoaiKH IN (N'Cá Nhân', N'Đơn Vị'))
);
GO

CREATE TABLE PhieuDangKy (
    PhieuID INT IDENTITY(1, 1),
    KhachHangID INT,
    ThoiGianLap DATETIME,
    TinhTrangThanhToan BIT DEFAULT 0,
    TinhTrangHuy BIT,
    LoaiPhieu NVARCHAR(50),
    NVTiepNhanLap INT,
    PRIMARY KEY (PhieuID),
    CONSTRAINT CHK_LoaiPhieu_type CHECK (LoaiPhieu IN (N'Cá Nhân', N'Đơn Vị')),
    CONSTRAINT FK_PhieuDangKy_tiepnhan FOREIGN KEY(NVTiepNhanLap) REFERENCES TiepNhan(NhanVienID),
    CONSTRAINT FK_PhieuDangKy_khachhang FOREIGN KEY(KhachHangID) REFERENCES KhachHang(KhachHangID)
);
GO

CREATE TABLE HoaDon (
    HoaDonID INT IDENTITY(1, 1),
    PhieuID INT,
    ThoiGianLap DATETIME,
    SoTienTong INT,
    SoTienGiam INT,
    ThanhTien INT,
    TienNhan INT,
    HinhThucThanhToan  NVARCHAR(50),
    NVKeToanLap INT,
    PRIMARY KEY(HoaDonID),
    FOREIGN KEY(PhieuID) REFERENCES PhieuDangKy(PhieuID),
    FOREIGN KEY(NVKeToanLap) REFERENCES KeToan(NhanVienID)
);
GO

CREATE TABLE PhieuCaNhan (
    PhieuID INT,
    PRIMARY KEY (PhieuID),
    FOREIGN KEY (PhieuID) REFERENCES PhieuDangKy(PhieuID),
);
GO

CREATE TABLE PhieuDonVi (
    PhieuID INT,
    SoLuong INT,
    ChungChiID INT,
    NgayMongMuon DATETIME, 
    YeuCau NVARCHAR(500),
    NVKeToanHuy INT,
    PRIMARY KEY (PhieuID),
    FOREIGN KEY (PhieuID) REFERENCES PhieuDangKy(PhieuID),
    FOREIGN KEY(NVKeToanHuy) REFERENCES KeToan(NhanVienID),
    FOREIGN KEY (ChungChiID) REFERENCES ChungChi(ChungChiID)
);
GO

CREATE TABLE ThiSinh (
    ThiSinhID INT IDENTITY(1, 1),
    PhieuID INT,
    CCCD NVARCHAR(50),
    Hoten NVARCHAR(100),
    Phai NVARCHAR(10),
    PRIMARY KEY(ThiSinhID, PhieuID),
    FOREIGN KEY(PhieuID) REFERENCES PhieuDangKy(PhieuID),
    CONSTRAINT CHK_TS_gender CHECK (Phai IN (N'Nam', N'Nữ'))
);
GO

CREATE TABLE PhieuDuThi (
    SoBaoDanh INT IDENTITY(1, 1),
    ThiSinhID INT,
    PhieuID INT,
    NgayLap DATETIME,
    Diem REAL,
    LichThi INT,
    NVQuanLyLap INT,
    PRIMARY KEY(SoBaoDanh),
    FOREIGN KEY(ThiSinhID, PhieuID) REFERENCES ThiSinh(ThiSinhID, PhieuID),
    FOREIGN KEY(LichThi) REFERENCES LichThi(BaiThiID),
    FOREIGN KEY(NVQuanLyLap) REFERENCES QuanLy(NhanVienID)
);
GO

CREATE TABLE DanhSachCho (
    STT INT IDENTITY(1, 1),
    ThiSinhID INT,
    PhieuID INT,
    TinhTrang BIT,
    PRIMARY KEY(STT),
    FOREIGN KEY(ThiSinhID, PhieuID) REFERENCES ThiSinh(ThiSinhID, PhieuID),
);

CREATE TABLE KetQuaChungChi (
    KetQuaID INT IDENTITY(1, 1),
    NgayCap DATETIME,
    TrangThai NVARCHAR(100),
    XacNhanKhachHang BIT,
    NgayGui DATETIME,
    NguoiNhanID INT,
    NVNhapLieu INT,
    NVKeToanGui INT,
    PRIMARY KEY(KetQuaID),
    FOREIGN KEY(NguoiNhanID) REFERENCES KhachHang(KhachHangID),
    FOREIGN KEY(NVNhapLieu) REFERENCES NhapLieu(NhanVienID),
    FOREIGN KEY(NVKeToanGui) REFERENCES KeToan(NhanVienID)
);

CREATE TABLE DanhSachDKThi (
    PhieuID INT,
    BaiThiID INT,
    PRIMARY KEY(PhieuID, BaiThiID),
    FOREIGN KEY(BaiThiID) REFERENCES LichThi(BaiThiID),
    FOREIGN KEY(PhieuID) REFERENCES PhieuDangKy(PhieuID),
);
GO

CREATE TABLE PhieuGiaHan (
    PhieuGiaHanID INT IDENTITY(1, 1),
    TinhTrang NVARCHAR(100),
    NgayLap DATETIME,
    PhieuID INT,
    LichThiTruoc INT,
    LichThiSau INT,
    LoaiGiaHan NVARCHAR(50),
    PRIMARY KEY(PhieuGiaHanID),
    FOREIGN KEY(PhieuID) REFERENCES PhieuDangKy(PhieuID),
    FOREIGN KEY(LichThiTruoc) REFERENCES LichThi(BaiThiID),
    FOREIGN KEY(LichThiSau) REFERENCES LichThi(BaiThiID),
);
GO

CREATE TABLE PhieuThanhToan (
    ThanhToanID INT IDENTITY(1, 1),
    SoTienTong INT,
    SoTienGiam INT,
    ThanhTien INT,
    NgayLap DATETIME,
    MaThanhToan NVARCHAR(100),
    TinhTrangDuyet BIT,
    PhieuDonViID INT,
    NVKeToanLap INT,
    PRIMARY KEY(ThanhToanID),
    FOREIGN KEY(PhieuDonViID) REFERENCES PhieuDonVi(PhieuID),
    FOREIGN KEY(NVKeToanLap) REFERENCES KeToan(NhanVienID)
);
GO

-- 1. NhanVien (bảng cha gốc)
INSERT INTO NhanVien(Hoten, Ngaysinh, Diachi, loaiNV) VALUES
(N'Nguyễn Văn A', '1990-01-01', N'Hà Nội', N'quan ly'),
(N'Lê Thị B', '1985-03-15', N'Hồ Chí Minh', N'tiep nhan'),
(N'Phạm Văn C', '1992-05-20', N'Đà Nẵng', N'ke toan'),
(N'Trần Thị D', '1995-07-12', N'Hải Phòng', N'nhap lieu'),
(N'Hoàng Văn E', '1988-09-05', N'Hà Nội', N'quan ly');

-- 2. ACCOUNT (gắn với NhanVienID)
INSERT INTO ACCOUNT(NhanVienID, username, password) VALUES
(1, 'admin', '123456'),
(2, 'tiepnhan1', '123456'),
(3, 'ketoan1', '123456'),
(4, 'nhaplieu1', '123456'),
(5, 'quanly2', '123456');

-- 3. QuanLy, TiepNhan, KeToan, NhapLieu (chia loại nhân viên)
INSERT INTO QuanLy(NhanVienID) VALUES (1), (5);
INSERT INTO TiepNhan(NhanVienID) VALUES (2);
INSERT INTO KeToan(NhanVienID) VALUES (3);
INSERT INTO NhapLieu(NhanVienID) VALUES (4);

-- 4. ChungChi
INSERT INTO ChungChi(LoaiChungChi, TenChungChi, Gia) VALUES
(N'Tin học', N'Chứng chỉ A', 500000),
(N'Tin học', N'Chứng chỉ B', 600000),
(N'Ngoại ngữ', N'Chứng chỉ TOEIC', 800000),
(N'Kế toán', N'Chứng chỉ Kế toán trưởng', 1200000),
(N'CNTT', N'Chứng chỉ Lập trình', 1000000);


INSERT INTO PhongThi (TenPhong) VALUES
  (N'Phòng A101'),
  (N'Phòng A102'),
  (N'Phòng B201'),
  (N'Phòng B202'),
  (N'Phòng C301'),
  (N'Phòng C302');
GO
-- 5. LichThi (tham chiếu ChungChiID)
INSERT INTO LichThi(ChungChiID, ThoiGianLamBai, ThoiGianThi, DiaDiemThi, PhongThi) VALUES
(1, '13:00:00', '2025-06-10', N'Hà Nội', 1),
(2, '12:30:00', '2025-06-11', N'Hồ Chí Minh', 2),
(3, '08:00:00', '2025-06-12', N'Đà Nẵng', 3),
(4, '09:45:00', '2025-06-13', N'Hải Phòng', 4),
(5, '10:15:00', '2025-06-14', N'Cần Thơ', 5);
GO

INSERT INTO NhanVienCoiThi (NhanVienID, BaiThiID) VALUES
(1, 1),
(5, 1),
(1, 2),
(5, 3),
(1, 4),
(5, 5);
GO

-- 6. KhachHang
INSERT INTO KhachHang(Hoten, CCCD, Phai, Email, Dienthoai, LoaiKH) VALUES
(N'Nguyễn Văn Bình', N'0011223344', N'Nam', N'binh@gmail.com', N'0909123456', N'Cá Nhân'),
(N'Lê Thị Hoa', N'0022334455', N'Nữ', N'hoa@gmail.com', N'0912345678', N'Cá Nhân'),
(N'Công ty ABC', N'CN01234567', N'Nam', N'abc@company.com', N'0999888777', N'Đơn Vị'),
(N'Nguyễn Văn Cường', N'0033445566', N'Nam', N'cuong@gmail.com', N'0922333444', N'Cá Nhân'),
(N'Công ty XYZ', N'CN12345678', N'Nam', N'xyz@company.com', N'0988776655', N'Đơn Vị');
GO

-- 7. PhieuDangKy (NVTiepNhanLap thuộc TiepNhan (id=2), KhachHangID: 1-5)
INSERT INTO PhieuDangKy(KhachHangID, ThoiGianLap, TinhTrangThanhToan, TinhTrangHuy ,LoaiPhieu, NVTiepNhanLap) VALUES
(1, '2025-06-01', 1, 0, N'Cá Nhân', 2),
(2, '2025-06-01', 0, 0, N'Cá Nhân', 2),
(3, '2025-06-02', 1, 0, N'Đơn Vị', 2),
(4, '2025-06-03', 0, 0, N'Cá Nhân', 2),
(5, '2025-06-03', 1, 0, N'Đơn Vị', 2);

-- 8. HoaDon (PhieuID 1-5, NVKeToanLap: 3)
/*INSERT INTO HoaDon(PhieuID, ThoiGianLap, SoTienTong, SoTienGiam, ThanhTien, TienNhan, NVKeToanLap) VALUES
(1, '2025-06-01', 500000, 0, 500000, 500000, 3),
(2, '2025-06-01', 600000, 100000, 500000, 500000, 3),
(3, '2025-06-02', 1200000, 200000, 1000000, 1000000, 3),
(4, '2025-06-03', 800000, 0, 800000, 800000, 3),
(5, '2025-06-03', 1000000, 0, 1000000, 1000000, 3);*/

-- 9. PhieuCaNhan (PhieuID 1,2,4)
INSERT INTO PhieuCaNhan(PhieuID) VALUES (1), (2), (4);

-- 10. PhieuDonVi (PhieuID 3,5), NVKeToanHuy: 3
INSERT INTO PhieuDonVi(PhieuID, SoLuong, NVKeToanHuy) VALUES
(3, 5, 3),
(5, 10, 3);

-- 11. ThiSinh (PhieuID: 1-5)
INSERT INTO ThiSinh(PhieuID, CCCD, Hoten, Phai) VALUES
(1, N'111111111', N'Lê Văn Nam', N'Nam'),
(2, N'222222222', N'Lê Thị Lan', N'Nữ'),
(3, N'333333333', N'Ngô Văn Tài', N'Nam'),
(4, N'444444444', N'Phạm Thị Hồng', N'Nữ'),
(5, N'555555555', N'Trần Văn Kỳ', N'Nam');

-- 12. PhieuDuThi (ThiSinhID, PhieuID từ ThiSinh, LichThi 1-5, NVQuanLyLap: 1)
INSERT INTO PhieuDuThi(ThiSinhID, PhieuID, NgayLap, Diem, LichThi, NVQuanLyLap) VALUES
(1, 1, '2025-06-05', 8.5, 1, 1),
(2, 2, '2025-06-06', 7.0, 2, 1),
(3, 3, '2025-06-07', 9.0, 3, 1),
(4, 4, '2025-06-08', 6.5, 4, 1),
(5, 5, '2025-06-09', 8.0, 5, 1);

-- 13. DanhSachCho (SoBaoDanh: 1-5)
INSERT INTO DanhSachCho(ThiSinhID, PhieuID, TinhTrang) VALUES
(1, 1, 0),
(2, 2, 1),
(3, 3, 0),
(4, 4, 1),
(5, 5, 0);

-- 14. KetQuaChungChi (NguoiNhanID: KhachHangID 1-5, NVNhapLieu: 4, NVKeToanGui: 3)
INSERT INTO KetQuaChungChi(NgayCap, TrangThai, XacNhanKhachHang, NgayGui, NguoiNhanID, NVNhapLieu, NVKeToanGui) VALUES
('2025-06-15', N'Đã Cấp', 1, '2025-06-16', 1, 4, 3),
('2025-06-16', N'Chờ Xác Nhận', 0, NULL, 2, 4, 3),
('2025-06-17', N'Đã Cấp', 1, '2025-06-18', 3, 4, 3),
('2025-06-18', N'Chờ Xác Nhận', 0, NULL, 4, 4, 3),
('2025-06-19', N'Đã Cấp', 1, '2025-06-20', 5, 4, 3);

-- 15. DanhSachDKThi (PhieuID: 1-5, BaiThiID: 1-5)
INSERT INTO DanhSachDKThi(PhieuID, BaiThiID) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5);

-- 16. PhieuGiaHan (SoBaoDanh: 1-5, LichThiTruoc: 1-5, LichThiSau: 2-5,1)
INSERT INTO PhieuGiaHan(TinhTrang, NgayLap, PhieuID, LichThiTruoc, LichThiSau) VALUES
(N'Chờ duyệt', '2025-06-21', 1, 1, 2),
(N'Đã duyệt', '2025-06-22', 2, 2, 3),
(N'Đã duyệt', '2025-06-23', 3, 3, 4),
(N'Từ chối', '2025-06-24', 4, 4, 5),
(N'Chờ duyệt', '2025-06-25', 5, 5, 1);

-- 17. PhieuThanhToan (PhieuDonViID: 3,5; NVKeToanLap: 3)
/*INSERT INTO PhieuThanhToan(SoTienTong, SoTienGiam, ThanhTien, NgayLap, MaThanhToan, TinhTrangDuyet, PhieuDonViID, NVKeToanLap) VALUES
(1200000, 200000, 1000000, '2025-06-26', 1001, 1, 3, 3),
(1000000, 0, 1000000, '2025-06-27', 1002, 0, 5, 3),
(1500000, 500000, 1000000, '2025-06-28', 1003, 1, 3, 3),
(2000000, 0, 2000000, '2025-06-29', 1004, 1, 5, 3),
(1100000, 100000, 1000000, '2025-06-30', 1005, 0, 3, 3);*/

-- Lưu ý: Các ID tự động tăng (IDENTITY) bạn cần kiểm tra lại số thứ tự nếu đã có dữ liệu trước đó!


--------------------------------------------------------------------------------------------------------------------------------
------------------------------------
------CHỈNH SỬA:------
------------------------------------
-- 1. Tạo bảng PhongThi

-- 2. Thêm cột MaPhongThi vào LichThi và tạo FK

-- 3. Thêm cột MaPhongThi vào NhanVienCoiThi và tạo FK

-- 4) Thêm cột ChungChiID vào PhieuDonVi (cho phép NULL hoặc NOT NULL tuỳ nghiệp vụ)
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
------
------------------------------------
------INSERT DATA:------
------------------------------------
-- insert data:

-- update data
-- 
--
SELECT * FROM NhanVienCoiThi;
SELECT * FROM LichThi;
SELECT * FROM ChungChi;
SELECT * FROM PhieuDonVi;

