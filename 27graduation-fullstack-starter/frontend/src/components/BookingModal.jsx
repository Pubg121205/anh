import {useState} from 'react';
import {api} from '../api';

export default function BookingModal({photographer, packageItem, type='booking', onClose}){
  const [form,setForm]=useState({
    customer_name:'', phone:'', area:'', shooting_date:'',
    people_count:1, message:''
  });
  const [sent,setSent]=useState(false);
  const [loading,setLoading]=useState(false);

  async function submit(e){
    e.preventDefault();
    setLoading(true);
    try{
      await api('/bookings',{
        method:'POST',
        body:JSON.stringify({
          photographer_id: photographer?.id,
          package_id: packageItem?.id,
          type,
          ...form
        })
      });
      setSent(true);
    }catch(err){ alert(err.message); }
    finally{ setLoading(false); }
  }

  return <div className="modal-backdrop" onMouseDown={onClose}>
    <div className="modal" onMouseDown={e=>e.stopPropagation()}>
      {!sent ? <>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>{type==='contact'?'Liên hệ photographer':'Đặt lịch'}</h2>
        <p className="muted">{photographer?.name} {packageItem ? `· ${packageItem.name}`:''}</p>
        <form onSubmit={submit} className="form">
          <input required placeholder="Họ và tên" value={form.customer_name}
            onChange={e=>setForm({...form,customer_name:e.target.value})}/>
          <input required placeholder="Số điện thoại" value={form.phone}
            onChange={e=>setForm({...form,phone:e.target.value})}/>
          <input required placeholder="Khu vực" value={form.area}
            onChange={e=>setForm({...form,area:e.target.value})}/>
          {type==='booking' && <>
            <label>Ngày chụp<input type="date" value={form.shooting_date}
              onChange={e=>setForm({...form,shooting_date:e.target.value})}/></label>
            <label>Số người<input type="number" min="1" max="50" value={form.people_count}
              onChange={e=>setForm({...form,people_count:e.target.value})}/></label>
          </>}
          <textarea placeholder="Nội dung / yêu cầu" value={form.message}
            onChange={e=>setForm({...form,message:e.target.value})}/>
          <button className="btn black full" disabled={loading}>
            {loading?'Đang gửi...':'Gửi yêu cầu →'}
          </button>
        </form>
      </> : <>
        <div className="success">✓</div>
        <h2>Đã nhận yêu cầu</h2>
        <p>27.Graduation đã ghi nhận thông tin. Photographer sẽ liên hệ lại với bạn.</p>
        <button className="btn black full" onClick={onClose}>Đóng</button>
      </>}
    </div>
  </div>
}
