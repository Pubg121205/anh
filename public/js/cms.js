async function loadCMS(slug){
  const p=await api("/cms/"+slug);
  document.querySelector("#cmsTitle").textContent=p.title;
  document.querySelector("#cmsContent").innerHTML=esc(p.content).replace(/\n/g,"<br>");
}
document.addEventListener("DOMContentLoaded",()=>{
  const slug=document.body.dataset.cms;if(slug)loadCMS(slug);
});
