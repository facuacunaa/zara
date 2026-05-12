import { useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components'

/* ── Animaciones ─────────────────────────────────────────── */
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
`
const lineGrow = keyframes`
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
`
const sweep = keyframes`
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
`
const fadeOut = keyframes`
    from { opacity: 1; }
    to   { opacity: 0; }
`

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

const Brand = styled.h1`
    font-family: 'Times New Roman', Georgia, serif;
    font-size: clamp(1.6rem, 5vw, 3rem);
    font-weight: 300;
    font-style: italic;
    color: transparent;
    letter-spacing: 0.04em;
    margin: 0 0 32px;
    text-align: center;
    line-height: 1.2;
    animation: ${fadeIn} 0.7s ease both;

    background: linear-gradient(
        90deg,
        rgba(255,255,255,0.25) 0%,
        rgba(255,255,255,0.9)  40%,
        rgba(255,255,255,1)    50%,
        rgba(255,255,255,0.9)  60%,
        rgba(255,255,255,0.25) 100%
    );
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    animation:
        ${fadeIn}  0.7s ease both,
        ${sweep}   2.2s linear 0.3s infinite;
`

const LineWrap = styled.div`
    width: clamp(120px, 30vw, 220px);
    height: 1px;
    background: rgba(255,255,255,0.08);
    overflow: hidden;
    animation: ${fadeIn} 0.7s 0.2s ease both;
`

const Line = styled.div`
    width: 100%;
    height: 100%;
    background: rgba(255,255,255,0.55);
    transform-origin: left center;
    animation: ${lineGrow} 1.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s both;
`

const Sub = styled.p`
    font-size: 0.6rem;
    letter-spacing: 0.45em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.2);
    margin: 20px 0 0;
    animation: ${fadeIn} 0.7s 0.5s ease both;
`

/* ── Componente ──────────────────────────────────────────── */
export default function PageLoader() {
    return (
        <Wrap>
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
