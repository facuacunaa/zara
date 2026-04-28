import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProduct } from '../Redux/App/action';
import ProductCard from '../Components/Product-Page-Component/ProductCard';
import styled from 'styled-components';

const images = [
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80",
    "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1400&q=80",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1400&q=80",
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1400&q=80",
];

const NataliaGomez = () => {
    const dispatch = useDispatch();
    const products = useSelector((state) => state.AppReducer.products);

    useEffect(() => {
        dispatch(getProduct('women1', 8));
    }, [dispatch]);

    return (
        <PageContainer>
            {/* VIDEO HERO */}
            <section className="video-section">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="hero-video"
                >
                    <source
                        src="https://www.w3schools.com/html/mov_bbb.mp4"
                        type="video/mp4"
                    />
                </video>
                <div className="video-overlay">
                    <h1 className="artist-name">NATALIA GOMEZ</h1>
                    <p className="artist-subtitle">EXCLUSIVE COLLECTION</p>
                </div>
            </section>

            {/* EDITORIAL IMAGES */}
            <section className="images-section">
                {images.map((src, index) => (
                    <div className="image-block" key={index}>
                        <img src={src} alt={`Natalia Gomez look ${index + 1}`} />
                    </div>
                ))}
            </section>

            {/* PRODUCTS */}
            <section className="products-section">
                <h2 className="section-title">THE COLLECTION</h2>
                <div className="gridlayout">
                    {products.map((item) => (
                        <ProductCard key={item.id} id={item.id} item={item} />
                    ))}
                </div>
            </section>
        </PageContainer>
    );
};

const PageContainer = styled.div`
    width: 100%;
    padding-top: 70px;

    /* ── VIDEO ── */
    .video-section {
        position: relative;
        width: 100%;
        height: 100vh;
        overflow: hidden;
    }

    .hero-video {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .video-overlay {
        position: absolute;
        bottom: 60px;
        left: 50%;
        transform: translateX(-50%);
        text-align: center;
        color: white;
    }

    .artist-name {
        font-size: clamp(2.5rem, 8vw, 6rem);
        font-weight: 300;
        letter-spacing: 0.3em;
        margin: 0;
        text-shadow: 0 2px 20px rgba(0,0,0,0.4);
    }

    .artist-subtitle {
        font-size: clamp(0.7rem, 2vw, 1rem);
        letter-spacing: 0.5em;
        margin-top: 10px;
        opacity: 0.85;
    }

    /* ── IMAGES ── */
    .images-section {
        width: 100%;
    }

    .image-block {
        width: 100%;
        overflow: hidden;
    }

    .image-block img {
        width: 100%;
        height: 90vh;
        object-fit: cover;
        display: block;
        transition: transform 0.6s ease;
    }

    .image-block img:hover {
        transform: scale(1.02);
    }

    /* ── PRODUCTS ── */
    .products-section {
        width: 90%;
        margin: 0 auto;
        padding: 80px 0 60px;
    }

    .section-title {
        font-size: clamp(1rem, 3vw, 1.4rem);
        font-weight: 300;
        letter-spacing: 0.4em;
        text-align: center;
        margin-bottom: 50px;
        color: #111;
    }

    .gridlayout {
        display: grid;
        width: 100%;
        gap: 15px;
        grid-template-columns: repeat(auto-fit, minmax(200px, max-content));
        justify-content: center;
    }

    @media (max-width: 768px) {
        .image-block img {
            height: 60vw;
        }
        .artist-name {
            letter-spacing: 0.15em;
        }
    }
`;

export default NataliaGomez;
