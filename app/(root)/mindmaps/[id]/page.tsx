"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import 'reactflow/dist/style.css';

import Sidebar from "@/components/Sidebar";
import { useAuth } from "@clerk/nextjs";
import { getUserByClerkId } from "@/lib/actions/user.actions";
import { getMindMap } from "@/lib/actions/mindmaps.actions";

import {
    ReactFlow,
    useNodesState,
    useEdgesState,
    addEdge,
    Background,
    Controls,
    getRectOfNodes,
    getTransformForBounds,
} from "reactflow";


interface User {
    _id: string;
    clerkId: string;
    email: string;
    username: string;
}

interface MindMapData {
    initialNodes: any[];
    initialEdges: any[];
}

interface MindMapResponse {
    _id: string;
    title: string;
    mindMap?: MindMapData;
}


export default function App({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);

    const { isLoaded, isSignedIn, userId, sessionId, getToken } = useAuth()
    const [user, setUser] = useState<User | null>(null)
    const [mindMap, setMindMap] = useState<MindMapResponse | null>(null)

    // **REMOVED HARDCODED DATA**
    const [nodes, setNodes, onNodesChange] = useNodesState<any>([]); // Initialize with empty arrays
    const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]); // Initialize with empty arrays

    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const reactFlowBounds = useRef<SVGRect | null>(null);
    const [rfInstance, setRfInstance] = useState<any>(null);

    const onConnect = useCallback(
        (params: any) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const fitView = useCallback(() => {
        if (!rfInstance || !reactFlowWrapper.current || nodes.length === 0) { // Check for nodes.length
            return; // Don't fit view if there are no nodes yet
        }

        const nodesBounds = getRectOfNodes(nodes);
        const wrapperBounds = reactFlowWrapper.current.getBoundingClientRect();
        const transform = getTransformForBounds(nodesBounds, wrapperBounds.width, wrapperBounds.height, 0.7, 2);

        rfInstance.setTransform(transform);
    }, [rfInstance, reactFlowWrapper, nodes]);


    useEffect(() => {
        const fetchUser = async () => {
            const user = userId ? await getUserByClerkId(userId) : null
            setUser(user?.[0] || null)

            console.log('user: ', user?.[0])
        }
        fetchUser()
    }, [userId]);


    useEffect(() => {
        const fetchMindMap = async () => {
            const fetchedMindMap = user ? await getMindMap(id) : null;
            console.log('MindMap data fetched from API: ', fetchedMindMap); // Log fetched data

            if (fetchedMindMap && fetchedMindMap.mindMap) {
                setMindMap(fetchedMindMap);
                setNodes(fetchedMindMap.mindMap.initialNodes || []);
                setEdges(fetchedMindMap.mindMap.initialEdges || []);
                console.log('Nodes state updated with fetched data:', fetchedMindMap.mindMap.initialNodes);
                console.log('Edges state updated with fetched data:', fetchedMindMap.mindMap.initialEdges);
            } else {
                console.log("Mind map data or mindMap.mindMap is not available from API.");
                setMindMap(null);
                setNodes([]);
                setEdges([]);
            }
        };
        if (user) {
            console.log("Fetching MindMap for ID:", id);
            fetchMindMap();
        }
    }, [user, id]);


    useEffect(() => {
        fitView();
    }, [nodes, edges, fitView]);



    return (
        <div className="lexigen-bg w-screen h-screen">
            <Sidebar />
            <div className="absolute w-5/6 right-0 top-20 bottom-0 p-5 flex flex-col items-center gap-y-5">
                <h1 className="text-sky-200 text-3xl font-semibold text-center">Create your Mind map</h1>
                <div>
                  editing
                </div>
                <div className="relative w-full h-full">
                  <div className="absolute w-full h-full bg-white rounded-lg opacity-25">

                  </div>
                  <div className="  w-full h-full" ref={reactFlowWrapper}>
                      {/* Debugging Logs - VERY IMPORTANT - Keep these for now */}
                      {/* <pre>Nodes State (before ReactFlow): {JSON.stringify(nodes, null, 2)}</pre>
                      <pre>Edges State (before ReactFlow): {JSON.stringify(edges, null, 2)}</pre> */}

                      <ReactFlow
                          nodes={nodes}
                          edges={edges}
                          onNodesChange={onNodesChange}
                          onEdgesChange={onEdgesChange}
                          onConnect={onConnect}
                          onLoad={setRfInstance}
                          fitView={false}
                          // style={{ backgroundColor: '#f0f0f0' }}
                      >
                          {/* <Background color="#aaa" variant={'dots'} size={3} /> */}
                          <Controls />
                      </ReactFlow>
                  </div>

                </div>
            </div>
        </div>
    );
}























