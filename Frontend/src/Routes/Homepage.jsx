import styled, { keyframes } from "styled-components";
import { useState, useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import axios from "axios";
import Navbar from "../Components/Navbar";
import { Link } from "react-router-dom";
import AddCart from "../Components/Product-Page-Component/AddCart";

const API = process.env.REACT_APP_BACKEND_URL || 'https://zara-backend.vercel.app'

const Homepage = () => {
    const [homeVideo,      setHomeVideo]      = useState('')
    const [heroVideoText,  setHeroVideoText]  = useState('')
    const [editorial,      setEditorial]      = useState({})
    const [artistProducts, setArtistProducts] = useState([])
    const [selectedProd,   setSelectedProd]   = useState(null)
    const [artists,        setArtists]        = useState([])
    useEffect(() => {
        axios.get(`${API}/artist`)
            .then(r => setArtists(r.data || []))
            .catch(() => {})
    }, [])

    const gallerySlides = useMemo(() => {
        const slides = []
        artists.forEach(a => {
            if (a.profileImage) slides.push({ image: a.profileImage, name: a.name, slug: a.slug })
            if (a.images?.[0])  slides.push({ image: a.images[0],    name: a.name, slug: a.slug })
            if (slides.length >= 8) return
        })
        return slides
    }, [artists])

    useEffect(() => {
        axios.get(`${API}/settings`)
            .then(r => {
                setHomeVideo(r.data.heroVideo || '')
                setHeroVideoText(r.data.heroVideoText || '')
                setEditorial(r.data)
            })
            .catch(() => {})
    }, [])

    useEffect(() => {
        axios.get(`${API}/artist/all-products`)
            .then(r => setArtistProducts(r.data || []))
            .catch(() => {})
    }, [])

    return (
        <HomeWrap>
            <Navbar />

            {/* ── GALERÍA 3D HERO ─────────────────────────────────────── */}
            <Gallery3D
                key={gallerySlides.length}
                slides={gallerySlides}
            />

            {/* ── GRID DE PRODUCTOS DESTACADOS ────────────────────────── */}
            {artistProducts.length > 0 && (
                <FeaturedSection id="coleccion">
                    <FeaturedSectionHeader>
                        <ShopEyebrow>— Nueva colección</ShopEyebrow>
                        <FeaturedTitle>Lo más reciente</FeaturedTitle>
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

            {/* ── CARRUSELES POR ARTISTA ─────────────────────────────── */}
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
                            <ShopEyebrow>— Tienda</ShopEyebrow>
                            <ShopTitle>Por artista</ShopTitle>
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

            {/* ── ARTISTAS: PERFILES ─────────────────────────────────── */}
            {artists.length > 0 && (
                <ArtistsShowcase id="artistas">
                    <ArtistsShowcaseHeader>
                        <ArtistsShowcaseEyebrow>— Nuestros artistas</ArtistsShowcaseEyebrow>
                        <ArtistsShowcaseTitle>Conocé a quienes<br/>dan vida al arte</ArtistsShowcaseTitle>
                    </ArtistsShowcaseHeader>
                    <ArtistsGrid count={artists.length}>
                        {artists.map(a => (
                            <ArtistProfileCard key={a._id || a.slug}>
                                <Link to={`/${a.slug}`}>
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
                                        <ArtistCardName>{a.name}</ArtistCardName>
                                        <ArtistCardCta>Ver perfil &nbsp;→</ArtistCardCta>
                                    </ArtistCardInfo>
                                </Link>
                            </ArtistProfileCard>
                        ))}
                    </ArtistsGrid>
                </ArtistsShowcase>
            )}

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

            {/* ── SECCIÓN ARTE / MANIFIESTO ──────────────────────────── */}
            {homeVideo && (
                <ArtSection>
                    <ArtVideoWrap>
                        <video src={homeVideo} autoPlay loop muted playsInline />
                        <ArtGradient />
                        <ArtTextOverlay>
                            <ArtEyebrow>— Manifiesto</ArtEyebrow>
                            <ArtHeadline>
                                No somos<br />una tienda,<br />somos arte.
                            </ArtHeadline>
                        </ArtTextOverlay>
                        <ArtScrollHint>
                            <span>Scroll</span>
                            <ArtScrollLine />
                        </ArtScrollHint>
                    </ArtVideoWrap>
                </ArtSection>
            )}

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

            {/* ── FOOTER STRIP ───────────────────────────────────────── */}
            <FooterStrip>
                <FooterStripText>
                    {new Date().getFullYear()} — Todos los derechos reservados
                </FooterStripText>
            </FooterStrip>

            {/* ── PRODUCT MODAL ──────────────────────────────────────── */}
            {selectedProd && (
                <HomeProdModal product={selectedProd} onClose={() => setSelectedProd(null)} />
            )}
        </HomeWrap>
    );
}

/* ═══════════════════════════════════════════════════════════════
   LAYOUT
═══════════════════════════════════════════════════════════════ */
const HomeWrap = styled.div`
    display: flex;
    flex-direction: column;
`

/* ═══════════════════════════════════════════════════════════════
   GALLERY 3D COMPONENT
═══════════════════════════════════════════════════════════════ */
const GALLERY_TEXTS = [
    { title: 'Arte que\nse puede usar.',           eyebrow: '— La Casita del Hornero' },
    { title: 'Piezas únicas,\ncreadas a mano.',    eyebrow: '— Artesanía argentina'   },
    { title: 'Cada obra\ncuenta una historia.',    eyebrow: '— Arte con propósito'    },
    { title: 'Baja para ver los\nproductos artesanales ↓', eyebrow: '— La colección' },
]

function Gallery3D({ slides }) {
    const spacerRef  = useRef(null)
    const mountRef   = useRef(null)
    const [textIdx,  setTextIdx]  = useState(0)
    const [show,     setShow]     = useState(true)

    const SPACING    = 7
    const VIEW_DIST  = 4
    const FRAME_N    = Math.max(slides.length, 4)   // always at least 4 frames
    const screens    = FRAME_N + 2
    const height     = `${screens * 100}vh`
    const maxTravel  = (FRAME_N - 1) * SPACING

    /* Hide fixed canvas once spacer exits viewport */
    useEffect(() => {
        const el = spacerRef.current
        if (!el) return
        const obs = new IntersectionObserver(([e]) => setShow(e.isIntersecting), { threshold: 0 })
        obs.observe(el)
        return () => obs.disconnect()
    }, [])

    /* Three.js corridor */
    useEffect(() => {
        const mount = mountRef.current
        if (!mount) return
        const W = window.innerWidth, H = window.innerHeight

        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0x050505)
        scene.fog = new THREE.FogExp2(0x050505, 0.028)

        const camera = new THREE.PerspectiveCamera(65, W / H, 0.1, 120)
        camera.position.set(0, 0, VIEW_DIST)

        const renderer = new THREE.WebGLRenderer({ antialias: true })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.setSize(W, H)
        renderer.outputColorSpace = THREE.SRGBColorSpace
        mount.appendChild(renderer.domElement)

        /* Ambient + directional lighting */
        scene.add(new THREE.AmbientLight(0xffffff, 0.3))
        const dirLight = new THREE.DirectionalLight(0xfff8ee, 1.2)
        dirLight.position.set(2, 4, 6)
        scene.add(dirLight)
        const spotFollow = new THREE.SpotLight(0xffe8c0, 3, 20, Math.PI / 6, 0.4)
        scene.add(spotFollow)

        /* Corridor walls */
        const wallMat = new THREE.MeshStandardMaterial({ color: 0x0e0e0e, roughness: 1, metalness: 0 })
        const floorMat = new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 1 })
        const totalLen = FRAME_N * SPACING + SPACING * 4

        // left wall
        const lWall = new THREE.Mesh(new THREE.PlaneGeometry(totalLen, 8), wallMat)
        lWall.rotation.y = Math.PI / 2; lWall.position.set(-3.5, 0, -(totalLen / 2) + VIEW_DIST)
        scene.add(lWall)
        // right wall
        const rWall = new THREE.Mesh(new THREE.PlaneGeometry(totalLen, 8), wallMat)
        rWall.rotation.y = -Math.PI / 2; rWall.position.set(3.5, 0, -(totalLen / 2) + VIEW_DIST)
        scene.add(rWall)
        // floor
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(7, totalLen), floorMat)
        floor.rotation.x = -Math.PI / 2; floor.position.set(0, -3, -(totalLen / 2) + VIEW_DIST)
        scene.add(floor)
        // ceiling
        const ceil = new THREE.Mesh(new THREE.PlaneGeometry(7, totalLen), wallMat)
        ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 3, -(totalLen / 2) + VIEW_DIST)
        scene.add(ceil)

        /* Frames on walls */
        const loader = new THREE.TextureLoader()
        const FW = 2.8, FH = 3.8      // frame size
        const BORDER = 0.1

        for (let i = 0; i < FRAME_N; i++) {
            const side  = (i % 2 === 0) ? -1 : 1    // left or right wall
            const z     = -(i * SPACING) - SPACING
            const wallX = side * 3.48

            // Frame border (gold strip)
            const borderMat = new THREE.MeshStandardMaterial({ color: 0xc8a96e, roughness: 0.5, metalness: 0.4 })
            const borderGeo = new THREE.BoxGeometry(FW + BORDER * 2, FH + BORDER * 2, 0.04)
            const border = new THREE.Mesh(borderGeo, borderMat)
            border.position.set(wallX + side * -0.06, 0, z)
            border.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2
            scene.add(border)

            // Dark canvas inside frame
            const canvasMat = new THREE.MeshStandardMaterial({ color: 0x1a1512, roughness: 0.9 })
            const canvas3d = new THREE.Mesh(new THREE.PlaneGeometry(FW, FH), canvasMat)
            canvas3d.position.set(wallX + side * -0.08, 0, z)
            canvas3d.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2
            scene.add(canvas3d)

            // Load artist image if available
            if (slides[i]?.image) {
                loader.load(slides[i].image, tex => {
                    tex.colorSpace = THREE.SRGBColorSpace
                    canvasMat.map = tex
                    canvasMat.color.set(0xffffff)
                    canvasMat.needsUpdate = true
                }, undefined, () => {})
            }

            // Small spotlight per frame
            const fSpot = new THREE.SpotLight(0xfff2d0, 1.5, 8, Math.PI / 8, 0.5)
            fSpot.position.set(side * 2, 2.5, z)
            fSpot.target.position.set(wallX, 0, z)
            scene.add(fSpot); scene.add(fSpot.target)
        }

        /* Particles */
        const pN = 500
        const pPos = new Float32Array(pN * 3)
        for (let i = 0; i < pN; i++) {
            pPos[i*3]   = (Math.random() - 0.5) * 6
            pPos[i*3+1] = (Math.random() - 0.5) * 5
            pPos[i*3+2] = VIEW_DIST - Math.random() * (FRAME_N * SPACING + SPACING * 3)
        }
        const pGeo = new THREE.BufferGeometry()
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
        scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({
            color: 0xfff2d0, size: 0.025, transparent: true, opacity: 0.18
        })))

        /* Scroll → camera */
        let targetZ = VIEW_DIST, currentZ = VIEW_DIST

        const getProgress = () => {
            const el = spacerRef.current
            if (!el) return 0
            const r = el.getBoundingClientRect()
            return Math.min(1, Math.max(0, -r.top) / Math.max(1, el.clientHeight - window.innerHeight))
        }

        const onScroll = () => {
            const p = getProgress()
            targetZ = VIEW_DIST - p * maxTravel
            setTextIdx(Math.min(Math.floor(p * GALLERY_TEXTS.length), GALLERY_TEXTS.length - 1))
        }
        window.addEventListener('scroll', onScroll, { passive: true })

        let rafId
        const clock = new THREE.Clock()
        const animate = () => {
            rafId = requestAnimationFrame(animate)
            const t = clock.getElapsedTime()
            currentZ += (targetZ - currentZ) * 0.06
            camera.position.z = currentZ
            camera.position.x = Math.sin(t * 0.18) * 0.08
            camera.position.y = Math.cos(t * 0.12) * 0.05
            spotFollow.position.set(camera.position.x, camera.position.y + 2, currentZ + 3)
            spotFollow.target.position.set(0, 0, currentZ - 5)
            renderer.render(scene, camera)
        }
        animate()

        const onResize = () => {
            const W2 = window.innerWidth, H2 = window.innerHeight
            camera.aspect = W2 / H2; camera.updateProjectionMatrix(); renderer.setSize(W2, H2)
        }
        window.addEventListener('resize', onResize)

        return () => {
            cancelAnimationFrame(rafId)
            window.removeEventListener('scroll', onScroll)
            window.removeEventListener('resize', onResize)
            renderer.dispose()
            try { mount.removeChild(renderer.domElement) } catch {}
        }
    }, [slides.length]) // eslint-disable-line

    const txt = GALLERY_TEXTS[textIdx]
    const isLast = textIdx === GALLERY_TEXTS.length - 1

    return (
        <>
            <GallerySpacer ref={spacerRef} style={{ height }} />
            <GalleryFixed $show={show}>
                <GalleryCanvasMount ref={mountRef} />

                <GalleryTextBlock key={textIdx}>
                    <GalleryEyebrow>{txt.eyebrow}</GalleryEyebrow>
                    <GalleryTitle $last={isLast}>{txt.title}</GalleryTitle>
                </GalleryTextBlock>

                {slides[Math.floor((textIdx / GALLERY_TEXTS.length) * slides.length)]?.name && (
                    <GalleryArtistTag>
                        <Link to={`/${slides[Math.floor((textIdx / GALLERY_TEXTS.length) * slides.length)]?.slug}`}>
                            {slides[Math.floor((textIdx / GALLERY_TEXTS.length) * slides.length)]?.name}
                        </Link>
                    </GalleryArtistTag>
                )}

                <GalleryCounter $show={slides.length > 0}>
                    {String(Math.min(Math.floor((textIdx / GALLERY_TEXTS.length) * FRAME_N) + 1, FRAME_N)).padStart(2,'0')} / {String(FRAME_N).padStart(2,'0')}
                </GalleryCounter>

                <GalleryProgressBar>
                    <GalleryProgressFill style={{ width: `${((textIdx + 1) / GALLERY_TEXTS.length) * 100}%` }} />
                </GalleryProgressBar>

                <GalleryScrollHint $hide={isLast}>
                    <span>Scroll</span>
                    <GalleryScrollLine />
                </GalleryScrollHint>
            </GalleryFixed>
        </>
    )
}

