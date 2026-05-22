import React, { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import styled, { keyframes } from 'styled-components'
import AddCart from '../Components/Product-Page-Component/AddCart'

const API = process.env.REACT_APP_BACKEND_URL || 'https://zara-backend.vercel.app'

/* ─── LAZY IMAGE ──────────────────────────────────────────────────────────── */
function LazyImg({ src, alt, style }) {
  const ref = useRef(null)
  const [loaded,  setLoaded]  = useState(false)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el) } }, { rootMargin: '200px' })
    obs.observe(el); return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} style={{ width: '100%', height: '100%', background: '#e8ddd0', overflow: 'hidden', ...style }}>
      {visible && <img src={src} alt={alt} onLoad={() => setLoaded(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block',
          opacity: loaded ? 1 : 0, transition: 'opacity 0.7s ease' }} />}
    </div>
  )
}

/* ─── PRODUCT MODAL ───────────────────────────────────────────────────────── */
function ProductModal({ product, artistName, onClose }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [visible,   setVisible]   = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), 10); return () => clearTimeout(t) }, [])
  useEffect(() => { const fn = e => { if (e.key === 'Escape') onClose() }; window.addEventListener('keydown', fn); return () => window.removeEventListener('keydown', fn) }, [onClose])
  useEffect(() => { document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = '' } }, [])
  const cartData = {
    producttitle: product.name, image: product.image, price: product.price,
    pricenum: parseFloat((product.price || '0').replace(/[^0-9.,]/g, '').replace(',', '.')) || 0,
    quantity: 1, color: '', id: product._id || product.name,
  }
  return (
    <>
      <ModalOverlay $visible={visible} onClick={onClose} />
      <ModalPanel $visible={visible}>
        <ModalHead>
          <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 9, letterSpacing: '0.4em', textTransform: 'uppercase', color: '#999' }}>{artistName}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', fontSize: 9, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#999' }}>✕ Cerrar</button>
        </ModalHead>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ position: 'relative', background: '#e8ddd0', paddingBottom: '120%' }}>
            {product.image && <img src={product.image} alt={product.name} onLoad={() => setImgLoaded(true)}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.7s' }} />}
          </div>
          <div style={{ padding: '32px 28px' }}>
            <p style={{ fontFamily: 'Cormorant Garamond,Georgia,serif', fontSize: 22, fontWeight: 400, fontStyle: 'normal', color: '#1a1a1a', margin: '0 0 6px' }}>{product.name}</p>
            <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 12, letterSpacing: '0.1em', color: '#999', margin: '0 0 32px' }}>{product.price}</p>
            <AddCart data={cartData} />
          </div>
        </div>
      </ModalPanel>
    </>
  )
}

