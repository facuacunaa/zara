import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import axios from 'axios'
import styled, { keyframes } from 'styled-components'
import Navbar from '../Components/Navbar'
import { Link } from 'react-router-dom'
import AddCart from '../Components/Product-Page-Component/AddCart'
import PageLoader from '../Components/PageLoader'

const API = process.env.REACT_APP_BACKEND_URL || 'https://zara-backend.vercel.app'

/* ── LAZY IMAGE con skeleton ────────────────────────────────────────────────── */
function FadeImg({ src, alt, style }) {
    const [loaded, setLoaded] = useState(false)
    return (
        <div style={{ position: 'absolute', inset: 0 }}>
            {!loaded && <ImgSkeleton />}
            {src && (
                <img
                    src={src} alt={alt} loading="lazy"
                    onLoad={() => setLoaded(true)}
                    style={{
                        position: 'absolute', inset: 0,
                        width: '100%', height: '100%',
                        objectFit: 'cover',
                        opacity: loaded ? 1 : 0,
                        transition: 'opacity 0.8s ease',
                        ...style,
                    }}
                />
            )}
        </div>
    )
}

/* ── PRODUCT MODAL ──────────────────────────────────────────────────────────── */
function ExploreProdModal({ product, onClose }) {
    const [visible,   setVisible]   = useState(false)
    const [imgLoaded, setImgLoaded] = useState(false)

    useEffect(() => { const t = setTimeout(() => setVisible(true), 10); return () => clearTimeout(t) }, [])
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
        pricenum:     parseFloat((product.price || '0').replace(/[^0-9.,]/g, '').replace(',', '.')) || 0,
        quantity:     1,
        color:        '',
        id:           product._id || product.name,
    }

    return (
        <>
            <ModalOverlay $visible={visible} onClick={onClose} />
            <ModalPanel $visible={visible}>
                <ModalHead>
                    <ModalArtist>{product.artistName || '—'}</ModalArtist>
                    <ModalClose onClick={onClose}>✕ Cerrar</ModalClose>
                </ModalHead>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    <ModalImg>
                        {product.image && (
                            <img src={product.image} alt={product.name}
                                onLoad={() => setImgLoaded(true)}
                                style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity .7s' }} />
                        )}
                    </ModalImg>
                    <ModalBody>
                        <ModalName>{product.name}</ModalName>
                        <ModalPrice>{product.price}</ModalPrice>
                        <AddCart data={cartData} />
                    </ModalBody>
                </div>
            </ModalPanel>
        </>
    )
}