// "use client";

// import React, {
//     useState,
//     useCallback,
//     useEffect,
//     useRef,
//     MouseEvent as ReactMouseEvent,
// } from "react";
// import "reactflow/dist/style.css";
// import Sidebar from "@/components/Sidebar";
// import { useAuth } from "@clerk/nextjs";
// import { getUserByClerkId } from "@/lib/actions/user.actions";
// import { getMindMap } from "@/lib/actions/mindmaps.actions";
// import {
//     ReactFlow,
//     useNodesState,
//     useEdgesState,
//     addEdge,
//     Background,
//     Controls,
//     MiniMap,
//     getRectOfNodes,
//     getTransformForBounds,
//     Node,
//     Edge,
//     Connection,
//     ConnectionMode,
//     ReactFlowProvider,
// } from "reactflow";

// // --- Types ---
// interface User {
//     _id: string;
//     clerkId: string;
//     email: string;
//     username: string;
// }

// interface MindMapData {
//     initialNodes: any[];
//     initialEdges: any[];
// }

// interface MindMapResponse {
//     _id: string;
//     title: string;
//     mindMap?: MindMapData;
// }

// // --- Navbar Component ---
// // Provides controls for editing nodes and edges, and mode switching.
// const Navbar = ({
//     mode,
//     setMode,
//     nodeStyle,
//     setNodeStyle,
//     selectedNode,
//     setNodes,
//     nodes,
//     selectedEdge,
//     setEdges,
//     edges,
//     onToggleResize,
// }: {
//     mode: "edit" | "connect" | "drag" | "resize";
//     setMode: (mode: "edit" | "connect" | "drag" | "resize") => void;
//     nodeStyle: any;
//     setNodeStyle: (style: any) => void;
//     selectedNode: Node | null;
//     setNodes: (nodes: Node[]) => void;
//     nodes: Node[];
//     selectedEdge: Edge | null;
//     setEdges: (edges: Edge[]) => void;
//     edges: Edge[];
//     onToggleResize: () => void;
// }) => {
//     // Helper function to apply active class based on current mode
//     const getModeButtonClass = (buttonMode: string) => {
//         return `px-3 py-1 rounded text-white ${mode === buttonMode ? 'bg-sky-700' : 'bg-sky-600 hover:bg-sky-500'}`;
//     };

//     return (
//         <div className="w-full bg-white/20 backdrop-blur-sm p-4 rounded-lg flex flex-wrap items-center gap-4">
//             <button
//                 className={getModeButtonClass("edit")}
//                 onClick={() => setMode("edit")}
//             >
//                 Edit Mode
//             </button>
//             <button
//                 className={getModeButtonClass("connect")}
//                 onClick={() => setMode("connect")}
//             >
//                 Connect Mode
//             </button>
//             <button
//                 className={getModeButtonClass("drag")}
//                 onClick={() => setMode("drag")}
//             >
//                 Drag Mode
//             </button>
//             <button
//                 className={getModeButtonClass("resize")}
//                 onClick={onToggleResize}
//             >
//                 Toggle Resize
//             </button>

