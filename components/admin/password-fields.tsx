"use client";

import { useState } from "react";
import { Check, Copy, Eye, EyeOff, Wand2 } from "lucide-react";

const PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*?";

/** Contraseña aleatoria de 16 caracteres, sin los que se confunden (0/O, 1/l/I). */
export function generatePassword(length = 16) {
  const limit = 256 - (256 % PASSWORD_CHARS.length);
  const out: string[] = [];
  while (out.length < length) {
    for (const byte of crypto.getRandomValues(new Uint8Array(length * 2))) {
      if (byte < limit && out.length < length) out.push(PASSWORD_CHARS[byte % PASSWORD_CHARS.length]);
    }
  }
  return out.join("");
}

export interface PasswordPair { password: string; confirm: string }

export const passwordsMismatch = (value: PasswordPair) => value.confirm.length > 0 && value.confirm !== value.password;

/** Contraseña + confirmación, con botón Generar, copiar y ver/ocultar. */
export function PasswordFields({ value, onChange, idPrefix, autoFocus = false, label = "Contraseña" }: {
  value: PasswordPair;
  onChange: (next: PasswordPair) => void;
  idPrefix: string;
  autoFocus?: boolean;
  label?: string;
}) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const mismatch = passwordsMismatch(value);

  const generate = () => {
    const password = generatePassword();
    onChange({ password, confirm: password });
    setShow(true);
    setCopied(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(value.password)
      .then(() => { setCopied(true); setCopyError(false); window.setTimeout(() => setCopied(false), 1800); })
      .catch(() => setCopyError(true));
  };

  const eye = (
    <button
      type="button"
      onClick={() => setShow((current) => !current)}
      aria-label={show ? "Ocultar contraseña" : "Ver contraseña"}
      aria-pressed={show}
      className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-[rgba(242,243,245,0.5)] transition-colors hover:bg-white/5 hover:text-[#f2f3f5]"
    >
      {show ? <EyeOff size={17} /> : <Eye size={17} />}
    </button>
  );

  return (
    <>
      <div>
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <label htmlFor={`${idPrefix}-password`} className="text-sm font-medium">{label}</label>
          <button type="button" onClick={generate} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-[#1ec4ff] transition-colors hover:bg-[rgba(30,196,255,0.1)]">
            <Wand2 size={13} />Generar
          </button>
        </div>
        <div className="relative">
          <input
            id={`${idPrefix}-password`}
            required
            minLength={8}
            maxLength={128}
            autoFocus={autoFocus}
            type={show ? "text" : "password"}
            autoComplete="new-password"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="Mínimo 8 caracteres"
            value={value.password}
            onChange={(e) => onChange({ ...value, password: e.target.value })}
            className={`tk-input ${show && value.password ? "pr-20 font-mono" : "pr-11"}`}
          />
          {show && value.password && (
            <button type="button" onClick={copy} aria-label="Copiar contraseña" className="absolute right-10 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-[rgba(242,243,245,0.5)] transition-colors hover:bg-white/5 hover:text-[#f2f3f5]">
              {copied ? <Check size={16} className="text-[#4ade80]" /> : <Copy size={16} />}
            </button>
          )}
          {eye}
        </div>
        {copyError && <p className="mt-1.5 text-xs text-[#fbbf24]">No se pudo copiar. Selecciónala y cópiala a mano.</p>}
      </div>
      <div>
        <label htmlFor={`${idPrefix}-confirm`} className="mb-1.5 block text-sm font-medium">Confirmar contraseña</label>
        <div className="relative">
          <input
            id={`${idPrefix}-confirm`}
            required
            type={show ? "text" : "password"}
            autoComplete="new-password"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="Repite la contraseña"
            aria-invalid={mismatch || undefined}
            value={value.confirm}
            onChange={(e) => onChange({ ...value, confirm: e.target.value })}
            className={`tk-input pr-11 ${show ? "font-mono" : ""}`}
          />
          {eye}
        </div>
        {mismatch && <p className="mt-1.5 text-xs text-[#f87171]">Las contraseñas no coinciden.</p>}
      </div>
    </>
  );
}
