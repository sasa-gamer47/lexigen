"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/Sidebar";
import { Textarea } from "@/components/ui/textarea";
import { createQuiz } from "@/lib/actions/quizs.actions";
import { CreateQuizParams } from "@/types";

import { useAuth } from "@clerk/nextjs";
import { getUserByClerkId } from "@/lib/actions/user.actions";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { createQuizSchema } from "@/lib/validator";


interface User {
  _id: string;
  clerkId: string;
  email: string;
  username: string;
}


const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export default function App() {
  const [userInput, setUserInput] = useState<string | undefined>();
  const [secondInput, setsecondInput] = useState<any>()

  const [quiz, setQuiz] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isLoaded, isSignedIn, userId, sessionId, getToken } = useAuth()
    const [user, setUser] = useState<User | null>(null);
    const [userID, setUserID] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            if (userId) {
                const fetchedUser = await getUserByClerkId(userId);
                setUser(fetchedUser?.[0] || null);
                setUserID(fetchedUser?.[0]?._id || null);
            }
        };
        fetchUser();
    }, [userId]);
  

  const geminiInputPrompt = (topic: string | undefined, ) => `
    create a mutiple answer quiz with ${topic} in json. this is the structure:
    each question hust have 4 answers, only one is the correct answer, you will allso provide the explanation
    for it based on the topic, and why the other are mistaken, all this in four short points
    generate at least 30 questions
    [
    {
        question:,
        options: [
            {
                answer:,
                correct,
            }
        ],
        explanation: {
            correctReason:,
            incorrectReasons: [],
        }
    }
    ]
    

    ONLY AND EXCLUSIVELY JSON OUTPUT
    IF THE OUTPUT IS TOO LONG, PLEASE REDUCE THE NUMBER OF QUESTIONS
    AND MAKE ALWAYS SURE TO HAVE A VALID JSON OUTPUT, THAT END IN THE RIGHT WAY 

    `;



  const [data, setData] = useState<{ initialNodes: any[]; initialEdges: any[] } | null>(null);
  // const form = useForm<{ quiz: string; title: string; description: string }>();
const form = useForm<z.infer<typeof createQuizSchema>>({
    resolver: zodResolver(createQuizSchema),
    defaultValues: {
        title: '',
        description: '',
        quiz: ''
    },
})

  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);

  useEffect(() => {
    if (data) {
      console.log("Setting nodes and edges from data:", data);
      setNodes(data.initialNodes || []);
      setEdges(data.initialEdges || []);
    }
  }, [data]);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const run = useCallback(async (userInput: string, data: any) => {
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set in environment variables!");
      alert("API key is missing. Check console for details.");
      return;
    }

    if (!userID) {
        console.error("User ID is not available yet.");
        return;
    }

    setIsLoading(true);
    setError(null);
    console.log("Starting AI process...");

    const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };

    try {
      const chatSession = model.startChat({
        generationConfig,
        history: [],
      });

      console.log("Starting chat session...");

      const result = await chatSession.sendMessage(geminiInputPrompt(userInput));
      const rawResponse = result.response.text();
      console.log("Gemini API Response Text:", rawResponse);

      // Extract JSON safely
      const jsonStart = rawResponse.indexOf("[");
      const jsonEnd = rawResponse.lastIndexOf("]");
      const jsonString = rawResponse.slice(jsonStart, jsonEnd + 1);

      console.log("Extracted JSON String:", jsonString);

      try {
        const jsonData = JSON.parse(jsonString);
        console.log("Parsed JSON Data:", jsonData);
        setData(jsonData);

        setQuiz(jsonData)

        console.log(user);
        console.log(userID);
        
        
        
        console.log('helllloooou');
            
        const quizData: CreateQuizParams = {
            title: data.title,
            description: data.description,
            owner: userID,
            createdAt: new Date(),
            quiz: jsonData,
            history: [],

        }
      
        console.log(quizData)
      
        const newQuiz = await createQuiz(quizData)
      
        console.log("newQuiz: ", newQuiz)
        console.log("AI process completed successfully!");

      } catch (jsonError: any) {
        console.error("Error parsing JSON response:", jsonError);
        console.error("Response text that failed to parse:", jsonString);
        alert("Error parsing Gemini response. Check console for details.");
        setError("Error parsing Gemini response.");
      }
    } catch (apiError: any) {
      console.error("Error from Gemini API:", apiError);
      alert("Error fetching data from Gemini API. Check console for details.");
      setError("Error fetching data from Gemini API.");
    } finally {
        setIsLoading(false);
    }
  }, [apiKey, userID]);


  const onSubmit = async (data: z.infer<typeof createQuizSchema>) => {
    console.log("Form Data:", data);
    const quizString = data.quiz as string;
    setUserInput(quizString);
    run(quizString || '', data);
    console.log(geminiInputPrompt(quizString));


    

  };

  return (
    <div className="lexigen-bg w-screen h-screen">

      <Sidebar />

      <div className="absolute w-5/6 right-0 top-20 bottom-0 p-5 flex flex-col items-center gap-y-5">
        <h1 className="text-sky-200 text-3xl font-semibold text-center">Create your Mind map</h1>
        <div className="w-full flex items-center justify-center">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sky-200 text-2xl font-bold">Title</FormLabel>
                    <FormControl>
                      <Input className="text-white outline-none border-none bg-white/5 p-2 text-md" placeholder="Enter a title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sky-200 text-2xl font-bold">Description</FormLabel>
                    <FormControl>
                      <Textarea className="text-white outline-none border-none bg-white/5 p-2 text-md" placeholder="Enter a description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              <FormField
                control={form.control}
                name="quiz"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sky-200 text-2xl font-bold">Prompt</FormLabel>
                    <FormControl>
                      <Textarea 
                      className="text-white outline-none border-none bg-white/5 p-2 text-md" 
                      placeholder="Enter your prompt" 
                      {...field} 
                      value={typeof field.value === 'string' ? field.value : ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
             
                
              <div className="w-full flex items-center justify-center">
                <Button type="submit" disabled={isLoading}>Generate Mind Map</Button>
              </div>
            </form>
          </Form>
        </div>
        {isLoading && <p className="text-white">Loading... Please wait.</p>}
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </div>
  );
}
