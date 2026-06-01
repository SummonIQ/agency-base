'use client';

import React, { useState, useRef, useCallback } from 'react';
import { GlassLayer } from '@/components/ui/glass-header';

interface Position {
  x: number;
  y: number;
}

interface DraggableBoxProps {
  id: number;
  initialPosition: Position;
  color: string;
  darkLevel: 'light' | 'medium' | 'dark';
}

function DraggableBox({ id, initialPosition, color, darkLevel }: DraggableBoxProps) {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; offsetX: number; offsetY: number }>({
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
  });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - position.x,
      offsetY: e.clientY - position.y,
    };
    e.preventDefault();
  }, [position.x, position.y]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newX = e.clientX - dragRef.current.offsetX;
      const newY = e.clientY - dragRef.current.offsetY;
      
      setPosition({ x: newX, y: newY });
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <GlassLayer
      className={`absolute select-none transition-shadow duration-200 ${
        isDragging ? 'shadow-2xl cursor-grabbing' : 'hover:shadow-lg cursor-pointer hover:cursor-grab'
      }`}
      style={{
        left: position.x,
        top: position.y,
        width: '200px',
        height: '150px',
      }}
      blur={isDragging ? 24 : 16}
      brightness={isDragging ? 120 : 110}
      darkLevel={darkLevel}
    >
      <div
        className="w-full h-full p-4 flex flex-col justify-between"
        onMouseDown={handleMouseDown}
      >
        <div className="text-white font-semibold">Glass Box {id}</div>
        <div className="text-white/70 text-sm">
          Drag me around to see the glass blur effect!
        </div>
        <div className="text-white/50 text-xs">
          x: {Math.round(position.x)}, y: {Math.round(position.y)}
        </div>
      </div>
    </GlassLayer>
  );
}

export default function TestGlassEffectPage() {
  const boxes = [
    { id: 1, position: { x: 100, y: 200 }, color: '#3b82f6', darkLevel: 'light' as const },
    { id: 2, position: { x: 400, y: 300 }, color: '#10b981', darkLevel: 'dark' as const },
    { id: 3, position: { x: 700, y: 250 }, color: '#f59e0b', darkLevel: 'medium' as const },
    { id: 4, position: { x: 300, y: 500 }, color: '#ef4444', darkLevel: 'light' as const },
    { id: 5, position: { x: 600, y: 450 }, color: '#8b5cf6', darkLevel: 'dark' as const },
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      {/* Colorful background shapes */}
      <div className="absolute inset-0">
        {/* Large circles */}
        <div 
          className="absolute rounded-full opacity-60"
          style={{
            width: '300px',
            height: '300px',
            background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
            left: '10%',
            top: '20%',
            filter: 'blur(1px)',
          }}
        />
        <div 
          className="absolute rounded-full opacity-50"
          style={{
            width: '250px',
            height: '250px',
            background: 'linear-gradient(45deg, #4ecdc4, #45b7aa)',
            right: '15%',
            top: '10%',
            filter: 'blur(1px)',
          }}
        />
        <div 
          className="absolute rounded-full opacity-70"
          style={{
            width: '200px',
            height: '200px',
            background: 'linear-gradient(45deg, #ffe66d, #ffcc02)',
            left: '60%',
            bottom: '20%',
            filter: 'blur(1px)',
          }}
        />
        
        {/* Rectangles */}
        <div 
          className="absolute opacity-40 rotate-12"
          style={{
            width: '400px',
            height: '100px',
            background: 'linear-gradient(135deg, #a8e6cf, #dcedc4)',
            left: '20%',
            bottom: '30%',
            borderRadius: '20px',
          }}
        />
        <div 
          className="absolute opacity-50 -rotate-12"
          style={{
            width: '150px',
            height: '300px',
            background: 'linear-gradient(135deg, #ffd3a5, #fd9853)',
            right: '5%',
            bottom: '10%',
            borderRadius: '20px',
          }}
        />
        
        {/* Smaller accent shapes */}
        <div 
          className="absolute rounded-full opacity-80"
          style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(45deg, #ff9a9e, #fecfef)',
            left: '5%',
            bottom: '10%',
          }}
        />
        <div 
          className="absolute rounded-full opacity-60"
          style={{
            width: '120px',
            height: '120px',
            background: 'linear-gradient(45deg, #a18cd1, #fbc2eb)',
            right: '30%',
            top: '40%',
          }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 p-8">
        <h1 className="text-4xl font-bold text-white mb-4">Glass Effect Test</h1>
        <p className="text-white/70 text-lg max-w-2xl">
          Drag the glass boxes around to see Josh Comeau's backdrop-filter effect in action. 
          Notice how the glass blur and edge glow effect responds to the colorful shapes behind it.
        </p>
      </div>

      {/* Draggable glass boxes */}
      {boxes.map((box) => (
        <DraggableBox
          key={box.id}
          id={box.id}
          initialPosition={box.position}
          color={box.color}
          darkLevel={box.darkLevel}
        />
      ))}

      {/* Instructions */}
      <div className="absolute bottom-8 left-8 right-8 z-20">
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 text-white/80">
          <p className="text-sm">
            💡 <strong>Instructions:</strong> Click and drag any glass box to move it around. 
            Watch how the glass morphism effect blurs and interacts with the colorful background shapes!
          </p>
        </div>
      </div>
    </div>
  );
}