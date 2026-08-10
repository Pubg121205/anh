import {useEffect,useState} from 'react';
import {api} from '../api';

export default function Profile(){
  const [p,setP]=useState(null);
  const [form,setForm]=useState({});
  useEffect(()=>{api('/profile').then(x=>{setP(x);setForm(x)}).catch(e=>alert(e.message))},[]);

  async function save(){
    await api('/profile',{method:'PUT',body:JSON.stringify(form)});
    alert('Đã lưu hồ sơ');
    const x=await api('/profile');setP(x);setForm(x);
  }

  async function uploadPortfolio(e){
    const fd=new FormData();fd.append('image',e.target.files[0]);
    await api('/profile/portfolio',{method:'POST',body:fd});
    const x=await api('/profile');setP(x);setForm(x);
  }

  if(!p) return <div className="loading">Đang tải...</div>;

  return <main className="profile-page">
    <div className="profile-cover"><img src={p.cover_image}/></div>
    <div className="profile-main">
      <img className="profile-avatar" src={p.avatar}/>
      <div><h1>{p.name}</h1><p>{p.location} · {p.style}</p></div>
    </div>

    <section className="editor">
      <h2>Thông tin cá nhân</h2>
      <div className="form-grid">
        <label>Tên<input value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})}/></label>
        <label>Khu vực<input value={form.location||''} onChange={e=>setForm({...form,location:e.target.value})}/></label>
        <label>Giá từ<input type="number" value={form.price_from||0} onChange={e=>setForm({...form,price_from:e.target.value})}/></label>
        <label>Phong cách<input value={form.style||''} onChange={e=>setForm({...form,style:e.target.value})}/></label>
      </div>
      <label>Giới thiệu<textarea value={form.bio||''} onChange={e=>setForm({...form,bio:e.target.value})}/></label>
      <button className="btn black" onClick={save}>Lưu thay đổi</button>
    </section>

    <section className="editor">
      <h2>Portfolio</h2>
      <label className="upload-btn">+ Thêm ảnh<input type="file" accept="image/*" onChange={uploadPortfolio}/></label>
      <div className="portfolio-grid">{p.portfolio.map(x=><img key={x.id} src={x.image_url}/>)}</div>
    </section>
  </main>
}
