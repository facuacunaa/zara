import { useEffect, useRef, useState } from 'react'
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
const blink = keyframes`
    0%, 100% { opacity: 0.2; }
    50%       { opacity: 0.5; }
`

/* ── Logo 3D: flota y rota suavemente en el espacio ── */
const float3d = keyframes`
    0%   { transform: perspective(700px) rotateX(6deg)  rotateY(-8deg)  translateY(0px);   }
    25%  { transform: perspective(700px) rotateX(2deg)  rotateY( 4deg)  translateY(-8px);  }
    50%  { transform: perspective(700px) rotateX(-4deg) rotateY( 9deg)  translateY(-12px); }
    75%  { transform: perspective(700px) rotateX( 2deg) rotateY(-2deg)  translateY(-6px);  }
    100% { transform: perspective(700px) rotateX(6deg)  rotateY(-8deg)  translateY(0px);   }
`
const logoFadeIn = keyframes`
    from { opacity: 0; transform: perspective(700px) rotateX(20deg) rotateY(-20deg) scale(0.85); }
    to   { opacity: 1; transform: perspective(700px) rotateX(6deg)  rotateY(-8deg)  scale(1); }
`

/*
  Pájaro vuela desde la izquierda hacia la casita del hornero
  (nido marrón en la rama superior-derecha del árbol del logo).
  La casita está en el cuadrante superior-derecho del logo:
  aprox. +7vw a la derecha y -7vh arriba del centro de pantalla.
*/
const flyIn = keyframes`
    /* aparece lejos a la izquierda, a la misma altura que la casita */
    0%   { transform: translate(-62vw, -6vh) scale(0.45) rotate(-3deg); opacity: 0; }
    7%   { transform: translate(-48vw, -7vh) scale(0.65) rotate(-4deg); opacity: 1; }
    /* cruza volando directo hacia la casita */
    32%  { transform: translate(-18vw, -7vh) scale(0.9)  rotate(-3deg); opacity: 1; }
    55%  { transform: translate(  0vw, -8vh) scale(1.0)  rotate(-2deg); opacity: 1; }
    /* se acerca al nido — leve descenso final hacia la rama */
    72%  { transform: translate(  5vw, -7vh) scale(0.8)  rotate( 3deg); opacity: 1; }
    /* entra en la casita — se achica y desaparece */
    88%  { transform: translate(  7vw, -7vh) scale(0.35) rotate( 6deg); opacity: 0.7; }
    100% { transform: translate(  8vw, -7vh) scale(0)    rotate( 8deg); opacity: 0; }
`

/* ── Sombra del logo en el suelo ── */
const shadowPulse = keyframes`
    0%, 100% { transform: scaleX(1)   translateY(0);   opacity: 0.12; }
    50%       { transform: scaleX(0.8) translateY(-6px); opacity: 0.07; }
`

/* ── Wrapper del logo con perspectiva 3D ── */
const LogoScene = styled.div`
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
`

const LogoImg = styled.img`
    width: clamp(160px, 28vw, 260px);
    height: auto;
    display: block;
    animation:
        ${logoFadeIn} 0.7s cubic-bezier(0.16, 1, 0.3, 1) both,
        ${float3d}    5s ease-in-out 0.7s infinite;
    transform-style: preserve-3d;
    filter: drop-shadow(0 18px 32px rgba(0,0,0,0.18)) drop-shadow(0 4px 8px rgba(0,0,0,0.10));
`

/* Sombra elíptica debajo del logo */
const LogoShadow = styled.div`
    width: clamp(100px, 18vw, 160px);
    height: 14px;
    background: radial-gradient(ellipse, rgba(0,0,0,0.18) 0%, transparent 70%);
    border-radius: 50%;
    margin-top: -8px;
    animation: ${shadowPulse} 5s ease-in-out 0.7s infinite;
`

const Sub = styled.p`
    font-size: 0.55rem;
    letter-spacing: 0.5em;
    text-transform: uppercase;
    color: rgba(0,0,0,0.25);
    margin: 0;
    animation: ${blink} 1.8s ease-in-out infinite;
`

