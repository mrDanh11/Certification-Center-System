const express = require("express");
const router = express.Router();
const multer = require("multer");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
require('dotenv').config();

// Cấu hình Multer lưu file tạm
const upload = multer({ dest: "uploads/" });

// POST /api/send-pdf-email
router.post("/", upload.single("pdf"), async (req, res) => {
  const { email, hoten } = req.body;
  const file = req.file;

  if (!email || !file) return res.status(400).send("Thiếu email hoặc file PDF");

  try {
    // Tạo transporter gửi mail (dùng Gmail, hoặc SMTP khác)
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: '"Trung tâm Khảo thí" <thanhdat1605@gmail.com',
      to: email,
      subject: "Phiếu thanh toán đăng ký thi",
      text: `Chào ${hoten},\n\nĐính kèm là phiếu thanh toán của bạn.`,
      attachments: [
        {
          filename: file.originalname,
          path: file.path,
        },
      ],
    });

    // Gửi thành công → xóa file tạm
    fs.unlinkSync(file.path);

    res.status(200).json({ message: "Email đã được gửi thành công" });
  } catch (err) {
    console.error("Lỗi gửi email:", err);
    res.status(500).send("Gửi email thất bại");
  }
});

module.exports = router;