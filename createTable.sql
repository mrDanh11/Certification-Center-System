CREATE TABLE NhanVien (
    NhanVienID INT IDENTITY(1, 1),
    Hoten NVARCHAR(100),
    Ngaysinh DATETIME,
    Diachi NVARCHAR(200),
    loaiNV NVARCHAR(50),
    PRIMARY KEY (NhanVienID),
    CONSTRAINT CHK_nhanvien_type CHECK (loaiNV IN (N'quan ly', N'tiep nhan', N'ke toan', N'nhap lieu')), 
);
GO

CREATE TABLE QuanLy (
    NhanVienID INT,
    CONSTRAINT FK_QuanLy FOREIGN KEY (NhanVienID) REFERENCES NhanVien(NhanVienID)
);
GO

CREATE TABLE TiepNhan (
    NhanVienID INT,
    CONSTRAINT FK_TiepNhan FOREIGN KEY (NhanVienID) REFERENCES NhanVien(NhanVienID)
);
GO

CREATE TABLE KeToan (
    NhanVienID INT,
    CONSTRAINT FK_KeToan FOREIGN KEY (NhanVienID) REFERENCES NhanVien(NhanVienID)
);
GO

CREATE TABLE NhapLieu (
    NhanVienID INT,
    CONSTRAINT FK_NhapLieu FOREIGN KEY (NhanVienID) REFERENCES NhanVien(NhanVienID)
);
GO

CREATE TABLE ChungChi (
    ChungChiID INT IDENTITY(1, 1),
    LoaiChungChi NVARCHAR(100),
    TenChungChi NVARCHAR(100),
    PRIMARY KEY(MaChungChi),
);
GO

CREATE TABLE LichThi (
    BaiThiID INT IDENTITY(1, 1),
    ChungChiID INT,
    LoaiBaiThi NVARCHAR(100),
    TenBaiThi NVARCHAR(100),
    ThoiGianLamBai INT,
    DiaDiemThi NVARCHAR(100),
    PRIMARY KEY(BaiThiID),
    FOREIGN KEY(ChungChiID) REFERENCES ChungChi(ChungChiID)
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
    CONSTRAINT CHK_KH_gender CHECK Phai IN (N'Nam', N'Nữ'),
    CONSTRAINT CHK_KH_type CHECK LoaiKH IN (N'Cá Nhân', N'Đơn Vị')
);
GO

CREATE TABLE KHCaNhan (
    KhachHangID INT, 
    PRIMARY KEY (KhachHangID),
    FOREIGN KEY KhachHangID REFERENCES KhachHang(KhachHangID)
);
GO

CREATE TABLE KHDonVi (
    KhachHangID INT, 
    PRIMARY KEY KhachHangID,
    FOREIGN KEY KhachHangID REFERENCES KhachHang(KhachHangID)
);
GO

-- ER Keo Khach hang -> PhieuDK , khong phan biet loai
CREATE TABLE PhieuDangKy (
    PhieuID INT IDENTITY(1, 1),
    KhachHangID INT,
    LoaiKH NVARCHAR(50),
    ThoiGianLap DATETIME,
    TinhTrangThanhToan BIT DEFAULT 0,
    LoaiPhieu NVARCHAR(50),
    NVTiepNhanLap INT,
    PRIMARY KEY PhieuID,
    CONSTRAINT CHK_KH_type CHECK LoaiKH IN (N'Cá Nhân', N'Đơn Vị'),
    CONSTRAINT CHK_LoaiPhieu_type CHECK LoaiPhieu IN (N'Cá Nhân', N'Đơn Vị'),
    FOREIGN KEY(NVTiepNhanLap) REFERENCES TiepNhan(NhanVienID),
    FOREIGN KEY(KhachHangID) REFERENCES KhachHang(KhachHangID),
);
GO

-- So do ER khong phai thuc the con 
CREATE TABLE HoaDon (
    HoaDonID INT IDENTITY(1, 1),
    PhieuID INT,
    ThoiGianLap DATETIME,
    SoTienTong INT,
    SoTienGiam INT,
    ThanhTien INT,
    NVKeToanLap INT,
    PRIMARY KEY(HoaDonID),
    FOREIGN KEY(PhieuID) REFERENCES PhieuDangKy(PhieuID),
    FOREIGN KEY(NVKeToanLap) REFERENCES KeToan(NhanVienID)
);
GO

CREATE TABLE PhieuCaNhan (
    PhieuID INT,
    PRIMARY KEY (PhieuID),
    FOREIGN KEY PhieuID REFERENCES PhieuDangKy(PhieuID),
);
GO

CREATE TABLE PhieuDonVi (
    PhieuID INT,
    SoLuong INT,
    SoTienGiam INT,
    TinhTrangHuy BIT,
    NVKeToanHuy INT,
    PRIMARY KEY (PhieuID),
    FOREIGN KEY PhieuID REFERENCES PhieuDangKy(PhieuID),
    FOREIGN KEY(NVKeToanHuy) REFERENCES KeToan(NhanVienID)
);
GO

CREATE TABLE ThiSinh (
    ThiSinhID INT IDENTITY(1, 1),
    PhieuID INT,
    CCCD NVARCHAR(50),
    Hoten NVARCHAR(100),
    Phai NVARCHAR(10),
    PRIMARY KEY(ThiSinhID, PhieuID),
    FOREIGN KEY(PhieuID) REFERENCES PhieuDangKy(PhieuID)
    CONSTRAINT CHK_KH_gender CHECK Phai IN (N'Nam', N'Nữ'),
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
    SoBaoDanh INT,
    PRIMARY KEY(STT),
    FOREIGN KEY(SoBaoDanh) REFERENCES PhieuDuThi(SoBaoDanh),
);

CREATE TABLE KetQuaChungChi (
    KetQuaID INT IDENTITY(1, 1),
    LoaiChungChi NVARCHAR(100),
    NgayCap DATETIME,
    TrangThai NVARCHAR(100),
    XacNhanKhachHang BIT,
    NgayGui DATETIME
    NguoiNhanID INT,
    NVNhapLieu INT,
    PRIMARY KEY(MaKetQua),
    FOREIGN KEY(NguoiNhanID) REFERENCES KhachHang(KhachHangID),
    FOREIGN KEY(NVNhapLieu) REFERENCES NhapLieu(NhanVienID)
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
    SoBaoDanh INT,
    LichThiTruoc INT,
    LichThiSau INT,
    PRIMARY KEY(PhieuGiaHanID),
    FOREIGN KEY(SoBaoDanh) REFERENCES PhieuDuThi(SoBaoDanh),
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
    PhieuDonViID INT,
    NVKeToanLap INT,
    PRIMARY KEY(ThanhToanID),
    FOREIGN KEY(PhieuDonViID) REFERENCES PhieuDonVi(PhieuID),
    FOREIGN KEY(NVKeToanLap) REFERENCES KeToan(NhanVienID)
);
GO
