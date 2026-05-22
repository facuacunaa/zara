import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import styled, { keyframes, css } from 'styled-components'
import AddCart from './AddCart'
import RelatedSections from './RelatedSections'

function parsePrice(str) {
    if (!str) return 0
    return parseFloat(String(str).replace(/[^0-9.,]/g, '').replace(',', '.')) || 0
}

/* ═══════════════════════════════════════════════════════════════════════════
   LIGHTBOX — full-screen image viewer with zoom + pan + navigation
═══════════════════════════════════════════════════════════════════════════ */
function Lightbox({ images, startIdx, onClose }) {
    const [idx,      setIdx]      = useState(startIdx)
    const [loaded,   setLoaded]   = useState(false)
    const [zoomed,   setZoomed]   = useState(false)
    const [pos,      setPos]      = useState({ x: 0, y: 0 })
    const dragging  = useRef(false)
    const dragStart = useRef({ x: 0, y: 0 })
    const imgRef    = useRef(null)

    const goNext = useCallback(() => {
        setIdx(i => (i + 1) % images.length)
        setZoomed(false); setPos({ x: 0, y: 0 }); setLoaded(false)
    }, [images.length])

    const goPrev = useCallback(() => {
        setIdx(i => (i - 1 + images.length) % images.length)
        setZoomed(false); setPos({ x: 0, y: 0 }); setLoaded(false)
    }, [images.length])

    // Keyboard
    useEffect(() => {
        const fn = e => {
            if (e.key === 'Escape')      onClose()
            if (e.key === 'ArrowRight')  goNext()
            if (e.key === 'ArrowLeft')   goPrev()
        }
        window.addEventListener('keydown', fn)
        return () => window.removeEventListener('keydown', fn)
    }, [onClose, goNext, goPrev])

    // Toggle zoom on click (only if not panning)
    const handleImgClick = () => {
        if (dragging.current) return
        if (zoomed) { setZoomed(false); setPos({ x: 0, y: 0 }) }
        else        setZoomed(true)
    }

    // Pan — mouse
    const onMouseDown = e => {
        if (!zoomed) return
        e.preventDefault()
        dragging.current = false
        dragStart.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup',   onMouseUp)
    }
    const onMouseMove = e => {
        dragging.current = true
        setPos({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y })
    }
    const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('mouseup',   onMouseUp)
        setTimeout(() => { dragging.current = false }, 0)
    }

    // Pan — touch
    const onTouchStart = e => {
        if (!zoomed || e.touches.length !== 1) return
        dragging.current = false
        dragStart.current = { x: e.touches[0].clientX - pos.x, y: e.touches[0].clientY - pos.y }
    }
    const onTouchMove = e => {
        if (!zoomed || e.touches.length !== 1) return
        dragging.current = true
        setPos({ x: e.touches[0].clientX - dragStart.current.x, y: e.touches[0].clientY - dragStart.current.y })
    }

    return createPortal(
        <LBOverlay onClick={e => { if (e.target === e.currentTarget) onClose() }}>

            {/* ── CLOSE ── */}
            <LBClose onClick={onClose}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <line x1="1" y1="1" x2="15" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="15" y1="1" x2="1"  y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
            </LBClose>

            {/* ── COUNTER ── */}
            <LBCounter>{idx + 1} / {images.length}</LBCounter>

            {/* ── PREV / NEXT ── */}
            {images.length > 1 && (
                <>
                    <LBArrow $side="left" onClick={goPrev}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <polyline points="13,3 6,10 13,17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </LBArrow>
                    <LBArrow $side="right" onClick={goNext}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <polyline points="7,3 14,10 7,17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </LBArrow>
                </>
            )}

            {/* ── MAIN IMAGE ── */}
            <LBImgArea>
                {!loaded && <LBSkeleton />}
                <LBImg
                    ref={imgRef}
                    key={images[idx]}
                    src={images[idx]}
                    alt={`foto ${idx + 1}`}
                    $zoomed={zoomed}
                    $loaded={loaded}
                    style={{ transform: zoomed ? `scale(2.2) translate(${pos.x / 2.2}px, ${pos.y / 2.2}px)` : 'scale(1)' }}
                    onLoad={() => setLoaded(true)}
                    onClick={handleImgClick}
                    onMouseDown={onMouseDown}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    draggable={false}
                />
                <LBZoomHint $zoomed={zoomed}>
                    {zoomed ? 'Click para alejar · arrastrá para mover' : 'Click para acercar'}
                </LBZoomHint>
            </LBImgArea>

            {/* ── THUMBNAILS ── */}
            {images.length > 1 && (
                <LBThumbs>
                    {images.map((url, i) => (
                        <LBThumb
                            key={i}
                            $active={i === idx}
                            onClick={() => {
                                setIdx(i); setZoomed(false)
                                setPos({ x: 0, y: 0 }); setLoaded(false)
                            }}
                        >
                            <img src={url} alt={`foto ${i + 1}`} loading="lazy" />
                        </LBThumb>
                    ))}
                </LBThumbs>
            )}
        </LBOverlay>,
        document.body
    )
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN MODAL
═══════════════════════════════════════════════════════════════════════════ */
export default function ProductDetailModal({ product, onClose, allProducts, onSelect }) {
    const [visible,      setVisible]      = useState(false)
    const [imgLoaded,    setImgLoaded]    = useState(false)
    const [activeIdx,    setActiveIdx]    = useState(0)
    const [lightboxOpen, setLightboxOpen] = useState(false)

    const displayImages = product.images?.length
        ? product.images
        : product.image ? [product.image] : []
    const activeImg = displayImages[activeIdx] || ''

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 10)
        return () => clearTimeout(t)
    }, [])

    useEffect(() => {
        setImgLoaded(false)
        setActiveIdx(0)
    }, [product._id, product.name])

    useEffect(() => {
        // Only handle Escape when lightbox is closed (lightbox handles it itself)
        if (lightboxOpen) return
        const fn = e => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', fn)
        return () => window.removeEventListener('keydown', fn)
    }, [onClose, lightboxOpen])

    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = '' }
    }, [])

    const cartData = {
        producttitle: product.name,
        image:        product.image,
        price:        product.price,
        pricenum:     parsePrice(product.price),
        quantity:     1,
        color:        '',
        id:           product._id || product.name,
    }

    return createPortal(
        <>
            <Backdrop visible={visible} onClick={onClose} />
            <Modal visible={visible}>

                {/* ── HEADER ─────────────────────────────────────────────── */}
                <Header>
                    <HeaderLeft>
                        <HeaderEyebrow>Detalle de producto</HeaderEyebrow>
                        {product.artistName && (
                            <HeaderArtist>{product.artistName}</HeaderArtist>
                        )}
                    </HeaderLeft>
                    <CloseBtn onClick={onClose} aria-label="Cerrar">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <line x1="1" y1="1" x2="15" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            <line x1="15" y1="1" x2="1"  y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                    </CloseBtn>
                </Header>

                {/* ── BODY ───────────────────────────────────────────────── */}
                <Body>

                    {/* LEFT — image gallery */}
                    <ImageCol>

                        {/* Main image — click to open lightbox */}
                        <ImageWrap onClick={() => displayImages.length > 0 && setLightboxOpen(true)}>
                            {!imgLoaded && <ImgSkeleton />}
                            {activeImg && (
                                <img
                                    key={activeImg}
                                    src={activeImg}
                                    alt={product.name}
                                    onLoad={() => setImgLoaded(true)}
                                    style={{
                                        position: 'absolute', inset: 0,
                                        width: '100%', height: '100%',
                                        objectFit: 'cover',
                                        opacity: imgLoaded ? 1 : 0,
                                        transition: 'opacity 0.7s ease',
                                    }}
                                />
                            )}
                            {/* Hover hint */}
                            {imgLoaded && (
                                <ZoomHintOverlay>
                                    <ZoomIcon>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <circle cx="11" cy="11" r="7"/>
                                            <line x1="16.5" y1="16.5" x2="22" y2="22"/>
                                            <line x1="11" y1="8" x2="11" y2="14"/>
                                            <line x1="8" y1="11" x2="14" y2="11"/>
                                        </svg>
                                    </ZoomIcon>
                                    <span>Ver en detalle</span>
                                </ZoomHintOverlay>
                            )}
                            {/* Photo counter badge */}
                            {displayImages.length > 1 && (
                                <PhotoCount>{displayImages.length} fotos</PhotoCount>
                            )}
                        </ImageWrap>

                        {/* Thumbnail strip */}
                        {displayImages.length > 1 && (
                            <ThumbStrip>
                                {displayImages.map((url, i) => (
                                    <Thumb
                                        key={i}
                                        $active={i === activeIdx}
                                        onClick={() => { setActiveIdx(i); setImgLoaded(false) }}
                                    >
                                        <img src={url} alt={`foto ${i + 1}`} loading="lazy" />
                                        {i === activeIdx && <ThumbActiveLine />}
                                    </Thumb>
                                ))}
                            </ThumbStrip>
                        )}
                    </ImageCol>

                    {/* RIGHT — scrollable info + related */}
                    <InfoCol>
                        <ProductInfo>
                            <InfoArtist>{product.artistName || '—'}</InfoArtist>
                            <InfoName>{product.name}</InfoName>
                            <InfoPrice>{product.price}</InfoPrice>

                            {product.description && (
                                <InfoDesc>{product.description}</InfoDesc>
                            )}

                            <InfoDivider />
                            <AddCart data={cartData} />

                            <InfoMeta>
                                <InfoMetaItem><InfoMetaIcon>✦</InfoMetaIcon>Arte original</InfoMetaItem>
                                <InfoMetaItem><InfoMetaIcon>✦</InfoMetaIcon>Pieza única</InfoMetaItem>
                                <InfoMetaItem><InfoMetaIcon>✦</InfoMetaIcon>Envío a todo el país</InfoMetaItem>
                            </InfoMeta>
                        </ProductInfo>

                        <RelatedSections
                            product={product}
                            allProducts={allProducts}
                            onSelect={onSelect}
                        />
                    </InfoCol>
                </Body>
            </Modal>

            {/* LIGHTBOX */}
            {lightboxOpen && displayImages.length > 0 && (
                <Lightbox
                    images={displayImages}
                    startIdx={activeIdx}
                    onClose={() => setLightboxOpen(false)}
                />
            )}
        </>,
        document.body
    )
}

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES — LIGHTBOX
═══════════════════════════════════════════════════════════════════════════ */
const lbFadeIn = keyframes`from{opacity:0}to{opacity:1}`

