const mssql = require('mssql');
// Thiết lập kết nối với MySQL
const config = {
    server: "localhost",
    user: "NVHT",
    password: "1234@",
    database: "QuanLyDangKyThi",
    driver: "mssql",
    options:{
        encrypt: false,
        enableArithAbort: false,
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