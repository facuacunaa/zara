import { useEffect, useState, useRef } from 'react';
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
    const [open,     setOpen]    = useState(false)
    const [artists,  setArtists] = useState([])
    const navRef = useRef(null)
    const location = useLocation();
    const { cart }   = useSelector((store) => store.AppReducer);
    const { isAuth } = useSelector((store) => store.AuthReducer);

    const onArtistPage       = isArtistRoute(location.pathname)
    const onHomePage         = location.pathname === '/'
    const onExplorePage      = location.pathname === '/explorar'
    const needsTransparency  = onArtistPage || onHomePage || onExplorePage

    // 'dark' = fondo oscuro debajo → íconos blancos
    // 'light' = fondo claro debajo  → íconos oscuros
    const [navTheme, setNavTheme] = useState(needsTransparency ? 'dark' : 'light')
    // true = usuario está en el tope de la página (hero visible)
    const [atTop, setAtTop] = useState(true)

    /* ── Rastrear si el usuario está arriba del todo (hero) ── */
    useEffect(() => {
        const checkTop = () => setAtTop(window.scrollY < 80)
        window.addEventListener('scroll', checkTop, { passive: true })
        checkTop()
        return () => window.removeEventListener('scroll', checkTop)
    }, [location.pathname])

    /* ── Detección automática del color de fondo bajo el navbar ── */
    useEffect(() => {
        const detect = () => {
            if (!navRef.current) return
            // Temporalmente sacamos el navbar del hit-test para ver qué hay debajo
            navRef.current.style.pointerEvents = 'none'
            const el = document.elementFromPoint(window.innerWidth / 2, 32)
            navRef.current.style.pointerEvents = ''
            if (!el) return

            // Subimos el DOM buscando un background significativo
            let node = el
            while (node && node !== document.documentElement) {
                const bg = window.getComputedStyle(node).backgroundColor
                if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
                    const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
                    if (m) {
                        const lum = (0.299 * +m[1] + 0.587 * +m[2] + 0.114 * +m[3]) / 255
                        setNavTheme(lum < 0.5 ? 'dark' : 'light')
                        return
                    }
                }
                node = node.parentElement
            }
            setNavTheme('light')
        }

        detect()
        const t = setTimeout(detect, 200)
        window.addEventListener('scroll', detect, { passive: true })
        window.addEventListener('resize', detect, { passive: true })
        return () => {
            window.removeEventListener('scroll', detect)
            window.removeEventListener('resize', detect)
            clearTimeout(t)
        }
    }, [location.pathname])

    // En el tope del hero (páginas transparentes) → forzar invisibilidad total
    const heroVisible = needsTransparency && atTop

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

    // En hero → íconos blancos sobre fondo transparente; si no, adaptativo
    // En hero → íconos blancos sobre transparente; en scroll → oscuros sobre pill blanca
    const iconColor = heroVisible ? 'rgba(255,255,255,0.92)' : '#1a1a1a'

    return (
        <>
            {/* ── Overlay oscuro cuando el sidebar está abierto ─────── */}
            {open && <Overlay onClick={() => setOpen(false)} />}

            <NavBar
                ref={navRef}
                iconColor={iconColor}
                $heroVisible={heroVisible}
            >
                {/* Hamburger */}
                <HamburgerBtn onClick={() => setOpen(true)} iconColor={iconColor} aria-label="Abrir menú">
                    <span /><span /><span />
                </HamburgerBtn>

                {/* Logo central */}
                <BrandLink to="/" $heroVisible={heroVisible}>
                    <img src="/logo-nav.png" alt="La Casita del Hornero" />
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

                    {/* Cabecera: logo + cerrar */}
                    <SidebarHeader>
                        <SidebarLogoWrap>
                            <img src="/logo-footer.png" alt="La Casita del Hornero" />
                        </SidebarLogoWrap>
                        <CloseBtn onClick={() => setOpen(false)} aria-label="Cerrar menú">✕</CloseBtn>
                    </SidebarHeader>

                    <SidebarDivider />

                    {/* Navegación principal */}
                    <SidebarNav>
                        <SidebarNavLabel>Navegar</SidebarNavLabel>
                        <SidebarNavItem>
                            <Link to="/login">Iniciar sesión</Link>
                        </SidebarNavItem>
                        <SidebarNavItem>
                            <Link to="/">Inicio</Link>
                        </SidebarNavItem>
                        <SidebarNavItem>
                            <Link to="/products">Tienda</Link>
                        </SidebarNavItem>
                        <SidebarNavItem>
                            <Link to="/explorar">Artistas</Link>
                        </SidebarNavItem>
                        <SidebarNavItem>
                            <Link to="/cart">
                                Carrito
                                {cart && cart.length > 0 && <SidebarCartBadge>{cart.length}</SidebarCartBadge>}
                            </Link>
                        </SidebarNavItem>
                    </SidebarNav>

                    {/* ¿Querés vender? — debajo del carrito */}
                    <SellSection href="mailto:lacasitadelhornero@gmail.com" as="a">
                        <SellEyebrow>— Para artistas</SellEyebrow>
                        <SellTitle>¿Querés vender<br/>tu arte?</SellTitle>
                        <SellCta as="span">
                            Quiero vender →
                        </SellCta>
                    </SellSection>

                    <SidebarDivider />

                    {/* Footer */}
                    <SidebarFooterLinks>
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
    top: 18px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 99;
    width: min(calc(100vw - 48px), 980px);
    height: 56px;
    border-radius: 100px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;

    /* ── Hero: transparente sin fondo ── */
    /* ── Scrolled: pill con vidrio esmerilado ── */
    background: ${p => p.$heroVisible ? 'transparent' : 'rgba(255,255,255,0.22)'};
    backdrop-filter: ${p => p.$heroVisible ? 'none' : 'blur(24px) saturate(160%)'};
    -webkit-backdrop-filter: ${p => p.$heroVisible ? 'none' : 'blur(24px) saturate(160%)'};
    border: ${p => p.$heroVisible ? '1px solid transparent' : '1px solid rgba(255,255,255,0.28)'};
    box-shadow: ${p => p.$heroVisible ? 'none' : '0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)'};

    transition:
        background 0.45s ease,
        backdrop-filter 0.45s ease,
        border-color 0.45s ease,
        box-shadow 0.45s ease;

    @media (max-width: 640px) {
        width: calc(100vw - 24px);
        top: 12px;
        height: 52px;
    }
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
    top: 50%;
    transform: translate(-50%, -50%);
    text-decoration: none;
    display: flex;
    align-items: center;
    overflow: visible;
    z-index: 10;

    img {
        height: 120px;
        width: auto;
        display: block;
        filter: ${p => p.$heroVisible ? 'none' : 'invert(1) brightness(0)'};
        transition: filter 0.45s ease;
    }

    @media (max-width: 480px) {
        img { height: 90px; }
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
    width: 300px;
    max-width: 88vw;
    background: #c4622a;
    z-index: 100;
    border-radius: 0 24px 24px 0;
    transform: ${p => p.open ? 'translateX(0)' : 'translateX(-100%)'};
    transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
    overflow-y: auto;
    box-shadow: 6px 0 48px rgba(0,0,0,0.13);

    /* Scrollbar personalizado */
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,0.35) transparent;

    &::-webkit-scrollbar {
        width: 3px;
        margin-right: 4px;
    }
    &::-webkit-scrollbar-track {
        background: rgba(255,255,255,0.08);
        border-radius: 100px;
        margin: 120px 12px;
    }
    &::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.4);
        border-radius: 100px;
    }
    &::-webkit-scrollbar-thumb:hover {
        background: rgba(255,255,255,0.65);
    }
    padding-right: 6px;
