import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const handleError = (error: unknown) => {
  console.error(error)
  // throw new Error(typeof error === 'string' ? error : JSON.stringify(error))
  // throw new Error(error)
}

export const createReactFlowElements = (mindMapData: any) => {
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