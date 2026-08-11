const express = require("express");
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config();

const app = express();

const cors = require("cors");

app.use(cors({
    origin: [
        "https://hoangtusnake.site",
        "http://localhost:5500",
        "http://localhost:3000"
    ],
    credentials: true
}));
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

        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập tài khoản và mật khẩu"
            });
        }

        const [rows] = await pool.query(
            `
            SELECT *
            FROM users
            WHERE username = ?
            LIMIT 1
            `,
            [username]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Sai tài khoản hoặc mật khẩu"
            });
        }

        const user = rows[0];

        // KHÔNG MÃ HÓA
        if (user.password !== password) {
            return res.status(401).json({
                success: false,
                message: "Sai tài khoản hoặc mật khẩu"
            });
        }

        // Tạo token đăng nhập
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role
            },
            JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.json({
            success: true,
            message: "Đăng nhập thành công",

            token: token,

            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role
            }
        });

    } catch (error) {

        console.error("LOGIN ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Lỗi server",
            error: error.message
        });
    }
});


app.get(
    "/api/profile",
    auth,
    async (req, res) => {

        try {

            const [users] =
                await pool.query(
                    `
                    SELECT
                        id,
                        username,
                        name,
                        phone,
                        email,
                        role,
                        avatar
                    FROM users
                    WHERE id = ?
                    LIMIT 1
                    `,
                    [req.user.id]
                );


            if (users.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy tài khoản"
                });

            }


            const user =
                users[0];


            let photographer = null;


            if (
                user.role ===
                "photographer"
            ) {

                const [rows] =
                    await pool.query(
                        `
                        SELECT *
                        FROM photographers
                        WHERE user_id = ?
                        LIMIT 1
                        `,
                        [user.id]
                    );


                if (rows.length > 0) {

                    photographer =
                        rows[0];

                }

            }


            res.json({

                success: true,

                user: user,

                photographer:
                    photographer

            });


        } catch (error) {

            console.error(
                "PROFILE ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Không lấy được thông tin tài khoản",

                error:
                    error.message

            });

        }

    }
);

// =========================
// PROFILE - UPDATE
// =========================

