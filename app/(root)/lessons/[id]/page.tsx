"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import 'reactflow/dist/style.css';

import Sidebar from "@/components/Sidebar";
import { useAuth } from "@clerk/nextjs";
import { getUserByClerkId } from "@/lib/actions/user.actions";
import { getLesson } from "@/lib/actions/lesson.actions";
import { Button } from "@/components/ui/button";
import { LessonContent, Lesson } from "@/types";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import vs from "react-syntax-highlighter/dist/esm/styles/prism/vs";
import dark from "react-syntax-highlighter/dist/esm/styles/prism/dark";
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node as ReactFlowNode,
  Edge,
} from "reactflow";
import "reactflow/dist/base.css";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import LessonDetails from "@/components/LessonDetails";

interface User {
    _id: string;
    clerkId: string;
    email: string;
    username: string;
}

export default function App({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);

    const { isLoaded, isSignedIn, userId, sessionId, getToken } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [lesson, setLesson] = useState<Lesson | null>(null);

    useEffect(() => {
        const fetchLesson = async () => {
            console.log(id);
            const fetchedLesson = user ? await getLesson(id) : null;
            console.log('Lesson data fetched from API: ', fetchedLesson);

            if (fetchedLesson) {
                setLesson(fetchedLesson);
                console.log('Lesson state updated with fetched data:', fetchedLesson);
            } else {
                console.log("Lesson data is not available from API.");
                setLesson(null);
            }
        };
        if (user) {
            console.log("Fetching Lesson for ID:", id);
            fetchLesson();
        }
    }, [user, id]);

    return (
        <div className="lexigen-bg w-screen h-screen">
            <Sidebar />

            <div className="absolute w-5/6 right-0 top-20 bottom-0 p-5 flex flex-col items-center gap-y-5">
                {lesson && <LessonDetails lesson={lesson} />}
            </div>
        </div>
    );
}
