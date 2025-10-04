'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/SupabaseClient';

type Salesperson = {
  email: string;
  created_at: string | null;
  created_by: string | null;
};

const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Profile() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [rows, setRows] = useState<Salesperson[]>([]);
  const [inputEmail, setInputEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initials = useMemo(() => {
    if (userEmail) {
      const base = userEmail.split('@')[0] || '';
      return base.slice(0, 2).toUpperCase();
    }
    return 'AD';
  }, [userEmail]);



  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      // Get auth user (works if session is present)
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user ?? null;
      if (mounted) {
        setUserEmail(user?.email ?? null);
        setAvatarUrl(
          (user?.user_metadata?.avatar_url as string) ||
            (user?.user_metadata?.picture as string) ||
            null
        );
      }

      // If not authenticated, show empty list
      if (!user) {
        if (mounted) {
          setRows([]);
          setLoading(false);
        }
        return;
      }

      // Load only salespersons created by the current admin
      const { data, error } = await supabase
        .from('salespersons')
        .select('email, created_at, created_by')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (mounted) {
        if (error) {
          setError(error.message);
        } else {
          setRows((data || []).map((r) => ({ ...r, email: r.email.toLowerCase() })));
        }
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);



//   const handleAdd = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);

//     const email = inputEmail.trim().toLowerCase();
//     if (!emailRegex.test(email)) {
//       setError('Enter a valid email.');
//       return;
//     }
//     if (rows.some((r) => r.email === email)) {
//       setError('Email already exists.');
//       return;
//     }

//     setAdding(true);
//     // Insert or update on conflict (unique on email)
//     const { data, error } = await supabase
//       .from('salespersons')
//       .upsert([{ email }], { onConflict: 'email' })
//       .select('email, created_at, created_by')
//       .single();

//     if (error) {
//       setError(error.message);
//     } else if (data) {
//       setRows((prev) => {
//         const without = prev.filter((r) => r.email !== email);
//         return [{ ...data, email: data.email.toLowerCase() }, ...without];
//       });
//       setInputEmail('');
//     }
//     setAdding(false);
//   };


  // ...existing code...
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const email = inputEmail.trim().toLowerCase();
    if (!emailRegex.test(email)) {
      setError('Enter a valid email.');
      return;
    }
    if (rows.some((r) => r.email === email)) {
      setError('Email already exists.');
      return;
    }

    setAdding(true);
    // Ensure we have a logged-in user
    const { data: authRes, error: authErr } = await supabase.auth.getUser();
    if (authErr || !authRes?.user) {
      setError('Not authenticated.');
      setAdding(false);
      return;
    }
    const uid = authRes.user.id;

    // Upsert with created_by so it passes RLS
    const { data, error } = await supabase
      .from('salespersons')
      .upsert([{ email, created_by: uid }], { onConflict: 'email' })
      .select('email, created_at, created_by')
      .single();

    if (error) {
      setError(error.message);
    } else if (data) {
      setRows((prev) => {
        const without = prev.filter((r) => r.email !== email);
        return [{ ...data, email: data.email.toLowerCase() }, ...without];
      });
      setInputEmail('');
    }
    setAdding(false);
  };
// ...existing code...


  const handleDelete = async (email: string) => {
    setError(null);
    setDeleting(email);
    const { error } = await supabase.from('salespersons').delete().eq('email', email);
    if (error) {
      setError(error.message);
    } else {
      setRows((prev) => prev.filter((r) => r.email !== email));
    }
    setDeleting(null);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <span className="text-sm font-semibold text-gray-600">{initials}</span>
            )}
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">Admin</div>
            <div className="text-sm text-gray-600">{userEmail ?? '—'}</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200/70 bg-white p-5">
        <h2 className="text-base font-semibold text-gray-900">Manage Salespeople</h2>
        <p className="mt-1 text-sm text-gray-600">
          Add an email to grant dashboard access. Emails are unique.
        </p>

        <form onSubmit={handleAdd} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            value={inputEmail}
            onChange={(e) => setInputEmail(e.target.value)}
            placeholder="sales.person@company.co.ke"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
          <button
            type="submit"
            disabled={adding}
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
          >
            {adding ? 'Adding…' : 'Add / Upsert'}
          </button>
        </form>

        {error && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Email</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Added</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td className="px-3 py-3 text-gray-500" colSpan={3}>
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-3 py-3 text-gray-500" colSpan={3}>
                    No salesperson emails yet.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.email}>
                    <td className="px-3 py-3 text-gray-900">{r.email}</td>
                    <td className="px-3 py-3 text-gray-600">
                      {r.created_at ? new Date(r.created_at).toLocaleString() : '—'}
                    </td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => handleDelete(r.email)}
                        disabled={deleting === r.email}
                        className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"
                      >
                        {deleting === r.email ? 'Removing…' : 'Remove'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}