//             {selectedNode ? (
//                 <>
//                     {/* Node editing controls */}
//                     <input
//                         type="text"
//                         className="bg-white/30 rounded px-3 py-1 text-slate-900"
//                         placeholder="Node Label"
//                         value={selectedNode.data.label || ""}
//                         onChange={(e) =>
//                             setNodes(
//                                 nodes.map((node) =>
//                                     node.id === selectedNode.id
//                                         ? {
//                                             ...node,
//                                             data: { ...node.data, label: e.target.value },
//                                         }
//                                         : node
//                                 )
//                             )
//                         }
//                     />
//                     <input
//                         type="color"
//                         className="w-8 h-8 rounded"
//                         title="Background Color"
//                         value={selectedNode.style?.backgroundColor || "#ffffff"}
//                         onChange={(e) =>
//                             setNodes(
//                                 nodes.map((node) =>
//                                     node.id === selectedNode.id
//                                         ? {
//                                             ...node,
//                                             style: {
//                                                 ...node.style,
//                                                 backgroundColor: e.target.value,
//                                                 width: nodeStyle.width,
//                                                 height: nodeStyle.height,
//                                             },
//                                         }
//                                         : node
//                                 )
//                             )
//                         }
//                     />
//                     <input
//                         type="color"
//                         className="w-8 h-8 rounded"
//                         title="Border Color"
//                         value={selectedNode.style?.borderColor || "#000000"}
//                         onChange={(e) =>
//                             setNodes(
//                                 nodes.map((node) =>
//                                     node.id === selectedNode.id
//                                         ? { ...node, style: { ...node.style, borderColor: e.target.value } }
//                                         : node
//                                 )
//                             )
//                         }
//                     />
//                     <input
//                         type="color"
//                         className="w-8 h-8 rounded"
//                         title="Text Color"
//                         value={selectedNode.style?.color || "#000000"}
//                         onChange={(e) =>
//                             setNodes(
//                                 nodes.map((node) =>
//                                     node.id === selectedNode.id
//                                         ? { ...node, style: { ...node.style, color: e.target.value } }
//                                         : node
//                                 )
//                             )
//                         }
//                     />
//                     {/* The size input here still exists as a fallback */}
//                     <input
//                         type="number"
//                         className="bg-white/30 rounded px-3 py-1 text-slate-900 w-20"
//                         placeholder="Size"
//                         min="50"
//                         max="500"
//                         value={selectedNode.style?.width || 150}
//                         onChange={(e) => {
//                             const size = parseInt(e.target.value);
//                             setNodes(
//                                 nodes.map((node) =>
//                                     node.id === selectedNode.id
//                                         ? {
//                                             ...node,
//                                             style: { ...node.style, width: size, height: size },
//                                         }
//                                         : node
//                                 )
//                             );
//                         }}
//                     />
//                     <button
//                         className="bg-red-500/80 text-white px-3 py-1 rounded"
//                         onClick={() =>
//                             setNodes(nodes.filter((node) => node.id !== selectedNode.id))
//                         }
//                     >
//                         Delete Node
//                     </button>
//                 </>
//             ) : (
//                 <span className="text-slate-300">Select a node to edit</span>
//             )}

//             {selectedEdge ? (
//                 <>
//                     {/* Edge editing controls */}
//                     <input
//                         type="color"
//                         className="w-8 h-8 rounded"
//                         title="Edge Color"
//                         value={selectedEdge.style?.stroke || "#00796b"}
//                         onChange={(e) =>
//                             setEdges(
//                                 edges.map((edge) =>
//                                     edge.id === selectedEdge.id
//                                         ? { ...edge, style: { ...edge.style, stroke: e.target.value } }
//                                         : edge
//                                 )
//                             )
//                         }
//                     />
//                     <select
//                         className="bg-white/30 rounded px-2 py-1"
//                         value={selectedEdge.type || "default"}
//                         onChange={(e) =>
//                             setEdges(
//                                 edges.map((edge) =>
//                                     edge.id === selectedEdge.id
//                                         ? { ...edge, type: e.target.value }
//                                         : edge
//                                 )
//                             )
//                         }
//                     >
//                         <option value="default">Default</option>
//                         <option value="step">Step</option>
//                         <option value="smoothstep">Smooth</option>
//                     </select>
//                     <button
//                         className="bg-red-500/80 text-white px-3 py-1 rounded"
//                         onClick={() =>
//                             setEdges(edges.filter((edge) => edge.id !== selectedEdge.id))
//                         }
//                     >
//                         Delete Edge
//                     </button>
//                 </>
//             ) : (
//                 <span className="text-slate-300">Select an edge to edit</span>
//             )}
//         </div>
//     );
// };

// // --- ResizableOverlay Component ---
// // When in resize mode and a node is selected, this overlay renders draggable handles.
// // For simplicity, we implement a bottom-right handle.
// const ResizableOverlay = ({
//     selectedNode,
//     onResize,
// }: {
//     selectedNode: Node;
//     onResize: (width: number, height: number) => void;
// }) => {
//     const overlayRef = useRef<HTMLDivElement>(null);
//     const [dragging, setDragging] = useState(false);
//     const startSize = useRef({ width: selectedNode.style?.width ?? 150, height: selectedNode.style?.height ?? 150 });
//     const startPos = useRef({ x: 0, y: 0 });

//     const handleMouseDown = (e: ReactMouseEvent) => {
//         e.stopPropagation();
//         setDragging(true);
//         startPos.current = { x: e.clientX, y: e.clientY };
//         startSize.current = { width: selectedNode.style?.width ?? 150, height: selectedNode.style?.height ?? 150 };
//     };

