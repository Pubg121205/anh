import {useEffect,useState} from 'react';
import {api} from '../../api';

export default function AdminDashboard(){
  const [d,setD]=useState({});
  useEffect(()=>{api('/admin/dashboard').then(setD).catch(e=>alert(e.message))},[]);
  return <><h1>Dashboard</h1><p className="muted">Tổng quan hệ thống 27.Graduation</p>
    <div className="admin-stats">
      <div><b>{d.photographers||0}</b><span>Photographer</span></div>
      <div><b>{d.bookings||0}</b><span>Đặt lịch</span></div>
      <div><b>{d.newBookings||0}</b><span>Yêu cầu mới</span></div>
      <div><b>{d.feed||0}</b><span>Bài khám phá</span></div>
    </div>
  </>
}