/* ─── MAIN COMPONENT ──────────────────────────────────────────────────────── */
export default function ArtistPage() {
  const { slug } = useParams()
  const [artist,       setArtist]       = useState(null)
  const [notFound,     setNotFound]     = useState(false)
  const [selectedProd, setSelectedProd] = useState(null)

  useEffect(() => {
    setArtist(null); setNotFound(false)
    axios.get(`${API}/artist/${slug}`)
      .then(r => setArtist(r.data))
      .catch(() => setNotFound(true))
  }, [slug])

  if (notFound) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#ead1b0' }}>
      <p style={{ fontFamily: 'Cormorant Garamond,Georgia,serif', fontSize: '5rem', fontStyle: 'normal', fontWeight: 400, color: '#1a1a1a' }}>404</p>
      <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#888', margin: '16px 0 40px' }}>Artista no encontrado</p>
      <Link to="/" style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#1a1a1a', border: '1px solid #ccc', padding: '12px 32px', textDecoration: 'none' }}>← Volver al inicio</Link>
    </div>
  )

  if (!artist) return (
    <div style={{ minHeight: '100vh', background: '#ead1b0' }}>
      <div style={{ width: '100%', height: '100vh', background: '#d4c4a8' }} />
    </div>
  )

  const img      = (i) => artist.images?.[i] || ''
  const g        = (k) => artist[k] || ''
  const products = artist.shopProducts || []

  return (
    <Page>

      {/* ══ 1. HERO ══════════════════════════════════════════════════════ */}
      <Hero>
        {artist.heroVideo ? (
          <video src={artist.heroVideo} autoPlay loop muted playsInline
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
        ) : img(0) ? (
          <img src={img(0)} alt={artist.name}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
        ) : null}
        <HeroOverlay />
        <HeroContent>
          {g('subtitle') && <HeroEyebrow>{g('subtitle')}</HeroEyebrow>}
          <HeroTitle>{artist.name}</HeroTitle>
        </HeroContent>
      </Hero>

      {/* ══ 2. TODOS LOS PRODUCTOS — estilo galería editorial ═══════════ */}
      {products.length > 0 && (
        <ProductsSection>
          <SectionHeader>
            <Eyebrow>— Colección</Eyebrow>
            <SectionTitle>{g('shopTitle') || 'La Colección'}</SectionTitle>
            {g('shopDescription') && <SectionDesc>{g('shopDescription')}</SectionDesc>}
          </SectionHeader>

          {/* Galería: pares de fotos grandes lado a lado */}
          <GalleryGrid>
            {products.map((p, i) => (
              <GalleryItem key={p._id || i} $tall={i % 3 === 0} onClick={() => setSelectedProd(p)}>
                <GalleryImg>
                  {p.image
                    ? <img src={p.image} alt={p.name} loading="lazy" />
                    : <GalleryNoImg>{p.name?.charAt(0)}</GalleryNoImg>}
                  <GalleryOverlay>
                    <GalleryOverlayNum>0{i + 1}</GalleryOverlayNum>
                    <GalleryOverlayInfo>
                      <GalleryOverlayName>{p.name}</GalleryOverlayName>
                      <GalleryOverlayPrice>{p.price}</GalleryOverlayPrice>
                    </GalleryOverlayInfo>
                    <GalleryOverlayBtn>Ver obra</GalleryOverlayBtn>
                  </GalleryOverlay>
                </GalleryImg>
                <GalleryCaption>
                  <GalleryCaptionNum>0{i + 1}</GalleryCaptionNum>
                  <GalleryCaptionText>
                    <GalleryCaptionName>{p.name}</GalleryCaptionName>
                    <GalleryCaptionPrice>{p.price}</GalleryCaptionPrice>
                  </GalleryCaptionText>
                </GalleryCaption>
              </GalleryItem>
            ))}
          </GalleryGrid>
        </ProductsSection>
      )}

      {/* ══ 3. INFORMACIÓN DEL ARTISTA ═══════════════════════════════════ */}
      {(g('bioText') || g('bioGoals') || g('bioQuote') || g('editorialQuote')) && (
        <InfoSection>
          <InfoInner>
            <Eyebrow>— {g('bioTitle') || 'Sobre el artista'}</Eyebrow>

            <InfoGrid>
              {/* Columna principal — texto bio */}
              {g('bioText') && (
                <InfoMain>
                  <BioText>{g('bioText')}</BioText>
                </InfoMain>
              )}

              {/* Columna lateral — metas + quote */}
              <InfoSide>
                {g('bioGoals') && (
                  <InfoBlock>
                    <InfoBlockLabel>Lo que intento retratar</InfoBlockLabel>
                    <InfoBlockText>{g('bioGoals')}</InfoBlockText>
                  </InfoBlock>
                )}
                {g('bioQuote') && (
                  <InfoQuote>
                    <InfoQuoteText>"{g('bioQuote')}"</InfoQuoteText>
                    <InfoQuoteAuthor>— {artist.name}</InfoQuoteAuthor>
                  </InfoQuote>
                )}
                {g('editorialQuote') && (
                  <InfoQuote>
                    <InfoQuoteText>"{g('editorialQuote')}"</InfoQuoteText>
                  </InfoQuote>
                )}
              </InfoSide>
            </InfoGrid>

            {g('editorialDescription') && (
              <EditDescRow>
                <EditDesc>{g('editorialDescription')}</EditDesc>
              </EditDescRow>
            )}
          </InfoInner>
        </InfoSection>
      )}

      {/* ══ 4. FOTOS EDITORIAL ═══════════════════════════════════════════ */}
      {(img(1) || img(2) || img(3) || g('blockTitle') || g('blockBody')) && (
        <EditorialSection>
          <EditorialEyebrow>— Editorial</EditorialEyebrow>

          {/* Foto grande + texto lado a lado */}
          {(img(1) || g('blockTitle')) && (
            <EditorialRow>
              {img(1) && (
                <EditImgLarge>
                  <LazyImg src={img(1)} alt="editorial 1" style={{ height: '100%' }} />
                </EditImgLarge>
              )}
              {(g('blockTitle') || g('blockBody')) && (
                <EditTextBlock>
                  {g('blockTitle') && <EditBlockTitle>{g('blockTitle')}</EditBlockTitle>}
                  {g('blockBody')  && <EditBlockBody>{g('blockBody')}</EditBlockBody>}
                </EditTextBlock>
              )}
            </EditorialRow>
          )}

          {/* Dos fotos lado a lado */}
          {(img(2) || img(3)) && (
            <EditorialDuo>
              {img(2) && (
                <EditImgDuo>
                  <LazyImg src={img(2)} alt="editorial 2" style={{ height: '100%' }} />
                </EditImgDuo>
              )}
              {img(3) && (
                <EditImgDuo>
                  <LazyImg src={img(3)} alt="editorial 3" style={{ height: '100%' }} />
                </EditImgDuo>
              )}
            </EditorialDuo>
          )}

        </EditorialSection>
      )}

      {/* ══ 5. FOOTER ════════════════════════════════════════════════════ */}
      <ArtistFooter>
        {g('footerLabel') && <FooterEyebrow>{g('footerLabel')}</FooterEyebrow>}
        <FooterTitle>{g('footerWord') || artist.name}</FooterTitle>
        <Link to="/" style={{ display: 'inline-block', fontFamily: 'DM Sans,sans-serif', fontSize: 9, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.25)', padding: '14px 36px', textDecoration: 'none', transition: 'all 0.3s' }}>
          ← Volver al inicio
        </Link>
      </ArtistFooter>

      {selectedProd && (
        <ProductModal product={selectedProd} artistName={artist?.name || ''} onClose={() => setSelectedProd(null)} />
      )}
    </Page>
  )
}


