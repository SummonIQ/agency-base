import { Command } from 'lucide-react';
import Link from 'next/link';
import type React from 'react';

import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/css';

import { ResponsiveContainer } from './responsive-container';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <ResponsiveContainer>
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-center md:text-left">
            <Link className="flex items-center gap-2" href="/">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-slate-50">
                <Command className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold text-slate-900">
                  AgencyBase
                </span>
                <span className="truncate text-xs text-slate-500">
                  Beta
                </span>
              </div>
            </Link>
          </div>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="#features"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              How It Works
            </Link>
            <Link
              href="/showcase"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              Showcase
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:inline-block">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="gap-1.5">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </ResponsiveContainer>
    </header>
  );
};
Header.displayName = 'Header';
export { Header };
