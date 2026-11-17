import { useEffect, useState } from "react";
import { Check, Copy, CreditCard, Eye, EyeOff, Lock, Snowflake, Wifi } from "lucide-react";
import { toast } from "sonner";
import { LogoMark } from "@/components/site/Logo";

const TEST_CARD_NUMBER = "4111 1111 1111 1111";

interface CardSettings {
  frozen: boolean;
  onlinePayments: boolean;
  atmWithdrawals: boolean;
}

const defaultSettings: CardSettings = {
  frozen: false,
  onlinePayments: true,
  atmWithdrawals: true,
};

export function CustomerDebitCard({ customerId, fullName, accountType }: {
  customerId: string;
  fullName: string;
  accountType: string;
}) {
  const storageKey = `pjtb_test_debit_card_${customerId}`;
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState<CardSettings>(defaultSettings);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (saved && typeof saved === "object") {
        setSettings({
          frozen: saved.frozen === true,
          onlinePayments: saved.onlinePayments !== false,
          atmWithdrawals: saved.atmWithdrawals !== false,
        });
      }
    } catch {
      // Keep the safe preview defaults when browser storage is unavailable.
    }
  }, [storageKey]);

  const updateSetting = (key: keyof CardSettings, value: boolean) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // The selected preview controls still apply for this session.
    }
  };

  const copyTestNumber = async () => {
    try {
      await navigator.clipboard.writeText(TEST_CARD_NUMBER);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
      toast.success("Test card number copied");
    } catch {
      toast.error("Your browser did not allow copying. You can select the number manually.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-display text-3xl font-bold text-ivory">Debit Card</h2>
          <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">Test preview</span>
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ivory/60">Explore the card experience with standard test details. No payment card has been issued and these details cannot be used for purchases.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <section aria-label="Test debit card preview" className="rounded-3xl border border-ivory/10 bg-ivory/[0.035] p-5 shadow-xl backdrop-blur-xl sm:p-7">
          <div className={`relative mx-auto aspect-[1.586/1] w-full max-w-[520px] overflow-hidden rounded-[28px] border p-6 shadow-2xl transition-all sm:p-8 ${settings.frozen ? "border-ivory/25 bg-navy-deep grayscale" : "border-gold/50 bg-gradient-to-br from-navy via-navy-deep to-navy"}`}>
            <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[38px] border-gold/10" />
            <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <LogoMark className="h-10 w-10" />
                  <div>
                    <p className="font-display text-lg font-bold tracking-wide text-ivory">PINNACLE J</p>
                    <p className="text-[9px] uppercase tracking-[0.24em] text-gold">Trust Bank</p>
                  </div>
                </div>
                <div className="text-right">
                  <Wifi className="ml-auto h-6 w-6 rotate-90 text-gold" />
                  <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-ivory/60">Test card</p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <div className="grid h-10 w-13 grid-cols-2 overflow-hidden rounded-lg border border-gold-soft/70 bg-gold/80 p-1 shadow-inner">
                  <span className="border-r border-gold-soft/70" /><span />
                  <span className="border-r border-t border-gold-soft/70" /><span className="border-t border-gold-soft/70" />
                </div>
                {settings.frozen && <span className="inline-flex items-center gap-1.5 rounded-full border border-ivory/25 bg-ivory/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-ivory"><Snowflake className="h-3 w-3" /> Frozen</span>}
              </div>

              <div className="mt-4">
                <p className="font-mono text-lg tracking-[0.12em] text-ivory sm:text-2xl sm:tracking-[0.16em]">{revealed ? TEST_CARD_NUMBER : "•••• •••• •••• 1111"}</p>
                <div className="mt-5 grid grid-cols-[1fr_auto_auto] items-end gap-5 sm:gap-8">
                  <div className="min-w-0">
                    <p className="text-[8px] uppercase tracking-[0.2em] text-ivory/45">Cardholder</p>
                    <p className="mt-1 truncate text-xs font-semibold uppercase tracking-wider text-ivory sm:text-sm">{fullName}</p>
                  </div>
                  <div>
                    <p className="text-[8px] uppercase tracking-[0.2em] text-ivory/45">Expires</p>
                    <p className="mt-1 font-mono text-xs text-ivory sm:text-sm">{revealed ? "12/30" : "••/••"}</p>
                  </div>
                  <div>
                    <p className="text-[8px] uppercase tracking-[0.2em] text-ivory/45">CVV</p>
                    <p className="mt-1 font-mono text-xs text-ivory sm:text-sm">{revealed ? "123" : "•••"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-5 flex max-w-[520px] flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-ivory/50">{accountType} · Test details only</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setRevealed(!revealed)} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-gold/35 bg-gold/10 px-3 py-2 text-xs font-semibold text-gold hover:bg-gold/20">
                {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}{revealed ? "Hide details" : "Show test details"}
              </button>
              <button type="button" onClick={() => void copyTestNumber()} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-ivory/15 px-3 py-2 text-xs font-semibold text-ivory/70 hover:bg-ivory/10" title="Copy standard test card number">
                {copied ? <Check className="h-4 w-4 text-gold" /> : <Copy className="h-4 w-4" />}<span className="hidden sm:inline">Copy</span>
              </button>
            </div>
          </div>
        </section>

        <section aria-labelledby="card-controls-heading" className="rounded-3xl border border-ivory/10 bg-ivory/[0.035] p-5 shadow-xl backdrop-blur-xl sm:p-7">
          <div className="flex items-center gap-3 border-b border-ivory/10 pb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10 text-gold"><CreditCard className="h-5 w-5" /></div>
            <div>
              <h3 id="card-controls-heading" className="font-display text-xl font-bold text-ivory">Card controls</h3>
              <p className="mt-0.5 text-xs text-ivory/50">Preview preferences saved on this device</p>
            </div>
          </div>

          <div className="divide-y divide-ivory/10">
            <CardToggle label="Freeze test card" description="Pause the preview payment controls" checked={settings.frozen} onChange={(value) => updateSetting("frozen", value)} icon={<Snowflake className="h-4 w-4" />} />
            <CardToggle label="Online payments" description="Preview online card availability" checked={settings.onlinePayments} disabled={settings.frozen} onChange={(value) => updateSetting("onlinePayments", value)} icon={<Lock className="h-4 w-4" />} />
            <CardToggle label="ATM withdrawals" description="Preview cash withdrawal availability" checked={settings.atmWithdrawals} disabled={settings.frozen} onChange={(value) => updateSetting("atmWithdrawals", value)} icon={<CreditCard className="h-4 w-4" />} />
          </div>

          <div className="mt-6 rounded-2xl border border-gold/25 bg-gold/[0.07] p-4">
            <p className="text-xs font-semibold text-gold">No real card is connected</p>
            <p className="mt-1.5 text-xs leading-relaxed text-ivory/60">These controls demonstrate the planned banking experience. They do not freeze a payment card or change any real payment settings.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

function CardToggle({ label, description, checked, disabled = false, onChange, icon }: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  icon: React.ReactNode;
}) {
  return (
    <div className={`flex items-center justify-between gap-4 py-5 ${disabled ? "opacity-45" : ""}`}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-gold">{icon}</span>
        <div>
          <p className="text-sm font-semibold text-ivory">{label}</p>
          <p className="mt-1 text-xs text-ivory/50">{description}</p>
        </div>
      </div>
      <button type="button" role="switch" aria-label={label} aria-checked={checked} disabled={disabled} onClick={() => onChange(!checked)} className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors ${checked ? "border-gold bg-gold" : "border-ivory/20 bg-ivory/10"} disabled:cursor-not-allowed`}>
        <span className={`absolute left-1 top-1 h-[18px] w-[18px] rounded-full bg-ivory shadow-sm transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );
}
