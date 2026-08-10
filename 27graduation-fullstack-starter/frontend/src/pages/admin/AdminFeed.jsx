import {useEffect,useState} from 'react';
import {api} from '../../api';

export default function AdminFeed(){
  const [items,setItems]=useState([]);
  const [url,setUrl]=useState('');
  const [caption,setCaption]=useState('');
  const load=()=>api('/admin/feed').then(setItems);
  useEffect(()=>{load()},[]);

  async function add(e){
    e.preventDefault();
    await api('/admin/feed',{method:'POST',body:JSON.stringify({image_url:url,caption})});
    setUrl('');setCaption('');load();
  }
  async function del(id){
    if(confirm('Xóa bài?')){await api(`/admin/feed/${id}`,{method:'DELETE'});load();}
  }

  return <><h1>Khám phá ảnh</h1>
    <form className="editor" onSubmit={add}><h2>Thêm ảnh</h2><input required placeholder="URL ảnh" value={url} onChange={e=>setUrl(e.target.value)}/><textarea placeholder="Caption" value={caption} onChange={e=>setCaption(e.target.value)}/><button className="btn black">Thêm</button></form>
    <div className="admin-feed-grid">{items.map(x=><div key={x.id}><img src={x.image_url}/><p>{x.caption}</p><button className="danger" onClick={()=>del(x.id)}>Xóa</button></div>)}</div>
  </>
}
