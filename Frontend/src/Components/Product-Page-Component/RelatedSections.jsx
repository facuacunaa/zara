import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'

/* ─────────────────────────────────────────────────────────────────────────────
   Props:
   - product     : the currently open product
   - allProducts : full flat list of every product (with artistName, artistSlug,
                   artistProfileImage)
   - onSelect    : (product) => void  — opens that product in the modal
───────────────────────────────────────────────────────────────────────────── */
export default function RelatedSections({ product, allProducts, onSelect }) {
    const safeList = allProducts || []

    // ── Same artist, other products ──────────────────────────────────────────
    const related = useMemo(() =>
        safeList
            .filter(p =>
                p.artistName === product.artistName &&
                String(p._id || p.name) !== String(product._id || product.name)
            )
            .slice(0, 8),
        [safeList, product]
    )

    // ── Other unique artists (derived from product list) ─────────────────────
    const otherArtists = useMemo(() => {
        const seen = new Set()
        const result = []
        for (const p of safeList) {
            if (p.artistName === product.artistName) continue
            if (seen.has(p.artistSlug)) continue
            seen.add(p.artistSlug)
            result.push({
                name:         p.artistName,
                slug:         p.artistSlug,
                profileImage: p.artistProfileImage,
            })
        }
        return result.slice(0, 6)
    }, [safeList, product])

    // ── Products from other artists ───────────────────────────────────────────
    const otherProducts = useMemo(() =>
        safeList
            .filter(p => p.artistName !== product.artistName)
            .slice(0, 10),
        [safeList, product]
    )

    if (!safeList.length || (related.length === 0 && otherArtists.length === 0 && otherProducts.length === 0))
        return null

    return (
        <Wrap>
            {/* ── MÁS DE ESTE ARTISTA ───────────────────────────────────── */}
            {related.length > 0 && (
                <Section>
                    <SectionHead>
                        <SectionLabel>Más de</SectionLabel>
                        <SectionTitle>{product.artistName}</SectionTitle>
                    </SectionHead>
                    <HScroll>
                        {related.map((p, i) => (
                            <ProdThumb key={p._id || i} onClick={() => onSelect(p)}>
                                <ProdThumbImg>
                                    {p.image
                                        ? <img src={p.image} alt={p.name} loading="lazy" />
                                        : <span>{p.name?.charAt(0)}</span>
                                    }
                                </ProdThumbImg>
                                <ProdThumbName>{p.name}</ProdThumbName>
                                <ProdThumbPrice>{p.price}</ProdThumbPrice>
                            </ProdThumb>
                        ))}
                    </HScroll>
                </Section>
            )}

            {/* ── ARTISTAS QUE TE PUEDEN INTERESAR ─────────────────────── */}
            {otherArtists.length > 0 && (
                <Section $dark>
                    <SectionHead>
                        <SectionLabel style={{ color: '#aaa' }}>Descubrí</SectionLabel>
                        <SectionTitle style={{ color: '#fff' }}>Otros artistas</SectionTitle>
                    </SectionHead>
                    <HScroll>
                        {otherArtists.map((a, i) => (
                            <ArtistCard key={a.slug || i} as={Link} to={`/${a.slug}`}>
                                <ArtistAvatar>
                                    {a.profileImage
                                        ? <img src={a.profileImage} alt={a.name} loading="lazy" />
                                        : <ArtistInitial>{a.name?.charAt(0)}</ArtistInitial>
                                    }
                                </ArtistAvatar>
                                <ArtistCardName>{a.name}</ArtistCardName>
                                <ArtistCardCta>Ver tienda →</ArtistCardCta>
                            </ArtistCard>
                        ))}
                    </HScroll>
                </Section>
            )}

            {/* ── TAMBIÉN PODRÍA GUSTARTE ───────────────────────────────── */}
            {otherProducts.length > 0 && (
                <Section>
                    <SectionHead>
                        <SectionLabel>Seguí explorando</SectionLabel>
                        <SectionTitle>También podría gustarte</SectionTitle>
                    </SectionHead>
                    <HScroll>
                        {otherProducts.map((p, i) => (
                            <ProdThumb key={p._id || i} onClick={() => onSelect(p)}>
                                <ProdThumbImg>
                                    {p.image
                                        ? <img src={p.image} alt={p.name} loading="lazy" />
                                        : <span>{p.name?.charAt(0)}</span>
                                    }
                                </ProdThumbImg>
                                <ProdThumbArtist>{p.artistName}</ProdThumbArtist>
                                <ProdThumbName>{p.name}</ProdThumbName>
                                <ProdThumbPrice>{p.price}</ProdThumbPrice>
                            </ProdThumb>
                        ))}
                    </HScroll>
                </Section>
            )}
        </Wrap>
    )
}