`

const SidebarInner = styled.div`
    padding: 0 0 48px;
    display: flex;
    flex-direction: column;
    min-height: 100%;
`

const SidebarHeader = styled.div`
    position: relative;
    padding: 20px 24px 0;
    display: flex;
    justify-content: center;
`

const CloseBtn = styled.button`
    position: absolute;
    top: 20px;
    right: 20px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 14px;
    color: #999;
    padding: 4px;
    line-height: 1;
    transition: color 0.2s;

    &:hover { color: #fff; }
`

const SidebarLogoWrap = styled.div`
    display: flex;
    justify-content: center;

    img {
        width: 160px;
        height: auto;
        filter: brightness(0) invert(1);
    }
`

const SidebarDivider = styled.hr`
    border: none;
    border-top: 1px solid rgba(255,255,255,0.2);
    margin: 0 24px;
`

/* ── Nav principal ── */
const SidebarNav = styled.nav`
    padding: 28px 24px 24px;
    display: flex;
    flex-direction: column;
`

const SidebarNavLabel = styled.p`
    font-family: 'DM Sans', sans-serif;
    font-size: 7.5px;
    letter-spacing: 0.5em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.5);
    margin: 0 0 18px;
`

const SidebarNavItem = styled.div`
    a {
        font-family: 'Cormorant Garamond', Georgia, serif;
        font-size: 1.55rem;
        font-style: normal;
        font-weight: 400;
        color: #fff;
        text-decoration: none;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 0;
        border-bottom: 1px solid rgba(255,255,255,0.18);
        transition: color 0.2s, padding-left 0.2s;

        &:hover {
            color: rgba(255,255,255,0.7);
            padding-left: 10px;
        }
    }
