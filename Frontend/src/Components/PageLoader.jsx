import { useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components'

/* ── Animaciones ─────────────────────────────────────────── */
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
`
const lineGrow = keyframes`
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
`
const fadeOut = keyframes`
    from { opacity: 1; }
    to   { opacity: 0; }
`
const drawPath = keyframes`
    from { stroke-dashoffset: 1; }
    to   { stroke-dashoffset: 0; }
`
const floatUp = keyframes`
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-6px); }
`

/* ── SVG árbol con hornero (igual al sidebar, stroke blanco) ── */
const HorneroTreeLoader = () => (
    <TreeSvg
        viewBox="0 0 200 270"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
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

        {/* Hojitas */}
        <ellipse cx="10" cy="146" rx="7" ry="4" transform="rotate(-35 10 146)" strokeWidth="1.5"/>
        <ellipse cx="7" cy="150" rx="5" ry="3" transform="rotate(-20 7 150)" strokeWidth="1.2"/>
        <ellipse cx="45" cy="161" rx="6" ry="3.5" transform="rotate(-30 45 161)" strokeWidth="1.5"/>
        <ellipse cx="50" cy="118" rx="6" ry="4" transform="rotate(-25 50 118)" strokeWidth="1.5"/>
        <ellipse cx="170" cy="129" rx="6" ry="3.5" transform="rotate(25 170 129)" strokeWidth="1.5"/>
        <ellipse cx="174" cy="131" rx="5" ry="3" transform="rotate(15 174 131)" strokeWidth="1.2"/>

        {/* Nido */}
        <ellipse cx="150" cy="116" rx="20" ry="15" strokeWidth="2.5"/>
        <ellipse cx="142" cy="118" rx="7" ry="6" strokeWidth="2"/>
        <path strokeWidth="1" d="M 137,106 C 141,104 147,104 152,106"/>
        <path strokeWidth="1" d="M 133,125 C 137,127 143,127 149,125"/>
        <path strokeWidth="0.8" d="M 134,115 C 136,113 140,113 143,115"/>

        {/* Hornero */}
        <ellipse cx="163" cy="131" rx="9" ry="6" strokeWidth="2"/>
        <circle cx="172" cy="127" r="5.5" strokeWidth="2"/>
        <path strokeWidth="1.8" d="M 177,126 L 183,124"/>
        <circle cx="174" cy="126" r="1.3" fill="rgba(255,255,255,0.9)" stroke="none"/>
        <path strokeWidth="1.5" d="M 154,133 C 151,137 148,140 147,144"/>
        <path strokeWidth="1.5" d="M 156,129 C 159,127 163,127 167,130"/>
        <path strokeWidth="1.2" d="M 163,137 L 163,143 M 160,143 L 163,143 L 166,143"/>
    </TreeSvg>
)

/* ── Styled components ───────────────────────────────────── */
const Wrap = styled.div`
    position: fixed;
    inset: 0;
    z-index: 200;
    background: #0a0a0a;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0;
    animation: ${p => p.$out ? fadeOut : 'none'} 0.5s ease forwards;
    pointer-events: ${p => p.$out ? 'none' : 'all'};
`

const TreeSvg = styled.svg`
    width: clamp(100px, 18vw, 160px);
    height: auto;
    stroke: rgba(255,255,255,0.75);
    margin-bottom: 28px;
    animation: ${floatUp} 3.5s ease-in-out infinite;

    /* cada path/ellipse/circle se dibuja progresivamente */
    path, ellipse, circle {
        stroke-dasharray: 1;
        stroke-dashoffset: 1;
        pathLength: 1;
        animation: ${drawPath} 1.8s cubic-bezier(0.4, 0, 0.2, 1) both;
    }

    /* escalonar el dibujo de cada elemento */
    path:nth-child(1)  { animation-delay: 0.00s; }
    path:nth-child(2)  { animation-delay: 0.05s; }
    path:nth-child(3)  { animation-delay: 0.10s; }
    path:nth-child(4)  { animation-delay: 0.18s; }
    path:nth-child(5)  { animation-delay: 0.24s; }
    path:nth-child(6)  { animation-delay: 0.30s; }
    path:nth-child(7)  { animation-delay: 0.35s; }
    path:nth-child(8)  { animation-delay: 0.40s; }
    path:nth-child(9)  { animation-delay: 0.44s; }
    path:nth-child(10) { animation-delay: 0.48s; }
    path:nth-child(11) { animation-delay: 0.52s; }
    path:nth-child(12) { animation-delay: 0.56s; }
    path:nth-child(13) { animation-delay: 0.60s; }
    ellipse:nth-of-type(1) { animation-delay: 0.65s; }
    ellipse:nth-of-type(2) { animation-delay: 0.68s; }
    ellipse:nth-of-type(3) { animation-delay: 0.71s; }
    ellipse:nth-of-type(4) { animation-delay: 0.74s; }
    ellipse:nth-of-type(5) { animation-delay: 0.77s; }
    ellipse:nth-of-type(6) { animation-delay: 0.80s; }
    ellipse:nth-of-type(7) { animation-delay: 0.84s; }
    ellipse:nth-of-type(8) { animation-delay: 0.88s; }
    circle:nth-of-type(1)  { animation-delay: 0.92s; }
    circle:nth-of-type(2)  { animation-delay: 0.95s; }
`

const Brand = styled.h1`
    font-family: 'Times New Roman', Georgia, serif;
    font-size: clamp(1.2rem, 3.5vw, 2rem);
    font-weight: 300;
    font-style: italic;
    color: rgba(255,255,255,0.8);
    letter-spacing: 0.04em;
    margin: 0 0 24px;
    text-align: center;
    line-height: 1.3;
    animation: ${fadeIn} 0.7s 0.6s ease both;
`

const LineWrap = styled.div`
    width: clamp(80px, 20vw, 160px);
    height: 1px;
    background: rgba(255,255,255,0.08);
    overflow: hidden;
    animation: ${fadeIn} 0.7s 0.7s ease both;
`

const Line = styled.div`
    width: 100%;
    height: 100%;
    background: rgba(255,255,255,0.4);
    transform-origin: left center;
    animation: ${lineGrow} 1.8s cubic-bezier(0.4, 0, 0.2, 1) 0.8s both;
`

const Sub = styled.p`
    font-size: 0.55rem;
    letter-spacing: 0.5em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.18);
    margin: 16px 0 0;
    animation: ${fadeIn} 0.7s 1s ease both;
`

/* ── Componente ──────────────────────────────────────────── */
export default function PageLoader() {
    return (
        <Wrap>
            <HorneroTreeLoader />
            <Brand>La Casita<br/>del Hornero</Brand>
            <LineWrap>
                <Line />
            </LineWrap>
            <Sub>Cargando</Sub>
        </Wrap>
    )
}

/* ── Hook para usar en páginas individuales ──────────────── */
export function usePageReady(deps = []) {
    const [ready, setReady] = useState(false)
    useEffect(() => {
        const t = setTimeout(() => setReady(true), 80)
        return () => clearTimeout(t)
    }, deps) // eslint-disable-line
    return ready
}
