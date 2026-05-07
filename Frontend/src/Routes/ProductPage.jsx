import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import styled from 'styled-components'
import Navbar from '../Components/Navbar'
import AddCart from '../Components/Product-Page-Component/AddCart'

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
function ProdModal({ product, onClose }) {
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
                        <AddCart data={cartData} />
                    </ModalBody>
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
                        <PageEyebrow>— La Casita del Hornero</PageEyebrow>
                        <PageTitle>Tienda</PageTitle>
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
                            {Array.from({ length: 8 }).map((_, i) => (
                                <SkeletonCard key={i}>
                                    <SkeletonImg />
                                    <SkeletonLine w="60%" />
                                    <SkeletonLine w="35%" />
                                </SkeletonCard>
                            ))}
                        </SkeletonGrid>
                    ) : filtered.length === 0 ? (
                        <Empty>
                            <p>No hay productos con estos filtros.</p>
                            <ClearBtn onClick={clearFilters}>Limpiar filtros</ClearBtn>
                        </Empty>
                    ) : (
                        <ProductGrid>
                            {filtered.map((p, i) => (
                                <ProductCard key={p._id || i} onClick={() => setSelectedProd(p)}>
                                    <CardMedia>
                                        {p.image
                                            ? <img src={p.image} alt={p.name} loading="lazy" />
                                            : <CardNoImg>{p.name?.charAt(0)}</CardNoImg>
                                        }
                                        <CardOverlay>
                                            <span>Ver detalle</span>
                                        </CardOverlay>
                                        {p.artistName && <ArtistBadge>{p.artistName}</ArtistBadge>}
                                    </CardMedia>
                                    <CardBody>
                                        <CardName>{p.name}</CardName>
                                        <CardPrice>{p.price}</CardPrice>
                                    </CardBody>
                                </ProductCard>
                            ))}
                        </ProductGrid>
                    )}
                </GridArea>
            </ShopLayout>

            {selectedProd && (
                <ProdModal product={selectedProd} onClose={() => setSelectedProd(null)} />
            )}
        </PageWrap>
    )
}

/* ── STYLES ─────────────────────────────────────────────────────────────────── */
const PageWrap = styled.div`
    min-height: 100vh;
    background: #fafaf8;
`

const PageHeader = styled.div`
    background: #fafaf8;
    border-bottom: 1px solid #e8e8e4;
    padding: 120px 40px 32px;
    position: sticky;
    top: 0;
    z-index: 50;
    background: #fafaf8;

    @media (max-width: 768px) { padding: 90px 20px 24px; }
`

const HeaderInner = styled.div`
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
    flex-wrap: wrap;
`

const HeaderLeft = styled.div``

const PageEyebrow = styled.p`
    font-family: 'DM Sans', sans-serif;
    font-size: 9px;
    letter-spacing: 0.45em;
    text-transform: uppercase;
    color: #bbb;
    margin: 0 0 8px;
`

const PageTitle = styled.h1`
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(2rem, 5vw, 4rem);
    font-weight: 300;
    font-style: italic;
    color: #0a0a0a;
    margin: 0;
    letter-spacing: -0.02em;
    line-height: 1;
`

