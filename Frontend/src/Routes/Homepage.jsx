import styled, { keyframes } from "styled-components";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Navbar from "../Components/Navbar";
import { Link } from "react-router-dom";
import PageLoader from "../Components/PageLoader";
import AddCart from "../Components/Product-Page-Component/AddCart";
import RelatedSections from "../Components/Product-Page-Component/RelatedSections";
import ProductDetailModal from "../Components/Product-Page-Component/ProductDetailModal";

const API = process.env.REACT_APP_BACKEND_URL || 'https://zara-backend.vercel.app'

const Homepage = () => {
    const [carouselImgs,  setCarouselImgs]  = useState([])
    const [editorial,      setEditorial]      = useState({})
    const [artistProducts, setArtistProducts] = useState([])
    const [selectedProd,   setSelectedProd]   = useState(null)
    const [artists,        setArtists]        = useState([])
    const [banner,         setBanner]         = useState(null)
    const [mission,        setMission]        = useState(null)

    // ── Gate: show content only when paint intro + critical data are ready ──
    const [paintDone,      setPaintDone]      = useState(false)
    const [settingsLoaded, setSettingsLoaded] = useState(false)
    const [productsLoaded, setProductsLoaded] = useState(false)
    const allReady = paintDone && settingsLoaded && productsLoaded

    useEffect(() => {
        axios.get(`${API}/artist`)
            .then(r => setArtists(r.data || []))
            .catch(() => {})
    }, [])

    useEffect(() => {
        axios.get(`${API}/settings`)
            .then(r => {
                setEditorial(r.data)
                if (r.data.bannerActive && r.data.bannerText) setBanner(r.data)
                if (r.data.missionTitle || r.data.missionBody) setMission(r.data)
                setCarouselImgs(
                    [1,2,3,4].map(n => ({
                        img:   r.data[`carouselImage${n}`] || '',
                        title: r.data[`carouselTitle${n}`] || '',
                        sub:   r.data[`carouselSub${n}`]   || '',
                    })).filter(s => s.img)
                )
            })
            .catch(() => {})
            .finally(() => setSettingsLoaded(true))
    }, [])

    useEffect(() => {
        axios.get(`${API}/artist/all-products`)
            .then(r => setArtistProducts(r.data || []))
            .catch(() => {})
            .finally(() => setProductsLoaded(true))
    }, [])

    return (
        <HomeWrap>
            <Navbar />

            {/* ── PAINT INTRO ─────────────────────────────────────────── */}
            <PaintIntro onDone={() => setPaintDone(true)} />

            {/* ── LOADING BRIDGE: paint done but data not yet ready ────── */}
            {paintDone && !allReady && <PageLoader />}

            {/* ── MAIN CONTENT — only mounts once hero + products ready ── */}
            {allReady && <>

            {/* ── CARRUSEL DE BANNERS — ancho completo, fuera del ContentReveal ── */}
            {carouselImgs.length > 0 && <HomeCarousel images={carouselImgs} />}

            <ContentReveal>
            {/* ── BANNER ──────────────────────────────────────────────── */}
            {banner && (
                banner.bannerLink
                    ? <BannerWrap as="a" href={banner.bannerLink} $bg={banner.bannerBg} $color={banner.bannerColor}>
                        {banner.bannerText}
                      </BannerWrap>
                    : <BannerWrap $bg={banner.bannerBg} $color={banner.bannerColor}>
                        {banner.bannerText}
                      </BannerWrap>
            )}

            {/* ── SLIDER + PRODUCTOS (tarjeta unificada) ──────────────── */}
            <SliderFeaturedCard>
                {artists.length > 0 && <ArtistsSlider artists={artists} />}
                {artistProducts.length > 0 && (
                    <FeaturedSection id="coleccion">
                        <FeaturedSectionHeader>
                            <FeaturedTitle>Productos de nuestros artistas</FeaturedTitle>
                            <FeaturedViewAll to="/products">Ver todo →</FeaturedViewAll>
                        </FeaturedSectionHeader>
                        <FeaturedGrid>
                            {artistProducts.slice(0, 8).map((p, i) => (
                                <FeaturedCard key={p._id || i} onClick={() => setSelectedProd(p)}>
                                    <FeaturedCardMedia>
                                        {p.image
                                            ? <img src={p.image} alt={p.name} loading="lazy" />
                                            : <ShopCardNoImg>{p.name?.charAt(0)}</ShopCardNoImg>
                                        }
                                        <ShopCardOverlay>
                                            <ShopCardOverlayBtn>Ver detalle</ShopCardOverlayBtn>
                                        </ShopCardOverlay>
                                        {p.artistName && (
                                            <FeaturedArtistBadge>{p.artistName}</FeaturedArtistBadge>
                                        )}
                                    </FeaturedCardMedia>
                                    <FeaturedCardBody>
                                        <FeaturedCardName>{p.name}</FeaturedCardName>
                                        <FeaturedCardPrice>{p.price}</FeaturedCardPrice>
                                    </FeaturedCardBody>
                                </FeaturedCard>
                            ))}
                        </FeaturedGrid>
                    </FeaturedSection>
                )}
            </SliderFeaturedCard>

            {/* ── MISIÓN ──────────────────────────────────────────────── */}
            <MissionSection>
                <MissionLeft>
                    <MissionEyebrow>
                        {mission?.missionEyebrow || '— Quiénes somos'}
                    </MissionEyebrow>
                    <MissionTitle>
                        {mission?.missionTitle || 'El arte local\nmerece un lugar\nen el mundo digital'}
                    </MissionTitle>
                    <MissionActions>
                        <MissionBtnPrimary as={Link} to="/products">
                            Ver tienda
                        </MissionBtnPrimary>
                        <MissionBtnSecondary as={Link} to="/explorar">
                            Conocer artistas
                        </MissionBtnSecondary>
                    </MissionActions>
                </MissionLeft>
                <MissionRight>
                    <MissionBody>
                        {mission?.missionBody ||
                            'Somos una plataforma dedicada a emprendedores locales que viven del arte. Nacimos en el corazón de la Bienal de Esculturas, donde el arte ocupa cada rincón del espacio público, y quisimos llevar esa misma energía al mundo digital.'}
                    </MissionBody>
                    <MissionStats>
                        <MissionStat>
                            <MissionStatNum>100%</MissionStatNum>
                            <MissionStatLabel>Artistas locales</MissionStatLabel>
                        </MissionStat>
                        <MissionStatDivider />
                        <MissionStat>
                            <MissionStatNum>Bienal</MissionStatNum>
                            <MissionStatLabel>De Esculturas</MissionStatLabel>
                        </MissionStat>
                        <MissionStatDivider />
                        <MissionStat>
                            <MissionStatNum>Arte</MissionStatNum>
                            <MissionStatLabel>Con propósito</MissionStatLabel>
                        </MissionStat>
                    </MissionStats>
                </MissionRight>
            </MissionSection>

            {/* ── ARTISTAS: CARRUSELES + PERFILES (una sola tarjeta) ─── */}
            <ArtistsFullCard>
            {artistProducts.length > 0 && (() => {
                const map = {}
                const order = []
                artistProducts.forEach(p => {
                    const key = p.artistSlug || p.artistName || 'sin-artista'
                    if (!map[key]) { map[key] = { slug: p.artistSlug, name: p.artistName, products: [] }; order.push(key) }
                    map[key].products.push(p)
                })
                return (
                    <CarouselsSection>
                        <CarouselsSectionHeader>
                            <ShopEyebrow>— Colección</ShopEyebrow>
                            <ShopTitle>Nuestros artistas destacados</ShopTitle>
                        </CarouselsSectionHeader>
                        {order.map(key => {
                            const { slug, name, products } = map[key]
                            return (
                                <ArtistCarousel key={key}>
                                    <ArtistCarouselHeader>
                                        <ArtistCarouselName>{name}</ArtistCarouselName>
                                        <ArtistCarouselLink to={`/${slug}`}>Ver perfil →</ArtistCarouselLink>
                                    </ArtistCarouselHeader>
                                    <ArtistCarouselTrack>
                                        {products.map((p, i) => (
                                            <ShopCard key={p._id || i} onClick={() => setSelectedProd(p)}>
                                                <ShopCardMedia>
                                                    {p.image
                                                        ? <img src={p.image} alt={p.name} loading="lazy" />
                                                        : <ShopCardNoImg>{p.name?.charAt(0)}</ShopCardNoImg>
                                                    }
                                                    <ShopCardOverlay>
                                                        <ShopCardOverlayBtn>Agregar al carrito</ShopCardOverlayBtn>
                                                    </ShopCardOverlay>
                                                </ShopCardMedia>
                                                <ShopCardBody>
                                                    <ShopCardName>{p.name}</ShopCardName>
                                                    <ShopCardPrice>{p.price}</ShopCardPrice>
                                                </ShopCardBody>
                                            </ShopCard>
                                        ))}
                                    </ArtistCarouselTrack>
                                </ArtistCarousel>
                            )
                        })}
                    </CarouselsSection>
                )
            })()}

            {artists.length > 0 && (
                <ArtistsShowcase id="artistas">
                    <ArtistsShowcaseHeader>
                        <ArtistsShowcaseEyebrow>— Nuestros artistas</ArtistsShowcaseEyebrow>
                        <ArtistsShowcaseTitle>Conocé a quienes<br/>dan vida al arte</ArtistsShowcaseTitle>
                        <ArtistsShowcaseLink to="/explorar">Explorar artistas →</ArtistsShowcaseLink>
                    </ArtistsShowcaseHeader>
                    <ArtistsGrid count={artists.length}>
                        {artists.map((a, i) => (
                            <ArtistProfileCard key={a._id || a.slug}>
                                <Link to={`/${a.slug}`}>
                                    <ArtistCardIndex>0{i + 1}</ArtistCardIndex>
                                    <ArtistCardMedia>
                                        {(a.profileImage || a.images?.[0])
                                            ? <img src={a.profileImage || a.images[0]} alt={a.name} loading="lazy" />
                                            : <ArtistCardPlaceholder>
                                                <span>{a.name.charAt(0).toUpperCase()}</span>
                                              </ArtistCardPlaceholder>
                                        }
                                        <ArtistCardGradient />
                                    </ArtistCardMedia>
                                    <ArtistCardInfo>
                                        <ArtistCardDivider />
                                        <ArtistCardName>{a.name}</ArtistCardName>
                                        <ArtistCardCta>Ver perfil</ArtistCardCta>
                                    </ArtistCardInfo>
                                </Link>
                            </ArtistProfileCard>
                        ))}
                    </ArtistsGrid>
                </ArtistsShowcase>
            )}
            </ArtistsFullCard>

            {/* ── TICKER DE ARTISTAS ─────────────────────────────────── */}
            {artists.length > 0 && (
                <ArtistsTicker>
                    <ArtistsTrack>
                        {[...artists, ...artists, ...artists].map((a, i) => (
                            <ArtistsTickerItem key={i}>
                                <Link to={`/${a.slug}`}>{a.name.toUpperCase()}</Link>
                                <ArtistsTickerDot>·</ArtistsTickerDot>
                            </ArtistsTickerItem>
                        ))}
                    </ArtistsTrack>
                </ArtistsTicker>
            )}

            {/* ── ¿SOS ARTISTA? VENDÉ TU ARTE ────────────────────────── */}
            <JoinSection>
                <JoinInner>
                    <JoinLeft>
                        <JoinEyebrow>— Para artistas emprendedores</JoinEyebrow>
                        <JoinTitle>¿Tenés obras<br/>para vender?</JoinTitle>
                        <JoinBody>
                            La Casita del Hornero es una plataforma diseñada para artistas locales que quieren llegar a más personas. Creá tu perfil, subí tus obras y empezá a vender sin complicaciones.
                        </JoinBody>
                        <JoinCta href="mailto:lacasitadelhornero@gmail.com">
                            Quiero vender mi arte →
                        </JoinCta>
                    </JoinLeft>
                    <JoinSteps>
                        {[
                            { n: '01', title: 'Creá tu perfil', body: 'Registrate como artista y contá tu historia al mundo.' },
                            { n: '02', title: 'Subí tus obras', body: 'Fotografías, precio y descripción de cada pieza única.' },
                            { n: '03', title: 'Empezá a vender', body: 'Tu tienda online lista para recibir compradores de todo el país.' },
                        ].map(s => (
                            <JoinStep key={s.n}>
                                <JoinStepNum>{s.n}</JoinStepNum>
                                <JoinStepTitle>{s.title}</JoinStepTitle>
                                <JoinStepBody>{s.body}</JoinStepBody>
                            </JoinStep>
                        ))}
                    </JoinSteps>
                </JoinInner>
            </JoinSection>

            {/* ── SECCIÓN EDITORIAL ──────────────────────────────────── */}
            {(editorial.editorialQuote || editorial.editorialBody || editorial.editorialImage1 || editorial.editorialImage2) && (
                <EditorialSection>
                    <EditorialSectionTag>
                        <EditorialSectionNum>01</EditorialSectionNum>
                        <EditorialSectionLine />
                        <EditorialSectionWord>Editorial</EditorialSectionWord>
                    </EditorialSectionTag>

                    <EditorialLayout>
                        {editorial.editorialImage1 && (
                            <EditorialImgWrap side="left">
                                <img src={editorial.editorialImage1} alt="editorial" loading="lazy" />
                            </EditorialImgWrap>
                        )}
                        <EditorialInner hasImages={editorial.editorialImage1 || editorial.editorialImage2}>
                            {editorial.editorialLabel && (
                                <EditorialLabel>{editorial.editorialLabel}</EditorialLabel>
                            )}
                            {editorial.editorialQuote && (
                                <EditorialQuote>{editorial.editorialQuote}</EditorialQuote>
                            )}
                            {editorial.editorialBody && (
                                <EditorialBody>{editorial.editorialBody}</EditorialBody>
                            )}
                            {editorial.editorialCta && (
                                <EditorialCta>{editorial.editorialCta} →</EditorialCta>
                            )}
                        </EditorialInner>
                        {editorial.editorialImage2 && (
                            <EditorialImgWrap side="right">
                                <img src={editorial.editorialImage2} alt="editorial" loading="lazy" />
                            </EditorialImgWrap>
                        )}
                    </EditorialLayout>
                </EditorialSection>
            )}

            {/* ── FOOTER ─────────────────────────────────────────────── */}
            <SiteFooter>
                <FooterInner>
                    <FooterBrand>
                        <FooterBrandName>La Casita<br/>del Hornero</FooterBrandName>
                        <FooterBrandSub>Arte local · Bienal de Esculturas</FooterBrandSub>
                    </FooterBrand>
                    <FooterCol>
                        <FooterColTitle>Comprar</FooterColTitle>
                        <FooterLink as={Link} to="/products">Tienda</FooterLink>
                        <FooterLink as={Link} to="/#coleccion">Novedades</FooterLink>
                        <FooterLink as={Link} to="/#artistas">Artistas</FooterLink>
                    </FooterCol>
                    <FooterCol>
                        <FooterColTitle>Para artistas</FooterColTitle>
                        <FooterLink href="mailto:lacasitadelhornero@gmail.com">Vender mi arte</FooterLink>
                        <FooterLink href="#coleccion">Cómo funciona</FooterLink>
                    </FooterCol>
                    <FooterCol>
                        <FooterColTitle>Nosotros</FooterColTitle>
                        <FooterLink as={Link} to="/#mision">Nuestra misión</FooterLink>
                        <FooterLink href="#">Bienal de Esculturas</FooterLink>
                    </FooterCol>
                </FooterInner>
                <FooterBottom>
                    <span>© {new Date().getFullYear()} La Casita del Hornero · Todos los derechos reservados</span>
                </FooterBottom>
            </SiteFooter>

            {/* ── PRODUCT MODAL ──────────────────────────────────────── */}
            {selectedProd && (
                <ProductDetailModal
                    product={selectedProd}
                    onClose={() => setSelectedProd(null)}
                    allProducts={artistProducts}
                    onSelect={setSelectedProd}
                />
            )}

            </ContentReveal>
            </>}
        </HomeWrap>
    );
}

