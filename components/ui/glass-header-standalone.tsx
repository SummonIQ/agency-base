/**
 * Glass Header Components - Standalone Version
 * 
 * A collection of reusable glass morphism components with zero dependencies.
 * Just copy this file to your project and import the components you need.
 * 
 * Components included:
 * - GlassHeader: Header with dynamic edge effects
 * - GlassContainer: Container with glass morphism
 * - GlassEdge: Standalone edge effect
 * - GlassButton: Button with glass effect
 * 
 * Works with:
 * - React 16.8+ (requires hooks)
 * - Tailwind CSS (optional - can work with any CSS)
 * - TypeScript (optional - can be used in JS projects)
 * 
 * @author Steven
 * @license MIT
 */

'use client'; // Remove this line if not using Next.js App Router

import * as React from 'react';

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Combines class names, filtering out falsy values
 * Replace this with your project's cn/clsx/classnames utility if available
 */
function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}

// ============================================================================
// Type Definitions
// ============================================================================

type EdgeIntensity = 'subtle' | 'medium' | 'high';
type EdgePosition = 'top' | 'bottom' | 'left' | 'right';
type ButtonVariant = 'default' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface GlassHeaderProps {
  children: React.ReactNode;
  className?: string;
  blur?: number;
  brightness?: number;
  opacity?: number;
  edgeIntensity?: EdgeIntensity;
  showTopEdge?: boolean;
  showBottomEdge?: boolean;
  showGlow?: boolean;
  style?: React.CSSProperties;
}

interface GlassContainerProps {
  children: React.ReactNode;
  className?: string;
  blur?: number;
  brightness?: number;
  opacity?: number;
  borderOpacity?: number;
  hoverEffect?: boolean;
  borderRadius?: string;
  style?: React.CSSProperties;
}

interface GlassEdgeProps {
  position?: EdgePosition;
  thickness?: number;
  className?: string;
  blur?: number;
  brightness?: number;
  opacity?: number;
  style?: React.CSSProperties;
}

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

// ============================================================================
// Configuration Constants
// ============================================================================

const EDGE_INTENSITY_CONFIG = {
  subtle: {
    edgeOpacity: 0.3,
    edgeBlur: 8,
    edgeBrightness: 150,
    glowBlur: 16,
    glowBrightness: 120,
  },
  medium: {
    edgeOpacity: 0.5,
    edgeBlur: 12,
    edgeBrightness: 180,
    glowBlur: 24,
    glowBrightness: 140,
  },
  high: {
    edgeOpacity: 0.7,
    edgeBlur: 16,
    edgeBrightness: 200,
    glowBlur: 32,
    glowBrightness: 160,
  },
} as const;

// ============================================================================
// Main Components
// ============================================================================

/**
 * GlassHeader - Header component with glass morphism and edge effects
 * 
 * @example
 * ```tsx
 * <GlassHeader edgeIntensity="high">
 *   <nav className="p-4">Navigation content</nav>
 * </GlassHeader>
 * ```
 */
export const GlassHeader: React.FC<GlassHeaderProps> = ({
  children,
  className,
  blur = 20,
  brightness = 105,
  opacity = 0.03,
  edgeIntensity = 'medium',
  showTopEdge = true,
  showBottomEdge = true,
  showGlow = true,
  style,
}) => {
  const settings = EDGE_INTENSITY_CONFIG[edgeIntensity];

  const headerStyle: React.CSSProperties = {
    position: 'relative',
    ...style,
  };

  const glassStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 20,
    background: `rgba(255, 255, 255, ${opacity})`,
    backdropFilter: `blur(${blur}px) saturate(180%) brightness(${brightness}%)`,
    WebkitBackdropFilter: `blur(${blur}px) saturate(180%) brightness(${brightness}%)`,
  };

  const glowStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '-32px',
    left: 0,
    right: 0,
    height: '52px',
    zIndex: 10,
    pointerEvents: 'none',
    backdropFilter: `blur(${settings.glowBlur}px) saturate(200%) brightness(${settings.glowBrightness}%)`,
    WebkitBackdropFilter: `blur(${settings.glowBlur}px) saturate(200%) brightness(${settings.glowBrightness}%)`,
    maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.3) 40%, rgba(0, 0, 0, 0.1) 80%, transparent 100%)',
    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.3) 40%, rgba(0, 0, 0, 0.1) 80%, transparent 100%)',
  };

  const topEdgeStyle: React.CSSProperties = {
    position: 'absolute',
    top: '-1px',
    left: 0,
    right: 0,
    height: '2px',
    zIndex: 30,
    pointerEvents: 'none',
    opacity: settings.edgeOpacity,
    backdropFilter: `blur(${settings.edgeBlur}px) saturate(250%) brightness(${settings.edgeBrightness}%) contrast(120%)`,
    WebkitBackdropFilter: `blur(${settings.edgeBlur}px) saturate(250%) brightness(${settings.edgeBrightness}%) contrast(120%)`,
    maskImage: 'linear-gradient(to top, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
    WebkitMaskImage: 'linear-gradient(to top, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
    filter: 'blur(0.25px)',
  };

  const bottomEdgeStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '-1px',
    left: 0,
    right: 0,
    height: '2px',
    zIndex: 30,
    pointerEvents: 'none',
    backdropFilter: `blur(${settings.edgeBlur}px) saturate(250%) brightness(${settings.edgeBrightness}%) contrast(120%)`,
    WebkitBackdropFilter: `blur(${settings.edgeBlur}px) saturate(250%) brightness(${settings.edgeBrightness}%) contrast(120%)`,
    maskImage: 'linear-gradient(to bottom, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%)',
    WebkitMaskImage: 'linear-gradient(to bottom, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%)',
    filter: 'blur(0.25px)',
  };

  return (
    <div className={className} style={headerStyle}>
      <div style={glassStyle}>
        {children}
      </div>
      {showGlow && <div style={glowStyle} />}
      {showTopEdge && <div style={topEdgeStyle} />}
      {showBottomEdge && <div style={bottomEdgeStyle} />}
    </div>
  );
};

