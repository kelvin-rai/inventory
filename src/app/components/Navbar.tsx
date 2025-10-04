'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/SupabaseClient';
import { useAuthStore } from '@/store/auth';
import Image from 'next/image';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/profile', label: 'Profile' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { isLoggedIn, setUser, clear } = useAuthStore();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user ?? null;
      if (!mounted) return;
      setUser(
        user
          ? {
              id: user.id,
              email: user.email ?? null,
              avatarUrl:
                (user.user_metadata?.avatar_url as string) ||
                (user.user_metadata?.picture as string) ||
                null,
            }
          : null
      );
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setUser(
        user
          ? {
              id: user.id,
              email: user.email ?? null,
              avatarUrl:
                (user.user_metadata?.avatar_url as string) ||
                (user.user_metadata?.picture as string) ||
                null,
            }
          : null
      );
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setUser]);

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname?.startsWith(href));

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clear();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/70 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Afrinventory logo"
            width={52}
            height={52}
            priority
            className="h-12 w-12 rounded-md object-contain"
          />
          <span className="text-base font-semibold tracking-tight">
            Afrinventory
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
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/auth/signin"
                className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
              >
                Login
              </Link>
            )}
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
      <div className={`md:hidden ${open ? 'block' : 'hidden'} border-t border-gray-200 bg-white`}>
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
            {isLoggedIn ? (
              <button
                onClick={() => {
                  setOpen(false);
                  handleLogout();
                }}
                className="rounded-md border border-gray-300 bg-white px-2 py-2 text-left text-sm font-medium text-gray-800 hover:bg-gray-50"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/auth/signin"
                onClick={() => setOpen(false)}
                className="rounded-md bg-emerald-600 px-2 py-2 text-sm font-semibold text-white"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}