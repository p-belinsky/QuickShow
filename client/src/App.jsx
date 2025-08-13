
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SignIn } from '@clerk/clerk-react';
import { useAppContext } from './context/AppContext';
import Layout from './pages/admin/Layout';
import Home from './pages/Home';
import Movies from './pages/Movies';
import MovieDetails from './pages/MovieDetails';
import MyBookings from './pages/MyBookings';
import SeatLayout from './pages/SeatLayout';
import Navbar from './components/Navbar';
import Favorite from './pages/Favorite';
import Footer from './components/Footer';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/admin/Dashboard';
import AddShows from './pages/admin/AddShows';
import ListShows from './pages/admin/ListShows';
import ListBookings from './pages/admin/ListBookings';
import Loading from './components/Loading';



const App = () => {
  const { user,} = useAppContext();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      <Toaster position="top-center" />

      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movies/:id" element={<MovieDetails />} />
        <Route path="/movies/:id/:date" element={<SeatLayout />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/loading/:nextUrl" element={<Loading />} />
        <Route path="/favorite" element={<Favorite />} />

        <Route
          path="/admin/*"
          element={
            user ? <Layout/> : (
              <div className='flex items-center justify-center min-h-screen'>
                <SignIn fallbackRedirectUrl={'/admin'} />
              </div>
            )
          }>
          <Route index element={<Dashboard />} /> 
          <Route path='add-shows' element={<AddShows />} />
          <Route path='list-shows' element={<ListShows />} />
          <Route path='list-bookings' element={<ListBookings />} />
          </Route>
      </Routes>
      {!isAdminRoute && <Footer />}
    </>
  );
};

export default App;
