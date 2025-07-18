const mssql = require('mssql');
require("dotenv").config();
// Thiết lập kết nối với MySQL
const config = {
    server: process.env.DB_SERVER,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    driver: "mssql",
    options: {
        encrypt: process.env.DB_ENCRYPT === "true",
        enableArithAbort: process.env.DB_ARITHABORT === "true",
    }
};


try {
    const pool = new mssql.ConnectionPool(config);
    console.log('hello, db is connected');
    module.exports = {
        pool,
        sql_Int: mssql.Int,
        sql_Str: mssql.NVarChar,
        sql_Bool: mssql.Bit,
        sql_Date: mssql.Date,
        sql_DateTime: mssql.DateTime,
    };
}
catch (error) {
    console.log(error);
    throw(error);
}