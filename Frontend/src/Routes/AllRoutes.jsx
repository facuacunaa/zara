import React, { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../Components/ProtectedRoute'

const Homepage        = lazy(() => import('./Homepage'))
const SinglePage      = lazy(() => import('../Components/SinglePage'))
const Help            = lazy(() => import('../Components/Help'))
const SignIn          = lazy(() => import('./SignIn'))
const LogIn           = lazy(() => import('./LogIn'))
const Cart            = lazy(() => import('../Components/Cart'))
const Checkout        = lazy(() => import('../Components/Checkout'))
const Companylogin    = lazy(() => import('./Company'))
const PaymentMethod   = lazy(() => import('../Components/PaymentMethod'))
const Search          = lazy(() => import('../Components/Search'))
const CardDetail      = lazy(() => import('./CardDetail'))
const OTP             = lazy(() => import('./OTP'))
const ArtistPage      = lazy(() => import('./NataliaGomez'))
const ArtistProductPage = lazy(() => import('./ArtistProductPage'))
const AdminPage       = lazy(() => import('./AdminPage'))
const ArtistPortal    = lazy(() => import('./ArtistPortal'))
const ProductPage     = lazy(() => import('./ProductPage'))
const ExplorePage     = lazy(() => import('./ExplorePage'))

const AllRoutes = () => {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path='/'                          element={<Homepage />} />
        <Route path='/product/:id'               element={<SinglePage />} />
        <Route path='/help'                      element={<Help />} />
        <Route path='/company'                   element={<Companylogin />} />
        <Route path='/login'                     element={<LogIn />} />
        <Route path='/signin'                    element={<SignIn />} />
        <Route path='/cart'                      element={<Cart />} />
        <Route path='/checkout'                  element={<Checkout />} />
        <Route path='/paymentMethod'             element={<ProtectedRoute><PaymentMethod /></ProtectedRoute>} />
        <Route path='/products'                  element={<ProductPage />} />
        <Route path='/search'                    element={<Search />} />
        <Route path='/fillcarddetail'            element={<CardDetail />} />
        <Route path='/otp'                       element={<OTP />} />
        <Route path='/admin'                     element={<AdminPage />} />
        <Route path='/artist-portal'             element={<ArtistPortal />} />
        <Route path='/explorar'                  element={<ExplorePage />} />
        <Route path='/:slug/producto/:productId' element={<ArtistProductPage />} />
        <Route path='/:slug'                     element={<ArtistPage />} />
      </Routes>
    </Suspense>
  )
}

export default AllRoutes
