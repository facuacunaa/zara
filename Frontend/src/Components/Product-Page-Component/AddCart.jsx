import React, { useState } from 'react'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import { useDispatch } from 'react-redux'
import { getCart, postCart } from '../../Redux/App/action'
import DrawerBody from './DrawerBody'
import styled from 'styled-components'

export default function AddCart({ data }) {
    const dispatch = useDispatch()
    const [open, setOpen] = useState(false)

    const handleAdd = () => {
        dispatch(postCart(data)).then(() => {
            dispatch(getCart())
            setOpen(true)
        })
    }

    return (
        <>
            <AddBtn onClick={handleAdd}>
                Agregar al carrito
            </AddBtn>

            <Drawer
                anchor="right"
                open={open}
                onClose={() => setOpen(false)}
                PaperProps={{ sx: { width: 360, maxWidth: '90vw' } }}
            >
                <DrawerHeader>
                    <IconButton onClick={() => setOpen(false)} size="small">
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </DrawerHeader>
                <DrawerBody />
            </Drawer>
        </>
    )
}

const AddBtn = styled.button`
    width: 100%;
    background: #0a0a0a;
    color: #fff;
    border: none;
    padding: 16px 24px;
    font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
    font-size: 10px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.2s;

    &:hover { background: #333; }
`

const DrawerHeader = styled.div`
    display: flex;
    justify-content: flex-end;
    padding: 12px 12px 0;
    flex-shrink: 0;
`
