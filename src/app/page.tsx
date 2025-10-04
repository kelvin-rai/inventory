// ...existing code...
import Image from "next/image";
import Link from "next/link";
import BannerCarousel from "./components/BannerCarousel";

export default function Home() {
  return (
    <div className="font-sans">
      {/* Hero */}
      <section className="relative">
        {/* Background grid + glow */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_-10%,rgba(16,185,129,0.12),transparent),radial-gradient(40%_30%_at_80%_20%,rgba(56,189,248,0.12),transparent)]" />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:32px_32px]"
          />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-12 pt-10 md:px-6 lg:grid-cols-2 lg:gap-12 lg:pb-16 lg:pt-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Smart Sales + Inventory for Kenya SMEs
            </div>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
              Track stock, sales, and cash flow with confidence
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg">
              Built for MPesa, VAT, and offline realities. Prevent leakage with audit trails,
              empower teams with role-based access, and make restocking decisions with live insights.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/auth/signin"
                className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                Admin Login
              </Link>
              <Link
                href="/auth/signin/salesperson"
                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                Salesperson Login
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                View Dashboard →
              </Link>
            </div>

            <div className="mt-5 flex items-center gap-4 text-xs text-gray-500">
              <div className="inline-flex items-center gap-1">
                <svg width="16" height="16" viewBox="0 0 24 24" className="text-emerald-600">
                  <path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Offline-first
              </div>
              <div className="inline-flex items-center gap-1">
                <svg width="16" height="16" viewBox="0 0 24 24" className="text-emerald-600">
                  <path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                MPesa-ready
              </div>
              <div className="inline-flex items-center gap-1">
                <svg width="16" height="16" viewBox="0 0 24 24" className="text-emerald-600">
                  <path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                VAT-friendly
              </div>
            </div>
          </div>

          <div>
            <BannerCarousel
              images={[
                { src: "/appBanner1.png", alt: "Sales dashboard with Kenyan insights" },
                { src: "/appBanner2.png", alt: "Inventory and stock refill flows" },
                { src: "/appBanner3.png", alt: "MPesa reconciliation and daily summaries" },
                { src: "/appBanner4.png", alt: "Forecasts, trends, and anti-theft audit trails" },
              ]}
              intervalMs={5000}
            />
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:py-14">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Feature
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor">
                <path d="M3 7h18M3 12h18M3 17h18" strokeWidth="2" strokeLinecap="round" />
              </svg>
            }
            title="Inventory + POS"
            desc="Refill stock, record sales fast, and see real-time balances across products and branches."
          />
          <Feature
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor">
                <path d="M12 1v22M3 8h18M3 16h18" strokeWidth="2" strokeLinecap="round" />
              </svg>
            }
            title="MPesa-native"
            desc="Designed for mobile money: map till/paybill, reconcile settlements, and reduce cash leakage."
          />
          <Feature
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor">
                <path d="M12 3l8 4v6c0 5-8 8-8 8s-8-3-8-8V7l8-4z" strokeWidth="2" strokeLinecap="round" />
              </svg>
            }
            title="Anti-theft controls"
            desc="Role-based access, approvals, and immutable audit logs for full transparency."
          />
          <Feature
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor">
                <path d="M3 12h18M12 3v18" strokeWidth="2" strokeLinecap="round" />
              </svg>
            }
            title="VAT & compliance"
            desc="Kenya-ready tax logic and exports that simplify bookkeeping for KRA and auditors."
          />
          <Feature
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor">
                <path d="M3 12a9 9 0 1018 0A9 9 0 003 12z" strokeWidth="2" />
                <path d="M12 7v5l3 3" strokeWidth="2" strokeLinecap="round" />
              </svg>
            }
            title="Insights & forecasts"
            desc="Know your winners, peak days, and restock windows with predictive signals."
          />
          <Feature
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor">
                <path d="M3 5h18v14H3z" strokeWidth="2" />
                <path d="M3 9h18" strokeWidth="2" />
              </svg>
            }
            title="Offline-first"
            desc="Keep selling when the internet drops; sync safely when you’re back online."
          />
        </div>
      </section>

      {/* How it Works */}
      <section className="mx-auto max-w-7xl px-4 pb-12 md:px-6 lg:pb-16">
        <div className="grid grid-cols-1 gap-6 rounded-2xl border border-gray-200/70 bg-white p-6 sm:grid-cols-3">
          <Step
            number="1"
            title="Refill stock"
            desc="Add or import inventory, set costs and prices, and track batches."
          />
          <Step
            number="2"
            title="Record sales"
            desc="Salespeople log sales with email identity; MPesa and cash supported."
          />
          <Step
            number="3"
            title="Decide fast"
            desc="Dashboards reveal profit drivers, peak periods, and restock alerts."
          />
        </div>
      </section>

      {/* Call to action */}
      <section className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-sky-50 px-4 py-10 md:px-6 lg:py-12">
        <div className="absolute right-[-10%] top-[-30%] h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute bottom-[-30%] left-[-10%] h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="relative">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Bring clarity to your sales and stock today
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-gray-600 sm:text-base">
            Low-cost, modern, and built for Kenyan businesses. Start with the role that fits you.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/auth/signin"
              className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              Admin Login
            </Link>
            <Link
              href="/auth/signin/"
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              Salesperson Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200/70 bg-white p-5">
      <div className="flex items-start gap-3">
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-600">{desc}</p>
        </div>
      </div>
    </div>
  );
}

function Step({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-4 rounded-xl bg-white">
      <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
        {number}
      </div>
      <div>
        <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
        <p className="mt-1 text-sm text-gray-600">{desc}</p>
      </div>
    </div>
  );
}