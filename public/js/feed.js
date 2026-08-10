document.addEventListener("DOMContentLoaded",async()=>{
  const box=document.querySelector("#feedGrid");if(!box)return;
  const data=await api("/feed");
  box.innerHTML=data.map(p=>`<article class="card"><img class="card-img" src="${esc(p.image_url)}"><div class="card-body"><h3>${esc(p.title)}</h3><p>${esc(p.caption)}</p><div class="muted">${esc(p.photographer_name)}</div></div></article>`).join("");
});
