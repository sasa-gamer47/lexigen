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
    MiniMap,
    Connection,
    ConnectionMode,
    MarkerType,
    Node,
    Edge,
    NodeProps,
} from "reactflow";
import { Button } from "@/components/ui/button";
import { Trash, LayoutDashboard, Plus, Undo, Redo, CircleDot, ArrowRightCircle, Trees, Edit, Palette, Text, Circle, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "next-themes";

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

type LayoutType = 'grid' | 'horizontal' | 'vertical' | 'radial' | 'hierarchy';
type MapStyle = 'modern' | 'classic' | 'dark' | 'handDrawn';

const nodeRadius = 50;
const horizontalSpacing = 150;
const verticalSpacing = 100;
const radialSpacing = 120; // Increased spacing for better radial layout
const hierarchySpacingX = 200;
const hierarchySpacingY = 150;

// Layout Calculation Functions
const calculateGridPosition = (index: number, columns: number): { x: number; y: number } => {
    const x = (index % columns) * horizontalSpacing;
    const y = Math.floor(index / columns) * verticalSpacing;
    return { x, y };
};

const calculateHorizontalPosition = (index: number): { x: number; y: number } => {
    const x = index * horizontalSpacing;
    const y = 0;
    return { x, y };
};

const calculateVerticalPosition = (index: number): { x: number; y: number } => {
    const x = 0;
    const y = index * verticalSpacing;
    return { x, y };
};

const calculateRadialPosition = (index: number, total: number, centerX: number, centerY: number): { x: number; y: number } => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const radius = radialSpacing * Math.sqrt(total); // Adjust radius scaling
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return { x, y };
};

const calculateHierarchyPosition = (nodes: Node[], edges: Edge[]): Node[] => {
    const newNodes = [...nodes];
    const roots = newNodes.filter(node => !edges.find(edge => edge.target === node.id));
    if (roots.length === 0) return newNodes;

    const levels: Record<string, number> = {};
    const assigned: Set<string> = new Set();

    const assignLevels = (nodeId: string, level: number) => {
        if (levels[nodeId] === undefined) {
            levels[nodeId] = level;
            assigned.add(nodeId);
            const children = edges.filter(edge => edge.source === nodeId).map(edge => edge.target);
            children.forEach(childId => assignLevels(childId, level + 1));
        }
    };

    roots.forEach(root => assignLevels(root.id, 0));

    const maxLevel = Math.max(...Object.values(levels));
    const nodesByLevel: Record<number, Node[]> = {};

    newNodes.forEach(node => {
        const level = levels[node.id] ?? maxLevel + 1;
        if (!nodesByLevel[level]) {
            nodesByLevel[level] = [];
        }
        nodesByLevel[level].push(node);
    });

    Object.entries(nodesByLevel).forEach(([, levelNodes], levelIndex) => {
        levelNodes.forEach((node, nodeIndex) => {
            const x = (nodeIndex - levelNodes.length / 2 + 0.5) * hierarchySpacingX;
            const y = levelIndex * hierarchySpacingY;
            newNodes.find(n => n.id === node.id)!.position = { x, y };
        });
    });
    return newNodes;
};

// Layout Application
const applyLayout = (nodes: Node[], layout: LayoutType, edges: Edge[]): Node[] => {
    if (nodes.length === 0) return [];
    let newNodes: Node[] = [];
    switch (layout) {
        case 'grid':
            const columns = Math.ceil(Math.sqrt(nodes.length));
            newNodes = nodes.map((node, index) => ({
                ...node,
                position: calculateGridPosition(index, columns),
            }));
            break;
        case 'horizontal':
            newNodes = nodes.map((node, index) => ({
                ...node,
                position: calculateHorizontalPosition(index),
            }));
            break;
        case 'vertical':
            newNodes = nodes.map((node, index) => ({
                ...node,
                position: calculateVerticalPosition(index),
            }));
            break;
        case 'radial':
            const centerX = 0;
            const centerY = 0;
            newNodes = nodes.map((node, index) => {
                return {
                    ...node,
                    position: calculateRadialPosition(index, nodes.length, centerX, centerY),
                }
            });
            break;
        case 'hierarchy':
            newNodes = calculateHierarchyPosition(nodes, edges);
            break;
        default:
            newNodes = nodes;
    }
    return newNodes;
};