/* ═══════════════════════════════════════════════════════════════
   GALLERY HERO
═══════════════════════════════════════════════════════════════ */
const GallerySpacer = styled.div`
    width: 100%;
    background: #060606;
`

const GalleryFixed = styled.div`
    position: fixed;
    inset: 0;
    z-index: 10;
    pointer-events: none;
    opacity: ${p => p.$show ? 1 : 0};
    transition: opacity 0.5s ease;
    background: #060606;
`

const GalleryCanvasMount = styled.div`
    position: absolute;
    inset: 0;
    z-index: 0;

    canvas { display: block; }
`

const GalleryScrollHint = styled.div`
    position: absolute;
    bottom: 44px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    pointer-events: none;
    opacity: ${p => p.$hide ? 0 : 1};
    transition: opacity 0.5s;

    span {
        font-family: 'DM Sans', sans-serif;
        font-size: 8px;
        letter-spacing: 0.45em;
        text-transform: uppercase;
        color: rgba(255,255,255,0.3);
    }
`

const GalleryScrollLine = styled.div`
    width: 1px;
    height: 40px;
    background: linear-gradient(to bottom, rgba(255,255,255,0.35), transparent);
    animation: glPulse 2s ease-in-out infinite;

    @keyframes glPulse {
        0%, 100% { opacity: 0.4; }
        50%       { opacity: 1; }
    }
`

