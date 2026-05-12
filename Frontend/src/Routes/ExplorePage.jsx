import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import axios from 'axios'
import styled, { keyframes } from 'styled-components'
import Navbar from '../Components/Navbar'
import { Link } from 'react-router-dom'
import AddCart from '../Components/Product-Page-Component/AddCart'

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
    const navRef      = useRef(null)

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

    // Track active artist on scroll
    useEffect(() => {
        if (!artists.length) return
        const observer = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) setActiveSlug(e.target.dataset.slug)
            })
        }, { rootMargin: '-40% 0px -55% 0px' })

        Object.values(sectionRefs.current).forEach(el => { if (el) observer.observe(el) })
        return () => observer.disconnect()
    }, [artists])

    const scrollTo = (slug) => {
        const el = sectionRefs.current[slug]
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

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

            {/* ── STICKY NAV ───────────────────────────────────────────────── */}
            {artists.length > 0 && (
                <StickyNav ref={navRef}>
                    <NavInner>
                        <NavLabel>Artistas</NavLabel>
                        <NavList>
                            {artists.map(a => (
                                <NavItem
                                    key={a._id}
                                    $active={activeSlug === a.slug}
                                    onClick={() => scrollTo(a.slug)}
                                >
                                    {a.name}
                                </NavItem>
                            ))}
                        </NavList>
                        <NavRight>
                            <Link to="/products">Ver tienda →</Link>
                        </NavRight>
                    </NavInner>
                </StickyNav>
            )}

            {/* ── ARTISTAS ─────────────────────────────────────────────────── */}
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
                <ArtistsWrap>
                    {artists.map((artist, idx) => {
                        const key        = artist.slug || artist.name
                        const prods      = productsByArtist[key] || productsByArtist[artist.name] || []
                        const isEven     = idx % 2 === 0
                        const img        = artist.profileImage || artist.images?.[0]
                        const bio        = artist.bio || artist.description || null

                        return (
                            <ArtistBlock
                                key={artist._id || idx}
                                data-slug={artist.slug}
                                ref={el => sectionRefs.current[artist.slug] = el}
                            >
                                {/* ─ PORTADA ─────────────────────────────── */}
                                <ArtistCover $reverse={!isEven}>
                                    <ArtistImgWrap $reverse={!isEven}>
                                        {img ? (
                                            <FadeImg src={img} alt={artist.name} />
                                        ) : (
                                            <ArtistImgPlaceholder>
                                                <span>{artist.name?.charAt(0)?.toUpperCase()}</span>
                                            </ArtistImgPlaceholder>
                                        )}
                                        <ArtistImgNum>
                                            {String(idx + 1).padStart(2, '0')}
                                        </ArtistImgNum>
                                    </ArtistImgWrap>

                                    <ArtistInfo $reverse={!isEven}>
                                        <ArtistEyebrow>— Artista</ArtistEyebrow>
                                        <ArtistName>{artist.name}</ArtistName>

                                        {bio && <ArtistBio>{bio}</ArtistBio>}

                                        {!bio && (
                                            <ArtistBio>
                                                Artista local con {prods.length > 0
                                                    ? `${prods.length} obra${prods.length !== 1 ? 's' : ''} disponible${prods.length !== 1 ? 's' : ''} en la plataforma`
                                                    : 'obras únicas'
                                                }. Cada pieza refleja una visión personal del arte y el entorno local.
                                            </ArtistBio>
                                        )}

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
                                    </ArtistInfo>
                                </ArtistCover>

                                {/* ─ OBRAS ───────────────────────────────── */}
                                {prods.length > 0 && (
                                    <WorksSection>
                                        <WorksHeader>
                                            <WorksLabel>Obras de {artist.name}</WorksLabel>
                                            <WorksCount>{prods.length} piezas</WorksCount>
                                        </WorksHeader>
                                        <WorksTrack>
                                            {prods.map((p, i) => (
                                                <WorkCard key={p._id || i} onClick={() => setSelectedProd(p)}>
                                                    <WorkCardImg>
                                                        {p.image
                                                            ? <FadeImg src={p.image} alt={p.name} />
                                                            : <WorkCardNoImg>{p.name?.charAt(0)}</WorkCardNoImg>
                                                        }
                                                        <WorkCardOverlay>
                                                            <span>Ver detalle</span>
                                                        </WorkCardOverlay>
                                                    </WorkCardImg>
                                                    <WorkCardBody>
                                                        <WorkCardName>{p.name}</WorkCardName>
                                                        <WorkCardPrice>{p.price}</WorkCardPrice>
                                                    </WorkCardBody>
                                                </WorkCard>
                                            ))}
                                        </WorksTrack>
                                    </WorksSection>
                                )}

                                {/* ─ DIVISOR ─────────────────────────────── */}
                                {idx < artists.length - 1 && (
                                    <BlockDivider>
                                        <DivLine />
                                        <DivTag>{String(idx + 2).padStart(2, '0')}</DivTag>
                                        <DivLine />
                                    </BlockDivider>
                                )}
                            </ArtistBlock>
                        )
                    })}
                </ArtistsWrap>
            )}

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
    background: #fafaf8;
    min-height: 100vh;
