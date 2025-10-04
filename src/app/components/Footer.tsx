import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Navigate</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-600 hover:text-gray-900">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-600 hover:text-gray-900">
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Access</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/auth/signin" className="text-gray-600 hover:text-gray-900">
                  Admin Login
                </Link>
              </li>
              <li>
                <Link href="/auth/signin/salesperson" className="text-gray-600 hover:text-gray-900">
                  Salesperson Login
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">For Kenya SMEs</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="text-gray-600">MPesa-ready workflows</li>
              <li className="text-gray-600">VAT-friendly reporting</li>
              <li className="text-gray-600">Offline-first design</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Legal</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-gray-900">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-gray-900">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-gray-200 pt-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-sky-500 text-white text-xs font-bold">
              KE
            </span>
            <span className="text-sm text-gray-600">Sales Tracker</span>
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Sales Tracker KE. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}