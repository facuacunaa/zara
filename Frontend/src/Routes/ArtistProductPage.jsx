import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import AddCart from '../Components/Product-Page-Component/AddCart'

const API = process.env.REACT_APP_BACKEND_URL || 'https://zara-backend.vercel.app'

export default function ArtistProductPage() {
  const { slug, productId } = useParams()
  const [data,     setData]     = useState(null)   // { product, artist, related }
  const [notFound, setNotFound] = useState(false)
  const [imgLoaded,setImgLoaded]= useState(false)
  const [zoom,     setZoom]     = useState(false)

  useEffect(() => {
    setData(null); setNotFound(false); setImgLoaded(false)
    axios.get(`${API}/artist/${slug}/shop-products/${productId}`)
      .then(r => setData(r.data))
      .catch(() => setNotFound(true))
  }, [slug, productId])

  /* ── 404 ── */
  if (notFound) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: '#fff' }}>
      <p style={{ fontFamily: 'serif', fontSize: '5rem', fontStyle: 'italic', fontWeight: 300, marginBottom: 16 }}>404</p>
      <p style={{ fontFamily: 'sans-serif', fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#888', marginBottom: 40 }}>Producto no encontrado</p>
      <Link to={`/${slug}`} style={{ fontFamily: 'sans-serif', fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#fff', border: '1px solid #444', padding: '12px 32px', textDecoration: 'none' }}>← Volver a la colección</Link>
    </div>
  )

  /* ── Loading ── */
  if (!data) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '2px solid #eee', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  const { product, artist, related } = data

  const cartData = {
    producttitle: product.name,
    image:        product.image,
    price:        product.price,
    pricenum:     parseFloat(product.price.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0,
    quantity:     1,
    color:        '',
    id:           product._id,
  }

  return (
    <div className="bg-chalk font-sans text-ink antialiased">

      {/* ── BREADCRUMB ──────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-6 pb-2">
        <nav className="flex items-center gap-2 font-sans text-[9px] tracking-widest2 uppercase text-ash">
          <Link to="/" className="hover:text-ink transition-colors">Inicio</Link>
          <span>/</span>
          <Link to={`/${slug}`} className="hover:text-ink transition-colors">{artist.name}</Link>
          <span>/</span>
          <span className="text-ink">{product.name}</span>
        </nav>
      </div>

      {/* ── MAIN LAYOUT ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start">

          {/* ── IMAGEN ── */}
          <div className="w-full md:w-3/5 flex-shrink-0">
            <div
              className={`relative overflow-hidden bg-mist cursor-zoom-in ${zoom ? 'cursor-zoom-out' : ''}`}
              style={{ paddingBottom: '130%' }}
              onClick={() => setZoom(z => !z)}
            >
              {product.image && (
                <img
                  src={product.image}
                  alt={product.name}
                  onLoad={() => setImgLoaded(true)}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-700
                    ${imgLoaded ? 'opacity-100' : 'opacity-0'}
                    ${zoom ? 'scale-150' : 'scale-100'}
                  `}
                />
              )}
              {!imgLoaded && (
                <div className="absolute inset-0 bg-mist animate-pulse" />
              )}
            </div>
          </div>

          {/* ── INFO ── */}
          <div className="w-full md:w-2/5 md:sticky md:top-24">

            {/* Artista */}
            <Link
              to={`/${slug}`}
              className="font-sans text-[8px] tracking-widest3 uppercase text-ash hover:text-ink transition-colors mb-6 block"
            >
              ← {artist.name}
            </Link>

            {/* Nombre del producto */}
            <h1 className="font-serif text-3xl md:text-4xl font-light leading-snug text-ink mb-3">
              {product.name}
            </h1>

            {/* Precio */}
            <p className="font-serif text-xl text-ash mb-8">{product.price}</p>

            {/* Separador */}
            <div className="w-8 h-px bg-mist mb-8" />

            {/* Descripción (placeholder editorial) */}
            <p className="font-sans text-[11px] text-ash leading-loose tracking-wide mb-10 max-w-xs">
              Pieza exclusiva de la colección de {artist.name}. Diseño pensado para quienes
              entienden que la moda es una conversación entre la forma y quien la lleva.
            </p>

            {/* ── ADD TO CART ── */}
            <div className="flex flex-col gap-3">
              <p className="font-sans text-[9px] tracking-widest2 uppercase text-ash">Seleccioná tu talla</p>
              <div className="flex items-center gap-4">
                <span className="font-serif text-lg text-ink">{product.price}</span>
                <AddCart data={cartData} />
              </div>
            </div>

            {/* Detalles del producto */}
            <div className="mt-10 border-t border-mist pt-8 space-y-3">
              <div className="flex justify-between font-sans text-[10px] tracking-wide uppercase">
                <span className="text-ash">Colección</span>
                <span className="text-ink">{artist.name}</span>
              </div>
              <div className="flex justify-between font-sans text-[10px] tracking-wide uppercase">
                <span className="text-ash">Precio</span>
                <span className="text-ink">{product.price}</span>
              </div>
            </div>

            {/* Volver */}
            <Link
              to={`/${slug}`}
              className="mt-10 inline-flex items-center gap-2 font-sans text-[9px] tracking-widest2 uppercase text-ash hover:text-ink transition-colors"
            >
              ← Ver toda la colección
            </Link>
          </div>
        </div>
      </div>

      {/* ── OTROS PRODUCTOS DEL LOOK ─────────────────────────────────── */}
      {related?.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 border-t border-mist">
          <p className="font-sans text-[8px] tracking-widest3 uppercase text-ash mb-10">
            Más prendas del look
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p, i) => {
              if (!p._id) return null
              const relCartData = {
                producttitle: p.name,
                image:        p.image,
                price:        p.price,
                pricenum:     parseFloat(p.price.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0,
                quantity:     1,
                color:        '',
                id:           p._id,
              }
              return (
                <div key={i} className="group">
                  <Link to={`/${slug}/producto/${p._id}`} className="block">
                    <div
                      className="relative overflow-hidden bg-mist mb-3"
                      style={{ paddingBottom: '130%' }}
                    >
                      {p.image && (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <p className="font-sans text-[9px] tracking-widest2 uppercase text-ink leading-relaxed truncate">{p.name}</p>
                    <p className="font-serif text-sm text-ash">{p.price}</p>
                  </Link>
                  <AddCart data={relCartData} />
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}
