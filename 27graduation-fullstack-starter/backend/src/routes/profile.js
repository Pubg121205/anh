import { Router } from 'express';
import pool from '../config/db.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();
router.use(authenticate, requireRole('photographer'));

async function getProfile(userId) {
  const [rows] = await pool.query(`
    SELECT p.*, u.username, u.email
    FROM photographer_profiles p
    JOIN users u ON u.id=p.user_id
    WHERE p.user_id=?
  `, [userId]);
  return rows[0];
}

router.get('/', async (req,res) => {
  const profile = await getProfile(req.user.id);
  if (!profile) return res.status(404).json({message:'Chưa có hồ sơ'});
  const [portfolio] = await pool.query('SELECT * FROM portfolio_images WHERE photographer_id=? ORDER BY sort_order,id',[profile.id]);
  const [packages] = await pool.query('SELECT * FROM packages WHERE photographer_id=? ORDER BY id DESC',[profile.id]);
  res.json({...profile, portfolio, packages});
});

router.put('/', async (req,res) => {
  const profile = await getProfile(req.user.id);
  if (!profile) return res.status(404).json({message:'Chưa có hồ sơ'});

  const allowed = ['name','location','bio','style','price_from','response_time','response_rate'];
  const updates = [];
  const values = [];
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      updates.push(`${key}=?`);
      values.push(req.body[key]);
    }
  }
  if (updates.length) {
    values.push(profile.id);
    await pool.query(`UPDATE photographer_profiles SET ${updates.join(',')} WHERE id=?`, values);
  }
  res.json({message:'Đã cập nhật'});
});

router.post('/avatar', upload.single('image'), async (req,res) => {
  const profile = await getProfile(req.user.id);
  if (!req.file || !profile) return res.status(400).json({message:'Thiếu ảnh'});
  const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  await pool.query('UPDATE photographer_profiles SET avatar=? WHERE id=?',[url,profile.id]);
  res.json({url});
});

router.post('/cover', upload.single('image'), async (req,res) => {
  const profile = await getProfile(req.user.id);
  if (!req.file || !profile) return res.status(400).json({message:'Thiếu ảnh'});
  const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  await pool.query('UPDATE photographer_profiles SET cover_image=? WHERE id=?',[url,profile.id]);
  res.json({url});
});

router.post('/portfolio', upload.single('image'), async (req,res) => {
  const profile = await getProfile(req.user.id);
  if (!req.file || !profile) return res.status(400).json({message:'Thiếu ảnh'});
  const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  const [r] = await pool.query(
    'INSERT INTO portfolio_images (photographer_id,image_url,title,description) VALUES (?,?,?,?)',
    [profile.id,url,req.body.title || '',req.body.description || '']
  );
  res.status(201).json({id:r.insertId,url});
});

router.delete('/portfolio/:id', async (req,res) => {
  const profile = await getProfile(req.user.id);
  await pool.query('DELETE FROM portfolio_images WHERE id=? AND photographer_id=?',[req.params.id,profile.id]);
  res.json({message:'Đã xóa ảnh'});
});

router.post('/packages', async (req,res) => {
  const profile = await getProfile(req.user.id);
  const {name,description='',price,duration='',max_people=1,location=''} = req.body;
  const [r] = await pool.query(
    'INSERT INTO packages (photographer_id,name,description,price,duration,max_people,location) VALUES (?,?,?,?,?,?,?)',
    [profile.id,name,description,price,duration,max_people,location]
  );
  res.status(201).json({id:r.insertId});
});

router.put('/packages/:id', async (req,res) => {
  const profile = await getProfile(req.user.id);
  const {name,description,price,duration,max_people,location,status} = req.body;
  await pool.query(`
    UPDATE packages SET name=?,description=?,price=?,duration=?,max_people=?,location=?,status=?
    WHERE id=? AND photographer_id=?
  `,[name,description,price,duration,max_people,location,status || 'active',req.params.id,profile.id]);
  res.json({message:'Đã cập nhật gói'});
});

router.delete('/packages/:id', async (req,res) => {
  const profile = await getProfile(req.user.id);
  await pool.query('DELETE FROM packages WHERE id=? AND photographer_id=?',[req.params.id,profile.id]);
  res.json({message:'Đã xóa gói'});
});

export default router;
