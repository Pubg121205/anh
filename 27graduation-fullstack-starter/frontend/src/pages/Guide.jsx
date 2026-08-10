import {useEffect,useState} from 'react';
import {api} from '../api';

export default function Guide(){
  const [sections,setSections]=useState([]);
  useEffect(()=>{api('/pages/huong-dan').then(setSections).catch(e=>alert(e.message))},[]);
  return <main className="content-page">
    <span className="eyebrow">HƯỚNG DẪN</span>
    <h1>Cách đặt lịch</h1>
    <p className="lead">Chọn đúng người, chốt giá rõ ràng và đặt lịch ngay trên nền tảng.</p>
    {sections.map(s=><section className="guide-card" key={s.id}>
      <div className="step">{s.icon}</div><div><h2>{s.title}</h2><small>{s.subtitle}</small><p>{s.content}</p></div>
    </section>)}
  </main>
}
