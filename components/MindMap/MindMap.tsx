"use client";

// // components/MindMap/index.tsx
// import React, { useState, useCallback, useEffect } from 'react';
// import ReactFlow, {
//   MiniMap,
//   Controls,
//   Background,
//   useNodesState,
//   useEdgesState,
//   addEdge,
//   Connection,
//   Edge,
//   Node,
//   useReactFlow,
//   ReactFlowProvider,
//   ConnectionMode,
//   useViewport
// } from 'reactflow';
// import 'reactflow/dist/style.css';
// import { EditableNode } from './EditableNode';
// import { Navbar } from './Navbar';
// import * as dagre from 'dagre';
// import { graphlib } from 'dagre';

// interface MindMapProps {
//   initialData?: string;  // JSON string containing the map data
// }

// // History management interface
// interface HistoryItem {
//   nodes: Node[];
//   edges: Edge[];
// }

// function MindMapComponent({ initialData }: MindMapProps) {
//   // Parse initial data
//   const initialNodes = initialData ? JSON.parse(initialData) : { nodes: [], edges: [] };

//   // Core states
//   const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes.nodes);
//   const [edges, setEdges, onEdgesChange] = useEdgesState(initialNodes.edges);
//   const [selectedNode, setSelectedNode] = useState<Node | null>(null);
//   const [mode, setMode] = useState<'edit' | 'connect' | 'drag'>('edit');
//   const [autoConnect, setAutoConnect] = useState(true);
  
//   // History management
//   const [history, setHistory] = useState<HistoryItem[]>([{ nodes: initialNodes.nodes, edges: initialNodes.edges }]);
//   const [historyIndex, setHistoryIndex] = useState(0);
  
//   // Node styling
//   const [nodeStyle, setNodeStyle] = useState({
//     backgroundColor: '#ffffff',
//     borderColor: '#000000',
//     textColor: '#000000',
//     borderWidth: 1,
//     borderRadius: 8,
//     shape: 'rectangle' as const
//   });

//   const reactFlowInstance = useReactFlow();
//   const { zoom } = useViewport();

//   // Export function
//   const handleExport = useCallback(() => {
//     const flowData = JSON.stringify({ nodes, edges });
//     return flowData;
//   }, [nodes, edges]);

//   // Initialize with data
//   useEffect(() => {
//     if (initialNodes) {
//       setNodes(initialNodes.nodes);
//       setEdges(initialNodes.edges);
//       setHistory([{ nodes: initialNodes.nodes, edges: initialNodes.edges }]);
//       setHistoryIndex(0);
//     }
//   }, [initialData, setNodes, setEdges]);

//   // Add to history when nodes or edges change
//   const addToHistory = useCallback((newNodes: Node[], newEdges: Edge[]) => {
//     setHistory(prev => {
//       const newHistory = prev.slice(0, historyIndex + 1);
//       return [...newHistory, { nodes: newNodes, edges: newEdges }];
//     });
//     setHistoryIndex(prev => prev + 1);
//   }, [historyIndex]);

//   // Node operations
//   const onConnect = useCallback(
//     (params: Connection) => {
//       const newEdges = addEdge(params, edges);
//       setEdges(newEdges);
//       addToHistory(nodes, newEdges);
//     },
//     [edges, nodes, setEdges, addToHistory]
//   );

//   const addChildNode = useCallback(() => {
//     if (!selectedNode) return;

//     const newId = `node-${nodes.length + 1}`;
//     const position = {
//       x: selectedNode.position.x + 200,
//       y: selectedNode.position.y,
//     };

//     const newNode: Node = {
//       id: newId,
//       type: 'editable',
//       position,
//       data: { 
//         label: 'New Node',
//         style: nodeStyle
//       },
//     };

//     const newNodes = [...nodes, newNode];
//     let newEdges = edges;

//     if (autoConnect) {
//       const newEdge: Edge = {
//         id: `edge-${selectedNode.id}-${newId}`,
//         source: selectedNode.id,
//         target: newId,
//         type: 'smoothstep'
//       };
//       newEdges = [...edges, newEdge];
//     }

//     setNodes(newNodes);
//     setEdges(newEdges);
//     addToHistory(newNodes, newEdges);
//   }, [selectedNode, nodes, edges, nodeStyle, autoConnect, setNodes, setEdges, addToHistory]);

//   const deleteNode = useCallback(() => {
//     if (!selectedNode) return;

