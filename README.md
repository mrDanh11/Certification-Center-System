<h1 align="center">📚 Certification Center Management System</h1>

<p align="center">
  <b>Web Application to Support Exam Registration, Management, and Certificate Issuance</b><br>
  <i>Developed by a group of students from the Faculty of Information Technology</i>
</p>

---

## 📖 Introduction

Welcome to the **Certification Center Management System**! This is a comprehensive web application designed to simplify the process of registering, managing, and issuing certificates for exams. The system provides an intuitive and secure platform, serving both exam registrants and the center's management team.

---

## 🚀 Technologies

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js Badge" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js Badge" />
  <img src="https://img.shields.io/badge/HBS-ffbf00?style=for-the-badge&logo=handlebarsdotjs&logoColor=black" alt="Handlebars.js Badge" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS Badge" />
  <img src="https://img.shields.io/badge/SQL_Server-CC2927?style=for-the-badge&logo=microsoftsqlserver&logoColor=white" alt="SQL Server Badge" />
  <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT Badge" />
</p>

---

## ✨ Key Features

The system offers a comprehensive set of powerful features for end-to-end certification process management:

* 📝 **Registration & Application Management:**
    * **Certificate Exam Registration**: Supports easy registration for both individuals and organizations.
    * **Application Management**: Efficiently review and manage exam registration applications.
    * **Application Processing**: Flexible options to cancel applications and request extensions.

* 💳 **Payment & Lookups:**
    * **Exam Fee Payment**: Integrates convenient online payment functionality (simulated).
    * **Information Lookup**: Easily view exam schedules, locations, and fees.

* 🛡️ **Certificate Management & User Roles:**
    * **Issuance Status Updates**: Meticulously manage and track certificate issuance statuses.
    * **User Role Permissions**: Customized interfaces and functionalities for each role ensure effective management:
        * 👨‍💼 **Accounting Staff**: Focuses on managing payment transactions.
        * 👩‍💼 **Management Staff**: Approves applications and oversees certificate issuance.
        * 👨‍💻 **Reception Staff**: Responsible for receiving and processing initial registration applications.
        * 🌐 **Unregistered Users**: Can look up information and perform exam registrations.
---


---

## 📸 Screenshots

The system features an intuitive interface designed for each user role:

### 👩‍💼 Management Staff Interface

<p align="center">
  <img src="./src/public/img/NVQL_HomePage.png" alt="Management Staff Home Page" width="400" height="240" />
  <img src="./src/public/img/NVQL_TaoLichThi.png" alt="Management Staff creating an exam schedule" width="400" height="240" />
</p>

### 👨‍💻 Reception Staff Interface

<p align="center">
  <img src="./src/public/img/NVTN_HomePage.png" alt="Reception Staff Home Page" width="400" height="240" />
  <img src="./src/public/img/NVTN_CapChungChi.png" alt="Reception Staff issuing a certificate" width="400" height="240" />
  <img src="./src/public/img/NVTN_DKMonThi.png" alt="Reception Staff registering for an exam subject" width="400" height="240" />
</p>

### 👨‍💼 Accounting Staff Interface

<p align="center">
  <img src="./src/public/img/NVKT_HomePage.png" alt="Accounting Staff Home Page" width="400" height="240" />
  <img src="./src/public/img/NVKT_DSThanhToan.png" alt="Accounting Staff viewing payment list" width="400" height="240" />
  <img src="./src/public/img/NVKT_ThanhToan.png" alt="Accounting Staff processing payment" width="400" height="240" />
</p>

---


## 📐 Project Architecture
```
CERTIFICATION-CENTER-SYSTEM/
├── src/
│   ├── config/           # Database connection configuration, environment variables
│   ├── modules/          # Contains business logic for each feature
│   │   ├── NVKT/         # Functionality for Accounting Staff
│   │   ├── NVQL/         # Functionality for Management Staff
│   │   ├── NVTN/         # Functionality for Reception Staff
│   │   └── Unlogin/      # Functionality for unauthenticated users
│   ├── public/           # Static assets (images, js, css)
│   │   ├── css/
│   │   ├── img/
│   │   └── js/
│   ├── routes/           # Module-based routing
│   │   ├── NVKT/
│   │   ├── NVQL/
│   │   ├── NVTN/
│   │   └── Unlogin/
│   └── views/            # HBS (Handlebars) templates
├── uploads/              # Directory for uploaded files (images, application forms, etc.)
├── .env                  # Environment variables for the application
├── app.js                # Application entry point
├── createTable.sql       # Database table creation script
├── package.json          # Manages dependencies and scripts
├── tailwind.config.js    # Tailwind CSS configuration
└── README.md             # Project documentation (this file)
```

---

## ⚙️ **Install & Run**:

### 1. Clone the Project

```bash
git clone [https://github.com/mrDanh11/Certification-Center-System.git](https://github.com/mrDanh11/Certification-Center-System.git)
cd Certification-Center-System
```
### 2. Install Dependencies
```bash
npm install
```
### 3. Configure .env
```bash
PORT=8080
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_database
DB_SERVER=localhost
JWT_SECRET=your_jwt_secret
```

### 4. Start the Application
```bash
npm run start:dev
```
Access the application at: http://localhost:3000
---

## 📌 Notes

* The user interface is built with **Handlebars** and **Tailwind CSS**.
* Data is stored and managed by **Microsoft SQL Server**.
* The system uses **JWT (JSON Web Tokens)** to ensure secure user authentication and authorization.
* Clear role-based access control ensures each user role can only access appropriate functionalities.

---

## 👨‍💻 Team Members

* Nguyen Duc Anh
* Bui Duy An
* Vu Duy Bac
* Nguyen Chi Danh
* Nguy Thanh Dat

University of Science - Faculty of Information Technology
Academic Year 2022–2026

---

## 📄 License

This project is developed for educational purposes and internal sharing within the scope of the Web Application Development course.


