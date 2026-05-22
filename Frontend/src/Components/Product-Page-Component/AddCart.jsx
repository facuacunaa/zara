import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useDispatch } from 'react-redux'
import { getCart, postCart } from '../../Redux/App/action'
import DrawerBody from './DrawerBody'
import styled, { keyframes, css } from 'styled-components'

/* ─────────────────────────────────────────────────────────────────────────── */
/*  States: idle → adding → confirmed → open                                   */
/* ─────────────────────────────────────────────────────────────────────────── */
export default function AddCart({ data }) {
    const dispatch   = useDispatch()
    const [phase, setPhase] = useState('idle')   // idle | adding | confirmed | open
    const [panelVisible, setPanelVisible] = useState(false)
    const timerRef = useRef(null)

    /* cleanup timers on unmount */
    useEffect(() => () => clearTimeout(timerRef.current), [])

    /* lock body scroll when panel is open */
    useEffect(() => {
        if (panelVisible) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [panelVisible])

    const handleAdd = () => {
        if (phase !== 'idle') return
        setPhase('adding')
        dispatch(postCart(data)).then(() => {
            dispatch(getCart())
            setPhase('confirmed')
            timerRef.current = setTimeout(() => {
                setPhase('open')
                setPanelVisible(true)
            }, 900)
        })
    }

    const closePanel = () => {
        setPanelVisible(false)
        setTimeout(() => setPhase('idle'), 500)
    }

    /* Escape key */
    useEffect(() => {
        if (!panelVisible) return
        const fn = e => { if (e.key === 'Escape') closePanel() }
        window.addEventListener('keydown', fn)
        return () => window.removeEventListener('keydown', fn)
    }, [panelVisible])

    return (
        <>
            {/* ── BUTTON ── */}
            <AddBtn phase={phase} onClick={handleAdd} disabled={phase === 'adding'}>
                {phase === 'adding'   && <><Spinner /><span>Añadiendo…</span></>}
                {phase === 'confirmed' && <><CheckMark>✓</CheckMark><span>Añadido al carrito</span></>}
                {phase === 'open'     && <><CheckMark>✓</CheckMark><span>Añadido al carrito</span></>}
                {phase === 'idle'     && <span>Agregar al carrito</span>}
            </AddBtn>

            {/* ── SIDE PANEL (portal) ── */}
            {(phase === 'open' || phase === 'confirmed') && createPortal(
                <>
                    <Overlay visible={panelVisible} onClick={closePanel} />
                    <Panel visible={panelVisible}>
                        {/* header */}
                        <PanelHeader>
                            <PanelTitle>Tu carrito</PanelTitle>
                            <CloseBtn onClick={closePanel}>
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <line x1="1" y1="1" x2="13" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                    <line x1="13" y1="1" x2="1" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                </svg>
                            </CloseBtn>
                        </PanelHeader>

                        {/* added item highlight */}
                        <AddedBanner>
                            <AddedImg>
                                {data.image
                                    ? <img src={data.image} alt={data.producttitle} />
                                    : <span>{data.producttitle?.charAt(0)}</span>
                                }
                            </AddedImg>
                            <AddedInfo>
                                <AddedEyebrow>Recién añadido</AddedEyebrow>
                                <AddedName>{data.producttitle}</AddedName>
                                <AddedPrice>{data.price}</AddedPrice>
                            </AddedInfo>
                            <CheckCircle>✓</CheckCircle>
                        </AddedBanner>

                        {/* rest of cart */}
                        <PanelBody>
                            <DrawerBody addedId={data.id} />
                        </PanelBody>
                    </Panel>
                </>,
                document.body
            )}
        </>
    )
}

/* ── Animations ─────────────────────────────────────────────────────────── */
const slideIn = keyframes`
    from { transform: translateX(100%); }
    to   { transform: translateX(0); }
`
const slideOut = keyframes`
    from { transform: translateX(0); }
    to   { transform: translateX(100%); }
`
const fadeIn = keyframes`from { opacity:0 } to { opacity:1 }`
const fadeOut = keyframes`from { opacity:1 } to { opacity:0 }`

const spin = keyframes`to { transform: rotate(360deg) }`
const checkPop = keyframes`
    0%   { transform: scale(0.5); opacity:0 }
    60%  { transform: scale(1.2); opacity:1 }
    100% { transform: scale(1);   opacity:1 }
`

/* ── Button ─────────────────────────────────────────────────────────────── */
const AddBtn = styled.button`
    width: 100%;
    border: none;
    padding: 16px 24px;
    font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
    font-size: 10px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    cursor: ${p => p.phase === 'adding' ? 'default' : 'pointer'};
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: background 0.3s, color 0.3s;
    position: relative;
    overflow: hidden;

    ${p => (p.phase === 'idle') && css`
        background: #0a0a0a;
        color: #fff;
        &:hover { background: #333; }
    `}
    ${p => (p.phase === 'adding') && css`
        background: #0a0a0a;
        color: rgba(255,255,255,0.6);
    `}
    ${p => (p.phase === 'confirmed' || p.phase === 'open') && css`
        background: #1a1a1a;
        color: #c8b89a;
    `}
`

const Spinner = styled.span`
    display: inline-block;
    width: 10px;
    height: 10px;
    border: 1.5px solid rgba(255,255,255,0.25);
    border-top-color: #fff;
    border-radius: 50%;
    animation: ${spin} 0.7s linear infinite;
    flex-shrink: 0;
`

const CheckMark = styled.span`
    animation: ${checkPop} 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
    font-size: 12px;
`

/* ── Overlay ─────────────────────────────────────────────────────────────── */
const Overlay = styled.div`
    position: fixed; inset: 0;
    background: rgba(5, 5, 5, 0.5);
    backdrop-filter: blur(2px);
    z-index: 9998;
    animation: ${p => p.visible ? fadeIn : fadeOut} 0.4s ease both;
`

/* ── Panel ───────────────────────────────────────────────────────────────── */
const Panel = styled.div`
    position: fixed; top: 0; right: 0; bottom: 0;
    width: 420px; max-width: 95vw;
    background: #fafaf8;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    animation: ${p => p.visible ? slideIn : slideOut} 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
    box-shadow: -8px 0 60px rgba(0,0,0,0.14);
`

const PanelHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 28px 20px;
    border-bottom: 1px solid #f0f0ee;
    flex-shrink: 0;
`

const PanelTitle = styled.h3`
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 1.1rem;
    font-weight: 500;
    font-style: normal;
    color: #0a0a0a;
    margin: 0;
`

const CloseBtn = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    color: #aaa;
    padding: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s;
    &:hover { color: #0a0a0a; }
`

/* ── Added item banner ───────────────────────────────────────────────────── */
const AddedBanner = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px 28px;
    background: #fff;
    border-bottom: 1px solid #f0f0ee;
    flex-shrink: 0;
    position: relative;
`

const AddedImg = styled.div`
    width: 64px;
    flex-shrink: 0;
    aspect-ratio: 3/4;
    background: #f0f0ee;
    overflow: hidden;

    img {
        width: 100%; height: 100%;
        object-fit: cover; display: block;
    }
    span {
        width: 100%; height: 100%;
        display: flex; align-items: center; justify-content: center;
        font-family: 'Cormorant Garamond', Georgia, serif;
        font-size: 1.4rem; font-style: normal;
        color: rgba(0,0,0,0.15);
    }
`

const AddedInfo = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 5px;
`

const AddedEyebrow = styled.p`
    font-family: 'DM Sans', sans-serif;
    font-size: 8px;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: #c8b89a;
    margin: 0;
`

const AddedName = styled.p`
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 500;
    color: #0a0a0a;
    margin: 0;
    line-height: 1.4;
`

const AddedPrice = styled.p`
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 14px;
    font-style: normal;
    color: #555;
    margin: 0;
`

const CheckCircle = styled.div`
    width: 28px; height: 28px;
    border-radius: 50%;
    background: #0a0a0a;
    color: #fff;
    font-size: 12px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    animation: ${checkPop} 0.5s 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
`

/* ── Scrollable cart content ─────────────────────────────────────────────── */
const PanelBody = styled.div`
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
`
