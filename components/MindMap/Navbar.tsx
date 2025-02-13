// components/MindMap/Navbar.tsx
import React from 'react';
import { 
  Edit3, 
  Link, 
  Move, 
  Plus, 
  Trash2, 
  Download,
  Link2Off
} from 'lucide-react';

interface NavbarProps {
  mode: 'edit' | 'connect' | 'drag';
  setMode: (mode: 'edit' | 'connect' | 'drag') => void;
  autoConnect: boolean;
  setAutoConnect: (auto: boolean) => void;
  nodeStyle: {
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    borderWidth: number;
    borderRadius: number;
  };
  setNodeStyle: any; //(style: NavbarProps['nodeStyle']) => void;
  onAddNode: () => void;
  onDeleteNode: () => void;
  onExport: () => void;
  hasSelectedNode: boolean;
}

export function Navbar({
  mode,
  setMode,
  autoConnect,
  setAutoConnect,
  nodeStyle,
  setNodeStyle,
  onAddNode,
  onDeleteNode,
  onExport,
  hasSelectedNode,
}: NavbarProps) {
  return (
    <div className="h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {/* Mode Selection */}
        <div className="flex items-center space-x-2 border-r pr-4">
          <button
            onClick={() => setMode('edit')}
            className={`p-2 rounded ${
              mode === 'edit' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
            }`}
            title="Edit Mode"
          >
            <Edit3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMode('connect')}
            className={`p-2 rounded ${
              mode === 'connect' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
            }`}
            title="Connect Mode"
          >
            <Link className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMode('drag')}
            className={`p-2 rounded ${
              mode === 'drag' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
            }`}
            title="Drag Mode"
          >
            <Move className="w-5 h-5" />
          </button>
        </div>

        {/* Node Actions */}
        <div className="flex items-center space-x-2 border-r pr-4">
          <button
            onClick={onAddNode}
            className="p-2 rounded hover:bg-gray-100"
            title="Add Node"
            disabled={!hasSelectedNode}
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={onDeleteNode}
            className="p-2 rounded hover:bg-gray-100 text-red-500"
            title="Delete Node"
            disabled={!hasSelectedNode}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Auto-connect Toggle */}
        <button
          onClick={() => setAutoConnect(!autoConnect)}
          className={`p-2 rounded ${
            autoConnect ? 'bg-green-100 text-green-600' : 'bg-gray-100'
          }`}
          title="Toggle Auto-connect"
        >
          {autoConnect ? <Link className="w-5 h-5" /> : <Link2Off className="w-5 h-5" />}
        </button>
      </div>

      {/* Node Styling */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm">Background:</label>
          <input
            type="color"
            value={nodeStyle.backgroundColor}
            onChange={(e) =>
              setNodeStyle({ ...nodeStyle, backgroundColor: e.target.value })
            }
            className="w-8 h-8 rounded cursor-pointer"
          />
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm">Border:</label>
          <input
            type="color"
            value={nodeStyle.borderColor}
            onChange={(e) =>
              setNodeStyle({ ...nodeStyle, borderColor: e.target.value })
            }
            className="w-8 h-8 rounded cursor-pointer"
          />
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm">Text:</label>
          <input
            type="color"
            value={nodeStyle.textColor}
            onChange={(e) =>
              setNodeStyle({ ...nodeStyle, textColor: e.target.value })
            }
            className="w-8 h-8 rounded cursor-pointer"
          />
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm">Border Width:</label>
          <input
            type="number"
            min="1"
            max="10"
            value={nodeStyle.borderWidth}
            onChange={(e) =>
              setNodeStyle({ ...nodeStyle, borderWidth: parseInt(e.target.value) })
            }
            className="w-16 p-1 border rounded"
          />
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm">Border Radius:</label>
          <input
            type="number"
            min="0"
            max="20"
            value={nodeStyle.borderRadius}
            onChange={(e) =>
              setNodeStyle({ ...nodeStyle, borderRadius: parseInt(e.target.value) })
            }
            className="w-16 p-1 border rounded"
          />
        </div>

        {/* Export Button */}
        <button
          onClick={onExport}
          className="p-2 rounded hover:bg-gray-100 ml-4"
          title="Export Mind Map"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}