const HeaderRight = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`

const SearchInput = styled.input`
    border: none;
    border-bottom: 1px solid #ccc;
    background: transparent;
    padding: 8px 4px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    letter-spacing: 0.05em;
    color: #0a0a0a;
    outline: none;
    width: 220px;
    transition: border-color 0.2s;

    &::placeholder { color: #bbb; }
    &:focus { border-color: #0a0a0a; }

    @media (max-width: 520px) { width: 140px; }
`

const MobileFilterBtn = styled.button`
    display: none;
    position: relative;
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    background: transparent;
    border: 1px solid #ccc;
    padding: 8px 16px;
    cursor: pointer;
    color: #555;
    transition: border-color 0.2s, color 0.2s;
    &:hover { border-color: #0a0a0a; color: #0a0a0a; }

    @media (max-width: 900px) { display: flex; align-items: center; gap: 6px; }
`

const FilterDot = styled.span`
    width: 6px; height: 6px;
    background: #0a0a0a;
    border-radius: 50%;
    flex-shrink: 0;
`

const ShopLayout = styled.div`
    display: flex;
    align-items: flex-start;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 40px 80px;

    @media (max-width: 900px) { flex-direction: column; padding: 0 20px 80px; }
`

/* ── SIDEBAR ────────────────────────────────────────────────────────────── */
const Sidebar = styled.aside`
    width: 220px;
    min-width: 220px;
    padding-top: 40px;
    padding-right: 40px;
    position: sticky;
    top: 160px;

    @media (max-width: 900px) {
        width: 100%;
        min-width: unset;
        padding: 0;
        position: static;
        display: ${p => p.open ? 'block' : 'none'};
        padding-bottom: 24px;
        border-bottom: 1px solid #e8e8e4;
        margin-bottom: 8px;
    }
`

const FilterBlock = styled.div`
    margin-bottom: 36px;
`

const FilterTitle = styled.p`
    font-family: 'DM Sans', sans-serif;
    font-size: 9px;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: #999;
    margin: 0 0 16px;
`

const FilterOption = styled.div`
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    letter-spacing: 0.04em;
    color: ${p => p.active ? '#0a0a0a' : '#aaa'};
    cursor: pointer;
    padding: 6px 0;
    transition: color 0.15s;
    border-left: 2px solid ${p => p.active ? '#0a0a0a' : 'transparent'};
    padding-left: 10px;

    &:hover { color: #0a0a0a; }
`

const FilterCheckbox = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    letter-spacing: 0.04em;
    color: ${p => p.active ? '#0a0a0a' : '#888'};
    cursor: pointer;
    padding: 6px 0;
    transition: color 0.15s;
    &:hover { color: #0a0a0a; }
`

const CheckboxBox = styled.span`
    width: 14px; height: 14px;
    border: 1px solid ${p => p.active ? '#0a0a0a' : '#ccc'};
    display: flex; align-items: center; justify-content: center;
    font-size: 9px;
    background: ${p => p.active ? '#0a0a0a' : 'transparent'};
    color: #fff;
    flex-shrink: 0;
    transition: all 0.15s;
`

const ClearBtn = styled.button`
    font-family: 'DM Sans', sans-serif;
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
    padding-top: 40px;
`

const GridMeta = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e8e8e4;
`

const ResultCount = styled.p`
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #aaa;
    margin: 0;
`

const SortSelect = styled.select`
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    letter-spacing: 0.15em;
    color: #555;
    border: none;
    border-bottom: 1px solid #ccc;
    background: transparent;
    padding: 4px 4px;
    outline: none;
    cursor: pointer;

    @media (max-width: 900px) { display: none; }
`

const ProductGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 3px;

    @media (max-width: 1200px) { grid-template-columns: repeat(3, 1fr); }
    @media (max-width: 700px)  { grid-template-columns: repeat(2, 1fr); }
`

const ProductCard = styled.div`
    cursor: pointer;
    background: #fff;

    &:hover img { transform: scale(1.05); }
`

const CardMedia = styled.div`
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

const CardOverlay = styled.div`
    position: absolute; inset: 0;
    display: flex; align-items: flex-end; justify-content: center;
    padding-bottom: 20px;
    background: linear-gradient(to top, rgba(0,0,0,0.42) 0%, transparent 40%);
    opacity: 0;
    transition: opacity 0.3s ease;

    ${ProductCard}:hover & { opacity: 1; }

    span {
        font-family: 'DM Sans', sans-serif;
        font-size: 9px;
        letter-spacing: 0.35em;
        text-transform: uppercase;
        color: #fff;
        border-bottom: 1px solid rgba(255,255,255,0.5);
        padding-bottom: 3px;
    }
`

const CardNoImg = styled.div`
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(3rem, 8vw, 6rem);
    font-weight: 300;
    font-style: italic;
    color: rgba(0,0,0,0.1);
`

const ArtistBadge = styled.span`
    position: absolute;
    top: 10px; left: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 7px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: #fff;
    background: rgba(10,10,10,0.5);
    padding: 4px 8px;
    backdrop-filter: blur(4px);
`

const CardBody = styled.div`
    padding: 14px 12px 18px;
    border-bottom: 1px solid #f0f0ee;
`

const CardName = styled.p`
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    letter-spacing: 0.04em;
    color: #1a1a1a;
    margin: 0 0 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`

const CardPrice = styled.p`
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 14px;
    font-style: italic;
    color: #555;
    margin: 0;
`

/* ── SKELETON ─────────────────────────────────────────────────────────────── */
const SkeletonGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 3px;

    @media (max-width: 700px) { grid-template-columns: repeat(2, 1fr); }
`

const SkeletonCard = styled.div`
    background: #fff;
    padding-bottom: 8px;
`

const SkeletonImg = styled.div`
    width: 100%;
    padding-bottom: 130%;
    background: linear-gradient(90deg, #efefed 25%, #e6e6e4 50%, #efefed 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;

    @keyframes shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
    }
`

const SkeletonLine = styled.div`
    height: 10px;
    width: ${p => p.w || '80%'};
    background: #efefed;
    border-radius: 2px;
    margin: 12px 12px 6px;
    animation: shimmer 1.4s infinite;
`

/* ── EMPTY STATE ───────────────────────────────────────────────────────────── */
const Empty = styled.div`
    text-align: center;
    padding: 80px 24px;

    p {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: 20px;
        font-weight: 300;
        font-style: italic;
        color: #bbb;
        margin: 0 0 24px;
    }
`

/* ── MODAL ─────────────────────────────────────────────────────────────────── */
const Overlay = styled.div`
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

const ModalHead = styled.div`
    display: flex; align-items: center; justify-content: space-between;
    padding: 22px 28px;
    border-bottom: 1px solid #efefef;
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
    background: #f5f5f0;
    padding-bottom: 110%;

    img {
        position: absolute; inset: 0;
        width: 100%; height: 100%;
        object-fit: cover;
    }

    .skeleton {
        position: absolute; inset: 0;
        background: #f5f5f0;
    }
`

const ModalBody = styled.div`
    padding: 32px 28px;
`

const ModalName = styled.p`
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 22px; font-weight: 300; font-style: italic;
    color: #1a1a1a; margin: 0 0 8px;
`

const ModalPrice = styled.p`
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; letter-spacing: 0.1em;
    color: #999; margin: 0 0 36px;
`
