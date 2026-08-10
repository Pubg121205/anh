import {Link} from 'react-router-dom';

export default function PhotographerCard({p}){
  return <Link to={`/photographers/${p.id}`} className="photo-card">
    <div className="card-image">
      <img src={p.avatar || p.cover_image}/>
      {p.verified && <span className="verified">✓ ĐÃ KIỂM DUYỆT</span>}
    </div>
    <div className="card-info">
      <h3>{p.name}</h3>
      <p>{p.location} · ★ {p.rating} · {p.review_count} buổi đánh giá</p>
      <p className="muted">{p.style}</p>
      <strong>Từ {Number(p.price_from).toLocaleString('vi-VN')}đ</strong>
    </div>
  </Link>
}
