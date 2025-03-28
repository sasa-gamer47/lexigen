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
import { createMindMap } from "@/lib/actions/mindmaps.actions";

import { useAuth } from "@clerk/nextjs";
import { getUserByClerkId } from "@/lib/actions/user.actions";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { createMindMapSchema } from "@/lib/validator";


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

  const [mindMap, setMindMap] = useState<any>({})

  const { isLoaded, isSignedIn, userId, sessionId, getToken } = useAuth()
    const [user, setUser] = useState<User>()





  useEffect(() => {
          const fetchUser = async () => {
              const user = userId ? await getUserByClerkId(userId) : null
              setUser(user?.[0])
  
              console.log('user: ', user?.[0])
          }
          fetchUser()
      }, [userId]);
  

  const geminiInputPrompt = (topic: string | undefined, textQuantity: string) => `
    create a mind map with ${topic} in json. this is the structure:
    each paragraph should ha ve this amount of text ${textQuantity}


      

    {
      "initialNodes": [
        {
          "id": "1",
          "position": { "x": 0, "y": 0 },
          "data": { "label": "Node 1" }
        }
      ],
      "initialEdges": [
        {
          "id": "e1-2",
          "source": "1",
          "target": "2",
          "animated": true,
          "label": "Edge 1-2"
        }
      ]
    }

    ONLY AND EXCLUSIVELY JSON OUTPUT
    IF THE OUTPUT IS TOO LONG, PLEASE REDUCE THE NUMBER OF NODES AND EDGES
    AND MAKE ALWAYS SURE TO HAVE A VALID JSON OUTPUT, THAT END IN THE RIGHT WAY 

    `;



  const [data, setData] = useState<{ initialNodes: any[]; initialEdges: any[] } | null>(null);
  // const form = useForm<{ mindMap: string; title: string; description: string }>();