//     const handleMouseMove = (e: MouseEvent) => {
//         if (!dragging) return;
//         const deltaX = e.clientX - startPos.current.x;
//         const deltaY = e.clientY - startPos.current.y;
//         const newWidth = Math.max(50, Number(startSize.current.width) + deltaX);
//         const newHeight = Math.max(50, Number(startSize.current.height) + deltaY);
//         onResize(newWidth, newHeight);
//     };

//     const handleMouseUp = () => {
//         setDragging(false);
//         window.removeEventListener("mousemove", handleMouseMove);
//         window.removeEventListener("mouseup", handleMouseUp);
//     };

//     useEffect(() => {
//         if (dragging) {
//             window.addEventListener("mousemove", handleMouseMove);
//             window.addEventListener("mouseup", handleMouseUp);
//         }
//         return () => {
//             window.removeEventListener("mousemove", handleMouseMove);
//             window.removeEventListener("mouseup", handleMouseUp);
//         };
//     }, [dragging, handleMouseMove, handleMouseUp]); // Add handleMouseMove, handleMouseUp to dependencies

//     // Calculate overlay position based on node's position and size.
//     const overlayStyle = {
//         position: "absolute" as "absolute",
//         left: selectedNode.position.x,
//         top: selectedNode.position.y,
//         width: selectedNode.style?.width || 150,
//         height: selectedNode.style?.height || 150,
//         border: "2px dashed #6366F1",
//         pointerEvents: "none" as "none",
//         zIndex: 10, // Ensure overlay is above nodes - **FIX for Overlay Position**
//     };

//     const handleStyle = {
//         position: "absolute" as "absolute",
//         right: -8,
//         bottom: -8,
//         width: 16,
//         height: 16,
//         backgroundColor: "#6366F1",
//         cursor: "nwse-resize",
//         pointerEvents: "all" as "all",
//         zIndex: 11, // Ensure handle is above overlay
//     };

//     return (
//         <div ref={overlayRef} style={overlayStyle}>
//             <div style={handleStyle} onMouseDown={handleMouseDown} />
//         </div>
//     );
// };

// // --- Main Component ---
// export default function App({ params }: { params: Promise<{ id: string }> }) {
//     const { id } = React.use(params);
//     const { isLoaded, isSignedIn, userId } = useAuth();
//     const [user, setUser] = useState<User | null>(null);
//     const [mindMap, setMindMap] = useState<MindMapResponse | null>(null);

//     // Initialize nodes and edges (empty by default)
//     const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
//     const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);

//     const reactFlowWrapper = useRef<HTMLDivElement>(null);
//     const [rfInstance, setRfInstance] = useState<any>(null);

//     // Navbar state & editing selection
//     const [selectedNode, setSelectedNode] = useState<any>(null);
//     const [selectedEdge, setSelectedEdge] = useState<any>(null);
//     const [mode, setMode] = useState<"edit" | "connect" | "drag" | "resize">("edit");
//     const [resizeMode, setResizeMode] = useState(false);

//     // Node default style state used in creation and updating
//     const [nodeStyle, setNodeStyle] = useState({
//         backgroundColor: "#ffffff",
//         borderColor: "#000000",
//         color: "#000000",
//         width: 150,
//         height: 150,
//     });

//     // Fit view after nodes/edges update
//     const fitView = useCallback(() => {
//         if (!rfInstance || !reactFlowWrapper.current || nodes.length === 0) return;
//         const nodesBounds = getRectOfNodes(nodes);
//         const wrapperBounds = reactFlowWrapper.current.getBoundingClientRect();
//         const transform = getTransformForBounds(
//             nodesBounds,
//             wrapperBounds.width,
//             wrapperBounds.height,
//             0.7,
//             2
//         );
//         rfInstance.setTransform(transform);
//     }, [rfInstance, nodes]);

//     // Fetch user data
//     useEffect(() => {
//         const fetchUser = async () => {
//             const userData = userId ? await getUserByClerkId(userId) : null;
//             setUser(userData?.[0] || null);
//             console.log("user:", userData?.[0]);
//         };
//         fetchUser();
//     }, [userId]);

