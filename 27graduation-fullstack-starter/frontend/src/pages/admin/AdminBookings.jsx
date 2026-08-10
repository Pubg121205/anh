import {useEffect,useState} from 'react';
import {api} from '../../api';

export default function AdminBookings(){
  const [items,setItems]=useState([]);
  const load=()=>api('/admin/bookings').then(setItems);
  useEffect(()=>{load()},[]);

  async function status(id,status){
    await api(`/admin/bookings/${id}`,{method:'PUT',body:JSON.stringify({status})});
    load();
  }
  async function del(id){
    if(confirm('Xóa yêu cầu này?')){await api(`/admin/bookings/${id}`,{method:'DELETE'});load();}
  }

  return <><h1>Đặt lịch / Khách hàng</h1><p className="muted">Thông tin khách gửi từ form thuê hoặc liên hệ.</p>
    <div className="table-wrap"><table><thead><tr><th>Khách</th><th>SĐT</th><th>Khu vực</th><th>Photographer</th><th>Ngày</th><th>Loại</th><th>Trạng thái</th><th></th></tr></thead>
    <tbody>{items.map(x=><tr key={x.id}><td>{x.customer_name}</td><td>{x.phone}</td><td>{x.area}</td><td>{x.photographer_name||'—'}</td><td>{x.shooting_date||'—'}</td><td>{x.type}</td>
    <td><select value={x.status} onChange={e=>status(x.id,e.target.value)}>
      <option value="new">Mới</option><option value="contacted">Đã liên hệ</option><option value="confirmed">Đã xác nhận</option><option value="completed">Hoàn thành</option><option value="cancelled">Hủy</option>
    </select></td><td><button className="danger" onClick={()=>del(x.id)}>Xóa</button></td></tr>)}</tbody></table></div>
  </>
}