app.put("/api/profile", auth, async (req, res) => {

    const connection = await pool.getConnection();

    try {

        await connection.beginTransaction();

        const userId = req.user.id;

        const {
            name,
            phone,
            email,
            avatar,

            cover,
            area,
            price_from,
            styles,
            bio,
            phone_photo,
            facebook,
            instagram
        } = req.body;


        // =========================
        // 1. UPDATE USERS
        // =========================

        await connection.query(
            `
            UPDATE users
            SET
                name = ?,
                phone = ?,
                email = ?,
                avatar = ?
            WHERE id = ?
            `,
            [
                name || "",
                phone || "",
                email || "",
                avatar || "",
                userId
            ]
        );


        // =========================
        // 2. TÌM PHOTOGRAPHER
        // =========================

        const [photographers] =
            await connection.query(
                `
                SELECT *
                FROM photographers
                WHERE user_id = ?
                LIMIT 1
                `,
                [userId]
            );


        // =========================
        // 3. UPDATE PHOTOGRAPHER
        // =========================

        if (photographers.length > 0) {

            const photographer =
                photographers[0];

            await connection.query(
                `
                UPDATE photographers
                SET
                    name = ?,
                    avatar = ?,
                    cover = ?,
                    area = ?,
                    price_from = ?,
                    styles = ?,
                    bio = ?,
                    phone = ?,
                    facebook = ?,
                    instagram = ?
                WHERE id = ?
                `,
                [
                    name || photographer.name || "",
                    avatar || photographer.avatar || "",
                    cover || photographer.cover || "",
                    area || photographer.area || "",
                    Number(
                        price_from ??
                        photographer.price_from ??
                        0
                    ),
                    styles ?? photographer.styles ?? "",
                    bio ?? photographer.bio ?? "",
                    phone_photo ??
                        photographer.phone ??
                        "",
                    facebook ??
                        photographer.facebook ??
                        "",
                    instagram ??
                        photographer.instagram ??
                        "",

                    photographer.id
                ]
            );

        }


        await connection.commit();


        res.json({
            success: true,
            message: "Đã lưu thay đổi"
        });


    } catch (error) {

        await connection.rollback();

        console.error(
            "PROFILE UPDATE ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Không thể lưu thay đổi",
            error: error.message
        });


    } finally {

        connection.release();

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

// =========================
// ADMIN - THÊM NHÂN VIÊN
// =========================

app.post(
    "/api/admin/users",
    auth,
    adminOnly,
    async (req, res) => {

        try {

            const {
                username,
                password,
                name,
                phone,
                email,
                role,
                avatar
            } = req.body;

            // Kiểm tra dữ liệu
            if (!username || !password || !name) {
                return res.status(400).json({
                    success: false,
                    message: "Vui lòng nhập tài khoản, mật khẩu và họ tên"
                });
            }

            // Kiểm tra tài khoản đã tồn tại
            const [exists] = await pool.query(
                "SELECT id FROM users WHERE username = ? LIMIT 1",
                [username]
            );

            if (exists.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Tài khoản đã tồn tại"
                });
            }

            // =========================
            // THÊM USER
            // =========================

            const [result] = await pool.query(
                `
                INSERT INTO users
                (
                    username,
                    password,
                    name,
                    phone,
                    email,
                    role,
                    avatar
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    username,
                    password,
                    name,
                    phone || "",
                    email || "",
                    role || "photographer",
                    avatar || ""
                ]
            );

            const userId = result.insertId;

            // =========================
            // NẾU LÀ PHOTOGRAPHER
            // TẠO THÔNG TIN HIỂN THỊ
            // =========================

            if (role === "photographer") {

                await pool.query(
                    `
                    INSERT INTO photographers
                    (
                        user_id,
                        name,
                        avatar,
                        rating,
                        shoots,
                        price_from,
                        verified
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    `,
                    [
                        userId,
                        name,
                        avatar || "",
                        5,
                        0,
                        0,
                        0
                    ]
                );
            }

            res.json({
                success: true,
                message: "Thêm nhân viên thành công",
                id: userId
            });

        } catch (error) {

            console.error(
                "ADD USER ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message: "Không thể thêm nhân viên",
                error: error.message
            });
        }
    }
);
/* =========================
   GET PHOTOGRAPHERS
========================= */
app.get("/api/photographers", async (req, res) => {

    try {

        const q =
            String(req.query.q || "").trim();

        const area =
            String(req.query.area || "").trim();

        let sql = `
            SELECT
                p.id,
                p.user_id,
                p.name,
                p.avatar,
                p.cover,
                p.area,
                p.rating,
                p.shoots,
                p.price_from,
                p.styles,
                p.bio,
                p.phone,
                p.facebook,
                p.instagram,
                p.verified
            FROM photographers p
            WHERE 1 = 1
        `;

        const params = [];

        if (q) {

            sql += `
                AND (
                    p.name LIKE ?
                    OR p.styles LIKE ?
                    OR p.area LIKE ?
                )
            `;

            const keyword = `%${q}%`;

            params.push(
                keyword,
                keyword,
                keyword
            );
        }

        if (area) {

            sql += `
                AND p.area LIKE ?
            `;

            params.push(
                `%${area}%`
            );
        }

        sql += `
            ORDER BY
                p.verified DESC,
                p.rating DESC,
                p.id DESC
        `;

        const [rows] =
            await pool.query(
                sql,
                params
            );

        res.json(rows);

    } catch (error) {

        console.error(
            "GET /api/photographers:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Không lấy được danh sách Photographer",
            error: error.message
        });
    }

});



// =========================
// GET ẢNH PROFILE
// =========================

app.get(
    "/api/profile/images",
    auth,
    async (req, res) => {

        try {

            const [rows] = await pool.query(
                `
                SELECT
                    pi.id,
                    pi.image_url,
                    pi.sort_order
                FROM photographer_images pi
                INNER JOIN photographers p
                    ON p.id = pi.photographer_id
                WHERE p.user_id = ?
                ORDER BY
                    pi.sort_order ASC,
                    pi.id ASC
                `,
                [req.user.id]
            );

            res.json(rows);

        } catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                message: "Không lấy được ảnh"
            });

        }

    }
);



// =========================
// THÊM ẢNH PROFILE
// =========================

app.post(
    "/api/profile/images",
    auth,
    async (req, res) => {

        try {

            const {
                image_url
            } = req.body;

            if (!image_url) {

                return res.status(400).json({
                    success: false,
                    message: "Thiếu URL ảnh"
                });

            }

            const [photographers] =
                await pool.query(
                    `
                    SELECT id
                    FROM photographers
                    WHERE user_id = ?
                    LIMIT 1
                    `,
                    [req.user.id]
                );

            if (!photographers.length) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Tài khoản chưa có Photographer"
                });

            }

            const photographerId =
                photographers[0].id;

            await pool.query(
                `
                INSERT INTO photographer_images
                (
                    photographer_id,
                    image_url
                )
                VALUES (?, ?)
                `,
                [
                    photographerId,
                    image_url
                ]
            );

            res.json({
                success: true,
                message: "Đã thêm ảnh"
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                message: "Không thể thêm ảnh",
                error: error.message
            });

        }

    }
);


// Lấy danh sách tài khoản photographer
app.get("/api/admin/photographer-users", auth, async (req, res) => {

    try {

        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Không có quyền"
            });
        }

        const [users] = await pool.query(`
            SELECT
                id,
                username,
                name,
                role
            FROM users
            WHERE role = 'photographer'
            ORDER BY id DESC
        `);

        const [photographers] = await pool.query(`
            SELECT
                id,
                user_id,
                name,
                area
            FROM photographers
            ORDER BY id DESC
        `);

        res.json({
            users,
            photographers
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Không lấy được dữ liệu"
        });
    }
});


app.put("/api/admin/photographer-users/:userId", auth, async (req, res) => {

    try {

        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Không có quyền"
            });
        }

        const userId = req.params.userId;
        const photographerId =
            req.body.photographer_id;

        if (!photographerId) {
            return res.status(400).json({
                message: "Thiếu Photographer"
            });
        }

        // Kiểm tra user
        const [users] = await pool.query(
            `
            SELECT id
            FROM users
            WHERE id = ?
            AND role = 'photographer'
            `,
            [userId]
        );

        if (!users.length) {
            return res.status(404).json({
                message: "Không tìm thấy tài khoản Photographer"
            });
        }

        // Kiểm tra Photographer
        const [photographers] = await pool.query(
            `
            SELECT id
            FROM photographers
            WHERE id = ?
            `,
            [photographerId]
        );

        if (!photographers.length) {
            return res.status(404).json({
                message: "Không tìm thấy Photographer"
            });
        }

        // Gán user vào profile
        await pool.query(
            `
            UPDATE photographers
            SET user_id = ?
            WHERE id = ?
            `,
            [
                userId,
                photographerId
            ]
        );

        res.json({
            success: true,
            message: "Đã gán tài khoản với Photographer"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Không thể gán Photographer",
            error: error.message
        });
    }
});

// =========================
// XÓA ẢNH PROFILE
// =========================

app.delete(
    "/api/profile/images/:id",
    auth,
    async (req, res) => {

        try {

            const imageId =
                req.params.id;

            await pool.query(
                `
                DELETE pi
                FROM photographer_images pi
                INNER JOIN photographers p
                    ON p.id = pi.photographer_id
                WHERE
                    pi.id = ?
                    AND p.user_id = ?
                `,
                [
                    imageId,
                    req.user.id
                ]
            );

            res.json({
                success: true,
                message: "Đã xóa ảnh"
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                message: "Không thể xóa ảnh"
            });

        }

    }
);





async function loadPhotographerAccounts() {

    const box =
        document.getElementById(
            "photographerAccountList"
        );

    try {

        const data =
            await api(
                "/admin/photographer-users"
            );

        box.innerHTML =
            data.users.map(user => {

                const current =
                    data.photographers.find(
                        p =>
                            Number(p.user_id) ===
                            Number(user.id)
                    );

                return `
                    <div class="admin-card">

                        <div>

                            <strong>
                                ${escapeHTML(
                                    user.name ||
                                    user.username
                                )}
                            </strong>

                            <p>
                                Username:
                                ${escapeHTML(
                                    user.username
                                )}
                            </p>

                            <p>
                                ${
                                    current
                                    ? `
                                    Đang gán:
                                    <b>
                                        ${escapeHTML(
                                            current.name
                                        )}
                                    </b>
                                    `
                                    :
                                    `
                                    <span style="color:#c00">
                                        Chưa gán Photographer
                                    </span>
                                    `
                                }
                            </p>

                        </div>

                        <div>

                            <select
                                id="photographer-${user.id}"
                            >

                                <option value="">
                                    -- Chọn Photographer --
                                </option>

                                ${
                                    data.photographers
                                    .map(p => `
                                        <option
                                            value="${p.id}"
                                            ${
                                                current &&
                                                Number(current.id) ===
                                                Number(p.id)
                                                ? "selected"
                                                : ""
                                            }
                                        >
                                            #${p.id}
                                            -
                                            ${escapeHTML(p.name)}
                                            ${
                                                p.area
                                                ? " - " +
                                                  escapeHTML(p.area)
                                                : ""
                                            }
                                        </option>
                                    `)
                                    .join("")
                                }

                            </select>

                            <button
                                class="button"
                                onclick="
                                    assignPhotographer(
                                        ${user.id}
                                    )
                                "
                            >
                                Gán Profile
                            </button>

                        </div>

                    </div>
                `;

            }).join("");

    } catch (error) {

        console.error(error);

        box.innerHTML =
            `<p class="error">
                ${escapeHTML(error.message)}
            </p>`;
    }
}




async function assignPhotographer(userId) {

    const select =
        document.getElementById(
            `photographer-${userId}`
        );

    const photographerId =
        select.value;

    if (!photographerId) {

        alert(
            "Hãy chọn Photographer"
        );

        return;
    }

    try {

        await api(
            `/admin/photographer-users/${userId}`,
            {
                method: "PUT",

                body: JSON.stringify({
                    photographer_id:
                        photographerId
                })
            }
        );

        alert(
            "Đã gán tài khoản với Photographer!"
        );

        loadPhotographerAccounts();

    } catch (error) {

        alert(
            error.message
        );
    }
}

// =========================
// EXPLORE - ẢNH PHOTOGRAPHER
// =========================
app.get("/api/explore", async (req, res) => {
    try {

        const [rows] = await pool.query(`
            SELECT
                pi.id,
                pi.image_url,
                p.name AS photographer_name,
                p.area
            FROM photographer_images pi
            INNER JOIN photographers p
                ON p.id = pi.photographer_id
            ORDER BY pi.id DESC
        `);

        res.json(rows);

    } catch (error) {

        console.error("EXPLORE ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Không lấy được ảnh Explore"
        });

    }
});

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
