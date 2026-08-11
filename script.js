// ======================================================
// 27GRADUATION - FRONTEND SCRIPT
// ======================================================

const API = "https://anh-tblm.onrender.com/api";

// ======================================================
// HELPER
// ======================================================

async function api(url, options = {}) {
    const config = {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    };

    const response = await fetch(API + url, config);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Có lỗi xảy ra");
    }

    return data;
}

function escapeHTML(value) {
    if (value === null || value === undefined) return "";

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function money(value) {
    return Number(value || 0).toLocaleString("vi-VN") + "đ";
}

// ======================================================
// LOAD PHOTOGRAPHERS
// ======================================================

async function loadPhotographers() {

    const container =
        document.querySelector("#photographerGrid");

    if (!container) return;

    container.innerHTML = `
        <div class="loading">
            Đang tải danh sách nhân viên...
        </div>
    `;

    try {

        const data = await api("/photographers");

        // Backend có thể trả:
        // { success: true, photographers: [...] }
        // hoặc trực tiếp [...]
        const photographers =
            Array.isArray(data)
                ? data
                : data.photographers || data.data || [];

        if (photographers.length === 0) {

            container.innerHTML = `
                <div class="empty">
                    Chưa có nhân viên nào.
                </div>
            `;

            return;
        }

        container.innerHTML = photographers.map(p => {

            return `
                <article
                    class="card photographer-card"
                    onclick="openPhotographer(${p.id})"
                >

                    <div class="card-image-wrapper">

                        <img
                            class="card-img"
                            src="${escapeHTML(
                                p.avatar || "images/default.jpg"
                            )}"
                            alt="${escapeHTML(p.name)}"
                            onerror="this.src='images/default.jpg'"
                        >

                        ${
                            p.verified
                                ? `
                                    <div class="verified">
                                        ✓ ĐÃ KIỂM DUYỆT
                                    </div>
                                  `
                                : ""
                        }

                    </div>

                    <div class="card-body">

                        <h3>
                            ${escapeHTML(p.name)}
                        </h3>

                        <div class="muted">

                            ${escapeHTML(p.area || "")}

                            ${
                                p.rating
                                    ? ` · ★ ${escapeHTML(p.rating)}`
                                    : ""
                            }

                            ${
                                p.shoots !== undefined
                                    ? ` · ${escapeHTML(p.shoots)} buổi đã chụp`
                                    : ""
                            }

                        </div>

                        <p>
                            ${escapeHTML(p.styles || "")}
                        </p>

                        ${
                            p.price_from
                                ? `
                                    <div class="price">
                                        Từ ${money(p.price_from)}
                                    </div>
                                  `
                                : ""
                        }

                    </div>

                </article>
            `;

        }).join("");

    } catch (error) {

        console.error(error);

        container.innerHTML = `
            <div class="empty">
                Không thể tải dữ liệu.
                <br>
                <small>${escapeHTML(error.message)}</small>
            </div>
        `;
    }
}

// ======================================================
// OPEN PHOTOGRAPHER PROFILE
// ======================================================

function openPhotographer(id) {

    window.location.href =
        `photographer.html?id=${encodeURIComponent(id)}`;
}

// ======================================================
// SEARCH
// ======================================================

async function searchPhotographers() {

    const keyword =
        document.querySelector("#q")?.value.trim() || "";

    const area =
        document.querySelector("#area")?.value.trim() || "";

    const container =
        document.querySelector("#photographerGrid");

    if (!container) return;

    container.innerHTML = `
        <div class="loading">
            Đang tìm kiếm...
        </div>
    `;

    try {

        const query =
            `?q=${encodeURIComponent(keyword)}` +
            `&area=${encodeURIComponent(area)}`;

        const data =
            await api("/photographers" + query);

        const photographers =
            Array.isArray(data)
                ? data
                : data.photographers || data.data || [];

        if (!photographers.length) {

            container.innerHTML = `
                <div class="empty">
                    Không tìm thấy nhân viên phù hợp.
                </div>
            `;

            return;
        }

        container.innerHTML =
            photographers.map(createPhotographerCard).join("");

    } catch (error) {

        container.innerHTML = `
            <div class="empty">
                ${escapeHTML(error.message)}
            </div>
        `;
    }
}

// ======================================================
// CREATE CARD
// ======================================================

function createPhotographerCard(p) {

    return `
        <article
            class="card photographer-card"
            onclick="openPhotographer(${p.id})"
        >

            <div class="card-image-wrapper">

                <img
                    class="card-img"
                    src="${escapeHTML(
                        p.avatar || "images/default.jpg"
                    )}"
                    alt="${escapeHTML(p.name)}"
                    onerror="this.src='images/default.jpg'"
                >

                ${
                    p.verified
                        ? `
                            <div class="verified">
                                ✓ ĐÃ KIỂM DUYỆT
                            </div>
                          `
                        : ""
                }

            </div>

            <div class="card-body">

                <h3>
                    ${escapeHTML(p.name)}
                </h3>

                <div class="muted">
                    ${escapeHTML(p.area || "")}
                    ${
                        p.rating
                            ? ` · ★ ${escapeHTML(p.rating)}`
                            : ""
                    }
                </div>

                <p>
                    ${escapeHTML(p.styles || "")}
                </p>

                <div class="price">
                    Từ ${money(p.price_from)}
                </div>

            </div>

        </article>
    `;
}

// ======================================================
// BOOKING MODAL
// ======================================================

function openBooking(photographerId) {

    const modal =
        document.querySelector("#bookingModal");

    if (!modal) {
        console.error("Không tìm thấy #bookingModal");
        return;
    }

    const idInput =
        modal.querySelector('[name="photographer_id"]');

    if (idInput) {
        idInput.value = photographerId;
    }

    modal.classList.add("active");
    modal.style.display = "flex";
}

function closeBooking() {

    const modal =
        document.querySelector("#bookingModal");

    if (!modal) return;

    modal.classList.remove("active");
    modal.style.display = "none";
}

// ======================================================
// BOOKING
// ======================================================

async function submitBooking(event) {

    event.preventDefault();

    const form = event.target;

    const submitButton =
        form.querySelector("button[type='submit']");

    const message =
        document.querySelector("#bookingMsg");

    const formData =
        new FormData(form);

    const data = {

        photographer_id:
            formData.get("photographer_id"),

        customer_name:
            formData.get("customer_name"),

        phone:
            formData.get("phone"),

        area:
            formData.get("area"),

        message:
            formData.get("message") || ""

    };

    if (!data.customer_name || !data.phone) {

        if (message) {
            message.textContent =
                "Vui lòng nhập họ tên và số điện thoại.";
        }

        return;
    }

    try {

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent =
                "Đang gửi...";
        }

        const result =
            await api("/bookings", {
                method: "POST",
                body: JSON.stringify(data)
            });

        if (message) {

            message.style.color = "green";

            message.textContent =
                result.message ||
                "Gửi yêu cầu thành công!";
        }

        form.reset();

        setTimeout(() => {
            closeBooking();
        }, 1500);

    } catch (error) {

        if (message) {

            message.style.color = "#b00020";

            message.textContent =
                error.message;
        }

    } finally {

        if (submitButton) {

            submitButton.disabled = false;
            submitButton.textContent =
                "Gửi yêu cầu";
        }
    }
}

