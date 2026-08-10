import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

router.get('/photographers', async (_req, res) => {
  const [rows] = await pool.query(`
    SELECT p.*, u.username
    FROM photographer_profiles p
    JOIN users u ON u.id=p.user_id
    WHERE u.status='active'
    ORDER BY p.id DESC
  `);
  res.json(rows);
});

router.get('/photographers/:id', async (req, res) => {
  const [pRows] = await pool.query(`
    SELECT p.*, u.username
    FROM photographer_profiles p
    JOIN users u ON u.id=p.user_id
    WHERE p.id=?
  `, [req.params.id]);

  if (!pRows[0]) return res.status(404).json({ message: 'Không tìm thấy photographer' });

  const [portfolio] = await pool.query(
    'SELECT * FROM portfolio_images WHERE photographer_id=? ORDER BY sort_order,id',
    [req.params.id]
  );
  const [packages] = await pool.query(
    "SELECT * FROM packages WHERE photographer_id=? AND status='active' ORDER BY price",
    [req.params.id]
  );

  res.json({ ...pRows[0], portfolio, packages });
});

router.get('/feed', async (_req, res) => {
  const [rows] = await pool.query(`
    SELECT f.*, p.name AS photographer_name
    FROM feed_posts f
    LEFT JOIN photographer_profiles p ON p.id=f.photographer_id
    ORDER BY f.created_at DESC
  `);
  res.json(rows);
});

router.get('/pages/:slug', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM page_sections WHERE page_slug=? AND is_active=1 ORDER BY sort_order,id',
    [req.params.slug]
  );
  res.json(rows);
});

router.post('/bookings', async (req, res) => {
  const {
    photographer_id, customer_name, phone, area, type='booking',
    package_id=null, shooting_date=null, people_count=1, message=''
  } = req.body;

  if (!customer_name || !phone || !area) {
    return res.status(400).json({ message: 'Vui lòng nhập tên, số điện thoại và khu vực' });
  }

  const [result] = await pool.query(`
    INSERT INTO bookings
    (photographer_id,customer_name,phone,area,type,package_id,shooting_date,people_count,message)
    VALUES (?,?,?,?,?,?,?,?,?)
  `, [photographer_id || null, customer_name, phone, area, type, package_id,
      shooting_date || null, people_count, message]);

  res.status(201).json({ message: 'Đã gửi yêu cầu', id: result.insertId });
});

export default router;