/* ═══════════════════════════════════════════════════════════════
   ARTISTS SLIDER — tarjetas pequeñas con scroll automático
═══════════════════════════════════════════════════════════════ */
function ArtistsSlider({ artists }) {
    const trackRef = useRef(null)
    const paused   = useRef(false)

    // Auto-scroll continuo
    useEffect(() => {
        const track = trackRef.current
        if (!track) return
        let raf
        const speed = 0.5   // px per frame
        const step = () => {
            if (!paused.current) {
                track.scrollLeft += speed
                // Loop infinito: cuando llega a la mitad, vuelve al inicio
                if (track.scrollLeft >= track.scrollWidth / 2) {
                    track.scrollLeft = 0
                }
            }
            raf = requestAnimationFrame(step)
        }
        raf = requestAnimationFrame(step)
        return () => cancelAnimationFrame(raf)
    }, [])

    // Duplicar artistas para loop infinito visual
    const doubled = [...artists, ...artists]

    return (
        <SliderSection>
            <SliderHeader>
                <SliderEyebrow>— Nuestros artistas</SliderEyebrow>
                <SliderViewAll to="/explorar">Ver todos →</SliderViewAll>
            </SliderHeader>
            <SliderTrack
                ref={trackRef}
                onMouseEnter={() => { paused.current = true  }}
                onMouseLeave={() => { paused.current = false }}
            >
                {doubled.map((a, i) => {
                    const photo = a.profileImage || a.images?.[0] || ''
                    return (
                        <ArtistCard key={i} to={`/${a.slug}`}>
                            <ArtistCardImg>
                                {photo
                                    ? <img src={photo} alt={a.name} loading="lazy" />
                                    : <ArtistCardInitial>{a.name.charAt(0)}</ArtistCardInitial>
                                }
                                <ArtistCardOverlay />
                            </ArtistCardImg>
                            <SliderCardName>{a.name}</SliderCardName>
                        </ArtistCard>
                    )
                })}
            </SliderTrack>
        </SliderSection>
    )
}

