import {Link,Outlet,useNavigate} from 'react-router-dom';

export default function AdminLayout(){
  const navigate=useNavigate();
  const user=JSON.parse(localStorage.getItem('user')||'null');
  if(user?.role!=='admin') return <main className="auth-page"><div className="auth-card"><h1>Cần quyền Admin</h1><button className="btn black" onClick={()=>navigate('/login')}>Đăng nhập</button></div></main>;

  return <main className="admin">
    <aside className="admin-sidebar">
      <h2>27.ADMIN</h2>
      <Link to="/admin">📊 Dashboard</Link>
      <Link to="/admin/photographers">👥 Photographer</Link>
      <Link to="/admin/bookings">📅 Đặt lịch</Link>
      <Link to="/admin/feed">🖼 Khám phá ảnh</Link>
      <Link to="/admin/pages">📖 Nội dung trang</Link>
    </aside>
    <section className="admin-content"><Outlet/></section>
  </main>
}
