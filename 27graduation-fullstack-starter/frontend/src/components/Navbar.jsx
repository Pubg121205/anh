import {Link, useNavigate} from 'react-router-dom';

export default function Navbar(){
  const navigate = useNavigate();
  const role = JSON.parse(localStorage.getItem('user') || 'null')?.role;

  function logout(){
    localStorage.clear();
    navigate('/login');
  }

  return <header className="navbar">
    <Link to="/" className="brand"><span>27</span> 27.Graduation</Link>
    <nav>
      <Link to="/photographers">Tìm photographer</Link>
      <Link to="/feed">Khám phá ảnh</Link>
      <Link to="/huong-dan">Hướng dẫn đặt lịch</Link>
      <Link to="/bao-ve-khach">Bảo vệ khách</Link>
      {role === 'photographer' && <Link to="/profile">Profile</Link>}
      {role === 'admin' && <Link to="/admin">Admin</Link>}
    </nav>
    <div className="nav-actions">
      {role ? <button className="btn black" onClick={logout}>Đăng xuất</button> :
      <Link className="btn black" to="/login">Đăng nhập</Link>}
      <Link className="btn black" to="/photographers">Đặt lịch ngay</Link>
    </div>
  </header>
}
