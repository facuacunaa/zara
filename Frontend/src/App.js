import './App.css';
import Navbar from './Components/Navbar';
import AllRoutes from './Routes/AllRoutes';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import "swiper/css/bundle";

const API = process.env.REACT_APP_BACKEND_URL || 'https://zara-backend.vercel.app'

// Rutas fijas donde el Navbar global nunca aparece
const STATIC_HIDDEN = ['/artist-portal', '/admin']

function App() {
  const location = useLocation()

  // Lista de slugs de artistas — se cachea en localStorage para evitar flash
  const [artistSlugs, setArtistSlugs] = useState(
    () => JSON.parse(localStorage.getItem('artistSlugs') || '[]')
  )

  useEffect(() => {
    axios.get(`${API}/artist`)
      .then(r => {
        const slugs = r.data.map(a => `/${a.slug}`)
        setArtistSlugs(slugs)
        localStorage.setItem('artistSlugs', JSON.stringify(slugs))
      })
      .catch(() => {})
  }, [])

  const hideNavbar =
    STATIC_HIDDEN.some(r => location.pathname.startsWith(r)) ||
    artistSlugs.includes(location.pathname)

  return (
    <div className="App">
      {!hideNavbar && <Navbar />}
      <AllRoutes />
    </div>
  );
}

export default App;
