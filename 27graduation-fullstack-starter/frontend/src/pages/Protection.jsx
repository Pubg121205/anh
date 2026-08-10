import {useEffect,useState} from 'react';
import {api} from '../api';

export default function Protection(){
  const [sections,setSections]=useState([]);
  useEffect(()=>{api('/pages/bao-ve-khach').then(setSections).catch(e=>alert(e.message))},[]);
  return <main className="content-page">
    <span className="eyebrow">BẢO VỆ KHÁCH</span>
    <h1>3 lớp bảo vệ khi đặt qua nền tảng</h1>
    <p className="lead">Mỗi buổi chụp đặt qua 27.Graduation đều được bảo vệ ở ba mặt.</p>
    <div className="protection-grid">{sections.map(s=><section className="protection-card" key={s.id}>
      <div className="big-icon">{s.icon}</div><h2>{s.title}</h2><p>{s.content}</p>
    </section>)}</div>
    <h2 className="compare-title">Đặt qua nền tảng vs tự liên hệ bên ngoài</h2>
    <div className="compare">
      <div><b>Tiêu chí</b><b>Đặt qua 27.GRADUATION</b><b>Tự liên hệ ngoài</b></div>
      <div><span>Bảo vệ tiền cọc</span><span>✓ Giữ tạm tại nền tảng</span><span>✕ Tự chịu rủi ro</span></div>
      <div><span>Photographer được kiểm duyệt</span><span>✓ Đã duyệt hồ sơ</span><span>✕ Không chắc chắn</span></div>
      <div><span>Đánh giá thật</span><span>✓ Từ khách đã chụp</span><span>✕ Khó kiểm chứng</span></div>
      <div><span>Hỗ trợ khi có vấn đề</span><span>✓ Nền tảng đứng ra xử lý</span><span>✕ Tự thương lượng</span></div>
    </div>
  </main>
}
