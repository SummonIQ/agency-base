import React from 'react';
import Link from 'next/link';
import { Command, Github, Twitter, Linkedin } from 'lucide-react';

import { ResponsiveContainer } from './responsive-container';

const Footer = () => (
  <footer className="border-t border-slate-200 bg-slate-50">
    <ResponsiveContainer>
      <div className="px-6 py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <Link className="flex items-center gap-2" href="/">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-slate-50">
                <Command className="size-4" />
              </div>
              <span className="font-bold text-slate-900">AgencyBase</span>
            </Link>
            <p className="mt-4 text-sm text-slate-600">
              The complete platform for managing and growing your agency.
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200 text-slate-600 transition-colors hover:bg-slate-300 hover:text-slate-900"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200 text-slate-600 transition-colors hover:bg-slate-300 hover:text-slate-900"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200 text-slate-600 transition-colors hover:bg-slate-300 hover:text-slate-900"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h3 className="font-semibold text-slate-900">Product</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="#features" className="text-sm text-slate-600 hover:text-slate-900">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/showcase" className="text-sm text-slate-600 hover:text-slate-900">
                  Showcase
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-slate-600 hover:text-slate-900">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-slate-600 hover:text-slate-900">
                  Roadmap
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="font-semibold text-slate-900">Company</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="#" className="text-sm text-slate-600 hover:text-slate-900">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-slate-600 hover:text-slate-900">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-slate-600 hover:text-slate-900">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-slate-600 hover:text-slate-900">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="font-semibold text-slate-900">Legal</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="#" className="text-sm text-slate-600 hover:text-slate-900">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-slate-600 hover:text-slate-900">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-slate-600 hover:text-slate-900">
                  Security
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-slate-600 hover:text-slate-900">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-200 pt-8">
          <p className="text-center text-sm text-slate-600">
            © 2025 AgencyBase. All rights reserved.
          </p>
        </div>
      </div>
    </ResponsiveContainer>
  </footer>
);
Footer.displayName = 'Footer';

export { Footer };
