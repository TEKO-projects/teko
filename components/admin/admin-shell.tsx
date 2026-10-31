"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AtSign, BarChart3, BriefcaseBusiness, CircleDollarSign, Eye, EyeOff, FileQuestion, Fingerprint, FolderKanban, Lock, LogOut, Mail, Menu, MessageSquareText, KeyRound, ScanSearch, Search, ShieldCheck, Trash2, Users, X } from "lucide-react";
import { api, type AdminUser, type ContactRequest, type DashboardStats } from "@/lib/admin-api";
import { useAdminAuth } from "./auth-provider";
import { modules } from "./cms-config";
import { EmailsModule } from "./emails-module";
import { AuditModule } from "./audit-module";
import { MailboxesModule } from "./mailboxes-module";
import { PasswordFields, passwordsMismatch, type PasswordPair } from "./password-fields";
import { NotificationsBell } from "./notifications-bell";
import { PasskeysButton } from "./passkeys-button";
import { changePasswordWithPasskey, isCancelled, usePasskeysSupported } from "@/lib/passkeys";
import { RecordModule } from "./record-module";

const nav = [
  { key: "dashboard", label: "Dashboard", icon: BarChart3 },
  { key: "contacts", label: "Solicitudes", icon: MessageSquareText },
  { key: "emails", label: "Correos", icon: Mail },
  { key: "mailboxes", label: "Ad. de Correos", icon: AtSign },
  { key: "audit", label: "Auditoría", icon: ScanSearch },
  { key: "services", label: "Servicios", icon: BriefcaseBusiness },
  { key: "service-categories", label: "Categorias de servicios", icon: FolderKanban },
  { key: "faqs", label: "FAQs", icon: FileQuestion },
  { key: "plans", label: "Planes", icon: CircleDollarSign },
  { key: "budget-ranges", label: "Presupuestos", icon: CircleDollarSign },
  { key: "portfolio-projects", label: "Portfolio", icon: FolderKanban },
  { key: "portfolio-categories", label: "Categorias portfolio", icon: FolderKanban },
  { key: "admins", label: "Administradores", icon: Users },
];

