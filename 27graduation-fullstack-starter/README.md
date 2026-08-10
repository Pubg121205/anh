# 27Graduation - Full Stack Starter

Stack:
- Frontend: React + Vite + React Router
- Backend: Node.js + Express
- Database: MySQL
- Auth: JWT + bcryptjs
- Upload: Multer (local uploads)

## 1. Backend

```bash
cd backend
npm install
```

Create `.env` from `.env.example`:

```env
PORT=5000
JWT_SECRET=change_this_secret
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=graduation
```

Create database and tables:

```bash
mysql -u root -p < database.sql
```

Start:

```bash
npm run dev
```

Backend: http://localhost:5000

## 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

## Demo accounts

After importing database.sql:
- Admin: `admin` / `admin123`
- Photographer: `mike` / `mike123`

Change these passwords before production.

## Main routes

Public:
- `/`
- `/photographers`
- `/photographers/:id`
- `/feed`
- `/huong-dan`
- `/bao-ve-khach`

Photographer:
- `/login`
- `/profile`

Admin:
- `/admin`
- `/admin/photographers`
- `/admin/bookings`
- `/admin/feed`
- `/admin/pages`

This starter is intentionally organized so the visual design can be refined to match the supplied screenshots without changing the API/database architecture.
