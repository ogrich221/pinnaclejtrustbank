import { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { toast } from "sonner";

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English (US)", flag: "🇺🇸" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "zh", name: "Chinese (Simplified)", nativeName: "简体中文", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇦🇪" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
];

export function LanguageSelector({ variant = "header" }: { variant?: "header" | "mobile" }) {
  const [selectedLang, setSelectedLang] = useState<LanguageOption>(LANGUAGES[0]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load persisted language from localStorage
  useEffect(() => {
    try {
      const savedCode = localStorage.getItem("pj_bank_preferred_lang");
      if (savedCode) {
        const found = LANGUAGES.find((l) => l.code === savedCode);
        if (found) setSelectedLang(found);
      }
    } catch {
      // localStorage may not be accessible in some environments
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (lang: LanguageOption) => {
    setSelectedLang(lang);
    setIsOpen(false);
    try {
      localStorage.setItem("pj_bank_preferred_lang", lang.code);
    } catch {
      // ignore
    }
    toast.success(`Language updated to ${lang.name} (${lang.nativeName})`, {
      description: "Interface preferences have been saved.",
      duration: 3000,
    });
  };

  if (variant === "mobile") {
    return (
      <div className="w-full">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gold">Select Language (10 Available)</p>
        <div className="grid grid-cols-2 gap-2">
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLang.code === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang)}
                className={`flex items-center gap-2 rounded-lg border p-2.5 text-left text-xs transition-colors ${
                  isSelected
                    ? "border-gold bg-gold/15 text-gold font-medium"
                    : "border-ivory/10 bg-navy/60 text-ivory/80 hover:border-gold/40"
                }`}
              >
                <span className="text-base">{lang.flag}</span>
                <span className="truncate">{lang.nativeName}</span>
                {isSelected && <Check className="ml-auto h-3.5 w-3.5 shrink-0 text-gold" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select website language"
        className="group inline-flex items-center gap-2 rounded-full border border-ivory/15 bg-navy-deep/80 px-3 py-1.5 text-xs text-ivory/90 backdrop-blur-md transition-all duration-200 hover:border-gold/60 hover:bg-navy hover:text-ivory shadow-sm"
      >
        <Globe className="h-3.5 w-3.5 text-gold transition-transform duration-300 group-hover:rotate-45" />
        <span className="text-sm leading-none">{selectedLang.flag}</span>
        <span className="font-medium tracking-wide">{selectedLang.nativeName}</span>
        <span className="rounded bg-gold/15 px-1 py-0.5 text-[10px] font-semibold uppercase text-gold">
          {selectedLang.code}
        </span>
        <ChevronDown
          className={`h-3 w-3 text-ivory/60 transition-transform duration-200 ${isOpen ? "rotate-180 text-gold" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 origin-top-left rounded-xl border border-gold/30 bg-navy-deep/95 p-1.5 text-ivory shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="border-b border-ivory/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-gold flex items-center justify-between">
            <span>Choose Language</span>
            <span className="text-[10px] text-ivory/50">10 Global Languages</span>
          </div>

          <div className="max-h-72 overflow-y-auto py-1 scrollbar-thin">
            {LANGUAGES.map((lang) => {
              const isSelected = selectedLang.code === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                    isSelected
                      ? "bg-gold/20 text-gold font-semibold"
                      : "text-ivory/80 hover:bg-ivory/10 hover:text-ivory"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{lang.flag}</span>
                    <div className="flex flex-col">
                      <span className="leading-tight">{lang.nativeName}</span>
                      <span className="text-[10px] text-ivory/50">{lang.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-ivory/40">{lang.code}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-gold" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="border-t border-ivory/10 px-3 py-2 text-[10px] text-ivory/50">
            Real-time multi-currency settlement supported in all regions.
          </div>
        </div>
      )}
    </div>
  );
}
