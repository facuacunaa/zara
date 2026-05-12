import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import styled, { keyframes } from 'styled-components'
import AddCart from './AddCart'
import RelatedSections from './RelatedSections'

function parsePrice(str) {
    if (!str) return 0
    return parseFloat(String(str).replace(/[^0-9.,]/g, '').replace(',', '.')) || 0
}

/* ─────────────────────────────────────────────────────────────────────────────
   Props:
   - product     : { name, price, description, image, artistName, artistSlug, _id }
   - onClose     : () => void
   - allProducts : full flat product list (for related sections)
   - onSelect    : (product) => void  — swap to another product
───────────────────────────────────────────────────────────────────────────── */
export default function ProductDetailModal({ product, onClose, allProducts, onSelect }) {
    const [visible,   setVisible]   = useState(false)
    const [imgLoaded, setImgLoaded] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 10)
        return () => clearTimeout(t)
    }, [])

    // Reset image loaded state when product changes
    useEffect(() => { setImgLoaded(false) }, [product._id, product.name])

    useEffect(() => {
        const fn = e => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', fn)
        return () => window.removeEventListener('keydown', fn)
    }, [onClose])

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

                {/* ── HEADER ───────────────────────────────────────────── */}
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
                            <line x1="15" y1="1" x2="1" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                    </CloseBtn>
                </Header>

                {/* ── BODY (image left, scroll right) ──────────────────── */}
                <Body>
                    {/* LEFT — sticky image */}
                    <ImageCol>
                        <ImageWrap>
                            {!imgLoaded && <ImgSkeleton />}
                            {product.image && (
                                <img
                                    src={product.image}
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
                        </ImageWrap>
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
                                <InfoMetaItem>
                                    <InfoMetaIcon>✦</InfoMetaIcon>
                                    Arte original
                                </InfoMetaItem>
                                <InfoMetaItem>
                                    <InfoMetaIcon>✦</InfoMetaIcon>
                                    Pieza única
                                </InfoMetaItem>
                                <InfoMetaItem>
                                    <InfoMetaIcon>✦</InfoMetaIcon>
                                    Envío a todo el país
                                </InfoMetaItem>
                            </InfoMeta>
                        </ProductInfo>

                        {/* ── RELATED ──────────────────────────────────── */}
                        <RelatedSections
                            product={product}
                            allProducts={allProducts}
                            onSelect={onSelect}
                        />
                    </InfoCol>
                </Body>
            </Modal>
        </>,
        document.body
    )
}

/* ── Animations ─────────────────────────────────────────────────────────── */
const slideUp = keyframes`
    from { transform: translateY(40px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
`
const fadeIn = keyframes`from { opacity: 0 } to { opacity: 1 }`

/* ── Layout ─────────────────────────────────────────────────────────────── */
const Backdrop = styled.div`
    position: fixed; inset: 0;
    background: rgba(5, 5, 5, 0.6);
    backdrop-filter: blur(4px);
    z-index: 9990;
    animation: ${p => p.visible ? fadeIn : 'none'} 0.35s ease both;
`

const Modal = styled.div`
    position: fixed; inset: 0;
    z-index: 9991;
    background: #fafaf8;
    display: flex;
    flex-direction: column;
    animation: ${p => p.visible ? slideUp : 'none'} 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;

    @media (max-width: 768px) {
        overflow-y: auto;
    }
`

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 32px;
    border-bottom: 1px solid #efefed;
    flex-shrink: 0;
    background: #fafaf8;
    z-index: 1;

    @media (max-width: 640px) { padding: 16px 20px; }
`

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`

const HeaderEyebrow = styled.span`
    font-family: 'DM Sans', sans-serif;
    font-size: 8px;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: #ccc;
`

const HeaderArtist = styled.span`
    font-family: 'DM Sans', sans-serif;
    font-size: 9px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: #888;

    &::before {
        content: '—';
        margin-right: 8px;
        color: #ddd;
    }
`

const CloseBtn = styled.button`
    background: none;
    border: 1px solid #e8e8e4;
    width: 36px; height: 36px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    color: #aaa;
    transition: all 0.2s;
    flex-shrink: 0;

    &:hover {
        background: #0a0a0a;
        border-color: #0a0a0a;
        color: #fff;
    }
`

const Body = styled.div`
    flex: 1;
    display: flex;
    overflow: hidden;
    min-height: 0;

    @media (max-width: 768px) {
        flex-direction: column;
        overflow: visible;
    }
`

/* ── Left: sticky image ─────────────────────────────────────────────────── */
const ImageCol = styled.div`
    width: 42%;
    flex-shrink: 0;
    background: #f0f0ee;
    overflow: hidden;
    position: relative;

    @media (max-width: 768px) {
        width: 100%;
        height: 70vw;
        max-height: 480px;
        flex-shrink: 0;
    }
`

const ImageWrap = styled.div`
    position: absolute;
    inset: 0;

    @media (max-width: 768px) {
        position: relative;
        width: 100%;
        height: 100%;
    }
`

const shimmer = keyframes`
    0%   { background-position: 200% 0 }
    100% { background-position: -200% 0 }
`

const ImgSkeleton = styled.div`
    position: absolute; inset: 0;
    background: linear-gradient(
        90deg,
        #eceae6 0%, #f5f3ef 40%, #f0eeea 50%, #f5f3ef 60%, #eceae6 100%
    );
    background-size: 200% 100%;
    animation: ${shimmer} 1.6s ease-in-out infinite;
`

/* ── Right: scrollable info + related ──────────────────────────────────── */
const InfoCol = styled.div`
    flex: 1;
    overflow-y: auto;
    min-width: 0;

    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-track { background: transparent; }
    &::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); }

    @media (max-width: 768px) {
        overflow: visible;
    }
`

/* ── Product info block ─────────────────────────────────────────────────── */
const ProductInfo = styled.div`
    padding: 40px 44px 36px;

    @media (max-width: 1024px) { padding: 32px 28px; }
    @media (max-width: 640px)  { padding: 28px 20px; }
`

const InfoArtist = styled.p`
    font-family: 'DM Sans', sans-serif;
    font-size: 9px;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: #bbb;
    margin: 0 0 12px;
`

const InfoName = styled.h2`
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(1.6rem, 3vw, 2.4rem);
    font-weight: 300;
    font-style: italic;
    color: #0a0a0a;
    line-height: 1.2;
    margin: 0 0 12px;
`

const InfoPrice = styled.p`
    font-family: 'DM Sans', sans-serif;
    font-size: 1rem;
    letter-spacing: 0.08em;
    color: #555;
    margin: 0 0 24px;
`

const InfoDesc = styled.p`
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    line-height: 1.8;
    color: #666;
    margin: 0 0 28px;
    white-space: pre-line;
    max-width: 480px;
`

const InfoDivider = styled.div`
    width: 40px;
    height: 1px;
    background: #e0e0dc;
    margin-bottom: 28px;
`

const InfoMeta = styled.ul`
    list-style: none;
    padding: 0;
    margin: 28px 0 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
`

const InfoMetaItem = styled.li`
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    letter-spacing: 0.08em;
    color: #aaa;
    display: flex;
    align-items: center;
    gap: 10px;
`

const InfoMetaIcon = styled.span`
    font-size: 8px;
    color: #ccc;
`
