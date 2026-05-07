import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { deleteCart, getCart, patchcart } from "../Redux/App/action";
import Footer from "./Footer";

const Cart = () => {
  const cartData = useSelector(state => state.AppReducer.cart);
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const handleDelete = (id) => {
    dispatch(deleteCart(id)).then(() => dispatch(getCart()))
  }

  const handleQty = ({ qnty, id }) => {
    if (qnty < 1) return
    dispatch(patchcart({ qnty, id })).then(() => dispatch(getCart()))
  }

  const handleCheckout = () => {
    if (cartData && cartData.length > 0) {
      navigate('/checkout')
    } else {
      alert('Agregá productos al carrito para continuar.')
    }
  }

  const total = cartData
    ? cartData.reduce((acc, el) => acc + (el.pricenum || 0) * (el.quantity || 1), 0)
    : 0

  return (
    <>
      <Wrap>
        <Header>
          <Title>Carrito <Count>({cartData ? cartData.length : 0})</Count></Title>
        </Header>

        <Notice>Los productos del carrito no están reservados hasta completar la compra.</Notice>

        {(!cartData || cartData.length === 0) ? (
          <Empty>
            <EmptyIcon>✦</EmptyIcon>
            <EmptyText>Tu carrito está vacío</EmptyText>
            <EmptyLink onClick={() => navigate('/')}>Explorar productos →</EmptyLink>
          </Empty>
        ) : (
          <ItemList>
            {cartData.map((item) => (
              <Item key={item.id}>
                <ItemImg>
                  {item.image
                    ? <img src={item.image} alt={item.producttitle} />
                    : <ImgPlaceholder>{item.producttitle?.charAt(0)}</ImgPlaceholder>
                  }
                </ItemImg>
                <ItemInfo>
                  <ItemName>{item.producttitle}</ItemName>
                  {item.color && (
                    <ItemMeta>{item.color.split('|')[0]}</ItemMeta>
                  )}
                  <QtyRow>
                    <QtyBtn onClick={() => handleQty({ qnty: item.quantity - 1, id: item.id })}>−</QtyBtn>
                    <QtyNum>{item.quantity}</QtyNum>
                    <QtyBtn onClick={() => handleQty({ qnty: item.quantity + 1, id: item.id })}>+</QtyBtn>
                  </QtyRow>
                  <ItemPrice>{item.price}</ItemPrice>
                  <DeleteBtn onClick={() => handleDelete(item.id)}>Eliminar</DeleteBtn>
                </ItemInfo>
              </Item>
            ))}
          </ItemList>
        )}
      </Wrap>

      <BottomBar>
        <TotalBlock>
          <TotalLabel>Total</TotalLabel>
          <TotalAmount>${total.toLocaleString('es-AR')}</TotalAmount>
          <TotalNote>Envío a calcular al finalizar la compra</TotalNote>
        </TotalBlock>
        <CheckoutBtn onClick={handleCheckout}>Finalizar compra</CheckoutBtn>
      </BottomBar>

      <Footer />
    </>
  )
}

/* ── Styles ─────────────────────────────────────────────────────────────── */
const Wrap = styled.div`
  padding: 120px 40px 160px;
  max-width: 960px;
  margin: 0 auto;
  min-height: 80vh;

  @media (max-width: 640px) { padding: 100px 20px 160px; }
`

const Header = styled.div`
  margin-bottom: 16px;
  border-bottom: 1px solid #e8e8e4;
  padding-bottom: 20px;
`

const Title = styled.h1`
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(1.8rem, 4vw, 3rem);
  font-weight: 300;
  font-style: italic;
  color: #0a0a0a;
  margin: 0;
`

const Count = styled.span`
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-style: normal;
  color: #aaa;
  margin-left: 8px;
`

const Notice = styled.p`
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  letter-spacing: 0.05em;
  color: #aaa;
  background: #f7f7f5;
  padding: 12px 16px;
  margin: 0 0 48px;
`

const Empty = styled.div`
  text-align: center;
  padding: 80px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`

const EmptyIcon = styled.div`
  font-size: 28px;
  color: #ddd;
`

const EmptyText = styled.p`
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.4rem;
  font-style: italic;
  font-weight: 300;
  color: #aaa;
  margin: 0;
`

const EmptyLink = styled.span`
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: #0a0a0a;
  cursor: pointer;
  border-bottom: 1px solid currentColor;
  padding-bottom: 2px;
  transition: opacity 0.2s;

  &:hover { opacity: 0.5; }
`

const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
`

const Item = styled.div`
  display: flex;
  gap: 24px;
  padding: 24px 0;
  border-bottom: 1px solid #f0f0ee;
`

const ItemImg = styled.div`
  width: 120px;
  flex-shrink: 0;
  aspect-ratio: 3/4;
  background: #f5f5f0;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  @media (max-width: 480px) { width: 90px; }
`

const ImgPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 2rem;
  font-style: italic;
  color: rgba(0,0,0,0.15);
`

const ItemInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 0;
`

const ItemName = styled.p`
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: #0a0a0a;
  margin: 0;
`

const ItemMeta = styled.p`
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #bbb;
  margin: 0;
`

const QtyRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 4px 0;
`

const QtyBtn = styled.button`
  background: none;
  border: 1px solid #ddd;
  width: 28px;
  height: 28px;
  cursor: pointer;
  font-size: 14px;
  color: #0a0a0a;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s;

  &:hover { border-color: #0a0a0a; }
`

const QtyNum = styled.span`
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  color: #0a0a0a;
  min-width: 20px;
  text-align: center;
`

const ItemPrice = styled.p`
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 15px;
  font-style: italic;
  color: #0a0a0a;
  margin: auto 0 0;
`

const DeleteBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-size: 9px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #bbb;
  padding: 0;
  align-self: flex-start;
  transition: color 0.2s;

  &:hover { color: #c00; }
`

const BottomBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid #e8e8e4;
  padding: 20px 40px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 40px;
  z-index: 50;

  @media (max-width: 640px) {
    padding: 16px 20px;
    gap: 20px;
  }
`

const TotalBlock = styled.div`
  text-align: right;
`

const TotalLabel = styled.p`
  font-family: 'DM Sans', sans-serif;
  font-size: 9px;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: #bbb;
  margin: 0 0 4px;
`

const TotalAmount = styled.p`
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.4rem;
  font-style: italic;
  color: #0a0a0a;
  margin: 0 0 2px;
`

const TotalNote = styled.p`
  font-family: 'DM Sans', sans-serif;
  font-size: 9px;
  color: #bbb;
  margin: 0;
`

const CheckoutBtn = styled.button`
  background: #0a0a0a;
  color: #fff;
  border: none;
  padding: 16px 40px;
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.2s;

  &:hover { background: #333; }

  @media (max-width: 480px) { padding: 14px 24px; }
`

export default Cart;
