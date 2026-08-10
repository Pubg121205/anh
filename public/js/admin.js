function requireAdmin(){
 const u=JSON.parse(localStorage.getItem("user")||"null");
 if(!u||u.role!=="admin"){location.href="/login.html";throw new Error("No admin")}
}
function logout(){localStorage.clear();location.href="/login.html"}
async function loadStats(){
 const s=await api("/admin/stats");
 document.querySelector("#stats").innerHTML=Object.entries(s).map(([k,v])=>`<div class="stat"><div>${k}</div><b>${v}</b></div>`).join("");
}
async function loadAdminPhotographers(){
 const rows=await api("/admin/photographers");const box=document.querySelector("#rows");
 box.innerHTML=rows.map(p=>`<tr><td><img src="${esc(p.avatar)}"></td><td><b>${esc(p.name)}</b><br>${esc(p.username||"")}</td><td>${esc(p.area)}</td><td>${money(p.price_from)}</td><td class="actions"><button class="btn small" onclick='editP(${JSON.stringify(p)})'>Sửa</button><button class="btn small danger" onclick="deleteP(${p.id})">Xóa</button></td></tr>`).join("");
}
function editP(p){
 const f=document.querySelector("#pForm");f.dataset.id=p.id;
 for(const k of ["name","area","avatar","cover","bio","styles","price_from"]) if(f[k])f[k].value=p[k]||"";
 document.querySelector("#pModal").classList.add("show");
}
function newP(){document.querySelector("#pForm").reset();document.querySelector("#pForm").dataset.id="";document.querySelector("#pModal").classList.add("show")}
function closeP(){document.querySelector("#pModal").classList.remove("show")}
async function saveP(e){
 e.preventDefault();const id=e.target.dataset.id;
 const data=Object.fromEntries(new FormData(e.target).entries());
 try{
  if(id) await api("/admin/photographers/"+id,{method:"PUT",body:JSON.stringify(data)});
  else await api("/admin/photographers",{method:"POST",body:JSON.stringify(data)});
  closeP();loadAdminPhotographers();loadStats();
 }catch(err){alert(err.message)}
}
async function deleteP(id){if(confirm("Xóa photographer này?")){await api("/admin/photographers/"+id,{method:"DELETE"});loadAdminPhotographers();loadStats()}}
async function loadBookings(){
 const rows=await api("/admin/bookings");document.querySelector("#bookingRows").innerHTML=rows.map(b=>`<tr>
 <td>${b.id}</td><td>${esc(b.customer_name)}<br>${esc(b.phone)}</td><td>${esc(b.area)}</td><td>${esc(b.photographer_name||"-")}</td>
 <td>${b.shoot_date||"-"}</td><td><select onchange="statusBooking(${b.id},this.value)"><option ${b.status==="pending"?"selected":""}>pending</option><option ${b.status==="confirmed"?"selected":""}>confirmed</option><option ${b.status==="cancelled"?"selected":""}>cancelled</option><option ${b.status==="completed"?"selected":""}>completed</option></select></td>
 <td><button class="btn small danger" onclick="deleteBooking(${b.id})">Xóa</button></td></tr>`).join("");
}
async function statusBooking(id,status){await api("/admin/bookings/"+id,{method:"PUT",body:JSON.stringify({status})})}
async function deleteBooking(id){if(confirm("Xóa yêu cầu?")){await api("/admin/bookings/"+id,{method:"DELETE"});loadBookings();loadStats()}}
async function loadCMSAdmin(slug){
 const p=await api("/admin/cms/"+slug);const f=document.querySelector("#cmsForm");f.dataset.slug=slug;f.title.value=p.title||"";f.content.value=p.content||"";
}
async function saveCMS(e){e.preventDefault();const slug=e.target.dataset.slug;await api("/admin/cms/"+slug,{method:"PUT",body:JSON.stringify({title:e.target.title.value,content:e.target.content.value})});alert("Đã lưu")}
