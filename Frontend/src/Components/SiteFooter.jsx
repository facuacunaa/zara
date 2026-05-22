import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

const SiteFooter = () => {
    return (
        <FooterWrap>
            <FooterInner>
                <FooterBrand>
                    <FooterBrandLogo src="/logo-footer.png" alt="La Casita del Hornero" />
                    <FooterBrandSub>Arte local · Bienal de Esculturas</FooterBrandSub>
                </FooterBrand>
                <FooterCol>
                    <FooterColTitle>Información de la tienda</FooterColTitle>
                    <FooterLink as={Link} to="/products">Tienda</FooterLink>
                    <FooterLink as={Link} to="/#coleccion">Novedades</FooterLink>
                    <FooterLink as={Link} to="/#artistas">Artistas</FooterLink>
                </FooterCol>
                <FooterCol>
                    <FooterColTitle>Información adicional</FooterColTitle>
                    <FooterLink href="mailto:lacasitadelhornero@gmail.com">Vender mi arte</FooterLink>
                    <FooterLink href="#coleccion">Cómo funciona</FooterLink>
                </FooterCol>
                <FooterCol>
                    <FooterColTitle>Nosotros</FooterColTitle>
                    <FooterLink as={Link} to="/#mision">Nuestra misión</FooterLink>
                    <FooterLink href="#">Bienal de Esculturas</FooterLink>
                </FooterCol>
            </FooterInner>
            <FooterBottom>
                <span>© {new Date().getFullYear()} La Casita del Hornero · Todos los derechos reservados</span>
            </FooterBottom>
        </FooterWrap>
    )
}

const FooterWrap = styled.footer`
    background: #3c4021;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 22px 70px rgba(0,0,0,0.38), 0 6px 20px rgba(0,0,0,0.18);
    margin: 40px 16px 24px;
`
const FooterInner = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 60px;
    max-width: 1300px;
    margin: 0 auto;
    padding: 80px 40px 64px;
    @media (max-width: 900px) { grid-template-columns: 1fr 1fr; gap: 40px; padding: 60px 24px 48px; }
    @media (max-width: 520px) { grid-template-columns: 1fr; gap: 36px; padding: 56px 24px 40px; }
`
const FooterBrand = styled.div``
const FooterBrandLogo = styled.img`
    height: 80px;
    width: auto;
    display: block;
    margin-bottom: 16px;
`
const FooterBrandSub = styled.p`
    font-size: 0.62rem;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.25);
    margin: 0;
`
const FooterCol = styled.div``
const FooterColTitle = styled.p`
    font-size: 0.62rem;
    letter-spacing: 0.38em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
    margin: 0 0 20px;
`
const FooterLink = styled.a`
    display: block;
    font-size: 0.82rem;
    color: rgba(255,255,255,0.55);
    text-decoration: none;
    margin-bottom: 10px;
    transition: color 0.2s;
    letter-spacing: 0.02em;
    &:hover { color: #fff; }
`
const FooterBottom = styled.div`
    border-top: 1px solid rgba(255,255,255,0.07);
    padding: 24px 40px;
    max-width: 1300px;
    margin: 0 auto;
    @media (max-width: 640px) { padding: 20px 24px; }
    span {
        font-size: 0.62rem;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: rgba(255,255,255,0.2);
    }
`

export default SiteFooter
