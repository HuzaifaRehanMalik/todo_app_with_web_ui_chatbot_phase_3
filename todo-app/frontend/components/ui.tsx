"use client";

import {
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import Link from "next/link";

/* ------------------------------------------------------------------
   Ultra-light line icons (1.25 stroke). Hand-drawn to keep the bundle
   free of icon libraries.
------------------------------------------------------------------- */
const ICON_PATHS = {
  arrow: "M7 17 17 7M9 7h8v8",
  arrowLeft: "M19 12H5m6-6-6 6 6 6",
  check: "m5 12.5 4.5 4.5L19 7.5",
  plus: "M12 5v14M5 12h14",
  close: "M6 6l12 12M18 6 6 18",
  pencil: "M4 20h4L19 9l-4-4L4 16v4Zm9-13 4 4",
  trash: "M5 7h14M10 7V5h4v2m-7 0 1 12h8l1-12",
  undo: "M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3",
  download: "M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 20h14",
  mail: "M4 6h16v12H4zM4 7l8 6 8-6",
  lock: "M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0",
  eye: "M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Zm9.5 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  eyeOff: "M3 3l18 18M10.6 6.1A9.6 9.6 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-3 3.6M6.6 7.5A16.5 16.5 0 0 0 2.5 12s3.5 6 9.5 6a9 9 0 0 0 4-.9M9.9 9.9a3 3 0 0 0 4.2 4.2",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v4.5l3 2",
  spark: "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6",
  chat: "M4 5h16v11H9l-5 4V5Z",
  send: "M4 12 20 4l-4 16-4-7-8-1Z",
  logout: "M15 12H4m0 0 4-4m-4 4 4 4M14 4h5v16h-5",
  alert: "M12 8v5m0 3.5v.01M12 3 2 20h20L12 3Z",
  leaf: "M5 19c0-8 5-14 15-14 0 10-6 15-14 15M5 19l7-7",
} as const;

export type IconName = keyof typeof ICON_PATHS;

export function Icon({
  name,
  className = "w-4 h-4",
  strokeWidth = 1.25,
}: {
  name: IconName;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

/* ------------------------------------------------------------------
   Double-bezel enclosure: outer tray + inner machined core.
------------------------------------------------------------------- */
export function Bezel({
  children,
  className = "",
  coreClassName = "",
  tone = "light",
}: {
  children: ReactNode;
  className?: string;
  coreClassName?: string;
  tone?: "light" | "ink";
}) {
  const shell =
    tone === "ink"
      ? "bg-sage/[0.08] ring-1 ring-sage/20"
      : "bg-ink/[0.035] ring-1 ring-ink/[0.06]";
  const core =
    tone === "ink"
      ? "accent-scope bg-ink text-paper shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_30px_60px_-30px_rgba(0,0,0,0.8)]"
      : "bg-card shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_30px_60px_-30px_rgba(0,0,0,0.8)]";
  return (
    <div className={`rounded-[2rem] p-1.5 ${shell} ${className}`}>
      <div className={`rounded-[calc(2rem-0.375rem)] h-full ${core} ${coreClassName}`}>
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Eyebrow tag.
------------------------------------------------------------------- */
export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full bg-ink/[0.04] ring-1 ring-ink/[0.07] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-ink-soft ${className}`}
    >
      <span className="h-1 w-1 rounded-full bg-sage" />
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------
   IntersectionObserver reveal. Fade-up + de-blur on first entry.
------------------------------------------------------------------- */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
    >
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------
   Island pill button with nested trailing icon (button-in-button).
------------------------------------------------------------------- */
type Variant = "ink" | "ghost" | "sage" | "clay";

const VARIANTS: Record<Variant, { btn: string; nub: string }> = {
  ink: {
    btn: "bg-ink text-paper hover:bg-ink/90",
    nub: "bg-paper/10 text-paper",
  },
  ghost: {
    btn: "bg-card text-ink ring-1 ring-ink/10 hover:ring-ink/20",
    nub: "bg-ink/[0.06] text-ink",
  },
  sage: {
    btn: "bg-sage text-on-accent hover:bg-sage/90",
    nub: "bg-on-accent/10 text-on-accent",
  },
  clay: {
    btn: "bg-clay text-paper hover:bg-clay/90",
    nub: "bg-paper/15 text-paper",
  },
};

const pillBase =
  "group inline-flex items-center justify-between gap-3 rounded-full pl-6 pr-1.5 py-1.5 text-sm font-medium tracking-tight transition-all duration-500 ease-spring active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none";

function Nub({ icon, variant, spinning }: { icon: IconName; variant: Variant; spinning?: boolean }) {
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-transform duration-500 ease-spring group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105 ${VARIANTS[variant].nub}`}
    >
      {spinning ? (
        <span className="h-3.5 w-3.5 rounded-full border border-current border-t-transparent animate-spin" />
      ) : (
        <Icon name={icon} className="w-4 h-4" strokeWidth={1.5} />
      )}
    </span>
  );
}

export function PillButton({
  children,
  icon = "arrow",
  variant = "ink",
  loading,
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: IconName;
  variant?: Variant;
  loading?: boolean;
}) {
  return (
    <button {...rest} className={`${pillBase} ${VARIANTS[variant].btn} ${className}`}>
      <span>{children}</span>
      <Nub icon={icon} variant={variant} spinning={loading} />
    </button>
  );
}

export function PillLink({
  href,
  children,
  icon = "arrow",
  variant = "ink",
  className = "",
}: {
  href: string;
  children: ReactNode;
  icon?: IconName;
  variant?: Variant;
  className?: string;
}) {
  return (
    <Link href={href} className={`${pillBase} ${VARIANTS[variant].btn} ${className}`}>
      <span>{children}</span>
      <Nub icon={icon} variant={variant} />
    </Link>
  );
}

/* ------------------------------------------------------------------
   Inputs — recessed wells inside a bezel.
------------------------------------------------------------------- */
const fieldBase =
  "w-full rounded-2xl bg-paper/70 px-4 py-3.5 text-[15px] text-ink placeholder:text-muted/80 ring-1 ring-ink/[0.07] shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] outline-none transition-all duration-500 ease-spring focus:bg-card focus:ring-ink/25 disabled:opacity-50";

export function Field({
  label,
  hint,
  icon,
  trailing,
  id,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: ReactNode;
  icon?: IconName;
  trailing?: ReactNode;
}) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-2 flex items-baseline justify-between text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">
          {label}
          {hint && <span className="normal-case tracking-normal text-muted">{hint}</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-muted">
            <Icon name={icon} />
          </span>
        )}
        <input id={id} {...rest} className={`${fieldBase} ${icon ? "pl-11" : ""} ${trailing ? "pr-12" : ""}`} />
        {trailing && <span className="absolute inset-y-0 right-2 flex items-center">{trailing}</span>}
      </div>
    </div>
  );
}

export function TextArea({
  label,
  hint,
  id,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; hint?: ReactNode }) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-2 flex items-baseline justify-between text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">
          {label}
          {hint && <span className="normal-case tracking-normal text-muted">{hint}</span>}
        </label>
      )}
      <textarea id={id} {...rest} className={`${fieldBase} resize-none`} />
    </div>
  );
}

export function PasswordToggle({
  shown,
  onToggle,
  disabled,
}: {
  shown: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-label={shown ? "Hide password" : "Show password"}
      className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-all duration-500 ease-spring hover:bg-ink/[0.05] hover:text-ink"
    >
      <Icon name={shown ? "eyeOff" : "eye"} />
    </button>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="animate-rise flex items-start gap-3 rounded-2xl bg-clay-soft/70 px-4 py-3 text-sm text-clay ring-1 ring-clay/15">
      <Icon name="alert" className="mt-0.5 w-4 h-4 shrink-0" />
      <span className="leading-relaxed">{children}</span>
    </div>
  );
}