/* ════════════════════════════════════════════════════════════════
   ESTILOS
════════════════════════════════════════════════════════════════ */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`

const Page = styled.div`
  background: #ead1b0;
  min-height: 100vh;
`

/* ── Hero ── */
const Hero = styled.section`
  position: relative;
  width: 100%;
  height: 100vh;
  background: #1a1a1a;
  overflow: hidden;
  display: flex; align-items: center; justify-content: center;
`
const HeroOverlay = styled.div`
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 100%);
`
const HeroContent = styled.div`
  position: relative; z-index: 2;
  text-align: center; padding: 0 24px;
`
const HeroEyebrow = styled.p`
  font-family: 'DM Sans', sans-serif;
  font-size: 9px; letter-spacing: 0.5em;
  text-transform: uppercase; color: rgba(255,255,255,0.5);
  margin: 0 0 20px;
`
const HeroTitle = styled.h1`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(3rem, 9vw, 8rem);
  font-weight: 400; font-style: normal;
  color: #fff; line-height: 1.0;
  margin: 0; letter-spacing: -0.02em;
  text-transform: capitalize;
`

/* ── Products ── */
const ProductsSection = styled.section`
  background: #f5ede0;
  padding: 80px clamp(48px, 8vw, 140px) 100px;
  animation: ${fadeUp} 0.7s ease both;

  @media (max-width: 640px) { padding: 48px 0 64px; }
`
const SectionHeader = styled.div`
  margin-bottom: 56px;
  border-bottom: 1px solid #d8c8b0;
  padding-bottom: 28px;
  @media (max-width: 640px) { padding: 0 16px 24px; margin-bottom: 40px; }
`
const Eyebrow = styled.p`
  font-family: 'DM Sans', sans-serif;
  font-size: 9px; letter-spacing: 0.45em;
  text-transform: uppercase; color: #898635;
  margin: 0 0 16px;
`
const SectionTitle = styled.h2`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(1.6rem, 3vw, 2.8rem);
  font-weight: 400; font-style: normal;
  color: #1a1a1a; margin: 0 0 12px;
`
const SectionDesc = styled.p`
  font-family: 'DM Sans', sans-serif;
  font-size: 12px; line-height: 1.9;
  color: #888; margin: 0; max-width: 560px;