//     const newNodes = nodes.filter((node) => node.id !== selectedNode.id);
//     const newEdges = edges.filter(
//       (edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id
//     );

//     setNodes(newNodes);
//     setEdges(newEdges);
//     setSelectedNode(null);
//     addToHistory(newNodes, newEdges);
//   }, [selectedNode, nodes, edges, setNodes, setEdges, addToHistory]);

//   // Node selection
//   const onNodeClick = useCallback(
//     (_: React.MouseEvent, node: Node) => {
//       setSelectedNode(node);
//     },
//     []
//   );

//   return (
//     <div>
//       <Navbar
//         mode={mode}
//         setMode={setMode}
//         autoConnect={autoConnect}
//         setAutoConnect={setAutoConnect}
//         nodeStyle={nodeStyle}
//         setNodeStyle={setNodeStyle}
//         onAddNode={addChildNode}
//         onDeleteNode={deleteNode}
//         hasSelectedNode={!!selectedNode}
//         onExport={handleExport}
//       />
      
//       <div className="w-full h-[calc(100%-4rem)]">
//         <ReactFlow
//           nodes={nodes}
//           edges={edges}
//           onNodesChange={onNodesChange}
//           onEdgesChange={onEdgesChange}
//           onConnect={onConnect}
//           onNodeClick={onNodeClick}
//           nodeTypes={{ editable: EditableNode }}
//           connectionMode={mode === 'connect' ? ConnectionMode.Strict : ConnectionMode.Loose}
//           panOnDrag={mode === 'drag'}
//           nodesDraggable={mode === 'drag'}
//           nodesConnectable={mode === 'connect'}
//           fitView
//         >
//           <Background />
//           <Controls />
//           <MiniMap />
//         </ReactFlow>
//       </div>
//     </div>
//   );
// }

// export function MindMapEditor(props: MindMapProps) {
//   return (
//     <ReactFlowProvider>
//       <MindMapComponent {...props} />
//     </ReactFlowProvider>
//   );
// }












import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Handle,
  Position,
  NodeToolbar,
} from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';

const nodeWidth = 172;
const nodeHeight = 36;

interface LayoutOptions {
  rankdir: string;
}

interface NodeDimensions {
  width: number;
  height: number;
}

interface NodePosition {
  x: number;
  y: number;
}

interface DagreNode extends NodeDimensions {
  x: number;
  y: number;
}

interface FlowNode {
  id: string;
  position: NodePosition;
  targetPosition?: Position;
  sourcePosition?: Position;
  data: any;
  type?: string;
}

interface FlowEdge {
  id: string;
  source: string;
  target: string;
}

const getLayoutedElements = (
  nodes: FlowNode[],
  edges: FlowEdge[],
  direction: 'TB' | 'LR' = 'TB'
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction } as LayoutOptions);

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight } as NodeDimensions);
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id) as DagreNode;
    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};

interface NodeData {
  label: string;
}

const CustomNode = ({ data }: { data: NodeData }) => {
  interface ChangeEvent {
    target: {
      value: string;
    }
  }

  const onChange = useCallback((evt: ChangeEvent): void => {
    console.log(evt.target.value);
  }, []);

  return (
    <>
      <NodeToolbar>
        <button onClick={() => alert('Toolbar action')}>Action</button>
      </NodeToolbar>
      <Handle type="target" position={Position.Top} />
      <div>
        <label htmlFor="text">Text:</label>
        <input id="text" name="text" onChange={onChange} className="nodrag" />
      </div>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
};

const nodeTypes = {
  customNode: CustomNode,
};

const initialNodes = [
  { id: '1', type: 'customNode', data: { label: 'Node 1' }, position: { x: 0, y: 0 } },
  { id: '2', type: 'customNode', data: { label: 'Node 2' }, position: { x: 0, y: 0 } },
  { id: '3', type: 'customNode', data: { label: 'Node 3' }, position: { x: 0, y: 0 } },
];

const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }, { id: 'e2-3', source: '2', target: '3' }];

const Flow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  interface ConnectParams {
    source: string | null;
    target: string | null;
    sourceHandle: string | null;
    targetHandle: string | null;
  }

  const onConnect = useCallback(
    (params: ConnectParams) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const layoutedElements = useMemo(() => getLayoutedElements(nodes, edges), [nodes, edges]);

  return (
    <ReactFlow
      nodes={layoutedElements.nodes}
      edges={layoutedElements.edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      fitView
    >
      <Controls />
    </ReactFlow>
  );
};

export default Flow;
