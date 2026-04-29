import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getProduct } from '../Redux/App/action'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'

const API = process.env.REACT_APP_BACKEND_URL || 'https://zara-backend.vercel.app'

/* ─── DEFAULTS (fallback cuando no hay datos del artista) ─────────────────── */
const DEFAULTS = {
  subtitle:              'COLECCIÓN EXCLUSIVA · 2024',
  editorialLabel:        '— La colección',
  editorialQuote:        '"Una conversación entre la forma y el silencio que la rodea."',
  editorialDescription:  'Tejidos naturales. Siluetas sin género. Una paleta que respira con quien la lleva.',
  section1Label:         '01 / Estructura',
  section1Headline:      'El cuerpo como arquitectura.',
  section1Body:          'Cada costura es una decisión.\nCada doblez, una intención.',
  section2Label:         '02 / Movimiento',
  section2Quote:         '"Nada se impone.\nTodo fluye."',
  shopTitle:             'Vestite la historia.',
  shopDescription:       'Cada punto sobre la imagen es una prenda de la colección. Explorá posando el cursor para descubrirla.',
  landscapeQuote:        '"La elegancia es\nuna forma de decir adiós."',
  footerLabel:           'Natalia Gomez × Zara · Colección Exclusiva 2024',
  footerWord:            'Fin.',
}

const FALLBACK_HOTSPOTS = [
  { x: 28, y: 38, name: 'OVERSIZE COAT',      price: '$249' },
  { x: 55, y: 62, name: 'WIDE LEG TROUSERS',  price: '$89'  },
  { x: 72, y: 44, name: 'SILK BLOUSE',         price: '$119' },
]

/* ─── FADE-IN HOOK ───────────────────────────────────────────────────────── */
function useFadeIn() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.opacity   = '0'
    el.style.transform = 'translateY(28px)'
    el.style.transition = 'opacity 900ms ease, transform 900ms ease'
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity   = '1'
          el.style.transform = 'translateY(0)'
          observer.unobserve(el)
        }
      },
      { threshold: 0.12 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return ref
}

/* ─── LAZY IMAGE ─────────────────────────────────────────────────────────── */
function LazyImg({ src, alt, className }) {
  const ref = useRef(null)
  const [loaded,   setLoaded]   = useState(false)
  const [visible,  setVisible]  = useState(false)

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
    <div ref={ref} className={`overflow-hidden bg-mist ${className}`}>
      {visible && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-1200 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  )
}

