import {useEffect,useState} from 'react';
import {api} from '../api';
import PhotographerCard from '../components/PhotographerCard';

export default function Photographers(){
  const [items,setItems]=useState([]);
  const [q,setQ]=useState('');
  const [sort,setSort]=useState('price_desc');

  useEffect(()=>{api('/photographers').then(setItems).catch(e=>alert(e.message))},[]);

  const filtered=items
    .filter(p=>(p.name+' '+p.style+' '+p.location).toLowerCase().includes(q.toLowerCase()))
    .sort((a,b)=>sort==='price_desc'?b.price_from-a.price_from:a.price_from-b.price_from);

  return <main className="page">
    <section className="page-title">
      <span className="eyebrow">TÌM PHOTOGRAPHER</span>
      <h1>Chọn photographer phù hợp với bạn</h1>
      <p>Tất cả nhiếp ảnh gia đều đã được kiểm duyệt hồ sơ. Đặt qua nền tảng được bảo vệ thanh toán & hỗ trợ.</p>
      <div className="pills"><span>✓ Photographer đã kiểm duyệt</span><span>🔒 Bảo vệ thanh toán</span><span>★ Đánh giá thật</span></div>
    </section>

    <div className="finder">
      <aside className="filters">
        <input placeholder="Tìm theo tên / phong cách" value={q} onChange={e=>setQ(e.target.value)}/>
        <div className="filter-label">PHONG CÁCH</div>
        <button>👥 Chụp nhóm</button><button>🎓 Kỷ yếu THPT</button><button>🎓 Kỷ yếu Đại học</button><button>🌿 Thanh xuân</button>
        <div className="filter-label">KHU VỰC</div>
        <label><input type="checkbox"/> Hà Nội</label>
        <label><input type="checkbox"/> TP Hồ Chí Minh</label>
        <label><input type="checkbox"/> Cần Thơ</label>
      </aside>
      <section className="results">
        <div className="results-top"><b>{filtered.length}</b> photographer phù hợp
          <select value={sort} onChange={e=>setSort(e.target.value)}>
            <option value="price_desc">Giá cao → thấp</option>
            <option value="price_asc">Giá thấp → cao</option>
          </select>
        </div>
        <div className="card-grid">{filtered.map(p=><PhotographerCard key={p.id} p={p}/>)}</div>
      </section>
    </div>
  </main>
}
