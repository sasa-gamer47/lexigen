// app/(root)/mindmaps/create/mindmapUtils.test.ts
import { describe, expect, test } from 'vitest'; // Or Jest equivalent
import { createReactFlowElements } from './mindmapUtils';

// Mock themes to match the structure in mindmapUtils.ts for assertions
// Note: The actual themes object is in mindmapUtils.ts. 
// For robust tests, ideally, this mock would be derived or imported if possible,
// or tests should be written to be less dependent on exact theme values if those change often.
// For now, we define a subset relevant for testing style application.
const mockThemesForTest = {
    default: { 
        nodeBackgroundColor: '#F5F5F5', 
        nodeColor: '#333333', 
        nodeBorderColor: '#CCCCCC', 
        nodeBorderRadius: '5px', 
        nodePadding: '10px 15px', 
        edgeStrokeColor: '#888888', 
        edgeStrokeWidth: 2, 
        fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif'
    },
    tech: { 
        nodeBackgroundColor: '#222222', 
        nodeColor: '#00FF00', 
        nodeBorderColor: '#00FF00', 
        nodeBorderRadius: '4px', 
        nodePadding: '10px 15px', 
        edgeStrokeColor: '#00CCFF', 
        edgeStrokeWidth: 2.5, // As per refined themes
        fontFamily: '"Courier New", Courier, monospace'
    },
};

describe('createReactFlowElements', () => {
  const sampleMindMapData = {
    id: 'root',
    name: 'Main Topic',
    children: [
      {
        id: 'child1',
        name: 'Sub-topic 1',
        children: [{ id: 'grandchild1', name: 'Detail A', children: [] }],
      },
      { id: 'child2', name: 'Sub-topic 2', children: [] },
    ],
  };

  test('should correctly convert basic structure with default theme', () => {
    const { nodes, edges } = createReactFlowElements(sampleMindMapData, 'default');
    expect(nodes).toHaveLength(4);
    expect(edges).toHaveLength(3);
    
    const rootNode = nodes.find(n => n.id === 'root');
    expect(rootNode).toBeDefined();
    expect(rootNode?.data.label).toBe('Main Topic');
    // Check style application based on the mock. This assumes the 'default' theme in mindmapUtils.ts matches this part of the mock.
    expect(rootNode?.style?.backgroundColor).toBe(mockThemesForTest.default.nodeBackgroundColor);
    
    const edge1 = edges.find(e => e.id === 'e-root-child1');
    expect(edge1).toBeDefined();
    expect(edge1?.style?.stroke).toBe(mockThemesForTest.default.edgeStrokeColor);
  });

  test('should apply styles for the "tech" theme', () => {
    const { nodes } = createReactFlowElements(sampleMindMapData, 'tech');
    const rootNode = nodes.find(n => n.id === 'root');
    expect(rootNode).toBeDefined();
    // Check style application based on the mock.
    expect(rootNode?.style?.backgroundColor).toBe(mockThemesForTest.tech.nodeBackgroundColor);
    expect(rootNode?.style?.color).toBe(mockThemesForTest.tech.nodeColor);
    expect(rootNode?.style?.fontFamily).toBe(mockThemesForTest.tech.fontFamily);
  });

  test('should handle empty children array (single root node)', () => {
    const simpleMap = { id: 'root', name: 'Only Root', children: [] };
    const { nodes, edges } = createReactFlowElements(simpleMap, 'default');
    expect(nodes).toHaveLength(1);
    expect(edges).toHaveLength(0);
    expect(nodes[0].data.label).toBe('Only Root');
  });
  
  test('should use default theme for unknown theme name', () => {
    const { nodes } = createReactFlowElements(sampleMindMapData, 'nonexistenttheme');
    const rootNode = nodes.find(n => n.id === 'root');
    expect(rootNode).toBeDefined();
    expect(rootNode?.style?.backgroundColor).toBe(mockThemesForTest.default.nodeBackgroundColor);
  });

  test('should return empty arrays for null input', () => {
    const { nodes, edges } = createReactFlowElements(null, 'default');
    expect(nodes).toHaveLength(0);
    expect(edges).toHaveLength(0);
  });

  test('should return empty arrays for input without id', () => {
    // Simulating data that might come from an incomplete fetch or error
    const malformedData = { name: 'No ID Node', children: [] } as any; 
    const { nodes, edges } = createReactFlowElements(malformedData, 'default');
    expect(nodes).toHaveLength(0);
    expect(edges).toHaveLength(0);
  });

  test('should correctly assign source and target for edges', () => {
    const { edges } = createReactFlowElements(sampleMindMapData, 'default');
    const edgeToChild1 = edges.find(e => e.id === 'e-root-child1');
    expect(edgeToChild1?.source).toBe('root');
    expect(edgeToChild1?.target).toBe('child1');

    const edgeToGrandchild1 = edges.find(e => e.id === 'e-child1-grandchild1');
    expect(edgeToGrandchild1?.source).toBe('child1');
    expect(edgeToGrandchild1?.target).toBe('grandchild1');
  });

  test('nodes should have basic properties like id, data.label, and position', () => {
    const { nodes } = createReactFlowElements(sampleMindMapData, 'default');
    nodes.forEach(node => {
      expect(node.id).toBeDefined();
      expect(node.data.label).toBeDefined();
      expect(node.position).toEqual({ x: expect.any(Number), y: expect.any(Number) }); // Position check might be basic as layouting will adjust it
    });
  });

});
