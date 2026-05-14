import { useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components'

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
    50%       { transform: translateY(-6px); }
`
const blink = keyframes`
    0%, 100% { opacity: 0.18; }
    50%       { opacity: 0.5; }
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
    gap: 24px;
    animation: ${p => p.$out ? fadeOut : 'none'} 0.5s ease forwards;
    pointer-events: ${p => p.$out ? 'none' : 'all'};
`

const LogoImg = styled.img`
    width: clamp(200px, 35vw, 320px);
    height: auto;
    animation:
        ${fadeIn}  0.6s ease both,
        ${floatUp} 3.5s ease-in-out 0.6s infinite;
`

const Sub = styled.p`
    font-size: 0.55rem;
    letter-spacing: 0.5em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.18);
    margin: 0;
    animation: ${blink} 1.8s ease-in-out infinite;
`

export default function PageLoader() {
    return (
        <Wrap>
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