const SliderSection = styled.section`
    padding: 40px 0 0;
    background: #F5EDE0;
    overflow: hidden;
`
const SliderHeader = styled.div`
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 clamp(20px, 5vw, 60px) 24px;
`
const SliderEyebrow = styled.p`
    font-family: 'DM Sans', sans-serif;
    font-size: 9px; letter-spacing: .4em;
    text-transform: uppercase; color: #3A7A54; margin: 0;
`
const SliderViewAll = styled(Link)`
    font-family: 'DM Sans', sans-serif;
    font-size: 9px; letter-spacing: .2em;
    text-transform: uppercase; color: #3A7A54;
    text-decoration: none;
    &:hover { color: #7B4A2E; }
`
const SliderTrack = styled.div`
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding: 0 clamp(20px, 5vw, 60px);
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
    cursor: grab;
    &:active { cursor: grabbing; }
`
const ArtistCard = styled(Link)`
    flex-shrink: 0;
    width: 140px;
    display: flex; flex-direction: column; gap: 8px;
    text-decoration: none;
    border-radius: 12px;
    overflow: hidden;
    &:hover img { transform: scale(1.05); }
`
const ArtistCardImg = styled.div`
    width: 140px; height: 180px;
    background: #E8DCC8;
    overflow: hidden; position: relative;
    img {
        width: 100%; height: 100%;
        object-fit: cover; display: block;
        transition: transform 0.5s cubic-bezier(.16,1,.3,1);
    }
`
const ArtistCardInitial = styled.div`
    width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 2.5rem; font-style: italic;
    color: rgba(0,0,0,.12);
`
const ArtistCardOverlay = styled.div`
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,.35) 0%, transparent 55%);
`
const SliderCardName = styled.p`
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; font-weight: 500;
    color: #1a1a1a; margin: 0;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
`

/* ═══════════════════════════════════════════════════════════════
   LAYOUT
═══════════════════════════════════════════════════════════════ */
const revealAnim = keyframes`
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
`
const HomeWrap = styled.div`
    display: flex;
    flex-direction: column;
    background: #B8A890;
`
const ContentReveal = styled.div`
    animation: ${revealAnim} 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 0 32px 32px;

    @media (max-width: 1024px) { padding: 0 18px 18px; }
    @media (max-width: 640px)  { padding: 0 10px 10px; }
`
const MissionSection = styled.section`
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
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: 420px;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 8px 40px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.14);
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`
const MissionLeft = styled.div`
    padding: clamp(48px, 8vw, 100px) clamp(24px, 6vw, 80px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-right: 1px solid rgba(255,255,255,0.08);
    @media (max-width: 768px) {
        border-right: none;
        border-bottom: 1px solid rgba(255,255,255,0.08);
        padding-bottom: 40px;
    }
`
const MissionRight = styled.div`
    padding: clamp(48px, 8vw, 100px) clamp(24px, 6vw, 80px);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 40px;
`
const MissionEyebrow = styled.p`
    font-size: 0.65rem;
    letter-spacing: 0.30em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.35);
    margin: 0 0 1.5rem;
`
const MissionTitle = styled.h2`
    font-family: 'Times New Roman', Georgia, serif;
    font-size: clamp(1.9rem, 4vw, 3.4rem);
    font-weight: 300;
    font-style: italic;
    line-height: 1.12;
    color: #fff;
    margin: 0 0 2.5rem;
    white-space: pre-line;
`
const MissionActions = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
`
const MissionBtnPrimary = styled.a`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 13px 28px;
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
    font-size: 0.72rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    text-decoration: none;
    font-weight: 500;
    border-radius: 100px;
    transition: filter 0.25s;
    &:hover { filter: brightness(0.85); }
