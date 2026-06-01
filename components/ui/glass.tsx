import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/css';
import React from 'react';

// Simplified glass variants focusing on the core effect
const glassVariants = cva(
  // Base glass effect
  "relative before:absolute before:inset-0 before:content-[''] before:backdrop-blur-xl before:backdrop-brightness-105 before:backdrop-saturate-105",
  {
    variants: {
      edge: {
        bottom:
          'before:[mask-image:linear-gradient(to_bottom,black_0,black_calc(100%_-_2rem),transparent_calc(100%_-_2rem))]',
        top: 'before:[mask-image:linear-gradient(to_top,black_0,black_calc(100%_-_2rem),transparent_calc(100%_-_2rem))]',
        left: 'before:[mask-image:linear-gradient(to_left,black_0,black_calc(100%_-_2rem),transparent_calc(100%_-_2rem))]',
        right:
          'before:[mask-image:linear-gradient(to_right,black_0,black_calc(100%_-_2rem),transparent_calc(100%_-_2rem))]',
        none: 'before:[mask-image:linear-gradient(black,black)]',
      },
      intensity: {
        subtle: 'before:backdrop-brightness-102 before:backdrop-saturate-102',
        normal: 'before:backdrop-brightness-105 before:backdrop-saturate-105',
        strong: 'before:backdrop-brightness-110 before:backdrop-saturate-110',
        intense: 'before:backdrop-brightness-115 before:backdrop-saturate-115',
      },
      blur: {
        sm: 'before:backdrop-blur-sm',
        md: 'before:backdrop-blur-md',
        lg: 'before:backdrop-blur-lg',
        xl: 'before:backdrop-blur-xl',
        '2xl': 'before:backdrop-blur-2xl',
      },
    },
    defaultVariants: {
      edge: 'bottom',
      intensity: 'normal',
      blur: 'xl',
    },
  },
);

// Edge line variants for the glowing border effect
const edgeLineVariants = cva(
  'pointer-events-none absolute bg-white/5 saturate-150 backdrop-blur-xl backdrop-brightness-105 backdrop-saturate-105',
  {
    variants: {
      edge: {
        bottom: 'right-0 bottom-[33px] left-0 h-[1px] translate-y-full',
        top: 'right-0 top-[33px] left-0 h-[1px] -translate-y-full',
        left: 'top-0 left-[33px] bottom-0 w-[1px] -translate-x-full',
        right: 'top-0 right-[33px] bottom-0 w-[1px] translate-x-full',
      },
      glow: {
        none: 'opacity-0',
        subtle: 'opacity-60',
        normal: 'opacity-80',
        intense: 'opacity-100 saturate-200 backdrop-brightness-120',
      },
    },
    defaultVariants: {
      edge: 'bottom',
      glow: 'normal',
    },
  },
);

// Glow effect variants
const glowVariants = cva(
  'pointer-events-none absolute inset-0 saturate-50 scale-150 backdrop-blur-sm backdrop-brightness-200 backdrop-saturate-150',
  {
    variants: {
      edge: {
        bottom:
          '[mask-image:linear-gradient(to_bottom,transparent_0,transparent_calc(100%_-_32px_-_1px),black_calc(100%_-_1rem_-_1px),black_calc(100%_-_1rem),transparent_calc(100%_-_1rem))]',
        top: '[mask-image:linear-gradient(to_top,transparent_0,transparent_calc(0%_+_32px_+_1px),black_calc(0%_+_1rem_+_1px),black_calc(0%_+_1rem),transparent_calc(0%_+_1rem))]',
        left: '[mask-image:linear-gradient(to_left,transparent_0,transparent_calc(0%_+_32px_+_1px),black_calc(0%_+_1rem_+_1px),black_calc(0%_+_1rem),transparent_calc(0%_+_1rem))]',
        right:
          '[mask-image:linear-gradient(to_right,transparent_0,transparent_calc(100%_-_32px_-_1px),black_calc(100%_-_1rem_-_1px),black_calc(100%_-_1rem),transparent_calc(100%_-_1rem))]',
      },
      intensity: {
        none: 'opacity-0',
        subtle: 'opacity-40 backdrop-brightness-150',
        normal: 'opacity-60 backdrop-brightness-200',
        intense: 'opacity-80 backdrop-brightness-250 scale-200',
      },
    },
    defaultVariants: {
      edge: 'bottom',
      intensity: 'normal',
    },
  },
);

// Main glass container component
interface GlassProps extends React.HTMLAttributes<HTMLDivElement> {
  edge?: VariantProps<typeof glassVariants>['edge'];
  intensity?: VariantProps<typeof glassVariants>['intensity'];
  blur?: VariantProps<typeof glassVariants>['blur'];
  showEdgeLine?: boolean;
  edgeGlow?: VariantProps<typeof edgeLineVariants>['glow'];
  showGlow?: boolean;
  glowIntensity?: VariantProps<typeof glowVariants>['intensity'];
  children: React.ReactNode;
}

function Glass({
  className,
  edge = 'bottom',
  intensity = 'normal',
  blur = 'xl',
  showEdgeLine = true,
  edgeGlow = 'normal',
  showGlow = true,
  glowIntensity = 'normal',
  children,
  ...props
}: GlassProps) {
  return (
    <div
      className={cn(glassVariants({ edge, intensity, blur }), className)}
      {...props}
    >
      {/* Content */}
      <div className="relative z-10 p-6">{children}</div>

      {/* Edge line */}
      {showEdgeLine && edge !== 'none' && (
        <div className={edgeLineVariants({ edge, glow: edgeGlow })} />
      )}

      {/* Glow effect */}
      {showGlow && edge !== 'none' && (
        <div className={glowVariants({ edge, intensity: glowIntensity })} />
      )}
    </div>
  );
}

// Usage examples:
const examples = {
  // Basic usage like your button variants
  basicUsage: () => (
    <div
      className={cn(
        glassVariants({ edge: 'bottom', intensity: 'strong', blur: '2xl' }),
        'h-48 w-80 rounded-2xl',
      )}
    >
      <div className="relative z-10 p-6">
        <span className="text-white">Basic glass effect</span>
      </div>
    </div>
  ),

  // Using the component
  componentUsage: () => (
    <Glass
      edge="bottom"
      intensity="intense"
      glowIntensity="intense"
      className="h-56 w-96 rounded-lg"
    >
      <h2 className="font-bold text-white">Glass Container</h2>
      <p className="text-gray-300">With glow effect</p>
    </Glass>
  ),

  // Link with glass effect (like your button example)
  linkUsage: () => (
    <a
      className={cn(
        glassVariants({ edge: 'bottom', intensity: 'normal' }),
        'inline-flex items-center px-4 py-2 rounded-md',
      )}
    >
      <span className="relative z-10 text-white">Glass Link</span>
    </a>
  ),
};

export {
  glassVariants,
  edgeLineVariants,
  glowVariants,
  Glass,
  type GlassProps,
};