//     // Fetch mind map data from API and set nodes/edges accordingly
//     useEffect(() => {
//         const fetchMindMap = async () => {
//             const fetchedMindMap = user ? await getMindMap(id) : null;
//             console.log("MindMap data fetched from API:", fetchedMindMap);
//             if (fetchedMindMap && fetchedMindMap.mindMap) {
//                 setMindMap(fetchedMindMap);
//                 setNodes(fetchedMindMap.mindMap.initialNodes || []);
//                 setEdges(fetchedMindMap.mindMap.initialEdges || []);
//                 console.log("Nodes updated:", fetchedMindMap.mindMap.initialNodes);
//                 console.log("Edges updated:", fetchedMindMap.mindMap.initialEdges);
//             } else {
//                 console.log("No mind map data available from API.");
//                 setMindMap(null);
//                 setNodes([]);
//                 setEdges([]);
//             }
//         };
//         if (user) {
//             console.log("Fetching MindMap for ID:", id);
//             fetchMindMap();
//         }
//     }, [user, id, setNodes, setEdges]);

//     // Fit view when nodes or edges change
//     useEffect(() => {
//         fitView();
//     }, [nodes, edges, fitView]);

//     // When a node is clicked, mark it as selected for editing
//     const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
//         setSelectedNode(node);
//         setSelectedEdge(null);
//     }, []);

//     // When an edge is clicked, mark it as selected for editing
//     const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
//         setSelectedEdge(edge);
//         setSelectedNode(null);
//     }, []);

//     // Connection handler
//     const onConnect = useCallback(
//         (params: Connection) => setEdges((eds) => addEdge(params, eds)),
//         [setEdges]
//     );

//     // Toggle resize mode (when active, nodes become resizable via overlay)
//     const onToggleResize = useCallback(() => {
//         setResizeMode((prev) => !prev);
//         setMode((prev) => (prev === "resize" ? "edit" : "resize"));
//     }, []);

//     // Update selected node size when resizing overlay changes
//     const onResize = useCallback(
//         (newWidth: number, newHeight: number) => {
//             if (!selectedNode) return;
//             setNodes((nds: Node[]) =>
//                 nds.map((node) =>
//                     node.id === selectedNode.id
//                         ? {
//                             ...node,
//                             style: {
//                                 ...node.style,
//                                 width: newWidth,
//                                 height: newHeight,
//                             },
//                         }
//                         : node
//                 )
//             );
//             // Log the changes for debugging
//             console.log("Resized node:", selectedNode.id, "to", newWidth, newHeight);
//         },
//         [selectedNode, setNodes]
//     );


//     return (
//         <div className="lexigen-bg w-screen h-screen relative">
//             <Sidebar />
//             <div className="absolute w-5/6 right-0 top-20 bottom-0 p-5 flex flex-col items-center gap-y-5">
//                 <h1 className="text-sky-200 text-3xl font-semibold text-center">
//                     Create your Mind Map
//                 </h1>
//                 <Navbar
//                     mode={mode}
//                     setMode={setMode}
//                     nodeStyle={nodeStyle}
//                     setNodeStyle={setNodeStyle}
//                     selectedNode={selectedNode}
//                     setNodes={setNodes}
//                     nodes={nodes}
//                     selectedEdge={selectedEdge}
//                     setEdges={setEdges}
//                     edges={edges}
//                     onToggleResize={onToggleResize}
//                 />
//                 <div className="w-full h-full relative" ref={reactFlowWrapper}> {/* Make ReactFlow wrapper relative */}
//                     <ReactFlow
//                         nodes={nodes}
//                         edges={edges}
//                         onNodesChange={onNodesChange}
//                         onEdgesChange={onEdgesChange}
//                         onConnect={onConnect}
//                         onNodeClick={onNodeClick}
//                         onEdgeClick={onEdgeClick}
//                         onLoad={setRfInstance}
//                         fitView
//                         connectionMode={mode === "connect" ? ConnectionMode.Strict : ConnectionMode.Loose}
//                         panOnDrag={mode === "drag"}
//                         nodesDraggable={mode !== "resize"} // disable dragging in resize mode
//                         nodesConnectable={mode === "connect"}
//                     >
//                         <Background />
//                         <Controls />
//                         <MiniMap />
//                     </ReactFlow>
//                     {/* Render resizable overlay if in resize mode and a node is selected */}
//                     {resizeMode && selectedNode && (
//                         <ResizableOverlay selectedNode={selectedNode} onResize={onResize} />
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }

// export function MindMapEditor(props: { mindMapData: MindMapData }) {
//     return (
//         <ReactFlowProvider>
//             <App params={Promise.resolve({ id: "dummy-id" })} />
//         </ReactFlowProvider>
//     );
// }