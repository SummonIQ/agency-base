'use client';

import * as React from 'react';

// Utility function for combining class names - include this if your project doesn't have cn
function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ');
}

/* ============================================================================
   Glass Header Component - Josh Comeau-inspired backdrop-filter effect
   
   Features:
   - Extended backdrop-filter area (200% height) for better blur capture
   - Gradient mask to limit visible area while extending blur consideration
   - Subtle edge effects with secondary blurred elements
   - Fully self-contained with no external dependencies (except React)
   - TypeScript support with full type definitions
   
   Based on techniques from: https://www.joshwcomeau.com/css/backdrop-filter/
   
   Usage:
   <GlassHeader>
     <div className="flex items-center justify-between p-4">
       <h1>Your Content</h1>
     </div>
   </GlassHeader>
   
   Or with custom settings:
   <GlassHeader 
     blur={16}
     saturation={180}
     brightness={110}
     className="sticky top-0 z-50"
   >
     Your header content
   </GlassHeader>
   ============================================================================ */

interface GlassHeaderProps {
  children: React.ReactNode;
  className?: string;
  blur?: number;
  saturation?: number;
  brightness?: number;
  bgOpacity?: number;
}

export function GlassHeader({
  children,
  className,
  blur = 16,
  saturation = 180,
  brightness = 110,
  bgOpacity = 0.85,
}: GlassHeaderProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Main glass effect background with extended capture area */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          top: '-50%',
          height: '200%',
          backdropFilter: `blur(${blur}px) saturate(${saturation}%) brightness(${brightness}%)`,
          WebkitBackdropFilter: `blur(${blur}px) saturate(${saturation}%) brightness(${brightness}%)`,
          background: `rgba(0, 0, 0, 0.255)`,
          maskImage: 'linear-gradient(to bottom, transparent 0% 25%, black 25% 75%, transparent 75% 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0% 25%, black 25% 75%, transparent 75% 100%)',
        }}
      />
      
      {/* Top edge glow effect - extends beyond header to capture content above */}
      <div 
        className="absolute inset-x-0 pointer-events-none"
        style={{
          top: '-3px',
          height: '6px',
          backdropFilter: `blur(40px) saturate(180%) brightness(125%)`,
          WebkitBackdropFilter: `blur(40px) saturate(180%) brightness(125%)`,
          background: `rgba(255, 255, 255, 0.1)`,
          maskImage: 'linear-gradient(to top, black 0% 4%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, black 0% 4%, transparent 100%)',
        }}
      />
      
      {/* Top gradient overlay - 1px gradient at the very top */}
      <div 
        className="absolute inset-x-0 pointer-events-none"
        style={{
          top: '0px',
          height: '1px',
          background: `linear-gradient(to bottom, rgba(255, 255, 255, 0.3), transparent)`,
        }}
      />
      
      {/* Bottom edge glow effect - extends beyond header to capture content below */}
      <div 
        className="absolute inset-x-0 pointer-events-none"
        style={{
          top: 'calc(100% - 3px)',
          height: '3px',
          backdropFilter: `blur(40px) saturate(180%) brightness(125%)`,
          WebkitBackdropFilter: `blur(40px) saturate(180%) brightness(125%)`,
          maskImage: 'linear-gradient(to bottom, black 0% 4%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0% 4%, transparent 100%)',
        }}
      />
      
      {/* Content container */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
}

/* ============================================================================
   Glass Layer Component - Draggable glass effect layer
   ============================================================================ */

interface GlassLayerProps {
  children: React.ReactNode;
  className?: string;
  blur?: number;
  saturation?: number;
  brightness?: number;
  bgOpacity?: number;
  darkLevel?: 'light' | 'medium' | 'dark';
  style?: React.CSSProperties;
}

