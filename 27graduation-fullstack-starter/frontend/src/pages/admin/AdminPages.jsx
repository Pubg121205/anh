import {useEffect,useState} from 'react';
import {api} from '../../api';

export default function AdminPages(){
  const [slug,setSlug]=useState('huong-dan');
  const [items,setItems]=useState([]);

  const load=()=>api(`/admin/pages/${slug}`).then(setItems);
  useEffect(()=>{load()},[slug]);

  async function save(x){
    await api(`/admin/pages/section/${x.id}`,{method:'PUT',body:JSON.stringify(x)});
    load();
  }

  async function del(id){
    if(confirm('Xóa section?')){await api(`/admin/pages/section/${id}`,{method:'DELETE'});load();}
  }

  return <><div className="admin-title"><div><h1>Nội dung website</h1><p className="muted">Sửa nội dung Hướng dẫn đặt lịch và Bảo vệ khách.</p></div>
    <select value={slug} onChange={e=>setSlug(e.target.value)}><option value="huong-dan">Hướng dẫn đặt lịch</option><option value="bao-ve-khach">Bảo vệ khách</option></select></div>
    {items.map(x=><div className="editor" key={x.id}>
      <input value={x.title} onChange={e=>setItems(items.map(a=>a.id===x.id?{...a,title:e.target.value}:a))}/>
      <input value={x.subtitle||''} onChange={e=>setItems(items.map(a=>a.id===x.id?{...a,subtitle:e.target.value}:a))}/>
      <textarea value={x.content||''} onChange={e=>setItems(items.map(a=>a.id===x.id?{...a,content:e.target.value}:a))}/>
      <button className="btn black" onClick={()=>save(x)}>Lưu</button>
      <button className="btn light" onClick={()=>del(x.id)}>Xóa</button>
    </div>)}
  </>
}
