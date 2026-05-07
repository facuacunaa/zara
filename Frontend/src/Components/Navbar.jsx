import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { getCart } from '../Redux/App/action';
import Signout from '../Routes/Signout';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || 'https://zara-backend.vercel.app'

const KNOWN_ROUTES = new Set([
    '/help', '/company', '/login', '/signin', '/cart',
    '/checkout', '/products', '/search', '/otp', '/admin',
    '/artist-portal', '/fillcarddetail'
])

const isArtistRoute = (pathname) => {
    const segments = pathname.split('/').filter(Boolean)
    return segments.length === 1 && !KNOWN_ROUTES.has(pathname)
}

/* ── SVG árbol con hornero (estilo mano alzada) ─────────────────────────── */
const HorneroTree = () => (
    <svg
        viewBox="0 0 200 270"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="#1a1a1a"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        {/* Raíces */}
        <path strokeWidth="2" d="M 100,258 C 90,254 78,256 68,260"/>
        <path strokeWidth="2" d="M 100,258 C 110,254 122,256 132,260"/>

        {/* Tronco principal */}
        <path strokeWidth="4" d="M 100,258 C 98,238 102,220 100,200 C 98,182 96,166 99,148 C 102,134 100,118 100,105"/>

        {/* Rama izquierda baja */}
        <path strokeWidth="3" d="M 100,210 C 84,203 68,196 52,189 C 40,184 28,178 16,172"/>

        {/* Rama derecha baja */}
        <path strokeWidth="3" d="M 100,196 C 115,189 130,182 143,175 C 153,170 162,163 170,156"/>

        {/* Rama izquierda alta */}
        <path strokeWidth="2.5" d="M 100,165 C 87,158 73,151 58,143"/>

        {/* Rama derecha alta (donde va el nido) */}
        <path strokeWidth="2.5" d="M 100,152 C 114,144 128,137 141,129"/>

        {/* Ramitas extremo izquierda baja */}
        <path strokeWidth="1.5" d="M 16,172 C 12,165 10,157 10,149"/>
        <path strokeWidth="1.5" d="M 16,172 C 10,166 8,160 7,153"/>
        <path strokeWidth="1.5" d="M 52,189 C 48,181 46,173 45,165"/>

        {/* Ramitas extremo derecha baja */}
        <path strokeWidth="1.5" d="M 170,156 C 172,148 172,140 170,132"/>
        <path strokeWidth="1.5" d="M 170,156 C 174,149 175,142 174,134"/>

        {/* Ramitas extremo izquierda alta */}
        <path strokeWidth="1.5" d="M 58,143 C 54,136 52,128 51,120"/>
        <path strokeWidth="1.5" d="M 58,143 C 53,137 51,130 50,123"/>

        {/* Hojitas (simples óvalos inclinados) */}
        <ellipse cx="10" cy="146" rx="7" ry="4" transform="rotate(-35 10 146)" strokeWidth="1.5"/>
        <ellipse cx="7" cy="150" rx="5" ry="3" transform="rotate(-20 7 150)" strokeWidth="1.2"/>
        <ellipse cx="45" cy="161" rx="6" ry="3.5" transform="rotate(-30 45 161)" strokeWidth="1.5"/>
        <ellipse cx="50" cy="118" rx="6" ry="4" transform="rotate(-25 50 118)" strokeWidth="1.5"/>
        <ellipse cx="170" cy="129" rx="6" ry="3.5" transform="rotate(25 170 129)" strokeWidth="1.5"/>
        <ellipse cx="174" cy="131" rx="5" ry="3" transform="rotate(15 174 131)" strokeWidth="1.2"/>

        {/* ── Nido del hornero (forma de bola de barro con entrada) ── */}
        {/* Cuerpo del nido: oval */}
        <ellipse cx="150" cy="116" rx="20" ry="15" strokeWidth="2.5"/>
        {/* Agujero de entrada (círculo en el lado izquierdo) */}
        <ellipse cx="142" cy="118" rx="7" ry="6" strokeWidth="2"/>
        {/* Líneas de textura (capas de barro) */}
        <path strokeWidth="1" d="M 137,106 C 141,104 147,104 152,106"/>
        <path strokeWidth="1" d="M 133,125 C 137,127 143,127 149,125"/>
        <path strokeWidth="0.8" d="M 134,115 C 136,113 140,113 143,115"/>

        {/* ── Hornero (pájaro) posado junto al nido ── */}
        {/* Cuerpo */}
        <ellipse cx="163" cy="131" rx="9" ry="6" strokeWidth="2"/>
        {/* Cabeza */}
        <circle cx="172" cy="127" r="5.5" strokeWidth="2"/>
        {/* Pico */}
        <path strokeWidth="1.8" d="M 177,126 L 183,124"/>
        {/* Ojo */}
        <circle cx="174" cy="126" r="1.3" fill="#1a1a1a" stroke="none"/>
        {/* Cola */}
        <path strokeWidth="1.5" d="M 154,133 C 151,137 148,140 147,144"/>
        {/* Línea de ala */}
        <path strokeWidth="1.5" d="M 156,129 C 159,127 163,127 167,130"/>
        {/* Pata */}
        <path strokeWidth="1.2" d="M 163,137 L 163,143 M 160,143 L 163,143 L 166,143"/>
    </svg>
)