export function GlassLayer({
  children,
  className,
  blur = 16,
  saturation = 180,
  brightness = 110,
  darkLevel = 'medium',
  style,
}: GlassLayerProps) {
  const darkLevels = {
    light: { bg: 'rgba(255, 255, 255, 0.15)', shadow: '0 8px 32px rgba(0, 0, 0, 0.2)' },
    medium: { bg: 'rgba(0, 0, 0, 0.25)', shadow: '0 8px 32px rgba(0, 0, 0, 0.3)' },
    dark: { bg: 'rgba(0, 0, 0, 0.45)', shadow: '0 12px 40px rgba(0, 0, 0, 0.5)' },
  };


  return (
    <div 
      className={cn('relative rounded-2xl overflow-hidden', className)} 
      style={{ 
        ...style, 
        boxShadow: darkLevels[darkLevel].shadow,
        border: '2px solid rgba(255, 255, 255, 0.2)',
      }}
    >
      {/* Main glass effect background */}
      <div 
        className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{
          backdropFilter: `blur(${blur}px) saturate(${saturation}%) brightness(${brightness}%)`,
          WebkitBackdropFilter: `blur(${blur}px) saturate(${saturation}%) brightness(${brightness}%)`,
          background: darkLevels[darkLevel].bg,
        }}
      />
      
      {/* Top edge - ultra-thin strip */}
      <div 
        className="absolute inset-x-0 pointer-events-none"
        style={{
          top: '0px',
          height: '1px',
          backdropFilter: `blur(${blur * 2.5}px) saturate(${saturation + 120}%) brightness(${brightness + 40}%)`,
          WebkitBackdropFilter: `blur(${blur * 2.5}px) saturate(${saturation + 120}%) brightness(${brightness + 40}%)`,
          background: `rgba(255, 255, 255, 0.2)`,
          borderRadius: '16px 16px 0 0',
        }}
      />
      
      {/* Bottom edge - ultra-thin strip */}
      <div 
        className="absolute inset-x-0 pointer-events-none"
        style={{
          bottom: '0px',
          height: '1px',
          backdropFilter: `blur(${blur * 2.5}px) saturate(${saturation + 120}%) brightness(${brightness + 40}%)`,
          WebkitBackdropFilter: `blur(${blur * 2.5}px) saturate(${saturation + 120}%) brightness(${brightness + 40}%)`,
          background: `rgba(255, 255, 255, 0.2)`,
          borderRadius: '0 0 16px 16px',
        }}
      />
      
      {/* Left edge - ultra-thin strip */}
      <div 
        className="absolute inset-y-0 pointer-events-none"
        style={{
          left: '0px',
          width: '1px',
          backdropFilter: `blur(${blur * 2.5}px) saturate(${saturation + 120}%) brightness(${brightness + 40}%)`,
          WebkitBackdropFilter: `blur(${blur * 2.5}px) saturate(${saturation + 120}%) brightness(${brightness + 40}%)`,
          background: `rgba(255, 255, 255, 0.2)`,
          borderRadius: '16px 0 0 16px',
        }}
      />
      
      {/* Right edge - ultra-thin strip */}
      <div 
        className="absolute inset-y-0 pointer-events-none"
        style={{
          right: '0px',
          width: '1px',
          backdropFilter: `blur(${blur * 2.5}px) saturate(${saturation + 120}%) brightness(${brightness + 40}%)`,
          WebkitBackdropFilter: `blur(${blur * 2.5}px) saturate(${saturation + 120}%) brightness(${brightness + 40}%)`,
          background: `rgba(255, 255, 255, 0.2)`,
          borderRadius: '0 16px 16px 0',
        }}
      />
      
      {/* Content container */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
}

/* ============================================================================
   Glass Container Component - For content sections with glass effects
   ============================================================================ */

interface GlassContainerProps {
  children: React.ReactNode;
  className?: string;
  blur?: number;
  brightness?: number;
  opacity?: number;
  borderOpacity?: number;
  hoverEffect?: boolean;
}

export function GlassContainer({
  children,
  className,
  blur = 16,
  brightness = 102,
  opacity = 0.02,
  borderOpacity = 0.1,
  hoverEffect = true,
}: GlassContainerProps) {
  return (
    <div 
      className={cn(
        'relative rounded-xl border overflow-hidden',
        hoverEffect && 'transition-all duration-300 hover:shadow-md',
        className
      )}
      style={{
        borderColor: `rgba(255, 255, 255, ${borderOpacity})`,
        background: `rgba(255, 255, 255, ${opacity})`,
        backdropFilter: `blur(${blur}px) saturate(150%) brightness(${brightness}%)`,
        WebkitBackdropFilter: `blur(${blur}px) saturate(150%) brightness(${brightness}%)`,
        boxShadow: `
          0 1px 3px rgba(0, 0, 0, 0.05),
          0 0 0 1px rgba(255, 255, 255, 0.05),
          inset 0 1px 0 rgba(255, 255, 255, 0.1)
        `,
      }}
    >
      {children}
    </div>
  );
}

/* ============================================================================
   Glass Edge Component - Standalone edge effect for any container
   ============================================================================ */

interface GlassEdgeProps {
  position?: 'top' | 'bottom' | 'left' | 'right';
  thickness?: number;
  className?: string;
  blur?: number;
  brightness?: number;
  opacity?: number;
}

export function GlassEdge({
  position = 'bottom',
  thickness = 1,
  className,
  blur = 8,
  brightness = 120,
  opacity = 0.8,
}: GlassEdgeProps) {
  const positionClasses = {
    top: 'top-0 left-0 right-0',
    bottom: 'bottom-0 left-0 right-0', 
    left: 'top-0 bottom-0 left-0',
    right: 'top-0 bottom-0 right-0',
  };

  const dimensions = {
    top: { height: `${thickness}px`, width: '100%' },
    bottom: { height: `${thickness}px`, width: '100%' },
    left: { width: `${thickness}px`, height: '100%' },
    right: { width: `${thickness}px`, height: '100%' },
  };

  const maskDirection = {
    top: 'to bottom',
    bottom: 'to top',
    left: 'to right',
    right: 'to left',
  };

  return (
    <div
      className={cn(
        'absolute pointer-events-none z-10',
        positionClasses[position],
        className
      )}
      style={{
        ...dimensions[position],
        backdropFilter: `blur(${blur}px) brightness(${brightness}%)`,
        WebkitBackdropFilter: `blur(${blur}px) brightness(${brightness}%)`,
        opacity,
        background: `linear-gradient(
          ${position === 'top' || position === 'bottom' ? '180deg' : '90deg'}, 
          rgba(255, 255, 255, 0.1) 0%, 
          rgba(255, 255, 255, 0.05) 50%, 
          transparent 100%
        )`,
        maskImage: `linear-gradient(${maskDirection[position]}, black 0, black ${thickness}px, transparent ${thickness}px)`,
        WebkitMaskImage: `linear-gradient(${maskDirection[position]}, black 0, black ${thickness}px, transparent ${thickness}px)`,
      }}
    />
  );
}

/* ============================================================================
   Glass Button Component - Button with glass morphism effect
   ============================================================================ */

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function GlassButton({
  children,
  className,
  variant = 'default',
  size = 'md',
  ...props
}: GlassButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variantStyles = {
    default: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(12px) saturate(150%) brightness(110%)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    ghost: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(8px) saturate(120%) brightness(105%)',
      border: '1px solid transparent',
    },
    outline: {
      background: 'transparent',
      backdropFilter: 'blur(4px) saturate(110%) brightness(102%)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
    },
  };

  return (
    <button
      className={cn(
        'relative rounded-lg font-medium transition-all duration-200',
        'hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
        sizeClasses[size],
        className
      )}
      style={{
        ...variantStyles[variant],
        WebkitBackdropFilter: variantStyles[variant].backdropFilter,
      }}
      {...props}
    >
      {children}
    </button>
  );
}

