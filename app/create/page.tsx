import React from 'react'
import { MindMapEditor } from '@/components/MindMap/MindMap'

const page = () => {
  return (
    <div className='mt-20'>
      <MindMapEditor initialNodes={
        {
          "nodes": [
            {
              "id": "root",
              "type": "editable",
              "position": { "x": 400, "y": 200 },
              "data": {
                "label": "Project Planning",
                "style": {
                  "backgroundColor": "#e3f2fd",
                  "borderColor": "#1e88e5",
                  "textColor": "#1565c0",
                  "borderWidth": 2,
                  "borderRadius": 8,
                  "shape": "rectangle"
                }
              }
            },
            {
              "id": "phase1",
              "type": "editable",
              "position": { "x": 200, "y": 100 },
              "data": {
                "label": "Research",
                "style": {
                  "backgroundColor": "#f3e5f5",
                  "borderColor": "#8e24aa",
                  "textColor": "#4a148c",
                  "borderWidth": 2,
                  "borderRadius": 12,
                  "shape": "circle"
                }
              }
            },
            {
              "id": "phase2",
              "type": "editable",
              "position": { "x": 600, "y": 100 },
              "data": {
                "label": "Design",
                "style": {
                  "backgroundColor": "#e8f5e9",
                  "borderColor": "#43a047",
                  "textColor": "#2e7d32",
                  "borderWidth": 2,
                  "borderRadius": 8,
                  "shape": "hexagon"
                }
              }
            },
            {
              "id": "phase3",
              "type": "editable",
              "position": { "x": 200, "y": 300 },
              "data": {
                "label": "Development",
                "style": {
                  "backgroundColor": "#fff3e0",
                  "borderColor": "#fb8c00",
                  "textColor": "#ef6c00",
                  "borderWidth": 2,
                  "borderRadius": 8,
                  "shape": "rectangle"
                }
              }
            },
            {
              "id": "phase4",
              "type": "editable",
              "position": { "x": 600, "y": 300 },
              "data": {
                "label": "Testing",
                "style": {
                  "backgroundColor": "#f3e5f5",
                  "borderColor": "#8e24aa",
                  "textColor": "#4a148c",
                  "borderWidth": 2,
                  "borderRadius": 8,
                  "shape": "diamond"
                }
              }
            },
            {
              "id": "task1",
              "type": "editable",
              "position": { "x": 100, "y": 50 },
              "data": {
                "label": "Market Analysis",
                "style": {
                  "backgroundColor": "#e1f5fe",
                  "borderColor": "#039be5",
                  "textColor": "#01579b",
                  "borderWidth": 1,
                  "borderRadius": 4,
                  "shape": "rectangle"
                }
              }
            },
            {
              "id": "task2",
              "type": "editable",
              "position": { "x": 700, "y": 50 },
              "data": {
                "label": "UI Mockups",
                "style": {
                  "backgroundColor": "#e8eaf6",
                  "borderColor": "#3949ab",
                  "textColor": "#283593",
                  "borderWidth": 1,
                  "borderRadius": 4,
                  "shape": "rectangle"
                }
              }
            },
            {
              "id": "task3",
              "type": "editable",
              "position": { "x": 100, "y": 400 },
              "data": {
                "label": "Frontend",
                "style": {
                  "backgroundColor": "#fce4ec",
                  "borderColor": "#d81b60",
                  "textColor": "#880e4f",
                  "borderWidth": 1,
                  "borderRadius": 4,
                  "shape": "rectangle"
                }
              }
            },
            {
              "id": "task4",
              "type": "editable",
              "position": { "x": 700, "y": 400 },
              "data": {
                "label": "QA Testing",
                "style": {
                  "backgroundColor": "#f1f8e9",
                  "borderColor": "#7cb342",
                  "textColor": "#33691e",
                  "borderWidth": 1,
                  "borderRadius": 4,
                  "shape": "rectangle"
                }
              }
            }
          ],
          "edges": [
            {
              "id": "e1-1",
              "source": "root",
              "target": "phase1",
              "type": "smoothstep"
            },
            {
              "id": "e1-2",
              "source": "root",
              "target": "phase2",
              "type": "smoothstep"
            },
            {
              "id": "e1-3",
              "source": "root",
              "target": "phase3",
              "type": "smoothstep"
            },
            {
              "id": "e1-4",
              "source": "root",
              "target": "phase4",
              "type": "smoothstep"
            },
            {
              "id": "e2-1",
              "source": "phase1",
              "target": "task1",
              "type": "smoothstep"
            },
            {
              "id": "e2-2",
              "source": "phase2",
              "target": "task2",
              "type": "smoothstep"
            },
            {
              "id": "e2-3",
              "source": "phase3",
              "target": "task3",
              "type": "smoothstep"
            },
            {
              "id": "e2-4",
              "source": "phase4",
              "target": "task4",
              "type": "smoothstep"
            }
          ]
        }
      } />
    </div>
  )
}

