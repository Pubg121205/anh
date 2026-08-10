async function loadPhotographer(){
  const id=new URLSearchParams(location.search).get("id");
  if(!id)return;
  try{
    const p=await api("/photographers/"+id);
    document.querySelector("#profile").innerHTML=`
      <div class="profile-hero" style="background-image:url('${esc(p.cover)}')"><div class="container">
        <div class="profile-panel"><div class="verified">${p.verified?"✓ ĐÃ KIỂM DUYỆT":""}</div>
        <h1>${esc(p.name)}</h1><div class="muted">${esc(p.area)} · ★ ${p.rating} · ${p.shoots} buổi đã chụp</div>
        <p>${esc(p.styles)}</p><button class="btn btn-dark" onclick="openBooking(${p.id},'${esc(p.name)}')">Đặt lịch với ${esc(p.name)} →</button>
        </div></div></div>
      <section class="section container"><div class="profile-main"><div>
      <h2>Giới thiệu</h2><p>${esc(p.bio)}</p><h2>Portfolio</h2>
      <div class="gallery">${p.portfolio.map(x=>`<img src="${esc(x.image_url)}" alt="${esc(x.caption)}">`).join("")}</div>
      </div><aside><h2>Gói chụp</h2>${p.packages.map(x=>`<div class="package"><b>${esc(x.name)}</b><p>${esc(x.description)}</p><strong>${money(x.price)}</strong><div class="muted">${esc(x.duration)}</div></div>`).join("")}</aside></div></section>`;
  }catch(e){document.querySelector("#profile").innerHTML=`<div class="container section">${e.message}</div>`}
}
function openBooking(id,name){
  document.querySelector("#bookingModal").classList.add("show");
  document.querySelector("#photographerId").value=id;
  document.querySelector("#bookingTitle").textContent="Đặt lịch với "+name;
}
function closeBooking(){document.querySelector("#bookingModal").classList.remove("show")}
async function submitBooking(e){
  e.preventDefault();
  try{
    await api("/bookings",{method:"POST",body:JSON.stringify({
      photographer_id:Number(e.target.photographer_id.value),customer_name:e.target.customer_name.value,
      phone:e.target.phone.value,area:e.target.area.value,shoot_date:e.target.shoot_date.value,
      people:e.target.people.value,package_name:e.target.package_name.value,message:e.target.message.value,type:"hire"
    })});
    alert("Đã gửi yêu cầu. Photographer sẽ liên hệ bạn.");
    closeBooking();e.target.reset();
  }catch(err){alert(err.message)}
}
document.addEventListener("DOMContentLoaded",()=>{if(document.querySelector("#profile"))loadPhotographer();document.querySelector("#bookingForm")?.addEventListener("submit",submitBooking)})