/* ============================================================================
   Glass Navigation Components - Enhanced navigation with active states
   ============================================================================ */

interface GlassNavLinkProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function GlassNavLink({
  href,
  children,
  isActive = false,
  onClick,
  className,
}: GlassNavLinkProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={cn(
        'relative px-4 py-2 rounded-lg transition-all duration-300',
        'hover:text-white',
        isActive ? 'text-white' : 'text-white/70',
        className
      )}
      style={{
        background: isActive 
          ? 'rgba(0, 0, 80, 0.6)' 
          : 'transparent',
        backdropFilter: isActive 
          ? 'blur(24px) saturate(150%) brightness(110%)' 
          : 'none',
        WebkitBackdropFilter: isActive 
          ? 'blur(24px) saturate(150%) brightness(110%)' 
          : 'none',
        boxShadow: isActive 
          ? `
            0 0 0 1px rgba(0, 0, 80, 0.4),
            inset 0 1px 0 rgba(0, 0, 120, 0.3),
            0 4px 16px rgba(0, 0, 28, 0.3)
          ` 
          : 'none',
      }}
    >
      {children}
      {isActive && (
        <div 
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, rgba(0, 0, 60, 0.2) 0%, transparent 70%)',
            filter: 'blur(8px)',
          }}
        />
      )}
    </a>
  );
}

/* ============================================================================
   Glass Dropdown Menu Component
   ============================================================================ */

