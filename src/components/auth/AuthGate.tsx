import { FormEvent, useEffect, useState } from "react";
import type { PublicUser } from "../../lib/auth/sheetsUserAuth.server";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function refreshSession() {
    try {
      const response = await fetch("/api/auth/me", { credentials: "same-origin", cache: "no-store" });
      if (response.ok) {
        const payload = await response.json();
        setUser(payload.user ?? null);
      } else setUser(null);
    } catch { setUser(null); }
    finally { setChecking(false); }
  }

  useEffect(() => { void refreshSession(); }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Sign-in failed.");
      setUser(payload.user);
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally { setBusy(false); }
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    } finally {
      setUser(null);
    }
  }

  if (checking) return <main className="min-h-screen grid place-items-center bg-[#0b0f19] text-amber-100">Checking secure session…</main>;

  if (!user) return (
    <main className="min-h-screen grid place-items-center bg-[#0b0f19] px-4 py-10 text-slate-100">
      <section className="w-full max-w-md rounded-2xl border border-amber-300/20 bg-slate-900/90 p-8 shadow-2xl">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-amber-300/30 bg-amber-300/10 text-2xl text-amber-300">ॐ</div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">Mahavtaar</p>
          <h1 className="mt-2 font-serif text-3xl text-white">Panchanga</h1>
          <p className="mt-2 text-sm text-slate-400">Sign in to continue</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <label className="block text-sm text-slate-300">User ID
            <input autoComplete="username" required value={username} onChange={(e) => setUsername(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none focus:border-amber-400" />
          </label>
          <label className="block text-sm text-slate-300">Password
            <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none focus:border-amber-400" />
          </label>
          {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
          <button disabled={busy} className="w-full rounded-lg bg-amber-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-amber-300 disabled:opacity-60">
            {busy ? "Signing in…" : "Sign in securely"}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-slate-500">Access is managed by your Panchanga administrator.</p>
      </section>
    </main>
  );

  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-end gap-3 border-b border-slate-700 bg-[#0b0f19] px-4 py-2 text-sm text-slate-300">
        <span>{user.fullName || user.username}</span>
        <button type="button" onClick={handleLogout} className="rounded-md border border-amber-300/30 px-3 py-1.5 text-amber-200 hover:bg-amber-300/10">Sign out</button>
      </div>
      {children}
    </div>
  );
}
