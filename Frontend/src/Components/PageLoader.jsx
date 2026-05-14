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
const floatUp = keyframes`
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-6px); }
`

/* ── Styled components ───────────────────────────────────── */
const LogoImg = styled.img`
    width: clamp(100px, 18vw, 160px);
    height: auto;
    margin-bottom: 28px;
    animation:
        ${fadeIn}  0.6s ease both,
        ${floatUp} 3.5s ease-in-out 0.6s infinite;
`

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
            <LogoImg src="/logo-hornero.png" alt="La Casita del Hornero" />
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