const GalleryCenterText = styled.div`
    position: absolute;
    inset: 0;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 0 24px;
    pointer-events: auto;
    transition: opacity 0.6s ease;
`

const GalleryTextBlock = styled.div`
    position: absolute;
    inset: 0;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 0 32px;
    pointer-events: none;
    animation: gtFadeIn 0.7s ease;

    @keyframes gtFadeIn {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
    }
`

const GalleryEyebrow = styled.p`
    font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
    font-size: 9px;
    letter-spacing: 0.55em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.45);
    margin: 0 0 28px;
`

const GalleryTitle = styled.h1`
    font-family: 'Playfair Display', Georgia, serif;
    font-size: ${p => p.$last ? 'clamp(2rem, 5vw, 4rem)' : 'clamp(3rem, 9vw, 8rem)'};
    font-weight: 300;
    font-style: italic;
    color: #fff;
    line-height: 1.1;
    margin: 0;
    letter-spacing: -0.02em;
    white-space: pre-line;
`

const GalleryArtistTag = styled.div`
    position: absolute;
    bottom: 80px;
    left: 40px;
    z-index: 2;

    a {
        font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
        font-size: 9px;
        letter-spacing: 0.5em;
        text-transform: uppercase;
        color: rgba(255,255,255,0.6);
        text-decoration: none;
        transition: color 0.2s;
        &:hover { color: #fff; }
    }

    @media (max-width: 640px) { left: 20px; bottom: 72px; }
`

