import React, { useState, useRef } from 'react';
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { Image as ImageIcon, Plus, X } from 'lucide-react';
import type { Shape } from '../types';

interface ImageEditorProps {
  shapes: Shape[];
  onShapesChange: (shapes: Shape[]) => void;
  onImageChange: (image: string) => void;
}

interface DraggableShapeProps {
  shape: Shape;
  onUpdate: (id: string, updates: Partial<Shape>) => void;
}

const SHAPE_TYPES = [
  { type: 'circle', path: 'M 25 50 C 25 38.954 33.954 30 45 30 C 56.046 30 65 38.954 65 50 C 65 61.046 56.046 70 45 70 C 33.954 70 25 61.046 25 50' },
  { type: 'dotted-circle', path: 'M 25 50 C 25 38.954 33.954 30 45 30 C 56.046 30 65 38.954 65 50 C 65 61.046 56.046 70 45 70 C 33.954 70 25 61.046 25 50', isDashed: true },
  { type: 'horizontal-line', path: 'M 20 50 L 80 50' },
  { type: 'vertical-line', path: 'M 50 20 L 50 80' },
  { type: 'dotted-line', path: 'M 20 50 L 80 50', isDashed: true },
  { type: 'arrow-right', path: 'M 20 50 L 70 50 M 60 40 L 70 50 L 60 60' },
  { type: 'arrow-left', path: 'M 80 50 L 30 50 M 40 40 L 30 50 L 40 60' },
  { type: 'curved-arrow', path: 'M 30 70 C 40 70 60 30 70 30 M 60 20 L 70 30 L 80 20' },
  { type: 'dimension-line', path: 'M 20 40 L 80 40 M 20 35 L 20 45 M 80 35 L 80 45' },
  { type: 'triangle', path: 'M 50 20 L 80 70 L 20 70 Z' },
  { type: 'rectangle', path: 'M 20 30 L 80 30 L 80 70 L 20 70 Z' },
];

function DraggableShape({ shape, onUpdate }: DraggableShapeProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: shape.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      className="absolute cursor-move"
      style={{
        left: shape.x,
        top: shape.y,
        ...style,
      }}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
    >
      <svg
        width={shape.width}
        height={shape.height}
        viewBox="0 0 100 100"
        className="pointer-events-none"
      >
        <path
          d={shape.path}
          fill="none"
          stroke={shape.color}
          strokeWidth="2"
          strokeDasharray={shape.isDashed ? '5,5' : 'none'}
        />
        {shape.text && (
          <text
            x="50"
            y="50"
            textAnchor="middle"
            dominantBaseline="middle"
            fill={shape.textColor}
            fontSize="14"
          >
            {shape.text}
          </text>
        )}
      </svg>
    </div>
  );
}

function ImageEditor({ shapes, onShapesChange, onImageChange }: ImageEditorProps) {
  const [selectedShape, setSelectedShape] = useState<Shape | null>(null);
  const [showShapeMenu, setShowShapeMenu] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { setNodeRef } = useDroppable({
    id: 'canvas',
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    
    onShapesChange(
      shapes.map((shape) =>
        shape.id === active.id
          ? {
              ...shape,
              x: shape.x + delta.x,
              y: shape.y + delta.y,
            }
          : shape
      )
    );
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setBackgroundImage(imageUrl);
        onImageChange(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddShape = (type: string, path: string, isDashed = false) => {
    const newShape: Shape = {
      id: crypto.randomUUID(),
      type,
      path,
      isDashed,
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      color: '#000000',
      text: '',
      textColor: '#000000',
    };

    onShapesChange([...shapes, newShape]);
    setShowShapeMenu(false);
  };

  const handleShapeUpdate = (id: string, updates: Partial<Shape>) => {
    onShapesChange(
      shapes.map((shape) =>
        shape.id === id ? { ...shape, ...updates } : shape
      )
    );
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Editor de Imagem</h2>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setShowShapeMenu(!showShapeMenu)}
            className="p-2 text-gray-700 hover:bg-gray-100 rounded-md"
            title="Adicionar Forma"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-700 hover:bg-gray-100 rounded-md"
            title="Adicionar Imagem"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showShapeMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Inserir uma forma</h3>
              <button
                onClick={() => setShowShapeMenu(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-5 gap-4">
              {SHAPE_TYPES.map((shapeType) => (
                <button
                  key={shapeType.type}
                  onClick={() => handleAddShape(shapeType.type, shapeType.path, shapeType.isDashed)}
                  className="p-4 border rounded-lg hover:bg-gray-50"
                >
                  <svg width="40" height="40" viewBox="0 0 100 100" className="mx-auto">
                    <path
                      d={shapeType.path}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray={shapeType.isDashed ? '5,5' : 'none'}
                    />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      <DndContext
        modifiers={[restrictToParentElement]}
        onDragEnd={handleDragEnd}
      >
        <div
          ref={setNodeRef}
          className="relative w-full h-[600px] border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
          style={backgroundImage ? {
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          } : undefined}
        >
          {shapes.map((shape) => (
            <DraggableShape
              key={shape.id}
              shape={shape}
              onUpdate={handleShapeUpdate}
            />
          ))}
        </div>
      </DndContext>

      {selectedShape && (
        <div className="mt-4 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Propriedades da Forma
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Cor
              </label>
              <input
                type="color"
                value={selectedShape.color}
                onChange={(e) =>
                  handleShapeUpdate(selectedShape.id, { color: e.target.value })
                }
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Texto
              </label>
              <input
                type="text"
                value={selectedShape.text}
                onChange={(e) =>
                  handleShapeUpdate(selectedShape.id, { text: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Cor do Texto
              </label>
              <input
                type="color"
                value={selectedShape.textColor}
                onChange={(e) =>
                  handleShapeUpdate(selectedShape.id, { textColor: e.target.value })
                }
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageEditor;