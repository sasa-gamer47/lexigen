// components/MindMapDisplay.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node as ReactFlowNode,
  Edge,
  ReactFlowProvider, // Import Provider
} from "reactflow";
import "reactflow/dist/base.css"; // Ensure base styles are imported

// --- Define MindMapNodeData if not already in a shared types file ---
interface MindMapNodeData {
  id: string;
  name: string;
  children?: MindMapNodeData[];
}
// --- End MindMapNodeData definition ---


// --- Copy or Import createReactFlowElements and calculateNodePositions ---
// It's BEST to put these in `lib/reactflowUtils.ts` and import them
// If not, copy their definitions here. For brevity, assuming import:
import { createReactFlowElements } from "@/lib/utils"; // Adjust path if needed
// --- End Copy/Import ---


interface MindMapDisplayProps {
  mindMapData: MindMapNodeData | null | undefined; // Use the defined type
}

const MindMapDisplay: React.FC<MindMapDisplayProps> = ({ mindMapData }) => {
  // Initialize state INSIDE this component
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Effect to update nodes/edges when mindMapData changes for THIS instance
  useEffect(() => {
    if (mindMapData) {
      // Use the utility function to get nodes/edges for THIS mind map
      const { nodes: initialNodes, edges: initialEdges } = createReactFlowElements(mindMapData);
      console.log(`MindMapDisplay (${mindMapData.id}): Setting nodes/edges`, initialNodes, initialEdges);
      setNodes(initialNodes);
      setEdges(initialEdges);
    } else {
      // Clear if no data for this instance
      setNodes([]);
      setEdges([]);
    }
  }, [mindMapData, setNodes, setEdges]); // Dependencies

  if (!mindMapData) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Mind map data not available for this item.
      </div>
    );
  }

  // Render the ReactFlow instance for THIS mind map
  return (
    <ReactFlowProvider>
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange} // Use local state handlers
            onEdgesChange={onEdgesChange} // Use local state handlers
            fitView // Automatically fit the view
            nodesDraggable={true}
            nodesConnectable={false}
            elementsSelectable={true}
            className="bg-gray-700/50 rounded"
            proOptions={{ hideAttribution: true }}
        >
            <Background color="#555" gap={16} />
            <Controls />
        </ReactFlow>
    </ReactFlowProvider>
  );
};

export default MindMapDisplay;
