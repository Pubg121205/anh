const jwt = require("jsonwebtoken");

function auth(req,res,next){
  const token = (req.headers.authorization || "").replace("Bearer ","");
  if(!token) return res.status(401).json({message:"Chưa đăng nhập"});
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    next();
  } catch(e) {
    return res.status(401).json({message:"Token không hợp lệ"});
  }
}
function admin(req,res,next){
  if(req.user?.role !== "admin") return res.status(403).json({message:"Không có quyền"});
  next();
}
module.exports = {auth,admin};
