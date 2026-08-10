document.addEventListener("DOMContentLoaded",()=>{
  const path=location.pathname;
  if(path.endsWith("photographers.html")||path==="/") loadHome();
  const login=document.querySelector("#loginForm");
  if(login) login.addEventListener("submit",loginSubmit);
});
async function loadHome(){
  const box=document.querySelector("#photographerGrid"); if(!box)return;
  try{
    const data=await api("/photographers");
    box.innerHTML=data.map(p=>`
      <article class="card" onclick="location.href='photographer.html?id=${p.id}'">
        <img class="card-img" src="${esc(p.avatar)}" alt="">
        <div class="card-body">
          ${p.verified?'<div class="verified">✓ ĐÃ KIỂM DUYỆT</div>':''}
          <h3>${esc(p.name)}</h3>
          <div class="muted">${esc(p.area)} · ★ ${p.rating} · ${p.shoots} buổi đã chụp</div>
          <p>${esc(p.styles)}</p>
          <div class="price">Từ ${money(p.price_from)}</div>
        </div>
      </article>`).join("");
  }catch(e){box.innerHTML=`<div class="empty">${e.message}</div>`}
}
async function searchPhotographers(){
  const q=document.querySelector("#q")?.value||"";
  const area=document.querySelector("#area")?.value||"";
  const data=await api(`/photographers?q=${encodeURIComponent(q)}&area=${encodeURIComponent(area)}`);
  const box=document.querySelector("#photographerGrid");
  box.innerHTML=data.map(p=>`
    <article class="card" onclick="location.href='photographer.html?id=${p.id}'">
      <img class="card-img" src="${esc(p.avatar)}"><div class="card-body">
      <div class="verified">${p.verified?"✓ ĐÃ KIỂM DUYỆT":""}</div><h3>${esc(p.name)}</h3>
      <div class="muted">${esc(p.area)} · ★ ${p.rating}</div><p>${esc(p.styles)}</p>
      <div class="price">Từ ${money(p.price_from)}</div></div></article>`).join("");
}
async function loginSubmit(e){
  e.preventDefault();
  try{
    const data=await api("/auth/login",{method:"POST",body:JSON.stringify({username:e.target.username.value,password:e.target.password.value})});
    localStorage.setItem("token",data.token); localStorage.setItem("user",JSON.stringify(data.user));
    location.href=data.user.role==="admin"?"/admin/index.html":"/profile.html";
  }catch(err){document.querySelector("#loginMsg").textContent=err.message}
}