/* ── MAIN COMPONENT ─────────────────────────────────────────────────────────── */
export default function ExplorePage() {
    const [artists,     setArtists]     = useState([])
    const [products,    setProducts]    = useState([])
    const [loading,     setLoading]     = useState(true)
    const [selectedProd, setSelectedProd] = useState(null)
    const [activeSlug,  setActiveSlug]  = useState(null)
    const sectionRefs = useRef({})
    const trackRef    = useRef(null)

    useEffect(() => {
        Promise.all([
            axios.get(`${API}/artist`),
            axios.get(`${API}/artist/all-products`),
        ]).then(([ar, pr]) => {
            setArtists(ar.data || [])
            setProducts(pr.data || [])
            if (ar.data?.length) setActiveSlug(ar.data[0].slug)
        }).catch(() => {}).finally(() => setLoading(false))
    }, [])

    // Group products by artistSlug or artistName
    const productsByArtist = useMemo(() => {
        const map = {}
        products.forEach(p => {
            const key = p.artistSlug || p.artistName || '__'
            if (!map[key]) map[key] = []
            map[key].push(p)
        })
        return map
    }, [products])

    // Track active artist via horizontal scroll position
    useEffect(() => {
        const track = trackRef.current
        if (!track || !artists.length) return
        const handleScroll = () => {
            const idx = Math.round(track.scrollLeft / track.clientWidth)
            if (artists[idx]) setActiveSlug(artists[idx].slug)
        }
        track.addEventListener('scroll', handleScroll, { passive: true })
        return () => track.removeEventListener('scroll', handleScroll)
    }, [artists])

    const scrollTo = (slug) => {
        const el = sectionRefs.current[slug]
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
    }

    const activeIdx = artists.findIndex(a => a.slug === activeSlug)
    const goNext = () => { if (activeIdx < artists.length - 1) scrollTo(artists[activeIdx + 1].slug) }
    const goPrev = () => { if (activeIdx > 0) scrollTo(artists[activeIdx - 1].slug) }

    // Hint desaparece al primer scroll horizontal
    const [showHint, setShowHint] = useState(true)
    useEffect(() => {
        const track = trackRef.current
        if (!track) return
        const hide = () => setShowHint(false)
        track.addEventListener('scroll', hide, { once: true, passive: true })
        return () => track.removeEventListener('scroll', hide)
    }, [artists])

    if (loading) return <PageLoader />

    return (
        <PageWrap>
            <Navbar />

            {/* ── HERO ─────────────────────────────────────────────────────── */}
            <ExploreHero>
                <HeroDecor aria-hidden>explorar</HeroDecor>
                <HeroContent>
                    <HeroIssue>— Edición {new Date().getFullYear()}</HeroIssue>
                    <HeroTitle>Los<br/><em>artistas</em></HeroTitle>
                    <HeroLine />
                    <HeroSub>
                        Conocé las historias, las técnicas y las obras de los artistas locales que dan vida a esta plataforma.
                    </HeroSub>
                    {!loading && (
                        <HeroMeta>
                            <span>{artists.length} artistas</span>
                            <HeroMetaDot />
                            <span>{products.length} obras disponibles</span>
                        </HeroMeta>
                    )}
                </HeroContent>
                <HeroScroll>
                    <span>Explorar</span>
                    <HeroScrollLine />
                </HeroScroll>
            </ExploreHero>

            {/* ── CARRUSEL HORIZONTAL ──────────────────────────────────────── */}
            <HorizontalSection>

                {/* Flecha izquierda */}
                <NavArrowBtn side="left" onClick={goPrev} disabled={activeIdx <= 0}>
                    ←
                </NavArrowBtn>

                {/* Track horizontal */}
                {loading ? (
                    <LoadingWrap>
                        {[1,2,3].map(i => <LoadingBlock key={i} />)}
                    </LoadingWrap>
                ) : artists.length === 0 ? (
                    <EmptyWrap>
                        <p>Próximamente los artistas estarán disponibles aquí.</p>
                        <Link to="/products">Ver tienda →</Link>
                    </EmptyWrap>
                ) : (
                    <HorizontalTrack ref={trackRef}>
                        {artists.map((artist, idx) => {
                            const key   = artist.slug || artist.name
                            const prods = productsByArtist[key] || productsByArtist[artist.name] || []
                            const img   = artist.profileImage || artist.images?.[0]
                            const bio   = artist.bio || artist.description || null

                            return (
                                <ArtistPanel
                                    key={artist._id || idx}
                                    data-slug={artist.slug}
                                    ref={el => sectionRefs.current[artist.slug] = el}
                                >
                                    {/* ─ PORTADA ──────────────────────────── */}
                                    <ArtistCover>
                                        <ArtistImgWrap>
                                            {img ? (
                                                <FadeImg src={img} alt={artist.name} />
                                            ) : (
                                                <ArtistImgPlaceholder>
                                                    <span>{artist.name?.charAt(0)?.toUpperCase()}</span>
                                                </ArtistImgPlaceholder>
                                            )}
                                            <ArtistImgNum>
                                                {String(idx + 1).padStart(2, '0')} / {String(artists.length).padStart(2, '0')}
                                            </ArtistImgNum>
                                        </ArtistImgWrap>

                                        <ArtistInfo>
                                            <ArtistEyebrow>— Artista</ArtistEyebrow>
                                            <ArtistName>{artist.name}</ArtistName>

                                            {bio
                                                ? <ArtistBio>{bio}</ArtistBio>
                                                : <ArtistBio>
                                                    Artista local con {prods.length > 0
                                                        ? `${prods.length} obra${prods.length !== 1 ? 's' : ''} disponible${prods.length !== 1 ? 's' : ''}`
                                                        : 'obras únicas'
                                                    }. Cada pieza refleja una visión personal del arte.
                                                  </ArtistBio>
                                            }

                                            <ArtistStatsRow>
                                                <ArtistStatBox>
                                                    <ArtistStatNum>{prods.length}</ArtistStatNum>
                                                    <ArtistStatLabel>obras</ArtistStatLabel>
                                                </ArtistStatBox>
                                                <ArtistStatBox>
                                                    <ArtistStatNum>Local</ArtistStatNum>
                                                    <ArtistStatLabel>artista</ArtistStatLabel>
                                                </ArtistStatBox>
                                            </ArtistStatsRow>

                                            <ArtistProfileBtn to={`/${artist.slug}`}>
                                                Ver perfil completo
                                            </ArtistProfileBtn>

                                            {/* Obras dentro del panel */}
                                            {prods.length > 0 && (
                                                <PanelWorksTrack>
                                                    {prods.map((p, i) => (
                                                        <PanelWorkCard key={p._id || i} onClick={() => setSelectedProd(p)}>
                                                            <PanelWorkImg>
                                                                {p.image
                                                                    ? <FadeImg src={p.image} alt={p.name} />
                                                                    : <WorkCardNoImg>{p.name?.charAt(0)}</WorkCardNoImg>
                                                                }
                                                                <WorkCardOverlay>
                                                                    <span>Ver</span>
                                                                </WorkCardOverlay>
                                                            </PanelWorkImg>
                                                            <WorkCardBody>
                                                                <WorkCardName>{p.name}</WorkCardName>
                                                                <WorkCardPrice>{p.price}</WorkCardPrice>
                                                            </WorkCardBody>
                                                        </PanelWorkCard>
                                                    ))}
                                                </PanelWorksTrack>
                                            )}
                                        </ArtistInfo>
                                    </ArtistCover>
                                </ArtistPanel>
                            )
                        })}
                    </HorizontalTrack>
                )}

                {/* Flecha derecha */}
                <NavArrowBtn side="right" onClick={goNext} disabled={activeIdx >= artists.length - 1}>
                    →
                </NavArrowBtn>

                {/* Hint mobile */}
                {showHint && artists.length > 1 && (
                    <SwipeHint>
                        <SwipeHintText>Para ver artistas y sus diseños</SwipeHintText>
                        <SwipeArrow>
                            <span>deslizá</span>
                            <SwipeArrowLine />
                            <SwipeArrowHead>›</SwipeArrowHead>
                        </SwipeArrow>
                    </SwipeHint>
                )}

                {/* Dots */}
                {artists.length > 0 && (
                    <NavDots>
                        {artists.map((a, i) => (
                            <NavDot key={a._id} $active={activeSlug === a.slug} onClick={() => scrollTo(a.slug)} title={a.name} />
                        ))}
                    </NavDots>
                )}

            </HorizontalSection>

            {/* ── CTA FINAL ────────────────────────────────────────────────── */}
            <CtaStrip>
                <CtaInner>
                    <CtaLeft>
                        <CtaEyebrow>— ¿Sos artista emprendedor?</CtaEyebrow>
                        <CtaTitle>Sumá tus obras<br/>a la plataforma</CtaTitle>
                    </CtaLeft>
                    <CtaRight>
                        <CtaBody>
                            Trabajamos con artistas locales que quieran llegar a más personas a través del mundo digital. Creá tu perfil, subí tus obras y empezá a vender.
                        </CtaBody>
                        <CtaBtn href="mailto:lacasitadelhornero@gmail.com">
                            Contactanos →
                        </CtaBtn>
                    </CtaRight>
                </CtaInner>
            </CtaStrip>

            {selectedProd && (
                <ExploreProdModal product={selectedProd} onClose={() => setSelectedProd(null)} />
            )}
        </PageWrap>
    )
}

