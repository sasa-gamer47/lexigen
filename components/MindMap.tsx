




















// import React, { useCallback, useEffect, useState } from 'react';
// import { LayoutPanelTop, Plus, Trash2, Link, Palette, Move } from 'lucide-react';
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "@/components/ui/select";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//     Popover,
//     PopoverContent,
//     PopoverTrigger,
// } from "@/components/ui/popover";

// type Node = {
//   id: string;
//   x: number;
//   y: number;
//   label: string;
//   style: {
//     backgroundColor: string;
//     borderColor: string;
//     textColor: string;
//     fontSize: string;
//   };
// };

// type Connection = {
//   id: string;
//   fromId: string;
//   toId: string;
// };

// type InitialData = {
//   nodes?: Node[];
//   connections?: Connection[];
// };

// const MindMapEditor = ({ nodes: initialNodes = [], connections: initialConnections = [] }: any) => {
//   const [nodes, setNodes] = useState<Node[]>(initialNodes.length > 0 ? initialNodes : [{
//     id: '1',
//     x: 400,
//     y: 200,
//     label: 'Central Topic',
//     style: {
//       backgroundColor: '#ffffff',
//       borderColor: '#00796b',
//       textColor: '#000000',
//       fontSize: '14px'
//     }
//   }]);
  
//   const [connections, setConnections] = useState<Connection[]>(initialConnections);
//   const [mode, setMode] = useState('view');
//   const [selectedNode, setSelectedNode] = useState<string | null>(null);
//   const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
//   const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
//   const [nodeStyle, setNodeStyle] = useState({
//     backgroundColor: '#ffffff',
//     borderColor: '#00796b',
//     textColor: '#000000',
//     fontSize: '14px'
//   });
//   const [dragging, setDragging] = useState<{
//     id: string;
//     offsetX: number;
//     offsetY: number;
//   } | null>(null);

//   // Global mouseup to clear dragging state.
//   useEffect(() => {
//     const handleGlobalMouseUp = () => {
//       setDragging(null);
//       setConnectingFrom(null);
//     };
//     window.addEventListener('mouseup', handleGlobalMouseUp);
//     return () => {
//       window.removeEventListener('mouseup', handleGlobalMouseUp);
//     };
//   }, []);

//   const addNode = () => {
//     const newNode: Node = {
//       id: Date.now().toString(),
//       x: Math.random() * 600 + 100,
//       y: Math.random() * 400 + 100,
//       label: 'New Node',
//       style: { ...nodeStyle }
//     };
//     setNodes([...nodes, newNode]);
//   };

//   const deleteNode = (id: string) => {
//     setNodes(nodes.filter(node => node.id !== id));
//     setConnections(connections.filter(conn => 
//       conn.fromId !== id && conn.toId !== id
//     ));
//   };

//   const handleNodeMouseDown = (e: React.MouseEvent, id: string) => {
//     e.stopPropagation();
    
//     if (mode === 'connect') {
//       setConnectingFrom(id);
//       return;
//     }

//     if (mode === 'delete') {
//       deleteNode(id);
//       return;
//     }

//     if (mode === 'view') {
//       const rect = (e.target as HTMLElement).getBoundingClientRect();
//       setDragging({
//         id,
//         offsetX: e.clientX - rect.left,
//         offsetY: e.clientY - rect.top
//       });
//     }
//   };

//   const handleMouseMove = (e: React.MouseEvent) => {
//     const bounds = e.currentTarget.getBoundingClientRect();
//     setMousePos({
//       x: e.clientX - bounds.left,
//       y: e.clientY - bounds.top
//     });

//     if (dragging) {
//       const { id } = dragging;
//       setNodes(nodes.map(node => 
//         node.id === id
//           ? { ...node, x: e.clientX - bounds.left, y: e.clientY - bounds.top }
//           : node
//       ));
//     }
//   };

//   const handleNodeMouseUp = (e: React.MouseEvent, id: string) => {
//     e.stopPropagation();

//     if (mode === 'connect' && connectingFrom && connectingFrom !== id) {
//       // Check if connection already exists
//       const connectionExists = connections.some(
//         conn => (conn.fromId === connectingFrom && conn.toId === id) ||
//                (conn.fromId === id && conn.toId === connectingFrom)
//       );

//       if (!connectionExists) {
//         setConnections([
//           ...connections,
//           {
//             id: `${connectingFrom}-${id}`,
//             fromId: connectingFrom,
//             toId: id
//           }
//         ]);
//       }
//     }
//     setConnectingFrom(null);
//   };

//   const handleCanvasMouseUp = () => {
//     setDragging(null);
//     setConnectingFrom(null);
//   };

//   const updateNodeStyle = (id: string) => {
//     setNodes(nodes.map(node =>
//       node.id === id
//         ? { ...node, style: { ...nodeStyle } }
//         : node
//     ));
//   };

//   return (
//     <div className="h-screen flex flex-col">
//       {/* Navigation Bar */}
//       <div className="bg-slate-800 text-white p-4 space-y-4">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-2">
//             <LayoutPanelTop className="w-6 h-6" />
//             <h1 className="text-xl font-bold">MindMap Editor</h1>
//           </div>
          
