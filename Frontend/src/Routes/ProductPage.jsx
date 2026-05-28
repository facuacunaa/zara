import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import styled from 'styled-components'
import Navbar from '../Components/Navbar'
import AddCart from '../Components/Product-Page-Component/AddCart'
import RelatedSections from '../Components/Product-Page-Component/RelatedSections'
import ProductDetailModal from '../Components/Product-Page-Component/ProductDetailModal'

const API = process.env.REACT_APP_BACKEND_URL || 'https://zara-backend.vercel.app'

const PRICE_RANGES = [
    { label: 'Todos',          min: 0,    max: Infinity },
    { label: 'Hasta $500',     min: 0,    max: 500      },
    { label: '$500 – $1.000',  min: 500,  max: 1000     },
    { label: '$1.000 – $2.500',min: 1000, max: 2500     },
    { label: 'Más de $2.500',  min: 2500, max: Infinity },
]

const SORT_OPTIONS = [
    { label: 'Más recientes',        value: 'recent'    },
    { label: 'Precio: menor a mayor',value: 'price-asc' },
    { label: 'Precio: mayor a menor',value: 'price-desc'},
    { label: 'A → Z',                value: 'az'        },
]

function parsePrice(str) {
    if (!str) return 0
    return parseFloat(String(str).replace(/[^0-9.,]/g, '').replace(',', '.')) || 0
}