`

const SidebarCartBadge = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background: rgba(255,255,255,0.25);
    border-radius: 50%;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 9px;
    font-style: normal;
    font-weight: 600;
    flex-shrink: 0;
`

/* ── Portales ── */
const PortalSection = styled.div`
    padding: 28px 24px 24px;
    display: flex;
    flex-direction: column;
    gap: 10px;
`

const PortalLink = styled(Link)`
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    background: #fff;
    border: 1px solid #D8C8B0;
    border-radius: 14px;
    border-radius: 4px;
    text-decoration: none;
    transition: border-color 0.2s, box-shadow 0.2s;

    &:hover {
        border-color: #898635;
        box-shadow: 0 2px 12px rgba(137,134,53,0.15);
    }
`

const PortalIcon = styled.span`
    font-size: 22px;
    flex-shrink: 0;
`

const PortalLinkTitle = styled.p`
    font-family: 'Schoolbell', cursive;
    font-size: 15px;
    color: #1a1a1a;
    margin: 0 0 2px;
`

const PortalLinkSub = styled.p`
    font-family: 'DM Sans', sans-serif;
    font-size: 9px;
    letter-spacing: 0.03em;
    color: #aaa;
    margin: 0;
`

/* ── ¿Querés vender? ── */
const SellSection = styled.div`
    margin: 0 16px;
    padding: 22px 20px 24px;
    background: #6b3a1f;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    text-decoration: none;
    cursor: pointer;
    transition: background 0.2s, box-shadow 0.2s;
    display: flex;
    flex-direction: column;
    gap: 10px;

    &:hover {
        background: #7d4520;
        box-shadow: 0 4px 20px rgba(107,58,31,0.35);
    }
`

const SellEyebrow = styled.p`
    font-family: 'DM Sans', sans-serif;
    font-size: 7.5px;
    letter-spacing: 0.5em;
    text-transform: uppercase;
    color: rgba(255,200,160,0.7);
    margin: 0;
`

const SellTitle = styled.h3`
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 1.35rem;
    font-weight: 400;
    font-style: normal;
    color: #fff;
    margin: 0;
    line-height: 1.2;
`

const SellBody = styled.p`
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    line-height: 1.6;
    color: rgba(255,255,255,0.55);
    margin: 0;
`

const SellCta = styled.a`
    display: inline-block;
    margin-top: 4px;
    font-family: 'DM Sans', sans-serif;
    font-size: 9px;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: rgba(255,200,160,0.9);
    text-decoration: none;
    transition: color 0.2s, letter-spacing 0.2s;

    &:hover {
        color: #ffc8a0;
        letter-spacing: 0.45em;
    }
`

/* ── Footer ── */
const SidebarFooterLinks = styled.div`
    margin-top: auto;
    padding: 24px 24px 0;
    border-top: 1px solid rgba(255,255,255,0.2);

    a, button {
        font-family: 'DM Sans', sans-serif;
        font-size: 9px;
        letter-spacing: 0.35em;
        text-transform: uppercase;
        color: rgba(255,255,255,0.45);
        text-decoration: none;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        text-align: left;
        transition: color 0.2s;

        &:hover { color: #fff; }
    }
`

export default Navbar