const LBOverlay = styled.div`
    position: fixed; inset: 0;
    background: rgba(4, 4, 4, 0.97);
    z-index: 19999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    animation: ${lbFadeIn} 0.25s ease both;
    user-select: none;
`

const LBClose = styled.button`
    position: absolute; top: 20px; right: 24px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.15);
    color: #fff;
    width: 40px; height: 40px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; z-index: 2;
    transition: background 0.2s;
    &:hover { background: rgba(255,255,255,0.2); }
`

const LBCounter = styled.div`
    position: absolute; top: 26px; left: 50%;
    transform: translateX(-50%);
    font-family: 'DM Sans', sans-serif;
    font-size: 10px; letter-spacing: 0.3em;
    color: rgba(255,255,255,0.4);
    z-index: 2;
`

const LBArrow = styled.button`
    position: absolute;
    top: 50%; transform: translateY(-50%);
    ${p => p.$side === 'left'  ? 'left: 20px;'  : 'right: 20px;'}
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.15);
    color: #fff;
    width: 44px; height: 44px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; z-index: 2;
    transition: background 0.2s;
    &:hover { background: rgba(255,255,255,0.2); }

    @media (max-width: 640px) {
        top: auto; bottom: 80px; transform: none;
        ${p => p.$side === 'left'  ? 'left: 16px;' : 'right: 16px;'}
    }
`