`
/* ── Gallery ── */
const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px 48px;
  max-width: 640px;
  margin: 0 auto;

  @media (max-width: 1024px) { gap: 32px 32px; max-width: 580px; }
  @media (max-width: 640px)  { gap: 0; max-width: 100%; }
`
const GalleryItem = styled.div`
  cursor: pointer;
  &:hover img { transform: scale(1.04); }
`
const GalleryImg = styled.div`
  position: relative;
  overflow: hidden;
  background: #d4c4a8;
  padding-bottom: 120%;

  img {
    position: absolute; inset: 0;
    width: 100%; height: 100%; object-fit: cover;
    transition: transform 1.1s cubic-bezier(.25,.46,.45,.94);
  }

  @media (max-width: 640px) {
    padding-bottom: 125%;
  }
`
const GalleryNoImg = styled.div`
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(4rem, 12vw, 8rem);
  font-weight: 400; font-style: normal;
  color: rgba(0,0,0,0.08);
`
const GalleryOverlay = styled.div`
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.08) 50%, transparent 100%);
  display: flex; flex-direction: column;
  justify-content: space-between;
  padding: 20px 20px 18px;
  /* siempre visible en desktop — nombre y precio dentro de la foto */
  opacity: 1;
  transition: background 0.4s ease;

  @media (max-width: 640px) {
    padding: 12px;
    background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%);
  }
`
const GalleryOverlayNum = styled.span`
  font-family: 'DM Sans', sans-serif;
  font-size: 9px; letter-spacing: 0.4em;
  color: rgba(255,255,255,0.4); text-transform: uppercase;
  @media (max-width: 640px) { display: none; }
`
const GalleryOverlayInfo = styled.div`
  flex: 1; display: flex; flex-direction: column; justify-content: flex-end; gap: 4px;
`
const GalleryOverlayName = styled.p`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(0.9rem, 1.6vw, 1.25rem);
  font-weight: 400; font-style: normal;
  color: #fff; margin: 0; line-height: 1.2;
  text-transform: capitalize;
  @media (max-width: 640px) {
    font-size: 0.82rem;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
`
const GalleryOverlayPrice = styled.p`
  font-family: 'DM Sans', sans-serif;
  font-size: 10px; letter-spacing: 0.15em;
  color: rgba(255,255,255,0.6); margin: 0;
  @media (max-width: 640px) { font-size: 9px; letter-spacing: 0.08em; }
`
const GalleryOverlayBtn = styled.span`
  display: inline-block; margin-top: 12px;
  font-family: 'DM Sans', sans-serif;
  font-size: 8px; letter-spacing: 0.4em;
  text-transform: uppercase; color: rgba(255,255,255,0.7);
  border-bottom: 1px solid rgba(255,255,255,0.35);
  padding-bottom: 3px;
  opacity: 0; transition: opacity 0.3s ease;
  ${GalleryItem}:hover & { opacity: 1; }
  @media (max-width: 640px) { display: none; }
`
/* Caption oculto — info ahora va dentro de la foto */
const GalleryCaption = styled.div`
  display: none;
`
const GalleryCaptionNum = styled.span``
const GalleryCaptionText = styled.div``
const GalleryCaptionName = styled.p``
const GalleryCaptionPrice = styled.p``

/* ── Info ── */
const InfoSection = styled.section`
  background: #3c4021;
  margin: 0 24px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 22px 70px rgba(0,0,0,0.38), 0 6px 20px rgba(0,0,0,0.18);

  @media (max-width: 640px) { margin: 0 12px; }
`
const InfoInner = styled.div`
  padding: clamp(56px, 8vw, 100px) clamp(24px, 6vw, 80px);
  max-width: 1200px; margin: 0 auto;
`
const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  margin-top: 40px;
  @media (max-width: 768px) { grid-template-columns: 1fr; gap: 48px; }
`
const InfoMain = styled.div``
const BioText = styled.p`
  font-family: 'DM Sans', sans-serif;
  font-size: clamp(0.9rem, 1.4vw, 1rem);
  line-height: 2; color: rgba(255,255,255,0.65);
  white-space: pre-line; font-weight: 400; margin: 0;
`
const InfoSide = styled.div`
  display: flex; flex-direction: column; gap: 40px;
`
const InfoBlock = styled.div``
const InfoBlockLabel = styled.p`
  font-family: 'DM Sans', sans-serif;
  font-size: 8px; letter-spacing: 0.4em;
  text-transform: uppercase; color: rgba(173,67,29,0.8);
  margin: 0 0 14px;
