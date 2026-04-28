import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getProduct } from '../Redux/App/action'
import { Link } from 'react-router-dom'

/* ─── EDITORIAL DATA ─────────────────────────────────────────────────────── */

const IMAGES = {
  hero:   'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1600&q=90&fit=crop',
  wide1:  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=90&fit=crop',
  port1:  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&q=90&fit=crop',
  port2:  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=900&q=90&fit=crop',
  port3:  'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=900&q=90&fit=crop',
  wide2:  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=90&fit=crop',
  shop:   'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=1400&q=90&fit=crop',
  port4:  'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=900&q=90&fit=crop',
  land1:  'https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=1400&q=90&fit=crop',
}

const HOTSPOTS = [
  { id: 1, x: 28, y: 38, name: 'OVERSIZE COAT', price: '$249' },
  { id: 2, x: 55, y: 62, name: 'WIDE LEG TROUSERS', price: '$89' },
  { id: 3, x: 72, y: 44, name: 'SILK BLOUSE', price: '$119' },
]

/* ─── FADE-IN HOOK ───────────────────────────────────────────────────────── */

function useFadeIn() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.opacity = '0'
    el.style.transform = 'translateY(28px)'
    el.style.transition = 'opacity 900ms ease, transform 900ms ease'
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1'
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
      {/* Pulsing dot */}
      <span className="relative flex h-4 w-4">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
        <span className="relative inline-flex rounded-full h-4 w-4 bg-white border border-ink/30" />
      </span>

      {/* Mini card */}
      <div
        className={`
          absolute bottom-6 pointer-events-none
          ${isRight ? 'right-0' : 'left-0'}
          w-44 bg-white/95 backdrop-blur-sm border border-ink/10
          transition-all duration-300 ease-out
          ${open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
        `}
      >
        <div className="px-4 py-3">
          <p className="font-sans text-[9px] tracking-widest2 text-ink uppercase mb-1">{name}</p>
          <p className="font-serif text-sm text-ink">{price}</p>
        </div>
      </div>
    </div>
  )
}

/* ─── LAZY IMAGE ─────────────────────────────────────────────────────────── */

