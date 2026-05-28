import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

const LogIn = () => {
  const navigate = useNavigate()

  return (
    <PageWrap>
      <Card>
        <Logo src="/logo-footer.png" alt="La Casita del Hornero" />
        <Title>Iniciar sesión</Title>
        <Subtitle>Seleccioná cómo querés ingresar</Subtitle>

        <OptionsGrid>
          <OptionBtn onClick={() => navigate('/artist-portal')}>
            <OptionIcon>🎨</OptionIcon>
            <OptionLabel>Loguearte como artista</OptionLabel>
            <OptionSub>Gestioná tu página y productos</OptionSub>
          </OptionBtn>

          <OptionBtn onClick={() => navigate('/admin')}>
            <OptionIcon>⚙️</OptionIcon>
            <OptionLabel>Loguearte como administrador</OptionLabel>
            <OptionSub>Panel de control de la tienda</OptionSub>
          </OptionBtn>
        </OptionsGrid>

        <BackLink onClick={() => navigate(-1)}>← Volver</BackLink>
      </Card>
    </PageWrap>
  )
}

/* ── Estilos ── */
const PageWrap = styled.div`
  min-height: 100vh;
  background: #f5ede2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
`

const Card = styled.div`
  background: #fff;
  border-radius: 24px;
  padding: 48px 40px 40px;
  width: 100%;
  max-width: 460px;
  box-shadow: 0 16px 60px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  @media (max-width: 480px) {
    padding: 36px 24px 32px;
  }
`

const Logo = styled.img`
  height: 70px;
  width: auto;
  display: block;
  margin-bottom: 12px;
  filter: brightness(0);
`

const Title = styled.h1`
  font-family: 'Barlow Semi Condensed', 'Arial Narrow', sans-serif;
  font-size: 1.8rem;
  font-weight: 500;
  color: #1a1a1a;
  margin: 0;
  text-align: center;
`

const Subtitle = styled.p`
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  letter-spacing: 0.04em;
  color: #aaa;
  margin: 0 0 20px;
  text-align: center;
`

const OptionsGrid = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
`

const OptionBtn = styled.button`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 20px 22px;
  background: #fdf7f0;
  border: 1.5px solid #e8d9c8;
  border-radius: 14px;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;

  &:hover {
    border-color: #6b3a1f;
    background: #fdf3ea;
    box-shadow: 0 4px 18px rgba(107,58,31,0.12);
  }
`

const OptionIcon = styled.span`
  font-size: 26px;
  margin-bottom: 6px;
`

const OptionLabel = styled.p`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.05rem;
  font-weight: 500;
  color: #1a1a1a;
  margin: 0;
`

const OptionSub = styled.p`
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  letter-spacing: 0.03em;
  color: #bbb;
  margin: 0;
`

const BackLink = styled.button`
  margin-top: 12px;
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #bbb;
  padding: 0;
  transition: color 0.2s;

  &:hover { color: #6b3a1f; }
`

export default LogIn
