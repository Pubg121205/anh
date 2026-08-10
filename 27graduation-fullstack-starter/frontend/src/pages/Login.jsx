import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {api} from '../api';

export default function Login(){
  const [username,setUsername]=useState('');
  const [password,setPassword]=useState('');
  const navigate=useNavigate();

  async function submit(e){
    e.preventDefault();
    try{
      const data=await api('/auth/login',{method:'POST',body:JSON.stringify({username,password})});
      localStorage.setItem('token',data.token);
      localStorage.setItem('user',JSON.stringify(data.user));
      navigate(data.user.role==='admin'?'/admin':'/profile');
    }catch(e){alert(e.message)}
  }

  return <main className="auth-page"><form className="auth-card" onSubmit={submit}>
    <span className="eyebrow">27.GRADUATION</span>
    <h1>Đăng nhập</h1>
    <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)}/>
    <input placeholder="Mật khẩu" type="password" value={password} onChange={e=>setPassword(e.target.value)}/>
    <button className="btn black full">Đăng nhập →</button>
    <p className="muted">Demo: admin/admin123 hoặc mike/mike123</p>
  </form></main>
}
