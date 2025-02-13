"use client"

// components/MindMap/EditableNode.tsx
import React, { useState, useRef, useCallback, CSSProperties } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Edit3 } from 'lucide-react';

export function EditableNode({ id, data, isConnectable }: NodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const inputRef = useRef<HTMLInputElement>(null);

  const getNodeStyle = (): CSSProperties => {
    const baseStyle: CSSProperties = {
      backgroundColor: data.style?.backgroundColor || '#ffffff',
      borderColor: data.style?.borderColor || '#000000',
      color: data.style?.textColor || '#000000',
      borderWidth: `${data.style?.borderWidth || 1}px`,
      borderStyle: 'solid',
      borderRadius: `${data.style?.borderRadius || 8}px`,
    };

    // Add shape-specific styles
    switch (data.style?.shape) {
      case 'circle':
        return {
          ...baseStyle,
          borderRadius: '50%',
          width: '100px',
          height: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        };
      case 'hexagon':
        return {
          ...baseStyle,
          clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
          width: '120px',
          height: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        };
      case 'diamond':
        return {
          ...baseStyle,
          transform: 'rotate(45deg)',
          width: '100px',
          height: '100px',
        };
      default:
        return baseStyle;
    }
  };

  const startEditing = useCallback(() => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, []);

  const stopEditing = useCallback(() => {
    setIsEditing(false);
    if (data.onLabelChange) {
      data.onLabelChange(id, label);
    }
  }, [id, label, data]);

  const style = getNodeStyle();

  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
      />
      <div className="node-content px-4 py-2" style={style}>
        {isEditing ? (
          <input
            ref={inputRef}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={stopEditing}
            onKeyPress={(e) => e.key === 'Enter' && stopEditing()}
            className="w-full p-1 border rounded bg-white"
            autoFocus
          />
        ) : (
          <div className="flex items-center justify-between gap-2">
            <span>{label}</span>
            <Edit3 
              className="w-4 h-4 cursor-pointer hover:text-blue-500" 
              onClick={startEditing} 
            />
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
      />
    </div>
  );
}