`
const MissionBtnSecondary = styled.a`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 13px 28px;
    background: transparent;
    color: rgba(255,255,255,0.75);
    font-size: 0.72rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    text-decoration: none;
    border: 1px solid rgba(255,255,255,0.25);
    border-radius: 100px;
    transition: border-color 0.2s, color 0.2s;
    &:hover { border-color: rgba(255,255,255,0.6); color: #fff; }
`
const MissionBody = styled.p`
    font-size: clamp(0.9rem, 1.5vw, 1.05rem);
    line-height: 1.9;
    color: rgba(255,255,255,0.55);
    margin: 0;
    white-space: pre-line;
    font-weight: 300;
`
const MissionStats = styled.div`
    display: flex;
    align-items: center;
    gap: 0;
    flex-wrap: wrap;
    gap: 16px;
`
const MissionStat = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`
const MissionStatNum = styled.span`
    font-family: 'Times New Roman', Georgia, serif;
    font-size: clamp(1.1rem, 2vw, 1.5rem);
    font-weight: 300;
    color: #fff;
    letter-spacing: 0.02em;
`
const MissionStatLabel = styled.span`
    font-size: 0.6rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.35);
`
const MissionStatDivider = styled.div`
    width: 1px;
    height: 32px;
    background: rgba(255,255,255,0.12);
    align-self: center;
`

const BannerWrap = styled.div`
    display: block;
    width: 100%;
    border-radius: 20px;
    overflow: hidden;
    /* Fondo sólido arriba, se desvanece hacia abajo */
    background: linear-gradient(
        to bottom,
        ${p => p.$bg || 'rgba(58,122,84,0.13)'} 0%,
        ${p => p.$bg || 'rgba(58,122,84,0.13)'} 45%,
        transparent 100%
    );
    color: ${p => p.$color || '#3A7A54'};
    text-align: center;
    /* padding-bottom generoso para que el fade tenga espacio */
    padding: 9px 20px 28px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.68rem;
    font-weight: 400;
    letter-spacing: 0.08em;
    text-decoration: none;
    /* Sombra que da profundidad / efecto 3D */
    box-shadow:
        0 1px 0 rgba(255,255,255,0.55) inset,
        0 8px 28px -6px rgba(0,0,0,0.09);
    cursor: ${p => p.as === 'a' ? 'pointer' : 'default'};
    &:hover { opacity: ${p => p.as === 'a' ? 0.7 : 1}; }
    transition: opacity 0.2s;
`

/* ═══════════════════════════════════════════════════════════════
   PAINT INTRO
═══════════════════════════════════════════════════════════════ */
const PAINT_TEXTS = [
    { head: 'Arte que\ntransforma',     sub: 'Piezas únicas de artistas locales' },
    { head: 'Cada trazo\ncuenta',       sub: 'Hecho a mano, pensado para vos' },
    { head: 'Colección\nlimitada',      sub: 'Obras originales, irrepetibles' },
    { head: 'Arte\nartesanal',          sub: 'Seguí bajando para ver la tienda' },
]

function safeStorage(action, key, val) {
    try { return action === 'get' ? localStorage.getItem(key) : localStorage.setItem(key, val) }
    catch(e) { return null }
}

function PaintIntro({ onDone }) {
    const canvasRef  = useRef(null)
    const onDoneRef  = useRef(onDone)
    useEffect(() => { onDoneRef.current = onDone }, [onDone])

    const alreadySeen = safeStorage('get', 'paintSeen')
    const [phase,   setPhase]   = useState(alreadySeen ? 2 : 0)
    const [textIdx, setTextIdx] = useState(0)

    // If already seen, fire immediately so the gate opens
    useEffect(() => {
        if (alreadySeen) onDoneRef.current?.()
    }, []) // eslint-disable-line

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        safeStorage('set', 'paintSeen', '1')
        canvas.width  = window.innerWidth
        canvas.height = window.innerHeight
        const W = canvas.width, H = canvas.height
        const ctx = canvas.getContext('2d')

        const bz = ([p0,p1,p2,p3], t) => {
            const m = 1 - t
            return [
                m*m*m*p0[0]+3*m*m*t*p1[0]+3*m*t*t*p2[0]+t*t*t*p3[0],
                m*m*m*p0[1]+3*m*m*t*p1[1]+3*m*t*t*p2[1]+t*t*t*p3[1],
            ]
        }
        const C = [
            'rgba(252,248,242,0.97)',
            'rgba(255,253,250,0.98)',
            'rgba(250,246,240,0.96)',
            'rgba(254,252,247,0.97)',
        ]
        const DUR = 0.55
        const STROKES = [
            { path:[[0,0.06],[0.30,0.02],[0.70,0.10],[1.02,0.04]], w:0.23, t0:0.00, c:C[0] },
            { path:[[1.02,0.23],[0.65,0.18],[0.35,0.28],[0,0.21]], w:0.22, t0:0.45, c:C[1] },
            { path:[[0,0.40],[0.28,0.35],[0.72,0.44],[1.02,0.38]], w:0.23, t0:0.90, c:C[2] },
            { path:[[1.02,0.57],[0.60,0.52],[0.38,0.61],[0,0.55]], w:0.22, t0:1.35, c:C[3] },
            { path:[[0,0.74],[0.32,0.70],[0.68,0.78],[1.02,0.72]], w:0.23, t0:1.80, c:C[0] },
            { path:[[1.02,0.91],[0.60,0.87],[0.38,0.95],[0,0.89]], w:0.24, t0:2.25, c:C[1] },
            { path:[[0.05,0.14],[0.28,0.09],[0.62,0.18],[0.95,0.13]], w:0.16, t0:0.68, c:C[2] },
            { path:[[0.95,0.80],[0.65,0.76],[0.32,0.84],[0.05,0.79]], w:0.16, t0:2.50, c:C[3] },
        ]
        const SAMP = 64
        const TOTAL = 2.50 + DUR  // last stroke done ~3.05s

        const drawStroke = (s, progress) => {
            if (progress <= 0) return
            const pts = s.path.map(([fx,fy]) => [fx*W, fy*H])
            const steps = Math.max(2, Math.floor(SAMP * progress))
            const lw = s.w * H * (0.82 + 0.18 * Math.sin(progress * Math.PI))
            ctx.beginPath()
            for (let i = 0; i <= steps; i++) {
                const [x,y] = bz(pts, i/SAMP)
                i === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y)
            }
            ctx.lineWidth = lw; ctx.strokeStyle = s.c
            ctx.lineCap = 'round'; ctx.lineJoin = 'round'
            ctx.stroke()
            ctx.beginPath()
            for (let i = 0; i <= steps; i++) {
                const [x,y] = bz(pts, i/SAMP)
                i === 0 ? ctx.moveTo(x+4, y+3) : ctx.lineTo(x+4, y+3)
            }
            ctx.lineWidth = lw * 0.55
            ctx.strokeStyle = s.c.replace(/[\d.]+\)$/, '0.28)')
            ctx.stroke()
            ctx.beginPath()
            for (let i = 0; i <= steps; i++) {
                const [x,y] = bz(pts, i/SAMP)
                i === 0 ? ctx.moveTo(x-2, y-3) : ctx.lineTo(x-2, y-3)
            }
            ctx.lineWidth = lw * 0.18
            ctx.strokeStyle = 'rgba(255,255,255,0.55)'
            ctx.stroke()
        }

        const TEXTS = [0, 0.25, 0.50, 0.75]
        let startTs = null, rafId, done = false

        const frame = (ts) => {
            if (!startTs) startTs = ts
            const time = (ts - startTs) / 1000
            const p = Math.min(1, time / TOTAL)

            ctx.fillStyle = '#050505'
            ctx.fillRect(0, 0, W, H)
            STROKES.forEach(s => {
                const sp = Math.min(1, Math.max(0, (time - s.t0) / DUR))
                drawStroke(s, sp)
            })
            if (p >= 0.95) {
                const a = Math.min(1, (p - 0.95) / 0.05)
                ctx.fillStyle = `rgba(252,248,242,${a})`
                ctx.fillRect(0, 0, W, H)
            }

            setTextIdx(p < 0.25 ? 0 : p < 0.50 ? 1 : p < 0.75 ? 2 : 3)

            if (p < 1) {
                rafId = requestAnimationFrame(frame)
            } else if (!done) {
                done = true
                ctx.fillStyle = 'rgba(252,248,242,1)'
                ctx.fillRect(0, 0, W, H)
                setTimeout(() => setPhase(1), 80)
                setTimeout(() => { setPhase(2); onDoneRef.current?.() }, 980)
            }
        }
        rafId = requestAnimationFrame(frame)
        // Safety fallback: force-hide overlay after 8s no matter what
        const safetyId = setTimeout(() => {
            setPhase(1)
            setTimeout(() => { setPhase(2); onDoneRef.current?.() }, 900)
        }, 8000)
        return () => { cancelAnimationFrame(rafId); clearTimeout(safetyId) }
    }, [])

    if (phase === 2) return null

    const LABELS = [
        { head: 'Arte que\ntransforma',  sub: 'Piezas únicas de artistas locales' },
        { head: 'Cada trazo\ncuenta',    sub: 'Hecho a mano, pensado para vos' },
        { head: 'Colección\nlimitada',   sub: 'Obras originales, irrepetibles' },
        { head: 'Arte\nartesanal',       sub: 'Descubrí la tienda' },
    ]
    const txt = LABELS[textIdx]
    const darkText = textIdx >= 3

    return (
        <PaintFixed $fading={phase === 1}>
            <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} />
            <PaintTextBlock $dark={darkText}>
                <PaintTextHead>
                    {txt.head.split('\n').map((l, i) => <span key={i}>{l}<br/></span>)}
                </PaintTextHead>
                <PaintTextSub>{txt.sub}</PaintTextSub>
            </PaintTextBlock>
        </PaintFixed>
    )
}

