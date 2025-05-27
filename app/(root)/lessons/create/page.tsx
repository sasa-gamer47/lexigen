"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@clerk/nextjs";
import { getUserByClerkId } from "@/lib/actions/user.actions";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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

import { Prism as SyntaxHighlightser } from "react-syntax-highlighter";
import vs from "react-syntax-highlighter/dist/esm/styles/prism/vs";
import dark from "react-syntax-highlighter/dist/esm/styles/prism/dark";
import { createLesson } from '@/lib/actions/lesson.actions';
import { CreateLessonParams } from '@/types';
// import { createLessonSchema } from '@/lib/validations/lesson';
import * as z from "zod";


const createLessonSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  prompt: z.string().min(1, { message: "Prompt is required" }),
});


interface User {
  _id: string;
  clerkId: string;
  email: string;
  username: string;
}

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export default function CreateLessonPage() {
  const [userInput, setUserInput] = useState<string | undefined>();
  const [lesson, setLesson] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [lessonLoading, setLessonLoading] = useState<boolean>(false);
  const { userId } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [userID, setUserID] = useState<string | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState<ReactFlowNode[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);

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

  useEffect(() => {
    console.log("Lessons:", lessons);
    console.log(lesson)
  }, [lessons])

  const createReactFlowElements = (mindMapData: any) => {
    const newNodes: ReactFlowNode[] = [];
    const newEdges: Edge[] = [];
    const nodePositions: { [key: string]: { x: number; y: number } } = {};
    const nodeWidth = 150;
    const nodeHeight = 50;
    const horizontalSpacing = 200;
    const verticalSpacing = 100;// ... (rest of your code)
    
      const createReactFlowElements = (mindMapData: any) => {
        const newNodes: ReactFlowNode[] = [];
        const newEdges: Edge[] = [];
        const nodePositions: { [key: string]: { x: number; y: number } } = {};
        const nodeWidth = 150;
        const nodeHeight = 50;
        // Increased spacing values
        const horizontalSpacing = 300; // Increased from 200
        const verticalSpacing = 150;   // Increased from 100
    
        const traverse = (
          node: any,
          parentId: string | null,
          level: number,
          index: number
        ) => {
          const nodeId = node.id;
          const nodeLabel = node.name;
          const x = parentId
            ? nodePositions[parentId].x +
              (index % 2 === 0 ? -horizontalSpacing : horizontalSpacing)
            : window.innerWidth / 2 - nodeWidth / 2;
          const y = parentId
            ? nodePositions[parentId].y + verticalSpacing
            : window.innerHeight / 4 - nodeHeight / 2;
          nodePositions[nodeId] = { x, y };
    
          newNodes.push({
            id: nodeId,
            type: "default",
            position: { x, y },
            data: { label: nodeLabel },
            style: {
              backgroundColor: "#333",
              color: "white",
              border: "1px solid #666",
              borderRadius: "5px",
              padding: "10px",
              fontSize: "14px",
              textAlign: "center",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
              width: "auto",
              height: "auto",
              display: "flex",
              alignItems: "center",
            },
          });
    
          if (parentId) {
            newEdges.push({
              id: `e-${parentId}-${nodeId}`,
              source: parentId,
              target: nodeId,
              type: "smoothstep",
              animated: true,
              sourceHandle: "bottom",
              targetHandle: "top",
              style: { stroke: "#666", strokeWidth: 2 },
            });
          }
    
          if (node.children && node.children.length > 0) {
            node.children.forEach((child: any, childIndex: number) => {
              traverse(child, nodeId, level + 1, childIndex);
            });
          }
        };
    
        if (mindMapData && mindMapData.id && mindMapData.name) {
          traverse(mindMapData, null, 0, 0);
        } else {
          console.warn("Mind map data is missing or malformed:", mindMapData);
        }
        return { nodes: newNodes, edges: newEdges };
      };
    
      const calculateNodePositions = (nodes: ReactFlowNode[], edges: Edge[]) => {
        // Create adjacency list
        const graph: { [key: string]: string[] } = {};
        edges.forEach(edge => {
          if (!graph[edge.source]) graph[edge.source] = [];
          graph[edge.source].push(edge.target);
        });
    
        // Find root node (node with no incoming edges)
        const hasIncoming: { [key: string]: boolean } = {};
        edges.forEach(edge => {
          hasIncoming[edge.target] = true;
        });
        const rootId = nodes.find(node => !hasIncoming[node.id])?.id;
    
        if (!rootId) return nodes;
    
        // Calculate levels using BFS
        const levels: { [key: string]: number } = {};
        const queue = [rootId];
        levels[rootId] = 0;
        let maxLevel = 0;
    
        while (queue.length > 0) {
          const current = queue.shift()!;
          if (graph[current]) {
            for (const child of graph[current]) {
              if (levels[child] === undefined) {
                levels[child] = levels[current] + 1;
                maxLevel = Math.max(maxLevel, levels[child]);
                queue.push(child);
              }
            }
          }
        }
    
        // Calculate nodes per level
        const nodesPerLevel: { [key: number]: string[] } = {};
        Object.entries(levels).forEach(([nodeId, level]) => {
          if (!nodesPerLevel[level]) nodesPerLevel[level] = [];
          nodesPerLevel[level].push(nodeId);
        });
    
        // Position nodes
        const verticalSpacing = 200; // Increased from 100
        const horizontalSpacing = 400; // Increased from 200
        const updatedNodes = nodes.map(node => {
          const level = levels[node.id];
          const nodesInLevel = nodesPerLevel[level].length;
          const indexInLevel = nodesPerLevel[level].indexOf(node.id);
          const x = horizontalSpacing * (indexInLevel - (nodesInLevel - 1) / 2);
          const y = level * verticalSpacing;
    
          return {
            ...node,
            position: { x, y }
          };
        });
    
        return updatedNodes;
      };
    
    // ... (rest of your code)
    

    const traverse = (
      node: any,
      parentId: string | null,
      level: number,
      index: number
    ) => {
      const nodeId = node.id;
      const nodeLabel = node.name;
      const x = parentId
        ? nodePositions[parentId].x +
          (index % 2 === 0 ? -horizontalSpacing : horizontalSpacing)
        : window.innerWidth / 2 - nodeWidth / 2;
      const y = parentId
        ? nodePositions[parentId].y + verticalSpacing
        : window.innerHeight / 4 - nodeHeight / 2;
      nodePositions[nodeId] = { x, y };

      newNodes.push({
        id: nodeId,
        type: "default",
        position: { x, y },
        data: { label: nodeLabel },
        style: {
          backgroundColor: "#333",
          color: "white",
          border: "1px solid #666",
          borderRadius: "5px",
          padding: "10px",
          fontSize: "14px",
          textAlign: "center",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
          width: "auto",
          height: "auto",
          display: "flex",
          alignItems: "center",
        },
      });

      if (parentId) {
        newEdges.push({
          id: `e-${parentId}-${nodeId}`,
          source: parentId,
          target: nodeId,
          type: "smoothstep",
          animated: true,
          sourceHandle: "bottom",
          targetHandle: "top",
          style: { stroke: "#666", strokeWidth: 2 },
        });
      }

      if (node.children && node.children.length > 0) {
        node.children.forEach((child: any, childIndex: number) => {
          traverse(child, nodeId, level + 1, childIndex);
        });
      }
    };

    if (mindMapData && mindMapData.id && mindMapData.name) {
      traverse(mindMapData, null, 0, 0);
    } else {
      console.warn("Mind map data is missing or malformed:", mindMapData);
    }
    return { nodes: newNodes, edges: newEdges };
  };

  const handleMindMapChange = useCallback((mindMapData: any) => {
    if (mindMapData && typeof mindMapData === "object" && mindMapData.id) {
      const { nodes: newNodes, edges: newEdges } = createReactFlowElements(
        mindMapData
      );
      setNodes(newNodes);
      setEdges(newEdges);
    } else {
      console.warn("Attempted to process invalid mindMapData:", mindMapData);
      setNodes([]);
      setEdges([]);
    }
  }, []);

  const geminiIndexPrompt = (
    topic: string | undefined,
    language: string | undefined
  ) => `
  You are a master teacher, your goal is to help students learn a specific topic in a specific language.
  Your task is to create a comprehensive learning path for the topic "${topic}" in the language "${language}".

  First, generate an index of things to learn to completely apprehend the given topic.
  This index should be detailed and cover all aspects of the topic. The index should be in a multi dimensional array.
  **Limit the total number of lessons to a maximum of 20.** If the topic is too broad, focus on the most important subtopics to fit within this limit. Each sub-array should represent a group of related lessons, and the total number of items across all sub-arrays should not exceed 20.

  The output should be in JSON format, structured as follows:

  {
    "topic": "${topic}",
    "language": "${language}",
    "index": [
        [
            "Index Item 1.1",
            "Index Item 1.2",
            "Index Item 1.3"
        ],
        [
            "Index Item 2.1",
            "Index Item 2.2",
            "Index Item 2.3"
        ]
    ]
  }

  Ensure the JSON output is valid and well-formatted.
  `;


  const calculateNodePositions = (nodes: ReactFlowNode[], edges: Edge[]) => {
    // Create adjacency list
    const graph: { [key: string]: string[] } = {};
    edges.forEach(edge => {
      if (!graph[edge.source]) graph[edge.source] = [];
      graph[edge.source].push(edge.target);
    });

    // Find root node (node with no incoming edges)
    const hasIncoming: { [key: string]: boolean } = {};
    edges.forEach(edge => {
      hasIncoming[edge.target] = true;
    });
    const rootId = nodes.find(node => !hasIncoming[node.id])?.id;

    if (!rootId) return nodes;

    // Calculate levels using BFS
    const levels: { [key: string]: number } = {};
    const queue = [rootId];
    levels[rootId] = 0;
    let maxLevel = 0;

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (graph[current]) {
        for (const child of graph[current]) {
          if (levels[child] === undefined) {
            levels[child] = levels[current] + 1;
            maxLevel = Math.max(maxLevel, levels[child]);
            queue.push(child);
          }
        }
      }
    }

    // Calculate nodes per level
    const nodesPerLevel: { [key: number]: string[] } = {};
    Object.entries(levels).forEach(([nodeId, level]) => {
      if (!nodesPerLevel[level]) nodesPerLevel[level] = [];
      nodesPerLevel[level].push(nodeId);
    });

    // Position nodes
    const verticalSpacing = 100;
    const horizontalSpacing = 200;
    const updatedNodes = nodes.map(node => {
      const level = levels[node.id];
      const nodesInLevel = nodesPerLevel[level].length;
      const indexInLevel = nodesPerLevel[level].indexOf(node.id);
      const x = horizontalSpacing * (indexInLevel - (nodesInLevel - 1) / 2);
      const y = level * verticalSpacing;

      return {
        ...node,
        position: { x, y }
      };
    });

    return updatedNodes;
  };

  const geminiLessonPrompt = (
    topic: string | undefined,
    language: string | undefined,
    index: string | undefined,
    indexNumber: number,
    itemNumber: number
  ) => `
    You are a master teacher, your goal is to help students learn a specific topic in a specific language.
    Your task is to create a comprehensive learning path for the topic "${topic}" in the language "${language}".

    You will be given an index item, your task is to create a structured lesson for this item.
    The index item is "${index}".

    Generate the following sections for the lesson:
    1. Index Title: The title of the index item ("${index}").
    2. Simplified Explanation: A clear and concise explanation of the concept, suitable for beginners. Write it in markdown format.
    3. Super Detailed Explanation: An in-depth explanation of the concept, covering all nuances and complexities. Write it in markdown format. Make it as detailed as possible, use bold and cursive when needed make also lists if needed
    4. Schematic: A structured outline or bulleted list summarizing the key components or steps related to the concept. Write it in simple text or markdown list format.
    5. Index Number: ${indexNumber}
    6. Item Number: ${itemNumber}

    The output should be in JSON format, structured as follows:
    {
      "indexTitle": "${index}",
      "item": "${index}",
      "simplified": "Simplified explanation of Index Item in Markdown.",
      "detailed": "Detailed explanation of Index Item in Markdown. Include code examples if applicable.",
      "schematic": "Schematic outline of Index Item as text or markdown list.",
      "indexNumber": ${indexNumber},
      "itemNumber": ${itemNumber}
    }

    Ensure the JSON output is VALID and well-formatted. Escape any necessary characters within the JSON strings (like quotes or backslashes).
    
    MAKE SURE THE JSON IS VALID AND WELL-FORMATTED.

    if the output is too long and the json isn't respected make sure to short it till the Json is valid
    `;

  // . Include code examples if relevant to the topic, using markdown code blocks.

  const geminiMindMapPrompt = (
    topic: string | undefined,
    language: string | undefined,
    index: string | undefined,
    indexNumber: number,
    itemNumber: number
  ) => `
  You are a master teacher specializing in creating visual learning aids.
  Your task is to create a hierarchical mind map structure for the specific index item "${index}" related to the main topic "${topic}" in the language "${language}".

  The mind map should represent the core concept (${index}) as the root node and branch out to its key sub-components, related ideas, or steps. Keep the structure relatively simple, focusing on the main relationships for this specific index item.

  Generate the following structure:
  1. Index Title: The title of the index item ("${index}").
  2. Mind Map: A JSON object representing the mind map structure. The root node should have the name of the index item. Include at least 2-3 child nodes representing key aspects. Add further nested children if logical for the concept. Use unique IDs for each node.
  3. Index Number: ${indexNumber}
  4. Item Number: ${itemNumber}


  The output should be ONLY the JSON object, structured exactly as follows:
  {
    "indexTitle": "${index}",
    "item": "${index}",
    "mindMap": {
      "id": "root-${indexNumber}-${itemNumber}",
      "name": "${index}",
      "children": [
        {
          "id": "child1-${indexNumber}-${itemNumber}",
          "name": "Key Aspect 1",
          "children": []
        },
        {
          "id": "child2-${indexNumber}-${itemNumber}",
          "name": "Key Aspect 2",
          "children": [
             {
               "id": "subchild1-${indexNumber}-${itemNumber}",
               "name": "Detail A",
               "children": []
             }
          ]
        },
         {
          "id": "child3-${indexNumber}-${itemNumber}",
          "name": "Key Aspect 3",
          "children": []
        }
      ]
    },
    "indexNumber": ${indexNumber},
    "itemNumber": ${itemNumber}
  }

  Ensure the JSON output is valid and well-formatted. The root node's name MUST be exactly "${index}".
  `;

  const form = useForm<z.infer<typeof createLessonSchema>>({
    resolver: zodResolver(createLessonSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const handleGoBack = () => {
    window.history.back();
  };

  const run = useCallback(
    async (userInput: string, data: any) => {
      if (!apiKey) {
        console.error("GEMINI_API_KEY is not set in environment variables!");
        toast.error("API key is missing. Cannot generate lesson.");
        setError("API key is missing.");
        return;
      }

      if (!userID) {
        console.error("User ID is not available yet.");
        toast.error("User information not loaded. Please try again shortly.");
        setError("User information not loaded.");
        return;
      }

      setLessonLoading(true);
      setIsLoading(true);
      setError(null);
      setLesson(null);
      // setLessons([]);
      const cleanedUserInput = userInput.trim();
      if (!cleanedUserInput) {
        toast.error("Please enter a valid topic/prompt for the lesson.");
        setError("Topic/prompt cannot be empty.");
        return;
      }

      const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } =
        await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(apiKey);

      const modelId = "gemini-1.5-flash-latest";
      console.log(`Attempting to use Gemini model: ${modelId}`);
      const model = genAI.getGenerativeModel({
        model: modelId,
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
      });

      const generationConfig = {
        maxOutputTokens: 8192,
        responseMimeType: "text/plain",
      };

      try {
        const chatSession = model.startChat({
          generationConfig,
          history: [],
        });

        toast.info("Generating lesson index...");
        const indexResult = await chatSession.sendMessage(
          geminiIndexPrompt(userInput, "italiano")
        );
        const indexRawResponse = indexResult.response.text();
        console.log("✅ Index generation completed successfully");

        let jsonData;
        try {
          const jsonStartIndex = indexRawResponse.indexOf("{");
          const jsonEndIndex = indexRawResponse.lastIndexOf("}");
          if (jsonStartIndex === -1 || jsonEndIndex === -1)
            throw new Error("Could not find JSON object in index response.");
          const jsonStringIndex = indexRawResponse.slice(
            jsonStartIndex,
            jsonEndIndex + 1
          );
          jsonData = JSON.parse(jsonStringIndex);
          console.log("✅ Index JSON parsing completed successfully");
        } catch (parseError: any) {
          console.error("Error parsing index JSON:", parseError);
          console.error("Raw Index Response:", indexRawResponse);
          toast.error("Failed to parse lesson index structure.");
          setError("Failed to parse lesson index structure. Check console.");
          return;
        }

        const indexArray = jsonData.index;
        const topic = jsonData.topic;
        const language = jsonData.language;

        if (!Array.isArray(indexArray) || indexArray.length === 0) {
          toast.error("Generated index is empty or invalid.");
          setError("Generated index is empty or invalid.");
          return;
        }

        if (indexArray.length > 20) {
          toast.error("Cannot generate more than 20 lessons in total.");
          setError("Cannot generate more than 20 lessons in total.");
          return;
        }

        const tempLessons: any[] = [];

        for (const [indexNumber, indexSubArray] of indexArray.entries()) {
          if (!Array.isArray(indexSubArray)) {
            console.warn(`Skipping invalid sub-index at index ${indexNumber}`);
            continue;
          }
          const subLessons: any[] = [];
          for (const [itemNumber, item] of indexSubArray.entries()) {
            if (typeof item !== "string" || !item.trim()) {
              console.warn(
                `Skipping invalid item at index ${indexNumber}-${itemNumber}`
              );
              continue;
            }

            toast.info(`Generating content for: ${item}...`);

            const lessonResult = await chatSession.sendMessage(
              geminiLessonPrompt(topic, language, item, indexNumber, itemNumber)
            );
            const lessonRawResponse = lessonResult.response.text();
            console.log(
              `✅ Lesson content generation completed for item ${indexNumber}.${itemNumber}: ${item}`
            );

            let lessonJsonData;
            try {
              const lessonJsonStart = lessonRawResponse.indexOf("{");
              const lessonJsonEnd = lessonRawResponse.lastIndexOf("}");
              if (lessonJsonStart === -1 || lessonJsonEnd === -1)
                throw new Error(
                  "Could not find JSON object in lesson response."
                );
              const lessonJsonString = lessonRawResponse.slice(
                lessonJsonStart,
                lessonJsonEnd + 1
              );
              const cleanedLessonJsonString = lessonJsonString.replace(
                /```json\s*|```/g,
                ""
              );
              lessonJsonData = JSON.parse(cleanedLessonJsonString.trim());
              console.log(
                `✅ Lesson JSON parsing completed for item ${indexNumber}.${itemNumber}`
              );
            } catch (parseError: any) {
              console.error(
                `Error parsing lesson JSON for item "${item}":`,
                parseError
              );
              console.error("Raw Lesson Response:", lessonRawResponse);
              toast.error(`Failed to parse content for "${item}". Skipping.`);
              continue;
            }

            toast.info(`Generating mind map for: ${item}...`);
            const mindMapResult = await chatSession.sendMessage(
              geminiMindMapPrompt(
                topic,
                language,
                item,
                indexNumber,
                itemNumber
              )
            );
            const mindMapRawResponse = mindMapResult.response.text();
            console.log(
              `✅ Mind map generation completed for item ${indexNumber}.${itemNumber}: ${item}`
            );

            try {
              const mindMapJsonStart = mindMapRawResponse.indexOf("{");
              const mindMapJsonEnd = mindMapRawResponse.lastIndexOf("}");
              if (mindMapJsonStart === -1 || mindMapJsonEnd === -1)
                throw new Error(
                  "Could not find JSON object in mind map response."
                );
              const mindMapJsonString = mindMapRawResponse.slice(
                mindMapJsonStart,
                mindMapJsonEnd + 1
              );
              const cleanedMindMapJsonString = mindMapJsonString.replace(
                /^```json\s*|\s*```$/g,
                ""
              );
              const mindMapData = JSON.parse(cleanedMindMapJsonString);
              console.log(
                `✅ Mind map JSON parsing completed for item ${indexNumber}.${itemNumber}`
              );
              lessonJsonData.mindMap = mindMapData.mindMap;
            } catch (parseError: any) {
              console.error(
                `Error parsing mind map JSON for item "${item}":`,
                parseError
              );
              console.error("Raw Mind Map Response:", mindMapRawResponse);
              toast.warning(
                `Failed to parse mind map for "${item}". Mind map will be missing.`
              );
              lessonJsonData.mindMap = null;
            }

            console.log("cooking")
            console.log(lessonJsonData)

            subLessons.push(lessonJsonData);            
            tempLessons.push(subLessons);
            console.log(lessons)
            setLessons(tempLessons)
            
            if (tempLessons.length >= 20) {
              break;
            }
            
          }
        }

        const finalLesson: any = {
          topic: topic,
          index: indexArray,
          language: language,
          
          lessons: tempLessons.slice(0, 20),
        };

        const lessonData: CreateLessonParams = {
          title: data.title,
          description: data.description,
          owner: userID,
          createdAt: new Date(),
          topic: finalLesson.topic,
          language: finalLesson.language,
          index: finalLesson.index,
          lessons: tempLessons,
          history: []
        };
        
        console.log(lessonData)

        // Save the lesson
        try {
          const savedLesson = await createLesson(lessonData);
          toast.success("Lesson created and saved successfully!");
          setLesson(finalLesson);
        } catch (error) {
          console.error("Error saving lesson:", error);
          toast.error("Failed to save the lesson");
        }
        
        setLesson(finalLesson);

        if (tempLessons[0]?.[0]?.mindMap) {
          tempLessons.forEach((subLesson) => finalLesson.lessons.push(subLesson));
        } else {
          handleMindMapChange(null);
        }

        // const quizData: CreateQuizParams = {
        //   title: data.title,
        //   description: data.description,
        //   owner: userID,
        //   createdAt: new Date(),
        //   quiz: finalLesson,
        //   history: [],
        // };

        // toast.promise(createQuiz(quizData), {
        //   loading: "Saving lesson...",
        //   success: "Lesson created and saved successfully!",
        //   // error: "Failed to save the lesson.",
        // });
      } catch (apiError: any) {
        console.error("Error interacting with Gemini API:", apiError);
        if (apiError.message && (apiError.message.includes("429") || apiError.message.toLowerCase().includes("quota"))) {
          const quotaErrorMessage = "You've exceeded your Gemini API usage quota. Please check your Google Cloud Console or API key limits and billing details. The API call cannot proceed at this time.";
          toast.error(quotaErrorMessage);
          setError(quotaErrorMessage);
        } else {
          const message = apiError.message || "An unknown error occurred.";
          toast.error(`API Error: ${message}`);
          setError(`Error fetching data from Gemini API: ${message}`);
        }
        if (apiError.response) { // This part can remain to log details for any API error
          console.error("API Response Data:", apiError.response.data);
          console.error("API Response Status:", apiError.response.status);
        }
      } finally {
        setIsLoading(false);
        setLessonLoading(false);
      }
    },
    [apiKey, userID, handleMindMapChange]
  );

  const onSubmit = async (data: z.infer<typeof createLessonSchema>) => {
    if (!data.prompt || !data.prompt.trim()) {
      toast.error("Please enter a topic/prompt for the lesson.");
      form.setError("prompt", { type: "manual", message: "Prompt cannot be empty." });
      return;
    }
    if (!data.title || !data.title.trim()) {
      toast.error("Please enter a title for the lesson.");
      form.setError("title", { type: "manual", message: "Title cannot be empty."});
      return;
    }
    setUserInput(data.prompt);
    run(data.prompt, data);
  };

  const onTabChange = (value: string, mindMapData: any) => {
    if (value === "mindMap") {
      handleMindMapChange(mindMapData);
    }
  };

  return (
    <div className="lexigen-bg w-screen h-screen overflow-hidden flex">
      <Sidebar />

      <Button
        onClick={handleGoBack}
        className="absolute top-5 left-20 z-50 bg-gray-800 hover:bg-gray-700 text-white"
        size="sm"
      >
        ← Back
      </Button>

      <div className="flex-grow h-full overflow-y-auto p-5 md:p-8">
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-y-6 md:gap-y-8">
          <h1 className="text-sky-200 text-3xl md:text-4xl font-semibold text-center mt-12 md:mt-16">
            Create your Learning Path
          </h1>

          <div className="w-full flex items-center justify-center">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full md:w-2/3 space-y-6 bg-gray-900/50 p-6 rounded-lg border border-gray-700 shadow-lg"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sky-200 text-lg md:text-xl font-bold">
                        Title
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="text-white outline-none border border-gray-600 bg-gray-800 focus:border-sky-500 focus:ring-sky-500 p-2 text-md rounded-md"
                          placeholder="e.g., Introduction to React Hooks"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sky-200 text-lg md:text-xl font-bold">
                        Description (Optional)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          className="text-white outline-none border border-gray-600 bg-gray-800 focus:border-sky-500 focus:ring-sky-500 p-2 text-md rounded-md min-h-[80px]"
                          placeholder="Briefly describe what this lesson covers"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sky-200 text-lg md:text-xl font-bold">
                        Learning Topic / Prompt
                      </FormLabel>
                      <FormDescription className="text-gray-400 text-sm">
                        Enter the main topic you want to generate a lesson about
                        (e.g., "JavaScript Promises", "Python decorators").
                      </FormDescription>
                      <FormControl>
                        <Textarea
                          className="text-white outline-none border border-gray-600 bg-gray-800 focus:border-sky-500 focus:ring-sky-500 p-2 text-md rounded-md min-h-[100px]"
                          placeholder="Enter the learning topic here..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <div className="w-full flex items-center justify-center pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Generating..." : "Generate Lesson"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {isLoading && (
            <p className="text-sky-300 animate-pulse">
              Generating lesson content... Please wait.
            </p>
          )}
          {error && (
            <p className="text-red-400 bg-red-900/30 p-3 rounded-md border border-red-500">
              {error}
            </p>
          )}

            <div className="w-full flex flex-col items-center justify-center gap-y-6 md:gap-y-8 mt-8">
              <h2 className="text-sky-200 text-2xl md:text-3xl font-bold border-b-2 border-sky-500 pb-2">
                Generated Lesson Plan
              </h2>

          {lesson && (
              <Card className="w-full bg-gray-800/70 text-white border border-gray-700 shadow-md">
                <CardHeader>
                  <CardTitle className="text-sky-300 text-xl font-bold">
                    Overview
                  </CardTitle>
                  <CardDescription className="text-gray-300 pt-1">
                    Topic:{" "}
                    <span className="font-semibold text-sky-400">
                      {lesson.topic}
                    </span>{" "}
                    | Language:{" "}
                    <span className="font-semibold text-sky-400">
                      {lesson.language}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <h3 className="text-sky-400 text-lg font-semibold mb-2">
                    Index
                  </h3>
                  <pre className="whitespace-pre-wrap text-gray-300 bg-gray-900/50 p-3 rounded-md text-sm border border-gray-600">
                    {JSON.stringify(lesson.index, null, 2)}
                  </pre>
                </CardContent>
              </Card>
          )}

              <Separator className="bg-sky-700/50 my-4" />

              {lesson?.lessons.map((subLessons: any[], subLessonIndex: number) => (
                <div
                  key={`sub-lesson-group-${subLessonIndex}`}
                  className="w-full space-y-4"
                >
                  {subLessons.map((item: any, itemIndex: number) => {                    
                    if (!item || typeof item.indexTitle !== "string") {
                      console.warn(
                        `Skipping rendering malformed lesson item at ${subLessonIndex}-${itemIndex}:`,                        
                        item
                      );
                      return null;
                    }
                    return (
                      <Card
                        key={`lesson-item-${subLessonIndex}-${itemIndex}`}
                        className="bg-gray-900/60 p-4 rounded-md w-full border border-gray-700 shadow"
                      >
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sky-200 text-lg md:text-xl font-semibold flex items-center gap-x-2">
                            <Badge
                              variant="secondary"
                              className="bg-gray-700 border border-gray-600 text-sky-300 px-2 py-0.5 text-sm"
                            >
                              {typeof item.indexNumber === "number"
                                ? item.indexNumber + 1                                
                                : subLessonIndex + 1}
                              .
                              {typeof item.itemNumber === "number"                                
                                ? item.itemNumber + 1
                                : itemIndex + 1}
                            </Badge>
                            <span>{item.indexTitle}</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Tabs
                            defaultValue="simplified"
                            className="w-full mt-2"
                            onValueChange={(value) =>
                              onTabChange(value, item.mindMap)
                            }
                          >
                            <TabsList className="bg-gray-800 border border-gray-700 grid grid-cols-4 w-full md:w-auto md:inline-flex">
                              <TabsTrigger
                                value="simplified"
                                className="text-gray-300 hover:text-white data-[state=active]:bg-sky-800 data-[state=active]:text-white px-3 py-1.5 text-sm rounded-sm"
                              >
                                Simplified
                              </TabsTrigger>
                              <TabsTrigger
                                value="detailed"
                                className="text-gray-300 hover:text-white data-[state=active]:bg-sky-800 data-[state=active]:text-white px-3 py-1.5 text-sm rounded-sm"
                              >
                                Detailed
                              </TabsTrigger>
                              <TabsTrigger
                                value="mindMap"
                                className="text-gray-300 hover:text-white data-[state=active]:bg-sky-800 data-[state=active]:text-white px-3 py-1.5 text-sm rounded-sm"
                                disabled={!item.mindMap}
                              >
                                Mind Map
                              </TabsTrigger>
                              <TabsTrigger
                                value="schematic"
                                className="text-gray-300 hover:text-white data-[state=active]:bg-sky-800 data-[state=active]:text-white px-3 py-1.5 text-sm rounded-sm"
                              >
                                Schematic
                              </TabsTrigger>
                            </TabsList>

                            <TabsContent value="simplified" className="mt-4">
                              <div className="text-gray-300 bg-gray-800/80 p-4 rounded-md prose prose-invert prose-sm max-w-none border border-gray-700">
                                <ReactMarkdown
                                  components={{
                                    code({
                                      node,
                                      className,
                                      children,
                                      ...props
                                    }) {
                                      const match =
                                        /language-(\w+)/.exec(className || "");
                                      return match ? (
                                        <SyntaxHighlightser
                                          style={dark as any}
                                          language={match[1]}
                                          PreTag="div"
                                          {...props}
                                          ref={null}
                                        >
                                          {String(children).replace(/\n$/, "")}
                                        </SyntaxHighlightser>
                                      ) : (
                                        <code className={className} {...props}>
                                          {children}
                                        </code>
                                      );
                                    },
                                    h1: ({ node, ...props }) => (
                                      <h1
                                        className="text-xl font-semibold text-sky-300"
                                        {...props}
                                      />
                                    ),
                                    h2: ({ node, ...props }) => (
                                      <h2
                                        className="text-lg font-semibold text-sky-400"
                                        {...props}
                                      />
                                    ),
                                    strong: ({ node, ...props }) => (
                                      <strong
                                        className="text-sky-400"
                                        {...props}
                                      />
                                    ),
                                  }}
                                >
                                  {item?.simplified ||
                                    "*No simplified explanation provided.*"}
                                </ReactMarkdown>
                              </div>
                            </TabsContent>

                            <TabsContent value="detailed" className="mt-4">
                              <div className="text-gray-300 bg-gray-800/80 p-4 rounded-md prose prose-invert prose-sm max-w-none border border-gray-700">
                                <ReactMarkdown
                                  components={{
                                    code({
                                      node,
                                      className,
                                      children,
                                      ...props
                                    }) {
                                      const match =
                                        /language-(\w+)/.exec(className || "");
                                      return match ? (
                                        <SyntaxHighlightser
                                          style={vs as any}
                                          language={match[1]}
                                          PreTag="div"
                                          {...props}
                                          ref={null}
                                        >
                                          {String(children).replace(/\n$/, "")}
                                        </SyntaxHighlightser>
                                      ) : (
                                        <code className={className} {...props}>
                                          {children}
                                        </code>
                                      );
                                    },
                                    h1: ({ node, ...props }) => (
                                      <h1
                                        className="text-2xl font-semibold text-sky-300"
                                        {...props}
                                      />
                                    ),
                                    h2: ({ node, ...props }) => (
                                      <h2
                                        className="text-xl font-semibold text-sky-400"
                                        {...props}
                                      />
                                    ),
                                    h3: ({ node, ...props }) => (
                                      <h3
                                        className="text-lg font-semibold text-sky-400"
                                        {...props}
                                      />
                                    ),
                                    strong: ({ node, ...props }) => (
                                      <strong
                                        className="text-sky-400"
                                        {...props}
                                      />
                                    ),
                                    a: ({ node, ...props }) => (
                                      <a
                                        className="text-blue-400 hover:text-blue-300"
                                        {...props}
                                      />
                                    ),
                                  }}
                                >
                                  {item?.detailed ||
                                    "*No detailed explanation provided.*"}
                                </ReactMarkdown>
                              </div>
                            </TabsContent>

                            <TabsContent value="mindMap" className="mt-4">
                              <div className="text-white bg-gray-800/80 p-4 rounded-md border border-gray-700 h-[400px] md:h-[500px] w-full">
                                {item.mindMap ? (
                                  <ReactFlow
                                    nodes={nodes}
                                    edges={edges}
                                    onNodesChange={onNodesChange}
                                    onEdgesChange={onEdgesChange}
                                    fitView
                                    nodesDraggable={true}
                                    nodesConnectable={false}
                                    elementsSelectable={true}
                                    className="bg-gray-700/50 rounded"
                                  >
                                    <Background color="#555" gap={16} />
                                    <Controls />
                                  </ReactFlow>
                                ) : (
                                  <div className="flex items-center justify-center h-full text-gray-400">
                                    Mind map data not available for this item.
                                  </div>
                                )}
                              </div>
                            </TabsContent>

                            <TabsContent value="schematic" className="mt-4">
                              <pre className="text-gray-300 bg-gray-800/80 p-4 rounded-md whitespace-pre-wrap border border-gray-700 text-sm">
                                {item?.schematic ||
                                  "*No schematic provided.*"}
                              </pre>
                            </TabsContent>
                          </Tabs>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ))}

              <Link
                href={`/lessons/`}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "mt-6 bg-gray-700 hover:bg-gray-600 border-gray-600 text-white transition-colors duration-200"
                )}
              >
                View All My Lessons
              </Link>
            </div>
        </div>
      </div>
    </div>
  );
}