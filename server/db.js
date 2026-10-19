require("dotenv").config();

const mysql = require("mysql2");

const pool = mysql.createPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || "",
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306
});

module.exports = pool.promise();