export function AdminShell() {
  const { user, loading, login, loginWithPasskey, logout } = useAdminAuth();
  const [active, setActive] = useState("dashboard");
  const [mobile, setMobile] = useState(false);
  const [unread, setUnread] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [mailboxesKey, setMailboxesKey] = useState(0);

  const refreshUnread = useCallback(() => {
    api<{ unread: number }>("/admin/emails/unread-count")
      .then((result) => setUnread(result.unread))
      .catch(() => setUnread(0));
  }, []);

  const refreshRequests = useCallback(() => {
    api<unknown[]>("/admin/mailboxes/requests")
      .then((list) => setPendingRequests(list.length))
      .catch(() => setPendingRequests(0));
  }, []);

  useEffect(() => { if (user) { refreshUnread(); refreshRequests(); } }, [user, refreshUnread, refreshRequests]);

  const openModule = useCallback((module: string) => {
    // Abrir desde un aviso recarga el módulo para que muestre la solicitud nueva.
    if (module === "mailboxes") setMailboxesKey((value) => value + 1);
    setActive(module);
    setMobile(false);
  }, []);

  if (loading) return (
    <div className="grid min-h-screen place-items-center" style={{ background: "#080a0f" }}>
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: "#1ec4ff", borderTopColor: "transparent" }} />
    </div>
  );

  if (!user) return <Login onLogin={login} onPasskey={loginWithPasskey} />;

  const selectedModule = modules.find((item) => item.key === active);

  return (
    <div className="min-h-screen" style={{ background: "#080a0f", color: "#f2f3f5" }}>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r transition-transform lg:translate-x-0 ${mobile ? "translate-x-0" : "-translate-x-full"}`}
        style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}
      >
        <div className="flex h-20 items-center justify-between border-b px-6" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <Image src="/LogoTeko.png" width={100} height={34} alt="TEKO" className="h-8 w-auto" />
          <button onClick={() => setMobile(false)} className="lg:hidden" style={{ color: "rgba(242,243,245,0.5)" }}>
            <X />
          </button>
        </div>

        <nav className="h-[calc(100vh-10rem)] overflow-y-auto p-4">
          {nav.map((item) => (
            <button
              key={item.key}
              onClick={() => { setActive(item.key); setMobile(false); }}
              className="mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors"
              style={{
                background: active === item.key ? "rgba(30,196,255,0.12)" : "transparent",
                color: active === item.key ? "#1ec4ff" : "rgba(242,243,245,0.6)",
              }}
              onMouseEnter={(e) => { if (active !== item.key) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={(e) => { if (active !== item.key) e.currentTarget.style.background = "transparent"; }}
            >
              <item.icon size={18} />
              <span className="flex-1">{item.label}</span>
              {item.key === "emails" && unread > 0 && (
                <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: "#1ec4ff", color: "#080a0f" }}>
                  {unread}
                </span>
              )}
              {item.key === "mailboxes" && pendingRequests > 0 && (
                <span title={`${pendingRequests} solicitudes de correo`} className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: "#1ec4ff", color: "#080a0f" }}>
                  {pendingRequests}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full border-t p-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl p-3 text-sm transition-colors"
            style={{ color: "#f87171" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(248,113,113,0.12)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <LogOut size={18} />
            Cerrar sesion
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobile && <button aria-label="Cerrar menu" onClick={() => setMobile(false)} className="fixed inset-0 z-30 bg-black/50 lg:hidden" />}

      {/* Main area */}
      <div className="lg:pl-72">
        <header
          className="sticky top-0 z-20 flex h-20 items-center justify-between border-b px-4 backdrop-blur lg:px-8"
          style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(8,10,15,0.85)" }}
        >
          <button onClick={() => setMobile(true)} className="rounded-lg p-2 lg:hidden" style={{ color: "rgba(242,243,245,0.6)" }}>
            <Menu />
          </button>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold" style={{ color: "#f2f3f5" }}>Panel administrativo</p>
            <p className="text-xs" style={{ color: "rgba(242,243,245,0.45)" }}>Contenido real de TEKO</p>
          </div>
          <div className="flex items-center gap-3">
            <PasskeysButton />
            <NotificationsBell onNavigate={openModule} onActivity={refreshRequests} />
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold" style={{ color: "#f2f3f5" }}>{user.full_name}</p>
              <p className="text-xs" style={{ color: "rgba(242,243,245,0.45)" }}>{user.email}</p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-full text-sm font-bold" style={{ background: "#1ec4ff", color: "#080a0f" }}>
              {user.full_name.charAt(0)}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl p-4 lg:p-8">
          {active === "dashboard" ? <Dashboard /> : active === "contacts" ? <Contacts /> : active === "emails" ? <EmailsModule onUnreadChange={refreshUnread} /> : active === "audit" ? <AuditModule /> : active === "mailboxes" ? <MailboxesModule key={mailboxesKey} onRequestsChange={refreshRequests} /> : active === "admins" ? <Admins current={user} /> : selectedModule ? <RecordModule config={selectedModule} /> : null}
        </main>
      </div>
    </div>
  );
}

// Entradas del login: borde y anillo de foco con clases, para que se vean igual con teclado, ratón y autocompletado.
const loginInput = "h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] text-[15px] text-[#f2f3f5] outline-none transition-[border-color,box-shadow] placeholder:text-[rgba(242,243,245,0.3)] hover:border-white/20 focus:border-[rgba(30,196,255,0.6)] focus:bg-white/[0.06] disabled:opacity-60 aria-[invalid=true]:border-[rgba(248,113,113,0.5)] [&:-webkit-autofill]:[-webkit-text-fill-color:#f2f3f5] [&:-webkit-autofill]:shadow-[inset_0_0_0_100px_#11151d]";

function RecoveryCard({ mode, token, onBack, onDone }: { mode: "forgot" | "reset"; token: string; onBack: () => void; onDone: (message: string) => void }) {
  const [email, setEmail] = useState("");
  const [pair, setPair] = useState<PasswordPair>({ password: "", confirm: "" });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const forgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await api("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email: email.trim() }) });
      setSent(true);
    } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  };

  const reset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (pair.password !== pair.confirm) { setError("Las contraseñas no coinciden."); return; }
    setBusy(true);
    setError("");
    try {
      await api("/auth/reset-password", { method: "POST", body: JSON.stringify({ token, password: pair.password }) });
      onDone("Contraseña actualizada. Ya puedes iniciar sesión.");
    } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  };

  const card = "w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-[#f2f3f5] shadow-2xl";
  const errorBox = error && <p role="alert" className="mt-5 rounded-xl border border-[rgba(248,113,113,0.25)] bg-[rgba(248,113,113,0.1)] p-3 text-sm text-[#f87171]">{error}</p>;

  if (mode === "reset") {
    return (
      <form onSubmit={reset} className={card}>
        <Image src="/LogoTeko.png" width={120} height={40} alt="TEKO" className="mb-10 h-10 w-auto" />
        <p className="text-sm font-medium text-[#1ec4ff]">Recuperar acceso</p>
        <h2 className="mt-1 text-3xl font-bold">Crea tu nueva contraseña</h2>
        <p className="mt-2 text-sm text-[rgba(242,243,245,0.5)]">El enlace funciona una sola vez.</p>
        {errorBox}
        <div className="mt-6 space-y-4">
          <PasswordFields value={pair} onChange={(next) => { setPair(next); setError(""); }} idPrefix="reset" autoFocus label="Nueva contraseña" />
        </div>
        <button disabled={busy || passwordsMismatch(pair)} className="mt-7 w-full rounded-xl bg-[#1ec4ff] py-3 font-semibold text-[#080a0f] transition-all hover:brightness-110 disabled:opacity-60">
          {busy ? "Guardando..." : "Guardar contraseña"}
        </button>
        <button type="button" onClick={onBack} className="mt-4 w-full rounded-lg py-2 text-sm text-[rgba(242,243,245,0.6)] transition-colors hover:text-[#f2f3f5]">Volver al inicio de sesión</button>
      </form>
    );
  }

  return (
    <form onSubmit={forgot} className={card}>
      <Image src="/LogoTeko.png" width={120} height={40} alt="TEKO" className="mb-10 h-10 w-auto" />
      <p className="text-sm font-medium text-[#1ec4ff]">Recuperar acceso</p>
      <h2 className="mt-1 text-3xl font-bold">¿Olvidaste tu contraseña?</h2>
      <p className="mt-2 text-sm text-[rgba(242,243,245,0.5)]">Escribe tu correo y te enviamos un enlace para crear una nueva.</p>
      {sent ? (
        <p role="status" className="mt-6 rounded-xl border border-[rgba(74,222,128,0.25)] bg-[rgba(74,222,128,0.1)] p-4 text-sm leading-relaxed text-[#4ade80]">
          Si ese correo tiene una cuenta, te enviamos un enlace. Revisa tu bandeja (y el spam); vence en 30 minutos.
        </p>
      ) : (
        <>
          {errorBox}
          <div className="mt-6">
            <label htmlFor="forgot-email" className="mb-2 block text-sm font-medium">Correo</label>
            <input id="forgot-email" required type="email" inputMode="email" autoComplete="username" autoCapitalize="none" spellCheck={false} autoFocus placeholder="nombre@teko.do" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} className="tk-input h-12" />
          </div>
          <button disabled={busy} className="mt-7 w-full rounded-xl bg-[#1ec4ff] py-3 font-semibold text-[#080a0f] transition-all hover:brightness-110 disabled:opacity-60">
            {busy ? "Enviando..." : "Enviar enlace"}
          </button>
        </>
      )}
      <button type="button" onClick={onBack} className="mt-4 w-full rounded-lg py-2 text-sm text-[rgba(242,243,245,0.6)] transition-colors hover:text-[#f2f3f5]">Volver al inicio de sesión</button>
    </form>
  );
}

function Login({ onLogin, onPasskey }: { onLogin: (email: string, password: string, remember: boolean) => Promise<void>; onPasskey: (remember: boolean) => Promise<void> }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [resetToken] = useState(() => (typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("reset") ?? ""));
  const [mode, setMode] = useState<"login" | "forgot" | "reset">(resetToken ? "reset" : "login");
  const [notice, setNotice] = useState("");
  const passkeysSupported = usePasskeysSupported();

  const passkey = async () => {
    setBusy(true);
    setError("");
    try { await onPasskey(remember); } catch (err) { if (!isCancelled(err)) setError((err as Error).message); } finally { setBusy(false); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try { await onLogin(email, password, remember); } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-2" style={{ background: "#080a0f" }}>
      {/* Left: decorative */}
      <div className="relative hidden overflow-hidden lg:block" style={{ background: "linear-gradient(135deg, #080a0f, #0a1628)" }}>
        <div aria-hidden="true" className="absolute inset-0" style={{ background: "radial-gradient(60% 60% at 30% 80%, rgba(30,196,255,0.12), transparent 70%)" }} />
        <div className="absolute bottom-16 left-16 max-w-lg" style={{ color: "#f2f3f5" }}>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[.25em]" style={{ color: "#1ec4ff" }}>TEKO CMS</p>
          <h1 className="text-5xl font-bold leading-tight">Gestiona lo que tus clientes ven.</h1>
          <p className="mt-5 text-lg" style={{ color: "rgba(242,243,245,0.55)" }}>Un unico lugar para contenido, solicitudes y catalogo.</p>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center p-6">
        {mode !== "login" ? (
          <RecoveryCard
            mode={mode}
            token={resetToken}
            onBack={() => setMode("login")}
            onDone={(message) => { setNotice(message); setMode("login"); if (typeof window !== "undefined" && resetToken) window.history.replaceState(null, "", window.location.pathname); }}
          />
        ) : (
          <form
            onSubmit={submit}
            className="w-full max-w-md rounded-3xl border p-8 shadow-2xl"
            style={{
              borderColor: "rgba(255,255,255,0.1)",
              background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
              color: "#f2f3f5",
            }}
          >
            <Image src="/LogoTeko.png" width={120} height={40} alt="TEKO" className="mb-10 h-10 w-auto" />
            <p className="text-sm font-medium" style={{ color: "#1ec4ff" }}>Administración</p>
            <h2 className="mt-1 text-3xl font-bold">Bienvenido de vuelta</h2>
            <p className="mt-2 text-sm" style={{ color: "rgba(242,243,245,0.5)" }}>Ingresa con tu cuenta administrativa.</p>

            {notice && !error && (
              <p role="status" className="mt-5 rounded-xl border p-3 text-sm" style={{ borderColor: "rgba(74,222,128,0.25)", background: "rgba(74,222,128,0.1)", color: "#4ade80" }}>{notice}</p>
            )}
            {error && (
              <p className="mt-5 rounded-xl border p-3 text-sm" style={{ borderColor: "rgba(248,113,113,0.25)", background: "rgba(248,113,113,0.1)", color: "#f87171" }}>
                {error}
              </p>
            )}

            <div className="mt-8">
              <label htmlFor="login-email" className="mb-2 block text-sm font-medium">Correo</label>
              <div className="group relative">
                <Mail size={17} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(242,243,245,0.35)] transition-colors group-focus-within:text-[#1ec4ff]" />
                <input
                  id="login-email"
                  required
                  type="email"
                  name="email"
                  inputMode="email"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  autoFocus
                  disabled={busy}
                  placeholder="nombre@teko.do"
                  aria-invalid={Boolean(error) || undefined}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  className={loginInput + " pl-11 pr-4"}
                />
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="login-password" className="mb-2 block text-sm font-medium">Contraseña</label>
              <div className="group relative">
                <Lock size={17} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(242,243,245,0.35)] transition-colors group-focus-within:text-[#1ec4ff]" />
                <input
                  id="login-password"
                  required
                  minLength={8}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  disabled={busy}
                  placeholder="Tu contraseña"
                  aria-invalid={Boolean(error) || undefined}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  onKeyUp={(e) => setCapsLock(e.getModifierState("CapsLock"))}
                  onBlur={() => setCapsLock(false)}
                  className={loginInput + " pl-11 pr-12"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  aria-pressed={showPassword}
                  className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-[rgba(242,243,245,0.5)] transition-colors hover:bg-white/5 hover:text-[#f2f3f5] focus-visible:outline-2 focus-visible:outline-[#1ec4ff]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {capsLock && <p role="status" className="mt-2 text-xs" style={{ color: "#fbbf24" }}>Tienes las mayúsculas activadas.</p>}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm" style={{ color: "rgba(242,243,245,0.7)" }}>
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="tk-check" />
                Mantener sesión iniciada
              </label>
              <button type="button" onClick={() => { setError(""); setNotice(""); setMode("forgot"); }} className="rounded-md text-sm font-medium text-[#1ec4ff] transition-colors hover:text-[#7ddcff]">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button
              disabled={busy}
              className="mt-7 w-full rounded-xl py-3 font-semibold transition-all hover:brightness-110 disabled:opacity-60"
              style={{ background: "#1ec4ff", color: "#080a0f", boxShadow: "0 8px 24px -6px rgba(30,196,255,0.45)" }}
            >
              {busy ? "Verificando..." : "Iniciar sesión"}
            </button>

            {passkeysSupported && (
              <>
                <div className="my-4 flex items-center gap-3 text-xs" style={{ color: "rgba(242,243,245,0.4)" }}>
                  <span className="h-px flex-1 bg-current opacity-30" />o<span className="h-px flex-1 bg-current opacity-30" />
                </div>
                <button
                  type="button"
                  onClick={passkey}
                  disabled={busy}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border py-3 font-semibold transition-all hover:bg-white/5 disabled:opacity-60"
                  style={{ borderColor: "rgba(30,196,255,0.4)", color: "#1ec4ff" }}
                >
                  <Fingerprint size={18} /> Entrar con Touch ID / passkey
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </main>
  );
}

function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<DashboardStats>("/admin/dashboard").then(setStats).catch((e: Error) => setError(e.message));
  }, []);

  const cards = stats ? [
    { label: "Solicitudes", value: stats.contact_requests },
    { label: "Nuevas", value: stats.new_requests },
    { label: "Calificadas", value: stats.qualified_requests },
    { label: "Servicios activos", value: stats.active_services },
    { label: "Proyectos activos", value: stats.active_projects },
    { label: "FAQs activas", value: stats.active_faqs },
    { label: "Planes activos", value: stats.active_plans },
  ] : [];

  return (
    <section>
      <p className="text-sm font-medium" style={{ color: "#1ec4ff" }}>Resumen</p>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-1" style={{ color: "rgba(242,243,245,0.5)" }}>Estado actual del contenido y las oportunidades.</p>
      {error && <p className="mt-6" style={{ color: "#f87171" }}>{error}</p>}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats ? cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border p-5"
            style={{
              borderColor: "rgba(255,255,255,0.1)",
              background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
            }}
          >
            <p className="text-sm" style={{ color: "rgba(242,243,245,0.5)" }}>{card.label}</p>
            <p className="mt-2 text-3xl font-bold" style={{ color: "#f2f3f5" }}>{card.value}</p>
          </div>
        )) : [1, 2, 3, 4].map((n) => (
          <div key={n} className="h-28 animate-pulse rounded-2xl" style={{ background: "rgba(255,255,255,0.06)" }} />
        ))}
      </div>
    </section>
  );
}

const statuses = ["new", "contacted", "qualified", "closed", "discarded"];

function Contacts() {
  const [items, setItems] = useState<ContactRequest[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<ContactRequest | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = useCallback(() => {
    setError("");
    api<ContactRequest[]>("/admin/contact-requests").then(setItems).catch((e: Error) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { Promise.resolve().then(load); }, [load]);

  const filtered = useMemo(() =>
    items.filter((item) => (status === "all" || item.status === status) && JSON.stringify(item).toLowerCase().includes(search.toLowerCase())),
    [items, search, status],
  );

  const change = async (item: ContactRequest, value: string) => {
    if (updatingId !== null) return;
    setUpdatingId(item.id);
    setError("");
    setSuccess("");
    try {
      await api(`/admin/contact-requests/${item.id}/status`, { method: "PATCH", body: JSON.stringify({ status: value }) });
      setSuccess("Estado actualizado correctamente.");
      load();
    } catch (e) { setError((e as Error).message); } finally { setUpdatingId(null); }
  };

  return (
    <section>
      <h1 className="text-2xl font-bold">Solicitudes de contacto</h1>
      <p className="text-sm" style={{ color: "rgba(242,243,245,0.5)" }}>Busca, filtra, revisa y califica oportunidades reales.</p>

      <div className="my-6 flex flex-wrap gap-3">
        <label
          className="flex min-w-64 flex-1 items-center gap-2 rounded-xl border px-3"
          style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}
        >
          <Search size={16} style={{ color: "rgba(242,243,245,0.35)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nombre, email, empresa..."
            className="w-full bg-transparent py-3 outline-none"
            style={{ color: "#f2f3f5" }}
          />
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border px-4"
          style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#f2f3f5" }}
        >
          <option value="all" style={{ background: "#0d1017" }}>Todos los estados</option>
          {statuses.map((s) => <option key={s} style={{ background: "#0d1017" }}>{s}</option>)}
        </select>
      </div>

      {error && <p className="mb-4" style={{ color: "#f87171" }}>{error}</p>}
      {success && <p className="mb-4 rounded-xl p-3 text-sm" style={{ background: "rgba(74,222,128,0.12)", color: "#4ade80" }}>{success}</p>}

      {loading ? (
        <div className="h-48 animate-pulse rounded-2xl" style={{ background: "rgba(255,255,255,0.06)" }} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}>
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead style={{ background: "rgba(255,255,255,0.04)" }}>
              <tr className="text-xs uppercase" style={{ color: "rgba(242,243,245,0.4)" }}>
                {["Contacto", "Servicio", "Presupuesto", "Fecha", "Estado"].map((h) => <th key={h} className="p-4">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ ["--tw-divide-color" as string]: "rgba(255,255,255,0.06)" }}>
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className="cursor-pointer transition-colors"
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <td className="p-4">
                    <b style={{ color: "#f2f3f5" }}>{item.name}</b>
                    <br />
                    <span className="text-xs" style={{ color: "rgba(242,243,245,0.45)" }}>{item.email} · {item.company || "Sin empresa"}</span>
                  </td>
                  <td className="p-4">{item.service || "—"}</td>
                  <td className="p-4">{item.budget || "—"}</td>
                  <td className="p-4">{new Date(item.created_at).toLocaleDateString("es")}</td>
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      disabled={updatingId !== null}
                      value={item.status}
                      onChange={(e) => change(item, e.target.value)}
                      className="rounded-lg border px-2 py-1 disabled:opacity-50"
                      style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#f2f3f5" }}
                    >
                      {statuses.map((s) => <option key={s} style={{ background: "#0d1017" }}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="p-10 text-center" style={{ color: "rgba(242,243,245,0.4)" }}>No hay solicitudes para estos filtros.</p>}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setSelected(null)}>
          <article
            onClick={(e) => e.stopPropagation()}
            className="h-full w-full max-w-lg overflow-y-auto p-7 shadow-2xl"
            style={{ background: "#0d1017", color: "#f2f3f5" }}
          >
            <button onClick={() => setSelected(null)} className="float-right" style={{ color: "rgba(242,243,245,0.5)" }}><X /></button>
            <p className="text-sm font-semibold" style={{ color: "#1ec4ff" }}>Solicitud #{selected.id}</p>
            <h2 className="mt-2 text-2xl font-bold">{selected.name}</h2>
            <p className="mt-1" style={{ color: "rgba(242,243,245,0.6)" }}>{selected.email}</p>
            <dl className="mt-8 grid grid-cols-2 gap-5 text-sm">
              <div><dt style={{ color: "rgba(242,243,245,0.45)" }}>Empresa</dt><dd>{selected.company || "—"}</dd></div>
              <div><dt style={{ color: "rgba(242,243,245,0.45)" }}>Telefono</dt><dd>{selected.phone || "—"}</dd></div>
              <div><dt style={{ color: "rgba(242,243,245,0.45)" }}>Servicio</dt><dd>{selected.service || "—"}</dd></div>
              <div><dt style={{ color: "rgba(242,243,245,0.45)" }}>Presupuesto</dt><dd>{selected.budget || "—"}</dd></div>
            </dl>
            <div className="mt-8 rounded-xl p-5" style={{ background: "rgba(255,255,255,0.04)" }}>
              <p className="mb-2 text-xs font-semibold uppercase" style={{ color: "rgba(242,243,245,0.4)" }}>Mensaje</p>
              <p className="whitespace-pre-wrap">{selected.message}</p>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}

function Admins({ current }: { current: AdminUser }) {
  const [items, setItems] = useState<AdminUser[]>([]);
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [passwordFor, setPasswordFor] = useState<AdminUser | null>(null);

  const load = useCallback(() => api<AdminUser[]>("/admin/admin-users").then(setItems).catch((e: Error) => setError(e.message)), []);
  useEffect(() => { Promise.resolve().then(load); }, [load]);

  const toggle = async (item: AdminUser) => {
    if (busyId !== null) return;
    setBusyId(item.id);
    setError("");
    setSuccess("");
    try {
      await api(`/admin/admin-users/${item.id}/status`, { method: "PATCH", body: JSON.stringify({ is_active: !item.is_active }) });
      setSuccess("Estado del administrador actualizado.");
      load();
    } catch (e) { setError((e as Error).message); } finally { setBusyId(null); }
  };

  const remove = async (item: AdminUser) => {
    if (busyId !== null) return;
    setBusyId(item.id);
    setError("");
    setSuccess("");
    try {
      await api(`/admin/admin-users/${item.id}`, { method: "DELETE" });
      setSuccess(`${item.full_name} fue eliminado.`);
      setConfirmId(null);
      load();
    } catch (e) { setError((e as Error).message); setConfirmId(null); } finally { setBusyId(null); }
  };

  return (
    <section>
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">Administradores</h1>
          <p className="text-sm" style={{ color: "rgba(242,243,245,0.5)" }}>Acceso al CMS sin exponer credenciales.</p>
        </div>
        <button
          onClick={() => { setSuccess(""); setShow(true); }}
          className="rounded-xl px-4 py-2 text-sm font-semibold transition-all hover:brightness-110"
          style={{ background: "#1ec4ff", color: "#080a0f" }}
        >
          Nuevo admin
        </button>
      </div>
      {error && <p className="my-4" style={{ color: "#f87171" }}>{error}</p>}
      {success && <p className="my-4 rounded-xl p-3 text-sm" style={{ background: "rgba(74,222,128,0.12)", color: "#4ade80" }}>{success}</p>}
      <div className="mt-6 grid gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-2xl border p-5"
            style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}
          >
            <div>
              <p className="font-semibold">
                {item.full_name}
                {item.id === current.id && <span className="text-xs" style={{ color: "#1ec4ff" }}> (tu)</span>}
              </p>
              <p className="text-sm" style={{ color: "rgba(242,243,245,0.5)" }}>{item.email} · {item.role}</p>
            </div>
            <div className="flex items-center gap-2">
              {confirmId === item.id ? (
                <span className="flex items-center gap-2 text-xs" style={{ color: "rgba(242,243,245,0.7)" }}>
                  ¿Eliminar a {item.full_name}?
                  <button disabled={busyId !== null} onClick={() => remove(item)} className="rounded-lg px-3 py-1.5 font-semibold disabled:opacity-60" style={{ background: "rgba(248,113,113,0.14)", color: "#f87171" }}>
                    {busyId === item.id ? "Eliminando..." : "Sí, eliminar"}
                  </button>
                  <button onClick={() => setConfirmId(null)} className="rounded-lg px-2 py-1.5 hover:bg-white/5">No</button>
                </span>
              ) : (
                <>
                  <button
                    disabled={busyId !== null}
                    onClick={() => { setError(""); setSuccess(""); setPasswordFor(item); }}
                    aria-label={`Cambiar contraseña de ${item.full_name}`}
                    title="Cambiar contraseña (pide tu huella)"
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs transition-colors hover:bg-white/5 disabled:opacity-40"
                    style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(242,243,245,0.7)" }}
                  >
                    <KeyRound size={13} />Contraseña
                  </button>
                  <button
                    disabled={item.id === current.id || busyId !== null}
                    onClick={() => toggle(item)}
                    className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-40"
                    style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(242,243,245,0.7)" }}
                  >
                    {busyId === item.id ? "Guardando..." : item.is_active ? "Desactivar" : "Activar"}
                  </button>
                  <button
                    disabled={item.id === current.id || busyId !== null}
                    onClick={() => { setError(""); setSuccess(""); setConfirmId(item.id); }}
                    aria-label={`Eliminar a ${item.full_name}`}
                    title={item.id === current.id ? "No puedes eliminar tu propia cuenta" : "Eliminar administrador"}
                    className="grid h-8 w-8 place-items-center rounded-lg border transition-colors hover:bg-[rgba(248,113,113,0.12)] hover:text-[#f87171] disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-inherit"
                    style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(242,243,245,0.7)" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      {passwordFor && (
        <ChangePasswordForm
          target={passwordFor}
          self={passwordFor.id === current.id}
          close={() => setPasswordFor(null)}
          done={() => { setSuccess(`La contraseña de ${passwordFor.full_name} fue cambiada.`); setPasswordFor(null); }}
        />
      )}
      {show && <AdminForm close={() => setShow(false)} saved={() => { setShow(false); setSuccess("Administrador creado correctamente."); load(); }} />}
    </section>
  );
}

function ChangePasswordForm({ target, self, close, done }: { target: AdminUser; self: boolean; close: () => void; done: () => void }) {
  const [pair, setPair] = useState<PasswordPair>({ password: "", confirm: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const supported = usePasskeysSupported();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape" && !saving) close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, saving]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (pair.password !== pair.confirm) { setError("Las contraseñas no coinciden."); return; }
    setSaving(true);
    setError("");
    try {
      await changePasswordWithPasskey(target.id, pair.password);
      done();
    } catch (err) {
      setError(isCancelled(err) ? "Cancelaste la confirmación con tu huella. No se cambió nada." : (err as Error).message);
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/60 p-4 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) close(); }}>
      <form
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-password-title"
        className="tk-modal w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1017] p-6 text-[#f2f3f5] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#1ec4ff]">Seguridad</p>
            <h2 id="change-password-title" className="mt-0.5 text-xl font-bold">Cambiar contraseña</h2>
            <p className="mt-1 truncate text-sm text-[rgba(242,243,245,0.55)]">{self ? "Tu cuenta" : target.full_name} · {target.email}</p>
          </div>
          <button type="button" onClick={close} disabled={saving} aria-label="Cerrar" className="grid h-8 w-8 place-items-center rounded-lg text-[rgba(242,243,245,0.5)] transition-colors hover:bg-white/[0.06] hover:text-[#f2f3f5]"><X size={18} /></button>
        </div>

        {error && <p role="alert" className="mt-4 rounded-xl border border-[rgba(248,113,113,0.25)] bg-[rgba(248,113,113,0.1)] p-3 text-sm text-[#f87171]">{error}</p>}

        <div className="mt-5 space-y-4">
          <PasswordFields value={pair} onChange={(next) => { setPair(next); setError(""); }} idPrefix="change" autoFocus label="Nueva contraseña" />
        </div>

        <p className="mt-5 flex items-start gap-2 rounded-xl bg-white/[0.03] px-3 py-2.5 text-[13px] leading-relaxed text-[rgba(242,243,245,0.55)]">
          <Fingerprint size={15} className="mt-0.5 shrink-0 text-[#1ec4ff]" />
          {supported
            ? "Para confirmar te pediremos tu huella (o el passkey de tu dispositivo). Es la tuya, no la de la otra persona."
            : "Este navegador no permite confirmar con huella. Abre el CMS en un dispositivo con Touch ID, Windows Hello o llave de seguridad."}
        </p>

        <div className="mt-6 flex gap-3">
          <button type="button" onClick={close} disabled={saving} className="h-11 rounded-xl border border-white/10 px-4 text-sm text-[rgba(242,243,245,0.7)] transition-colors hover:bg-white/5">Cancelar</button>
          <button disabled={saving || !supported || passwordsMismatch(pair)} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#1ec4ff] font-semibold text-[#080a0f] transition-all hover:brightness-110 disabled:opacity-60">
            <Fingerprint size={17} />{saving ? "Esperando tu huella..." : "Confirmar con huella"}
          </button>
        </div>
      </form>
    </div>
  );
}

function AdminForm({ close, saved }: { close: () => void; saved: () => void }) {
  const [form, setForm] = useState({ full_name: "", email: "" });
  const [pair, setPair] = useState<PasswordPair>({ password: "", confirm: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const mismatch = passwordsMismatch(pair);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (pair.password !== pair.confirm) { setError("Las contraseñas no coinciden."); return; }
    setSaving(true);
    setError("");
    try {
      await api("/admin/admin-users", { method: "POST", body: JSON.stringify({ full_name: form.full_name.trim(), email: form.email.trim(), password: pair.password, role: "admin" }) });
      saved();
    } catch (err) { setError((err as Error).message); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/60 p-4 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <form
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-admin-title"
        className="tk-modal w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1017] p-6 text-[#f2f3f5] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#1ec4ff]">Acceso al CMS</p>
            <h2 id="new-admin-title" className="mt-0.5 text-xl font-bold">Nuevo administrador</h2>
          </div>
          <button type="button" onClick={close} aria-label="Cerrar" className="grid h-8 w-8 place-items-center rounded-lg text-[rgba(242,243,245,0.5)] transition-colors hover:bg-white/[0.06] hover:text-[#f2f3f5]"><X size={18} /></button>
        </div>

        {error && <p role="alert" className="mt-4 rounded-xl border border-[rgba(248,113,113,0.25)] bg-[rgba(248,113,113,0.1)] p-3 text-sm text-[#f87171]">{error}</p>}

        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="admin-name" className="mb-1.5 block text-sm font-medium">Nombre completo</label>
            <input id="admin-name" required minLength={2} maxLength={150} autoFocus autoComplete="off" placeholder="Ana Pérez" value={form.full_name} onChange={(e) => { setForm((old) => ({ ...old, full_name: e.target.value })); setError(""); }} className="tk-input" />
          </div>
          <div>
            <label htmlFor="admin-email" className="mb-1.5 block text-sm font-medium">Correo</label>
            <input id="admin-email" required type="email" inputMode="email" autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder="nombre@teko.do" value={form.email} onChange={(e) => { setForm((old) => ({ ...old, email: e.target.value })); setError(""); }} className="tk-input" />
          </div>
          <PasswordFields value={pair} onChange={(next) => { setPair(next); setError(""); }} idPrefix="admin" />
        </div>

        <p className="mt-5 flex items-center gap-2 rounded-xl bg-white/[0.03] px-3 py-2.5 text-[13px] text-[rgba(242,243,245,0.55)]">
          <ShieldCheck size={15} className="shrink-0 text-[#1ec4ff]" />
          Tendrá acceso completo al CMS como administrador.
        </p>

        <div className="mt-6 flex gap-3">
          <button type="button" onClick={close} className="h-11 rounded-xl border border-white/10 px-4 text-sm text-[rgba(242,243,245,0.7)] transition-colors hover:bg-white/5">Cancelar</button>
          <button disabled={saving || mismatch} className="h-11 flex-1 rounded-xl bg-[#1ec4ff] font-semibold text-[#080a0f] transition-all hover:brightness-110 disabled:opacity-60">
            {saving ? "Creando..." : "Crear administrador"}
          </button>
        </div>
      </form>
    </div>
  );
}