/* ── Styles ─────────────────────────────────────────────────────────────── */
const Wrap = styled.div`
    border-top: 1px solid #efefed;
    margin-top: 8px;
`

const Section = styled.div`
    padding: 28px 0 24px;
    background: ${p => p.$dark ? '#0a0a0a' : 'transparent'};
    border-bottom: 1px solid ${p => p.$dark ? 'rgba(255,255,255,0.06)' : '#f0f0ee'};
    &:last-child { border-bottom: none; }
`

const SectionHead = styled.div`
    padding: 0 28px 16px;
`

const SectionLabel = styled.p`
    font-family: 'DM Sans', sans-serif;
    font-size: 8px;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: #bbb;
    margin: 0 0 4px;
`

const SectionTitle = styled.h4`
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 1rem;
    font-weight: 300;
    font-style: normal;
    color: #0a0a0a;
    margin: 0;
`

/* ── Horizontal scroll ──────────────────────────────────────────────────── */
const HScroll = styled.div`
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding: 4px 28px 4px;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
`

/* ── Product thumbnail ──────────────────────────────────────────────────── */
const ProdThumb = styled.button`
    flex-shrink: 0;
    width: 120px;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    text-align: left;

    &:hover img { transform: scale(1.04); }
`

const ProdThumbImg = styled.div`
    width: 120px;
    aspect-ratio: 2/3;
    background: #f0f0ee;
    overflow: hidden;
    margin-bottom: 8px;
    position: relative;

    img {
        width: 100%; height: 100%;
        object-fit: cover; display: block;
        transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }
    span {
        position: absolute; inset: 0;
        display: flex; align-items: center; justify-content: center;
        font-family: 'Cormorant Garamond', Georgia, serif;
        font-size: 1.6rem; font-style: normal;
        color: rgba(0,0,0,0.12);
    }
`

const ProdThumbArtist = styled.p`
    font-family: 'DM Sans', sans-serif;
    font-size: 8px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #bbb;
    margin: 0 0 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`

const ProdThumbName = styled.p`
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    font-weight: 500;
    color: #1a1a1a;
    margin: 0 0 3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`

const ProdThumbPrice = styled.p`
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 11px;
    font-style: normal;
    color: #777;
    margin: 0;
`

/* ── Artist card ────────────────────────────────────────────────────────── */
const ArtistCard = styled.div`
    flex-shrink: 0;
    width: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    cursor: pointer;

    &:hover img { transform: scale(1.05); }
`

const ArtistAvatar = styled.div`
    width: 68px; height: 68px;
    border-radius: 50%;
    background: #1e1e1e;
    overflow: hidden;
    flex-shrink: 0;
    border: 2px solid #2a2a2a;

    img {
        width: 100%; height: 100%;
        object-fit: cover; display: block;
        transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }
`

const ArtistInitial = styled.div`
    width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 1.4rem; font-style: normal;
    color: rgba(255,255,255,0.2);
`

const ArtistCardName = styled.p`
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    font-weight: 500;
    color: #e8e8e8;
    margin: 0;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 96px;
`

const ArtistCardCta = styled.p`
    font-family: 'DM Sans', sans-serif;
    font-size: 8px;
    letter-spacing: 0.15em;
    color: #888;
    margin: 0;
    text-align: center;
`
