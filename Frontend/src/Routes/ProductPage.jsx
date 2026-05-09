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
    padding: 110px 40px 28px;
    position: sticky;
    top: 0;
    z-index: 50;
    @media (max-width: 768px) { padding: 80px 16px 20px; }
`

const HeaderInner = styled.div`
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    @media (max-width: 600px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }
`

const HeaderLeft = styled.div``

const PageEyebrow = styled.p`
    font-size: 9px;
    letter-spacing: 0.45em;
    text-transform: uppercase;
    color: #bbb;
    margin: 0 0 6px;
`

const PageTitle = styled.h1`
    font-family: 'Times New Roman', Georgia, serif;
    font-size: clamp(1.8rem, 5vw, 3.5rem);
    font-weight: 300;
    font-style: italic;
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
    border: none;
    border-bottom: 1px solid #ccc;
    background: transparent;
    padding: 8px 4px;
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
    background: ${p => p.$active ? '#0a0a0a' : 'transparent'};
    color: ${p => p.$active ? '#fff' : '#555'};
    border: 1px solid ${p => p.$active ? '#0a0a0a' : '#ccc'};
    padding: 8px 14px;
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
    @media (max-width: 600px) { padding: 0 0 60px; }
`

/* ── SIDEBAR ────────────────────────────────────────────────────────────── */
const Sidebar = styled.aside`
    width: 210px;
    min-width: 210px;
    padding-top: 36px;
    padding-right: 36px;
    position: sticky;
    top: 140px;

    @media (max-width: 900px) {
        width: 100%;
        min-width: unset;
        padding: 0;
        position: static;
        overflow: hidden;
        max-height: ${p => p.open ? '600px' : '0'};
        transition: max-height 0.35s ease;
        border-bottom: ${p => p.open ? '1px solid #e8e8e4' : 'none'};
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
    border-left: 2px solid ${p => p.active ? '#0a0a0a' : 'transparent'};
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
    border: 1px solid ${p => p.active ? '#0a0a0a' : '#ccc'};
    display: flex; align-items: center; justify-content: center;
    font-size: 9px;
    background: ${p => p.active ? '#0a0a0a' : 'transparent'};
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
    @media (max-width: 600px) {
        width: 100%;
        padding-top: 0;
    }
`

const GridMeta = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    padding-bottom: 14px;
    border-bottom: 1px solid #e8e8e4;
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
    border: none;
    border-bottom: 1px solid #ccc;
    background: transparent;
    padding: 4px 2px;
    outline: none;
    cursor: pointer;
    max-width: 160px;
    @media (max-width: 500px) { display: none; }
`

const ProductGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2px;
    @media (max-width: 1100px) { grid-template-columns: repeat(2, 1fr); }
    @media (max-width: 600px)  { grid-template-columns: repeat(2, 1fr); gap: 2px; }
`

const ProductCard = styled.div`
    cursor: pointer;
    background: #fff;
    &:hover img { transform: scale(1.04); }
`

const CardMedia = styled.div`
    position: relative;
    overflow: hidden;
    background: #ededeb;
    aspect-ratio: 3/4;

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
    padding-bottom: 16px;
    background: linear-gradient(to top, rgba(0,0,0,0.38) 0%, transparent 45%);
    opacity: 0;
    transition: opacity 0.3s ease;
    ${ProductCard}:hover & { opacity: 1; }
    span {
        font-size: 8px;
        letter-spacing: 0.32em;
        text-transform: uppercase;
        color: #fff;
        border-bottom: 1px solid rgba(255,255,255,0.45);
        padding-bottom: 2px;
    }
    @media (max-width: 768px) { opacity: 1; }
`

const CardNoImg = styled.div`
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Times New Roman', Georgia, serif;
    font-size: clamp(2.5rem, 8vw, 5rem);
    font-weight: 300;
    font-style: italic;
    color: rgba(0,0,0,0.1);
`

const ArtistBadge = styled.span`
    position: absolute;
    top: 8px; left: 8px;
    font-size: 7px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: #fff;
    background: rgba(10,10,10,0.45);
    padding: 3px 7px;
    backdrop-filter: blur(4px);
    max-width: calc(100% - 16px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`

const CardBody = styled.div`
    padding: 10px 10px 14px;
    border-bottom: 1px solid #f0f0ee;
    @media (max-width: 600px) { padding: 14px 12px 18px; }
`

const CardName = styled.p`
    font-size: 11px;
    letter-spacing: 0.03em;
    color: #1a1a1a;
    margin: 0 0 5px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-height: 1.4;
    @media (max-width: 600px) { font-size: 13px; }
`

const CardPrice = styled.p`
    font-family: 'Times New Roman', Georgia, serif;
    font-size: 13px;
    font-style: italic;
    color: #666;
    margin: 0;
    @media (max-width: 600px) { font-size: 15px; }
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