const GalleryLastHint = styled.div`
    position: absolute;
    bottom: 48px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
`

const GalleryLastText = styled.span`
    font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
    font-size: 9px;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.5);
    animation: hintPulse 2.2s ease-in-out infinite;

    @keyframes hintPulse {
        0%, 100% { opacity: 0.5; transform: translateY(0); }
        50%       { opacity: 1;   transform: translateY(4px); }
    }
`

const GalleryLastLine = styled.div`
    width: 1px;
    height: 40px;
    background: linear-gradient(to bottom, rgba(255,255,255,0.45), rgba(255,255,255,0));
`

const GalleryCounter = styled.div`
    position: absolute;
    top: 40px;
    right: 40px;
    z-index: 2;
    display: ${p => p.$show === false ? 'none' : 'block'};
    font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
    font-size: 9px;
    letter-spacing: 0.3em;
    color: rgba(255,255,255,0.35);

    @media (max-width: 640px) { right: 20px; top: 24px; }
`

const GalleryProgressBar = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: rgba(255,255,255,0.1);
    z-index: 2;
`

const GalleryProgressFill = styled.div`
    height: 100%;
    background: rgba(255,255,255,0.5);
    transition: width 0.6s ease;
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
    text-decoration: none;
    transition: background 0.25s, color 0.25s;
    &:hover { background: #e8e8e4; }
`

const HeroCtaSecondary = styled(Link)`
    font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
    font-size: 9px;
    letter-spacing: 0.45em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.75);
    border: 1px solid rgba(255,255,255,0.3);
    padding: 16px 40px;
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
   FEATURED PRODUCTS GRID
