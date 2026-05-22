import './App.css';
import Navbar from './Components/Navbar';
import SiteFooter from './Components/SiteFooter';
import ScrollDot from './Components/ScrollDot';
import AllRoutes from './Routes/AllRoutes';
import { useLocation } from 'react-router-dom';
import "swiper/css/bundle";

// Rutas donde el Navbar/Footer global NO debe aparecer
const HIDDEN_CHROME_ROUTES = ['/artist-portal', '/admin', '/login', '/signin', '/company', '/otp', '/fillcarddetail']

// El home maneja su propio footer internamente (para evitar el flash durante el loader)
const HOME_ROUTE = '/'

function App() {
  const location = useLocation()

  const hideChrome = HIDDEN_CHROME_ROUTES.some(r => location.pathname.startsWith(r))
  const isHome     = location.pathname === HOME_ROUTE

  // El footer global NO se muestra en home — el home lo incluye él mismo tras su loader
  const showFooter = !hideChrome && !isHome

  return (
    <div className="App">
      {!hideChrome && <Navbar />}
      <div className="routes-wrap">
        <AllRoutes />
      </div>
      {showFooter && <SiteFooter />}
      <ScrollDot />
    </div>
  );
}

export default App;
