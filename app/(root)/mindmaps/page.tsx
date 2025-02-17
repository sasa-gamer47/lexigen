"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";

import Sidebar from "@/components/Sidebar";
import { useAuth } from "@clerk/nextjs";
import { getUserByClerkId } from "@/lib/actions/user.actions";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  import { Button } from "@/components/ui/button"
import { getMindMaps } from "@/lib/actions/mindmaps.actions";


interface User {
    _id: string;
    // add other user properties as needed
}

interface MindMap {
    _id: string;
    title: string;
    // add other mindmap properties as needed
}


export default function App() {
  
    const { isLoaded, isSignedIn, userId, sessionId, getToken } = useAuth()
    const [user, setUser] = useState<User | null>(null)
    const [mindMaps, setMindMaps] = useState<MindMap[]>([])


    useEffect(() => {
        const fetchUser = async () => {
            const user = userId ? await getUserByClerkId(userId) : null
            setUser(user[0])

            console.log('user: ', user[0])
        }

        fetchUser()
    }, [userId])
    
    useEffect(() => {
      const fetchMindMaps = async () => {
        const mindMaps = user ? await getMindMaps(user._id) : null

        console.log('mindMaps: ', mindMaps);
        
        setMindMaps(mindMaps)
      }
      
      fetchMindMaps()

      console.log(mindMaps)
    }, [user])
    



  return (
    <div className="lexigen-bg w-screen h-screen">

      <Sidebar />

      <div className="absolute w-5/6 right-0 top-20 bottom-0 p-5 flex flex-col items-center gap-y-5">
        <h1 className="text-sky-200 text-3xl font-semibold text-center">Create your Mind map</h1>
        <div className="w-full h-full grid grid-cols-3 gap-5">
            {mindMaps && mindMaps.length > 1 && mindMaps.map((mindMap, i) => (
              <div key={i} className='relative min-w-64 min-h-64 max-w-64 max-h-64 overflow-hidden opacity-35 cursor-pointer shadow-md'>
                <Link href={`/mindmaps/${mindMap._id}`}>
                  <Card>
                    <CardHeader className="max-h-8">
                      <CardTitle className='text-3xl font-bold text-cyan-700 text-center'>{mindMap.title}</CardTitle>
                    </CardHeader>
                  </Card>
                </Link>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}