const LBImgArea = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 60px 80px 12px;
    position: relative;
    overflow: hidden;

    @media (max-width: 640px) { padding: 56px 16px 8px; }
`

const lbImgIn = keyframes`from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)}`

const LBImg = styled.img`
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    display: block;
    opacity: ${p => p.$loaded ? 1 : 0};
    transition: ${p => p.$zoomed
        ? 'transform 0.2s ease'
        : 'transform 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease'};
    cursor: ${p => p.$zoomed ? 'grab' : 'zoom-in'};
    animation: ${p => p.$loaded ? css`${lbImgIn} 0.3s ease both` : 'none'};
    transform-origin: center center;

    &:active { cursor: ${p => p.$zoomed ? 'grabbing' : 'zoom-in'}; }
`

const LBSkeleton = styled.div`
    position: absolute; inset: 60px 80px 12px;
    background: #111;
    animation: ${keyframes`0%,100%{opacity:.4}50%{opacity:.8}`} 1.4s ease infinite;
`

const LBZoomHint = styled.p`
    position: absolute; bottom: 16px; left: 50%;
    transform: translateX(-50%);
    font-family: 'DM Sans', sans-serif;
    font-size: 9px; letter-spacing: 0.25em;
    color: rgba(255,255,255,0.3);
    white-space: nowrap; pointer-events: none;
