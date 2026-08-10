const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "hoangtusnake.site",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "tgtusnakesite_graduation_user",
  password: process.env.DB_PASSWORD || "@14513563",
  database: process.env.DB_NAME || "tgtusnakesite_graduation",

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4"
});

module.exports = pool;