/* Pájaro anclado al centro, siempre por delante */
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
    width: 58px; height: 36px;
    overflow: visible;
    /* sombra 3D debajo del pájaro */
    filter:
        drop-shadow(0 6px 10px rgba(0,0,0,0.28))
        drop-shadow(0 2px 3px rgba(0,0,0,0.18));
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
    gap: 20px;
    animation: ${p => p.$out ? fadeOut : 'none'} 0.55s ease forwards;
    pointer-events: ${p => p.$out ? 'none' : 'all'};
`

function Bird() {
    return (
        <BirdSvg viewBox="0 0 24 16" fill="none">
            {/* Ala izquierda */}
            <path
                d="M12 8 Q6 2 0 5"
                stroke="#1a1a1a" strokeWidth="2.4" strokeLinecap="round"
                style={{ animation: 'flapL 0.36s ease-in-out infinite alternate', transformOrigin: '12px 8px' }}
            />
            {/* Ala derecha */}
            <path
                d="M12 8 Q18 2 24 5"
                stroke="#1a1a1a" strokeWidth="2.4" strokeLinecap="round"
                style={{ animation: 'flapR 0.36s ease-in-out infinite alternate-reverse', transformOrigin: '12px 8px' }}
            />
            {/* Cuerpo */}
            <ellipse cx="12" cy="9" rx="3.2" ry="2.1" fill="#1a1a1a" />
            {/* Pico */}
            <path d="M15 8.5 L18 8 L15 9.2Z" fill="#555" />
            {/* Cola */}
            <path d="M9 10 Q6.5 13.5 4.5 12 Q7 11 9 10Z" fill="#1a1a1a" />
        </BirdSvg>
    )
}

export default function PageLoader({ ready = false, onDone }) {
    const [birdLanded, setBirdLanded] = useState(false)
    const [closing,    setClosing]    = useState(false)
    const onDoneRef = useRef(onDone)
    useEffect(() => { onDoneRef.current = onDone }, [onDone])

    // Cerrar cuando el pájaro aterriza Y los datos están listos
    useEffect(() => {
        if (birdLanded && ready) setClosing(true)
    }, [birdLanded, ready])

    // Pájaro toca la casita a los 88% de la animación:
    // delay(500ms) + duration(3000ms) × 0.88 = 3140ms desde mount
    useEffect(() => {
        const t = setTimeout(() => setBirdLanded(true), 3140)
        return () => clearTimeout(t)
    }, [])

    // Safety: fallback por si el timeout falla (ej. tab en segundo plano)
    useEffect(() => {
        if (!ready) return
        const t = setTimeout(() => setBirdLanded(true), 3600)
        return () => clearTimeout(t)
    }, [ready])

    // Safety 2: si closing=true pero onAnimationEnd no dispara, forzar onDone
    useEffect(() => {
        if (!closing) return
        const t = setTimeout(() => onDoneRef.current?.(), 800)
        return () => clearTimeout(t)
    }, [closing])

    // Safety 3: máximo absoluto — 5s sin importar nada
    useEffect(() => {
        const t = setTimeout(() => {
            setClosing(true)
            setTimeout(() => onDoneRef.current?.(), 600)
        }, 5000)
        return () => clearTimeout(t)
    }, [])

    return (
        <Wrap
            $out={closing}
            onAnimationEnd={(e) => {
                // Solo reaccionar al evento del Wrap mismo, no de hijos
                if (closing && e.target === e.currentTarget) onDone?.()
            }}
        >
            <style>{`
                @keyframes flapL {
                    from { transform: rotate(0deg);   }
                    to   { transform: rotate(-26deg); }
                }
                @keyframes flapR {
                    from { transform: rotate(0deg);  }
                    to   { transform: rotate(26deg); }
                }
            `}</style>

            <BirdWrap>
                <Bird />
            </BirdWrap>

            <LogoScene>
                <LogoImg src="/logo-hornero.png" alt="La Casita del Hornero" />
                <LogoShadow />
            </LogoScene>

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
