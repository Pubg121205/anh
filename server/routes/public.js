const router = require("express").Router();
const pool = require("../db/pool");

router.get("/photographers", async(req,res)=>{
  try{
    const {q="",area=""}=req.query;
    let sql="SELECT * FROM photographers WHERE name LIKE ? AND area LIKE ? ORDER BY id DESC";
    const [rows]=await pool.query(sql,[`%${q}%`,`%${area}%`]);
    res.json(rows);
  }catch(e){res.status(500).json({message:e.message});}
});

router.get("/photographers/:id",async(req,res)=>{
  try{
    const [[p]]=await pool.query("SELECT * FROM photographers WHERE id=?",[req.params.id]);
    if(!p) return res.status(404).json({message:"Không tìm thấy"});
    const [packages]=await pool.query("SELECT * FROM packages WHERE photographer_id=?",[p.id]);
    const [portfolio]=await pool.query("SELECT * FROM portfolio WHERE photographer_id=? ORDER BY id DESC",[p.id]);
    res.json({...p,packages,portfolio});
  }catch(e){res.status(500).json({message:e.message});}
});

router.get("/feed",async(req,res)=>{
  const [rows]=await pool.query("SELECT * FROM feed_posts ORDER BY id DESC");
  res.json(rows);
});

router.get("/cms/:slug",async(req,res)=>{
  const [[row]]=await pool.query("SELECT * FROM cms_pages WHERE slug=?",[req.params.slug]);
  if(!row) return res.status(404).json({message:"Không tìm thấy"});
  res.json(row);
});

router.post("/bookings",async(req,res)=>{
  try{
    const {photographer_id,customer_name,phone,area,shoot_date,people,package_name,message,type="hire"}=req.body;
    if(!customer_name||!phone||!area) return res.status(400).json({message:"Thiếu tên, số điện thoại hoặc khu vực"});
    await pool.query(
      `INSERT INTO bookings(photographer_id,customer_name,phone,area,shoot_date,people,package_name,message,type)
       VALUES(?,?,?,?,?,?,?,?,?)`,
      [photographer_id||null,customer_name,phone,area,shoot_date||null,people||1,package_name||"",message||"",type]
    );
    res.json({message:"Đã gửi yêu cầu"});
  }catch(e){res.status(500).json({message:e.message});}
});
module.exports=router;