const PaintFixed = styled.div`
    position: fixed;
    inset: 0;
    z-index: 100;
    pointer-events: none;
    background: #050505;
    opacity: ${p => p.$fading ? 0 : 1};
    transition: opacity 0.9s ease;
`
const PaintTextBlock = styled.div`
    position: absolute;
    bottom: 18%;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    color: ${p => p.$dark ? '#111' : '#f8f4ef'};
    transition: color 0.5s ease;
    white-space: nowrap;
`
const PaintTextHead = styled.h1`
    font-family: 'Times New Roman', serif;
    font-size: clamp(2.4rem, 7vw, 5rem);
    font-weight: 300;
    letter-spacing: 0.06em;
    line-height: 1.1;
    margin: 0 0 0.6rem;
    text-transform: uppercase;
`
const PaintTextSub = styled.p`
    font-size: clamp(0.7rem, 1.6vw, 0.9rem);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin: 0;
    opacity: 0.65;
`

/* ═══════════════════════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════════════════════ */
const HeroSection = styled.section`
    position: relative;
    width: 100%;
    height: 100vh;
    background: #0a0a0a;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
`

const HeroVideo = styled.video`
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.55;
`

const HeroOverlay = styled.div`
    position: absolute;
    inset: 0;
    background: linear-gradient(
        160deg,
        rgba(10,10,10,0.55) 0%,
        rgba(10,10,10,0.15) 50%,
        rgba(10,10,10,0.65) 100%
    );
    z-index: 1;
`

const HeroContent = styled.div`
    position: relative;
    z-index: 2;
    text-align: center;
    padding: 0 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
`

const HeroEyebrow = styled.p`
    font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
    font-size: 9px;
    letter-spacing: 0.55em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.45);
    margin: 0 0 28px;
`

const HeroTitle = styled.h1`
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(3rem, 9vw, 8rem);
    font-weight: 300;
    font-style: italic;
    color: #fff;
    line-height: 1.05;
    margin: 0 0 28px;
    letter-spacing: -0.02em;
`

const HeroSub = styled.p`
    font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
    font-size: 11px;
    letter-spacing: 0.25em;
    color: rgba(255,255,255,0.5);
    margin: 0 0 48px;
    max-width: 420px;
    text-align: center;
    line-height: 2;
`

const HeroCtas = styled.div`
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    justify-content: center;
`

const HeroCtaPrimary = styled(Link)`
    font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
    font-size: 9px;
    letter-spacing: 0.45em;
    text-transform: uppercase;
    color: #0a0a0a;
    background: #fff;
    padding: 16px 40px;
    border-radius: 100px;
    text-decoration: none;
    transition: background 0.25s, color 0.25s;
    &:hover { background: #D8C8B0; }
`

const HeroCtaSecondary = styled(Link)`
    font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
    font-size: 9px;
    letter-spacing: 0.45em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.75);
    border: 1px solid rgba(255,255,255,0.3);
    padding: 16px 40px;
    border-radius: 100px;
    text-decoration: none;
    transition: border-color 0.25s, color 0.25s;
    &:hover { border-color: #fff; color: #fff; }
`

const HeroScrollHint = styled.div`
    position: absolute;
    bottom: 44px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;

    span {
        font-family: 'DM Sans', sans-serif;
        font-size: 8px;
        letter-spacing: 0.4em;
        text-transform: uppercase;
        color: rgba(255,255,255,0.35);
    }
`

/* ═══════════════════════════════════════════════════════════════
   SLIDER + FEATURED — tarjeta unificada
═══════════════════════════════════════════════════════════════ */
const SliderFeaturedCard = styled.div`
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 8px 36px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.10);
`

/* ═══════════════════════════════════════════════════════════════
   FEATURED PRODUCTS GRID
═══════════════════════════════════════════════════════════════ */
const FeaturedSection = styled.section`
    background: #F5EDE0;
    padding: 52px 40px 80px;

    @media (max-width: 640px) { padding: 36px 20px 64px; }
`

const FeaturedSectionHeader = styled.div`
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 16px 32px;
    margin-bottom: 56px;
    border-bottom: 1px solid #D8C8B0;
    padding-bottom: 24px;
`

const FeaturedTitle = styled.h2`
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(1.2rem, 2vw, 1.6rem);
    font-weight: 300;
    font-style: italic;
    color: #0a0a0a;
    line-height: 1.1;
    margin: 0;
    letter-spacing: -0.01em;
    flex: 1;
`

const FeaturedViewAll = styled(Link)`
    font-family: 'DM Sans', sans-serif;
    font-size: 9px;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: #3A7A54;
    text-decoration: none;
    align-self: flex-end;
    flex-shrink: 0;
    transition: color 0.2s;
    &:hover { color: #7B4A2E; }
`

const FeaturedGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 3px;

    @media (max-width: 900px)  { grid-template-columns: repeat(3, 1fr); }
    @media (max-width: 640px)  { grid-template-columns: repeat(2, 1fr); }
`

const FeaturedCard = styled.div`
    cursor: pointer;
    background: #fff;
    border-radius: 4px;
    overflow: hidden;

    &:hover img { transform: scale(1.05); }
`

const FeaturedCardMedia = styled.div`
    position: relative;
    overflow: hidden;
    background: #E8DCC8;
    padding-bottom: 130%;

    img {
        position: absolute; inset: 0;
        width: 100%; height: 100%;
        object-fit: cover;
        transition: transform 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
`

const FeaturedArtistBadge = styled.span`
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 2;
    font-family: 'DM Sans', sans-serif;
    font-size: 7px;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: #fff;
    background: rgba(10,10,10,0.55);
    padding: 4px 8px;
    backdrop-filter: blur(4px);
`

const FeaturedCardBody = styled.div`
    padding: 14px 12px 20px;
    border-bottom: 1px solid #E8DCC8;
`

const FeaturedCardName = styled.p`
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    letter-spacing: 0.04em;
    color: #1a1a1a;
    margin: 0 0 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`

const FeaturedCardPrice = styled.p`
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 14px;
    font-style: italic;
    color: #555;
    margin: 0;
`

/* ═══════════════════════════════════════════════════════════════
   ARTISTAS: PERFILES
═══════════════════════════════════════════════════════════════ */
const ArtistsShowcase = styled.section`
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
    padding: 100px 40px 120px;

    @media (max-width: 640px) { padding: 72px 20px 96px; }
`

const ArtistsShowcaseHeader = styled.div`
    text-align: center;
    margin-bottom: 64px;
`

const ArtistsShowcaseEyebrow = styled.p`
    font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
    font-size: 9px;
    letter-spacing: 0.5em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.35);
    margin: 0 0 24px;
`

const ArtistsShowcaseTitle = styled.h2`
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(2.2rem, 5vw, 4.5rem);
    font-weight: 300;
    font-style: italic;
    color: #fff;
    line-height: 1.12;
    margin: 0;
    letter-spacing: -0.02em;