// Custom Node Component
const EditableNode: React.FC<NodeProps> = ({ data, id, selected }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState(data?.label || 'Node');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setLabel(data?.label || 'Node')
    }, [data]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLabel(event.target.value);
    };

    const handleLabelSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (inputRef.current) {
            inputRef.current.blur();
        }
        setIsEditing(false);
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleBlur = () => {
        setIsEditing(false);
    };

    const getNodeStyle = () => {
        const baseStyle: React.CSSProperties = {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px',
            width: 'auto',
            height: 'auto',
            minWidth: '100px',
            minHeight: '40px',
            cursor: 'pointer',
            boxShadow: selected ? '0 0 5px 2px rgba(0, 128, 255, 0.5)' : 'none',
        };
        const combinedStyle = { ...baseStyle, ...data.style };
        return combinedStyle;
    };

    return (
        <div style={getNodeStyle()} className="relative">
            <AnimatePresence>
                {isEditing ? (
                    <motion.form
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onSubmit={handleLabelSubmit}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <Input
                            ref={inputRef}
                            value={label}
                            onChange={handleLabelChange}
                            onBlur={handleBlur}
                            className="text-black text-sm font-medium"
                            style={{
                                width: '100%',
                                height: '100%',
                                padding: '0.5rem',
                                textAlign: 'center',
                                border: 'none',
                                outline: 'none',
                                backgroundColor: 'transparent',
                                fontSize: 'inherit',
                                fontFamily: 'inherit',
                            }}
                        />
                    </motion.form>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="text-sm font-medium select-none"
                        style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '100%',
                            userSelect: 'none'
                        }}
                        onDoubleClick={handleEdit}
                        title="Double click to edit"
                    >
                        {label}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Main App Component
export default function App({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const { isLoaded, isSignedIn, userId } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [mindMap, setMindMap] = useState<MindMapResponse | null>(null);

    const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
    const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);

    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [rfInstance, setRfInstance] = useState<any>(null);
    const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[] }[]>([{ nodes: [], edges: [] }]);
    const [historyIndex, setHistoryIndex] = useState(0);

    const [layout, setLayout] = useState<LayoutType>("grid");
    const [mapStyle, setMapStyle] = useState<MapStyle>("modern"); // Added state for map style

    // Aesthetic Properties
    const [nodeColor, setNodeColor] = useState('white');
    const [borderColor, setBorderColor] = useState('black');
    const [textColor, setTextColor] = useState('black');
    const [nodeShape, setNodeShape] = useState<'circle' | 'square'>('square');
    const [borderWidth, setBorderWidth] = useState(2);
    const [fontSize, setFontSize] = useState(14);
    const { setTheme } = useTheme();

    // Connection Handler
    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed, color: 'black' } }, eds)),
        [setEdges]
    );

    // Fit View
    const fitView = useCallback(() => {
        if (!rfInstance || !reactFlowWrapper.current || nodes.length === 0) {
            return;
        }
        const nodesBounds = getRectOfNodes(nodes);
        const wrapperBounds = reactFlowWrapper.current.getBoundingClientRect();
        const transform = getTransformForBounds(nodesBounds, wrapperBounds.width, wrapperBounds.height, 0.7, 2);
        rfInstance.setTransform(transform);
    }, [rfInstance, nodes]);

    // Fetch User Data
    useEffect(() => {
        const fetchUser = async () => {
            const userData = userId ? await getUserByClerkId(userId) : null;
            setUser(userData?.[0] || null);
        };
        fetchUser();
    }, [userId]);

    // Fetch Mind Map Data
    useEffect(() => {
        const fetchMindMap = async () => {
            let fetchedMindMap;
            try {
                fetchedMindMap = user ? await getMindMap(id) : null;
                console.log('Fetched MindMap:', fetchedMindMap); // Inspect the fetched data

                if (fetchedMindMap && fetchedMindMap.mindMap) {
                    setMindMap(fetchedMindMap);
                    setNodes(fetchedMindMap.mindMap.initialNodes || []);
                    setEdges(fetchedMindMap.mindMap.initialEdges || []);
                } else {
                    setMindMap(null);
                    setNodes([]);
                    setEdges([]);
                }
            } catch (error: any) {
                console.error('Error fetching mind map:', error);
                setMindMap(null);
                setNodes([]);
                setEdges([]);
            }
        };
        if (user) {
            fetchMindMap();
        }
    }, [user, id]);

    // Fit View on Node/Edge Changes
    useEffect(() => {
        fitView();
    }, [nodes, edges, fitView]);

    // History Management
    const saveHistory = useCallback(() => {
        setHistory((prevHistory) => {
            const newHistory = [...prevHistory.slice(0, historyIndex + 1), { nodes: nodes, edges: edges }];
            return newHistory.slice(-10);
        });
        setHistoryIndex((prevIndex) => Math.min(prevIndex + 1, 9));
    }, [nodes, edges, historyIndex]);

    const handleUndo = useCallback(() => {
        if (historyIndex > 0) {
            setHistoryIndex((prevIndex) => prevIndex - 1);
            setNodes(history[historyIndex - 1].nodes);
            setEdges(history[historyIndex - 1].edges);
        }
    }, [history, historyIndex]);

    const handleRedo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex((prevIndex) => prevIndex + 1);
            setNodes(history[historyIndex + 1].nodes);
            setEdges(history[historyIndex + 1].edges);
        }
    }, [history, historyIndex]);

    // Layout Handler
    const handleLayout = useCallback(() => {
        const newNodes = applyLayout(nodes, layout, edges);
        setNodes(newNodes);
        fitView();
    }, [nodes, layout, edges, fitView]);

    const handleLayoutChange = (newLayout: LayoutType) => {
        setLayout(newLayout);
        handleLayout();
    };

    // Save History on Node/Edge Changes
    useEffect(() => {
        saveHistory();
    }, [nodes, edges, saveHistory]);

    // Delete Selected Nodes and Edges
    const handleDeleteSelected = useCallback(() => {
        setNodes((nds) => nds.filter((node) => !node.selected));
        setEdges((eds) => eds.filter((edge) => !edge.selected));
        setSelectedNodes([]);
    }, []);

    // Add New Node
    const handleAddNode = useCallback(() => {
        const newId = `node-${Date.now()}`;
        const newNode = {
            id: newId,
            type: 'custom',
            position: { x: 0, y: 0 },
            data: { label: 'New Node' },
            style: {
                backgroundColor: nodeColor,
                borderColor: borderColor,
                color: textColor,
                borderRadius: nodeShape === 'circle' ? '50%' : '0%',
                borderWidth: `${Number(borderWidth)}px`,
                fontSize: `${fontSize}px`,
            },
        };
        setNodes((nds) => nds.concat(newNode));
    }, [nodeColor, borderColor, textColor, nodeShape, borderWidth, fontSize]);

    // Handle Node Selection
    const handleNodeSelect = useCallback((selected: Node[]) => {
        setSelectedNodes(selected);
        if (selected.length === 1) {
            setNodeColor(selected[0].style?.backgroundColor || 'white');
            setBorderColor(selected[0].style?.borderColor || 'black');
            setTextColor(selected[0].style?.color || 'black');
            setNodeShape(selected[0].style?.borderRadius === '50%' ? 'circle' : 'square');
            setBorderWidth(selected[0].style?.borderWidth ? parseInt(selected[0].style.borderWidth as string, 10) : 2);
            setFontSize(selected[0].style?.fontSize ? parseInt(selected[0].style.fontSize, 10) : 14);
        } 
    }, []);

    // Apply Styles to Selected Nodes
    const applyStylesToSelectedNodes = useCallback(() => {
        setNodes(prevNodes =>
            prevNodes.map(node => {
                if (selectedNodes.find(selectedNode => selectedNode.id === node.id)) {
                    return {
                        ...node,
                        style: {
                            ...node.style,
                            backgroundColor: nodeColor,
                            borderColor: borderColor,
                            color: textColor,
                            borderRadius: nodeShape === 'circle' ? '50%' : '0%',
                            borderWidth: `${borderWidth}px`,
                            fontSize: `${fontSize}px`,
                        }
                    };
                }
                return node;
            })
        );
    }, [selectedNodes, nodeColor, borderColor, textColor, nodeShape, borderWidth, fontSize]);


    // Theme Change Handler
    const handleThemeChange = (theme: string) => {
        setTheme(theme);
    };

    const handleMapStyleChange = (style: MapStyle) => {
        setMapStyle(style);
        // Apply style changes here, e.g., change colors, fonts, etc.
        switch (style) {
            case 'modern':
                setNodeColor('white');
                setBorderColor('black');
                setTextColor('black');
                setFontSize(14);
                break;
            case 'classic':
                setNodeColor('#f0e68c'); // Khaki
                setBorderColor('#b8860b'); // Dark Goldenrod
                setTextColor('black');
                setFontSize(12);
                break;
            case 'dark':
                setNodeColor('#2d3748'); // Dark Gray
                setBorderColor('#cbd5e0'); // Gray 300
                setTextColor('white');
                setFontSize(14);
                break;
            case 'handDrawn':
                setNodeColor('white');
                setBorderColor('black');
                setTextColor('black');
                setFontSize(16);
                break;
            default:
                setNodeColor('white');
                setBorderColor('black');
                setTextColor('black');
                setFontSize(14);
        }
    };

    // Render
    return (
        <div className="lexigen-bg w-screen h-screen">
            <Sidebar />
            <div className="absolute w-5/6 right-0 top-20 bottom-20 p-5 flex flex-col items-center gap-y-5">
                <h1 className="text-sky-200 text-3xl font-semibold text-center">
                    {mindMap?.title || "Create your Mind Map"}
                </h1>
                <div className="flex gap-2">
                    <Button onClick={handleUndo} disabled={historyIndex === 0}><Undo className="h-4 w-4 mr-2" />Undo</Button>
                    <Button onClick={handleRedo} disabled={historyIndex === history.length - 1}><Redo className="h-4 w-4 mr-2" />Redo</Button>
                    <Button onClick={() => handleLayoutChange('grid')} className={cn(layout === 'grid' && 'bg-blue-500 text-white')}>
                        <CircleDot className="h-4 w-4 mr-2" />Grid
                    </Button>
                    <Button onClick={() => handleLayoutChange('horizontal')} className={cn(layout === 'horizontal' && 'bg-blue-500 text-white')}>
                        <ArrowRightCircle className="h-4 w-4 mr-2 rotate-90" />Horizontal
                    </Button>
                    <Button onClick={() => handleLayoutChange('vertical')} className={cn(layout === 'vertical' && 'bg-blue-500 text-white')}>
                        <ArrowRightCircle className="h-4 w-4 mr-2" />Vertical
                    </Button>
                    <Button onClick={() => handleLayoutChange('radial')} className={cn(layout === 'radial' && 'bg-blue-500 text-white')}>
                        <CircleDot className="h-4 w-4 mr-2" />Radial
                    </Button>
                    <Button onClick={() => handleLayoutChange('hierarchy')} className={cn(layout === 'hierarchy' && 'bg-blue-500 text-white')}>
                        <Trees className="h-4 w-4 mr-2" />Hierarchy
                    </Button>
                    <Button onClick={handleLayout}><LayoutDashboard className="h-4 w-4 mr-2" />Layout</Button>
                    <Button onClick={handleDeleteSelected}><Trash className="h-4 w-4 mr-2" />Delete Selected</Button>
                    <Button onClick={handleAddNode}><Plus className="h-4 w-4 mr-2" />Add Node</Button>
                </div>
                <div className="relative w-full h-full">
                    <div className="absolute w-full h-full bg-white rounded-lg opacity-25"></div>
                    <div className="w-full h-full" ref={reactFlowWrapper}>
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            onLoad={setRfInstance}
                            fitView={false}
                            connectionMode={ConnectionMode.Loose}
                            onNodeDragStop={saveHistory}
                            onEdgeUpdateEnd={saveHistory}
                            nodeTypes={{
                                custom: EditableNode,
                            }}                            
                            onNodeClick={(_, node) => handleNodeSelect([node])}                            
                            onNodesChange={(changes) => { onNodesChange(changes); if (changes.some(c => c.type === 'select' && !c.selected)) setSelectedNodes([])}}
                        >
                            <Background color="#aaa" size={3} />
                            <Controls />
                            <MiniMap />
                        </ReactFlow>
                    </div>
                </div>
            </div>

            {/* Bottom Navbar */}
            <div className="fixed bottom-0 left-0 right-0 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2 flex flex-wrap items-center justify-center gap-2 z-50">
                <div className="flex items-center gap-1">
                    <Label htmlFor="node-color" className="text-xs sm:text-sm">Node Color:</Label>
                    <Input
                        id="node-color"
                        type="color"
                        value={nodeColor}
                        onChange={(e) => setNodeColor(e.target.value)}
                        className="w-8 h-8 sm:w-10 sm:h-10 p-0 border-0 cursor-pointer"
                        title="Node Color"
                    />
                </div>
                <div className="flex items-center gap-1">
                    <Label htmlFor="border-color" className="text-xs sm:text-sm">Border Color:</Label>
                    <Input
                        id="border-color"
                        type="color"
                        value={borderColor}
                        onChange={(e) => setBorderColor(e.target.value)}
                        className="w-8 h-8 sm:w-10 sm:h-10 p-0 border-0 cursor-pointer"
                        title="Border Color"
                    />
                </div>
                <div className="flex items-center gap-1">
                    <Label htmlFor="text-color" className="text-xs sm:text-sm">Text Color:</Label>
                    <Input
                        id="text-color"
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-8 h-8 sm:w-10 sm:h-10 p-0 border-0 cursor-pointer"
                        title="Text Color"
                    />
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-xs sm:text-sm">Shape:</span>
                    <Button
                        variant={nodeShape === 'circle' ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setNodeShape('circle')}
                        title="Circle"
                        className="h-7 w-7 sm:h-8 sm:w-8"
                    >
                        <Circle className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={nodeShape === 'square' ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setNodeShape('square')}
                        title="Square"
                        className="h-7 w-7 sm:h-8 sm:w-8"
                    >
                        <Square className="h-4 w-4"/>
                    </Button>
                </div>
                <div className="flex items-center gap-1">
                    <Label htmlFor="bord</selecter-width" className="text-xs sm:text-sm">Border Width:</Label>
                    <Slider
                        id="border-width"
                        min={1}
                        max={5}
                        step={1}
                        value={[borderWidth]}
                        onValueChange={(value) => setBorderWidth(value[0])}
                        className="w-16 sm:w-20"
                    />
                    <span className="text-xs sm:text-sm">{borderWidth}px</span>
                </div>
                <div className="flex items-center gap-1">
                    <Label htmlFor="font-size" className="text-xs sm:text-sm">Font Size:</Label>
                    <Slider
                        id="font-size"
                        min={10}
                        max={24}
                        step={1}
                        value={[fontSize]}
                        onValueChange={(value) => setFontSize(value[0])}
                        className="w-16 sm:w-20"
                    />
                    <span className="text-xs sm:text-sm">{fontSize}px</span>
                </div>
                <Button onClick={applyStylesToSelectedNodes} className="text-xs sm:text-sm">Apply Styles</Button>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="text-xs sm:text-sm">
                            <Palette className="h-4 w-4 mr-2" />Map Style
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Select Map Style</DialogTitle>
                            <DialogDescription>
                                Choose a style for your mind map.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="map-style" className="text-right">
                                    Style
                                </Label>
                                <Select onValueChange={handleMapStyleChange} value={mapStyle}>
                                    <SelectTrigger id="map-style" className="w-full">
                                        <SelectValue placeholder="Select a style" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="modern">Modern</SelectItem>
                                        <SelectItem value="classic">Classic</SelectItem>
                                        <SelectItem value="dark">Dark</SelectItem>
                                        <SelectItem value="handDrawn">Hand Drawn</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="text-xs sm:text-sm">
                            <Palette className="h-4 w-4 mr-2" />Theme
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Select Theme</DialogTitle>
                            <DialogDescription>
                                Choose a theme for the application.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="theme" className="text-right">
                                    Theme
                                </Label>
                                <Select onValueChange={handleThemeChange} defaultValue="system">
                                    <SelectTrigger id="theme" className="w-full">
                                        <SelectValue placeholder="Select a theme" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="light">Light</SelectItem>
                                        <SelectItem value="dark">Dark</SelectItem>
                                        <SelectItem value="system">System</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