/* ─── HOTSPOT COMPONENT ──────────────────────────────────────────────────── */
function Hotspot({ x, y, name, price }) {
  const [open, setOpen] = useState(false)
  const isRight = x > 55

  return (
    <div
      className="absolute z-20 cursor-pointer"
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)' }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span className="relative flex h-4 w-4">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
        <span className="relative inline-flex rounded-full h-4 w-4 bg-white border border-ink/30" />
      </span>
      <div className={`
        absolute bottom-6 pointer-events-none
        ${isRight ? 'right-0' : 'left-0'}
        w-44 bg-white/95 backdrop-blur-sm border border-ink/10
        transition-all duration-300 ease-out
        ${open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}>
        <div className="px-4 py-3">
          <p className="font-sans text-[9px] tracking-widest2 text-ink uppercase mb-1">{name}</p>
          <p className="font-serif text-sm text-ink">{price}</p>
        </div>
      </div>
    </div>
  )
}

/* ─── PRODUCT CARD ───────────────────────────────────────────────────────── */
function ProductCard({ item, featured }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className={`group cursor-pointer ${featured ? 'col-span-2 row-span-2' : 'col-span-1'}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to={`/product/${item.id || item._id}`}>
        <div className="relative overflow-hidden bg-mist mb-4" style={{ paddingBottom: featured ? '120%' : '130%' }}>
          <img
            src={item.image}
            alt={item.producttitle || item.name}
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-800 ${hovered ? 'scale-105' : 'scale-100'}`}
          />
          {item.image1 && (
            <img
              src={item.image1}
              alt={item.producttitle || item.name}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${hovered ? 'opacity-100' : 'opacity-0'}`}
            />
          )}
          <div className={`
            absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap
            bg-white/95 backdrop-blur-sm px-5 py-2
            font-sans text-[8px] tracking-widest2 uppercase text-ink
            transition-all duration-300
            ${hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
          `}>
            Ver producto
          </div>
        </div>
        <div className="flex justify-between items-start">
          <div>
            <p className="font-sans text-[9px] tracking-widest2 uppercase text-ink leading-relaxed">
              {item.producttitle || item.name || 'Producto'}
            </p>
            {item.color && <p className="font-sans text-[8px] text-ash uppercase mt-0.5">{item.color}</p>}
          </div>
          <p className="font-serif text-sm text-ink ml-4 flex-shrink-0">{item.price}</p>
        </div>
      </Link>
    </div>
  )
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────── */
export default function ArtistPage() {
  const { slug }  = useParams()
  const dispatch  = useDispatch()
  const products  = useSelector(s => s.AppReducer.products)
  const [artist,   setArtist]   = useState(null)
  const [notFound, setNotFound] = useState(false)

  const f1 = useFadeIn(), f2 = useFadeIn(), f3 = useFadeIn()
  const f4 = useFadeIn(), f5 = useFadeIn(), f6 = useFadeIn()

  // Cargar datos del artista según el slug de la URL
  useEffect(() => {
    setArtist(null)
    setNotFound(false)
    axios.get(`${API}/artist/${slug}`)
      .then(r => setArtist(r.data))
      .catch(() => setNotFound(true))
  }, [slug])

  useEffect(() => { dispatch(getProduct('women1', 8)) }, [dispatch])

  // Helpers para obtener valor del artista o el default
  const g = (key) => (artist && artist[key]) ? artist[key] : DEFAULTS[key]
  const img = (idx) => (artist?.images?.[idx]) || null

  const hotspots = (artist?.hotspots?.length > 0) ? artist.hotspots : FALLBACK_HOTSPOTS

  // Nombre del artista para el hero
  const fullName = artist?.name || 'Natalia Gomez'
  const nameParts = fullName.trim().split(/\s+/)
  const heroFirst = nameParts[0]
  const heroLast  = nameParts.slice(1).join(' ') || ''

  if (notFound) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: '#fff' }}>
      <p style={{ fontFamily: 'serif', fontSize: '5rem', fontStyle: 'italic', fontWeight: 300, marginBottom: 16 }}>404</p>
      <p style={{ fontFamily: 'sans-serif', fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#888', marginBottom: 40 }}>Artista no encontrado</p>
      <Link to="/" style={{ fontFamily: 'sans-serif', fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#fff', border: '1px solid #444', padding: '12px 32px', textDecoration: 'none' }}>← Volver al inicio</Link>
    </div>
  )

  return (
    <div className="bg-chalk font-sans text-ink antialiased">

      {/* ── HERO FULL BLEED ──────────────────────────────────────────── */}
      {/* pt-[70px] deja espacio para el navbar global fijo */}
      <section className="relative h-screen w-full overflow-hidden bg-ink">
        {artist?.heroVideo ? (
          <video
            src={artist.heroVideo}
            autoPlay muted loop playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          /* Sin video: gradiente oscuro elegante */
          <div className="absolute inset-0 bg-gradient-to-br from-ink via-stone/10 to-ink" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
        <div className="absolute bottom-16 left-0 right-0 text-center text-white px-6">
          <p className="font-sans text-[9px] tracking-widest3 uppercase mb-4 opacity-80">
            {g('subtitle')}
          </p>
          <h1 className="font-serif text-[clamp(3rem,10vw,8rem)] font-light leading-none tracking-tight">
            {heroFirst}
          </h1>
          {heroLast && (
            <h1 className="font-serif text-[clamp(3rem,10vw,8rem)] font-light leading-none tracking-tight italic">
              {heroLast}
            </h1>
          )}
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60">
          <span className="font-sans text-[8px] tracking-widest3 uppercase">Scroll</span>
          <div className="w-px h-8 bg-white/40 animate-pulse" />
        </div>
      </section>

      {/* ── EDITORIAL STATEMENT ──────────────────────────────────────── */}
      <section ref={f1} className="max-w-2xl mx-auto text-center py-24 px-8">
        <p className="font-sans text-[9px] tracking-widest3 text-ash uppercase mb-8">
          {g('editorialLabel')}
        </p>
        <h2 className="font-serif text-[clamp(1.6rem,4vw,2.8rem)] font-light leading-snug text-ink mb-8">
          {g('editorialQuote').split('\n').map((line, i) => (
            <span key={i}>{i > 0 && <br />}{line}</span>
          ))}
        </h2>
        <p className="font-sans text-xs text-ash tracking-wide leading-loose max-w-sm mx-auto">
          {g('editorialDescription')}
        </p>
      </section>

      {/* ── ASYMMETRIC GRID I ─────────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-px bg-mist">
        {/* Large portrait left */}
        <div ref={f2} className="md:row-span-2">
          {img(0)
            ? <LazyImg src={img(0)} alt="editorial 1" className="h-[70vh] md:h-full w-full" />
            : <div className="h-[70vh] md:h-full w-full bg-mist flex items-center justify-center">
                <span className="text-ash text-xs tracking-widest2 uppercase">Foto 1</span>
              </div>
          }
        </div>
        {/* Small top right */}
        <div>
          {img(1)
            ? <LazyImg src={img(1)} alt="editorial 2" className="h-[35vh] w-full" />
            : <div className="h-[35vh] w-full bg-mist/70 flex items-center justify-center">
                <span className="text-ash text-xs tracking-widest2 uppercase">Foto 2</span>
              </div>
          }
        </div>
        {/* Text block bottom right */}
        <div className="bg-chalk flex flex-col justify-center px-12 py-14 h-[35vh]">
          <p className="font-sans text-[8px] tracking-widest3 text-ash uppercase mb-6">{g('section1Label')}</p>
          <p className="font-serif text-2xl font-light leading-relaxed text-ink mb-6">
            {g('section1Headline').split('\n').map((line, i) => (
              <span key={i}>{i > 0 && <br />}{line}</span>
            ))}
          </p>
          <p className="font-sans text-[10px] text-ash leading-loose tracking-wide">
            {g('section1Body').split('\n').map((line, i) => (
              <span key={i}>{i > 0 && <br />}{line}</span>
            ))}
          </p>
        </div>
      </section>

      {/* ── FULL WIDTH IMAGE + PULLQUOTE ────────────────────────────── */}
      <section ref={f3} className="relative">
        {img(2)
          ? <LazyImg src={img(2)} alt="editorial wide" className="h-[60vh] md:h-[80vh] w-full" />
          : <div className="h-[60vh] md:h-[80vh] w-full bg-mist flex items-center justify-center">
              <span className="text-ash text-xs tracking-widest2 uppercase">Foto 3 (full width)</span>
            </div>
        }
        <div className="absolute inset-0 flex items-end">
          <div className="bg-chalk/90 backdrop-blur-sm px-10 py-8 max-w-sm ml-8 mb-8 md:ml-16 md:mb-16">
            <p className="font-sans text-[8px] tracking-widest3 text-ash uppercase mb-4">{g('section2Label')}</p>
            <p className="font-serif text-xl font-light leading-relaxed text-ink">
              {g('section2Quote').split('\n').map((line, i) => (
                <span key={i}>{i > 0 && <br />}{line}</span>
              ))}
            </p>
          </div>
        </div>
      </section>

      {/* ── ASYMMETRIC GRID II ───────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-px bg-mist mt-px">
        <div className="md:col-span-2">
          {img(3)
            ? <LazyImg src={img(3)} alt="editorial 4" className="h-[50vh] w-full" />
            : <div className="h-[50vh] w-full bg-mist/60 flex items-center justify-center">
                <span className="text-ash text-xs tracking-widest2 uppercase">Foto 4 (wide)</span>
              </div>
          }
        </div>
        <div className="flex flex-col gap-px">
          {img(4)
            ? <LazyImg src={img(4)} alt="editorial 5" className="h-[25vh] w-full flex-1" />
            : <div className="h-[25vh] w-full bg-mist/40 flex items-center justify-center">
                <span className="text-ash text-xs tracking-widest2 uppercase">Foto 5</span>
              </div>
          }
          <div className="bg-ink flex flex-col justify-center items-center h-[25vh] px-8">
            <p className="font-serif text-white text-2xl italic font-light mb-2">
              {nameParts.map(w => w[0]).join('').toUpperCase()}
            </p>
            <p className="font-sans text-[8px] tracking-widest3 text-white/50 uppercase">2024</p>
          </div>
        </div>
      </section>

      {/* ── SHOP THE LOOK ─────────────────────────────────────────────── */}
      <section ref={f4} className="py-20 px-6 md:px-16 bg-chalk">
        <div className="flex flex-col md:flex-row items-start gap-16 max-w-6xl mx-auto">
          {/* Imagen con hotspots */}
          <div className="relative w-full md:w-3/5 flex-shrink-0">
            {artist?.shopImage
              ? <LazyImg src={artist.shopImage} alt="shop the look" className="h-[70vh] w-full" />
              : <div className="h-[70vh] w-full bg-mist flex items-center justify-center">
                  <span className="text-ash text-xs tracking-widest2 uppercase">Imagen Shop the Look</span>
                </div>
            }
            {hotspots.map((h, i) => (
              <Hotspot key={i} x={h.x} y={h.y} name={h.name} price={h.price} />
            ))}
            <div className="absolute top-6 left-6 bg-chalk/90 backdrop-blur-sm px-4 py-2">
              <p className="font-sans text-[8px] tracking-widest3 text-ash uppercase">
                Hover · Shop the Look
              </p>
            </div>
          </div>
          {/* Panel de texto */}
          <div className="flex flex-col justify-center py-8">
            <p className="font-sans text-[8px] tracking-widest3 text-ash uppercase mb-8">03 / The Look</p>
            <h3 className="font-serif text-[clamp(1.8rem,3vw,2.8rem)] font-light leading-tight text-ink mb-6">
              {g('shopTitle').split('\n').map((line, i) => (
                <span key={i}>{i > 0 && <br />}{line}</span>
              ))}
            </h3>
            <p className="font-sans text-xs text-ash leading-loose tracking-wide mb-10 max-w-xs">
              {g('shopDescription')}
            </p>
            <div className="space-y-4">
              {hotspots.map((h, i) => (
                <div key={i} className="flex items-center gap-4 border-b border-mist pb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-ink flex-shrink-0" />
                  <div>
                    <p className="font-sans text-[9px] tracking-widest2 uppercase text-ink">{h.name}</p>
                    <p className="font-serif text-sm text-ash">{h.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── LANDSCAPE FULL BLEED ─────────────────────────────────────── */}
      <section ref={f5}>
        <div className="relative">
          {img(5)
            ? <LazyImg src={img(5)} alt="landscape" className="h-[50vh] md:h-[65vh] w-full" />
            : <div className="h-[50vh] md:h-[65vh] w-full bg-ink" />
          }
          <div className="absolute inset-0 bg-ink/30 flex items-center justify-center">
            <p className="font-serif text-white text-[clamp(1.5rem,5vw,4rem)] font-light italic tracking-wide text-center px-6">
              {g('landscapeQuote').split('\n').map((line, i) => (
                <span key={i}>{i > 0 && <br />}{line}</span>
              ))}
            </p>
          </div>
        </div>
      </section>

      {/* ── PRODUCTS GRID ─────────────────────────────────────────────── */}
      <section ref={f6} className="bg-chalk py-24 px-6 md:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-baseline justify-between mb-16 gap-4">
            <div>
              <p className="font-sans text-[8px] tracking-widest3 text-ash uppercase mb-3">04 / Colección</p>
              <h3 className="font-serif text-[clamp(1.6rem,3vw,2.4rem)] font-light text-ink">Las prendas</h3>
            </div>
            <p className="font-sans text-[9px] tracking-widest2 text-ash uppercase">
              {products.length} piezas disponibles
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-12">
            {products.map((item, i) => (
              <ProductCard key={item._id || item.id} item={item} featured={i === 0 || i === 5} />
            ))}
          </div>
        </div>
      </section>

      {/* ── EDITORIAL FOOTER ─────────────────────────────────────────── */}
      <section className="bg-ink text-white py-20 px-8 text-center">
        <p className="font-sans text-[8px] tracking-widest3 uppercase text-white/40 mb-6">
          {g('footerLabel')}
        </p>
        <h2 className="font-serif text-[clamp(2rem,6vw,5rem)] font-light italic mb-8">
          {g('footerWord')}
        </h2>
        <Link
          to="/"
          className="inline-block font-sans text-[9px] tracking-widest3 uppercase border border-white/30 px-8 py-4 hover:bg-white hover:text-ink transition-all duration-300"
        >
          Volver al inicio
        </Link>
      </section>

    </div>
  )
}