`
const InfoBlockText = styled.p`
  font-family: 'DM Sans', sans-serif;
  font-size: 13px; line-height: 1.9;
  color: rgba(255,255,255,0.55); margin: 0;
  white-space: pre-line;
`
const InfoQuote = styled.blockquote`
  border-left: 2px solid rgba(173,67,29,0.5);
  padding-left: 24px; margin: 0;
`
const InfoQuoteText = styled.p`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(1.1rem, 2vw, 1.5rem);
  font-weight: 400; font-style: normal;
  color: #fff; margin: 0 0 12px; line-height: 1.4;
`
const InfoQuoteAuthor = styled.footer`
  font-family: 'DM Sans', sans-serif;
  font-size: 9px; letter-spacing: 0.35em;
  text-transform: uppercase; color: rgba(255,255,255,0.35);
`
const EditDescRow = styled.div`
  margin-top: 56px;
  border-top: 1px solid rgba(255,255,255,0.08);
  padding-top: 40px;
`
const EditDesc = styled.p`
  font-family: 'DM Sans', sans-serif;
  font-size: 12px; line-height: 2;
  letter-spacing: 0.08em; color: rgba(255,255,255,0.4);
  max-width: 600px; margin: 0; white-space: pre-line;
`

/* ── Editorial ── */
const EditorialSection = styled.section`
  margin: 24px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 22px 70px rgba(0,0,0,0.28), 0 6px 20px rgba(0,0,0,0.12);
  background: #1a1a1a;

  @media (max-width: 640px) { margin: 12px; }
`
const EditorialEyebrow = styled.p`
  font-family: 'DM Sans', sans-serif;
  font-size: 9px; letter-spacing: 0.45em;
  text-transform: uppercase; color: rgba(255,255,255,0.3);
  padding: 40px clamp(24px, 5vw, 60px) 0;
  margin: 0;
`
const EditorialRow = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  min-height: 600px;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`
const EditImgLarge = styled.div`
  position: relative; overflow: hidden;
  min-height: 500px;
`
const EditTextBlock = styled.div`
  padding: clamp(40px, 6vw, 80px) clamp(24px, 5vw, 60px);
  display: flex; flex-direction: column; justify-content: center;
  gap: 24px;
`
const EditBlockTitle = styled.h2`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(1.6rem, 3vw, 2.8rem);
  font-weight: 400; font-style: normal;
  color: #fff; margin: 0; line-height: 1.15;
`
const EditBlockBody = styled.p`
  font-family: 'DM Sans', sans-serif;
  font-size: 12px; line-height: 2;
  color: rgba(255,255,255,0.5); margin: 0;
  white-space: pre-line;
`
const EditorialDuo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px;
`
const EditImgDuo = styled.div`
  position: relative; overflow: hidden;
  padding-bottom: 130%;
  & > div { position: absolute; inset: 0; }
`

/* ── Footer ── */
const ArtistFooter = styled.section`
  background: #4f170f;
  margin: 24px;
  border-radius: 20px;
  padding: clamp(64px, 10vw, 120px) 40px;
  text-align: center;
  box-shadow: 0 22px 70px rgba(0,0,0,0.38), 0 6px 20px rgba(0,0,0,0.18);

  @media (max-width: 640px) { margin: 12px; padding: 64px 24px; }
`
const FooterEyebrow = styled.p`
  font-family: 'DM Sans', sans-serif;
  font-size: 9px; letter-spacing: 0.45em;
  text-transform: uppercase; color: rgba(255,255,255,0.35);
  margin: 0 0 20px;
`
const FooterTitle = styled.h2`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(2.5rem, 7vw, 6rem);
  font-weight: 400; font-style: normal;
  color: #fff; margin: 0 0 48px;
  text-transform: capitalize;
`

/* ── Modal ── */
const ModalOverlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(10,10,10,0.55); z-index: 100;
  opacity: ${p => p.$visible ? 1 : 0};
  transition: opacity 0.4s;
`
const ModalPanel = styled.div`
  position: fixed; top: 0; right: 0; bottom: 0;
  z-index: 101; background: #f5ede0;
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
  border-bottom: 1px solid #e0d4c4;
  flex-shrink: 0;
`