/**
 * GlassContainer - Container with glass morphism effect
 * 
 * @example
 * ```tsx
 * <GlassContainer hoverEffect>
 *   <div className="p-6">Content here</div>
 * </GlassContainer>
 * ```
 */
export const GlassContainer: React.FC<GlassContainerProps> = ({
  children,
  className,
  blur = 16,
  brightness = 102,
  opacity = 0.02,
  borderOpacity = 0.1,
  hoverEffect = true,
  borderRadius = '12px',
  style,
}) => {
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    borderRadius,
    border: `1px solid rgba(255, 255, 255, ${borderOpacity})`,
    overflow: 'hidden',
    background: `rgba(255, 255, 255, ${opacity})`,
    backdropFilter: `blur(${blur}px) saturate(150%) brightness(${brightness}%)`,
    WebkitBackdropFilter: `blur(${blur}px) saturate(150%) brightness(${brightness}%)`,
    boxShadow: `
      0 1px 3px rgba(0, 0, 0, 0.05),
      0 0 0 1px rgba(255, 255, 255, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.1)
    `,
    transition: hoverEffect ? 'all 0.3s ease' : undefined,
    ...style,
  };

  return (
    <div 
      className={className} 
      style={containerStyle}
      onMouseEnter={(e) => {
        if (hoverEffect) {
          e.currentTarget.style.boxShadow = `
            0 4px 6px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.15)
          `;
        }
      }}
      onMouseLeave={(e) => {
        if (hoverEffect) {
          e.currentTarget.style.boxShadow = `
            0 1px 3px rgba(0, 0, 0, 0.05),
            0 0 0 1px rgba(255, 255, 255, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          `;
        }
      }}
    >
      {children}
    </div>
  );
};

/**
 * GlassEdge - Standalone edge effect component
 * 
 * @example
 * ```tsx
 * <div className="relative">
 *   <GlassEdge position="bottom" thickness={2} />
 *   Content here
 * </div>
 * ```
 */
export const GlassEdge: React.FC<GlassEdgeProps> = ({
  position = 'bottom',
  thickness = 1,
  className,
  blur = 8,
  brightness = 120,
  opacity = 0.8,
  style,
}) => {
  const isHorizontal = position === 'top' || position === 'bottom';
  
  const edgeStyle: React.CSSProperties = {
    position: 'absolute',
    [position]: 0,
    ...(isHorizontal ? { left: 0, right: 0, height: `${thickness}px` } : { top: 0, bottom: 0, width: `${thickness}px` }),
    zIndex: 10,
    pointerEvents: 'none',
    backdropFilter: `blur(${blur}px) brightness(${brightness}%)`,
    WebkitBackdropFilter: `blur(${blur}px) brightness(${brightness}%)`,
    opacity,
    background: `linear-gradient(
      ${isHorizontal ? '180deg' : '90deg'}, 
      rgba(255, 255, 255, 0.1) 0%, 
      rgba(255, 255, 255, 0.05) 50%, 
      transparent 100%
    )`,
    ...style,
  };

  return <div className={className} style={edgeStyle} />;
};

/**
 * GlassButton - Button with glass morphism effect
 * 
 * @example
 * ```tsx
 * <GlassButton variant="default" size="md" onClick={handleClick}>
 *   Click me
 * </GlassButton>
 * ```
 */
export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  className,
  variant = 'default',
  size = 'md',
  style,
  ...props
}) => {
  const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
    sm: { padding: '6px 12px', fontSize: '14px' },
    md: { padding: '8px 16px', fontSize: '16px' },
    lg: { padding: '12px 24px', fontSize: '18px' },
  };

  const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
    default: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(12px) saturate(150%) brightness(110%)',
      WebkitBackdropFilter: 'blur(12px) saturate(150%) brightness(110%)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    ghost: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(8px) saturate(120%) brightness(105%)',
      WebkitBackdropFilter: 'blur(8px) saturate(120%) brightness(105%)',
      border: '1px solid transparent',
    },
    outline: {
      background: 'transparent',
      backdropFilter: 'blur(4px) saturate(110%) brightness(102%)',
      WebkitBackdropFilter: 'blur(4px) saturate(110%) brightness(102%)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
    },
  };

  const buttonStyle: React.CSSProperties = {
    position: 'relative',
    borderRadius: '8px',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  };

  return (
    <button
      className={className}
      style={buttonStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.02)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = 'none';
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'scale(0.98)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'scale(1.02)';
      }}
      {...props}
    >
      {children}
    </button>
  );
};

// ============================================================================
// Default Export
// ============================================================================

const GlassComponents = {
  GlassHeader,
  GlassContainer,
  GlassEdge,
  GlassButton,
};

export default GlassComponents;