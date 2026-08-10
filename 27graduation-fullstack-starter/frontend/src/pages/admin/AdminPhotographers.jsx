import {useEffect,useState} from 'react';
import {api} from '../../api';

const empty={username:'',email:'',password:'',name:'',location:'Hà Nội',price_from:5000000,style:'',bio:''};

export default function AdminPhotographers(){
  const [items,setItems]=useState([]);
  const [form,setForm]=useState(empty);
  const [editing,setEditing]=useState(null);

  const load=()=>api('/admin/photographers').then(setItems);
  useEffect(()=>{load()},[]);

  async function save(e){
    e.preventDefault();
    if(editing){
      await api(`/admin/photographers/${editing.id}`,{method:'PUT',body:JSON.stringify({...editing,...form})});
    }else{
      await api('/admin/photographers',{method:'POST',body:JSON.stringify(form)});
    }
    setForm(empty);setEditing(null);load();
  }

  async function del(id){
    if(confirm('Xóa photographer này?')){await api(`/admin/photographers/${id}`,{method:'DELETE'});load();}
  }

  return <div><div className="admin-title"><div><h1>Photographer</h1><p className="muted">Thêm, sửa, xóa và khóa tài khoản.</p></div></div>
    <form className="editor" onSubmit={save}>
      <h2>{editing?'Sửa photographer':'Thêm photographer'}</h2>
      {!editing && <div className="form-grid">
        <input placeholder="Username" value={form.username} onChange={e=>setForm({...form,username:e.target.value})}/>
        <input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
        <input placeholder="Mật khẩu" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
      </div>}
      <div className="form-grid">
        <input required placeholder="Tên" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
        <input placeholder="Khu vực" value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/>
        <input type="number" placeholder="Giá từ" value={form.price_from} onChange={e=>setForm({...form,price_from:e.target.value})}/>
        <input placeholder="Phong cách" value={form.style} onChange={e=>setForm({...form,style:e.target.value})}/>
      </div>
      <textarea placeholder="Giới thiệu" value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})}/>
      <button className="btn black">{editing?'Lưu thay đổi':'Tạo tài khoản'}</button>
      {editing && <button type="button" className="btn light" onClick={()=>{setEditing(null);setForm(empty)}}>Hủy</button>}
    </form>

    <div className="table-wrap"><table><thead><tr><th>Tên</th><th>Tài khoản</th><th>Khu vực</th><th>Giá</th><th>Trạng thái</th><th></th></tr></thead>
    <tbody>{items.map(x=><tr key={x.id}><td><b>{x.name}</b></td><td>{x.username}</td><td>{x.location}</td><td>{Number(x.price_from).toLocaleString('vi-VN')}đ</td><td>{x.status}</td>
    <td><button onClick={()=>{setEditing(x);setForm(x)}}>Sửa</button> <button className="danger" onClick={()=>del(x.id)}>Xóa</button></td></tr>)}</tbody></table></div>
  </div>
}