═══════════════════════════════════════════════════════════════ */
const FeaturedSection = styled.section`
    background: #fafaf8;
    padding: 100px 40px 120px;

    @media (max-width: 640px) { padding: 72px 20px 96px; }
`

const FeaturedSectionHeader = styled.div`
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 16px 32px;
    margin-bottom: 56px;
    border-bottom: 1px solid #e8e8e4;
    padding-bottom: 24px;
`

const FeaturedTitle = styled.h2`
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(2rem, 4vw, 3.5rem);
    font-weight: 300;
    font-style: italic;
    color: #0a0a0a;
    margin: 0;
    letter-spacing: -0.02em;
    flex: 1;
`

const FeaturedViewAll = styled(Link)`
    font-family: 'DM Sans', sans-serif;
    font-size: 9px;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: #aaa;
    text-decoration: none;
    align-self: flex-end;
    flex-shrink: 0;
    transition: color 0.2s;
    &:hover { color: #0a0a0a; }
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

    &:hover img { transform: scale(1.05); }
`

const FeaturedCardMedia = styled.div`
    position: relative;
    overflow: hidden;
    background: #ededeb;
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
    border-bottom: 1px solid #f0f0ee;
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
    background: #0a0a0a;
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

const ArtistsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(${p => Math.min(p.count, 3)}, 1fr);
    gap: 3px;
    max-width: 1200px;
    margin: 0 auto;

    @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
    @media (max-width: 520px) { grid-template-columns: 1fr; }
`

const ArtistProfileCard = styled.div`
    position: relative;
    overflow: hidden;
    background: #111;

    a { display: block; text-decoration: none; color: inherit; }

    &:hover img { transform: scale(1.06); }
    &:hover div[data-cta] { letter-spacing: 0.5em; }
`

const ArtistCardMedia = styled.div`
    position: relative;
    padding-bottom: 125%;
    overflow: hidden;
    background: #1a1a1a;

    img {
        position: absolute; inset: 0;
        width: 100%; height: 100%;
        object-fit: cover;
        transition: transform 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
`

const ArtistCardPlaceholder = styled.div`
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);

    span {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: clamp(4rem, 12vw, 8rem);
        font-weight: 300;
        font-style: italic;
        color: rgba(255,255,255,0.15);
    }
`

const ArtistCardGradient = styled.div`
    position: absolute; inset: 0;
    background: linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.75) 100%);
`

const ArtistCardInfo = styled.div`
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 28px 24px;
    z-index: 2;
`

const ArtistCardName = styled.p`
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(1.3rem, 2.5vw, 1.9rem);
    font-weight: 300;
    font-style: italic;
    color: #fff;
    margin: 0 0 10px;
    line-height: 1.2;
`

const ArtistCardCta = styled.p`
    font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
    font-size: 9px;
    letter-spacing: 0.38em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.6);
    margin: 0;
    transition: letter-spacing 0.35s ease, color 0.3s;

    ${ArtistProfileCard}:hover & { color: #fff; }
`

