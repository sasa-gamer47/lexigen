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
import { Button } from "@/components/ui/button"

import MindmapIcon from "@/img/MindmapIcon.png"
import QuizIcon from "@/img/QuizIcon.png"
import PowerpointIcon from "@/img/PowerpointIcon.png"


export default function Home() {

  const cardStyle = "relative flex items-center justify-center cursor-pointer hover:scale-95 transition-transform duration-300 ease-in-out"

  return (
    <div className="w-screen h-screen lexigen-bg">
      <div className="py-5 w-full h-full flex flex-col justify-center items-center relative">
        <section className="w-1/3 h-full mt-10 flex flex-col justify-center items-center">
          <h1 className="font-bold text-5xl text-sky-200">Benvenuto in Lexigen</h1>
          <p className='mt-5 text-slate-300 font-semibold'>
            Un potente strumento AI che rivoluzionerà il tuo modo di studiare.
          </p>
          <Button className='text-3xl font-bold px-8 py-8 mt-5 bg-slate-800 rounded-lg shadow-md'>Inizia adesso</Button>
        </section>
        <section className="relative flex items-center mt-10 justify-center w-2/3 h-full gap-4">
          <div className={`${cardStyle} h-1/2`}>
            <Card className='relative min-w-80 min-h-80 overflow-hidden opacity-35'>
              <CardHeader className="max-h-8">
                <CardTitle className='text-3xl font-bold text-cyan-700 text-center'>Mind maps</CardTitle>
              </CardHeader>
            </Card>
            <CardContent className="absolute top-5 w-full h-full flex items-center justify-center scale-125">
              <Image src={MindmapIcon} layout='responsive' alt="mind map" />
            </CardContent>
          </div>
          <div className={cardStyle}>
            <Card className='relative min-w-80 min-h-80 overflow-hidden opacity-35'>
              <CardHeader className="max-h-8">
                <CardTitle className='text-3xl font-bold text-cyan-700 text-center'>Quizes</CardTitle>
              </CardHeader>
            </Card>
            <CardContent className="absolute top-5 w-full h-full flex items-center justify-center">
              <Image src={QuizIcon} layout='responsive' alt="mind map" />
            </CardContent>
          </div>
          <div className={cardStyle}>
            <Card className='relative min-w-80 min-h-80 overflow-hidden opacity-35'>
              <CardHeader className="max-h-8">
                <CardTitle className='text-3xl font-bold text-cyan-700 text-center'>Powerpoints</CardTitle>
              </CardHeader>
            </Card>
            <CardContent className="absolute top-5 w-full h-full flex items-center justify-center">
              <Image src={PowerpointIcon} layout='responsive' alt="mind map" />
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