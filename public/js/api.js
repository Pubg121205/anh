const API="/api";
function token(){return localStorage.getItem("token")||""}
async function api(path,options={}){
  options.headers={...(options.headers||{}),"Content-Type":"application/json"};
  if(token()) options.headers.Authorization="Bearer "+token();
  const r=await fetch(API+path,options);
  const data=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(data.message||"Có lỗi");
  return data;
}
function money(n){return Number(n||0).toLocaleString("vi-VN")+"đ"}
function esc(s=""){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
