import React from 'react'
import Navbar from '../components/Navbar'
import Header from '../components/Header'

const Home = () => {
  return (
    <div className='flex flx-col items-center justify-center min-h-screen bg-[url("/bg_img.png")] bg-over bg-center'>
        <Navbar/>
        <Header/>
    </div>
  )
}

export default Home