//           <Select value={mode} onValueChange={setMode}>
//             <SelectTrigger className="w-32 bg-slate-700">
//               <SelectValue placeholder="Select mode" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="view">
//                 <div className="flex items-center gap-2">
//                   <Move className="w-4 h-4" />
//                   View
//                 </div>
//               </SelectItem>
//               <SelectItem value="connect">
//                 <div className="flex items-center gap-2">
//                   <Link className="w-4 h-4" />
//                   Connect
//                 </div>
//               </SelectItem>
//               <SelectItem value="delete">
//                 <div className="flex items-center gap-2">
//                   <Trash2 className="w-4 h-4" />
//                   Delete
//                 </div>
//               </SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         <div className="flex items-center space-x-4">
//           <Button 
//             variant="secondary" 
//             size="sm"
//             onClick={addNode}
//             className="flex items-center gap-2"
//           >
//             <Plus className="w-4 h-4" />
//             Add Node
//           </Button>

//           <Popover>
//             <PopoverTrigger asChild>
//               <Button variant="secondary" size="sm" className="flex items-center gap-2">
//                 <Palette className="w-4 h-4" />
//                 Style Options
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-80">
//               <div className="space-y-4">
//                 <div>
//                   <label className="text-sm font-medium">Background Color</label>
//                   <Input 
//                     type="color" 
//                     value={nodeStyle.backgroundColor}
//                     onChange={(e) => setNodeStyle(prev => ({
//                       ...prev,
//                       backgroundColor: e.target.value
//                     }))}
//                     className="w-full h-8"
//                   />
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium">Border Color</label>
//                   <Input 
//                     type="color"
//                     value={nodeStyle.borderColor}
//                     onChange={(e) => setNodeStyle(prev => ({
//                       ...prev,
//                       borderColor: e.target.value
//                     }))}
//                     className="w-full h-8"
//                   />
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium">Text Color</label>
//                   <Input 
//                     type="color"
//                     value={nodeStyle.textColor}
//                     onChange={(e) => setNodeStyle(prev => ({
//                       ...prev,
//                       textColor: e.target.value
//                     }))}
//                     className="w-full h-8"
//                   />
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium">Font Size</label>
//                   <Select 
//                     value={nodeStyle.fontSize}
//                     onValueChange={(value) => setNodeStyle(prev => ({
//                       ...prev,
//                       fontSize: value
//                     }))}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select size" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="12px">12px</SelectItem>
//                       <SelectItem value="14px">14px</SelectItem>
//                       <SelectItem value="16px">16px</SelectItem>
//                       <SelectItem value="18px">18px</SelectItem>
//                       <SelectItem value="20px">20px</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 {selectedNode && (
//                   <Button 
//                     className="w-full"
//                     onClick={() => selectedNode && updateNodeStyle(selectedNode)}
//                   >
//                     Apply to Selected
//                   </Button>
//                 )}
//               </div>
//             </PopoverContent>
//           </Popover>
//         </div>

//         <div className="text-sm text-slate-300">
//           {mode === 'view' && 'View Mode: Drag to move nodes'}
//           {mode === 'connect' && 'Connect Mode: Click and drag between nodes to connect them'}
//           {mode === 'delete' && 'Delete Mode: Click a node to delete it'}
//         </div>
//       </div>

//       {/* Canvas */}
//       <div 
//         className="flex-1 relative bg-slate-50"
//         onMouseMove={handleMouseMove}
//         onMouseUp={handleCanvasMouseUp}
//       >
//         <svg className="absolute inset-0 w-full h-full pointer-events-none">
//           {connections.map(conn => {
//             const fromNode = nodes.find(n => n.id === conn.fromId);
//             const toNode = nodes.find(n => n.id === conn.toId);
//             if (!fromNode || !toNode) return null;

//             return (
//               <line
//                 key={conn.id}
//                 x1={fromNode.x}
//                 y1={fromNode.y}
//                 x2={toNode.x}
//                 y2={toNode.y}
//                 stroke="#00796b"
//                 strokeWidth="2"
//                 markerEnd="url(#arrowhead)"
//               />
//             );
//           })}
          
//           {/* Drawing line while connecting */}
//           {connectingFrom && mode === 'connect' && (
//             <line
//               x1={nodes.find(n => n.id === connectingFrom)?.x || 0}
//               y1={nodes.find(n => n.id === connectingFrom)?.y || 0}
//               x2={mousePos.x}
//               y2={mousePos.y}
//               stroke="#00796b"
//               strokeWidth="2"
//               strokeDasharray="5,5"
//             />
//           )}

//           <defs>
//             <marker
//               id="arrowhead"
//               markerWidth="10"
//               markerHeight="7"
//               refX="9"
//               refY="3.5"
//               orient="auto"
//             >
//               <polygon
//                 points="0 0, 10 3.5, 0 7"
//                 fill="#00796b"
//               />
//             </marker>
//           </defs>
//         </svg>
        
//         {nodes.map(node => (
//           <div
//             key={node.id}
//             className="absolute cursor-move p-4 rounded-lg shadow-md transform -translate-x-1/2 -translate-y-1/2"
//             style={{
//               left: node.x,
//               top: node.y,
//               backgroundColor: node.style.backgroundColor,
//               borderColor: node.style.borderColor,
//               borderWidth: 2,
//               borderStyle: 'solid',
//               color: node.style.textColor,
//               fontSize: node.style.fontSize,
//               ...(connectingFrom === node.id ? { outline: '2px solid #0ea5e9' } : {}),
//               ...(selectedNode === node.id ? { outline: '2px solid #6366f1' } : {})
//             }}
//             onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
//             onMouseUp={(e) => handleNodeMouseUp(e, node.id)}
//             onClick={() => setSelectedNode(node.id)}
//           >
//             {node.label}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default MindMapEditor;