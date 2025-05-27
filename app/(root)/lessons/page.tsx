"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs"; // Import useAuth from @clerk/nextjs
import { useRouter } from "next/navigation";
import { getLessonsByUser } from "@/lib/actions/lesson.actions";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import Link from "next/link";
import { getUserByClerkId } from "@/lib/actions/user.actions";
import { Lesson } from "@/lib/models/lesson.model";


interface User {
    _id: string;
    // add other user properties as needed
}

const LessonsPage = () => {
    const router = useRouter();
    const [lessons, setLessons] = useState<Lesson[]>([]);

    const { isLoaded, isSignedIn, userId, sessionId, getToken } = useAuth()
     const [user, setUser] = useState<User | null>(null)

     useEffect(() => {
        const fetchUser = async () => {
            if (userId) {
                const user = await getUserByClerkId(userId);
                if (user && user.length > 0) {
                    setUser(user[0]);
                    console.log('user: ', user[0]);
                } else {
                    console.error("User not found");
                }
            }
        };

        fetchUser();
    }, [userId]);

    useEffect(() => {
        if (userId) {
            const fetchLessons = async () => {
                const quiz = user ? await getLessonsByUser(user._id) : null

                console.log(quiz)
                setLessons(quiz || []); // Handle potential undefined
            };
            fetchLessons();
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
                    Your Lessons
                </h1>
                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {lessons.length > 0 ? (
                        lessons.map((lesson) => (
                            <Link href={`/lessons/${lesson._id}`} key={lesson._id}>
                                <Card className="bg-black/10 hover:bg-black/20 transition-colors cursor-pointer">
                                    <CardHeader>
                                        <CardTitle className="text-white font-semibold">
                                            {lesson.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-white">
                                        <p className="text-sm text-gray-300 mb-2">{lesson.description}</p>
                                        {lesson.lessons && lesson.lessons.length > 0 && lesson.lessons[0] && typeof lesson.lessons[0].simplified === 'string' && lesson.lessons[0].simplified.length > 0 && (
                                            <>
                                                <p className="text-xs text-sky-300 mb-1">Lesson Preview:</p>
                                                <p className="text-sm mb-3">
                                                    {lesson.lessons[0].simplified.substring(0, 100)}
                                                    {lesson.lessons[0].simplified.length > 100 ? "..." : ""}
                                                </p>
                                            </>
                                        )}
                                        <div className="mt-4 flex justify-between items-center">
                                            <p className="text-xs text-gray-400">
                                                Created: {format(new Date(lesson.createdAt), "dd/MM/yyyy")}
                                            </p>
                                            {lesson.history && lesson.history.length > 0 && ( 
                                                <p className="text-xs text-green-400">
                                                    {lesson.history.length} Attempts
                                                </p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        )) 
                    ) : (
                        <div className="text-white text-center col-span-full">
                            <p>You haven't created any lessons yet.</p>
                            <Button className="mt-4" onClick={() => router.push('/lessons/create')}>Create Lesson</Button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};
export default LessonsPage;
