// components/LessonDetails.tsx
"use client";

// REMOVE unused React Flow hooks from top-level imports
import React from "react"; // Removed useState, useCallback, useMemo
// import { Lesson } from "@/types"; // This type definition seems inconsistent with your schema/actions. We'll use a local interface or rely on inference.
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
// Choose one style
import dark from "react-syntax-highlighter/dist/esm/styles/prism/dark";
// import vs from "react-syntax-highlighter/dist/esm/styles/prism/vs";

// REMOVE ReactFlow imports if MindMapDisplay handles them
// import ReactFlow, { Controls, Background, ... } from "reactflow";
// import "reactflow/dist/base.css"; // MindMapDisplay should import this if needed

import { Badge } from "@/components/ui/badge";
// import { cn } from "@/lib/utils"; // Remove if not used
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// IMPORT the dedicated MindMapDisplay component
import MindMapDisplay from "./MindMapDisplay"; // Adjust path if necessary

// --- Define interfaces based on expected data structure from DB ---
// This reflects the structure based on your Mongoose schema and getLesson action
interface LessonItem {
  indexTitle: string;
  item: string;
  simplified: string;
  detailed: string;
  schematic: string;
  indexNumber: number;
  itemNumber: number;
  mindMap?: any; // Or a more specific MindMapNodeData type if defined globally
}

interface LessonData {
  _id: string;
  title: string;
  description: string;
  owner: any; // Can be string ID or populated object
  createdAt: Date | string; // Date from DB, string after JSON.parse
  topic: string;
  language: string;
  index: string[][];
  lessons: LessonItem[]; // Array of items is top-level according to schema
  history: any[];
}
// --- End Interface Definitions ---

interface LessonDetailsProps {
  // Use the interface reflecting the actual data structure
  lesson: LessonData | null;
}

// Optional helper for safe access (or use ?. optional chaining)
const getSafe = (fn: () => any, defaultValue: any = null) => {
  try {
    const value = fn();
    return value === undefined || value === null ? defaultValue : value;
  } catch (e) {
    return defaultValue;
  }
};

