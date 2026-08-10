const router = require("express").Router();
const bcrypt = require("bcryptjs");
const pool = require("../db/pool");
const {auth,admin}=require("../middleware/auth");
router.use(auth,admin);

router.get("/stats",async(req,res)=>{
  const [[photographers]]=await pool.query("SELECT COUNT(*) c FROM photographers");
  const [[bookings]]=await pool.query("SELECT COUNT(*) c FROM bookings");
  const [[customers]]=await pool.query("SELECT COUNT(DISTINCT phone) c FROM bookings");
  const [[feed]]=await pool.query("SELECT COUNT(*) c FROM feed_posts");
  res.json({photographers:photographers.c,bookings:bookings.c,customers:customers.c,feed:feed.c});
});

router.get("/photographers",async(req,res)=>{
  const [rows]=await pool.query(`SELECT p.*,u.username,u.active FROM photographers p LEFT JOIN users u ON u.id=p.user_id ORDER BY p.id DESC`);
  res.json(rows);
});
router.post("/photographers",async(req,res)=>{
  try{
    const {username,password,name,area,avatar,cover,bio,styles,price_from}=req.body;
    const hash=await bcrypt.hash(password||"123456",10);
    const [u]=await pool.query("INSERT INTO users(username,password_hash,role) VALUES(?,?,'photographer')",[username,hash]);
    const [p]=await pool.query(`INSERT INTO photographers(user_id,name,area,avatar,cover,bio,styles,price_from) VALUES(?,?,?,?,?,?,?,?)`,
      [u.insertId,name,area||"",avatar||"",cover||"",bio||"",styles||"",price_from||0]);
    res.json({id:p.insertId});
  }catch(e){res.status(400).json({message:e.message});}
});
router.put("/photographers/:id",async(req,res)=>{
  try{
    const {name,area,avatar,cover,bio,styles,price_from,verified}=req.body;
    await pool.query(`UPDATE photographers SET name=?,area=?,avatar=?,cover=?,bio=?,styles=?,price_from=?,verified=? WHERE id=?`,
      [name,area,avatar,cover,bio,styles,price_from||0,verified?1:0,req.params.id]);
    res.json({message:"Đã cập nhật"});
  }catch(e){res.status(400).json({message:e.message});}
});
router.delete("/photographers/:id",async(req,res)=>{
  await pool.query("DELETE FROM photographers WHERE id=?",[req.params.id]);
  res.json({message:"Đã xóa"});
});

router.get("/bookings",async(req,res)=>{
  const [rows]=await pool.query(`SELECT b.*,p.name photographer_name FROM bookings b LEFT JOIN photographers p ON p.id=b.photographer_id ORDER BY b.id DESC`);
  res.json(rows);
});
router.put("/bookings/:id",async(req,res)=>{
  await pool.query("UPDATE bookings SET status=? WHERE id=?",[req.body.status,req.params.id]);
  res.json({message:"Đã cập nhật"});
});
router.delete("/bookings/:id",async(req,res)=>{
  await pool.query("DELETE FROM bookings WHERE id=?",[req.params.id]);
  res.json({message:"Đã xóa"});
});

router.get("/feed",async(req,res)=>{const [r]=await pool.query("SELECT * FROM feed_posts ORDER BY id DESC");res.json(r);});
router.post("/feed",async(req,res)=>{
  const {title,image_url,caption,photographer_name}=req.body;
  const [r]=await pool.query("INSERT INTO feed_posts(title,image_url,caption,photographer_name) VALUES(?,?,?,?)",[title||"",image_url,caption||"",photographer_name||""]);
  res.json({id:r.insertId});
});
router.put("/feed/:id",async(req,res)=>{
  const {title,image_url,caption,photographer_name}=req.body;
  await pool.query("UPDATE feed_posts SET title=?,image_url=?,caption=?,photographer_name=? WHERE id=?",[title,image_url,caption,photographer_name,req.params.id]);
  res.json({message:"Đã cập nhật"});
});
router.delete("/feed/:id",async(req,res)=>{await pool.query("DELETE FROM feed_posts WHERE id=?",[req.params.id]);res.json({message:"Đã xóa"});});

router.get("/cms/:slug",async(req,res)=>{const [[r]]=await pool.query("SELECT * FROM cms_pages WHERE slug=?",[req.params.slug]);res.json(r||{});});
router.put("/cms/:slug",async(req,res)=>{
  await pool.query("UPDATE cms_pages SET title=?,content=? WHERE slug=?",[req.body.title,req.body.content,req.params.slug]);
  res.json({message:"Đã lưu"});
});
module.exports=router;
