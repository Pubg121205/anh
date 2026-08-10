import {useEffect,useState} from 'react';
import {api} from '../api';

export default function Feed(){
  const [posts,setPosts]=useState([]);
  useEffect(()=>{api('/feed').then(setPosts).catch(e=>alert(e.message))},[]);
  return <main className="page">
    <section className="feed-title">
      <span className="eyebrow">KHÁM PHÁ</span>
      <h1>Lướt ảnh, thấy ngay photographer hợp gu</h1>
      <p>Portfolio thật từ cộng đồng photographer trên 27.Graduation.</p>
    </section>
    <div className="feed-grid">{posts.map(p=><article key={p.id} className="feed-card">
      <img src={p.image_url}/>
      <div><b>{p.photographer_name}</b><span>{p.category} · {p.location}</span><p>{p.caption}</p></div>
    </article>)}</div>
  </main>
}
