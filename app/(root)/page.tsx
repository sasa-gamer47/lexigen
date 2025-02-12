import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import Image from 'next/image';
import "../globals.css";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import MindmapLogo from "@/img/MindmapIcon.png"


export default function Home() {
  return (
    <div className="w-screen h-screen lexigen-bg">
      <div className="py-5 w-full h-full flex flex-col justify-center items-center relative">
        <section className="w-1/3 h-full mt-20 flex flex-col justify-center items-center">
          <h1 className="font-bold text-5xl text-sky-200">Title</h1>
          <p className='mt-5'>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Maiores et saepe dolorem suscipit repudiandae eaque amet, in fugit praesentium nam.
          </p>
        </section>
        <section className="relative flex items-center mt-10 justify-center w-2/3 h-full gap-4">
          <div className='relative flex items-center justify-center h-1/2'>
            <Card className='relative min-w-80 min-h-80 overflow-hidden opacity-35'>
              <CardHeader className="max-h-8">
                <CardTitle className='text-2xl text-center'>Mind maps</CardTitle>
              </CardHeader>
            </Card>
            <CardContent className="absolute  w-full h-full flex items-center justify-center">
              <Image src={MindmapLogo} layout='responsive' alt="mind map" />
            </CardContent>
          </div>
          <div className='relative flex items-center justify-center h-1/2'>
            <Card className='relative min-w-80 min-h-80 overflow-hidden opacity-35'>
              <CardHeader className="max-h-8">
                <CardTitle className='text-2xl text-center'>Mind maps</CardTitle>
              </CardHeader>
            </Card>
            <CardContent className="absolute  w-full h-full flex items-center justify-center">
              <Image src={MindmapLogo} layout='responsive' alt="mind map" />
            </CardContent>
          </div>
          <div className='relative flex items-center justify-center h-1/2'>
            <Card className='relative min-w-80 min-h-80 overflow-hidden opacity-35'>
              <CardHeader className="max-h-8">
                <CardTitle className='text-2xl text-center'>Mind maps</CardTitle>
              </CardHeader>
            </Card>
            <CardContent className="absolute  w-full h-full flex items-center justify-center">
              <Image src={MindmapLogo} layout='responsive' alt="mind map" />
            </CardContent>
          </div>

        </section>
      </div>
    </div>
  )
}







{/* <Card className='relative max-h-80 overflow-hidden opacity-75'>
<CardHeader className="max-h-8">
  <CardTitle className='text-2xl text-center'>Mind maps</CardTitle>
</CardHeader>
<CardContent className="relative w-full max-h-72 flex items-center justify-center">
  <Image src={MindmapLogo} layout='responsive' alt="mind map" />
</CardContent>
</Card> */}