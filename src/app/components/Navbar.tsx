'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/profile', label: 'Profile' },
];

const accessLinks = [
  { href: '/auth/signin', label: 'Admin Login' },
  { href: '/auth/signin/salesperson', label: 'Salesperson Login' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname?.startsWith(href));

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/70 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-sky-500 text-white font-bold">
            KE
          </span>
          <span className="text-base font-semibold tracking-tight">
            Sales Tracker
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 md:flex">
          <div className="flex items-center gap-4">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm transition-colors ${
                  isActive(l.href)
                    ? 'text-emerald-600 font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="h-5 w-px bg-gray-200" />
          <div className="flex items-center gap-3">
            {accessLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive(l.href)
                    ? 'text-emerald-600 font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-md border border-gray-200 p-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 md:hidden"
        >
          <svg
            className={`h-5 w-5 ${open ? 'hidden' : 'block'}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path strokeWidth="2" strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
          </svg>
          <svg
            className={`h-5 w-5 ${open ? 'block' : 'hidden'}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path strokeWidth="2" strokeLinecap="round" d="M6 6l12 12M6 18L18 6" />
          </svg>
        </button>
      </nav>

      {/* Mobile panel */}
      <div
        className={`md:hidden ${open ? 'block' : 'hidden'} border-t border-gray-200 bg-white`}
      >
        <div className="mx-auto max-w-7xl px-4 py-3 md:px-6">
          <div className="flex flex-col gap-2">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`rounded-md px-2 py-2 text-sm ${
                  isActive(l.href)
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="my-3 h-px w-full bg-gray-200" />
          <div className="flex flex-col gap-2">
            {accessLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`rounded-md px-2 py-2 text-sm ${
                  isActive(l.href)
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}