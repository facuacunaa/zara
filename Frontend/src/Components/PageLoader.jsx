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
    /* entra desde la izquierda, un poco por encima del logo */
    0%   { transform: translate(-62vw, -8vh)  scale(0.5)  rotate(-4deg); opacity: 0; }
    8%   { transform: translate(-46vw, -7vh)  scale(0.7)  rotate(-5deg); opacity: 1; }
    /* cruza por el área blanca del logo (y entre -4vh y 2vh = centro del logo) */
    36%  { transform: translate(-12vw, -3vh)  scale(1.0)  rotate(-4deg); opacity: 1; }
    52%  { transform: translate(  2vw,  0vh)  scale(1.05) rotate(-2deg); opacity: 1; }
    /* ya pasó el logo, gira hacia abajo a la casita */
    64%  { transform: translate(  6vw,  4vh)  scale(0.85) rotate(18deg); opacity: 1; }
    78%  { transform: translate(  6vw,  9vh)  scale(0.45) rotate(36deg); opacity: 1; }
    90%  { transform: translate(  6vw, 11vh)  scale(0.15) rotate(44deg); opacity: 0.5; }
    100% { transform: translate(  6vw, 12vh)  scale(0)    rotate(48deg); opacity: 0; }
`

const LogoImg = styled.img`
    position: relative;
    z-index: 1;
    width: clamp(160px, 28vw, 260px);
    height: auto;
    display: block;
    animation:
        ${fadeIn}  0.5s ease both,
        ${floatUp} 3.5s ease-in-out 0.5s infinite;
`

const Sub = styled.p`
    font-size: 0.55rem;
    letter-spacing: 0.5em;
    text-transform: uppercase;
    color: rgba(0,0,0,0.25);
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
    background: #fff;
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

            <LogoImg src="/logo-hornero.png" alt="La Casita del Hornero" />

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
