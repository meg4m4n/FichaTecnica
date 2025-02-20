import React, { useState, useRef } from 'react';
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { Image as ImageIcon, Type, Square, Circle, ArrowRight, MinusSquare, PlusSquare } from 'lucide-react';
import type { Shape } from '../types';

interface ImageEditorProps {
  shapes: Shape[];
  onShapesChange: (shapes: Shape[]) => void;
  onImageChange: (image: string) => void;
}

function DraggableShape({ shape, onUpdate, selected, onSelect }: {
  shape: Shape;
  onUpdate: (id: string, updates: Partial<Shape>) => void;
  selected: boolean;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: shape.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const handleScale = (increase: boolean) => {
    const scaleFactor = increase ? 1.2 : 0.8;
    onUpdate(shape.id, {
      width: shape.width * scaleFactor,
      height: shape.height * scaleFactor,
    });
  };

  return (
    <div
      className={`absolute ${selected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        left: shape.x,
        top: shape.y,
        width: shape.width,
        height: shape.height,
        cursor: 'move',
        ...style,
      }}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {shape.type === 'text' ? (
        <textarea
          value={shape.text || ''}
          onChange={(e) => onUpdate(shape.id, { text: e.target.value })}
          className="w-full h-full p-1 bg-transparent border-none resize-none focus:outline-none"
          style={{ 
            color: shape.color,
            fontSize: `${shape.fontSize || 14}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <svg width="100%" height="100%" viewBox="0 0 100 100">
          <path
            d={shape.path}
            fill="none"
            stroke={shape.color}
            strokeWidth="2"
            strokeDasharray={shape.isDashed ? '5,5' : 'none'}
          />
        </svg>
      )}

      {selected && (
        <div className="absolute -right-20 top-0 bg-white shadow-md rounded p-1 flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleScale(false)}
              className="p-1 hover:bg-gray-100 rounded"
              title="Diminuir"
            >
              <MinusSquare className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScale(true)}
              className="p-1 hover:bg-gray-100 rounded"
              title="Aumentar"
            >
              <PlusSquare className="w-4 h-4" />
            </button>
          </div>
          <input
            type="color"
            value={shape.color}
            onChange={(e) => onUpdate(shape.id, { color: e.target.value })}
            className="w-5 h-5 cursor-pointer"
            title="Cor"
          />
          {shape.type === 'text' && (
            <input
              type="number"
              value={shape.fontSize || 14}
              onChange={(e) => onUpdate(shape.id, { fontSize: Number(e.target.value) })}
              className="w-12 text-xs p-0.5"
              min="8"
              max="72"
              title="Tamanho da fonte"
            />
          )}
        </div>
      )}
    </div>
  );
}

function ImageEditor({ shapes, onShapesChange, onImageChange }: ImageEditorProps) {
  const [selectedShape, setSelectedShape] = useState<Shape | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { setNodeRef } = useDroppable({ id: 'canvas' });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    onShapesChange(
      shapes.map((shape) =>
        shape.id === active.id
          ? { ...shape, x: shape.x + delta.x, y: shape.y + delta.y }
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

  const addShape = (type: string) => {
    const newShape: Shape = {
      id: crypto.randomUUID(),
      type,
      path: type === 'rectangle' ? 'M 20 20 L 80 20 L 80 80 L 20 80 Z' :
            type === 'circle' ? 'M 50 20 A 30 30 0 1 0 50 80 A 30 30 0 1 0 50 20' :
            type === 'arrow' ? 'M 20 50 L 70 50 M 60 40 L 70 50 L 60 60' : '',
      x: 50,
      y: 50,
      width: 100,
      height: type === 'text' ? 40 : 100,
      color: '#000000',
      text: type === 'text' ? 'Texto' : '',
      fontSize: 14,
    };
    onShapesChange([...shapes, newShape]);
    setSelectedShape(newShape);
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-4">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-1.5 hover:bg-gray-100 rounded"
          title="Adicionar Imagem"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => addShape('text')}
          className="p-1.5 hover:bg-gray-100 rounded"
          title="Adicionar Texto"
        >
          <Type className="w-4 h-4" />
        </button>
        <button
          onClick={() => addShape('rectangle')}
          className="p-1.5 hover:bg-gray-100 rounded"
          title="Adicionar Retângulo"
        >
          <Square className="w-4 h-4" />
        </button>
        <button
          onClick={() => addShape('circle')}
          className="p-1.5 hover:bg-gray-100 rounded"
          title="Adicionar Círculo"
        >
          <Circle className="w-4 h-4" />
        </button>
        <button
          onClick={() => addShape('arrow')}
          className="p-1.5 hover:bg-gray-100 rounded"
          title="Adicionar Seta"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

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
          className="relative w-full h-[300px] border border-dashed border-gray-300 rounded-lg overflow-hidden"
          style={backgroundImage ? {
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          } : undefined}
          onClick={() => setSelectedShape(null)}
        >
          {shapes.map((shape) => (
            <DraggableShape
              key={shape.id}
              shape={shape}
              onUpdate={(id, updates) => {
                onShapesChange(
                  shapes.map((s) => s.id === id ? { ...s, ...updates } : s)
                );
              }}
              selected={selectedShape?.id === shape.id}
              onSelect={() => setSelectedShape(shape)}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}

export default ImageEditor;