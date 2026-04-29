import LogIn from '../Routes/LogIn'
import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Help from '../Components/Help'
import SignIn from '../Routes/SignIn'
import SinglePage from '../Components/SinglePage'
import ProductPage from '../Routes/ProductPage'
import Homepage from './Homepage'
import Cart from '../Components/Cart'
import Checkout from '../Components/Checkout'
import Companylogin from './Company'
import PaymentMethod from '../Components/PaymentMethod'
import Search from '../Components/Search'
import CardDetail from '../Routes/CardDetail'
import OTP from './OTP'
import ProtectedRoute from '../Components/ProtectedRoute'
import ArtistPage from './NataliaGomez'
import ArtistProductPage from './ArtistProductPage'
import AdminPage from './AdminPage'
import ArtistPortal from './ArtistPortal'
const AllRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<Homepage />}></Route>
      <Route path='/product/:id' element={<SinglePage />}></Route>
      <Route path='/help' element={<Help />}></Route>
      <Route path='/company' element={<Companylogin/>}></Route>
      <Route path='/login' element={<LogIn />} />
      <Route path='/signin' element={<SignIn />} />
      <Route path='/cart' element={<Cart />}></Route>
      <Route path='/checkout' element={<Checkout />}></Route>
      <Route path='/paymentMethod' element={ <ProtectedRoute><PaymentMethod /></ProtectedRoute>}></Route>
      <Route path='/products' element={<ProductPage />}></Route>
      <Route path='/search' element={<Search />}></Route>
      <Route path='/fillcarddetail' element={<CardDetail />}></Route>
      <Route path='/otp' element={<OTP />}></Route>
      <Route path='/admin' element={<AdminPage />}></Route>
      <Route path='/artist-portal' element={<ArtistPortal />}></Route>
      {/* Detalle de producto del artista */}
      <Route path='/:slug/producto/:productId' element={<ArtistProductPage />}></Route>
      {/* Ruta dinámica — cualquier /:slug que no haya matcheado arriba es una página de artista */}
      <Route path='/:slug' element={<ArtistPage />}></Route>
    </Routes>
  )
}

export default AllRoutes