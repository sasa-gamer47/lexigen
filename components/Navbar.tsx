import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import LexigenLogo from '@/img/LexigenLogo.png'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'



const Navbar = () => {

    const navTextHoverEffect = "hover:bg-cyan-800 px-4 py-2 rounded-full cursor-pointer duration-200 ease-in-out"


  return (
    <div className='absolute top-0 flex justify-between items-center w-full h-20 font-mono z-50'>
        <div className="relative w-1/4 h-full">
            <div className="w-full h-full flex items-center justify-center absolute">
                <Image src={LexigenLogo} width={75} height={75} alt="logo" />
            </div>
        </div>
        <div className="w-3/4 h-full">
            <div className="w-full h-full flex items-center justify-center">
                <div className="flex justify-around items-center w-full">
                    <ul className="flex justify-around w-3/4 text-semibold text-slate-100 text-xl">
                        <li className={navTextHoverEffect}>Home</li>
                        <li className={navTextHoverEffect}>About</li>
                        <li className={navTextHoverEffect}>Services</li>
                        <li className={navTextHoverEffect}>Blog</li>
                        <li className={navTextHoverEffect}>Contact</li>
                    </ul>
                    <div className="flex  w-1/4 items-center justify-center">
                        <SignedOut>
                            <Link href={"/sign-in"}>
                                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                    Sign In
                                </button>
                            </Link>
                        </SignedOut>
                        <SignedIn>
                            <UserButton />
                        </SignedIn>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Navbar