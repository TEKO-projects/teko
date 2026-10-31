"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Eye, Inbox, LoaderCircle, Paperclip, RefreshCw, Search, Send, TriangleAlert } from "lucide-react";
import { api, type AuditEmail, type AuditEmailDetail, type Mailbox } from "@/lib/admin-api";
import { Avatar, EmailFrame, Serif, displayName, formatFullDate, formatListTime, recipientsLabel, statusMeta } from "./emails/email-ui";

const PAGE_SIZE = 100;

type Direction = "all" | "inbound" | "outbound";

const directions: Array<{ key: Direction; label: string }> = [
  { key: "all", label: "Todo" },
  { key: "inbound", label: "Recibidos" },
  { key: "outbound", label: "Enviados" },
];

function Owners({ item }: { item: Pick<AuditEmail, "owners" | "scope"> }) {
  if (item.owners.length === 0) {
    return <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] font-medium text-[rgba(242,243,245,0.6)]">{item.scope === "general" ? "General" : "Sin buzón"}</span>;
  }
  return (
    <>
      {item.owners.map((address) => (
        <span key={address} className="rounded-full bg-[rgba(30,196,255,0.1)] px-2 py-0.5 text-[11px] font-medium text-[#8fd8ff]">{address}</span>
      ))}
    </>
  );
}

function Row({ item, selected, onSelect }: { item: AuditEmail; selected: boolean; onSelect: () => void }) {
  const inbound = item.direction === "inbound";
  const who = inbound ? displayName(item.from_email) : recipientsLabel(item.to_email);
  const status = statusMeta(item.status);
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected ? "true" : undefined}
      className={`flex w-full gap-3 rounded-xl px-3 py-3 text-left transition-colors ${selected ? "bg-[rgba(30,196,255,0.09)]" : "hover:bg-white/[0.035]"}`}
    >
      <span className="relative shrink-0">
        <Avatar label={who} size={34} />
        <span aria-hidden="true" className="absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-full border border-[#0a0d13] bg-[#161a22] text-[rgba(242,243,245,0.7)]">
          {inbound ? <Inbox size={9} /> : <Send size={9} />}
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-[rgba(242,243,245,0.88)]">
            <span className="font-normal text-[rgba(242,243,245,0.45)]">{inbound ? "De " : "Para "}</span>{who}
          </span>
          <time dateTime={item.created_at} className="shrink-0 text-[12px] tabular-nums text-[rgba(242,243,245,0.4)]">{formatListTime(item.created_at)}</time>
        </span>
        <span className="mt-0.5 flex items-center gap-1.5">
          <span className="min-w-0 flex-1 truncate text-[13px] text-[rgba(242,243,245,0.68)]">{item.subject || "(sin asunto)"}</span>
          {item.has_attachments && <Paperclip size={12} className="shrink-0 text-[rgba(242,243,245,0.4)]" />}
        </span>
        <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <Owners item={item} />
          {!inbound && (
            <span className="inline-flex items-center gap-1 text-[11.5px] text-[rgba(242,243,245,0.45)]">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: status.color }} />{status.label}
            </span>
          )}
        </span>
      </span>
    </button>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[84px_minmax(0,1fr)] gap-3 py-1.5 text-[13px]">
      <dt className="text-[rgba(242,243,245,0.42)]">{label}</dt>
      <dd className="min-w-0 break-words text-[rgba(242,243,245,0.86)]">{children}</dd>
    </div>
  );
}

