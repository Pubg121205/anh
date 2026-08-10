const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db/pool");

router.post("/login", async (req,res)=>{
  try{
    const {username,password}=req.body;
    const [rows]=await pool.query("SELECT * FROM users WHERE username=? AND active=1",[username]);
    if(!rows.length || !(await bcrypt.compare(password,rows[0].password_hash)))
      return res.status(401).json({message:"Sai tài khoản hoặc mật khẩu"});
    const u=rows[0];
    const token=jwt.sign({id:u.id,username:u.username,role:u.role},process.env.JWT_SECRET||"dev_secret",{expiresIn:"7d"});
    res.json({token,user:{id:u.id,username:u.username,role:u.role}});
  }catch(e){res.status(500).json({message:e.message});}
});
module.exports=router;
