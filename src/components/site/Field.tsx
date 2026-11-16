import type { ReactNode } from "react";
export function Field({ id, label, error, children }: { id: string; label: string; error?: string | undefined; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-xs font-semibold tracking-[0.15em] uppercase text-navy">{label}</label>
      {children}
      {error && <p id={`${id}-err`} role="alert" className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}
