import {Routes, Route} from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Photographers from './pages/Photographers';
import PhotographerDetail from './pages/PhotographerDetail';
import Feed from './pages/Feed';
import Guide from './pages/Guide';
import Protection from './pages/Protection';
import Login from './pages/Login';
import Profile from './pages/Profile';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPhotographers from './pages/admin/AdminPhotographers';
import AdminBookings from './pages/admin/AdminBookings';
import AdminFeed from './pages/admin/AdminFeed';
import AdminPages from './pages/admin/AdminPages';

export default function App(){
  return <>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/photographers" element={<Photographers/>}/>
      <Route path="/photographers/:id" element={<PhotographerDetail/>}/>
      <Route path="/feed" element={<Feed/>}/>
      <Route path="/huong-dan" element={<Guide/>}/>
      <Route path="/bao-ve-khach" element={<Protection/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/profile" element={<Profile/>}/>

      <Route path="/admin" element={<AdminLayout/>}>
        <Route index element={<AdminDashboard/>}/>
        <Route path="photographers" element={<AdminPhotographers/>}/>
        <Route path="bookings" element={<AdminBookings/>}/>
        <Route path="feed" element={<AdminFeed/>}/>
        <Route path="pages" element={<AdminPages/>}/>
      </Route>
    </Routes>
  </>;
}