/* ═══════════════════════════════════════════════════════════════
   TICKER DE ARTISTAS
═══════════════════════════════════════════════════════════════ */
const ArtistsTicker = styled.div`
    background: #0a0a0a;
    overflow: hidden;
    padding: 18px 0;
    border-top: 1px solid rgba(255,255,255,0.06);
    border-bottom: 1px solid rgba(255,255,255,0.06);
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
const ArtSection = styled.section`
    background: #0a0a0a;
    width: 100%;
`

const ArtVideoWrap = styled.div`
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;

    video {
        position: absolute; inset: 0;
        width: 100%; height: 100%;
        object-fit: cover;
        opacity: 0.65;
    }
`

const ArtGradient = styled.div`
    position: absolute;
    inset: 0;
    background: linear-gradient(
        to bottom,
        rgba(10,10,10,0.35) 0%,
        rgba(10,10,10,0.05) 40%,
        rgba(10,10,10,0.55) 100%
    );
    z-index: 1;
`

const ArtTextOverlay = styled.div`
    position: absolute; inset: 0;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 0 24px;
`

const ArtEyebrow = styled.p`
    font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
    font-size: 9px;
    letter-spacing: 0.5em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.5);
    margin: 0 0 28px;
`

const ArtHeadline = styled.h2`
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(3rem, 8vw, 7rem);
    font-weight: 300;
    font-style: italic;
    color: #fff;
    line-height: 1.08;
    margin: 0;
    letter-spacing: -0.02em;
`

const ArtScrollHint = styled.div`
    position: absolute;
    bottom: 48px;
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
        color: rgba(255,255,255,0.4);
    }
`

const ArtScrollLine = styled.div`
    width: 1px;
    height: 48px;
    background: linear-gradient(to bottom, rgba(255,255,255,0.4), rgba(255,255,255,0));
    animation: pulse 2s ease-in-out infinite;

    @keyframes pulse {
        0%, 100% { opacity: 0.4; }
        50%       { opacity: 1; }
    }
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
    background: #fff;
    padding: 100px 0 140px;
    overflow: hidden;
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
    color: #bbb;
    margin: 0 0 20px;
    flex: 0 0 100%;
`

const ShopTitle = styled.h2`
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(2.5rem, 5.5vw, 5rem);
    font-weight: 300;
    font-style: italic;
    color: #0a0a0a;
    line-height: 1.1;
    margin: 0 0 16px;
    letter-spacing: -0.02em;
`

/* ═══════════════════════════════════════════════════════════════
   CARRUSELES POR ARTISTA
═══════════════════════════════════════════════════════════════ */
const CarouselsSection = styled.section`
    background: #f7f7f5;
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
    border-bottom: 1px solid #e8e8e4;
    margin-bottom: 3px;

    @media (max-width: 640px) { padding: 0 20px 20px; }
`

const ArtistCarouselName = styled.h3`
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(1.4rem, 3vw, 2.2rem);
    font-weight: 300;
    font-style: italic;
    color: #0a0a0a;
    margin: 0;
    letter-spacing: -0.01em;
`

const ArtistCarouselLink = styled(Link)`
    font-family: 'DM Sans', sans-serif;
    font-size: 9px;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: #aaa;
    text-decoration: none;
    flex-shrink: 0;
    transition: color 0.2s;
    &:hover { color: #0a0a0a; }
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

    &:hover img { transform: scale(1.05); }

    @media (max-width: 640px) { flex: 0 0 200px; }
`

const ShopCardMedia = styled.div`
    position: relative;
    overflow: hidden;
    background: #ececea;
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
    border-bottom: 1px solid #f0f0ee;
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
   FOOTER STRIP
═══════════════════════════════════════════════════════════════ */
const FooterStrip = styled.div`
    background: #0a0a0a;
    padding: 32px 40px;
    display: flex;
    align-items: center;
    justify-content: center;
`

const FooterStripText = styled.p`
    font-family: 'DM Sans', sans-serif;
    font-size: 8px;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.25);
    margin: 0;
`

/* ═══════════════════════════════════════════════════════════════
   PRODUCT MODAL
═══════════════════════════════════════════════════════════════ */
function HomeProdModal({ product, onClose }) {
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
                            color: '#999', margin: '0 0 36px'
                        }}>{product.price}</p>
                        <AddCart data={cartData} />
                    </div>
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
    background: #fafaf8;
    display: flex; flex-direction: column;
    width: 100%; max-width: 500px;
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