/* ── PRODUCT MODAL ────────────────────────────────────────────────────────── */
function ProdModal({ product, onClose, allProducts, onSelect }) {
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
        pricenum:     parsePrice(product.price),
        quantity:     1,
        color:        '',
        id:           product._id || product.name,
    }

    return (
        <>
            <Overlay visible={visible} onClick={onClose} />
            <ModalPanel visible={visible}>
                <ModalHead>
                    <ModalArtist>{product.artistName || '—'}</ModalArtist>
                    <CloseBtn onClick={onClose}>✕ Cerrar</CloseBtn>
                </ModalHead>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    <ModalImg>
                        {product.image && (
                            <img src={product.image} alt={product.name}
                                onLoad={() => setImgLoaded(true)}
                                style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity .7s' }} />
                        )}
                        {!imgLoaded && <div className="skeleton" />}
                    </ModalImg>
                    <ModalBody>
                        <ModalName>{product.name}</ModalName>
                        <ModalPrice>{product.price}</ModalPrice>
                        {product.description && (
                            <ModalDesc>{product.description}</ModalDesc>
                        )}
                        <AddCart data={cartData} />
                    </ModalBody>
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

/* ── MAIN COMPONENT ───────────────────────────────────────────────────────── */
export default function ProductPage() {
    const [products,      setProducts]      = useState([])
    const [loading,       setLoading]       = useState(true)
    const [selectedProd,  setSelectedProd]  = useState(null)
    const [filtersOpen,   setFiltersOpen]   = useState(false)

    // Filtros
    const [activeArtists, setActiveArtists] = useState([])   // [] = todos
    const [priceRange,    setPriceRange]    = useState(0)    // index de PRICE_RANGES
    const [sortBy,        setSortBy]        = useState('recent')
    const [search,        setSearch]        = useState('')

    useEffect(() => {
        axios.get(`${API}/artist/all-products`)
            .then(r => setProducts(r.data || []))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    // Lista de artistas únicos
    const artists = useMemo(() => {
        const names = [...new Set(products.map(p => p.artistName).filter(Boolean))]
        return names.sort()
    }, [products])

    const toggleArtist = (name) => {
        setActiveArtists(prev =>
            prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]
        )
    }

    // Productos filtrados y ordenados
    const filtered = useMemo(() => {
        const range = PRICE_RANGES[priceRange]
        let result = products.filter(p => {
            const price  = parsePrice(p.price)
            const inPrice = price >= range.min && price <= range.max
            const inArtist = activeArtists.length === 0 || activeArtists.includes(p.artistName)
            const inSearch = !search || (p.name || '').toLowerCase().includes(search.toLowerCase())
            return inPrice && inArtist && inSearch
        })
        if (sortBy === 'price-asc')  result = [...result].sort((a,b) => parsePrice(a.price) - parsePrice(b.price))
        if (sortBy === 'price-desc') result = [...result].sort((a,b) => parsePrice(b.price) - parsePrice(a.price))
        if (sortBy === 'az')         result = [...result].sort((a,b) => (a.name||'').localeCompare(b.name||''))
        return result
    }, [products, activeArtists, priceRange, sortBy, search])

    const clearFilters = () => {
        setActiveArtists([]); setPriceRange(0); setSortBy('recent'); setSearch('')
    }
    const hasFilters = activeArtists.length > 0 || priceRange !== 0 || sortBy !== 'recent' || search !== ''

    return (
        <PageWrap>
            <Navbar />

            {/* ── HEADER ──────────────────────────────────────────────────── */}
            <PageHeader>
                <HeaderInner>
                    <HeaderLeft>
                        <PageTitle>Tienda</PageTitle>
                        <PageEyebrow>— La Casita del Hornero</PageEyebrow>
                    </HeaderLeft>
                    <HeaderRight>
                        <SearchInput
                            type="text"
                            placeholder="Buscar producto..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <MobileFilterBtn onClick={() => setFiltersOpen(o => !o)}>
                            {filtersOpen ? '✕ Cerrar' : '⊟ Filtros'}
                            {hasFilters && <FilterDot />}
                        </MobileFilterBtn>
                    </HeaderRight>
                </HeaderInner>
            </PageHeader>

            <ShopLayout>
                {/* ── SIDEBAR FILTROS ─────────────────────────────────────── */}
                <Sidebar open={filtersOpen}>
                    <FilterBlock>
                        <FilterTitle>Ordenar</FilterTitle>
                        {SORT_OPTIONS.map(opt => (
                            <FilterOption
                                key={opt.value}
                                active={sortBy === opt.value}
                                onClick={() => setSortBy(opt.value)}
                            >
                                {opt.label}
                            </FilterOption>
                        ))}
                    </FilterBlock>

                    <FilterBlock>
                        <FilterTitle>Precio</FilterTitle>
                        {PRICE_RANGES.map((r, i) => (
                            <FilterOption
                                key={i}
                                active={priceRange === i}
                                onClick={() => setPriceRange(i)}
                            >
                                {r.label}
                            </FilterOption>
                        ))}
                    </FilterBlock>

                    {artists.length > 0 && (
                        <FilterBlock>
                            <FilterTitle>Artista</FilterTitle>
                            {artists.map(name => (
                                <FilterCheckbox
                                    key={name}
                                    active={activeArtists.includes(name)}
                                    onClick={() => toggleArtist(name)}
                                >
                                    <CheckboxBox active={activeArtists.includes(name)}>
                                        {activeArtists.includes(name) && '✓'}
                                    </CheckboxBox>
                                    {name}
                                </FilterCheckbox>
                            ))}
                        </FilterBlock>
                    )}

                    {hasFilters && (
                        <ClearBtn onClick={clearFilters}>Limpiar filtros</ClearBtn>
                    )}
                </Sidebar>

                {/* ── GRID ────────────────────────────────────────────────── */}
                <GridArea>
                    <GridMeta>
                        <ResultCount>
                            {filtered.length} {filtered.length === 1 ? 'producto' : 'productos'}
                        </ResultCount>
                        <SortSelect value={sortBy} onChange={e => setSortBy(e.target.value)}>
                            {SORT_OPTIONS.map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </SortSelect>
                    </GridMeta>

                    {loading ? (
                        <SkeletonGrid>
                            {Array.from({ length: 6 }).map((_, i) => (
                                <SkeletonCard key={i} $tall={i % 3 === 0}>
                                    <SkeletonImg $tall={i % 3 === 0} />
                                </SkeletonCard>
                            ))}
                        </SkeletonGrid>
                    ) : filtered.length === 0 ? (
                        <Empty>
                            <p>No hay productos con estos filtros.</p>
                            <ClearBtn onClick={clearFilters}>Limpiar filtros</ClearBtn>
                        </Empty>
                    ) : (
                        <GalleryGrid>
                            {filtered.map((p, i) => (
                                <GalleryItem key={p._id || i} $tall={i % 3 === 0} onClick={() => setSelectedProd(p)}>
                                    <GalleryImg $tall={i % 3 === 0}>
                                        {p.image
                                            ? <img src={p.image} alt={p.name} loading="lazy" />
                                            : <GalleryNoImg>{p.name?.charAt(0)}</GalleryNoImg>
                                        }
                                        <GalleryOverlay>
                                            <GalleryOverlayTop>
                                                <GalleryOverlayNum>0{i + 1}</GalleryOverlayNum>
                                                {p.artistName && <GalleryArtistBadge>{p.artistName}</GalleryArtistBadge>}
                                            </GalleryOverlayTop>
                                            <GalleryOverlayInfo>
                                                <GalleryOverlayName>{p.name}</GalleryOverlayName>
                                                <GalleryOverlayPrice>{p.price}</GalleryOverlayPrice>
                                            </GalleryOverlayInfo>
                                            <GalleryOverlayBtn>Ver detalle</GalleryOverlayBtn>
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
                    )}
                </GridArea>
            </ShopLayout>

            {selectedProd && (
                <ProductDetailModal
                    product={selectedProd}
                    onClose={() => setSelectedProd(null)}
                    allProducts={products}
                    onSelect={setSelectedProd}
                />
            )}
        </PageWrap>
    )
}

/* ── STYLES ─────────────────────────────────────────────────────────────────── */
const PageWrap = styled.div`
    min-height: 100vh;
    background: #ead1b0;
    @media (min-width: 769px) { background: #fff; }
`

const PageHeader = styled.div`
    background: rgba(234,209,176,0.97);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid #D8C8B0;
    padding: 72px 40px 12px;
    position: sticky;
    top: 0;
    z-index: 50;
    @media (min-width: 769px) {
        background: rgba(255,255,255,0.97);
        border-bottom: 1px solid #eee;
    }
    @media (max-width: 768px) { padding: 68px 16px 10px; }
`

const HeaderInner = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    @media (max-width: 600px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }
`

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 14px;
`

const PageEyebrow = styled.p`
    font-size: 8px;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: #ccc;
    margin: 0;
`

const PageTitle = styled.h1`
    font-family: 'Barlow Semi Condensed', 'Arial Narrow', sans-serif;
    font-size: clamp(1rem, 2vw, 1.35rem);
    font-weight: 500;
    font-style: normal;
    color: #0a0a0a;
    margin: 0;
    line-height: 1;
`

const HeaderRight = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    @media (max-width: 600px) {
        width: 100%;
    }
`

const SearchInput = styled.input`
    border: 1px solid #D8C8B0;
    background: rgba(255,255,255,0.6);
    padding: 8px 14px;
    border-radius: 100px;
    font-size: 12px;
    letter-spacing: 0.05em;
    color: #0a0a0a;
    outline: none;
    width: 200px;
    transition: border-color 0.2s;
    &::placeholder { color: #bbb; }
    &:focus { border-color: #0a0a0a; }
    @media (max-width: 600px) { flex: 1; width: auto; }
`

const MobileFilterBtn = styled.button`
    display: none;
    position: relative;
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    background: ${p => p.$active ? '#1A3D2B' : 'transparent'};
    color: ${p => p.$active ? '#fff' : '#555'};
    border: 1px solid ${p => p.$active ? '#1A3D2B' : '#D8C8B0'};
    padding: 8px 18px;
    border-radius: 100px;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;
    @media (max-width: 900px) { display: flex; align-items: center; gap: 6px; }
`

const FilterDot = styled.span`
    width: 5px; height: 5px;
    background: currentColor;
    border-radius: 50%;
    flex-shrink: 0;
`

const ShopLayout = styled.div`
    display: flex;
    align-items: flex-start;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 40px 80px;
    @media (max-width: 900px) { flex-direction: column; padding: 0 16px 60px; }
    @media (max-width: 600px) { padding: 0 0 80px; }
`

/* ── SIDEBAR ────────────────────────────────────────────────────────────── */
const Sidebar = styled.aside`
    width: 210px;
    min-width: 210px;
    padding-top: 36px;
    padding-right: 36px;
    position: sticky;
    top: 108px;

    @media (max-width: 900px) {
        width: 100%;
        min-width: unset;
        padding: 0;
        position: static;
        overflow: hidden;
        max-height: ${p => p.open ? '600px' : '0'};
        transition: max-height 0.35s ease;
        border-bottom: ${p => p.open ? '1px solid #D8C8B0' : 'none'};
        margin-bottom: ${p => p.open ? '8px' : '0'};
        padding-bottom: ${p => p.open ? '20px' : '0'};
    }
`

const FilterBlock = styled.div`
    margin-bottom: 32px;
`

const FilterTitle = styled.p`
    font-size: 9px;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: #999;
    margin: 0 0 14px;
`

const FilterOption = styled.div`
    font-size: 12px;
    letter-spacing: 0.04em;
    color: ${p => p.active ? '#0a0a0a' : '#aaa'};
    cursor: pointer;
    padding: 7px 0 7px 10px;
    transition: color 0.15s;
    border-left: 2px solid ${p => p.active ? '#898635' : 'transparent'};
    &:hover { color: #0a0a0a; }
    @media (max-width: 900px) { padding: 10px 0 10px 10px; }
`

const FilterCheckbox = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;
    color: ${p => p.active ? '#0a0a0a' : '#888'};
    cursor: pointer;
    padding: 7px 0;
    transition: color 0.15s;
    &:hover { color: #0a0a0a; }
    @media (max-width: 900px) { padding: 10px 0; }
`

const CheckboxBox = styled.span`
    width: 15px; height: 15px;
    border: 1px solid ${p => p.active ? '#898635' : '#D8C8B0'};
    display: flex; align-items: center; justify-content: center;
    font-size: 9px;
    border-radius: 4px;
    background: ${p => p.active ? '#898635' : 'transparent'};
    color: #fff;
    flex-shrink: 0;
    transition: all 0.15s;
`

const ClearBtn = styled.button`
    font-size: 9px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: #aaa;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    text-decoration: underline;
    transition: color 0.15s;
    &:hover { color: #0a0a0a; }
`

/* ── GRID AREA ───────────────────────────────────────────────────────────── */
const GridArea = styled.div`
    flex: 1;
    min-width: 0;
    padding-top: 36px;
    @media (max-width: 900px) { width: 100%; }
    @media (max-width: 600px) {
        width: 100%;
        padding-top: 0;
        overflow: hidden;
    }
`

const GridMeta = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    padding-bottom: 14px;
    border-bottom: 1px solid #D8C8B0;
    @media (max-width: 600px) { padding: 14px 16px; margin-bottom: 0; }
`

const ResultCount = styled.p`
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #aaa;
    margin: 0;
`

const SortSelect = styled.select`
    font-size: 10px;
    letter-spacing: 0.1em;
    color: #555;
    border: 1px solid #D8C8B0;
    background: rgba(255,255,255,0.6);
    padding: 6px 12px;
    border-radius: 100px;
    outline: none;
    cursor: pointer;
    max-width: 160px;
    @media (max-width: 500px) { display: none; }
`

/* ── EDITORIAL GALLERY ──────────────────────────────────────────────────── */
const GalleryGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2px;
    @media (min-width: 769px) {
        grid-template-columns: repeat(4, 1fr);
        gap: 0;
    }
    @media (max-width: 600px) { grid-template-columns: repeat(2, 1fr); gap: 2px; }
`

const GalleryItem = styled.div`
    cursor: pointer;
    &:hover img { transform: scale(1.04); }
    @media (min-width: 769px) {
        border-radius: 0;
        background: #fff;
    }
`

const GalleryImg = styled.div`
    position: relative;
    overflow: hidden;
    background: #d4c4a8;
    padding-bottom: 110%;

    img {
        position: absolute; inset: 0;
        width: 100%; height: 100%;
        object-fit: cover;
        transition: transform 1.1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

    @media (max-width: 600px) {
        padding-bottom: 125%;
    }
`

const GalleryNoImg = styled.div`
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(3rem, 10vw, 6rem);
    font-weight: 500; font-style: normal;
    color: rgba(0,0,0,0.08);
`

const GalleryOverlay = styled.div`
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.10) 50%, transparent 100%);
    display: flex; flex-direction: column;
    justify-content: space-between;
    padding: 20px 24px;
    opacity: 0; transition: opacity 0.4s ease;
    ${GalleryItem}:hover & { opacity: 1; }

    @media (max-width: 600px) {
        opacity: 1;
        padding: 12px;
        background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%);
    }
`

const GalleryOverlayTop = styled.div`
    display: flex; align-items: flex-start; justify-content: space-between;
    @media (max-width: 600px) { display: none; }
`

const GalleryOverlayNum = styled.span`
    font-family: 'DM Sans', sans-serif;
    font-size: 9px; letter-spacing: 0.4em;
    color: rgba(255,255,255,0.4); text-transform: uppercase;
`

const GalleryArtistBadge = styled.span`
    font-family: 'DM Sans', sans-serif;
    font-size: 7px; letter-spacing: 0.25em;
    text-transform: uppercase; color: rgba(255,255,255,0.6);
    background: rgba(10,10,10,0.35);
    backdrop-filter: blur(4px);
    padding: 3px 8px;
`

const GalleryOverlayInfo = styled.div`
    flex: 1; display: flex; flex-direction: column; justify-content: flex-end; gap: 4px;
`

const GalleryOverlayName = styled.p`
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(1.1rem, 2.2vw, 1.8rem);
    font-weight: 500; font-style: normal;
    color: #fff; margin: 0; line-height: 1.2;
    text-transform: capitalize;

    @media (max-width: 600px) {
        font-size: 0.82rem;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
`

const GalleryOverlayPrice = styled.p`
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; letter-spacing: 0.15em;
    color: rgba(255,255,255,0.65); margin: 0;
    @media (max-width: 600px) { font-size: 9px; letter-spacing: 0.08em; }
`

const GalleryOverlayBtn = styled.span`
    display: inline-block; margin-top: 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 9px; letter-spacing: 0.4em;
    text-transform: uppercase; color: #fff;
    border-bottom: 1px solid rgba(255,255,255,0.45);
    padding-bottom: 3px;
    @media (max-width: 600px) { display: none; }
`

const GalleryCaption = styled.div`
    display: flex; align-items: baseline; gap: 10px;
    padding: 12px 4px 20px;
    @media (max-width: 600px) { display: none; }
`

const GalleryCaptionNum = styled.span`
    font-family: 'DM Sans', sans-serif;
    font-size: 9px; letter-spacing: 0.3em;
    color: #b0a090; flex-shrink: 0;
`

const GalleryCaptionText = styled.div``

const GalleryCaptionName = styled.p`
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(0.78rem, 1.6vw, 1.1rem);
    font-weight: 500; font-style: normal;
    color: #1a1a1a; margin: 0 0 2px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    text-transform: capitalize;
`

const GalleryCaptionPrice = styled.p`
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; letter-spacing: 0.1em;
    color: #898635; margin: 0;
`

/* ── SKELETON ─────────────────────────────────────────────────────────────── */
const skeletonAnim = `
    @keyframes skeletonShimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
    }
`

const SkeletonGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    @media (max-width: 600px) { gap: 0; }
`

const SkeletonCard = styled.div`
    background: #d4c4a8;
    padding-bottom: 110%;
    position: relative;
    ${skeletonAnim}
    &::after {
        content: '';
        position: absolute; inset: 0;
        background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%);
        background-size: 200% 100%;
        animation: skeletonShimmer 1.6s ease-in-out infinite;
    }
`

const SkeletonImg = styled.div``

const SkeletonLine = styled.div`
    height: 9px;
    width: ${p => p.w || '80%'};
    background: #d4c4a8;
    border-radius: 2px;
    margin: 12px 12px 6px;
`

/* ── EMPTY STATE ───────────────────────────────────────────────────────────── */
const Empty = styled.div`
    text-align: center;
    padding: 80px 24px;

    p {
        font-family: 'Cormorant Garamond', Georgia, serif;
        font-size: 20px;
        font-weight: 500;
        font-style: normal;
        color: #bbb;
        margin: 0 0 24px;
    }
`

/* ── MODAL ─────────────────────────────────────────────────────────────────── */
const Overlay = styled.div`
    position: fixed; inset: 0;
    background: rgba(10,30,20,0.6);
    z-index: 100;
    opacity: ${p => p.visible ? 1 : 0};
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
    transform: ${p => p.visible ? 'translateX(0)' : 'translateX(100%)'};
    transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
`

const ModalHead = styled.div`
    display: flex; align-items: center; justify-content: space-between;
    padding: 22px 28px;
    border-bottom: 1px solid #D8C8B0;
    flex-shrink: 0;
`

const ModalArtist = styled.span`
    font-family: 'DM Sans', sans-serif;
    font-size: 8px;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: #aaa;
`

const CloseBtn = styled.button`
    background: none; border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 8px;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: #aaa;
    &:hover { color: #0a0a0a; }
`

const ModalImg = styled.div`
    position: relative;
    background: #E8DCC8;
    padding-bottom: 110%;

    img {
        position: absolute; inset: 0;
        width: 100%; height: 100%;
        object-fit: cover;
    }

    .skeleton {
        position: absolute; inset: 0;
        background: #E8DCC8;
    }
`

const ModalBody = styled.div`
    padding: 32px 28px;
`

const ModalName = styled.p`
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 22px; font-weight: 500; font-style: normal;
    color: #1a1a1a; margin: 0 0 8px;
    text-transform: capitalize;
`

const ModalPrice = styled.p`
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; letter-spacing: 0.1em;
    color: #999; margin: 0 0 20px;
`

const ModalDesc = styled.p`
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; line-height: 1.75;
    color: #666; margin: 0 0 28px;
    white-space: pre-line;
`