`

/* ── HERO ──────────────────────────────────────────────────────────────────── */
const ExploreHero = styled.section`
    position: relative;
    background: #0a0a0a;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 120px 60px 80px;
    overflow: hidden;
    @media (max-width: 640px) { padding: 100px 28px 72px; }
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

/* ── STICKY NAV ─────────────────────────────────────────────────────────────── */
const StickyNav = styled.nav`
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(250,250,248,0.96);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid #e8e8e4;
`
const NavInner = styled.div`
    display: flex;
    align-items: center;
    gap: 0;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 40px;
    overflow-x: auto;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
    @media (max-width: 640px) { padding: 0 20px; }
`
const NavLabel = styled.span`
    font-size: 0.6rem;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: #ccc;
    white-space: nowrap;
    margin-right: 28px;
    padding: 18px 0;
    flex-shrink: 0;
`
const NavList = styled.div`
    display: flex;
    align-items: center;
    gap: 0;
    flex: 1;
    overflow-x: auto;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
`
const NavItem = styled.button`
    font-size: 0.72rem;
    letter-spacing: 0.06em;
    color: ${p => p.$active ? '#0a0a0a' : '#aaa'};
    background: none;
    border: none;
    border-bottom: 2px solid ${p => p.$active ? '#0a0a0a' : 'transparent'};
    padding: 18px 18px 16px;
    cursor: pointer;
    white-space: nowrap;
    transition: color 0.2s, border-color 0.2s;
    &:hover { color: #0a0a0a; }
`
const NavRight = styled.div`
    margin-left: auto;
    padding-left: 28px;
    flex-shrink: 0;
    a {
        font-size: 0.65rem;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: #aaa;
        text-decoration: none;
        white-space: nowrap;
        transition: color 0.2s;
        &:hover { color: #0a0a0a; }
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

/* ── ARTIST BLOCK ─────────────────────────────────────────────────────────────── */
const ArtistsWrap = styled.div`
    background: #fafaf8;
`
const ArtistBlock = styled.article`
    scroll-margin-top: 60px;
`
const ArtistCover = styled.div`
    display: grid;
    grid-template-columns: ${p => p.$reverse ? '1fr 1fr' : '1fr 1fr'};
    min-height: 80vh;
    @media (max-width: 900px) {
        grid-template-columns: 1fr;
        min-height: auto;
    }
`
const ArtistImgWrap = styled.div`
    position: relative;
    overflow: hidden;
    background: #111;
    order: ${p => p.$reverse ? 2 : 0};
    min-height: 60vh;

    img {
        position: absolute; inset: 0;
        width: 100%; height: 100%;
        object-fit: cover;
        transition: transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    &:hover img { transform: scale(1.04); }

    @media (max-width: 900px) {
        order: 0;
        min-height: 55vw;
    }
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
    padding: clamp(48px, 8vw, 100px) clamp(28px, 6vw, 80px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: ${p => p.$reverse ? '#fff' : '#fafaf8'};
    order: ${p => p.$reverse ? 0 : 2};
    @media (max-width: 900px) { order: 2; }
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
    border-top: 1px solid #e8e8e4;
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
    color: #0a0a0a;
    text-decoration: none;
    border-bottom: 1px solid rgba(10,10,10,0.25);
    padding-bottom: 4px;
    align-self: flex-start;
    transition: border-color 0.2s;
    &:hover { border-color: #0a0a0a; }
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
    background: #e8e8e6;
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
    background: #fafaf8;
    @media (max-width: 640px) { padding: 0 20px; }
`
const DivLine = styled.div`
    flex: 1;
    height: 1px;
    background: #e8e8e4;
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
    background: #111;
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
    background: #fff;
    color: #111;
    font-size: 0.7rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    text-decoration: none;
    transition: background 0.2s;
    &:hover { background: #e8e8e8; }
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
    background: #fafaf8;
    display: flex; flex-direction: column;
    width: 100%; max-width: 500px;
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
