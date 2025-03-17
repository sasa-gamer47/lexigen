"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { getQuizs } from "@/lib/actions/quizs.actions";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import Link from "next/link";
import { getUserByClerkId } from "@/lib/actions/user.actions";

interface Quiz {
    _id: string;
    title: string;
    description: string;
    createdAt: string;
    history?: any[]; // Make history optional
}

interface User {
    _id: string;
    // add other user properties as needed
}

const QuizesPage = () => {
    const router = useRouter();
    const [quizes, setQuizes] = useState<Quiz[]>([]);

    const { isLoaded, isSignedIn, userId, sessionId, getToken } = useAuth()
     const [user, setUser] = useState<User | null>(null)

     useEffect(() => {
             const fetchUser = async () => {
                 const user = userId ? await getUserByClerkId(userId) : null
                 setUser(user[0])
     
                 console.log('user: ', user[0])
             }
     
             fetchUser()
         }, [userId])

    useEffect(() => {
        if (userId) {
            const fetchQuizes = async () => {
                const quiz = user ? await getQuizs(user._id) : null

                console.log(quiz)
                setQuizes(quiz || []); // Handle potential undefined
            };
            fetchQuizes();
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
                    Your Quizzes
                </h1>
                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {quizes.length > 0 ? (
                        quizes.map((quiz) => (
                            <Link href={`/quizes/${quiz._id}`} key={quiz._id}>
                                <Card className="bg-black/10 hover:bg-black/20 transition-colors cursor-pointer">
                                    <CardHeader>
                                        <CardTitle className="text-white font-semibold">
                                            {quiz.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-white">
                                        <p className="text-sm">{quiz.description}</p>
                                        <div className="mt-4 flex justify-between items-center">
                                            <p className="text-xs text-gray-400">
                                                Created: {format(new Date(quiz.createdAt), "dd/MM/yyyy")}
                                            </p>
                                            {quiz.history?.length > 0 && ( // Optional chaining and check if greater than 0
                                                <p className="text-xs text-green-400">
                                                    {quiz.history.length} Attempts
                                                </p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    ) : (
                        <div className="text-white text-center col-span-full">
                            <p>You haven't created any quizzes yet.</p>
                            <Button className="mt-4" onClick={() => router.push('/quizes/create')}>Create Quiz</Button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default QuizesPage;