const form = useForm<z.infer<typeof createMindMapSchema>>({
    resolver: zodResolver(createMindMapSchema),
    defaultValues: {
        title: '',
        description: '',
        mindMap: ''
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

    // console.log("API Key:", apiKey);

    const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-pro-exp-02-05",
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

      const result = await chatSession.sendMessage(geminiInputPrompt(userInput, data.textQuantity));
      const rawResponse = result.response.text();
      console.log("Gemini API Response Text:", rawResponse);

      // Extract JSON safely
      const jsonStart = rawResponse.indexOf("{");
      const jsonEnd = rawResponse.lastIndexOf("}");
      const jsonString = rawResponse.slice(jsonStart, jsonEnd + 1);

      console.log("Extracted JSON String:", jsonString);

      try {
        const jsonData = JSON.parse(jsonString);
        console.log("Parsed JSON Data:", jsonData);
        setData(jsonData);

        setMindMap(jsonData)
        
        if (user?._id) {
          const mindMapData = {
            title: data.title,
            description: data.description,
            owner: user._id,
            createdAt: new Date(),
            mindMap: jsonData
          }
      
          console.log(mindMapData)
      
          const newMindMap = await createMindMap(mindMapData)
      
          console.log("newMindMap: ", newMindMap)
        }


      } catch (jsonError: any) {
        console.error("Error parsing JSON response:", jsonError);
        console.error("Response text that failed to parse:", jsonString);
        alert("Error parsing Gemini response. Check console for details.");


        // secondRun(userInput, jsonString)

        
      }
    } catch (apiError: any) {
      console.error("Error from Gemini API:", apiError);
      alert("Error fetching data from Gemini API. Check console for details.");
    }
  }, [apiKey]);

  // const secondRun = useCallback(async (userInput: any, jsonData: any) => {

  //   console.log("running second time");
    


  //   const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
  //   const genAI = new GoogleGenerativeAI(apiKey);

  //   const model = genAI.getGenerativeModel({
  //     model: "gemini-2.0-pro-exp-02-05",
  //     safetySettings: [
  //       {
  //         category: HarmCategory.HARM_CATEGORY_HARASSMENT,
  //         threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  //       },
  //     ],
  //   });

  //   const generationConfig = {
  //     temperature: 1,
  //     topP: 0.95,
  //     topK: 64,
  //     maxOutputTokens: 8192,
  //     responseMimeType: "text/plain",
  //   };

  //   try {
  //     const chatSession = model.startChat({
  //       generationConfig,
  //       history: [],
  //     });

  //     console.log("Starting chat session...");




  //     const secondGeminiInputPrompt = (topic: any, jsonData: any) => `
  //     create a mind map with ${topic} in json. this is the structure:
  //     {
  //       "initialNodes": [
  //         {
  //           "id": "1",
  //           "position": { "x": 0, "y": 0 },
  //           "data": { "label": "Node 1" }
  //         }
  //       ],
  //       "initialEdges": [
  //         {
  //           "id": "e1-2",
  //           "source": "1",
  //           "target": "2",
  //           "animated": true,
  //           "label": "Edge 1-2"
  //         }
  //       ]
  //     }


  //     ${jsonData}

  //     YOU HAVE RECEIVED THE JSON OUTPUT FROM THE GEMINI API, THIS OUTPUT IS INCOMPLETE, PLEASE CONTINUE IT AND MAKE SURE IT ENDS IN THE RIGHT WAY

  //     ONLY AND EXCLUSIVELY JSON OUTPUT

  //     `;


  //     console.log("new input: ", secondGeminiInputPrompt(userInput, jsonData));

  //     const newResult = await chatSession.sendMessage(secondGeminiInputPrompt(userInput, jsonData));
  //     const newRawResponse = newResult.response.text();
  //     console.log("Gemini API Response Text:", newRawResponse);

  //     // Extract JSON safely
  //     const newJsonStart = newRawResponse.indexOf("{");
  //     const newJsonEnd = newRawResponse.lastIndexOf("}");
  //     const newJsonString = newRawResponse.slice(newJsonStart, newJsonEnd + 1);

  //     console.log("Extracted JSON String:", newJsonString);

  //     let newJsonData: any

  //     try {
  //        newJsonData = JSON.parse(newJsonString);
  //         console.log("Parsed JSON Data:", newJsonData);
  //         setData(newJsonData);
  //     } catch (jsonError: any) {
  //       console.error("Error parsing JSON response:", jsonError);
  //       console.error("Response text that failed to parse:", newJsonString);
  //       alert("Error parsing Gemini response. Check console for details.");

  //       // secondGeminiInputPrompt(userInput, jsonString)
  //       secondRun(userInput, newJsonString)
  //     }
  //   } catch (apiError: any) {
  //     console.error("Error from Gemini API:", apiError);
  //     alert("Error fetching data from Gemini API. Check console for details.");
  //   }

  // }, []) // Empty dependency array since no external values are used

  const onSubmit = async (data: z.infer<typeof createMindMapSchema>) => {
    console.log("Form Data:", data);
    const mindMapString = data.mindMap as string;
    setUserInput(mindMapString);
    run(mindMapString || '', data);
    console.log(geminiInputPrompt(mindMapString, data.textQuantity));


    

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
                name="mindMap"
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
              <FormField
                control={form.control}
                name="textQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sky-200 text-2xl font-bold">Description</FormLabel>
                    <FormControl>
                      <select 
                        className="w-full text-white outline-none border-none bg-white/5 p-2 text-md"
                        {...field}
                      >
                        <option value="only keywords">Brief and Direct (50-100 words)</option>
                        <option value="concise">Moderate Detail (100-200 words)</option>
                        <option value="moderate">Comprehensive (200-300 words)</option>
                        <option value="super detailed, a well written paragraph">In-Depth Analysis (300-500 words)</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
                <FormField
                  control={form.control}
                  name="theme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sky-200 text-2xl font-bold">Visual Theme</FormLabel>
                      <FormControl>
                        <select 
                          className="w-full text-white outline-none border-none bg-white/5 p-2 text-md"
                          {...field}
                        >
                          <option value="modern">Modern (Minimalist, Blue & White)</option>
                          <option value="nature">Nature (Organic, Green & Brown)</option>
                          <option value="tech">Tech (Dark Mode, Neon Accents)</option>
                          <option value="classic">Classic (Traditional, Black & White)</option>
                          <option value="creative">Creative (Colorful, Dynamic Layout)</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                )}/>
                
              <div className="w-full flex items-center justify-center">
                <Button type="submit">Generate Mind Map</Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