function LazyImg({ src, alt, className }) {
  const ref = useRef(null)
  const [loaded, setLoaded] = useState(false)
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

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────── */

export default function NataliaGomez() {
  const dispatch  = useDispatch()
  const products  = useSelector(s => s.AppReducer.products)
  const [scrolled, setScrolled] = useState(false)
  const [heroLoaded, setHeroLoaded] = useState(false)

  // Fade refs
  const f1 = useFadeIn(), f2 = useFadeIn(), f3 = useFadeIn()
  const f4 = useFadeIn(), f5 = useFadeIn(), f6 = useFadeIn()

  useEffect(() => { dispatch(getProduct('women1', 8)) }, [dispatch])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div className="bg-chalk font-sans text-ink antialiased">

      {/* ── FLOATING NAV ─────────────────────────────────────────────── */}
      <nav className={`
        fixed top-0 left-0 right-0 z-50 flex items-center justify-between
        px-8 py-5 transition-all duration-500
        ${scrolled ? 'bg-chalk/95 backdrop-blur-md shadow-sm' : 'bg-transparent'}
      `}>
        <Link to="/" className={`font-sans text-[10px] tracking-widest3 uppercase ${scrolled ? 'text-ink' : 'text-white'}`}>
          ← VOLVER
        </Link>
        <span className={`font-serif text-base italic ${scrolled ? 'text-ink' : 'text-white'}`}>
          Natalia Gomez
        </span>
        <span className={`font-sans text-[10px] tracking-widest2 uppercase ${scrolled ? 'text-ink' : 'text-white'}`}>
          COLECCIÓN
        </span>
      </nav>

      {/* ── HERO FULL BLEED ──────────────────────────────────────────── */}
      <section className="relative h-screen w-full overflow-hidden">
        <img
          src={IMAGES.hero}
          alt="Natalia Gomez hero"
          onLoad={() => setHeroLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-1200 ${heroLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50" />
        <div className="absolute bottom-16 left-0 right-0 text-center text-white px-6">
          <p className="font-sans text-[9px] tracking-widest3 uppercase mb-4 opacity-80">
            Colección Exclusiva · 2024
          </p>
          <h1 className="font-serif text-[clamp(3rem,10vw,8rem)] font-light leading-none tracking-tight">
            Natalia
          </h1>
          <h1 className="font-serif text-[clamp(3rem,10vw,8rem)] font-light leading-none tracking-tight italic">
            Gomez
          </h1>
        </div>
        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60">
          <span className="font-sans text-[8px] tracking-widest3 uppercase">Scroll</span>
          <div className="w-px h-8 bg-white/40 animate-pulse" />
        </div>
      </section>

      {/* ── EDITORIAL STATEMENT ──────────────────────────────────────── */}
      <section ref={f1} className="max-w-2xl mx-auto text-center py-24 px-8">
        <p className="font-sans text-[9px] tracking-widest3 text-ash uppercase mb-8">
          — La colección
        </p>
        <h2 className="font-serif text-[clamp(1.6rem,4vw,2.8rem)] font-light leading-snug text-ink mb-8">
          "Una conversación entre <em>la forma</em><br className="hidden md:block" />
          y el silencio que la rodea."
        </h2>
        <p className="font-sans text-xs text-ash tracking-wide leading-loose max-w-sm mx-auto">
          Tejidos naturales. Siluetas sin género. Una paleta que respira con quien la lleva.
        </p>
      </section>

      {/* ── ASYMMETRIC GRID I ─────────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-px bg-mist">

        {/* Large portrait left */}
        <div ref={f2} className="md:row-span-2">
          <LazyImg src={IMAGES.port1} alt="editorial 1" className="h-[70vh] md:h-full w-full" />
        </div>

        {/* Small top right */}
        <div>
          <LazyImg src={IMAGES.port2} alt="editorial 2" className="h-[35vh] w-full" />
        </div>

        {/* Text block bottom right */}
        <div className="bg-chalk flex flex-col justify-center px-12 py-14 h-[35vh]">
          <p className="font-sans text-[8px] tracking-widest3 text-ash uppercase mb-6">01 / Estructura</p>
          <p className="font-serif text-2xl font-light leading-relaxed text-ink mb-6">
            El cuerpo como<br /><em>arquitectura.</em>
          </p>
          <p className="font-sans text-[10px] text-ash leading-loose tracking-wide">
            Cada costura es una decisión.<br />Cada doblez, una intención.
          </p>
        </div>
      </section>

      {/* ── FULL WIDTH IMAGE + PULLQUOTE ────────────────────────────── */}
      <section ref={f3} className="relative">
        <LazyImg src={IMAGES.wide1} alt="editorial wide" className="h-[60vh] md:h-[80vh] w-full" />
        <div className="absolute inset-0 flex items-end">
          <div className="bg-chalk/90 backdrop-blur-sm px-10 py-8 max-w-sm ml-8 mb-8 md:ml-16 md:mb-16">
            <p className="font-sans text-[8px] tracking-widest3 text-ash uppercase mb-4">02 / Movimiento</p>
            <p className="font-serif text-xl font-light leading-relaxed text-ink">
              "Nada se impone.<br /><em>Todo fluye.</em>"
            </p>
          </div>
        </div>
      </section>

      {/* ── ASYMMETRIC GRID II ───────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-px bg-mist mt-px">
        <div className="md:col-span-2">
          <LazyImg src={IMAGES.wide2} alt="editorial 4" className="h-[50vh] w-full" />
        </div>
        <div className="flex flex-col gap-px">
          <LazyImg src={IMAGES.port3} alt="editorial 5" className="h-[25vh] w-full flex-1" />
          <div className="bg-ink flex flex-col justify-center items-center h-[25vh] px-8">
            <p className="font-serif text-white text-2xl italic font-light mb-2">N.G.</p>
            <p className="font-sans text-[8px] tracking-widest3 text-white/50 uppercase">2024</p>
          </div>
        </div>
      </section>

      {/* ── SHOP THE LOOK ─────────────────────────────────────────────── */}
      <section ref={f4} className="py-20 px-6 md:px-16 bg-chalk">
        <div className="flex flex-col md:flex-row items-start gap-16 max-w-6xl mx-auto">

          {/* Image with hotspots */}
          <div className="relative w-full md:w-3/5 flex-shrink-0">
            <LazyImg src={IMAGES.shop} alt="shop the look" className="h-[70vh] w-full" />
            {HOTSPOTS.map(h => (
              <Hotspot key={h.id} x={h.x} y={h.y} name={h.name} price={h.price} />
            ))}
            <div className="absolute top-6 left-6 bg-chalk/90 backdrop-blur-sm px-4 py-2">
              <p className="font-sans text-[8px] tracking-widest3 text-ash uppercase">
                Hover · Shop the Look
              </p>
            </div>
          </div>

          {/* Text panel */}
          <div className="flex flex-col justify-center py-8">
            <p className="font-sans text-[8px] tracking-widest3 text-ash uppercase mb-8">
              03 / The Look
            </p>
            <h3 className="font-serif text-[clamp(1.8rem,3vw,2.8rem)] font-light leading-tight text-ink mb-6">
              Vestite<br /><em>la historia.</em>
            </h3>
            <p className="font-sans text-xs text-ash leading-loose tracking-wide mb-10 max-w-xs">
              Cada punto sobre la imagen es una prenda de la colección.
              Explorá posando el cursor para descubrirla.
            </p>
            <div className="space-y-4">
              {HOTSPOTS.map(h => (
                <div key={h.id} className="flex items-center gap-4 border-b border-mist pb-4">
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
          <LazyImg src={IMAGES.land1} alt="landscape" className="h-[50vh] md:h-[65vh] w-full" />
          <div className="absolute inset-0 bg-ink/30 flex items-center justify-center">
            <p className="font-serif text-white text-[clamp(1.5rem,5vw,4rem)] font-light italic tracking-wide text-center px-6">
              "La elegancia es<br />una forma de decir adiós."
            </p>
          </div>
        </div>
      </section>

      {/* ── PRODUCTS GRID ─────────────────────────────────────────────── */}
      <section ref={f6} className="bg-chalk py-24 px-6 md:px-16">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="flex flex-col md:flex-row items-baseline justify-between mb-16 gap-4">
            <div>
              <p className="font-sans text-[8px] tracking-widest3 text-ash uppercase mb-3">04 / Colección</p>
              <h3 className="font-serif text-[clamp(1.6rem,3vw,2.4rem)] font-light text-ink">
                Las prendas
              </h3>
            </div>
            <p className="font-sans text-[9px] tracking-widest2 text-ash uppercase">
              {products.length} piezas disponibles
            </p>
          </div>

          {/* Asymmetric product grid */}
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
          Natalia Gomez × Zara · Colección Exclusiva 2024
        </p>
        <h2 className="font-serif text-[clamp(2rem,6vw,5rem)] font-light italic mb-8">
          Fin.
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
        {/* Image */}
        <div className="relative overflow-hidden bg-mist mb-4" style={{ paddingBottom: featured ? '120%' : '130%' }}>
          <img
            src={item.image}
            alt={item.producttitle || item.name}
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-800 ${hovered ? 'scale-105' : 'scale-100'}`}
          />
          {/* Hover overlay */}
          {item.image1 && (
            <img
              src={item.image1}
              alt={item.producttitle || item.name}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${hovered ? 'opacity-100' : 'opacity-0'}`}
            />
          )}
          {/* Quick add pill */}
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

        {/* Info */}
        <div className="flex justify-between items-start">
          <div>
            <p className="font-sans text-[9px] tracking-widest2 uppercase text-ink leading-relaxed">
              {item.producttitle || item.name || 'Producto'}
            </p>
            {item.color && (
              <p className="font-sans text-[8px] text-ash uppercase mt-0.5">{item.color}</p>
            )}
          </div>
          <p className="font-serif text-sm text-ink ml-4 flex-shrink-0">{item.price}</p>
        </div>
      </Link>
    </div>
  )
}
