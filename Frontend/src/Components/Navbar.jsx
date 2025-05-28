import React, { useState } from 'react'
import {Menu,Search,Cast, Home, Compass, Download, Library} from "lucide-react"


const Navbar = () => {
  const [isopen , setIsopen]=useState(false)
  const toggleMenu = ()=>{
    setIsopen(!isopen);
  }
  return (
    <div>
      <nav className='bg-black'>
        <div className=' bg-black text-white'>
          <ul className='flex gap-[25vw] sm:gap-[40vw] ml-3 font-bold  '>
            <li className='self-start items-start flex gap-[2vw] sm:gap-[1vw]'> <button onClick={toggleMenu}><Menu className='mt-8 sm:ml-6'/></button>
            <img src="./cl.svg" alt="" srcset="" className='h-[10vh] w-[20vw] object-contain ' /></li>
            
          </ul>
        </div>

        <div className={` lg:flex flex-grow items-center space-x-6 bg-black text-white ${isopen ? "block " : "hidden " }`}>
          <ul className='font-serif font-bold sm:text-xl grid gap-5  ml-2 mt-[3vh]'>
          <li className='flex gap-3 self-center items-center '><Home className='h-[4vh] w-[6vw] ' /> <span className={`${isopen ? "block translate-x-0 " : "hidden  translate-x-full"}`}> Home</span> </li>
          <li className='flex gap-3 self-center items-center ' ><Compass className='h-[4vh] w-[6vw] ' /> <span className={`${isopen ? "block translate-x-0 " : "hidden  translate-x-full"}`}> Explore</span></li>
          <li className='flex gap-3 self-center items-center' ><Download className='h-[4vh] w-[6vw] ' />  <span className={`${isopen ? "block translate-x-0 " : "hidden  translate-x-full"}`}> Download</span> </li>
          <li className='flex gap-3 self-center items-center ' ><Library className='h-[4vh] w-[6vw] ' /> <span className={`${isopen ? "block translate-x-0 " : "hidden  translate-x-full"}`}> Library</span></li>
          </ul>
        </div>




      </nav>

    </div>
  )
}

export default Navbar