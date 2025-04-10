"use client";

import React, { useCallback, useMemo, MouseEvent, useEffect } from "react";
import { Lesson } from "@/types";
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
  Edge, useReactFlow, Viewport,
} from "reactflow";
import "reactflow/dist/base.css";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MindMapDisplay from "@/components/MindMapDisplay";

interface LessonDetailsProps {
  lesson: Lesson;
}

interface MindMap {
    id: string;
    name: string;
}

interface LessonWithMindMap extends Lesson {
    mindMap?: MindMap;
}

const LessonDetails: React.FC<LessonDetailsProps> = ({ lesson }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState<ReactFlowNode[]>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
    const { setViewport } = useReactFlow();

    const createReactFlowElements = (mindMapData: any) => {
        const newNodes: ReactFlowNode[] = [];
        const newEdges: Edge[] = [];
        const nodePositions: { [key: string]: { x: number; y: number } } = {};
        const nodeWidth = 150;
        const nodeHeight = 50;
        const horizontalSpacing = 200;
        const verticalSpacing = 100;

        const traverse = (
            node: any,
            parentId: string | null,
            level: number,
            index: number
        ) => {
            if (!node || typeof node !== 'object' || !node.id || !node.name) {
                console.warn("Invalid node data:", node);
                return;
            }

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

            if (node.children && Array.isArray(node.children)) {
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
            // setNodes([{id: 'no-data', type: 'default', position: { x: 0, y: 0 }, data: { label: 'No data' }}]);
            setNodes([])
            setEdges([])
        }
    }, []);

    const handleFitView = () => {
        setViewport({
            x: 0,
            y: 0,
            zoom: 1,
        });
    };

    useMemo(() => {
        if ((lesson as LessonWithMindMap)?.mindMap && typeof (lesson as LessonWithMindMap).mindMap === 'object' && ((lesson as LessonWithMindMap).mindMap as MindMap).id) {
            handleMindMapChange((lesson as LessonWithMindMap).mindMap as MindMap)
        } else {
            console.warn("lesson.mindMap is not valid:", (lesson as LessonWithMindMap).mindMap);
        } 
    }, [(lesson as LessonWithMindMap)?.mindMap, handleMindMapChange]);

    useEffect(() => {
        handleFitView();
    }, [nodes, edges]);

  return (
    <div className="w-full flex flex-col items-center gap-y-5">
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
      <Separator className="bg-sky-700/50 my-4" />
      {lesson.lessons.flat().map((item: any, itemIndex: number) => {
        return (
          <Card
            key={`lesson-item-${itemIndex}`}
            className="bg-gray-900/60 p-4 rounded-md w-full border border-gray-700 shadow"
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sky-200 text-lg md:text-xl font-semibold flex items-center gap-x-2">
                <Badge
                  variant="secondary"
                  className="bg-gray-700 border border-gray-600 text-sky-300 px-2 py-0.5 text-sm"
                >
                  {item.indexNumber + 1}.{item.itemNumber + 1}
                </Badge>
                <span>{item.indexTitle}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                            <SyntaxHighlighter
                              style={dark as any}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                              ref={null}
                            >
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
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
                            <SyntaxHighlighter
                              style={vs as any}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                              ref={null}
                            >
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
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
                      <MindMapDisplay mindMapData={item.mindMap} />
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
  );
};

export default LessonDetails;