`

const ArtistsShowcaseLink = styled(Link)`
    display: inline-block;
    margin-top: 24px;
    font-size: 0.7rem;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.45);
    text-decoration: none;
    border-bottom: 1px solid rgba(255,255,255,0.2);
    padding-bottom: 3px;
    transition: color 0.2s, border-color 0.2s;
    &:hover { color: #fff; border-color: rgba(255,255,255,0.6); }
`

const ArtistsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(${p => Math.min(p.count, 3)}, 1fr);
    gap: 16px;
    max-width: 1200px;
    margin: 0 auto;

    @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
    @media (max-width: 520px) { grid-template-columns: 1fr; }
`

const ArtistProfileCard = styled.div`
    position: relative;
    overflow: hidden;
    border-radius: 4px;
    background: #111;
    transition: transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                box-shadow 0.45s ease;

    a { display: block; text-decoration: none; color: inherit; }

    &:hover {
        transform: translateY(-6px);
        box-shadow: 0 20px 60px rgba(0,0,0,0.55);
    }
    &:hover img { transform: scale(1.07); }
`

const ArtistCardMedia = styled.div`
    position: relative;
    padding-bottom: 130%;
    overflow: hidden;
    background: #111;

    img {
        position: absolute; inset: 0;
        width: 100%; height: 100%;
        object-fit: cover;
        transition: transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        filter: brightness(0.92) saturate(1.05);
    }
`

const ArtistCardPlaceholder = styled.div`
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(160deg, #0C1E14 0%, #183525 100%);

    span {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: clamp(5rem, 14vw, 10rem);
        font-weight: 300;
        font-style: italic;
        color: rgba(255,255,255,0.10);
    }
`

const ArtistCardGradient = styled.div`
    position: absolute; inset: 0;
    background:
        linear-gradient(to bottom,
            transparent 35%,
            rgba(10,20,14,0.55) 65%,
            rgba(6,14,10,0.95) 100%
        );
`

const ArtistCardIndex = styled.span`
    position: absolute;
    top: 20px;
    left: 22px;
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    letter-spacing: 0.3em;
    color: rgba(255,255,255,0.35);
    z-index: 3;
`

const ArtistCardInfo = styled.div`
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 0 26px 28px;
    z-index: 2;
`

const ArtistCardDivider = styled.div`
    width: 32px;
    height: 1px;
    background: rgba(196,154,38,0.6);
    margin-bottom: 14px;
    transition: width 0.4s ease;

    ${ArtistProfileCard}:hover & { width: 56px; }
`

const ArtistCardName = styled.p`
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(1.4rem, 2.6vw, 2rem);
    font-weight: 400;
    font-style: italic;
    color: #fff;
    margin: 0 0 10px;
    line-height: 1.15;
    letter-spacing: -0.01em;
    text-shadow: 0 2px 12px rgba(0,0,0,0.4);
`

const ArtistCardCta = styled.p`
    font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
    font-size: 9px;
    letter-spacing: 0.42em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.5);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: color 0.3s, letter-spacing 0.35s ease;

    &::after {
        content: '';
        display: inline-block;
        width: 18px;
        height: 1px;
        background: currentColor;
        transition: width 0.35s ease;
    }

    ${ArtistProfileCard}:hover & {
        color: rgba(196,154,38,0.9);
        letter-spacing: 0.5em;
        &::after { width: 28px; }
    }
`

/* ═══════════════════════════════════════════════════════════════
   TICKER DE ARTISTAS
═══════════════════════════════════════════════════════════════ */
const ArtistsTicker = styled.div`
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
    overflow: hidden;
    padding: 18px 0;
    border-radius: 20px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.30), 0 2px 8px rgba(0,0,0,0.14);
`

const ArtistsTrack = styled.div`
    display: flex;
    align-items: center;
    white-space: nowrap;
    animation: tickerScroll 22s linear infinite;

    @keyframes tickerScroll {
        0%   { transform: translateX(0); }
        100% { transform: translateX(-33.333%); }
    }

    &:hover { animation-play-state: paused; }
`

const ArtistsTickerItem = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 20px;

    a {
        font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
        font-size: 10px;
        letter-spacing: 0.45em;
        text-transform: uppercase;
        color: rgba(255,255,255,0.45);
        text-decoration: none;
        transition: color 0.25s;
        &:hover { color: #fff; }
    }
`

const ArtistsTickerDot = styled.span`
    font-size: 16px;
    color: rgba(255,255,255,0.15);
    margin: 0 20px;
    line-height: 1;
`

/* ═══════════════════════════════════════════════════════════════
   ARTE / MANIFIESTO
═══════════════════════════════════════════════════════════════ */
function HomeCarousel({ images }) {
    const [active, setActive] = useState(0)

    useEffect(() => {
        if (images.length <= 1) return
        const id = setInterval(() => setActive(a => (a + 1) % images.length), 5000)
        return () => clearInterval(id)
    }, [images.length])

    const prev = () => setActive(a => (a - 1 + images.length) % images.length)
    const next = () => setActive(a => (a + 1) % images.length)

    return (
        <CarouselWrap>
            {images.map((slide, i) => (
                <CarouselSlide key={i} $active={i === active}>
                    <img src={slide.img} alt={slide.title || `Banner ${i + 1}`} />
                    <CarouselOverlay />
                    {(slide.title || slide.sub) && (
                        <CarouselText>
                            {slide.title && <CarouselTitle>{slide.title}</CarouselTitle>}
                            {slide.sub   && <CarouselSub>{slide.sub}</CarouselSub>}
                        </CarouselText>
                    )}
                </CarouselSlide>
            ))}
            {images.length > 1 && (
                <>
                    <CarouselBtn $side="left" onClick={prev} aria-label="Anterior">&#8592;</CarouselBtn>
                    <CarouselBtn $side="right" onClick={next} aria-label="Siguiente">&#8594;</CarouselBtn>
                    <CarouselDots>
                        {images.map((_, i) => (
                            <CarouselDot key={i} $active={i === active} onClick={() => setActive(i)} />
                        ))}
                    </CarouselDots>
                </>
            )}
        </CarouselWrap>
    )
}

const CarouselWrap = styled.div`
    position: relative;
    width: 100%;
    height: 75vh;
    min-height: 380px;
    overflow: hidden;
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
    /* Degradado inferior que se funde con el fondo de la página */
    &::after {
        content: '';
        position: absolute;
        bottom: 0; left: 0; right: 0;
        height: 42%;
        background: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(184,168,144,0.45) 55%,
            #B8A890 100%
        );
        z-index: 1;
        pointer-events: none;
    }
    @media (max-width: 600px) { height: 55vh; min-height: 220px; }
`
const CarouselSlide = styled.div`
    position: absolute;
    inset: 0;
    opacity: ${p => p.$active ? 1 : 0};
    transition: opacity 0.9s ease;
    img {
        width: 100%; height: 100%;
        object-fit: cover;
        display: block;
    }
`
const CarouselOverlay = styled.div`
    position: absolute;
    inset: 0;
    background: linear-gradient(
        to bottom,
        rgba(0,0,0,0.04) 0%,
        rgba(0,0,0,0.18) 40%,
        rgba(0,0,0,0.68) 100%
    );
`
const CarouselText = styled.div`
    position: absolute;
    bottom: 0;
    left: 0; right: 0;
    padding: clamp(36px, 6vw, 80px) clamp(32px, 7vw, 100px);
    z-index: 2;
`
const CarouselTitle = styled.h2`
    font-family: 'Times New Roman', Georgia, serif;
    font-size: clamp(2.6rem, 6.5vw, 6rem);
    font-weight: 300;
    font-style: italic;
    color: #fff;
    letter-spacing: 0.02em;
    line-height: 1.05;
    margin: 0 0 1rem;
`
const CarouselSub = styled.p`
    font-size: clamp(0.65rem, 1.2vw, 0.82rem);
    color: rgba(255,255,255,0.72);
    letter-spacing: 0.30em;
    text-transform: uppercase;
    margin: 0;
    padding-left: 2px;
    text-shadow: 0 1px 8px rgba(0,0,0,0.5);
    &::before {
        content: '— ';
        opacity: 0.6;
    }
`
const CarouselBtn = styled.button`
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    ${p => p.$side === 'left' ? 'left: 20px;' : 'right: 20px;'}
    background: rgba(255,255,255,0.15);
    backdrop-filter: blur(6px);
    border: 1px solid rgba(255,255,255,0.28);
    color: #fff;
    width: 44px; height: 44px;
    border-radius: 50%;
    font-size: 18px;
    cursor: pointer;
    z-index: 3;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.2s;
    &:hover { background: rgba(255,255,255,0.30); }
`
const CarouselDots = styled.div`
    position: absolute;
    bottom: 22px;
    right: clamp(24px, 6vw, 80px);
    display: flex;
    gap: 8px;
    z-index: 3;
`
const CarouselDot = styled.button`
    width: ${p => p.$active ? '24px' : '8px'};
    height: 8px;
    border-radius: 4px;
    background: ${p => p.$active ? '#fff' : 'rgba(255,255,255,0.38)'};
    border: none;
    cursor: pointer;
    padding: 0;
    transition: width 0.3s, background 0.3s;
`

/* ═══════════════════════════════════════════════════════════════
   SHARED SECTION TAGS
═══════════════════════════════════════════════════════════════ */
const EditorialSectionTag = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 72px;
    padding: 0 40px;
    max-width: 1400px;
    margin-left: auto;
    margin-right: auto;
    width: 100%;
    box-sizing: border-box;
`

const EditorialSectionNum = styled.span`
    font-family: 'DM Sans', sans-serif;
    font-size: 9px;
    letter-spacing: 0.3em;
    color: rgba(10,10,10,0.2);
    flex-shrink: 0;
`

const EditorialSectionLine = styled.div`
    flex: 1;
    height: 1px;
    background: rgba(10,10,10,0.1);
`

const EditorialSectionWord = styled.span`
    font-family: 'DM Sans', sans-serif;
    font-size: 9px;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: rgba(10,10,10,0.3);
    flex-shrink: 0;
`

/* ═══════════════════════════════════════════════════════════════
   EDITORIAL
═══════════════════════════════════════════════════════════════ */
const EditorialSection = styled.section`
    background: #FAF6F0;
    padding: 100px 0 140px;
    overflow: hidden;
    border-radius: 20px;
    box-shadow: 0 8px 36px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.10);
`

const EditorialLayout = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 40px;

    @media (max-width: 768px) { flex-direction: column; padding: 0 24px; gap: 48px; }
`

const EditorialImgWrap = styled.div`
    flex: 0 0 28%;
    max-width: 340px;
    align-self: ${p => p.side === 'left' ? 'flex-start' : 'flex-end'};
    margin-top:    ${p => p.side === 'right' ? '100px' : '0'};
    margin-bottom: ${p => p.side === 'left'  ? '100px' : '0'};
    position: relative;

    img { width: 100%; display: block; object-fit: cover; aspect-ratio: 3/4; }

    &::before {
        content: '${p => p.side === 'left' ? 'I' : 'II'}';
        position: absolute;
        top: -24px; left: 0;
        font-family: 'DM Sans', sans-serif;
        font-size: 8px;
        letter-spacing: 0.3em;
        color: rgba(0,0,0,0.2);
    }

    @media (max-width: 768px) {
        flex: none; width: 100%; max-width: 100%; margin: 0;
        img { aspect-ratio: 4/3; }
        &::before { display: none; }
    }
`

const EditorialInner = styled.div`
    flex: 1;
    text-align: center;
    padding: ${p => p.hasImages ? '60px 72px' : '0 24px'};
    max-width: ${p => p.hasImages ? 'none' : '760px'};
    margin: ${p => p.hasImages ? '0' : '0 auto'};

    @media (max-width: 768px) { padding: 0; }
`

const EditorialLabel = styled.p`
    font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
    font-size: 8px;
    letter-spacing: 0.55em;
    text-transform: uppercase;
    color: #bbb;
    margin: 0 0 40px;
`

const EditorialQuote = styled.h2`
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(2rem, 4.5vw, 4.2rem);
    font-weight: 300;
    font-style: italic;
    color: #0a0a0a;
    line-height: 1.18;
    margin: 0 0 40px;
    letter-spacing: -0.015em;
    white-space: pre-line;
`

const EditorialBody = styled.p`
    font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
    font-size: 10px;
    line-height: 2.4;
    letter-spacing: 0.12em;
    color: #aaa;
    max-width: 380px;
    margin: 0 auto 48px;
    white-space: pre-line;
`

const EditorialCta = styled.span`
    display: inline-block;
    font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
    font-size: 8px;
    letter-spacing: 0.5em;
    text-transform: uppercase;
    color: #0a0a0a;
    border-bottom: 1px solid currentColor;
    padding-bottom: 4px;
    cursor: pointer;
    transition: opacity 0.2s;
    &:hover { opacity: 0.5; }
`

/* ═══════════════════════════════════════════════════════════════
   SHOP SHARED
═══════════════════════════════════════════════════════════════ */
const ShopEyebrow = styled.p`
    font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
    font-size: 9px;
    letter-spacing: 0.5em;
    text-transform: uppercase;
    color: #3A7A54;
    margin: 0 0 20px;
    flex: 0 0 100%;
`

const ShopTitle = styled.h2`
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(2.5rem, 5.5vw, 5rem);
    font-weight: 300;
    font-style: italic;
    color: #F5EDE0;
    line-height: 1.1;
    margin: 0 0 16px;
    letter-spacing: -0.02em;
`

/* ═══════════════════════════════════════════════════════════════
   ARTISTAS — tarjeta unificada (carruseles + perfiles)
═══════════════════════════════════════════════════════════════ */
const ArtistsFullCard = styled.div`
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 8px 40px rgba(0,0,0,0.30), 0 2px 8px rgba(0,0,0,0.14);
`

const CarouselsSection = styled.section`
    background:
        repeating-linear-gradient(
            -52deg,
            transparent 0px, transparent 5px,
            rgba(255,255,255,0.025) 5px, rgba(255,255,255,0.025) 7px
        ),
        repeating-linear-gradient(
            38deg,
            transparent 0px, transparent 9px,
            rgba(255,255,255,0.015) 9px, rgba(255,255,255,0.015) 10px
        ),
        linear-gradient(145deg, #2D1408 0%, #4A2510 35%, #3A1C0A 65%, #2A1208 100%);
    padding: 100px 0 120px;
`

const CarouselsSectionHeader = styled.div`
    text-align: center;
    margin-bottom: 72px;
    padding: 0 40px;
`

const ArtistCarousel = styled.div`
    margin-bottom: 80px;
    &:last-child { margin-bottom: 0; }
`

const ArtistCarouselHeader = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding: 0 40px 24px;
    border-bottom: 1px solid rgba(245,237,224,0.15);
    margin-bottom: 3px;

    @media (max-width: 640px) { padding: 0 20px 20px; }
`

const ArtistCarouselName = styled.h3`
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(1.4rem, 3vw, 2.2rem);
    font-weight: 300;
    font-style: italic;
    color: #F5EDE0;
    margin: 0;
    letter-spacing: -0.01em;
`

const ArtistCarouselLink = styled(Link)`
    font-family: 'DM Sans', sans-serif;
    font-size: 9px;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: rgba(245,237,224,0.45);
    text-decoration: none;
    flex-shrink: 0;
    transition: color 0.2s;
    &:hover { color: #F5EDE0; }
`

const ArtistCarouselTrack = styled.div`
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

    -webkit-mask-image: linear-gradient(to right, transparent 0, black 3%, black 97%, transparent 100%);
    mask-image: linear-gradient(to right, transparent 0, black 3%, black 97%, transparent 100%);

    @media (max-width: 640px) { padding: 0 20px; }
`

const ShopCard = styled.div`
    flex: 0 0 260px;
    scroll-snap-align: start;
    cursor: pointer;
    background: #fff;
    border-radius: 4px;
    overflow: hidden;

    &:hover img { transform: scale(1.05); }

    @media (max-width: 640px) { flex: 0 0 200px; }
`

const ShopCardMedia = styled.div`
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

const ShopCardNoImg = styled.div`
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(3rem, 8vw, 6rem);
    font-weight: 300;
    font-style: italic;
    color: rgba(0,0,0,0.1);
`

const ShopCardOverlay = styled.div`
    position: absolute; inset: 0;
    display: flex; align-items: flex-end; justify-content: center;
    padding-bottom: 24px;
    background: linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 45%);
    opacity: 0;
    transition: opacity 0.3s ease;

    ${ShopCard}:hover & { opacity: 1; }
    ${FeaturedCard}:hover & { opacity: 1; }
`

const ShopCardOverlayBtn = styled.span`
    font-family: 'DM Sans', sans-serif;
    font-size: 9px;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: #fff;
    border-bottom: 1px solid rgba(255,255,255,0.5);
    padding-bottom: 3px;
`

const ShopCardBody = styled.div`
    padding: 16px 14px 20px;
    border-bottom: 1px solid #E8DCC8;
`

const ShopCardName = styled.p`
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    letter-spacing: 0.04em;
    color: #1a1a1a;
    margin: 0 0 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`

const ShopCardPrice = styled.p`
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 15px;
    font-style: italic;
    color: #0a0a0a;
    margin: 0;
`

/* ═══════════════════════════════════════════════════════════════
   JOIN SECTION — VENDÉ TU ARTE
═══════════════════════════════════════════════════════════════ */
const JoinSection = styled.section`
    background: #F5EDE0;
    padding: 100px 40px 120px;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 8px 36px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.10);
    @media (max-width: 640px) { padding: 72px 24px 96px; }
