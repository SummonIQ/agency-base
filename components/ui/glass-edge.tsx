'use client';

import React, { type ComponentProps, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/css';

export function GlassEdge({
  children,
  className,
  edge = 'bottom',
  observeElements = false,
  ...props
}: ComponentProps<'div'> & {
  children: React.ReactNode;
  className?: string;
  edge?: 'bottom' | 'top' | 'left' | 'right';
  observeElements?: boolean;
}) {
  const [glowIntensity, setGlowIntensity] = useState(0);
  const [nearestElementColor, setNearestElementColor] = useState('rgba(238, 174, 202, 0.15)');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!observeElements || typeof window === 'undefined') return;

    const updateGlow = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const elements = document.querySelectorAll('section, .card, [data-glow-target="true"]');
      
      let minDistance = Infinity;
      let nearestElement: Element | null = null;

      elements.forEach((element) => {
        const elementRect = element.getBoundingClientRect();
        
        // Calculate distance from header bottom to element top
        const distance = elementRect.top - rect.bottom;
        
        // Only consider elements below the header
        if (distance > 0 && distance < minDistance) {
          minDistance = distance;
          nearestElement = element;
        }
      });

      // Calculate glow intensity based on distance (0-100px range)
      const maxDistance = 100;
      const intensity = minDistance < maxDistance 
        ? 1 - (minDistance / maxDistance)
        : 0;

      setGlowIntensity(intensity);

      // Extract color from nearest element if it has a background
      if (nearestElement && intensity > 0) {
        const computedStyle = window.getComputedStyle(nearestElement);
        const bgColor = computedStyle.backgroundColor;
        
        // If element has a color, use it; otherwise use default
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
          // Convert to rgba with low opacity
          const match = bgColor.match(/\d+/g);
          if (match && match.length >= 3) {
            setNearestElementColor(`rgba(${match[0]}, ${match[1]}, ${match[2]}, 0.15)`);
          }
        }
      }
    };

    // Initial update
    updateGlow();

    // Update on scroll and resize
    const handleUpdate = () => requestAnimationFrame(updateGlow);
    window.addEventListener('scroll', handleUpdate, { passive: true });
    window.addEventListener('resize', handleUpdate);

    // Observe DOM changes
    const observer = new MutationObserver(handleUpdate);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('scroll', handleUpdate);
      window.removeEventListener('resize', handleUpdate);
      observer.disconnect();
    };
  }, [observeElements]);
  return (
    <div
      ref={containerRef}
      className={cn(
        "relative",
        className,
      )}
      {...props}
    >
      {children}
      
      {/* Edge glow effect - positioned based on edge */}
      {edge === 'bottom' && (
        <>
          {/* Bottom edge line - intensity changes based on proximity */}
          <div 
            className="glass-edge-glow pointer-events-none absolute right-0 -bottom-[1px] left-0 h-[1px] transition-all duration-300" 
            style={{
              background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,${0.1 + glowIntensity * 0.3}) 20%, rgba(255,255,255,${0.2 + glowIntensity * 0.4}) 50%, rgba(255,255,255,${0.1 + glowIntensity * 0.3}) 80%, transparent 100%)`,
              boxShadow: glowIntensity > 0 ? `0 0 ${10 + glowIntensity * 20}px ${nearestElementColor}` : 'none'
            }}
          />
          
          {/* Bottom glow - dynamic based on nearest element */}
          <div 
            className="pointer-events-none absolute -bottom-1 left-[10%] right-[10%] transition-all duration-300" 
            style={{
              height: `${30 + glowIntensity * 20}px`,
              background: `radial-gradient(ellipse at center bottom, ${nearestElementColor.replace('0.15', `${0.15 + glowIntensity * 0.25}`)}) 0%, transparent 70%)`,
              filter: `blur(${24 + glowIntensity * 8}px)`,
              opacity: 0.5 + glowIntensity * 0.5
            }}
          />
          
          {/* Additional shimmer effect - pulses with intensity */}
          <div 
            className="pointer-events-none absolute -bottom-[2px] left-0 right-0 transition-all duration-300"
            style={{
              height: `${2 + glowIntensity * 2}px`,
              background: `linear-gradient(90deg, transparent 0%, ${nearestElementColor.replace('0.15', `${0.4 + glowIntensity * 0.4}`)}) 50%, transparent 100%)`,
              filter: `blur(${1 + glowIntensity * 2}px)`,
              opacity: 0.6 + glowIntensity * 0.4
            }}
          />
          
          {/* Extra glow layer for intense proximity */}
          {glowIntensity > 0.5 && (
            <div 
              className="pointer-events-none absolute -bottom-2 left-0 right-0 transition-all duration-300"
              style={{
                height: '40px',
                background: `radial-gradient(ellipse at center bottom, ${nearestElementColor.replace('0.15', `${glowIntensity * 0.3}`)}) 0%, transparent 60%)`,
                filter: 'blur(30px)',
                opacity: glowIntensity - 0.5
              }}
            />
          )}
        </>
      )}
      
      {edge === 'top' && (
        <>
          {/* Top edge line */}
          <div 
            className="pointer-events-none absolute right-0 -top-[1px] left-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" 
          />
          
          {/* Top glow */}
          <div 
            className="pointer-events-none absolute right-0 -top-[1px] left-0 h-[20px] bg-gradient-to-b from-primary/5 to-transparent blur-xl" 
          />
        </>
      )}
      
      {edge === 'left' && (
        <>
          {/* Left edge line */}
          <div 
            className="pointer-events-none absolute top-0 -left-[1px] bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent" 
          />
          
          {/* Left glow */}
          <div 
            className="pointer-events-none absolute top-0 -left-[1px] bottom-0 w-[20px] bg-gradient-to-r from-primary/5 to-transparent blur-xl" 
          />
        </>
      )}
      
      {edge === 'right' && (
        <>
          {/* Right edge line */}
          <div 
            className="pointer-events-none absolute top-0 -right-[1px] bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent" 
          />
          
          {/* Right glow */}
          <div 
            className="pointer-events-none absolute top-0 -right-[1px] bottom-0 w-[20px] bg-gradient-to-l from-primary/5 to-transparent blur-xl" 
          />
        </>
      )}
    </div>
  );
}