function Detail({ email, onBack }: { email: AuditEmailDetail; onBack: () => void }) {
  const status = statusMeta(email.status);
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-white/[0.06] px-3">
        <button type="button" onClick={onBack} aria-label="Volver a la lista" className="grid h-8 w-8 place-items-center rounded-lg text-[rgba(242,243,245,0.6)] hover:bg-white/[0.06] lg:hidden"><ArrowLeft size={17} /></button>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-1 text-[12px] font-medium text-[rgba(242,243,245,0.7)]">
          <Eye size={13} />Solo lectura
        </span>
        <p className="ml-auto text-[12px] text-[rgba(242,243,245,0.4)]">Consultar no marca el correo como leído.</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[820px] px-6 py-8">
          <h2 className="text-[22px] font-semibold leading-tight tracking-[-0.02em]">{email.subject || "(sin asunto)"}</h2>
          <dl className="mt-5 divide-y divide-white/[0.05] rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-2">
            <Meta label="Buzón"><span className="flex flex-wrap gap-1.5"><Owners item={email} /></span></Meta>
            <Meta label={email.direction === "inbound" ? "Recibido" : "Enviado"}>{formatFullDate(email.created_at)}</Meta>
            <Meta label="De">{email.from_email}</Meta>
            <Meta label="Para">{email.to_email || "—"}</Meta>
            {email.cc && <Meta label="Cc">{email.cc}</Meta>}
            {email.bcc && <Meta label="Cco">{email.bcc}</Meta>}
            {email.direction === "outbound" && (
              <Meta label="Estado"><span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full" style={{ background: status.color }} />{status.label}</span></Meta>
            )}
            {email.has_attachments && <Meta label="Adjuntos"><span className="inline-flex items-center gap-1.5"><Paperclip size={13} />Tiene archivos adjuntos</span></Meta>}
          </dl>
          {email.error_message && (
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-[rgba(251,191,36,0.08)] p-3 text-[13px] text-[#fbbf24]"><TriangleAlert size={15} className="mt-0.5 shrink-0" />{email.error_message}</p>
          )}
          <div className="mt-6">
            {email.html_body ? (
              <EmailFrame key={email.id} html={email.html_body} title={email.subject || "Correo"} />
            ) : email.text_body ? (
              <p className="max-w-[68ch] whitespace-pre-wrap text-[15px] leading-[1.7] text-[rgba(242,243,245,0.86)]">{email.text_body}</p>
            ) : (
              <p className="text-[13px] text-[rgba(242,243,245,0.45)]">Este correo no tiene contenido guardado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuditModule() {
  const [items, setItems] = useState<AuditEmail[]>([]);
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
  const [direction, setDirection] = useState<Direction>("all");
  const [mailbox, setMailbox] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<AuditEmailDetail | null>(null);
  const [detailError, setDetailError] = useState("");
  const listRequest = useRef(0);
  const openRequest = useRef(0);

  useEffect(() => {
    api<Mailbox[]>("/admin/mailboxes").then(setMailboxes).catch(() => undefined);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const params = useCallback((offset: number) => {
    const values = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) });
    if (direction !== "all") values.set("direction", direction);
    if (mailbox) values.set("mailbox", mailbox);
    if (query) values.set("search", query);
    return values.toString();
  }, [direction, mailbox, query]);

  const load = useCallback(async () => {
    const id = ++listRequest.current;
    setLoading(true);
    setError("");
    try {
      const page = await api<AuditEmail[]>(`/admin/audit/emails?${params(0)}`);
      if (id !== listRequest.current) return;
      setItems(page);
      setHasMore(page.length === PAGE_SIZE);
    } catch (e) {
      if (id === listRequest.current) setError((e as Error).message);
    } finally {
      if (id === listRequest.current) setLoading(false);
    }
  }, [params]);

  useEffect(() => { Promise.resolve().then(load); }, [load]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const page = await api<AuditEmail[]>(`/admin/audit/emails?${params(items.length)}`);
      setItems((current) => [...current, ...page]);
      setHasMore(page.length === PAGE_SIZE);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoadingMore(false);
    }
  };

  const open = async (item: AuditEmail) => {
    const id = ++openRequest.current;
    setSelectedId(item.id);
    setDetail(null);
    setDetailError("");
    try {
      const loaded = await api<AuditEmailDetail>(`/admin/audit/emails/${item.id}`);
      if (id === openRequest.current) setDetail(loaded);
    } catch (e) {
      if (id === openRequest.current) setDetailError((e as Error).message);
    }
  };

  const sortedMailboxes = useMemo(() => [...mailboxes].sort((a, b) => a.address.localeCompare(b.address)), [mailboxes]);
  const detailOpen = selectedId !== null;

  return (
    <section aria-label="Auditoría de correos">
      <div className="mb-5">
        <p className="text-sm font-medium text-[#1ec4ff]">Correo del equipo</p>
        <h1 className="text-2xl font-bold">Auditoría de <Serif>correos</Serif></h1>
        <p className="mt-1 max-w-[70ch] text-sm" style={{ color: "rgba(242,243,245,0.5)" }}>
          Todo lo que reciben y envían los usuarios, en solo lectura. Aquí puedes revisar cualquier buzón; para leer y responder tu propio correo usa Correos.
        </p>
      </div>

      <div className="relative flex h-[calc(100dvh-17rem)] min-h-[480px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0d13] text-[#f2f3f5]">
        <div className={`${detailOpen ? "hidden lg:flex" : "flex"} w-full shrink-0 flex-col border-r border-white/[0.06] lg:w-[400px] xl:w-[440px]`}>
          <div className="shrink-0 space-y-2.5 border-b border-white/[0.06] p-3">
            <div role="tablist" aria-label="Dirección" className="flex rounded-lg bg-white/[0.04] p-0.5">
              {directions.map((item) => (
                <button key={item.key} role="tab" aria-selected={direction === item.key} type="button" onClick={() => setDirection(item.key)}
                  className={`flex-1 rounded-md py-1.5 text-[12.5px] font-medium transition-colors ${direction === item.key ? "bg-white/[0.09] text-[#f2f3f5]" : "text-[rgba(242,243,245,0.55)] hover:text-[#f2f3f5]"}`}>
                  {item.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <label className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 focus-within:border-[rgba(30,196,255,0.5)]">
                <Search size={14} className="shrink-0 text-[rgba(242,243,245,0.35)]" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar remitente, destino o asunto" aria-label="Buscar" className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-[rgba(242,243,245,0.3)]" />
              </label>
              <button type="button" onClick={load} aria-label="Actualizar" title="Actualizar" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/[0.08] text-[rgba(242,243,245,0.6)] hover:bg-white/[0.05] hover:text-[#f2f3f5]">
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
            <select value={mailbox} onChange={(e) => setMailbox(e.target.value)} aria-label="Buzón" className="tk-input !h-9 !py-0 !text-[13px]">
              <option value="" style={{ background: "#0d1017" }}>Todos los buzones</option>
              <option value="general" style={{ background: "#0d1017" }}>General (dirección compartida)</option>
              {sortedMailboxes.map((box) => (
                <option key={box.id} value={box.address} style={{ background: "#0d1017" }}>{box.display_name} · {box.address}</option>
              ))}
            </select>
          </div>

          <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-2">
            {error ? (
              <p className="m-2 rounded-lg bg-[rgba(248,113,113,0.1)] p-3 text-[13px] text-[#fca5a5]">{error}</p>
            ) : loading && items.length === 0 ? (
              [1, 2, 3, 4].map((key) => <div key={key} className="m-1 h-[86px] animate-pulse rounded-xl bg-white/[0.04]" />)
            ) : items.length === 0 ? (
              <p className="px-6 pt-16 text-center text-[13px] leading-relaxed text-[rgba(242,243,245,0.45)]">{query || mailbox || direction !== "all" ? "Ningún correo coincide con estos filtros." : "Todavía no hay correos."}</p>
            ) : (
              <>
                {items.map((item) => <Row key={item.id} item={item} selected={selectedId === item.id} onSelect={() => open(item)} />)}
                {hasMore && (
                  <button type="button" onClick={loadMore} disabled={loadingMore} className="mx-auto mt-2 flex h-9 items-center gap-2 rounded-lg px-4 text-[13px] font-medium text-[#1ec4ff] hover:bg-[rgba(30,196,255,0.08)] disabled:opacity-60">
                    {loadingMore && <LoaderCircle size={14} className="animate-spin" />}Cargar más
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className={`${detailOpen ? "flex" : "hidden lg:flex"} min-w-0 flex-1 flex-col bg-[#080a0f]`}>
          {detail ? (
            <Detail email={detail} onBack={() => { setSelectedId(null); setDetail(null); }} />
          ) : selectedId !== null && !detailError ? (
            <div className="mx-auto w-full max-w-[820px] px-8 pt-20"><div className="h-6 w-3/5 animate-pulse rounded bg-white/[0.07]" /><div className="mt-8 h-72 animate-pulse rounded-xl bg-white/[0.04]" /></div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center px-8 text-center">
              <Eye size={22} className="text-[rgba(242,243,245,0.25)]" />
              <p className="mt-4 text-[19px] font-semibold tracking-[-0.02em]">{detailError ? "No se pudo abrir" : <>Elige un correo para <Serif>revisarlo</Serif></>}</p>
              <p className="mt-2 max-w-[44ch] text-[13px] leading-relaxed text-[rgba(242,243,245,0.45)]">{detailError || "Se muestra completo, con quién lo envió, a quién y en qué buzón está."}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