// ======================================================
// CONTACT
// ======================================================

function openContact(photographerId) {

    openBooking(photographerId);
}

// ======================================================
// LOGIN
// ======================================================

async function loginSubmit(event) {

    event.preventDefault();

    const form = event.target;

    const message =
        document.querySelector("#loginMsg");

    const username =
        form.username.value.trim();

    const password =
        form.password.value;

    if (!username || !password) {

        if (message) {
            message.textContent =
                "Vui lòng nhập đầy đủ thông tin.";
        }

        return;
    }

    try {

        const result =
            await api("/login", {
                method: "POST",

                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

        if (!result.success) {
            throw new Error(
                result.message ||
                "Đăng nhập thất bại"
            );
        }

        // Lưu thông tin user
        localStorage.setItem(
            "user",
            JSON.stringify(result.user)
        );

        // Nếu backend có token
        if (result.token) {

            localStorage.setItem(
                "token",
                result.token
            );
        }

        // Admin
        if (result.user.role === "admin") {

            window.location.href =
                "/admin.html";

            return;
        }

        // Nhân viên
        window.location.href =
            "/profile.html";

    } catch (error) {

        console.error(error);

        if (message) {
            message.textContent =
                error.message;
        }
    }
}

// ======================================================
// LOGOUT
// ======================================================

function logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href =
        "/index.html";
}

// ======================================================
// CHECK LOGIN
// ======================================================

function getCurrentUser() {

    try {

        return JSON.parse(
            localStorage.getItem("user")
        );

    } catch {

        return null;
    }
}

// ======================================================
// PROFILE
// ======================================================

async function loadProfile() {

    const user =
        getCurrentUser();

    if (!user) {

        window.location.href =
            "/login.html";

        return;
    }

    const name =
        document.querySelector("#profileName");

    if (name) {
        name.textContent =
            user.username || "";
    }

    try {

        const data =
            await api(
                `/profile/${user.id}`
            );

        const profile =
            data.profile || data.user || data;

        fillProfile(profile);

    } catch (error) {

        console.error(
            "Không thể tải profile:",
            error
        );
    }
}

// ======================================================
// FILL PROFILE
// ======================================================

function fillProfile(profile) {

    const fields = [
        "name",
        "area",
        "phone",
        "email",
        "styles",
        "description",
        "price_from"
    ];

    fields.forEach(field => {

        const element =
            document.querySelector(
                `[name="${field}"]`
            );

        if (element && profile[field] !== undefined) {

            element.value =
                profile[field] ?? "";
        }
    });

    const avatar =
        document.querySelector("#profileAvatar");

    if (avatar && profile.avatar) {
        avatar.src = profile.avatar;
    }
}

// ======================================================
// UPDATE PROFILE
// ======================================================

async function updateProfile(event) {

    event.preventDefault();

    const user =
        getCurrentUser();

    if (!user) {
        window.location.href =
            "/login.html";
        return;
    }

    const form =
        event.target;

    const formData =
        new FormData(form);

    const data = {};

    formData.forEach((value, key) => {
        data[key] = value;
    });

    const message =
        document.querySelector("#profileMsg");

    try {

        const result =
            await api(
                `/profile/${user.id}`,
                {
                    method: "PUT",
                    body: JSON.stringify(data)
                }
            );

        if (message) {

            message.style.color =
                "green";

            message.textContent =
                result.message ||
                "Đã cập nhật profile.";
        }

    } catch (error) {

        if (message) {

            message.style.color =
                "#b00020";

            message.textContent =
                error.message;
        }
    }
}

// ======================================================
// INITIALIZE
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        // Trang chủ
        if (
            document.querySelector(
                "#photographerGrid"
            )
        ) {
            loadPhotographers();
        }

        // Form tìm kiếm
        const searchForm =
            document.querySelector(
                "#searchForm"
            );

        if (searchForm) {

            searchForm.addEventListener(
                "submit",
                event => {

                    event.preventDefault();

                    searchPhotographers();
                }
            );
        }

        // Login
        const loginForm =
            document.querySelector(
                "#loginForm"
            );

        if (loginForm) {

            loginForm.addEventListener(
                "submit",
                loginSubmit
            );
        }

        // Booking
        const bookingForm =
            document.querySelector(
                "#bookingForm"
            );

        if (bookingForm) {

            bookingForm.addEventListener(
                "submit",
                submitBooking
            );
        }

        // Profile
        const profileForm =
            document.querySelector(
                "#profileForm"
            );

        if (profileForm) {

            profileForm.addEventListener(
                "submit",
                updateProfile
            );

            loadProfile();
        }

        // Nút logout
        document
            .querySelectorAll(
                "[data-logout]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    logout
                );
            });

    }
);