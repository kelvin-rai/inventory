'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/SupabaseClient';

type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  created_at: string | null;
  updated_at: string | null;
};

type Tab =
  | 'overview'
  | 'profile'
  | 'sell'
  | 'refill'        // admin only
  | 'products'      // admin only
  | 'admin'         // admin only
  | 'salesperson';  // salesperson only

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isSalesperson, setIsSalesperson] = useState(false);
  const isAdmin = useMemo(() => !!userEmail && !isSalesperson, [userEmail, isSalesperson]);

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState<Tab>('overview');

  // Products state (admin)
  const [products, setProducts] = useState<Product[]>([]);
  const [prodLoading, setProdLoading] = useState(false);
  const [prodError, setProdError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      // Auth gate
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user ?? null;
      if (!user) {
        router.replace('/auth/signin');
        return;
      }
      const email = (user.email || '').toLowerCase();
      if (!mounted) return;
      setUserEmail(email);

      // Membership check: email exists in salespersons => salesperson mode
      // Ensure your RLS allows authenticated select by email (or use a secure RPC).
      const { data: sp, error: spErr } = await supabase
        .from('salespersons')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (!mounted) return;

      if (spErr) {
        // If your RLS restricts select, consider a secure RPC for membership check.
        setIsSalesperson(false);
      } else {
        setIsSalesperson(!!sp?.email);
      }

      // Default active tab
      setActive((prev) => {
        if (prev !== 'overview') return prev;
        return isSalesperson ? 'salesperson' : 'overview';
      });

      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [router, isSalesperson]);

  // Fetch products for admin with pagination
  useEffect(() => {
    if (!isAdmin) return;
    let mounted = true;

    (async () => {
      setProdLoading(true);
      setProdError(null);
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from('products')
        .select('id,name,sku,price,quantity,created_at,updated_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (!mounted) return;

      if (error) {
        setProdError(error.message);
      } else {
        setProducts(data || []);
        setTotalCount(count || 0);
      }
      setProdLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [isAdmin, page]);

  // Handlers (stubs for now)
  // ...existing code...
  const handleSell = async (productId: string, qty: number) => {
    try {
      setProdError(null);
      if (!productId || qty <= 0) return;

      // 1) Read current quantity
      const { data: prod, error: readErr } = await supabase
        .from('products')
        .select('id, quantity, updated_at')
        .eq('id', productId)
        .single();

      if (readErr || !prod) {
        setProdError('Product not found.');
        return;
      }

      if (prod.quantity < qty) {
        setProdError('Insufficient stock.');
        return;
      }

      const newQty = prod.quantity - qty;

      // 2) Optimistic update: only update if the quantity hasn't changed
      const { data: updated, error: updErr } = await supabase
        .from('products')
        .update({ quantity: newQty, updated_at: new Date().toISOString() })
        .eq('id', productId)
        .eq('quantity', prod.quantity)
        .select('id, quantity, updated_at')
        .maybeSingle();

      if (updErr) {
        setProdError(updErr.message);
        return;
      }
      if (!updated) {
        setProdError('Stock changed while selling. Please retry.');
        return;
      }

      // 3) Reflect change in the local table (if currently loaded)
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, quantity: updated.quantity, updated_at: updated.updated_at } : p
        )
      );
    } catch (e: any) {
      setProdError(e?.message || 'Failed to record sale.');
    }
  };
// ...existing code...

// ...existing code...
const handleRefill = async (p: { name: string; sku: string; price: number; quantity: number }) => {
    try {
      setProdError(null);
      if (!isAdmin) {
        setProdError('Not authorized.');
        return;
      }

      const name = (p.name || '').trim();
      const sku = (p.sku || '').trim();
      const price = Number.isFinite(p.price) ? Number(p.price) : 0;
      const qty = Math.max(0, Math.floor(Number(p.quantity)));
      if (!name || !sku || qty <= 0) {
        setProdError('Provide name, SKU, and positive quantity.');
        return;
      }

      // Get current user for created_by
      const { data: authRes, error: authErr } = await supabase.auth.getUser();
      const uid = authRes?.user?.id;
      if (authErr || !uid) {
        setProdError('Not authenticated.');
        return;
      }

      // 1) Try insert new product
      const { data: inserted, error: insErr } = await supabase
        .from('products')
        .insert([{ name, sku, price, quantity: qty, created_by: uid }])
        .select('id,name,sku,price,quantity,created_at,updated_at')
        .single();

      if (!insErr && inserted) {
        // Prepend into current list (best-effort)
        setProducts((prev) => [inserted, ...prev]);
        setTotalCount((c) => c + 1);
        return;
      }

      // 2) If duplicate SKU, increment quantity and optionally update price
      const isUniqueViolation =
        insErr && (insErr.code === '23505' || `${insErr.message}`.toLowerCase().includes('duplicate key'));
      if (isUniqueViolation) {
        // Load existing row
        const { data: existing, error: getErr } = await supabase
          .from('products')
          .select('id,name,sku,price,quantity,updated_at')
          .eq('sku', sku)
          .single();

        if (getErr || !existing) {
          setProdError('Failed to load existing product.');
          return;
        }

        const newQty = existing.quantity + qty;
        const newPrice = price > 0 ? price : existing.price;

        // Optimistic update: ensure quantity didn't change since read
        const { data: updated, error: updErr } = await supabase
          .from('products')
          .update({ quantity: newQty, price: newPrice, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
          .eq('quantity', existing.quantity)
          .select('id,name,sku,price,quantity,updated_at')
          .single();

        if (updErr) {
          setProdError(updErr.message);
          return;
        }
        if (!updated) {
          setProdError('Stock changed while refilling. Please retry.');
          return;
        }

        // Sync local table
        setProducts((prev) =>
          prev.map((row) =>
            row.id === updated.id
              ? { ...row, price: updated.price, quantity: updated.quantity, updated_at: updated.updated_at }
              : row
          )
        );
        return;
      }

      if (insErr) setProdError(insErr.message);
    } catch (e: any) {
      setProdError(e?.message || 'Failed to refill.');
    }
  };
// ...existing code...

  const SidebarButton = ({
    id,
    label,
    hidden,
  }: {
    id: Tab;
    label: string;
    hidden?: boolean;
  }) => {
    if (hidden) return null;
    const activeCls =
      active === id ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-gray-700 hover:bg-gray-50';
    return (
      <button
        onClick={() => {
          setActive(id);
          setSidebarOpen(false);
        }}
        className={`w-full rounded-md px-3 py-2 text-left text-sm ${activeCls}`}
      >
        {label}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-gray-600">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-4 md:px-6 lg:grid-cols-[250px_1fr]">
      {/* Sidebar */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        {/* Mobile toggle */}
        <div className="mb-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800"
          >
            Menu
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>

        <div
          className={`rounded-2xl border border-gray-200 bg-white p-3 lg:block ${
            sidebarOpen ? 'block' : 'hidden'
          }`}
        >
          <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Navigation
          </div>
          <div className="flex flex-col gap-1">
            <SidebarButton id="overview" label="Overview" />
            <SidebarButton id="profile" label="Profile" />
            <SidebarButton id="sell" label="Sell" />
            <SidebarButton id="refill" label="Refill" hidden={!isAdmin} />
            <SidebarButton id="products" label="Products" hidden={!isAdmin} />
            <SidebarButton id="admin" label="Admin" hidden={!isAdmin} />
            <SidebarButton id="salesperson" label="Salesperson" hidden={!isSalesperson} />
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="min-h-[60vh]">
        {active === 'overview' && (
          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              Signed in as <span className="font-medium text-gray-900">{userEmail}</span>. Role:{' '}
              {isAdmin ? 'Admin' : 'Salesperson'}.
            </p>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard label="Products" value={isAdmin ? totalCount : '—'} note={isAdmin ? 'Tracked items' : 'Limited'} />
              <StatCard label="Today Sales" value="KES —" note="Coming soon" />
              <StatCard label="Stock Alerts" value="—" note="Coming soon" />
            </div>
          </section>
        )}

        {active === 'profile' && (
          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="text-base font-semibold text-gray-900">Profile</h2>
            <p className="mt-1 text-sm text-gray-600">Manage your account and permissions.</p>
            <div className="mt-4">
              <Link
                href="/profile"
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
              >
                Open Admin Profile
              </Link>
            </div>
          </section>
        )}

        {active === 'sell' && (
          <SellSection onSell={handleSell} />
        )}

        {active === 'refill' && isAdmin && (
          <RefillSection onRefill={handleRefill} />
        )}

        {active === 'products' && isAdmin && (
          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Products</h2>
              <div className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </div>
            </div>

            {prodError && (
              <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {prodError}
              </div>
            )}

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <Th>Unique Name</Th>
                    <Th>SKU</Th>
                    <Th className="text-right">Price (KES)</Th>
                    <Th className="text-right">Qty</Th>
                    <Th>Updated</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {prodLoading ? (
                    <tr>
                      <td className="px-3 py-3 text-gray-500" colSpan={5}>
                        Loading…
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td className="px-3 py-3 text-gray-500" colSpan={5}>
                        No products yet.
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => (
                      <tr key={p.id}>
                        <Td>{p.name}</Td>
                        <Td>{p.sku}</Td>
                        <Td className="text-right">{Number(p.price).toLocaleString()}</Td>
                        <Td className="text-right">{p.quantity}</Td>
                        <Td>{p.updated_at ? new Date(p.updated_at).toLocaleString() : '—'}</Td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 disabled:opacity-50"
              >
                Previous
              </button>
              <div className="text-sm text-gray-600">
                Step {page} of {totalPages}
              </div>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </section>
        )}

        {active === 'admin' && isAdmin && (
          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="text-base font-semibold text-gray-900">Admin</h2>
            <p className="mt-1 text-sm text-gray-600">
              Manage products, refilling, and team access.
            </p>
          </section>
        )}

        {active === 'salesperson' && isSalesperson && (
          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="text-base font-semibold text-gray-900">Salesperson</h2>
            <p className="mt-1 text-sm text-gray-600">
              You have salesperson access. Use the Sell tab to record sales.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, note }: { label: string; value: React.ReactNode; note?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
      {note && <div className="mt-1 text-xs text-gray-500">{note}</div>}
    </div>
  );
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-3 py-2 text-left font-semibold text-gray-700 ${className}`}>{children}</th>;
}
function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-3 text-gray-900 ${className}`}>{children}</td>;
}

function SellSection({ onSell }: { onSell: (productId: string, qty: number) => Promise<void> }) {
  const [productId, setProductId] = useState('');
  const [qty, setQty] = useState<number>(1);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="text-base font-semibold text-gray-900">Sell</h2>
      <p className="mt-1 text-sm text-gray-600">Record a sale and reduce stock.</p>
      <form
        className="mt-4 flex flex-col gap-3 sm:flex-row"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!productId || qty <= 0) return;
          await onSell(productId, qty);
        }}
      >
        <input
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          placeholder="Product ID"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        />
        <input
          type="number"
          min={1}
          className="w-32 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          placeholder="Qty"
          value={qty}
          onChange={(e) => setQty(parseInt(e.target.value || '1', 10))}
        />
        <button
          className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          type="submit"
        >
          Submit
        </button>
      </form>
      <p className="mt-3 text-xs text-gray-500">
        Tip: Replace with a product selector and an RPC that safely decrements stock.
      </p>
    </section>
  );
}

function RefillSection({
  onRefill,
}: {
  onRefill: (p: { name: string; sku: string; price: number; quantity: number }) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(0);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="text-base font-semibold text-gray-900">Refill</h2>
      <p className="mt-1 text-sm text-gray-600">Add new products or restock inventory.</p>

      <form
        className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!name || !sku || price < 0 || quantity < 0) return;
          await onRefill({ name, sku, price, quantity });
          setName('');
          setSku('');
          setPrice(0);
          setQuantity(0);
        }}
      >
        <input
          className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          placeholder="Product name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          placeholder="SKU"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
        />
        <input
          type="number"
          step="0.01"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          placeholder="Price (KES)"
          value={price}
          onChange={(e) => setPrice(parseFloat(e.target.value || '0'))}
        />
        <input
          type="number"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value || '0', 10))}
        />

        <div className="sm:col-span-2">
          <button
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            type="submit"
          >
            Save
          </button>
        </div>
      </form>
    </section>
  );
}