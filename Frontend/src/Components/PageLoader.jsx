import { useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components'

/* ── Generales ── */
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

/*
  Pájaro hace UN viaje:
  - Entra desde la izquierda volando alto
  - Pasa por encima del logo
  - Baja en picada hacia la casita y desaparece al entrar
  Duración: 3s
*/
const flyIn = keyframes`
    0%   { transform: translate(-62vw, -22vh) scale(0.55) rotate(-5deg); opacity: 0; }
    8%   { transform: translate(-46vw, -20vh) scale(0.72) rotate(-6deg); opacity: 1; }
    30%  { transform: translate(-14vw, -18vh) scale(0.98) rotate(-5deg); opacity: 1; }
    /* pasa sobre el logo */
    44%  { transform: translate(  3vw, -14vh) scale(1.02) rotate(-3deg); opacity: 1; }
    /* gira y baja en picada */
    58%  { transform: translate(  5vw,  -3vh) scale(0.85) rotate(22deg); opacity: 1; }
    76%  { transform: translate(  5vw,   8vh) scale(0.42) rotate(38deg); opacity: 1; }
    88%  { transform: translate(  5vw,  11vh) scale(0.15) rotate(42deg); opacity: 0.6; }
    100% { transform: translate(  5vw,  12vh) scale(0)    rotate(45deg); opacity: 0; }
`

/* ── Fondo orgánico blanco detrás del logo ── */
const LogoBg = styled.div`
    padding: 32px 28px 36px;
    background: rgba(255, 255, 255, 0.97);
    border-radius: 62% 38% 46% 54% / 56% 44% 60% 44%;
    box-shadow:
        0 0 0 5px rgba(255,255,255,0.18),
        0 16px 56px rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    animation:
        ${fadeIn}  0.5s ease both,
        ${floatUp} 3.5s ease-in-out 0.5s infinite;
`

const LogoImg = styled.img`
    width: clamp(160px, 28vw, 260px);
    height: auto;
    display: block;
`

const Sub = styled.p`
    font-size: 0.55rem;
    letter-spacing: 0.5em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.18);
    margin: 0;
    animation: ${blink} 1.8s ease-in-out infinite;
`

/* Pájaro anclado al centro — z-index alto para pasar por DELANTE del logo */
const BirdWrap = styled.div`
    position: absolute;
    top: 50%; left: 50%;
    width: 0; height: 0;
    pointer-events: none;
    z-index: 10;
    animation: ${flyIn} 3s cubic-bezier(0.33, 0.1, 0.5, 1) 0.5s both;
`

const BirdSvg = styled.svg`
    position: absolute;
    transform: translate(-50%, -50%);
    width: 54px; height: 34px;
    overflow: visible;
    filter: drop-shadow(0 2px 5px rgba(0,0,0,0.35));
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
    animation: ${p => p.$out ? fadeOut : 'none'} 0.55s ease forwards;
    pointer-events: ${p => p.$out ? 'none' : 'all'};
`

function Bird() {
    return (
        <BirdSvg viewBox="0 0 24 16" fill="none">
            <path
                d="M12 8 Q6 2 0 5"
                stroke="#111" strokeWidth="2.2" strokeLinecap="round"
                style={{ animation: 'flapL 0.36s ease-in-out infinite alternate', transformOrigin: '12px 8px' }}
            />
            <path
                d="M12 8 Q18 2 24 5"
                stroke="#111" strokeWidth="2.2" strokeLinecap="round"
                style={{ animation: 'flapR 0.36s ease-in-out infinite alternate-reverse', transformOrigin: '12px 8px' }}
            />
            <ellipse cx="12" cy="9" rx="3" ry="2" fill="#111" />
            <path d="M15 8.5 L17.5 8 L15 9" fill="#666" />
            <path d="M9 10 Q7 13 5 12 Q7 11 9 10Z" fill="#111" />
        </BirdSvg>
    )
}

/*
  Props:
    ready   — los datos ya cargaron (viene del padre)
    onDone  — callback cuando el loader termina de desvanecerse
*/
export default function PageLoader({ ready = false, onDone }) {
    const [birdLanded, setBirdLanded] = useState(false)
    const [closing,    setClosing]    = useState(false)

    // Cuando el pájaro aterriza Y los datos están listos → cerrar
    useEffect(() => {
        if (birdLanded && ready) setClosing(true)
    }, [birdLanded, ready])

    // Si los datos cargan DESPUÉS que el pájaro, cerrar igual
    // Si los datos cargan ANTES, el cierre queda pendiente hasta que el pájaro llegue

    return (
        <Wrap
            $out={closing}
            onAnimationEnd={(e) => {
                if (closing) onDone?.()
            }}
        >
            <style>{`
                @keyframes flapL {
                    from { transform: rotate(0deg);   }
                    to   { transform: rotate(-24deg); }
                }
                @keyframes flapR {
                    from { transform: rotate(0deg);  }
                    to   { transform: rotate(24deg); }
                }
            `}</style>

            <BirdWrap onAnimationEnd={() => setBirdLanded(true)}>
                <Bird />
            </BirdWrap>

            <LogoBg>
                <LogoImg src="/logo-hornero.png" alt="La Casita del Hornero" />
            </LogoBg>

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
