const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

/* =========================
   DATABASE
========================= */

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    waitForConnections: true,
    connectionLimit: 10,

    charset: "utf8mb4"
});

const JWT_SECRET =
    process.env.JWT_SECRET ||
    "27graduation-secret";


/* =========================
   DATABASE TEST
========================= */

app.get("/api/test-db", async (req, res) => {

    try {

        const [rows] =
            await pool.query(
                "SELECT 1 AS connected"
            );

        res.json({
            success: true,
            database: "connected",
            result: rows
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: error.message
        });
    }
});


/* =========================
   CREATE FIRST ADMIN
========================= */

app.post("/api/setup-admin", async (req, res) => {

    try {

        const {
            username,
            password,
            name
        } = req.body;

        if (!username || !password) {

            return res.status(400).json({
                success: false,
                message:
                    "Username và password bắt buộc"
            });
        }

        const [exists] =
            await pool.query(
                "SELECT id FROM users WHERE username=?",
                [username]
            );

        if (exists.length) {

            return res.status(400).json({
                success: false,
                message:
                    "Tài khoản đã tồn tại"
            });
        }

        const hash =
            await bcrypt.hash(
                password,
                10
            );

        const [result] =
            await pool.query(
                `
                INSERT INTO users
                (
                    username,
                    password,
                    role,
                    name
                )
                VALUES (?, ?, 'admin', ?)
                `,
                [
                    username,
                    hash,
                    name || "Administrator"
                ]
            );

        res.json({
            success: true,
            id: result.insertId,
            message:
                "Tạo admin thành công"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


/* =========================
   LOGIN
========================= */

app.post("/api/login", async (req, res) => {

    try {

        const {
            username,
            password
        } = req.body;

        if (!username || !password) {

            return res.status(400).json({
                success: false,
                message:
                    "Nhập tài khoản và mật khẩu"
            });
        }

        const [rows] =
            await pool.query(
                `
                SELECT *
                FROM users
                WHERE username=?
                LIMIT 1
                `,
                [username]
            );

        if (!rows.length) {

            return res.status(401).json({
                success: false,
                message:
                    "Sai tài khoản hoặc mật khẩu"
            });
        }

        const user = rows[0];

        const valid =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!valid) {

            return res.status(401).json({
                success: false,
                message:
                    "Sai tài khoản hoặc mật khẩu"
            });
        }

        const token =
            jwt.sign(
                {
                    id: user.id,
                    username:
                        user.username,
                    role:
                        user.role
                },
                JWT_SECRET,
                {
                    expiresIn: "7d"
                }
            );

        res.json({
            success: true,
            token,

            user: {
                id: user.id,
                username:
                    user.username,
                role:
                    user.role,
                name:
                    user.name,
                avatar:
                    user.avatar
            }
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


/* =========================
   AUTH
========================= */

function auth(req, res, next) {

    const header =
        req.headers.authorization;

    if (!header) {

        return res.status(401).json({
            success: false,
            message:
                "Bạn chưa đăng nhập"
        });
    }

    const token =
        header.startsWith("Bearer ")
            ? header.substring(7)
            : null;

    if (!token) {

        return res.status(401).json({
            success: false,
            message:
                "Token không hợp lệ"
        });
    }

    try {

        req.user =
            jwt.verify(
                token,
                JWT_SECRET
            );

        next();

    } catch {

        return res.status(401).json({
            success: false,
            message:
                "Phiên đăng nhập đã hết hạn"
        });
    }
}


function adminOnly(req, res, next) {

    if (req.user.role !== "admin") {

        return res.status(403).json({
            success: false,
            message:
                "Chỉ admin mới được phép"
        });
    }

    next();
}


/* =========================
   GET PHOTOGRAPHERS
========================= */

app.get(
    "/api/photographers",
    async (req, res) => {

        try {

            const q =
                req.query.q || "";

            const area =
                req.query.area || "";

            const [rows] =
                await pool.query(
                    `
                    SELECT *
                    FROM photographers
                    WHERE
                    (
                        ? = ''
                        OR name LIKE CONCAT('%', ?, '%')
                        OR styles LIKE CONCAT('%', ?, '%')
                    )
                    AND
                    (
                        ? = ''
                        OR area LIKE CONCAT('%', ?, '%')
                    )
                    ORDER BY id DESC
                    `,
                    [
                        q,
                        q,
                        q,
                        area,
                        area
                    ]
                );

            res.json(rows);

        } catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);


/* =========================
   GET ONE PHOTOGRAPHER
========================= */

app.get(
    "/api/photographers/:id",
    async (req, res) => {

        try {

            const [rows] =
                await pool.query(
                    `
                    SELECT *
                    FROM photographers
                    WHERE id=?
                    `,
                    [req.params.id]
                );

            if (!rows.length) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Không tìm thấy photographer"
                });
            }

            res.json(rows[0]);

        } catch (error) {

            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);


/* =========================
   CREATE BOOKING
========================= */

app.post(
    "/api/bookings",
    async (req, res) => {

        try {

            const {
                photographer_id,
                customer_name,
                customer_phone,
                area,
                message
            } = req.body;

            if (
                !customer_name ||
                !customer_phone ||
                !area
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Vui lòng nhập đủ thông tin"
                });
            }

            const [result] =
                await pool.query(
                    `
                    INSERT INTO bookings
                    (
                        photographer_id,
                        customer_name,
                        customer_phone,
                        area,
                        message
                    )
                    VALUES (?, ?, ?, ?, ?)
                    `,
                    [
                        photographer_id || null,
                        customer_name,
                        customer_phone,
                        area,
                        message || ""
                    ]
                );

            res.json({
                success: true,
                id: result.insertId,
                message:
                    "Đã gửi yêu cầu đặt lịch"
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);


/* =========================
   ADMIN USERS
========================= */

app.get(
    "/api/admin/users",
    auth,
    adminOnly,
    async (req, res) => {

        try {

            const [rows] =
                await pool.query(
                    `
                    SELECT
                        id,
                        username,
                        role,
                        name,
                        phone,
                        email,
                        avatar,
                        created_at
                    FROM users
                    ORDER BY id DESC
                    `
                );

            res.json(rows);

        } catch (error) {

            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);


app.post(
    "/api/admin/users",
    auth,
    adminOnly,
    async (req, res) => {

        try {

            const {
                username,
                password,
                role,
                name,
                phone,
                email,
                avatar
            } = req.body;

            if (!username || !password || !name) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Thiếu thông tin bắt buộc"
                });
            }

            const hash =
                await bcrypt.hash(
                    password,
                    10
                );

            const [result] =
                await pool.query(
                    `
                    INSERT INTO users
                    (
                        username,
                        password,
                        role,
                        name,
                        phone,
                        email,
                        avatar
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    `,
                    [
                        username,
                        hash,
                        role || "photographer",
                        name,
                        phone || "",
                        email || "",
                        avatar || ""
                    ]
                );

            res.json({
                success: true,
                id: result.insertId
            });

        } catch (error) {

            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);


app.put(
    "/api/admin/users/:id",
    auth,
    adminOnly,
    async (req, res) => {

        try {

            const {
                name,
                role,
                phone,
                email,
                avatar,
                password
            } = req.body;

            if (password) {

                const hash =
                    await bcrypt.hash(
                        password,
                        10
                    );

                await pool.query(
                    `
                    UPDATE users
                    SET
                        name=?,
                        role=?,
                        phone=?,
                        email=?,
                        avatar=?,
                        password=?
                    WHERE id=?
                    `,
                    [
                        name,
                        role,
                        phone,
                        email,
                        avatar,
                        hash,
                        req.params.id
                    ]
                );

            } else {

                await pool.query(
                    `
                    UPDATE users
                    SET
                        name=?,
                        role=?,
                        phone=?,
                        email=?,
                        avatar=?
                    WHERE id=?
                    `,
                    [
                        name,
                        role,
                        phone,
                        email,
                        avatar,
                        req.params.id
                    ]
                );
            }

            res.json({
                success: true
            });

        } catch (error) {

            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);


app.delete(
    "/api/admin/users/:id",
    auth,
    adminOnly,
    async (req, res) => {

        try {

            await pool.query(
                `
                DELETE FROM users
                WHERE id=?
                `,
                [req.params.id]
            );

            res.json({
                success: true
            });

        } catch (error) {

            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);


/* =========================
   ADMIN PHOTOGRAPHERS
========================= */

app.post(
    "/api/admin/photographers",
    auth,
    adminOnly,
    async (req, res) => {

        try {

            const p = req.body;

            const [result] =
                await pool.query(
                    `
                    INSERT INTO photographers
                    (
                        user_id,
                        name,
                        avatar,
                        cover,
                        area,
                        rating,
                        shoots,
                        price_from,
                        styles,
                        verified,
                        bio,
                        phone,
                        facebook,
                        instagram
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `,
                    [
                        p.user_id || null,
                        p.name,
                        p.avatar || "",
                        p.cover || "",
                        p.area || "",
                        p.rating || 5,
                        p.shoots || 0,
                        p.price_from || 0,
                        p.styles || "",
                        p.verified ? 1 : 0,
                        p.bio || "",
                        p.phone || "",
                        p.facebook || "",
                        p.instagram || ""
                    ]
                );

            res.json({
                success: true,
                id: result.insertId
            });

        } catch (error) {

            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);


app.put(
    "/api/admin/photographers/:id",
    auth,
    adminOnly,
    async (req, res) => {

        try {

            const p = req.body;

            await pool.query(
                `
                UPDATE photographers
                SET
                    user_id=?,
                    name=?,
                    avatar=?,
                    cover=?,
                    area=?,
                    rating=?,
                    shoots=?,
                    price_from=?,
                    styles=?,
                    verified=?,
                    bio=?,
                    phone=?,
                    facebook=?,
                    instagram=?
                WHERE id=?
                `,
                [
                    p.user_id || null,
                    p.name,
                    p.avatar || "",
                    p.cover || "",
                    p.area || "",
                    p.rating || 5,
                    p.shoots || 0,
                    p.price_from || 0,
                    p.styles || "",
                    p.verified ? 1 : 0,
                    p.bio || "",
                    p.phone || "",
                    p.facebook || "",
                    p.instagram || "",
                    req.params.id
                ]
            );

            res.json({
                success: true
            });

        } catch (error) {

            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);


app.delete(
    "/api/admin/photographers/:id",
    auth,
    adminOnly,
    async (req, res) => {

        try {

            await pool.query(
                `
                DELETE FROM photographers
                WHERE id=?
                `,
                [req.params.id]
            );

            res.json({
                success: true
            });

        } catch (error) {

            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);


/* =========================
   ADMIN BOOKINGS
========================= */

app.get(
    "/api/admin/bookings",
    auth,
    adminOnly,
    async (req, res) => {

        try {

            const [rows] =
                await pool.query(
                    `
                    SELECT
                        bookings.*,
                        photographers.name
                        AS photographer_name
                    FROM bookings
                    LEFT JOIN photographers
                    ON bookings.photographer_id
                    =
                    photographers.id
                    ORDER BY bookings.id DESC
                    `
                );

            res.json(rows);

        } catch (error) {

            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);


app.put(
    "/api/admin/bookings/:id",
    auth,
    adminOnly,
    async (req, res) => {

        try {

            await pool.query(
                `
                UPDATE bookings
                SET status=?
                WHERE id=?
                `,
                [
                    req.body.status,
                    req.params.id
                ]
            );

            res.json({
                success: true
            });

        } catch (error) {

            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);


app.delete(
    "/api/admin/bookings/:id",
    auth,
    adminOnly,
    async (req, res) => {

        try {

            await pool.query(
                `
                DELETE FROM bookings
                WHERE id=?
                `,
                [req.params.id]
            );

            res.json({
                success: true
            });

        } catch (error) {

            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);


/* =========================
   CONTENT
========================= */

app.get(
    "/api/content",
    async (req, res) => {

        try {

            const [rows] =
                await pool.query(
                    `
                    SELECT *
                    FROM contents
                    ORDER BY id
                    `
                );

            res.json(rows);

        } catch (error) {

            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);


app.put(
    "/api/admin/content/:section",
    auth,
    adminOnly,
    async (req, res) => {

        try {

            const {
                title,
                content,
                image
            } = req.body;

            await pool.query(
                `
                UPDATE contents
                SET
                    title=?,
                    content=?,
                    image=?
                WHERE section=?
                `,
                [
                    title,
                    content,
                    image || "",
                    req.params.section
                ]
            );

            res.json({
                success: true
            });

        } catch (error) {

            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);


/* =========================
   FRONTEND
========================= */

app.use(
    express.static(
        path.join(
            __dirname,
            "public"
        )
    )
);


/*
   Trang chủ
*/
app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );
});


/*
   Không tìm thấy API
*/
app.use("/api", (req, res) => {

    res.status(404).json({
        success: false,
        message: "API không tồn tại"
    });
});


/* =========================
   START
========================= */

const PORT =
    process.env.PORT || 10000;

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `27Graduation running on port ${PORT}`
        );

    }
);
