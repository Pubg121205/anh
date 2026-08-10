import {useEffect,useState} from 'react';
import {useParams} from 'react-router-dom';
import {api} from '../api';
import BookingModal from '../components/BookingModal';

export default function PhotographerDetail(){
  const {id}=useParams();
  const [p,setP]=useState(null);
  const [modal,setModal]=useState(null);

  useEffect(()=>{api(`/photographers/${id}`).then(setP).catch(e=>alert(e.message))},[id]);

  if(!p) return <div className="loading">Đang tải...</div>;

  return <main className="detail-page">
    <div className="cover"><img src={p.cover_image || p.avatar}/></div>
    <section className="detail-head">
      <img className="avatar" src={p.avatar || p.cover_image}/>
      <div>
        <h1>{p.name} {p.verified && <span className="verified inline">✓ ĐÃ KIỂM DUYỆT</span>}</h1>
        <p>{p.location} · ★ {p.rating} · {p.review_count} đánh giá</p>
        <p>{p.style}</p>
      </div>
    </section>

    <div className="stats">
      <div><b>{p.rating}</b><span>ĐÁNH GIÁ</span></div>
      <div><b>{p.shooting_count}</b><span>BUỔI ĐÃ CHỤP</span></div>
      <div><b>{p.response_rate}%</b><span>ĐÚNG GIỜ</span></div>
      <div><b>{p.response_time}</b><span>PHẢN HỒI</span></div>
    </div>

    <div className="detail-layout">
      <section>
        <div className="eyebrow">PORTFOLIO</div>
        <div className="portfolio-grid">{p.portfolio.map(x=><img key={x.id} src={x.image_url}/>)}</div>
      </section>
      <aside className="booking-box">
        <span>Giá từ</span>
        <h2>Từ {Number(p.price_from).toLocaleString('vi-VN')}đ</h2>
        <button className="btn black full" onClick={()=>setModal({type:'booking'})}>Xem gói & đặt lịch ↓</button>
        <button className="btn light full" onClick={()=>setModal({type:'contact'})}>💬 Nhắn tin với {p.name}</button>
        <button className="btn light full">♡ Lưu photographer · 4</button>
        <div className="security">🔒 <b>Bảo vệ thanh toán</b><br/>Cọc được giữ tạm tại nền tảng, hoàn nếu sai lịch.</div>
      </aside>
    </div>

    {modal && <BookingModal photographer={p}
      packageItem={modal.type==='booking' ? p.packages[0] : null}
      type={modal.type} onClose={()=>setModal(null)}/>}
  </main>
}
