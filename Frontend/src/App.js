import './App.css';
import Navbar from './Components/Navbar';
import AllRoutes from './Routes/AllRoutes';
import { useLocation } from 'react-router-dom';
import "swiper/css/bundle";

// Rutas donde el Navbar global NO debe aparecer
const HIDDEN_NAVBAR_ROUTES = ['/natalia-gomez', '/artist-portal', '/admin']

function App() {
  const location = useLocation()
  const hideNavbar = HIDDEN_NAVBAR_ROUTES.some(r => location.pathname.startsWith(r))

  return (
    <div className="App">
      {!hideNavbar && <Navbar />}
      <AllRoutes />
    </div>
  );
}

export default App;