/* ══════════════════════════════════════════════════════════════
   STYLES
══════════════════════════════════════════════════════════════ */
const fadeUp = keyframes`
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
`
const shimmer = keyframes`
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
`
const ImgSkeleton = styled.div`
    position: absolute;
    inset: 0;
    background: linear-gradient(
        90deg,
        #1a1a1a 0%,
        #242424 40%,
        #2a2a2a 50%,
        #242424 60%,
        #1a1a1a 100%
    );
    background-size: 200% 100%;
    animation: ${shimmer} 1.8s ease-in-out infinite;
`

const PageWrap = styled.div`
    background: #ead1b0;
    min-height: 100vh;
`

/* ── HERO ──────────────────────────────────────────────────────────────────── */
const ExploreHero = styled.section`
    position: relative;
    background:
        repeating-linear-gradient(
            65deg,
            transparent 0px, transparent 13px,
            rgba(173,67,29,0.08) 13px, rgba(173,67,29,0.08) 14px
        ),
        repeating-linear-gradient(
            -25deg,
            transparent 0px, transparent 20px,
            rgba(173,67,29,0.06) 20px, rgba(173,67,29,0.06) 21px
        ),
        linear-gradient(145deg, #3c4021 0%, #3c4021 40%, #3c4021 70%, #3c4021 100%);
    min-height: 60vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 100px 60px 60px;
    overflow: hidden;
    @media (max-width: 640px) {
        min-height: auto;
        padding: 90px 28px 44px;
    }
`
const HeroDecor = styled.span`
    position: absolute;
    right: -40px;
    top: 50%;
    transform: translateY(-50%) rotate(90deg);
    font-family: 'Times New Roman', Georgia, serif;
    font-size: clamp(8rem, 20vw, 18rem);
    font-weight: 300;
    font-style: italic;
    color: rgba(255,255,255,0.025);
    letter-spacing: -0.04em;
    user-select: none;
    pointer-events: none;
    white-space: nowrap;
`
const HeroContent = styled.div`
    position: relative;
    z-index: 2;
    max-width: 800px;
    animation: ${fadeUp} 0.9s ease both;
`
const HeroIssue = styled.p`
    font-size: 0.62rem;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
    margin: 0 0 2rem;
`
const HeroTitle = styled.h1`
    font-family: 'Times New Roman', Georgia, serif;
    font-size: clamp(4rem, 12vw, 10rem);
    font-weight: 300;
    color: #fff;
    line-height: 0.95;
    margin: 0 0 2.5rem;
    letter-spacing: -0.02em;
    em { font-style: italic; color: rgba(255,255,255,0.65); }
`
const HeroLine = styled.div`
    width: 60px;
    height: 1px;
    background: rgba(255,255,255,0.2);
    margin-bottom: 2.5rem;
`
const HeroSub = styled.p`
    font-size: clamp(0.88rem, 1.5vw, 1.05rem);
    line-height: 1.85;
    color: rgba(255,255,255,0.45);
    font-weight: 300;
    max-width: 520px;
    margin: 0 0 2.5rem;
`
const HeroMeta = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 0.7rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
`
const HeroMetaDot = styled.span`
    width: 3px; height: 3px;
    border-radius: 50%;
    background: rgba(255,255,255,0.2);
