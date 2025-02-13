"use client"

// components/MindMap/index.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  useReactFlow,
  ReactFlowProvider,
  ConnectionMode,
  Panel,
  useViewport
} from 'reactflow';
import 'reactflow/dist/style.css';
import { EditableNode } from './EditableNode';
import { Navbar } from './Navbar';
import * as dagre from 'dagre';
import { graphlib } from 'dagre';

interface MindMapProps {
  initialNodes: {
    nodes: Node[];
    edges: Edge[];
  };
}

// History management interface
interface HistoryItem {
  nodes: Node[];
  edges: Edge[];
}

function MindMapComponent({ initialNodes }: MindMapProps) {
  // Core states
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialNodes.edges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [mode, setMode] = useState<'edit' | 'connect' | 'drag'>('edit');
  const [autoConnect, setAutoConnect] = useState(true);
  
  // History management
  const [history, setHistory] = useState<HistoryItem[]>([{ nodes: initialNodes.nodes, edges: initialNodes.edges }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // Node styling
  const [nodeStyle, setNodeStyle] = useState({
    backgroundColor: '#ffffff',
    borderColor: '#000000',
    textColor: '#000000',
    borderWidth: 1,
    borderRadius: 8,
    shape: 'rectangle' as const
  });

  const reactFlowInstance = useReactFlow();
  const { zoom } = useViewport();

  // Initialize with data
  useEffect(() => {
    if (initialNodes) {
      setNodes(initialNodes.nodes);
      setEdges(initialNodes.edges);
      setHistory([{ nodes: initialNodes.nodes, edges: initialNodes.edges }]);
      setHistoryIndex(0);
    }
  }, [initialNodes, setNodes, setEdges]);

  // Add to history when nodes or edges change
  const addToHistory = useCallback((newNodes: Node[], newEdges: Edge[]) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      return [...newHistory, { nodes: newNodes, edges: newEdges }];
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  // Undo/Redo functions
  const onUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const { nodes: prevNodes, edges: prevEdges } = history[newIndex];
      setNodes(prevNodes);
      setEdges(prevEdges);
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex, setNodes, setEdges]);

  const onRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const { nodes: nextNodes, edges: nextEdges } = history[newIndex];
      setNodes(nextNodes);
      setEdges(nextEdges);
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex, setNodes, setEdges]);

  // Layout functions
  const getLayoutedElements = (nodes: Node[], edges: Edge[], direction: 'TB' | 'LR' | 'Grid') => {
    if (direction === 'Grid') {
      return getGridLayout(nodes, edges);
    }
    const dagreGraph = new graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: 150, height: 50 });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - 75,
          y: nodeWithPosition.y - 25,
        },
      };
    });

    return { nodes: layoutedNodes, edges };
  };

  const getGridLayout = (nodes: Node[], edges: Edge[]) => {
    const spacing = 200;
    const nodesPerRow = Math.ceil(Math.sqrt(nodes.length));
    
    const layoutedNodes = nodes.map((node, index) => {
      const row = Math.floor(index / nodesPerRow);
      const col = index % nodesPerRow;
      return {
        ...node,
        position: {
          x: col * spacing,
          y: row * spacing,
        },
      };
    });

    return { nodes: layoutedNodes, edges };
  };

  const onAutoLayout = useCallback((direction: 'horizontal' | 'vertical' | 'grid') => {
    const dir = direction === 'horizontal' ? 'LR' : direction === 'vertical' ? 'TB' : 'Grid';
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, dir);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    addToHistory(layoutedNodes, layoutedEdges);
  }, [nodes, edges, setNodes, setEdges, addToHistory]);

  // Node operations
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdges = addEdge(params, edges);
      setEdges(newEdges);
      addToHistory(nodes, newEdges);
    },
    [edges, nodes, setEdges, addToHistory]
  );

  const addChildNode = useCallback(() => {
    if (!selectedNode) return;

    const newId = `node-${nodes.length + 1}`;
    const position = {
      x: selectedNode.position.x + 200,
      y: selectedNode.position.y,
    };

    const newNode: Node = {
      id: newId,
      type: 'editable',
      position,
      data: { 
        label: 'New Node',
        style: nodeStyle
      },
    };

    const newNodes = [...nodes, newNode];
    let newEdges = edges;

    if (autoConnect) {
      const newEdge: Edge = {
        id: `edge-${selectedNode.id}-${newId}`,
        source: selectedNode.id,
        target: newId,
        type: 'smoothstep'
      };
      newEdges = [...edges, newEdge];
    }

    setNodes(newNodes);
    setEdges(newEdges);
    addToHistory(newNodes, newEdges);
  }, [selectedNode, nodes, edges, nodeStyle, autoConnect, setNodes, setEdges, addToHistory]);

  const deleteNode = useCallback(() => {
    if (!selectedNode) return;

    const newNodes = nodes.filter((node) => node.id !== selectedNode.id);
    const newEdges = edges.filter(
      (edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id
    );

    setNodes(newNodes);
    setEdges(newEdges);
    setSelectedNode(null);
    addToHistory(newNodes, newEdges);
  }, [selectedNode, nodes, edges, setNodes, setEdges, addToHistory]);

  // Save and export
  const onSave = useCallback(() => {
    const flow = reactFlowInstance.toObject();
    localStorage.setItem('mindmap', JSON.stringify(flow));
  }, [reactFlowInstance]);

  const onExport = useCallback(() => {
    const flow = reactFlowInstance.toObject();
    const dataStr = JSON.stringify(flow, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportElem = document.createElement('a');
    exportElem.setAttribute('href', dataUri);
    exportElem.setAttribute('download', 'mindmap.json');
    exportElem.click();
  }, [reactFlowInstance]);

  // Zoom controls
  const onZoomIn = useCallback(() => {
    reactFlowInstance.zoomIn();
  }, [reactFlowInstance]);

  const onZoomOut = useCallback(() => {
    reactFlowInstance.zoomOut();
  }, [reactFlowInstance]);

  // Node selection
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
    },
    []
  );

  return (
    <div className="w-full h-full">
      <Navbar
        mode={mode}
        setMode={setMode}
        autoConnect={autoConnect}
        setAutoConnect={setAutoConnect}
        nodeStyle={nodeStyle}
        setNodeStyle={setNodeStyle}
        onAddNode={addChildNode}
        onDeleteNode={deleteNode}
        onExport={onExport}
        // onSave={onSave}
        // onUndo={onUndo}
        // onRedo={onRedo}
        // onZoomIn={onZoomIn}
        // onZoomOut={onZoomOut}
        // onAutoLayout={onAutoLayout}
        hasSelectedNode={!!selectedNode}
        // canUndo={historyIndex > 0}
        // canRedo={historyIndex < history.length - 1}
      />
      
      <div className="w-full h-[calc(100%-4rem)]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={{ editable: EditableNode }}
          connectionMode={mode === 'connect' ? ConnectionMode.Strict : ConnectionMode.Loose}
          panOnDrag={mode === 'drag'}
          nodesDraggable={mode === 'drag'}
          nodesConnectable={mode === 'connect'}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
}

export function MindMapEditor(props: MindMapProps) {
  return (
    <ReactFlowProvider>
      <MindMapComponent {...props} />
    </ReactFlowProvider>
  );
}