`

const LBThumbs = styled.div`
    display: flex; gap: 6px;
    padding: 10px 80px 18px;
    overflow-x: auto;
    scrollbar-width: none;
    flex-shrink: 0;
    &::-webkit-scrollbar { display: none; }

    @media (max-width: 640px) { padding: 8px 16px 16px; }
`

const LBThumb = styled.button`
    flex-shrink: 0;
    width: 52px; height: 68px;
    overflow: hidden; padding: 0;
    border: 2px solid ${p => p.$active ? '#fff' : 'rgba(255,255,255,0.2)'};
    background: none; cursor: pointer;
    opacity: ${p => p.$active ? 1 : 0.5};
    transition: opacity 0.2s, border-color 0.2s;

    img { width: 100%; height: 100%; object-fit: cover; display: block; }
    &:hover { opacity: 1; border-color: rgba(255,255,255,0.7); }
`

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES — MAIN MODAL
═══════════════════════════════════════════════════════════════════════════ */
const slideUp = keyframes`
    from { transform: translateY(40px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
`
const fadeAnim = keyframes`from{opacity:0}to{opacity:1}`

const Backdrop = styled.div`
    position: fixed; inset: 0;
    background: rgba(5,5,5,0.6);
    backdrop-filter: blur(4px);
    z-index: 9990;
    animation: ${p => p.visible ? fadeAnim : 'none'} 0.35s ease both;
`

const Modal = styled.div`
    position: fixed; inset: 0;
    z-index: 9991;
    background: #fafaf8;
    display: flex; flex-direction: column;
    animation: ${p => p.visible ? slideUp : 'none'} 0.55s cubic-bezier(0.16,1,0.3,1) both;

    @media (max-width: 768px) { overflow-y: auto; }
`

const Header = styled.div`
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 32px;
    border-bottom: 1px solid #efefed;
    flex-shrink: 0; background: #fafaf8; z-index: 1;
    @media (max-width: 640px) { padding: 16px 20px; }
`

const HeaderLeft  = styled.div`display:flex;align-items:center;gap:16px;`
const HeaderEyebrow = styled.span`
    font-family:'DM Sans',sans-serif;font-size:8px;
    letter-spacing:.4em;text-transform:uppercase;color:#ccc;
`
const HeaderArtist = styled.span`
    font-family:'DM Sans',sans-serif;font-size:9px;
    letter-spacing:.25em;text-transform:uppercase;color:#888;
    &::before{content:'—';margin-right:8px;color:#ddd;}
`
const CloseBtn = styled.button`
    background:none;border:1px solid #e8e8e4;
    width:36px;height:36px;display:flex;align-items:center;justify-content:center;
    cursor:pointer;color:#aaa;transition:all .2s;flex-shrink:0;
    &:hover{background:#0a0a0a;border-color:#0a0a0a;color:#fff;}
`

const Body = styled.div`
    flex:1;display:flex;overflow:hidden;min-height:0;
    @media(max-width:768px){flex-direction:column;overflow:visible;}
`

/* ── Left column ─────────────────────────────────────────────────────────── */
const ImageCol = styled.div`
    width: 42%; flex-shrink: 0;
    background: #f0f0ee;
    display: flex; flex-direction: column;
    overflow: hidden;
    @media(max-width:768px){width:100%;height:auto;flex-shrink:0;}
`

const ImageWrap = styled.div`
    flex: 1;
    position: relative;
    cursor: zoom-in;
    overflow: hidden;
    min-height: 0;

    &:hover > div[data-hint] { opacity: 1; }

    @media(max-width:768px){
        height: 70vw; max-height: 440px; flex: none;
    }
`

const shimmer = keyframes`
    0%   { background-position: 200% 0 }
    100% { background-position: -200% 0 }
`
const ImgSkeleton = styled.div`
    position:absolute;inset:0;
    background:linear-gradient(90deg,#eceae6 0%,#f5f3ef 40%,#f0eeea 50%,#f5f3ef 60%,#eceae6 100%);
    background-size:200% 100%;
    animation:${shimmer} 1.6s ease-in-out infinite;
`

const ZoomHintOverlay = styled.div`
    position: absolute; inset: 0;
    background: rgba(0,0,0,0.28);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 10px;
    opacity: 0;
    transition: opacity 0.25s ease;
    ${ImageWrap}:hover & { opacity: 1; }
`
const ZoomIcon = styled.div`
    width: 44px; height: 44px;
    border: 1.5px solid rgba(255,255,255,0.8);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: #fff;
`
const PhotoCount = styled.div`
    position: absolute; bottom: 12px; right: 12px;
    background: rgba(0,0,0,0.55);
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 9px; letter-spacing: 0.2em;
    padding: 4px 10px;
    pointer-events: none;
`

/* ── Thumb strip below main image ───────────────────────────────────────── */
const ThumbStrip = styled.div`
    display: flex; gap: 4px;
    padding: 8px;
    background: #e8e8e4;
    overflow-x: auto;
    flex-shrink: 0;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
`
const Thumb = styled.button`
    flex-shrink: 0; position: relative;
    width: 52px; height: 68px;
    overflow: hidden; padding: 0;
    border: 2px solid ${p => p.$active ? '#0a0a0a' : 'transparent'};
    background: #f0f0ee; cursor: pointer;
    transition: border-color 0.15s, opacity 0.15s;
    opacity: ${p => p.$active ? 1 : 0.6};

    img { width:100%;height:100%;object-fit:cover;display:block; }
    &:hover { opacity: 1; }
`
const ThumbActiveLine = styled.div`
    position:absolute;bottom:0;left:0;right:0;
    height:2px;background:#0a0a0a;
`

/* ── Right column ───────────────────────────────────────────────────────── */
const InfoCol = styled.div`
    flex:1;overflow-y:auto;min-width:0;
    &::-webkit-scrollbar{width:4px;}
    &::-webkit-scrollbar-track{background:transparent;}
    &::-webkit-scrollbar-thumb{background:rgba(0,0,0,.1);}
    @media(max-width:768px){overflow:visible;}
`
const ProductInfo = styled.div`
    padding:40px 44px 36px;
    @media(max-width:1024px){padding:32px 28px;}
    @media(max-width:640px) {padding:28px 20px;}
`
const InfoArtist = styled.p`
    font-family:'DM Sans',sans-serif;font-size:9px;
    letter-spacing:.35em;text-transform:uppercase;color:#bbb;margin:0 0 12px;
`
const InfoName = styled.h2`
    font-family:'Cormorant Garamond',Georgia,serif;
    font-size:clamp(1.6rem,3vw,2.4rem);font-weight:300;font-style:italic;
    color:#0a0a0a;line-height:1.2;margin:0 0 12px;
`
const InfoPrice = styled.p`
    font-family:'DM Sans',sans-serif;font-size:1rem;
    letter-spacing:.08em;color:#555;margin:0 0 24px;
`
const InfoDesc = styled.p`
    font-family:'DM Sans',sans-serif;font-size:14px;
    line-height:1.8;color:#666;margin:0 0 28px;
    white-space:pre-line;max-width:480px;
`
const InfoDivider = styled.div`
    width:40px;height:1px;background:#e0e0dc;margin-bottom:28px;
`
const InfoMeta = styled.ul`
    list-style:none;padding:0;margin:28px 0 0;
    display:flex;flex-direction:column;gap:10px;
`
const InfoMetaItem = styled.li`
    font-family:'DM Sans',sans-serif;font-size:11px;
    letter-spacing:.08em;color:#aaa;
    display:flex;align-items:center;gap:10px;
`
const InfoMetaIcon = styled.span`font-size:8px;color:#ccc;`