`
const HeroScroll = styled.div`
    position: absolute;
    bottom: 40px;
    left: 60px;
    display: flex;
    align-items: center;
    gap: 20px;
    z-index: 2;
    span {
        font-size: 0.6rem;
        letter-spacing: 0.4em;
        text-transform: uppercase;
        color: rgba(255,255,255,0.25);
    }
    @media (max-width: 640px) { left: 28px; }
`
const HeroScrollLine = styled.div`
    width: 40px; height: 1px;
    background: rgba(255,255,255,0.15);
`

/* ── CARRUSEL HORIZONTAL ─────────────────────────────────────────────────────── */
const HorizontalSection = styled.div`
    position: relative;
    background: #ead1b0;
`

const HorizontalTrack = styled.div`
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
`

const ArtistPanel = styled.article`
    flex: 0 0 100vw;
    width: 100vw;
    min-height: calc(75vh - 64px);
    scroll-snap-align: start;
    display: flex;
    flex-direction: column;
    @media (max-width: 768px) { min-height: auto; }
`

const NavArrowBtn = styled.button`
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    ${p => p.side === 'left' ? 'left: 20px;' : 'right: 20px;'}
    z-index: 10;
    background: rgba(234,209,176,0.95);
    border: 1px solid #D8C8B0;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    opacity: ${p => p.disabled ? 0.2 : 1};
    pointer-events: ${p => p.disabled ? 'none' : 'all'};
    box-shadow: 0 2px 16px rgba(0,0,0,0.08);
    &:hover { background: #fff; box-shadow: 0 4px 24px rgba(0,0,0,0.12); }
    @media (max-width: 640px) { display: none; }
`

/* ── SWIPE HINT (mobile) ─────────────────────────────────────────────────────── */
const hintBlink = keyframes`
    0%, 100% { opacity: 0.9; }
    50%       { opacity: 0.35; }
`
const arrowSlide = keyframes`
    0%, 100% { transform: translateX(0); }
    50%       { transform: translateX(6px); }
`

const SwipeHint = styled.div`
    display: none;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 14px 0 6px;
    animation: ${hintBlink} 2s ease-in-out infinite;

    @media (max-width: 900px) {
        display: flex;
    }
`

const SwipeHintText = styled.p`
    font-family: 'DM Sans', sans-serif;
    font-size: 9px;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: #aaa;
    margin: 0;
    text-align: center;
`

const SwipeArrow = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    animation: ${arrowSlide} 1.4s ease-in-out infinite;

    span {
        font-family: 'DM Sans', sans-serif;
        font-size: 8px;
        letter-spacing: 0.3em;
        text-transform: uppercase;
        color: #ccc;
    }
`

const SwipeArrowLine = styled.div`
    width: 28px;
    height: 1px;
    background: #ccc;
`

const SwipeArrowHead = styled.span`
    font-size: 16px;
    color: #aaa;
    line-height: 1;
    letter-spacing: 0 !important;
`

const NavDots = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 20px 0 28px;
    background: #ead1b0;
`

const NavDot = styled.button`
    width: ${p => p.$active ? '24px' : '6px'};
    height: 6px;
    border-radius: 3px;
    background: ${p => p.$active ? '#1A3D2B' : '#C4956A'};
    border: none;
    cursor: pointer;
    padding: 0;
    transition: all 0.3s ease;
    &:hover { background: #888; }
`

/* Obras dentro del panel info */
const PanelWorksTrack = styled.div`
    display: flex;
    gap: 10px;
    overflow-x: auto;
    margin-top: 32px;
    padding-bottom: 10px;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
    -webkit-mask-image: linear-gradient(to right, black 85%, transparent 100%);
    mask-image: linear-gradient(to right, black 85%, transparent 100%);
`

const PanelWorkCard = styled.div`
    flex: 0 0 180px;
    cursor: pointer;
    border-radius: 12px;
    overflow: hidden;
    &:hover img { transform: scale(1.04); }
    @media (max-width: 640px) { flex: 0 0 150px; }
`

const PanelWorkImg = styled.div`
    position: relative;
    overflow: hidden;
    background: #E8DCC8;
    padding-bottom: 125%;
    margin-bottom: 8px;
    img {
        position: absolute; inset: 0;
        width: 100%; height: 100%;
        object-fit: cover;
        transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
`

/* ── LOADING ─────────────────────────────────────────────────────────────────── */
const LoadingWrap = styled.div`
    padding: 80px 40px;
    display: flex;
    flex-direction: column;
    gap: 3px;
`
const LoadingBlock = styled.div`
    height: 380px;
    background: linear-gradient(90deg, #efefed 25%, #e6e6e4 50%, #efefed 75%);
    background-size: 200% 100%;
    animation: ${shimmer} 1.5s infinite;
`
const EmptyWrap = styled.div`
    padding: 120px 40px;
    text-align: center;
    p { font-family: 'Times New Roman', Georgia, serif; font-size: 1.5rem; font-weight: 300; font-style: italic; color: #bbb; margin: 0 0 24px; }
    a { font-size: 0.75rem; letter-spacing: 0.25em; text-transform: uppercase; color: #aaa; text-decoration: none; &:hover { color: #0a0a0a; } }
`

/* ── ARTIST PANEL LAYOUT ──────────────────────────────────────────────────────── */
const ArtistsWrap = styled.div`
    background: #ead1b0;
`
const ArtistCover = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    flex: 1;
    min-height: calc(75vh - 64px);
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        min-height: auto;
    }
`
const ArtistImgWrap = styled.div`
    position: relative;
    overflow: hidden;
    background:
        repeating-linear-gradient(
            65deg,
            transparent 0px, transparent 13px,
            rgba(173,67,29,0.08) 13px, rgba(173,67,29,0.08) 14px
        ),
        repeating-linear-gradient(
            -25deg,
            transparent 0px, transparent 20px,
            rgba(173,67,29,0.06) 20px, rgba(173,67,29,0.06) 21px
        ),
        linear-gradient(145deg, #3c4021 0%, #3c4021 40%, #3c4021 70%, #3c4021 100%);
    min-height: 45vh;

    img {
        position: absolute; inset: 0;
        width: 100%; height: 100%;
        object-fit: cover;
        transition: transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    &:hover img { transform: scale(1.04); }

    @media (max-width: 768px) { min-height: 48vw; }
`
const ArtistImgPlaceholder = styled.div`
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #111 0%, #222 100%);
    span {
        font-family: 'Times New Roman', Georgia, serif;
        font-size: clamp(6rem, 15vw, 12rem);
        font-weight: 300;
        font-style: italic;
        color: rgba(255,255,255,0.08);
    }
`
const ArtistImgNum = styled.span`
    position: absolute;
    bottom: 24px;
    left: 28px;
    font-family: 'Times New Roman', Georgia, serif;
    font-size: 0.72rem;
    letter-spacing: 0.2em;
    color: rgba(255,255,255,0.3);
`
const ArtistInfo = styled.div`
    padding: clamp(48px, 6vw, 80px) clamp(28px, 5vw, 64px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: #ead1b0;
    overflow-y: auto;
    @media (max-width: 768px) { padding: 32px 24px 40px; }
`
const ArtistEyebrow = styled.p`
    font-size: 0.62rem;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: #bbb;
    margin: 0 0 1.2rem;
`
const ArtistName = styled.h2`
    font-family: 'Times New Roman', Georgia, serif;
    font-size: clamp(2.2rem, 5vw, 4.5rem);
    font-weight: 300;
    font-style: italic;
    color: #0a0a0a;
    margin: 0 0 2rem;
    line-height: 1.08;
    letter-spacing: -0.01em;
`
const ArtistBio = styled.p`
    font-size: clamp(0.88rem, 1.4vw, 1rem);
    line-height: 1.9;
    color: #777;
    margin: 0 0 2.5rem;
    font-weight: 300;
    max-width: 440px;
`
const ArtistStatsRow = styled.div`
    display: flex;
    gap: 32px;
    margin-bottom: 2.5rem;
    padding-top: 24px;
    border-top: 1px solid #D8C8B0;
`
const ArtistStatBox = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`
const ArtistStatNum = styled.span`
    font-family: 'Times New Roman', Georgia, serif;
    font-size: 1.5rem;
    font-weight: 300;
    color: #0a0a0a;
`
const ArtistStatLabel = styled.span`
    font-size: 0.6rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: #bbb;
`
const ArtistProfileBtn = styled(Link)`
    display: inline-flex;
    align-items: center;
    font-size: 0.7rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #fff;
    background: #898635;
    text-decoration: none;
    padding: 10px 20px;
    border-radius: 100px;
    align-self: flex-start;
    transition: filter 0.2s;
    &:hover { filter: brightness(0.88); }
`

/* ── WORKS STRIP ─────────────────────────────────────────────────────────────── */
const WorksSection = styled.div`
    background: #f2f2f0;
    padding: 56px 0 64px;
`
const WorksHeader = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding: 0 40px 24px;
    border-bottom: 1px solid #e0e0dc;
    margin-bottom: 3px;
    @media (max-width: 640px) { padding: 0 20px 20px; }
`
const WorksLabel = styled.h3`
    font-family: 'Times New Roman', Georgia, serif;
    font-size: clamp(1.1rem, 2.5vw, 1.7rem);
    font-weight: 300;
    font-style: italic;
    color: #0a0a0a;
    margin: 0;
`
const WorksCount = styled.span`
    font-size: 0.65rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: #bbb;
`
const WorksTrack = styled.div`
    display: flex;
    gap: 3px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    padding: 0 40px;
    cursor: grab;
    &:active { cursor: grabbing; }
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
    -webkit-mask-image: linear-gradient(to right, transparent 0, black 4%, black 96%, transparent 100%);
    mask-image: linear-gradient(to right, transparent 0, black 4%, black 96%, transparent 100%);
    @media (max-width: 640px) { padding: 0 20px; }
`
const WorkCard = styled.div`
    flex: 0 0 240px;
    scroll-snap-align: start;
    cursor: pointer;
    background: #fff;
    &:hover img { transform: scale(1.05); }
    @media (max-width: 640px) { flex: 0 0 180px; }
`
const WorkCardImg = styled.div`
    position: relative;
    overflow: hidden;
    background: #E8DCC8;
    padding-bottom: 125%;
    img {
        position: absolute; inset: 0;
        width: 100%; height: 100%;
        object-fit: cover;
        transition: transform 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
`
const WorkCardNoImg = styled.div`
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Times New Roman', Georgia, serif;
    font-size: 3rem; font-weight: 300; font-style: italic;
    color: rgba(0,0,0,0.1);
`
const WorkCardOverlay = styled.div`
    position: absolute; inset: 0;
    display: flex; align-items: flex-end; justify-content: center;
    padding-bottom: 20px;
    background: linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 50%);
    opacity: 0;
    transition: opacity 0.3s;
    ${WorkCard}:hover & { opacity: 1; }
    span {
        font-size: 0.65rem;
        letter-spacing: 0.3em;
        text-transform: uppercase;
        color: #fff;
        border-bottom: 1px solid rgba(255,255,255,0.45);
        padding-bottom: 2px;
    }
    @media (max-width: 768px) { opacity: 1; }
`
const WorkCardBody = styled.div`
    padding: 14px 12px 18px;
    border-bottom: 1px solid #f0f0ee;
`
const WorkCardName = styled.p`
    font-size: 11px;
    letter-spacing: 0.03em;
    color: #1a1a1a;
    margin: 0 0 5px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`
const WorkCardPrice = styled.p`
    font-family: 'Times New Roman', Georgia, serif;
    font-size: 13px;
    font-style: italic;
    color: #666;
    margin: 0;
`

/* ── BLOCK DIVIDER ───────────────────────────────────────────────────────────── */
const BlockDivider = styled.div`
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 0 40px;
    height: 80px;
    background: #ead1b0;
    @media (max-width: 640px) { padding: 0 20px; }
`
const DivLine = styled.div`
    flex: 1;
    height: 1px;
    background: #D8C8B0;
`
const DivTag = styled.span`
    font-family: 'Times New Roman', Georgia, serif;
    font-size: 0.72rem;
    letter-spacing: 0.2em;
    color: #ddd;
    flex-shrink: 0;
`

/* ── CTA STRIP ───────────────────────────────────────────────────────────────── */
const CtaStrip = styled.section`
    background:
        repeating-linear-gradient(
            65deg,
            transparent 0px, transparent 13px,
            rgba(173,67,29,0.08) 13px, rgba(173,67,29,0.08) 14px
        ),
        repeating-linear-gradient(
            -25deg,
            transparent 0px, transparent 20px,
            rgba(173,67,29,0.06) 20px, rgba(173,67,29,0.06) 21px
        ),
        linear-gradient(145deg, #3c4021 0%, #3c4021 40%, #3c4021 70%, #3c4021 100%);
    padding: 100px 60px 120px;
    @media (max-width: 900px) { padding: 72px 28px 96px; }
`
const CtaInner = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: start;
    @media (max-width: 800px) { grid-template-columns: 1fr; gap: 48px; }
`
const CtaLeft = styled.div``
const CtaEyebrow = styled.p`
    font-size: 0.62rem;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
    margin: 0 0 1.5rem;
`
const CtaTitle = styled.h2`
    font-family: 'Times New Roman', Georgia, serif;
    font-size: clamp(2rem, 5vw, 4rem);
    font-weight: 300;
    font-style: italic;
    color: #fff;
    margin: 0;
    line-height: 1.1;
`
const CtaRight = styled.div`
    padding-top: 12px;
`
const CtaBody = styled.p`
    font-size: clamp(0.88rem, 1.4vw, 1rem);
    line-height: 1.9;
    color: rgba(255,255,255,0.45);
    margin: 0 0 2.5rem;
    font-weight: 300;
`
const CtaBtn = styled.a`
    display: inline-flex;
    align-items: center;
    padding: 14px 32px;
    background:
        repeating-linear-gradient(
            -52deg,
            transparent 0px, transparent 5px,
            rgba(255,255,255,0.035) 5px, rgba(255,255,255,0.035) 7px
        ),
        linear-gradient(
            135deg,
            #6B3A28 0%,
            #9B5E32 22%,
            #C4854A 50%,
            #9B6035 76%,
            #7B4525 100%
        );
    color: #fff;
    font-size: 0.7rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    text-decoration: none;
    border-radius: 100px;
    transition: filter 0.25s;
    &:hover { filter: brightness(0.85); }
`

/* ── MODAL ───────────────────────────────────────────────────────────────────── */
const ModalOverlay = styled.div`
    position: fixed; inset: 0;
    background: rgba(10,10,10,0.55);
    z-index: 100;
    opacity: ${p => p.$visible ? 1 : 0};
    transition: opacity 0.4s;
`
const ModalPanel = styled.div`
    position: fixed; top: 0; right: 0; bottom: 0;
    z-index: 101;
    background: #ead1b0;
    display: flex; flex-direction: column;
    width: 100%; max-width: 500px;
    border-radius: 24px 0 0 24px;
    box-shadow: -4px 0 60px rgba(0,0,0,0.12);
    transform: ${p => p.$visible ? 'translateX(0)' : 'translateX(100%)'};
    transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
`
const ModalHead = styled.div`
    display: flex; align-items: center; justify-content: space-between;
    padding: 22px 28px;
    border-bottom: 1px solid #efefef;
    flex-shrink: 0;
`
const ModalArtist = styled.span`
    font-size: 0.62rem; letter-spacing: 0.4em; text-transform: uppercase; color: #aaa;
`
const ModalClose = styled.button`
    background: none; border: none; cursor: pointer;
    font-size: 0.62rem; letter-spacing: 0.35em; text-transform: uppercase; color: #aaa;
    &:hover { color: #0a0a0a; }
`
const ModalImg = styled.div`
    position: relative; background: #f5f5f0; padding-bottom: 110%;
    img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
`
const ModalBody = styled.div`
    padding: 32px 28px;
`
const ModalName = styled.p`
    font-family: 'Times New Roman', Georgia, serif;
    font-size: 1.4rem; font-weight: 300; font-style: italic;
    color: #1a1a1a; margin: 0 0 8px;
`
const ModalPrice = styled.p`
    font-size: 0.75rem; letter-spacing: 0.1em;
    color: #999; margin: 0 0 36px;
`
