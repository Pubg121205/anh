const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");

const app = express();

app.use(cors({
    origin: [
        "https://hoangtusnake.site",
        "http://localhost:3000",
        "http://localhost:5500"
    ],
    credentials: true
}));

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "27Graduation API đang hoạt động"
    });
});

app.get("/api/test-db", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT 1 AS test");

        res.json({
            success: true,
            database: "connected",
            result: rows
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Không kết nối được database",
            error: error.message
        });
    }
});

app.post("/api/login", async (req, res) => {

    try {

        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Thiếu tài khoản hoặc mật khẩu"
            });
        }

        const [users] = await pool.query(
            `
            SELECT *
            FROM users
            WHERE username = ?
            LIMIT 1
            `,
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Sai tài khoản hoặc mật khẩu"
            });
        }

        const user = users[0];

        if (user.password !== password) {
            return res.status(401).json({
                success: false,
                message: "Sai tài khoản hoặc mật khẩu"
            });
        }

        res.json({
            success: true,
            message: "Đăng nhập thành công",
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Lỗi server",
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
