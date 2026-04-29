import React, { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import AddCart from '../Components/Product-Page-Component/AddCart'

const API = process.env.REACT_APP_BACKEND_URL || 'https://zara-backend.vercel.app'

/* ─── LAZY IMAGE ─────────────────────────────────────────────────────────── */
function LazyImg({ src, alt, className, style }) {
  const ref = useRef(null)
  const [loaded,  setLoaded]  = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); observer.unobserve(el) } },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`overflow-hidden bg-mist ${className || ''}`} style={style}>
      {visible && (
        <img
          src={src} alt={alt} onLoad={() => setLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  )
}

/* ─── PRODUCT MODAL ──────────────────────────────────────────────────────── */
function ProductModal({ product, artistName, onClose }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [visible,   setVisible]   = useState(false)

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
      <div
        className={`fixed inset-0 bg-ink/60 z-[100] transition-opacity duration-400 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div className={`fixed top-0 right-0 bottom-0 z-[101] bg-chalk flex flex-col w-full max-w-xl shadow-2xl transition-transform duration-500 ease-out ${visible ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-8 py-5 border-b border-mist flex-shrink-0">
          <p className="font-sans text-[9px] tracking-widest3 uppercase text-ash">{artistName}</p>
          <button onClick={onClose} className="font-sans text-[10px] tracking-widest2 uppercase text-ash hover:text-ink transition-colors">✕ Cerrar</button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="relative bg-mist" style={{ paddingBottom: '120%' }}>
            {product.image && (
              <img src={product.image} alt={product.name} onLoad={() => setImgLoaded(true)}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              />
            )}
            {!imgLoaded && <div className="absolute inset-0 bg-mist animate-pulse" />}
          </div>
          <div className="px-8 py-8">
            <h2 className="font-serif text-2xl font-light text-ink mb-2">{product.name}</h2>
            <p className="font-serif text-lg text-ash mb-8">{product.price}</p>
            <div className="w-8 h-px bg-mist mb-8" />
            <div className="border-t border-mist pt-6">
              <div className="flex items-center gap-4">
                <span className="font-serif text-base text-ink">{product.price}</span>
                <AddCart data={cartData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────── */
export default function ArtistPage() {
  const { slug } = useParams()
  const [artist,      setArtist]      = useState(null)
  const [notFound,    setNotFound]    = useState(false)
  const [selectedProd, setSelectedProd] = useState(null)

  useEffect(() => {
    setArtist(null); setNotFound(false)
    axios.get(`${API}/artist/${slug}`)
      .then(r => setArtist(r.data))
      .catch(() => setNotFound(true))
  }, [slug])

  if (notFound) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: '#fff' }}>
      <p style={{ fontFamily: 'serif', fontSize: '5rem', fontStyle: 'italic', fontWeight: 300 }}>404</p>
      <p style={{ fontFamily: 'sans-serif', fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#888', margin: '16px 0 40px' }}>Artista no encontrado</p>
      <Link to="/" style={{ fontFamily: 'sans-serif', fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#fff', border: '1px solid #444', padding: '12px 32px', textDecoration: 'none' }}>← Volver al inicio</Link>
    </div>
  )

  if (!artist) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, border: '2px solid #eee', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  const img = (i) => artist.images?.[i] || ''
  const g   = (k) => artist[k] || ''

  const products = artist.shopProducts || []

  return (
    <div className="bg-chalk font-sans text-ink antialiased">

      {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden bg-ink" style={{ height: '100vh' }}>
        {artist.heroVideo ? (
          <video
            src={artist.heroVideo} autoPlay loop muted playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
        ) : img(0) ? (
          <img src={img(0)} alt={artist.name} className="absolute inset-0 w-full h-full object-cover opacity-80" />
        ) : (
          <div className="absolute inset-0 bg-ink" />
        )}
        <div className="absolute inset-0 bg-ink/30" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
          {g('subtitle') && (
            <p className="font-sans text-[9px] tracking-widest3 uppercase text-white/60 mb-6">
              {g('subtitle')}
            </p>
          )}
          <h1 className="font-serif text-[clamp(2.5rem,8vw,7rem)] font-light text-white leading-none tracking-tight">
            {artist.name}
          </h1>
        </div>
      </section>

      {/* ── 2. HISTORIA DEL ARTISTA ─────────────────────────────────────── */}
      {(g('bioText') || g('bioGoals') || g('bioQuote')) && (
        <section className="py-24 px-6 md:px-16 max-w-6xl mx-auto">
          {/* Encabezado */}
          <p className="font-sans text-[8px] tracking-widest3 uppercase text-ash mb-10">
            — {g('bioTitle') || 'Mi historia'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            {/* Columna izquierda: historia */}
            {g('bioText') && (
              <div>
                <p className="font-sans text-[13px] text-ink leading-[2] tracking-wide whitespace-pre-line">
                  {g('bioText')}
                </p>
              </div>
            )}

            {/* Columna derecha: metas + quote */}
            <div className="flex flex-col gap-10">
              {g('bioGoals') && (
                <div>
                  <p className="font-sans text-[8px] tracking-widest3 uppercase text-ash mb-4">
                    Lo que intento retratar
                  </p>
                  <p className="font-sans text-[13px] text-ash leading-[2] tracking-wide whitespace-pre-line">
                    {g('bioGoals')}
                  </p>
                </div>
              )}
              {g('bioQuote') && (
                <blockquote className="border-l-2 border-ink pl-6">
                  <p className="font-serif text-xl md:text-2xl font-light italic text-ink leading-snug">
                    "{g('bioQuote')}"
                  </p>
                  <footer className="mt-4 font-sans text-[9px] tracking-widest2 uppercase text-ash">
                    — {artist.name}
                  </footer>
                </blockquote>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── 3. STATEMENT EDITORIAL ──────────────────────────────────────── */}
      {(g('editorialQuote') || g('editorialDescription')) && (
        <section className="py-24 px-8 text-center max-w-3xl mx-auto">
          {g('editorialLabel') && (
            <p className="font-sans text-[8px] tracking-widest3 uppercase text-ash mb-8">
              {g('editorialLabel')}
            </p>
          )}
          {g('editorialQuote') && (
            <h2 className="font-serif text-[clamp(1.4rem,3.5vw,2.8rem)] font-light italic text-ink leading-snug mb-8">
              {g('editorialQuote')}
            </h2>
          )}
          {g('editorialDescription') && (
            <p className="font-sans text-[11px] text-ash leading-loose tracking-wide">
              {g('editorialDescription')}
            </p>
          )}
        </section>
      )}

      {/* ── 3. TEXTO + IMAGEN LADO A LADO ───────────────────────────────── */}
      {(g('blockTitle') || g('blockBody') || img(1)) && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-px bg-mist">
          {/* Texto */}
          <div className="bg-chalk flex flex-col justify-center px-12 py-20">
            {g('blockTitle') && (
              <h2 className="font-serif text-[clamp(1.8rem,4vw,3.5rem)] font-light italic text-ink leading-snug mb-8">
                {g('blockTitle')}
              </h2>
            )}
            {g('blockBody') && (
              <p className="font-sans text-[12px] text-ash leading-loose tracking-wide whitespace-pre-line">
                {g('blockBody')}
              </p>
            )}
          </div>
          {/* Imagen */}
          <div className="bg-mist" style={{ minHeight: '60vh' }}>
            {img(1) ? (
              <LazyImg src={img(1)} alt="editorial" className="w-full h-full" style={{ minHeight: '60vh' }} />
            ) : (
              <div className="w-full h-full bg-mist" style={{ minHeight: '60vh' }} />
            )}
          </div>
        </section>
      )}

      {/* ── 4. DOS IMÁGENES LADO A LADO ─────────────────────────────────── */}
      {(img(2) || img(3)) && (
        <section className="grid grid-cols-2 gap-px bg-mist">
          <div style={{ paddingBottom: '130%', position: 'relative' }}>
            {img(2) ? (
              <LazyImg src={img(2)} alt="editorial 2" className="absolute inset-0 w-full h-full" />
            ) : (
              <div className="absolute inset-0 bg-mist" />
            )}
          </div>
          <div style={{ paddingBottom: '130%', position: 'relative' }}>
            {img(3) ? (
              <LazyImg src={img(3)} alt="editorial 3" className="absolute inset-0 w-full h-full" />
            ) : (
              <div className="absolute inset-0 bg-mist" />
            )}
          </div>
        </section>
      )}

      {/* ── 5. TODOS LOS PRODUCTOS ──────────────────────────────────────── */}
      {products.length > 0 && (
        <section className="py-20 px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            {/* Encabezado */}
            <div className="mb-12 border-b border-mist pb-6">
              <p className="font-sans text-[8px] tracking-widest3 uppercase text-ash mb-3">
                {g('shopTitle') || 'La Colección'}
              </p>
              {g('shopDescription') && (
                <p className="font-sans text-[11px] text-ash leading-loose max-w-xl">
                  {g('shopDescription')}
                </p>
              )}
            </div>

            {/* Grid de productos */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((p, i) => (
                <div key={p._id || i} className="group cursor-pointer" onClick={() => setSelectedProd(p)}>
                  {/* Imagen */}
                  <div className="relative overflow-hidden bg-mist mb-4" style={{ paddingBottom: '130%' }}>
                    {p.image ? (
                      <img
                        src={p.image} alt={p.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-mist flex items-center justify-center">
                        <span className="text-ash text-xs tracking-widest2 uppercase">Sin imagen</span>
                      </div>
                    )}
                    <div className="absolute bottom-3 inset-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/95 backdrop-blur-sm text-center py-2">
                        <span className="font-sans text-[8px] tracking-widest2 uppercase text-ink">Ver detalle</span>
                      </div>
                    </div>
                  </div>
                  {/* Info */}
                  <p className="font-sans text-[9px] tracking-widest2 uppercase text-ink leading-relaxed truncate mb-1">
                    {p.name}
                  </p>
                  <p className="font-serif text-sm text-ash mb-2">{p.price}</p>
                  <AddCart data={{
                    producttitle: p.name,
                    image:        p.image,
                    price:        p.price,
                    pricenum:     parseFloat((p.price || '0').replace(/[^0-9.,]/g, '').replace(',', '.')) || 0,
                    quantity:     1,
                    color:        '',
                    id:           p._id || p.name,
                  }} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 6. FOOTER ───────────────────────────────────────────────────── */}
      <section className="bg-ink text-white py-20 px-8 text-center">
        {g('footerLabel') && (
          <p className="font-sans text-[8px] tracking-widest3 uppercase text-white/40 mb-6">
            {g('footerLabel')}
          </p>
        )}
        <h2 className="font-serif text-[clamp(2rem,6vw,5rem)] font-light italic mb-8">
          {g('footerWord') || 'Fin.'}
        </h2>
        <Link
          to="/"
          className="inline-block font-sans text-[9px] tracking-widest3 uppercase border border-white/30 px-8 py-4 hover:bg-white hover:text-ink transition-all duration-300"
        >
          Volver al inicio
        </Link>
      </section>

      {/* ── PRODUCT MODAL ────────────────────────────────────────────────── */}
      {selectedProd && (
        <ProductModal
          product={selectedProd}
          artistName={artist?.name || ''}
          onClose={() => setSelectedProd(null)}
        />
      )}

    </div>
  )
}
