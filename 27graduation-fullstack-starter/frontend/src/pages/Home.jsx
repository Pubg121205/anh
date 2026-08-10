import {Link} from 'react-router-dom';

export default function Home(){
  return <main>
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow">27.GRADUATION · WHERE CREATORS MEET TRUST</div>
        <h1>Tìm photographer<br/><em>đúng gu</em> cho ngày đặc biệt.</h1>
        <p>Khám phá portfolio thật, giá minh bạch và đặt lịch photographer đã được kiểm duyệt.</p>
        <div className="hero-buttons">
          <Link className="btn black" to="/photographers">Tìm photographer →</Link>
          <Link className="btn light" to="/feed">Khám phá ảnh</Link>
        </div>
      </div>
      <div className="hero-photo">
        <img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200" />
      </div>
    </section>

    <section className="trust-strip">
      <div><b>✓</b><strong> Photographer đã kiểm duyệt</strong><span>Portfolio và cam kết chất lượng trước khi hiển thị.</span></div>
      <div><b>🔒</b><strong> Bảo vệ thanh toán</strong><span>Tiền cọc được bảo vệ khi đặt qua nền tảng.</span></div>
      <div><b>★</b><strong> Đánh giá thật</strong><span>Chỉ khách đã chụp mới đánh giá.</span></div>
    </section>

    <section className="section">
      <div className="section-head">
        <div><span className="eyebrow">KHÁM PHÁ</span><h2>Ảnh thật từ những buổi chụp thật.</h2></div>
        <Link to="/feed">Xem tất cả →</Link>
      </div>
      <div className="masonry-preview">
        {[
          'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=700',
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=700',
          'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=700',
          'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=700'
        ].map((x,i)=><img key={i} src={x}/>)}
      </div>
    </section>
  </main>
}
