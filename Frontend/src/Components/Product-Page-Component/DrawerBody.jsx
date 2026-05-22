import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { getCart } from '../../Redux/App/action'

const DrawerBody = ({ addedId } = {}) => {
    const dispatch = useDispatch()
    const cartdata = useSelector((store) => store.AppReducer.cart)

    useEffect(() => { dispatch(getCart()) }, [dispatch])

    const total = cartdata
        ? cartdata.reduce((acc, el) => acc + (el.pricenum || 0) * (el.quantity || 1), 0)
        : 0

    return (
        <Wrap>
            <DrawerTitle>
                En tu carrito
                {cartdata?.length > 0 && <DrawerCount>{cartdata.length} {cartdata.length === 1 ? 'obra' : 'obras'}</DrawerCount>}
            </DrawerTitle>

            {(!cartdata || cartdata.length === 0) ? (
                <Empty>
                    <EmptyIcon>✦</EmptyIcon>
                    <p>Tu carrito está vacío</p>
                </Empty>
            ) : (
                <ScrollArea>
                    {cartdata.map((cart) => (
                        <CartItem key={cart.id}>
                            <ItemImg>
                                {cart.image
                                    ? <img src={cart.image} alt={cart.producttitle} />
                                    : <ImgPlaceholder>{cart.producttitle?.charAt(0)}</ImgPlaceholder>
                                }
                            </ItemImg>
                            <ItemInfo>
                                <ItemName>{cart.producttitle}</ItemName>
                                {cart.color && (
                                    <ItemMeta>{cart.color.split('|')[0]}</ItemMeta>
                                )}
                                <ItemQty>Cant. {cart.quantity}</ItemQty>
                                <ItemPrice>{cart.price}</ItemPrice>
                            </ItemInfo>
                        </CartItem>
                    ))}
                </ScrollArea>
            )}

            <DrawerFooter>
                {cartdata?.length > 0 && (
                    <TotalRow>
                        <span>Total</span>
                        <span>${total.toLocaleString('es-AR')}</span>
                    </TotalRow>
                )}
                <GoToCart to="/cart">Ver carrito completo →</GoToCart>
            </DrawerFooter>
        </Wrap>
    )
}

const Wrap = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0;
`

const DrawerTitle = styled.div`
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 1.3rem;
    font-style: normal;
    font-weight: 500;
    color: #0a0a0a;
    padding: 24px 24px 20px;
    border-bottom: 1px solid #f0f0ee;
    display: flex;
    align-items: center;
    gap: 10px;
`

const DrawerCount = styled.span`
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    font-style: normal;
    color: #aaa;
`

const Empty = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: #bbb;

    p {
        font-family: 'DM Sans', sans-serif;
        font-size: 12px;
        letter-spacing: 0.1em;
        margin: 0;
    }
`

const EmptyIcon = styled.div`
    font-size: 22px;
    color: #ddd;
`

const ScrollArea = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;

    &::-webkit-scrollbar { width: 3px; }
    &::-webkit-scrollbar-track { background: transparent; }
    &::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); }
`

const CartItem = styled.div`
    display: flex;
    gap: 16px;
    padding: 16px 24px;
    border-bottom: 1px solid #f7f7f5;
`

const ItemImg = styled.div`
    width: 72px;
    flex-shrink: 0;
    aspect-ratio: 3/4;
    background: #f5f5f0;
    overflow: hidden;

    img { width: 100%; height: 100%; object-fit: cover; display: block; }
`

const ImgPlaceholder = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 1.5rem;
    font-style: normal;
    color: rgba(0,0,0,0.12);
`

const ItemInfo = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 2px 0;
`

const ItemName = styled.p`
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 500;
    color: #0a0a0a;
    margin: 0;
    line-height: 1.4;
`

const ItemMeta = styled.p`
    font-family: 'DM Sans', sans-serif;
    font-size: 9px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #bbb;
    margin: 0;
`

const ItemQty = styled.p`
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    color: #999;
    margin: 0;
`

const ItemPrice = styled.p`
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 13px;
    font-style: normal;
    color: #0a0a0a;
    margin: auto 0 0;
`

const DrawerFooter = styled.div`
    border-top: 1px solid #e8e8e4;
    padding: 20px 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
`

const TotalRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;

    span:first-child {
        font-family: 'DM Sans', sans-serif;
        font-size: 9px;
        letter-spacing: 0.35em;
        text-transform: uppercase;
        color: #aaa;
    }
    span:last-child {
        font-family: 'Cormorant Garamond', Georgia, serif;
        font-size: 1.1rem;
        font-style: normal;
        color: #0a0a0a;
    }
`

const GoToCart = styled(Link)`
    display: block;
    text-align: center;
    background: #0a0a0a;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 9px;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    text-decoration: none;
    padding: 16px;
    transition: background 0.2s;

    &:hover { background: #333; }
`

export default DrawerBody
