require("dotenv").config();
const express=require("express");
const cors=require("cors");
const path=require("path");
const app=express();

app.use(cors());
app.use(express.json({limit:"5mb"}));
app.use(express.urlencoded({extended:true}));
app.use("/uploads",express.static(path.join(__dirname,"../public/uploads")));
app.use(express.static(path.join(__dirname,"../public")));

app.use("/api/auth",require("./routes/auth"));
app.use("/api",require("./routes/public"));
app.use("/api/admin",require("./routes/admin"));

app.get("*",(req,res)=>{
  if(req.path.startsWith("/api/")) return res.status(404).json({message:"API not found"});
  res.sendFile(path.join(__dirname,"../public/index.html"));
});

const PORT=process.env.PORT||5000;
app.listen(PORT,"0.0.0.0",()=>console.log(`27Graduation running on http://localhost:${PORT}`));