`
const JoinInner = styled.div`
    max-width: 1300px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: start;
    @media (max-width: 900px) { grid-template-columns: 1fr; gap: 56px; }
`
const JoinLeft = styled.div``
const JoinEyebrow = styled.p`
    font-size: 0.62rem;
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: #bbb;
    margin: 0 0 1.4rem;
`
const JoinTitle = styled.h2`
    font-family: 'Times New Roman', Georgia, serif;
    font-size: clamp(2rem, 4vw, 3.4rem);
    font-weight: 300;
    font-style: italic;
    color: #0a0a0a;
    margin: 0 0 1.8rem;
    line-height: 1.12;
`
const JoinBody = styled.p`
    font-size: clamp(0.88rem, 1.4vw, 1rem);
    line-height: 1.9;
    color: #777;
    margin: 0 0 2.5rem;
    font-weight: 300;
    max-width: 460px;
`
const JoinCta = styled.a`
    display: inline-block;
    font-size: 0.72rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #0a0a0a;
    border-bottom: 1px solid rgba(10,10,10,0.3);
    padding-bottom: 4px;
    text-decoration: none;
    transition: border-color 0.2s;
    &:hover { border-color: #0a0a0a; }
`
const JoinSteps = styled.div`
    border-top: 1px solid #D8C8B0;
`
const JoinStep = styled.div`
    padding: 28px 0;
    border-bottom: 1px solid #D8C8B0;
    display: grid;
    grid-template-columns: 48px 1fr;
    grid-template-rows: auto auto;
    gap: 0 16px;
    align-items: start;
`
const JoinStepNum = styled.span`
    font-family: 'Times New Roman', Georgia, serif;
    font-size: 0.72rem;
    color: #ccc;
    letter-spacing: 0.1em;
    grid-row: 1 / 3;
    padding-top: 3px;
`
const JoinStepTitle = styled.p`
    font-family: 'Times New Roman', Georgia, serif;
    font-size: 1.15rem;
    font-weight: 300;
    font-style: italic;
    color: #0a0a0a;
    margin: 0 0 6px;
`
const JoinStepBody = styled.p`
    font-size: 0.78rem;
    color: #aaa;
    margin: 0;
    line-height: 1.75;
    letter-spacing: 0.02em;
`

/* ═══════════════════════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════════════════════ */
const SiteFooter = styled.footer`
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
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 8px 40px rgba(0,0,0,0.30), 0 2px 8px rgba(0,0,0,0.14);
`
const FooterInner = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 60px;
    max-width: 1300px;
    margin: 0 auto;
    padding: 80px 40px 64px;
    @media (max-width: 900px) { grid-template-columns: 1fr 1fr; gap: 40px; padding: 60px 24px 48px; }
    @media (max-width: 520px) { grid-template-columns: 1fr; gap: 36px; padding: 56px 24px 40px; }
`
const FooterBrand = styled.div``
const FooterBrandName = styled.p`
    font-family: 'Times New Roman', Georgia, serif;
    font-size: clamp(1.4rem, 3vw, 2rem);
    font-weight: 300;
    font-style: italic;
    color: #fff;
    margin: 0 0 14px;
    line-height: 1.15;
`
const FooterBrandSub = styled.p`
    font-size: 0.62rem;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.25);
    margin: 0;
`
const FooterCol = styled.div``
const FooterColTitle = styled.p`
    font-size: 0.62rem;
    letter-spacing: 0.38em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
    margin: 0 0 20px;
`
const FooterLink = styled.a`
    display: block;
    font-size: 0.82rem;
    color: rgba(255,255,255,0.55);
    text-decoration: none;
    margin-bottom: 10px;
    transition: color 0.2s;
    letter-spacing: 0.02em;
    &:hover { color: #fff; }
`
const FooterBottom = styled.div`
    border-top: 1px solid rgba(255,255,255,0.07);
    padding: 24px 40px;
    max-width: 1300px;
    margin: 0 auto;
    @media (max-width: 640px) { padding: 20px 24px; }
    span {
        font-size: 0.62rem;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: rgba(255,255,255,0.2);
    }
`

/* ═══════════════════════════════════════════════════════════════
   PRODUCT MODAL
═══════════════════════════════════════════════════════════════ */
function HomeProdModal({ product, onClose, allProducts, onSelect }) {
    const [visible,   setVisible]   = useState(false)
    const [imgLoaded, setImgLoaded] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 10)
        return () => clearTimeout(t)
    }, [])

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
            <ModalOverlay visible={visible} onClick={onClose} />
            <ModalPanel visible={visible}>
                <ModalHeader>
                    <span style={{
                        fontFamily: 'DM Sans, sans-serif', fontSize: '8px',
                        letterSpacing: '0.4em', textTransform: 'uppercase', color: '#aaa'
                    }}>
                        {product.artistName}
                    </span>
                    <button onClick={onClose} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontFamily: 'DM Sans, sans-serif', fontSize: '8px',
                        letterSpacing: '0.35em', textTransform: 'uppercase', color: '#aaa'
                    }}>✕ Cerrar</button>
                </ModalHeader>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    <ModalImgWrap>
                        {product.image && (
                            <img
                                src={product.image} alt={product.name}
                                onLoad={() => setImgLoaded(true)}
                                style={{
                                    position: 'absolute', inset: 0,
                                    width: '100%', height: '100%', objectFit: 'cover',
                                    opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.7s'
                                }}
                            />
                        )}
                        {!imgLoaded && <div style={{ position: 'absolute', inset: 0, background: '#f5f5f0' }} />}
                    </ModalImgWrap>
                    <div style={{ padding: '32px 28px' }}>
                        <p style={{
                            fontFamily: 'Playfair Display, Georgia, serif',
                            fontSize: '22px', fontWeight: 300, fontStyle: 'italic',
                            color: '#1a1a1a', margin: '0 0 8px'
                        }}>{product.name}</p>
                        <p style={{
                            fontFamily: 'DM Sans, sans-serif',
                            fontSize: '12px', letterSpacing: '0.1em',
                            color: '#999', margin: product.description ? '0 0 20px' : '0 0 36px'
                        }}>{product.price}</p>
                        {product.description && (
                            <p style={{
                                fontFamily: 'DM Sans, sans-serif',
                                fontSize: '13px', lineHeight: '1.75',
                                color: '#666', margin: '0 0 28px',
                                whiteSpace: 'pre-line'
                            }}>{product.description}</p>
                        )}
                        <AddCart data={cartData} />
                    </div>
                    <RelatedSections
                        product={product}
                        allProducts={allProducts}
                        onSelect={onSelect}
                    />
                </div>
            </ModalPanel>
        </>
    )
}

const ModalOverlay = styled.div`
    position: fixed; inset: 0;
    background: rgba(10,10,10,0.55);
    z-index: 100;
    opacity: ${p => p.visible ? 1 : 0};
    transition: opacity 0.4s;
`
const ModalPanel = styled.div`
    position: fixed; top: 0; right: 0; bottom: 0;
    z-index: 101;
    background: #F5EDE0;
    display: flex; flex-direction: column;
    width: 100%; max-width: 500px;
    border-radius: 24px 0 0 24px;
    box-shadow: -4px 0 60px rgba(0,0,0,0.12);
    transform: ${p => p.visible ? 'translateX(0)' : 'translateX(100%)'};
    transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
`
const ModalHeader = styled.div`
    display: flex; align-items: center; justify-content: space-between;
    padding: 22px 28px;
    border-bottom: 1px solid #efefef;
    flex-shrink: 0;
`
const ModalImgWrap = styled.div`
    position: relative;
    background: #f5f5f0;
    padding-bottom: 110%;
`

export default Homepage