const LessonDetails: React.FC<LessonDetailsProps> = ({ lesson }) => {
  // REMOVE top-level React Flow state and related hooks:
  // const [nodes, setNodes, onNodesChange] = useNodesState(...);
  // const [edges, setEdges, onEdgesChange] = useEdgesState(...);
  // const initialNodes = useMemo(...);
  // const initialEdges = useMemo(...);
  // const handleMindMapChange = useCallback(...);
  // useMemo(() => { ... }, [lesson, handleMindMapChange]);

  // Handle loading or missing lesson data
  if (!lesson) {
    return <div className="text-center text-gray-400 mt-10">Loading lesson details or lesson not found...</div>;
  }

  // Access the array of lesson items directly from the lesson prop
  // Based on schema, it should be lesson.lessons (already flat)
  const lessonItems = lesson.lessons || [];

  return (
    <div className="w-full flex flex-col items-center gap-y-5">
      {/* Access top-level properties directly from lesson prop */}
      <h1 className="text-sky-200 text-3xl font-semibold text-center">
        {lesson.title || "Loading..."}
      </h1>
      <Card className="w-full bg-gray-800/70 text-white border border-gray-700 shadow-md">
        <CardHeader>
          <CardTitle className="text-sky-300 text-xl font-bold">
            Overview
          </CardTitle>
          <CardDescription className="text-gray-300 pt-1">
            Topic:{" "}
            <span className="font-semibold text-sky-400">
              {lesson.topic || "N/A"}
            </span>{" "}
            | Language:{" "}
            <span className="font-semibold text-sky-400">
              {lesson.language || "N/A"}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <h3 className="text-sky-400 text-lg font-semibold mb-2">
            Index
          </h3>
          <pre className="whitespace-pre-wrap text-gray-300 bg-gray-900/50 p-3 rounded-md text-sm border border-gray-600">
            {/* Access index directly */}
            {JSON.stringify(lesson.index || [], null, 2)}
          </pre>
        </CardContent>
      </Card>
      <Separator className="bg-sky-700/50 my-4" />

      {/* Map over the lessonItems array */}
      {lessonItems.map((item, itemIndex) => {
         // Add a check for item validity before rendering the card
         if (!item || typeof item.indexTitle !== 'string') {
            console.warn(`LessonDetails: Skipping rendering invalid lesson item at index ${itemIndex}:`, item);
            return null; // Don't render this card if item is malformed
         }

        return (
          <Card
            // Use a more robust key if possible
            key={`lesson-item-${itemIndex}-${item.item || 'fallback'}`}
            className="bg-gray-900/60 p-4 rounded-md w-full border border-gray-700 shadow"
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sky-200 text-lg md:text-xl font-semibold flex items-center gap-x-2">
                <Badge
                  variant="secondary"
                  className="bg-gray-700 border border-gray-600 text-sky-300 px-2 py-0.5 text-sm"
                >
                  {/* Use safe access for numbers */}
                  {getSafe(() => item.indexNumber + 1, '?')}.{getSafe(() => item.itemNumber + 1, '?')}
                </Badge>
                <span>{item.indexTitle}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Tabs structure remains */}
              <Tabs defaultValue="simplified" className="w-full mt-2">
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
                    disabled={!item.mindMap} // Disable tab if no mindMap data
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

                {/* Simplified Tab Content */}
                <TabsContent value="simplified" className="mt-4">
                  <div className="text-gray-300 bg-gray-800/80 p-4 rounded-md prose prose-invert prose-sm max-w-none border border-gray-700">
                    <ReactMarkdown
                      components={{
                        code({ node, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || "");
                          return match ? (
                            <SyntaxHighlighter
                              style={dark as any} // Or vs
                              language={match[1]}
                              PreTag="div"
                              {...props}
                              ref={null} // Add ref={null} for newer versions
                            >
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                        // Add other markdown component overrides if needed
                        h1: ({ node, ...props }) => <h1 className="text-xl font-semibold text-sky-300" {...props} />,
                        h2: ({ node, ...props }) => <h2 className="text-lg font-semibold text-sky-400" {...props} />,
                        strong: ({ node, ...props }) => <strong className="text-sky-400" {...props} />,
                      }}
                    >
                      {item?.simplified || "*No simplified explanation provided.*"}
                    </ReactMarkdown>
                  </div>
                </TabsContent>

                {/* Detailed Tab Content */}
                <TabsContent value="detailed" className="mt-4">
                  <div className="text-gray-300 bg-gray-800/80 p-4 rounded-md prose prose-invert prose-sm max-w-none border border-gray-700">
                    <ReactMarkdown
                       components={{
                        code({ node, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || "");
                          return match ? (
                            <SyntaxHighlighter
                              style={dark as any} // Or vs
                              language={match[1]}
                              PreTag="div"
                              {...props}
                              ref={null} // Add ref={null}
                            >
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                         h1: ({ node, ...props }) => <h1 className="text-2xl font-semibold text-sky-300" {...props} />,
                         h2: ({ node, ...props }) => <h2 className="text-xl font-semibold text-sky-400" {...props} />,
                         h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-sky-400" {...props} />,
                         strong: ({ node, ...props }) => <strong className="text-sky-400" {...props} />,
                         a: ({ node, ...props }) => <a className="text-blue-400 hover:text-blue-300" {...props} />,
                      }}
                    >
                      {item?.detailed || "*No detailed explanation provided.*"}
                    </ReactMarkdown>
                  </div>
                </TabsContent>

                {/* Mind Map Tab Content */}
                <TabsContent value="mindMap" className="mt-4">
                  <div className="text-white bg-gray-800/80 p-4 rounded-md border border-gray-700 h-[400px] md:h-[500px] w-full">
                    {/* Use the MindMapDisplay component, passing the specific item's mindMap data */}
                    <MindMapDisplay mindMapData={item.mindMap} />
                  </div>
                </TabsContent>

                {/* Schematic Tab Content */}
                <TabsContent value="schematic" className="mt-4">
                  <pre className="text-gray-300 bg-gray-800/80 p-4 rounded-md whitespace-pre-wrap border border-gray-700 text-sm">
                    {item?.schematic || "*No schematic provided.*"}
                  </pre>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default LessonDetails;
