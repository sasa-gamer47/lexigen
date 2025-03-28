"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { getMindMaps } from "@/lib/actions/mindmaps.actions";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getUserByClerkId } from "@/lib/actions/user.actions";

interface Mindmap {
    _id: string;
    title: string;
    description: string;
    createdAt: string;
    // Add other properties if needed
}

interface User {
    _id: string;
    // add other user properties as needed
}

const MindmapsPage = () => {
    const router = useRouter();
    const [mindmaps, setMindmaps] = useState<Mindmap[]>([]);
    const { isLoaded, isSignedIn, userId, sessionId, getToken } = useAuth()
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        const fetchUser = async () => {
            const user = userId ? await getUserByClerkId(userId) : null
            setUser(user?.[0])

            console.log('user: ', user?.[0])
        }

        fetchUser()
    }, [userId])

    useEffect(() => {
        if (user) {
            const fetchMindmaps = async () => {
                const fetchedMindmaps = await getMindMaps(user._id);
                setMindmaps(fetchedMindmaps || []);
            };
            fetchMindmaps();
        }
    }, [user]);

    if (!isLoaded) {
        return <div>Loading...</div>;
    }

    if (!userId) {
        router.push("/");
        return null;
    }

    return (
        <div className="lexigen-bg w-screen h-screen">
            <Sidebar />
            <main className="absolute w-5/6 right-0 top-20 bottom-0 p-5 flex flex-col items-center gap-y-5">
                <h1 className="text-sky-200 text-3xl font-semibold text-center">
                    Your Mindmaps
                </h1>
                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {mindmaps.length > 0 ? (
                        mindmaps.map((mindmap) => (
                            <Link href={`/mindmaps/${mindmap._id}`} key={mindmap._id}>
                                <Card className="bg-black/10 hover:bg-black/20 transition-colors cursor-pointer">
                                    <CardHeader>
                                        <CardTitle className="text-white font-semibold">
                                            {mindmap.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-white">
                                        <p className="text-sm">{mindmap.description}</p>
                                        <div className="mt-4 flex justify-between items-center">
                                            <p className="text-xs text-gray-400">
                                                Created: {format(new Date(mindmap.createdAt), "dd/MM/yyyy")}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    ) : (
                        <div className="text-white text-center col-span-full">
                            <p>You haven't created any mindmaps yet.</p>
                            <Button className="mt-4" onClick={() => router.push('/mindmaps/create')}>Create Mindmap</Button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MindmapsPage;
