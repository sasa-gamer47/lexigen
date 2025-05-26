// app/(root)/mindmaps/create/mindmapUtils.ts
import { Node as ReactFlowNode, Edge } from '@xyflow/react'; // Corrected import path if using @xyflow

interface MindMapNode {
  id: string;
  name: string;
  children: MindMapNode[];
}

const themes = { // This should be defined here or imported if it's elsewhere
    modern: {
        nodeBackgroundColor: '#F0F4F8', nodeColor: '#2C3E50', nodeBorderColor: '#BDC3C7',
        nodeBorderRadius: '6px', nodePadding: '10px 15px', edgeStrokeColor: '#3498DB',
        edgeStrokeWidth: 2, fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
    },
    nature: {
        nodeBackgroundColor: '#E8F5E9', nodeColor: '#38761D', nodeBorderColor: '#A9D18E',
        nodeBorderRadius: '10px', nodePadding: '12px 18px', edgeStrokeColor: '#609966',
        edgeStrokeWidth: 2, fontFamily: 'Georgia, "Times New Roman", Times, serif',
    },
    tech: {
        nodeBackgroundColor: '#222222', nodeColor: '#00FF00', nodeBorderColor: '#00FF00',
        nodeBorderRadius: '4px', nodePadding: '10px 15px', edgeStrokeColor: '#00CCFF',
        edgeStrokeWidth: 2.5, fontFamily: '"Courier New", Courier, monospace', 
    },
    classic: {
        nodeBackgroundColor: '#FFFFFF', nodeColor: '#000000', nodeBorderColor: '#000000',
        nodeBorderRadius: '0px', nodePadding: '10px 15px', edgeStrokeColor: '#555555',
        edgeStrokeWidth: 1.5, fontFamily: '"Times New Roman", Times, serif', 
    },
    creative: {
        nodeBackgroundColor: '#FFFACD', nodeColor: '#D9534F', nodeBorderColor: '#FFB6C1',
        nodeBorderRadius: '15px', nodePadding: '12px 20px', edgeStrokeColor: '#5BC0DE', 
        edgeStrokeWidth: 2, fontFamily: '"Comic Sans MS", "Trebuchet MS", cursive, sans-serif', 
    },
    default: {
        nodeBackgroundColor: '#F5F5F5', nodeColor: '#333333', nodeBorderColor: '#CCCCCC',
        nodeBorderRadius: '5px', nodePadding: '10px 15px', edgeStrokeColor: '#888888',
        edgeStrokeWidth: 2, fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
    }
};

export const createReactFlowElements = (mindMapData: MindMapNode | null, theme: string): { nodes: ReactFlowNode[], edges: Edge[] } => {
  if (!mindMapData || !mindMapData.id) { 
    console.warn("Mind map data is missing, malformed, or lacks a root ID. Returning empty nodes/edges.");
    return { nodes: [], edges: [] };
  }
  
  const newNodes: ReactFlowNode[] = [];
  const newEdges: Edge[] = [];
  const nodePositions: { [key: string]: { x: number; y: number } } = {};
  const horizontalSpacing = 200; 
  const verticalSpacing = 100;

  const selectedTheme = themes[theme as keyof typeof themes] || themes.default;

  const traverse = (node: MindMapNode, parentId: string | null, level: number, index: number) => {
    const nodeId = node.id;
    const nodeLabel = node.name;
    
    const x = parentId ? (nodePositions[parentId]?.x || 0) + (index % 2 === 0 ? -horizontalSpacing : horizontalSpacing) : 0;
    const y = parentId ? (nodePositions[parentId]?.y || 0) + verticalSpacing : 0;
    nodePositions[nodeId] = { x, y };

    newNodes.push({
      id: nodeId,
      type: "default",
      position: { x, y },
      data: { label: nodeLabel },
      style: {
        backgroundColor: selectedTheme.nodeBackgroundColor,
        color: selectedTheme.nodeColor,
        border: `1px solid ${selectedTheme.nodeBorderColor}`,
        borderRadius: selectedTheme.nodeBorderRadius,
        padding: selectedTheme.nodePadding,
        fontFamily: selectedTheme.fontFamily,
      },
    });

    if (parentId) {
      newEdges.push({
        id: `e-${parentId}-${nodeId}`,
        source: parentId,
        target: nodeId,
        type: "smoothstep",
        animated: true,
        style: {
          stroke: selectedTheme.edgeStrokeColor,
          strokeWidth: selectedTheme.edgeStrokeWidth,
        },
      });
    }

    if (node.children && node.children.length > 0) {
      node.children.forEach((child, childIndex) => {
        traverse(child, nodeId, level + 1, childIndex);
      });
    }
  };

  traverse(mindMapData, null, 0, 0);
  return { nodes: newNodes, edges: newEdges };
};