const Navbar = ({ activeIndexs }) => {
    const dispatch = useDispatch();
    const [open,    setOpen]    = useState(false)
    const [theme,   setTheme]   = useState("black");
    const [artists, setArtists] = useState([])
    const [scrolled, setScrolled] = useState(false)
    const location = useLocation();
    const { cart }   = useSelector((store) => store.AppReducer);
    const { isAuth } = useSelector((store) => store.AuthReducer);

    const onArtistPage       = isArtistRoute(location.pathname)
    const onHomePage         = location.pathname === '/'
    const needsTransparency  = onArtistPage || onHomePage

    useEffect(() => {
        if (!needsTransparency) { setScrolled(false); return }
        const handleScroll = () => setScrolled(window.scrollY > 60)
        window.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll()
        return () => window.removeEventListener('scroll', handleScroll)
    }, [needsTransparency])

    useEffect(() => {
        setTheme(location.pathname !== '/' ? "black" : "white")
    }, [location]);

    useEffect(() => {
        if (cart.length === 0) dispatch(getCart())
    }, [])

    useEffect(() => {
        axios.get(`${API}/artist`)
            .then(r => setArtists(r.data || []))
            .catch(() => {})
    }, [])

    // Cerrar sidebar al navegar
    useEffect(() => { setOpen(false) }, [location.pathname])

    const iconColor = (onHomePage || (onArtistPage && !scrolled)) ? 'white' : 'black'
    const navBg     = needsTransparency ? 'transparent' : 'white'

    return (
        <>
            {/* ── Overlay oscuro cuando el sidebar está abierto ─────── */}
            {open && <Overlay onClick={() => setOpen(false)} />}

            <NavBar iconColor={iconColor} style={{ backgroundColor: navBg }}>
                {/* Hamburger */}
                <HamburgerBtn onClick={() => setOpen(true)} iconColor={iconColor} aria-label="Abrir menú">
                    <span /><span /><span />
                </HamburgerBtn>

                {/* Logo central */}
                <BrandLink to="/" iconColor={iconColor}>
                    La Casita del Hornero
                </BrandLink>

                {/* Acciones derecha */}
                <NavRight>
                    <Link to="/search" style={{ visibility: location.pathname === '/search' ? 'hidden' : 'visible' }}>
                        <NavAction iconColor={iconColor}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            </svg>
                        </NavAction>
                    </Link>

                    {!isAuth
                        ? <Link to="/login" state={{ path: '/' }}>
                            <NavAction iconColor={iconColor}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                                </svg>
                            </NavAction>
                          </Link>
                        : <Signout />
                    }

                    <Link to="/cart">
                        <NavAction iconColor={iconColor} style={{ position: 'relative' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                            </svg>
                            {cart && cart.length > 0 && (
                                <CartBadge>{cart.length}</CartBadge>
                            )}
                        </NavAction>
                    </Link>
                </NavRight>
            </NavBar>

            {/* ── Sidebar ──────────────────────────────────────────────── */}
            <Sidebar open={open}>
                <SidebarInner>
                    {/* Cerrar */}
                    <CloseBtn onClick={() => setOpen(false)} aria-label="Cerrar menú">✕</CloseBtn>

                    {/* Ilustración árbol + hornero */}
                    <TreeWrap>
                        <HorneroTree />
                    </TreeWrap>

                    {/* Nombre de la tienda */}
                    <SidebarBrand>La Casita<br/>del Hornero</SidebarBrand>

                    {/* Artistas */}
                    {artists.length > 0 && (
                        <ArtistList>
                            <ArtistListLabel>— Artistas</ArtistListLabel>
                            {artists.map(a => (
                                <ArtistItem key={a.slug}>
                                    <Link to={`/${a.slug}`}>{a.name}</Link>
                                </ArtistItem>
                            ))}
                        </ArtistList>
                    )}

                    {/* Acceso portales */}
                    <PortalSection>
                        <PortalLabel>— Acceso</PortalLabel>
                        <PortalLink to="/artist-portal">
                            <PortalIcon>🎨</PortalIcon>
                            <div>
                                <PortalLinkTitle>Portal Artista</PortalLinkTitle>
                                <PortalLinkSub>Gestioná tu página y productos</PortalLinkSub>
                            </div>
                        </PortalLink>
                        <PortalLink to="/admin">
                            <PortalIcon>⚙️</PortalIcon>
                            <div>
                                <PortalLinkTitle>Administrador</PortalLinkTitle>
                                <PortalLinkSub>Panel de control de la tienda</PortalLinkSub>
                            </div>
                        </PortalLink>
                    </PortalSection>

                    {/* Links secundarios */}
                    <SidebarFooterLinks>
                        <Link to="/products">Tienda</Link>
                        <Link to="/cart">Carrito {cart && cart.length > 0 ? `(${cart.length})` : ''}</Link>
                        {!isAuth
                            ? <Link to="/login" state={{ path: '/' }}>Iniciar sesión</Link>
                            : <Signout />
                        }
                    </SidebarFooterLinks>
                </SidebarInner>
            </Sidebar>
        </>
    )
}

/* ═══════════════════════════════════════════════════════════════
   ESTILOS
═══════════════════════════════════════════════════════════════ */

const Overlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    z-index: 98;
    backdrop-filter: blur(2px);
`

const NavBar = styled.nav`
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 99;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    transition: background-color 0.3s ease;
`

const HamburgerBtn = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 5px;

    span {
        display: block;
        width: 22px;
        height: 1.5px;
        background: ${p => p.iconColor};
        transition: background 0.3s;
    }
`

const BrandLink = styled(Link)`
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    font-family: 'Schoolbell', cursive;
    font-size: clamp(16px, 2.2vw, 22px);
    font-style: normal;
    font-weight: 400;
    letter-spacing: 0.02em;
    color: ${p => p.iconColor};
    text-decoration: none;
    white-space: nowrap;
    transition: color 0.3s;

    @media (max-width: 480px) {
        font-size: 13px;
        letter-spacing: 0;
    }
`

const NavRight = styled.div`
    display: flex;
    align-items: center;
    gap: 20px;

    a { text-decoration: none; }

    @media (max-width: 480px) { gap: 14px; }
`

const NavAction = styled.div`
    color: ${p => p.iconColor};
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: opacity 0.2s;
    position: relative;

    &:hover { opacity: 0.6; }
`

const CartBadge = styled.span`
    position: absolute;
    top: -7px;
    right: -9px;
    background: #fff;
    color: #000;
    font-size: 9px;
    font-family: 'DM Sans', sans-serif;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid currentColor;
    font-weight: 600;
`

/* ── Sidebar ──────────────────────────────────────────────────── */
const Sidebar = styled.aside`
    position: fixed;
    top: 0; left: 0; bottom: 0;
    width: 320px;
    max-width: 85vw;
    background: #fff;
    z-index: 100;
    transform: ${p => p.open ? 'translateX(0)' : 'translateX(-100%)'};
    transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
    overflow-y: auto;
    box-shadow: 4px 0 40px rgba(0,0,0,0.12);
`

const SidebarInner = styled.div`
    padding: 24px 32px 48px;
    display: flex;
    flex-direction: column;
    min-height: 100%;
`

const CloseBtn = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    color: #888;
    align-self: flex-end;
    padding: 4px 8px;
    margin-bottom: 8px;
    transition: color 0.2s;

    &:hover { color: #000; }
`

const TreeWrap = styled.div`
    width: 100%;
    max-width: 200px;
    margin: 0 auto 4px;

    svg {
        width: 100%;
        height: auto;
    }
`

const SidebarBrand = styled.h2`
    font-family: 'Schoolbell', cursive;
    font-size: clamp(1.6rem, 5vw, 2rem);
    font-weight: 400;
    font-style: normal;
    color: #0a0a0a;
    text-align: center;
    line-height: 1.3;
    margin: 0 0 40px;
    letter-spacing: 0.01em;
`

const ArtistList = styled.nav`
    display: flex;
    flex-direction: column;
    gap: 0;
    margin-bottom: 40px;
`

const ArtistListLabel = styled.p`
    font-family: 'DM Sans', sans-serif;
    font-size: 8px;
    letter-spacing: 0.45em;
    text-transform: uppercase;
    color: #bbb;
    margin: 0 0 20px;
`

const ArtistItem = styled.div`
    border-top: 1px solid #f0f0ee;
    padding: 14px 0;

    &:last-child { border-bottom: 1px solid #f0f0ee; }

    a {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: clamp(1rem, 2.5vw, 1.2rem);
        font-style: italic;
        font-weight: 300;
        color: #0a0a0a;
        text-decoration: none;
        display: block;
        transition: color 0.2s, padding-left 0.2s;

        &:hover {
            color: #666;
            padding-left: 8px;
        }
    }
`

const PortalSection = styled.div`
    margin-bottom: 32px;
    display: flex;
    flex-direction: column;
    gap: 4px;
`

const PortalLabel = styled.p`
    font-family: 'DM Sans', sans-serif;
    font-size: 8px;
    letter-spacing: 0.45em;
    text-transform: uppercase;
    color: #bbb;
    margin: 0 0 14px;
`

const PortalLink = styled(Link)`
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    border: 1px solid #f0f0ee;
    text-decoration: none;
    transition: border-color 0.2s, background 0.2s;

    &:hover {
        border-color: #0a0a0a;
        background: #fafaf8;
    }
`

const PortalIcon = styled.span`
    font-size: 20px;
    flex-shrink: 0;
`

const PortalLinkTitle = styled.p`
    font-family: 'Schoolbell', cursive;
    font-size: 15px;
    color: #0a0a0a;
    margin: 0 0 2px;
`

const PortalLinkSub = styled.p`
    font-family: 'DM Sans', sans-serif;
    font-size: 9px;
    letter-spacing: 0.05em;
    color: #aaa;
    margin: 0;
`

const SidebarFooterLinks = styled.div`
    margin-top: auto;
    padding-top: 32px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    border-top: 1px solid #f0f0ee;

    a, button {
        font-family: 'DM Sans', sans-serif;
        font-size: 9px;
        letter-spacing: 0.35em;
        text-transform: uppercase;
        color: #aaa;
        text-decoration: none;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        text-align: left;
        transition: color 0.2s;

        &:hover { color: #0a0a0a; }
    }
`

export default Navbar
