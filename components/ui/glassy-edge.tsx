'use client';

import { cn } from '@/lib/css';

interface GlassyEdgeProps {
  position?: 'top' | 'bottom' | 'left' | 'right';
  thickness?: number;
  className?: string;
  blur?: number;
  brightness?: number;
  opacity?: number;
}

export function GlassyEdge({
  position = 'bottom',
  thickness = 1,
  className,
  blur = 8,
  brightness = 120,
  opacity = 0.8,
}: GlassyEdgeProps) {
  const positionClasses = {
    top: 'top-0 left-0 right-0',
    bottom: 'bottom-0 left-0 right-0', 
    left: 'top-0 bottom-0 left-0',
    right: 'top-0 bottom-0 right-0',
  };

  const positionStyles = {
    top: {
      height: `${thickness}px`,
      maskImage: `linear-gradient(to bottom, black 0, black ${thickness}px, transparent ${thickness}px)`,
    },
    bottom: {
      height: `${thickness}px`,
      maskImage: `linear-gradient(to top, black 0, black ${thickness}px, transparent ${thickness}px)`,
    },
    left: {
      width: `${thickness}px`,
      maskImage: `linear-gradient(to right, black 0, black ${thickness}px, transparent ${thickness}px)`,
    },
    right: {
      width: `${thickness}px`,
      maskImage: `linear-gradient(to left, black 0, black ${thickness}px, transparent ${thickness}px)`,
    },
  };

  return (
    <div
      className={cn(
        'absolute pointer-events-none z-10',
        positionClasses[position],
        className
      )}
      style={{
        ...positionStyles[position],
        backdropFilter: `blur(${blur}px) brightness(${brightness}%)`,
        WebkitBackdropFilter: `blur(${blur}px) brightness(${brightness}%)`,
        opacity,
        background: `linear-gradient(
          ${position === 'top' || position === 'bottom' ? '180deg' : '90deg'}, 
          rgba(255, 255, 255, 0.1) 0%, 
          rgba(255, 255, 255, 0.05) 50%, 
          transparent 100%
        )`,
      }}
    />
  );
}

interface GlassyHeaderProps {
  children: React.ReactNode;
  className?: string;
  edgeThickness?: number;
  blur?: number;
  brightness?: number;
}

export function GlassyHeader({
  children,
  className,
}: Omit<GlassyHeaderProps, 'edgeThickness' | 'blur' | 'brightness'>) {
  return (
    <div className={cn('relative', className)}>
      {/* Main header content with subtle backdrop blur */}
      <div 
        className="relative z-20"
        style={{
          background: 'rgba(0, 0, 28, 0.3)',//          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px) saturate(180%) brightness(105%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%) brightness(105%)',
        }}
      >
        {children}
      </div>
      
      {/* Dynamic glow effect that responds to content below */}
      <div
        className="absolute -bottom-[32px] left-0 right-0 z-10 pointer-events-none h-[52px]"
        style={{
          backdropFilter: 'blur(24px) saturate(100%) brightness(140%)',
          WebkitBackdropFilter: 'blur(24px) saturate(200%) brightness(140%)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.3) 40%, rgba(0, 0, 0, 0.1) 80%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.3) 40%, rgba(0, 0, 0, 0.1) 80%, transparent 100%)',
        }}
      />
      
      {/* Top edge effect */}
      <div
        className="absolute -top-px left-0 right-0 z-30 pointer-events-none h-0.5 opacity-50"
        style={{
          backdropFilter: 'blur(12px) saturate(250%) brightness(180%) contrast(120%)',
          WebkitBackdropFilter: 'blur(12px) saturate(250%) brightness(180%) contrast(120%)',
          maskImage: 'linear-gradient(to top, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
          filter: 'blur(0.25px)',
        }}
      />
      
      {/* Bottom edge effect */}
      <div
        className="absolute -bottom-px left-0 right-0 z-30 pointer-events-none h-0.5"
        style={{
          backdropFilter: 'blur(12px) saturate(250%) brightness(180%) contrast(120%)',
          WebkitBackdropFilter: 'blur(12px) saturate(250%) brightness(180%) contrast(120%)',
          maskImage: 'linear-gradient(to bottom, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%)',
          filter: 'blur(0.25px)',
        }}
      />
    </div>
  );
}

interface GlassyContainerProps {
  children: React.ReactNode;
  className?: string;
  blur?: number;
  brightness?: number;
  opacity?: number;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  edgeThickness?: number;
}

export function GlassyContainer({
  children,
  className,
  blur = 16,
  brightness = 102,
  opacity = 1,
  edges = [],
  edgeThickness = 1,
}: GlassyContainerProps) {
  return (
    <div className={cn('relative group', className)}>
      {/* Main container with modern glass effect */}
      <div
        className="relative z-10 border border-border/10 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: `blur(${blur}px) saturate(150%) brightness(${brightness}%)`,
          WebkitBackdropFilter: `blur(${blur}px) saturate(150%) brightness(${brightness}%)`,
          opacity,
          boxShadow: `
            0 1px 3px rgba(0, 0, 0, 0.05),
            0 0 0 1px rgba(255, 255, 255, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          `,
        }}
      >
        {children}
      </div>
      
      {/* Glassy edges */}
      {edges.map((edge) => (
        <GlassyEdge
          key={edge}
          position={edge}
          thickness={edgeThickness}
          blur={blur * 0.6}
          brightness={brightness + 15}
          className="z-20 rounded-xl"
        />
      ))}
    </div>
  );
}