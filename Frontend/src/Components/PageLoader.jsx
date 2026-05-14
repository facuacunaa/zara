import { useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components'

/* ── Animaciones generales ── */
const fadeIn = keyframes`
    from { opacity: 0; }
    to   { opacity: 1; }
`
const fadeOut = keyframes`
    from { opacity: 1; }
    to   { opacity: 0; }
`
const floatUp = keyframes`
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-5px); }
`
const blink = keyframes`
    0%, 100% { opacity: 0.18; }
    50%       { opacity: 0.5; }
`

/* ── Pájaro: aleteo ── */
const flapTop = keyframes`
    0%, 100% { d: path("M12 8 Q6 3 0 6");  }
    50%       { d: path("M12 8 Q6 12 0 10"); }
`
const flapBottom = keyframes`
    0%, 100% { d: path("M12 8 Q18 3 24 6"); }
    50%       { d: path("M12 8 Q18 12 24 10"); }
`

/* ── Pájaro: vuelo desde la izquierda hacia el logo ── */
const flyIn = keyframes`
    0%   { transform: translate(-55vw, 18vh) scale(0.7) rotate(-5deg); opacity: 0; }
    10%  { opacity: 1; }
    60%  { transform: translate(-8vw,  4vh)  scale(1.1) rotate(-8deg); }
    80%  { transform: translate( 0vw,  0vh)  scale(1.0) rotate(-3deg); }
    88%  { transform: translate( 2vw, -2vh)  scale(0.95) rotate(0deg); opacity: 1; }
    100% { transform: translate( 0vw,  0vh)  scale(0)   rotate(0deg); opacity: 0; }
`

/* ── Círculo blanco ── */
const LogoCircle = styled.div`
    width:  clamp(220px, 38vw, 340px);
    height: clamp(220px, 38vw, 340px);
    border-radius: 50%;
    background: rgba(255,255,255,0.96);
    box-shadow:
        0 0  0   6px  rgba(255,255,255,0.15),
        0 12px 48px   rgba(0,0,0,0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    animation:
        ${fadeIn}  0.5s ease both,
        ${floatUp} 3.5s ease-in-out 0.5s infinite;
`

const LogoImg = styled.img`
    width:  78%;
    height: auto;
`

/* ── Texto ── */
const Sub = styled.p`
    font-size: 0.55rem;
    letter-spacing: 0.5em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.18);
    margin: 0;
    animation: ${blink} 1.8s ease-in-out infinite;
`

/* ── Contenedor del pájaro (posicionado relativo al logo) ── */
const BirdWrap = styled.div`
    position: absolute;
    /* centrado sobre el logo */
    top: 50%; left: 50%;
    width: 0; height: 0;
    pointer-events: none;
    animation: ${flyIn} 2.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s both;
`

/* SVG del pájaro */
const BirdSvg = styled.svg`
    position: absolute;
    /* desplazado para que llegue al centro del logo */
    transform: translate(-50%, -50%);
    width: 52px; height: 32px;
    overflow: visible;
    filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));
`

const Wrap = styled.div`
    position: fixed;
    inset: 0;
    z-index: 200;
    background:
        repeating-linear-gradient(
            65deg,
            transparent 0px, transparent 13px,
            rgba(196,154,38,0.08) 13px, rgba(196,154,38,0.08) 14px
        ),
        repeating-linear-gradient(
            -25deg,
            transparent 0px, transparent 20px,
            rgba(196,154,38,0.06) 20px, rgba(196,154,38,0.06) 21px
        ),
        linear-gradient(145deg, #0C1E14 0%, #183525 40%, #122A1C 70%, #0E2018 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 28px;
    animation: ${p => p.$out ? fadeOut : 'none'} 0.5s ease forwards;
    pointer-events: ${p => p.$out ? 'none' : 'all'};
`

/* Pájaro SVG sencillo con alas que aletean */
function Bird() {
    return (
        <BirdSvg viewBox="0 0 24 16" fill="none">
            {/* Ala izquierda */}
            <path
                d="M12 8 Q6 2 0 5"
                stroke="#2d5a3d" strokeWidth="2.2"
                strokeLinecap="round"
                style={{
                    animation: 'flapL 0.38s ease-in-out infinite alternate',
                    transformOrigin: '12px 8px'
                }}
            />
            {/* Ala derecha */}
            <path
                d="M12 8 Q18 2 24 5"
                stroke="#2d5a3d" strokeWidth="2.2"
                strokeLinecap="round"
                style={{
                    animation: 'flapR 0.38s ease-in-out infinite alternate-reverse',
                    transformOrigin: '12px 8px'
                }}
            />
            {/* Cuerpo */}
            <ellipse cx="12" cy="9" rx="3" ry="2" fill="#2d5a3d" />
            {/* Pico */}
            <path d="M15 8.5 L17.5 8 L15 9" fill="#c49a26" />
            {/* Cola */}
            <path d="M9 10 Q7 13 5 12 Q7 11 9 10Z" fill="#2d5a3d" />
        </BirdSvg>
    )
}

export default function PageLoader() {
    return (
        <Wrap>
            <style>{`
                @keyframes flapL {
                    from { transform: rotate(0deg);   }
                    to   { transform: rotate(-22deg); }
                }
                @keyframes flapR {
                    from { transform: rotate(0deg);  }
                    to   { transform: rotate(22deg); }
                }
            `}</style>

            {/* Pájaro vuela desde la izquierda hacia el logo */}
            <BirdWrap>
                <Bird />
            </BirdWrap>

            <LogoCircle>
                <LogoImg src="/logo-hornero.png" alt="La Casita del Hornero" />
            </LogoCircle>

            <Sub>Cargando</Sub>
        </Wrap>
    )
}

export function usePageReady(deps = []) {
    const [ready, setReady] = useState(false)
    useEffect(() => {
        const t = setTimeout(() => setReady(true), 80)
        return () => clearTimeout(t)
    }, deps) // eslint-disable-line
    return ready
}
