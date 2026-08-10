import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();
router.use(authenticate, requireRole('admin'));

router.get('/dashboard', async (_req,res) => {
  const [[photographers]] = await pool.query("SELECT COUNT(*) count FROM users WHERE role='photographer'");
  const [[bookings]] = await pool.query("SELECT COUNT(*) count FROM bookings");
  const [[newBookings]] = await pool.query("SELECT COUNT(*) count FROM bookings WHERE status='new'");
  const [[feed]] = await pool.query("SELECT COUNT(*) count FROM feed_posts");
  res.json({
    photographers: photographers.count,
    bookings: bookings.count,
    newBookings: newBookings.count,
    feed: feed.count
  });
});

router.get('/photographers', async (_req,res) => {
  const [rows] = await pool.query(`
    SELECT p.*,u.username,u.email,u.status
    FROM photographer_profiles p JOIN users u ON u.id=p.user_id
    ORDER BY p.id DESC
  `);
  res.json(rows);
});

router.post('/photographers', async (req,res) => {
  const {
    username,email,password,name,location='',price_from=0,
    style='',bio='',avatar='',cover_image=''
  } = req.body;

  if (!username || !password || !name) {
    return res.status(400).json({message:'Username, mật khẩu và tên là bắt buộc'});
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const hash = await bcrypt.hash(password,10);
    const [u] = await conn.query(
      "INSERT INTO users(username,email,password,role) VALUES(?,?,?,'photographer')",
      [username,email || null,hash]
    );
    await conn.query(`
      INSERT INTO photographer_profiles
      (user_id,name,location,price_from,style,bio,avatar,cover_image)
      VALUES(?,?,?,?,?,?,?,?)
    `,[u.insertId,name,location,price_from,style,bio,avatar,cover_image]);
    await conn.commit();
    res.status(201).json({message:'Đã tạo photographer',id:u.insertId});
  } catch(e) {
    await conn.rollback();
    res.status(400).json({message:e.message});
  } finally {
    conn.release();
  }
});

router.put('/photographers/:id', async (req,res) => {
  const id = req.params.id;
  const {
    name,location,price_from,style,bio,avatar,cover_image,
    rating,review_count,shooting_count,response_time,response_rate,verified,status
  } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [p] = await conn.query('SELECT user_id FROM photographer_profiles WHERE id=?',[id]);
    if (!p[0]) return res.status(404).json({message:'Không tìm thấy'});
    await conn.query(`
      UPDATE photographer_profiles SET
      name=?,location=?,price_from=?,style=?,bio=?,avatar=?,cover_image=?,
      rating=?,review_count=?,shooting_count=?,response_time=?,response_rate=?,verified=?
      WHERE id=?
    `,[name,location,price_from,style,bio,avatar,cover_image,rating,review_count,
       shooting_count,response_time,response_rate,verified,id]);
    await conn.query('UPDATE users SET status=? WHERE id=?',[status || 'active',p[0].user_id]);
    await conn.commit();
    res.json({message:'Đã cập nhật'});
  } catch(e) {
    await conn.rollback();
    res.status(400).json({message:e.message});
  } finally { conn.release(); }
});

router.delete('/photographers/:id', async (req,res) => {
  await pool.query('DELETE FROM photographer_profiles WHERE id=?',[req.params.id]);
  res.json({message:'Đã xóa photographer'});
});

router.get('/bookings', async (_req,res) => {
  const [rows] = await pool.query(`
    SELECT b.*, p.name AS photographer_name, pk.name AS package_name
    FROM bookings b
    LEFT JOIN photographer_profiles p ON p.id=b.photographer_id
    LEFT JOIN packages pk ON pk.id=b.package_id
    ORDER BY b.created_at DESC
  `);
  res.json(rows);
});

router.put('/bookings/:id', async (req,res) => {
  const {status} = req.body;
  await pool.query('UPDATE bookings SET status=? WHERE id=?',[status,req.params.id]);
  res.json({message:'Đã cập nhật trạng thái'});
});

router.delete('/bookings/:id', async (req,res) => {
  await pool.query('DELETE FROM bookings WHERE id=?',[req.params.id]);
  res.json({message:'Đã xóa yêu cầu'});
});

router.get('/feed', async (_req,res) => {
  const [rows] = await pool.query(`
    SELECT f.*,p.name photographer_name
    FROM feed_posts f LEFT JOIN photographer_profiles p ON p.id=f.photographer_id
    ORDER BY f.id DESC
  `);
  res.json(rows);
});

router.post('/feed', upload.single('image'), async (req,res) => {
  const url = req.file
    ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
    : req.body.image_url;

  if (!url) return res.status(400).json({message:'Thiếu ảnh'});

  const [r] = await pool.query(
    'INSERT INTO feed_posts (photographer_id,image_url,caption,category,location) VALUES (?,?,?,?,?)',
    [req.body.photographer_id || null,url,req.body.caption || '',req.body.category || '',req.body.location || '']
  );
  res.status(201).json({id:r.insertId,url});
});

router.delete('/feed/:id', async (req,res) => {
  await pool.query('DELETE FROM feed_posts WHERE id=?',[req.params.id]);
  res.json({message:'Đã xóa bài'});
});

router.get('/pages/:slug', async (req,res) => {
  const [rows] = await pool.query(
    'SELECT * FROM page_sections WHERE page_slug=? ORDER BY sort_order,id',[req.params.slug]
  );
  res.json(rows);
});

router.put('/pages/section/:id', async (req,res) => {
  const {title,subtitle,content,icon,image_url,sort_order,is_active} = req.body;
  await pool.query(`
    UPDATE page_sections SET title=?,subtitle=?,content=?,icon=?,image_url=?,sort_order=?,is_active=?
    WHERE id=?
  `,[title,subtitle,content,icon,image_url,sort_order,is_active,req.params.id]);
  res.json({message:'Đã cập nhật nội dung'});
});

router.delete('/pages/section/:id', async (req,res) => {
  await pool.query('DELETE FROM page_sections WHERE id=?',[req.params.id]);
  res.json({message:'Đã xóa nội dung'});
});

export default router;
