import React, { useState, useRef, useCallback } from 'react';
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { Image as ImageIcon, Type, Square, Circle, ArrowRight, RotateCw, Trash2, X } from 'lucide-react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { getStroke } from 'perfect-freehand';
import rough from 'roughjs';
import type { Shape } from '../types';

interface ImageEditorProps {
  shapes: Shape[];
  onShapesChange: (shapes: Shape[]) => void;
  onImageChange: (image: string) => void;
}

const roughGenerator = rough.generator();

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
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0) rotate(${shape.rotation}deg) scale(${shape.scale})`,
  } : {
    transform: `rotate(${shape.rotation}deg) scale(${shape.scale})`,
  };

  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const element = e.currentTarget.parentElement;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const angle = Math.atan2(
        moveEvent.clientY - centerY,
        moveEvent.clientX - centerX
      ) * (180 / Math.PI);
      onUpdate(shape.id, { rotation: angle });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleResize = (e: React.MouseEvent, corner: string) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = shape.width;
    const startHeight = shape.height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      let newWidth = startWidth;
      let newHeight = startHeight;
      
      switch (corner) {
        case 'se':
          newWidth = Math.max(20, startWidth + deltaX);
          newHeight = Math.max(20, startHeight + deltaY);
          break;
        case 'sw':
          newWidth = Math.max(20, startWidth - deltaX);
          newHeight = Math.max(20, startHeight + deltaY);
          onUpdate(shape.id, { x: shape.x + startWidth - newWidth });
          break;
        case 'ne':
          newWidth = Math.max(20, startWidth + deltaX);
          newHeight = Math.max(20, startHeight - deltaY);
          onUpdate(shape.id, { y: shape.y + startHeight - newHeight });
          break;
        case 'nw':
          newWidth = Math.max(20, startWidth - deltaX);
          newHeight = Math.max(20, startHeight - deltaY);
          onUpdate(shape.id, { 
            x: shape.x + startWidth - newWidth,
            y: shape.y + startHeight - newHeight
          });
          break;
      }

      onUpdate(shape.id, { width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const renderShape = () => {
    switch (shape.type) {
      case 'text':
        return (
          <div 
            className="w-full h-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <textarea
              value={shape.text || ''}
              onChange={(e) => onUpdate(shape.id, { text: e.target.value })}
              className="w-full h-full p-2 bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 border rounded"
              style={{ 
                color: shape.color,
                fontSize: `${shape.fontSize || 14}px`,
                lineHeight: '1.5',
                fontFamily: 'Arial, sans-serif',
              }}
            />
          </div>
        );
      case 'rectangle':
        return (
          <div
            className="w-full h-full"
            style={{
              border: `2px ${shape.isDashed ? 'dashed' : 'solid'} ${shape.color}`,
              backgroundColor: shape.fill ? shape.color + '40' : 'transparent',
            }}
          />
        );
      case 'circle':
        return (
          <div
            className="w-full h-full rounded-full"
            style={{
              border: `2px ${shape.isDashed ? 'dashed' : 'solid'} ${shape.color}`,
              backgroundColor: shape.fill ? shape.color + '40' : 'transparent',
            }}
          />
        );
      case 'arrow':
        return (
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <defs>
              <marker
                id={`arrowhead-${shape.id}`}
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill={shape.color}
                />
              </marker>
            </defs>
            <line
              x1="10"
              y1="50"
              x2="90"
              y2="50"
              stroke={shape.color}
              strokeWidth="2"
              strokeDasharray={shape.isDashed ? '5,5' : 'none'}
              markerEnd={`url(#arrowhead-${shape.id})`}
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`absolute ${selected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        left: shape.x,
        top: shape.y,
        width: shape.width,
        height: shape.height,
        transformOrigin: 'center center',
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
      {renderShape()}

      {selected && (
        <>
          {/* Rotation handle */}
          <div
            className="absolute w-6 h-6 bg-white border-2 border-blue-500 rounded-full cursor-pointer -top-8 left-1/2 transform -translate-x-1/2 flex items-center justify-center"
            onMouseDown={handleRotate}
          >
            <RotateCw className="w-4 h-4 text-blue-500" />
          </div>

          {/* Resize handles */}
          <div
            className="absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-sm cursor-nw-resize -top-1.5 -left-1.5"
            onMouseDown={(e) => handleResize(e, 'nw')}
          />
          <div
            className="absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-sm cursor-ne-resize -top-1.5 -right-1.5"
            onMouseDown={(e) => handleResize(e, 'ne')}
          />
          <div
            className="absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-sm cursor-sw-resize -bottom-1.5 -left-1.5"
            onMouseDown={(e) => handleResize(e, 'sw')}
          />
          <div
            className="absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-sm cursor-se-resize -bottom-1.5 -right-1.5"
            onMouseDown={(e) => handleResize(e, 'se')}
          />

          {/* Controls */}
          <div className="absolute -right-40 top-0 bg-white shadow-lg rounded-lg p-4 flex flex-col gap-3 min-w-[160px]">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Cor:</span>
              <input
                type="color"
                value={shape.color}
                onChange={(e) => onUpdate(shape.id, { color: e.target.value })}
                className="w-8 h-8 cursor-pointer rounded"
              />
            </div>

            {shape.type === 'text' && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Tamanho:</span>
                  <input
                    type="number"
                    value={shape.fontSize || 14}
                    onChange={(e) => onUpdate(shape.id, { fontSize: Number(e.target.value) })}
                    className="w-20 px-2 py-1 border rounded text-sm"
                    min="8"
                    max="72"
                  />
                </div>
              </>
            )}

            {shape.type !== 'text' && (
              <>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={shape.isDashed}
                    onChange={(e) => onUpdate(shape.id, { isDashed: e.target.checked })}
                    className="rounded text-blue-500"
                  />
                  <span className="text-sm text-gray-600">Tracejado</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={shape.fill}
                    onChange={(e) => onUpdate(shape.id, { fill: e.target.checked })}
                    className="rounded text-blue-500"
                  />
                  <span className="text-sm text-gray-600">Preenchimento</span>
                </label>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ImageEditor({ shapes, onShapesChange, onImageChange }: ImageEditorProps) {
  const [selectedShape, setSelectedShape] = useState<Shape | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [imageRotation, setImageRotation] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropperRef = useRef<any>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorDimensions, setEditorDimensions] = useState({ width: 0, height: 0 });
  
  const { setNodeRef } = useDroppable({ id: 'canvas' });

  // Update editor dimensions on mount and window resize
  React.useEffect(() => {
    const updateDimensions = () => {
      if (editorRef.current) {
        const containerWidth = editorRef.current.offsetWidth;
        const containerHeight = Math.min(window.innerHeight * 0.7, containerWidth * 0.75);
        setEditorDimensions({ width: containerWidth, height: containerHeight });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

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
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = () => {
    if (cropperRef.current) {
      const croppedCanvas = cropperRef.current.cropper.getCroppedCanvas();
      const croppedImage = croppedCanvas.toDataURL();
      setBackgroundImage(croppedImage);
      onImageChange(croppedImage);
      setShowCropper(false);
    }
  };

  const handleImageRotate = () => {
    setImageRotation((prev) => (prev + 90) % 360);
  };

  const handleRemoveImage = () => {
    setBackgroundImage(null);
    onImageChange('');
    setImageRotation(0);
  };

  const addShape = (type: string) => {
    const newShape: Shape = {
      id: crypto.randomUUID(),
      type,
      x: editorDimensions.width / 4,
      y: editorDimensions.height / 4,
      width: type === 'text' ? 200 : 100,
      height: type === 'text' ? 100 : 100,
      color: '#000000',
      text: type === 'text' ? 'Digite seu texto aqui' : '',
      fontSize: 16,
      rotation: 0,
      scale: 1,
      isDashed: false,
      fill: false,
    };
    onShapesChange([...shapes, newShape]);
    setSelectedShape(newShape);
  };

  const deleteSelectedShape = () => {
    if (selectedShape) {
      onShapesChange(shapes.filter(shape => shape.id !== selectedShape.id));
      setSelectedShape(null);
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Delete' && selectedShape) {
      deleteSelectedShape();
    }
  }, [selectedShape]);

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="bg-white shadow-lg rounded-lg p-6" ref={editorRef}>
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg flex items-center gap-2 transition-colors"
          >
            <ImageIcon className="w-5 h-5" />
            <span>Imagem</span>
          </button>
          <button
            onClick={() => addShape('text')}
            className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Type className="w-5 h-5" />
            <span>Texto</span>
          </button>
          <button
            onClick={() => addShape('rectangle')}
            className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Square className="w-5 h-5" />
            <span>Retângulo</span>
          </button>
          <button
            onClick={() => addShape('circle')}
            className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Circle className="w-5 h-5" />
            <span>Círculo</span>
          </button>
          <button
            onClick={() => addShape('arrow')}
            className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg flex items-center gap-2 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            <span>Seta</span>
          </button>
        </div>

        {selectedShape && (
          <button
            onClick={deleteSelectedShape}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center gap-2 transition-colors ml-auto"
          >
            <Trash2 className="w-5 h-5" />
            <span>Excluir</span>
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {showCropper && backgroundImage ? (
        <div className="relative">
          <Cropper
            ref={cropperRef}
            src={backgroundImage}
            style={{ height: editorDimensions.height, width: '100%' }}
            guides={true}
            viewMode={1}
            dragMode="move"
            autoCropArea={1}
            cropBoxMovable={true}
            cropBoxResizable={true}
            toggleDragModeOnDblclick={false}
          />
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setShowCropper(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={handleCropComplete}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
            >
              Concluir Recorte
            </button>
          </div>
        </div>
      ) : (
        <DndContext
          modifiers={[restrictToParentElement]}
          onDragEnd={handleDragEnd}
        >
          <div
            ref={setNodeRef}
            className="relative mx-auto border border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50"
            style={{
              width: editorDimensions.width,
              height: editorDimensions.height,
            }}
            onClick={() => setSelectedShape(null)}
          >
            {backgroundImage && (
              <div className="absolute inset-0">
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    transform: `rotate(${imageRotation}deg)`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.2s ease-in-out',
                  }}
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={handleImageRotate}
                    className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50"
                    title="Rotacionar"
                  >
                    <RotateCw className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleRemoveImage}
                    className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 text-red-500"
                    title="Remover imagem"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

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
      )}
    </div>
  );
}

export default ImageEditor;