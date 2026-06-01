'use client';

import React from 'react';
import { GlassHeader, GlassContainer, GlassButton, GlassEdge } from './glass-header';

/**
 * Glass Components Demo & Documentation
 * 
 * This file demonstrates all the glass components and their various configurations.
 * Copy the patterns you like into your own projects!
 */

export default function GlassComponentsDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Add some background elements for glass effect visibility */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      {/* Header Section */}
      <GlassHeader className="sticky top-0 z-50" edgeIntensity="high">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-white">Glass UI</h1>
              <nav className="hidden md:flex space-x-6">
                <a href="#" className="text-white/80 hover:text-white transition-colors">Components</a>
                <a href="#" className="text-white/80 hover:text-white transition-colors">Documentation</a>
                <a href="#" className="text-white/80 hover:text-white transition-colors">Examples</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <GlassButton variant="ghost" size="sm" className="text-white">
                Sign In
              </GlassButton>
              <GlassButton variant="default" size="sm" className="text-white">
                Get Started
              </GlassButton>
            </div>
          </div>
        </div>
      </GlassHeader>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-4">
            Beautiful Glass Morphism Components
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Reusable React components with stunning glass effects. 
            Dynamic edge lighting, backdrop filters, and smooth animations.
          </p>
        </div>

        {/* Component Examples Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {/* Basic Glass Container */}
          <GlassContainer className="p-6">
            <h3 className="text-xl font-semibold text-white mb-2">Basic Container</h3>
            <p className="text-white/70 mb-4">
              A simple glass container with default settings. Perfect for cards and content sections.
            </p>
            <code className="text-xs text-blue-300 bg-black/30 px-2 py-1 rounded">
              &lt;GlassContainer&gt;
            </code>
          </GlassContainer>

          {/* High Blur Container */}
          <GlassContainer blur={30} brightness={110} className="p-6">
            <h3 className="text-xl font-semibold text-white mb-2">High Blur</h3>
            <p className="text-white/70 mb-4">
              Increased blur and brightness for a more pronounced effect.
            </p>
            <code className="text-xs text-blue-300 bg-black/30 px-2 py-1 rounded">
              blur={30} brightness={110}
            </code>
          </GlassContainer>

          {/* Low Opacity Container */}
          <GlassContainer opacity={0.01} borderOpacity={0.05} className="p-6">
            <h3 className="text-xl font-semibold text-white mb-2">Subtle Glass</h3>
            <p className="text-white/70 mb-4">
              Lower opacity for a more subtle, barely-there glass effect.
            </p>
            <code className="text-xs text-blue-300 bg-black/30 px-2 py-1 rounded">
              opacity={0.01}
            </code>
          </GlassContainer>
        </div>

        {/* Button Variants */}
        <GlassContainer className="p-8 mb-20">
          <h3 className="text-2xl font-semibold text-white mb-6">Button Variants</h3>
          <div className="flex flex-wrap gap-4 mb-6">
            <GlassButton variant="default" size="lg" className="text-white">
              Default Large
            </GlassButton>
            <GlassButton variant="default" size="md" className="text-white">
              Default Medium
            </GlassButton>
            <GlassButton variant="default" size="sm" className="text-white">
              Default Small
            </GlassButton>
          </div>
          <div className="flex flex-wrap gap-4 mb-6">
            <GlassButton variant="ghost" size="lg" className="text-white">
              Ghost Large
            </GlassButton>
            <GlassButton variant="ghost" size="md" className="text-white">
              Ghost Medium
            </GlassButton>
            <GlassButton variant="ghost" size="sm" className="text-white">
              Ghost Small
            </GlassButton>
          </div>
          <div className="flex flex-wrap gap-4">
            <GlassButton variant="outline" size="lg" className="text-white">
              Outline Large
            </GlassButton>
            <GlassButton variant="outline" size="md" className="text-white">
              Outline Medium
            </GlassButton>
            <GlassButton variant="outline" size="sm" className="text-white">
              Outline Small
            </GlassButton>
          </div>
        </GlassContainer>

        {/* Edge Effects Demo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          <GlassContainer className="p-6 relative">
            <GlassEdge position="top" thickness={2} blur={12} brightness={150} />
            <h3 className="text-xl font-semibold text-white mb-2">Top Edge Effect</h3>
            <p className="text-white/70">
              Container with a glowing top edge. Great for headers and emphasis.
            </p>
          </GlassContainer>

          <GlassContainer className="p-6 relative">
            <GlassEdge position="bottom" thickness={2} blur={12} brightness={150} />
            <h3 className="text-xl font-semibold text-white mb-2">Bottom Edge Effect</h3>
            <p className="text-white/70">
              Container with a glowing bottom edge. Perfect for footers and CTAs.
            </p>
          </GlassContainer>

          <GlassContainer className="p-6 relative">
            <GlassEdge position="left" thickness={3} blur={16} brightness={180} />
            <h3 className="text-xl font-semibold text-white mb-2">Left Edge Effect</h3>
            <p className="text-white/70">
              Vertical edge on the left side. Useful for sidebars and navigation.
            </p>
          </GlassContainer>

          <GlassContainer className="p-6 relative">
            <GlassEdge position="right" thickness={3} blur={16} brightness={180} />
            <h3 className="text-xl font-semibold text-white mb-2">Right Edge Effect</h3>
            <p className="text-white/70">
              Vertical edge on the right side. Great for highlighting important content.
            </p>
          </GlassContainer>
        </div>

        {/* Header Intensity Examples */}
        <div className="space-y-8 mb-20">
          <h3 className="text-2xl font-semibold text-white text-center mb-8">
            Header Edge Intensity Levels
          </h3>
          
          <GlassHeader edgeIntensity="subtle" className="rounded-lg overflow-hidden">
            <div className="p-6">
              <h4 className="text-lg font-semibold text-white mb-2">Subtle Intensity</h4>
              <p className="text-white/70">Minimal edge glow with soft backdrop effects.</p>
            </div>
          </GlassHeader>

          <GlassHeader edgeIntensity="medium" className="rounded-lg overflow-hidden">
            <div className="p-6">
              <h4 className="text-lg font-semibold text-white mb-2">Medium Intensity</h4>
              <p className="text-white/70">Balanced edge effects, perfect for most use cases.</p>
            </div>
          </GlassHeader>

          <GlassHeader edgeIntensity="high" className="rounded-lg overflow-hidden">
            <div className="p-6">
              <h4 className="text-lg font-semibold text-white mb-2">High Intensity</h4>
              <p className="text-white/70">Strong edge glow with vibrant backdrop filters.</p>
            </div>
          </GlassHeader>
        </div>

        {/* Usage Instructions */}
        <GlassContainer className="p-8">
          <h3 className="text-2xl font-semibold text-white mb-6">How to Use</h3>
          <div className="space-y-4 text-white/80">
            <div>
              <h4 className="font-semibold text-white mb-2">1. Copy the Component File</h4>
              <p>Copy either `glass-header.tsx` (with Tailwind classes) or `glass-header-standalone.tsx` (pure inline styles) to your project.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">2. Import Components</h4>
              <pre className="bg-black/40 p-3 rounded-lg overflow-x-auto">
                <code className="text-sm text-green-300">
{`import { 
  GlassHeader, 
  GlassContainer, 
  GlassButton, 
  GlassEdge 
} from './components/glass-header';`}
                </code>
              </pre>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">3. Use in Your Components</h4>
              <pre className="bg-black/40 p-3 rounded-lg overflow-x-auto">
                <code className="text-sm text-green-300">
{`<GlassHeader edgeIntensity="high">
  <nav className="p-4">Your navigation</nav>
</GlassHeader>

<GlassContainer blur={20} className="p-6">
  Your content here
</GlassContainer>`}
                </code>
              </pre>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">4. Customize as Needed</h4>
              <p>All components accept customization props for blur, brightness, opacity, and more. Adjust to match your design system.</p>
            </div>
          </div>
        </GlassContainer>
      </section>
    </div>
  );
}

// Add these animations to your global CSS or Tailwind config:
// @keyframes blob {
//   0% { transform: translate(0px, 0px) scale(1); }
//   33% { transform: translate(30px, -50px) scale(1.1); }
//   66% { transform: translate(-20px, 20px) scale(0.9); }
//   100% { transform: translate(0px, 0px) scale(1); }
// }
// .animate-blob { animation: blob 7s infinite; }
// .animation-delay-2000 { animation-delay: 2s; }
// .animation-delay-4000 { animation-delay: 4s; }