interface GlassDropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export function GlassDropdown({
  trigger,
  children,
  isOpen,
  onToggle,
  className,
}: GlassDropdownProps) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-1 px-4 py-2 rounded-lg text-white/70 hover:text-white transition-colors"
      >
        {trigger}
        <svg
          className={cn(
            'w-4 h-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div
          className={cn(
            'absolute top-full mt-2 min-w-[200px] rounded-xl overflow-hidden',
            'animate-in fade-in slide-in-from-top-2 duration-200',
            className
          )}
          style={{
            background: 'rgba(0, 0, 60, 0.5)',
            backdropFilter: 'blur(32px) saturate(140%) brightness(105%)',
            WebkitBackdropFilter: 'blur(32px) saturate(140%) brightness(105%)',
            border: '1px solid rgba(0, 0, 80, 0.5)',
            boxShadow: `
              0 10px 40px rgba(0, 0, 28, 0.4),
              0 0 0 1px rgba(0, 0, 60, 0.3),
              inset 0 1px 0 rgba(0, 0, 100, 0.2)
            `,
          }}
        >
          <div className="py-2">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

interface GlassDropdownItemProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  isActive?: boolean;
  className?: string;
}

export function GlassDropdownItem({
  href,
  onClick,
  children,
  isActive = false,
  className,
}: GlassDropdownItemProps) {
  const Component = href ? 'a' : 'button';
  
  return (
    <Component
      href={href}
      onClick={onClick}
      className={cn(
        'block w-full px-4 py-2 text-left transition-all duration-200',
        'hover:text-white',
        isActive ? 'text-white' : 'text-white/70',
        className
      )}
      style={{
        background: isActive 
          ? 'rgba(0, 0, 100, 0.7)' 
          : 'transparent',
        backdropFilter: isActive 
          ? 'blur(16px) saturate(130%) brightness(115%)' 
          : 'none',
        WebkitBackdropFilter: isActive 
          ? 'blur(16px) saturate(130%) brightness(115%)' 
          : 'none',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          (e.target as HTMLElement).style.background = 'rgba(0, 0, 80, 0.3)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          (e.target as HTMLElement).style.background = 'transparent';
        }
      }}
    >
      {children}
    </Component>
  );
}

/* ============================================================================
   Example Usage Component - Shows how to use all the glass components
   ============================================================================ */

export function GlassHeaderExample() {
  const [activeLink, setActiveLink] = React.useState('home');
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Sticky header with glass effect */}
      <GlassHeader className="sticky top-0 z-50" blur={20} saturation={180} brightness={110}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Glass Header</h1>
            <nav className="flex items-center gap-2">
              <GlassNavLink 
                href="#home" 
                isActive={activeLink === 'home'}
                onClick={() => setActiveLink('home')}
              >
                Home
              </GlassNavLink>
              <GlassNavLink 
                href="#about" 
                isActive={activeLink === 'about'}
                onClick={() => setActiveLink('about')}
              >
                About
              </GlassNavLink>
              
              <GlassDropdown
                trigger="Services"
                isOpen={dropdownOpen}
                onToggle={() => setDropdownOpen(!dropdownOpen)}
              >
                <GlassDropdownItem 
                  href="#design"
                  isActive={activeLink === 'design'}
                  onClick={() => {
                    setActiveLink('design');
                    setDropdownOpen(false);
                  }}
                >
                  Design
                </GlassDropdownItem>
                <GlassDropdownItem 
                  href="#development"
                  isActive={activeLink === 'development'}
                  onClick={() => {
                    setActiveLink('development');
                    setDropdownOpen(false);
                  }}
                >
                  Development
                </GlassDropdownItem>
                <GlassDropdownItem 
                  href="#consulting"
                  isActive={activeLink === 'consulting'}
                  onClick={() => {
                    setActiveLink('consulting');
                    setDropdownOpen(false);
                  }}
                >
                  Consulting
                </GlassDropdownItem>
              </GlassDropdown>
              
              <GlassNavLink 
                href="#contact" 
                isActive={activeLink === 'contact'}
                onClick={() => setActiveLink('contact')}
              >
                Contact
              </GlassNavLink>
            </nav>
          </div>
        </div>
      </GlassHeader>

      {/* Content with glass containers */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <GlassContainer key={i} className="p-6">
              <h2 className="text-xl font-semibold text-white mb-2">Card {i}</h2>
              <p className="text-white/80">
                This is a glass container with backdrop-filter effects.
              </p>
              <div className="mt-4">
                <GlassButton variant="outline" size="sm" className="text-white">
                  Learn More
                </GlassButton>
              </div>
            </GlassContainer>
          ))}
        </div>
      </div>
    </div>
  );
}