export default page






// "use client";

// import React, { useState } from 'react';
// import dynamic from 'next/dynamic';

// // Dynamically import your MindMapEditor (disable SSR)
// const MindMapEditor = dynamic(() =>
//   import('@/components/MindMap').then((mod) => mod.default), { ssr: false });

// // Sample JSON data 1 – a simple mind map with three nodes
// const sampleJson1 = `{
//   "nodes": [
//     {
//       "id": "1",
//       "type": "editable",
//       "data": { "label": "Central Topic" },
//       "position": { "x": 250, "y": 250 }
//     },
//     {
//       "id": "2",
//       "type": "editable",
//       "data": { "label": "Idea 1" },
//       "position": { "x": 100, "y": 100 }
//     },
//     {
//       "id": "3",
//       "type": "editable",
//       "data": { "label": "Idea 2" },
//       "position": { "x": 400, "y": 100 }
//     }
//   ],
//   "edges": [
//     { "id": "e1-2", "source": "1", "target": "2" },
//     { "id": "e1-3", "source": "1", "target": "3" }
//   ]
// }`;

// // Sample JSON data 2 – a project mind map with more nodes
// const sampleJson2 = `{
//   "nodes": [
//     {
//       "id": "1",
//       "type": "editable",
//       "data": { "label": "Project A" },
//       "position": { "x": 300, "y": 300 }
//     },
//     {
//       "id": "2",
//       "type": "editable",
//       "data": { "label": "Task 1" },
//       "position": { "x": 150, "y": 150 }
//     },
//     {
//       "id": "3",
//       "type": "editable",
//       "data": { "label": "Task 2" },
//       "position": { "x": 450, "y": 150 }
//     },
//     {
//       "id": "4",
//       "type": "editable",
//       "data": { "label": "Task 3" },
//       "position": { "x": 150, "y": 450 }
//     },
//     {
//       "id": "5",
//       "type": "editable",
//       "data": { "label": "Task 4" },
//       "position": { "x": 450, "y": 450 }
//     }
//   ],
//   "edges": [
//     { "id": "e1-2", "source": "1", "target": "2" },
//     { "id": "e1-3", "source": "1", "target": "3" },
//     { "id": "e1-4", "source": "1", "target": "4" },
//     { "id": "e1-5", "source": "1", "target": "5" }
//   ]
// }`;

// export default function MindMapPage() {
//   const [jsonInput, setJsonInput] = useState('');
//   const [initialData, setInitialData] = useState<any>(null);
//   const [error, setError] = useState<string | null>(null);

//   const loadJson = () => {
//     try {
//       const parsed = JSON.parse(jsonInput);
//       setInitialData(parsed);
//       setError(null);
//     } catch (err) {
//       setError('Invalid JSON');
//     }
//   };

//   const loadSample = (sample: string) => {
//     setJsonInput(sample);
//     setInitialData(null);
//     setError(null);
//   };

//   return (
//     <div style={{ padding: '20px' }}>
//       <h1>Mind Map JSON Input</h1>
//       <div style={{ marginBottom: '10px' }}>
//         <button onClick={() => loadSample(sampleJson1)} style={{ marginRight: '10px' }}>
//           Load Sample 1
//         </button>
//         <button onClick={() => loadSample(sampleJson2)}>Load Sample 2</button>
//       </div>
//       <textarea
//         rows={10}
//         cols={80}
//         value={jsonInput}
//         onChange={(e) => setJsonInput(e.target.value)}
//         placeholder="Paste your JSON here..."
//         style={{ width: '100%' }}
//       />
//       <br />
//       <button onClick={loadJson} style={{ marginTop: '10px' }}>
//         Load Mind Map
//       </button>
//       {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
//       {initialData && (
//         <div style={{ height: '80vh', marginTop: '20px' }}>
//           <MindMapEditor initialNodes={initialData} />
//         </div>
//       )}
//     </div>
//   );
// }
