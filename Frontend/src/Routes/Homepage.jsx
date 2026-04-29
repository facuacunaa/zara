import "swiper/css";
import "swiper/css/pagination"
import styled from "styled-components";
import jeansvideos from '../Resources/videos/jeans.mp4';
import menvideos from '../Resources/videos/menVid.mp4';
import kidsVideo from '../Resources/videos/kids.mp4';
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Mousewheel, Pagination } from 'swiper';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Components/Navbar";
import { Link } from "react-router-dom";
import AddCart from "../Components/Product-Page-Component/AddCart";
SwiperCore.use([Mousewheel, Pagination]);

const API = process.env.REACT_APP_BACKEND_URL || 'https://zara-backend.vercel.app'

const Homepage = () => {
    const Women = [
        {
            path: 'women1',
            img: 'https://static.zara.net/photos///contents/mkt/spots/aw22-north-woman-new/subhome-xmedia-38-3//w/1922/IMAGE-landscape-default-fill-3826ba34-9fad-4264-9ecd-6d2bc9295d9c-default_0.jpg?ts=1663773455159'
        },
        {
            video: jeansvideos
        },
        {
            path: 'women1',
            img: 'https://static.zara.net/photos///contents/mkt/spots/aw22-north-woman-y2k-collection/subhome-xmedia-38//w/1922/IMAGE-landscape-fill-8ffe5012-f7c5-486e-a66a-9c017f1c4ddc-default_0.jpg?ts=1663790133732'
        },
        {
            path: 'women1',
            img: 'https://static.zara.net/photos///contents/mkt/spots/aw22-north-woman-best-sellers/subhome-xmedia-38//w/1922/IMAGE-landscape-fill-c68605f6-1f94-4830-8f4a-0f3bf22017e2-default_0.jpg?ts=1663579002306'
        },
        {
            path: 'women1',
            img: 'https://static.zara.net/photos///contents/mkt/spots/aw22-north-collection/subhome-xmedia-39//w/1922/IMAGE-landscape-fill-8a1ce69a-a1f6-4b5c-b04a-c3ea44664c19-default_0.jpg?ts=1663794685596'
        },
        {
            path: 'women1',
            img: 'https://static.zara.net/photos///contents/mkt/spots/aw22-north-woman-basics/subhome-xmedia-38//w/1922/IMAGE-landscape-fill-f5302ebb-2ddc-4218-81c2-eb0464c2d73f-default_0.jpg?ts=1663576361647'
        },
        {
            path: 'women1',
            img: 'https://static.zara.net/photos///contents/mkt/spots/aw22-north-woman-shoes-bags/subhome-xmedia-38//w/1922/IMAGE-landscape-default-fill-5c2d5cc1-7805-42c8-9238-635ec71551d3-default_0.jpg?ts=1663770211821'
        }
    ];
    const Men = [
        {
            path: 'men1',
            img: 'https://static.zara.net/photos///contents/mkt/spots/aw22-north-man-origins/subhome-xmedia-34//w/1294/IMAGE-landscape-1-fill-23c9012f-bdc9-45c1-af3c-8f7c07f86626-default_0.jpg?ts=1664366171420'
        },
        {
            path: 'men1',
            img: 'https://static.zara.net/photos///contents/mkt/spots/aw22-north-man-new/subhome-xmedia-39//w/1922/IMAGE-landscape-fill-fbb20929-1e45-4d24-8139-c6351a17419b-default_0.jpg?ts=1664208804884'
        },
        {
            video: menvideos
        },
        {
            path: 'men1',
            img: 'https://static.zara.net/photos///contents/mkt/spots/aw22-man-thezexperience/subhome-xmedia-37//w/1034/IMAGE-landscape-60a9e632-924a-42ab-b7a3-9a87060d9999-default_0.jpg?ts=1663172982729'
        }
    ];
    const Kids = [
        {
            video: kidsVideo,
            cat: 'kids'
        },
        {
            path: 'kids1',
            img: 'https://static.zara.net/photos///contents/mkt/spots/aw22-north-kids-boy/subhome-xmedia-38-2//w/1922/IMAGE-landscape-fill-aa8667a5-4747-421a-8c66-2dba3d7b3afc-default_0.jpg?ts=1663870203073'
        },
        {
            path: 'kids1',
            img: 'https://static.zara.net/photos///contents/mkt/spots/aw22-north-kids-babygirl/subhome-xmedia-38//w/1922/IMAGE-landscape-fill-79e6baba-0718-4cda-bbb5-ff3f6fe0be62-default_0.jpg?ts=1663870712229'
        },
        {
            path: 'kids1',
            img: 'https://static.zara.net/photos///contents/mkt/spots/aw22-north-kids-girl/subhome-xmedia-39//w/1922/IMAGE-landscape-fill-ccf425f8-7d6e-447a-99b0-d5bafce56b94-default_0.jpg?ts=1664521449113'
        },
        {
            path: 'kids1',
            img: 'https://static.zara.net/photos///contents/mkt/spots/aw22-north-kids-join-life/subhome-xmedia-38//w/1922/IMAGE-landscape-fill-4e354fe1-c38f-4d4b-8e9c-d58f5718aefa-default_0.jpg?ts=1663763505030'
        },
        {
            path: 'kids1',
            img: 'https://static.zara.net/photos///contents/mkt/spots/aw22-north-kids-babyboy/subhome-xmedia-38//w/1922/IMAGE-landscape-fill-f9ab1b72-c48b-47fe-84c3-006e8f6141cb-default_0.jpg?ts=1663871170295'
        }
    ];
    const [activeIndexs, setactiveIndex] = useState(0);
    const [indexNo, setIndex] = useState(0);
    const category = ['Women', 'Men', 'Kids'];
    const [homeVideo, setHomeVideo] = useState('')
    const [editorial, setEditorial] = useState({})
    const [artistProducts, setArtistProducts] = useState([])
    const [selectedProd, setSelectedProd]   = useState(null)

    useEffect(() => {
        axios.get(`${API}/settings`)
            .then(r => {
                setHomeVideo(r.data.heroVideo || '')
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
        <Container activeIndexs={activeIndexs}>
            <Navbar style={{ display: "none" }} activeIndexs={activeIndexs} setIndex={setIndex}/>
            <Swiper
                direction={'vertical'}
                slidesPerView={1}
                mousewheel={true}
                pagination={{
                    "clickable": true,
                }}
                onTouchMove={(e) => setactiveIndex(e.activeIndex===0?1:e.activeIndex===1?2:e.activeIndex)}
                className="mySwiper"
                onScroll={(e) => setactiveIndex(e.activeIndex)}
            >
                {eval(category[indexNo])?.map((ele, index) => (
                    <SwiperSlide className="swiper-slide" key={index}>
                        <Link to={`/products`} state={{ query: ele.path }}>
                            {ele.img ?
                                <img src={ele.img} alt={ele.img} className={`main${category[indexNo]}${index}`}/>
                                :
                                <video autoPlay loop muted controls={ele.cat === 'kids' ? false : true} >
                                    <source src={ele.video} type="video/mp4" />
                                </video>
                            }
                        </Link>
                    </SwiperSlide>
                ))};
                <div className="nextPrevButtons">
                    {indexNo > 0 ?
                        <button onClick={() => setIndex(prev => prev - 1)}>
                            <ArrowBackIosIcon fontSize='small' />
                            <span>{category[indexNo - 1]}</span>
                        </button>
                        :
                        <span></span>
                    }
                    {indexNo !== category.length - 1 &&
                        <button onClick={() => setIndex(prev => prev + 1)}>
                            <span>{category[indexNo + 1]}</span>
                            <ArrowForwardIosIcon fontSize='small' />
                        </button>
                    }
                </div>
            </Swiper>
        </Container>

        {/* ── SECCIÓN ARTE ───────────────────────────────────────────── */}
        {homeVideo && (
            <ArtSection>
                <ArtText>
                    <ArtLabel>— Manifiesto</ArtLabel>
                    <ArtHeadline>No somos una tienda,<br />somos arte.</ArtHeadline>
                </ArtText>
                <ArtVideoWrap>
                    <video
                        src={homeVideo}
                        autoPlay loop muted playsInline
                    />
                </ArtVideoWrap>
            </ArtSection>
        )}

        {/* ── SECCIÓN EDITORIAL ───────────────────────────────────── */}
        {(editorial.editorialQuote || editorial.editorialBody) && (
            <EditorialSection>
                <EditorialInner>
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
                        <EditorialCta>{editorial.editorialCta}</EditorialCta>
                    )}
                </EditorialInner>
            </EditorialSection>
        )}

        {/* ── PRODUCTOS DE ARTISTAS ────────────────────────────────── */}
        {artistProducts.length > 0 && (
            <ArtistsSection>
                <ArtistsSectionHeader>
                    <ArtLabel>— Artistas</ArtLabel>
                    <ArtistsHeadline>La colección</ArtistsHeadline>
                </ArtistsSectionHeader>

                <ArtistsGrid>
                    {artistProducts.map((p, i) => (
                        <ArtistProductCard key={p._id || i} onClick={() => setSelectedProd(p)}>
                            <ArtistProductImg>
                                {p.image
                                    ? <img src={p.image} alt={p.name} />
                                    : <ArtistProductNoImg>Sin imagen</ArtistProductNoImg>
                                }
                                <ArtistProductOverlay>Ver detalle</ArtistProductOverlay>
                            </ArtistProductImg>
                            <ArtistProductInfo>
                                <ArtistProductArtist>
                                    <Link to={`/artist/${p.artistSlug}`}>{p.artistName}</Link>
                                </ArtistProductArtist>
                                <ArtistProductName>{p.name}</ArtistProductName>
                                <ArtistProductPrice>{p.price}</ArtistProductPrice>
                            </ArtistProductInfo>
                        </ArtistProductCard>
                    ))}
                </ArtistsGrid>
            </ArtistsSection>
        )}

        {/* ── PRODUCT MODAL ───────────────────────────────────────── */}
        {selectedProd && (
            <HomeProdModal product={selectedProd} onClose={() => setSelectedProd(null)} />
        )}
    </HomeWrap>
    );
}

const Container = styled.div`
    width: 100%;
    height: 100vh;
    position:absolute;
    cursor:pointer;
    z-index:-5;
    .mySwiper {
        width: 100%;
        height: 100%;
        
    }
    .swiper-slide{
        width:100%;
        height:100vh;
        
    }
    .swiper-slide img{
        width:100%;
        height:100vh;
        object-fit:fill;
        
    }
    .swiper-slide video{
        width:100%;
        height:100vh;
        object-fit:cover;
    }
    .swiper-pagination-bullet-active {
        background-color: #000 !important;
    }
    .swiper-pagination {
        margin-top: 250px !important;
    }
    .nextPrevButtons{
        width:100%;
        position:absolute;
        display:flex;
        align-items:center;
        justify-content:space-between;
        z-index:5;
        top:45vh;
    }
    .nextPrevButtons>button{
       background-color:transparent;
       border:none;
       display:flex;
       align-items:center;
       font-weight:200;
       color:${(props)=>(props.activeIndexs % 2 === 0?"white":"black")};
    }

    .nextPrevButtons>button svg{
        font-size:30px;
        fill:${(props)=>(props.activeIndexs % 2 === 0?"white":"black")};
    }

    @media only screen and (min-width: 769px) and (max-width:1110px){
        .swiper-slide img{
            object-fit:cover;
            
        }
    }

    @media only screen and (min-width: 481px) and (max-width:768px){
        .swiper-slide img{
            object-fit:cover;
        }
    }
    
    @media only screen and (min-width:320px) and (max-width:480px){
        .swiper-slide img{
            object-fit:cover;
        }

        .swiper-slide  .mainWomen4{
            transform: rotate(90deg);
            object-fit: contain;
            width:100vh;
            object-position:0px 100%;
            background-color:#e3edea;
        }

        .swiper-slide  .mainWomen6{
            transform: rotate(-90deg);
            object-fit: contain;
            width:100vh;
            object-position:0px 15%;
            background-color:#c2d5e4;
        }

        .swiper-slide  .mainMen1{
            object-position:60% 0%;
        }

        .swiper-slide  .mainKids2{
            object-position:71% 0%;
        }
    }

    @media only screen and (max-width: 320px){
        .swiper-slide img{
            object-fit:cover;
        }
    }
`



const HomeWrap = styled.div`
    display: flex;
    flex-direction: column;
`

const ArtSection = styled.section`
    background: #0a0a0a;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 80px 24px 0;
    gap: 0;
`

const ArtText = styled.div`
    text-align: center;
    margin-bottom: 48px;
`

const ArtLabel = styled.p`
    font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
    font-size: 10px;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.4);
    margin: 0 0 20px;
`

const ArtHeadline = styled.h2`
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(2rem, 6vw, 5rem);
    font-weight: 300;
    font-style: italic;
    color: #ffffff;
    line-height: 1.15;
    margin: 0;
`

const ArtVideoWrap = styled.div`
    width: 100%;
    max-width: 1000px;
    video {
        width: 100%;
        display: block;
        object-fit: cover;
        max-height: 600px;
    }
`

/* ── EDITORIAL ───────────────────────────────────────────────────────────── */
const EditorialSection = styled.section`
    background: #fff;
    padding: 120px 24px;
    position: relative;
    &::before {
        content: '';
        display: block;
        width: 1px;
        height: 60px;
        background: #d0d0d0;
        margin: 0 auto 60px;
    }
`

const EditorialInner = styled.div`
    max-width: 760px;
    margin: 0 auto;
    text-align: center;
`

const EditorialLabel = styled.p`
    font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
    font-size: 9px;
    letter-spacing: 0.45em;
    text-transform: uppercase;
    color: #aaa;
    margin: 0 0 32px;
`

const EditorialQuote = styled.h2`
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(2rem, 5vw, 4.2rem);
    font-weight: 300;
    font-style: italic;
    color: #0a0a0a;
    line-height: 1.2;
    margin: 0 0 40px;
    letter-spacing: -0.01em;
`

const EditorialBody = styled.p`
    font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
    font-size: 12px;
    line-height: 2;
    letter-spacing: 0.08em;
    color: #888;
    max-width: 480px;
    margin: 0 auto 40px;
    white-space: pre-line;
`

const EditorialCta = styled.span`
    display: inline-block;
    font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
    font-size: 9px;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: #0a0a0a;
    border-bottom: 1px solid #0a0a0a;
    padding-bottom: 2px;
`

/* ── MODAL PRODUCTO HOMEPAGE ─────────────────────────────────────────────── */
function HomeProdModal({ product, onClose }) {
    const [visible,  setVisible]  = useState(false)
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
                    <span style={{ fontFamily: 'sans-serif', fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#888' }}>
                        <Link to={`/artist/${product.artistSlug}`} style={{ color: '#888', textDecoration: 'none' }}>
                            {product.artistName}
                        </Link>
                    </span>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'sans-serif', fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#888' }}>✕ Cerrar</button>
                </ModalHeader>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    <ModalImgWrap>
                        {product.image && (
                            <img src={product.image} alt={product.name} onLoad={() => setImgLoaded(true)}
                                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.7s' }}
                            />
                        )}
                        {!imgLoaded && <div style={{ position: 'absolute', inset: 0, background: '#f5f5f0' }} />}
                    </ModalImgWrap>
                    <div style={{ padding: '32px' }}>
                        <p style={{ fontFamily: 'serif', fontSize: '22px', fontWeight: 300, color: '#1a1a1a', margin: '0 0 8px' }}>{product.name}</p>
                        <p style={{ fontFamily: 'serif', fontSize: '16px', color: '#888', margin: '0 0 32px' }}>{product.price}</p>
                        <AddCart data={cartData} />
                    </div>
                </div>
            </ModalPanel>
        </>
    )
}

const ModalOverlay = styled.div`
    position: fixed; inset: 0; background: rgba(10,10,10,0.6); z-index: 100;
    opacity: ${p => p.visible ? 1 : 0}; transition: opacity 0.4s;
`
const ModalPanel = styled.div`
    position: fixed; top: 0; right: 0; bottom: 0; z-index: 101;
    background: #fafaf8; display: flex; flex-direction: column;
    width: 100%; max-width: 520px; box-shadow: -8px 0 40px rgba(0,0,0,0.15);
    transform: ${p => p.visible ? 'translateX(0)' : 'translateX(100%)'};
    transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
`
const ModalHeader = styled.div`
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 32px; border-bottom: 1px solid #ececec; flex-shrink: 0;
`
const ModalImgWrap = styled.div`
    position: relative; background: #f5f5f0;
    padding-bottom: 120%;
`

const ArtistsSection = styled.section`
    background: #fafaf8;
    padding: 80px 24px;
`
const ArtistsSectionHeader = styled.div`
    text-align: center;
    margin-bottom: 56px;
`
const ArtistsHeadline = styled.h2`
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(1.8rem, 4vw, 3.5rem);
    font-weight: 300;
    font-style: italic;
    color: #1a1a1a;
    margin: 0;
`
const ArtistsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
    max-width: 1200px;
    margin: 0 auto;
    @media (min-width: 640px)  { grid-template-columns: repeat(3, 1fr); }
    @media (min-width: 1024px) { grid-template-columns: repeat(4, 1fr); }
`
const ArtistProductCard = styled.div`
    cursor: pointer;
    &:hover img { transform: scale(1.04); }
`
const ArtistProductImg = styled.div`
    position: relative;
    overflow: hidden;
    background: #ededea;
    padding-bottom: 130%;
    margin-bottom: 12px;
    img {
        position: absolute; inset: 0;
        width: 100%; height: 100%;
        object-fit: cover;
        transition: transform 0.7s ease;
    }
`
const ArtistProductNoImg = styled.div`
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    font-family: sans-serif; font-size: 9px; letter-spacing: 0.2em;
    text-transform: uppercase; color: #aaa;
`
const ArtistProductOverlay = styled.div`
    position: absolute; bottom: 10px; left: 10px; right: 10px;
    background: rgba(255,255,255,0.92);
    text-align: center; padding: 8px;
    font-family: sans-serif; font-size: 8px;
    letter-spacing: 0.25em; text-transform: uppercase;
    color: #1a1a1a; opacity: 0;
    transition: opacity 0.3s;
    ${ArtistProductCard}:hover & { opacity: 1; }
`
const ArtistProductInfo = styled.div``
const ArtistProductArtist = styled.p`
    font-family: sans-serif; font-size: 8px;
    letter-spacing: 0.3em; text-transform: uppercase;
    color: #aaa; margin: 0 0 4px;
    a { color: inherit; text-decoration: none; &:hover { color: #1a1a1a; } }
`
const ArtistProductName = styled.p`
    font-family: sans-serif; font-size: 9px;
    letter-spacing: 0.15em; text-transform: uppercase;
    color: #1a1a1a; margin: 0 0 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
`
const ArtistProductPrice = styled.p`
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 13px; color: #888; margin: 0;
`

export default Homepage