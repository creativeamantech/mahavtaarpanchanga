import React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Clock,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { VedicTermTooltip } from "../VedicTermTooltip";
import type { Language } from "../../i18n";
import type { AppTheme } from "../../types";

export type SemanticState =
  | "neutral"
  | "auspicious"
  | "inauspicious"
  | "caution"
  | "info"
  | "saffron";

/* ─── 1. Card ─────────────────────────────────────────────────────────────── */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "flat" | "raised" | "hero";
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "raised",
      padding = "md",
      interactive = false,
      className = "",
      children,
      ...props
    },
    ref,
  ) => {
    const padClasses = {
      none: "p-0",
      sm: "p-3.5 sm:p-4",
      md: "p-4 sm:p-5",
      lg: "p-5 sm:p-6",
    }[padding];

    const variantClasses = {
      flat: "bg-surface-2/80 border border-border-subtle rounded-[14px]",
      raised:
        "bg-surface-1 border border-border-subtle rounded-[14px] shadow-[0_1px_2px_rgba(24,24,27,0.05),0_4px_12px_rgba(24,24,27,0.04)]",
      hero: "bg-surface-1 border border-saffron/35 rounded-[20px] shadow-[0_10px_30px_-8px_rgba(24,24,27,0.12)] relative overflow-hidden",
    }[variant];

    const interactiveClasses = interactive
      ? "transition-all duration-150 hover:border-saffron/50 hover:shadow-md cursor-pointer active:scale-[0.99]"
      : "";

    return (
      <div
        ref={ref}
        className={`${variantClasses} ${padClasses} ${interactiveClasses} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Card.displayName = "Card";

/* ─── 2. SectionHeader ────────────────────────────────────────────────────── */
export interface SectionHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  icon,
  action,
  className = "",
}) => (
  <div className={`flex items-center justify-between gap-3 mb-3.5 ${className}`}>
    <div className="flex items-center gap-2.5 min-w-0">
      {icon && (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-saffron-lt text-saffron">
          {icon}
        </span>
      )}
      <div className="min-w-0">
        <h2 className="type-heading text-text-1 font-devanagari truncate">{title}</h2>
        {subtitle && (
          <p className="type-caption text-text-2 font-devanagari truncate mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
    </div>
    {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
  </div>
);

/* ─── 3. Chip / Badge ─────────────────────────────────────────────────────── */
export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: SemanticState;
  size?: "sm" | "md";
  withIcon?: boolean;
}

export const Chip: React.FC<ChipProps> = ({
  variant = "neutral",
  size = "sm",
  withIcon = false,
  className = "",
  children,
  ...props
}) => {
  const variantStyles: Record<SemanticState, string> = {
    neutral: "bg-surface-2 text-text-2 border-border-subtle",
    auspicious: "bg-auspicious-subtle text-auspicious border-auspicious/25",
    inauspicious: "bg-inauspicious-subtle text-inauspicious border-inauspicious/25",
    caution: "bg-caution-subtle text-caution border-caution/25",
    info: "bg-info-subtle text-info border-info/25",
    saffron: "bg-saffron-lt text-saffron border-saffron/30",
  };

  const sizeStyles =
    size === "sm"
      ? "px-2 py-0.5 text-xs font-semibold rounded-md gap-1"
      : "px-2.5 py-1 text-sm font-semibold rounded-lg gap-1.5";

  const StateIcon = {
    neutral: null,
    auspicious: CheckCircle2,
    inauspicious: XCircle,
    caution: AlertTriangle,
    info: Info,
    saffron: Clock,
  }[variant];

  return (
    <span
      className={`inline-flex items-center border font-devanagari leading-snug ${variantStyles[variant]} ${sizeStyles} ${className}`}
      {...props}
    >
      {withIcon && StateIcon && <StateIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
      <span>{children}</span>
    </span>
  );
};

export const Badge = Chip;

/* ─── 4. StatTile ─────────────────────────────────────────────────────────── */
export interface StatTileProps {
  label: React.ReactNode;
  value: React.ReactNode;
  sublabel?: React.ReactNode;
  nextLabel?: React.ReactNode;
  state?: SemanticState;
  badgeText?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const StatTile: React.FC<StatTileProps> = ({
  label,
  value,
  sublabel,
  nextLabel,
  state = "neutral",
  badgeText,
  icon,
  onClick,
  className = "",
}) => {
  const accentBorder: Record<SemanticState, string> = {
    neutral: "border-border-subtle",
    auspicious: "border-auspicious/35",
    inauspicious: "border-inauspicious/35",
    caution: "border-caution/35",
    info: "border-info/35",
    saffron: "border-saffron/40",
  };

  const Component = onClick ? "button" : "div";

  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`text-left bg-surface-1 border ${accentBorder[state]} rounded-[14px] p-3.5 sm:p-4 shadow-[0_1px_2px_rgba(24,24,27,0.04)] flex flex-col justify-between transition-all ${
        onClick
          ? "hover:border-saffron/50 hover:shadow-md cursor-pointer active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-saffron"
          : ""
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          {icon && <span className="text-saffron shrink-0">{icon}</span>}
          <span className="type-caption uppercase tracking-wider text-text-3 font-semibold truncate">
            {label}
          </span>
        </div>
        {badgeText && (
          <Chip variant={state} size="sm">
            {badgeText}
          </Chip>
        )}
      </div>

      <div className="my-1">
        <div className="text-base sm:text-lg font-bold text-text-1 font-devanagari leading-snug">
          {value}
        </div>
        {sublabel && (
          <div className="type-caption text-text-2 tabular-time mt-0.5 font-devanagari">
            {sublabel}
          </div>
        )}
      </div>

      {nextLabel && (
        <div className="mt-2 pt-2 border-t border-border-subtle/70 type-caption text-text-3 font-devanagari truncate">
          {nextLabel}
        </div>
      )}
    </Component>
  );
};

/* ─── 5. TimeRange ────────────────────────────────────────────────────────── */
export interface TimeRangeProps {
  start: string;
  end: string;
  duration?: string;
  state?: SemanticState;
  label?: string;
  isRunningNow?: boolean;
  className?: string;
}

export const TimeRange: React.FC<TimeRangeProps> = ({
  start,
  end,
  duration,
  state = "neutral",
  label,
  isRunningNow = false,
  className = "",
}) => {
  return (
    <div
      className={`inline-flex items-center gap-2 flex-wrap tabular-time ${
        isRunningNow ? "ring-2 ring-saffron/50 rounded-lg px-2 py-0.5 bg-saffron-lt/50" : ""
      } ${className}`}
    >
      <span className="text-sm font-semibold text-text-1">
        {start} – {end}
      </span>
      {duration && <span className="type-caption text-text-3">({duration})</span>}
      {label && (
        <Chip variant={state} size="sm" withIcon>
          {label}
        </Chip>
      )}
    </div>
  );
};

/* ─── 6. CountdownRing ────────────────────────────────────────────────────── */
export interface CountdownRingProps {
  /** 0 to 100 */
  progressPercent: number;
  label: string;
  state?: SemanticState;
  size?: number;
}

export const CountdownRing: React.FC<CountdownRingProps> = ({
  progressPercent,
  label,
  state = "saffron",
  size = 44,
}) => {
  const clamped = Math.max(0, Math.min(100, progressPercent));
  const strokeWidth = 3.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  const strokeColor: Record<SemanticState, string> = {
    neutral: "var(--text-3)",
    auspicious: "var(--auspicious)",
    inauspicious: "var(--inauspicious)",
    caution: "var(--caution)",
    info: "var(--info)",
    saffron: "var(--saffron)",
  };

  return (
    <div className="inline-flex items-center gap-2.5 shrink-0">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="var(--border-subtle)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={strokeColor[state]}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <span className="absolute text-xs font-bold tabular-time text-text-1">
          {Math.round(clamped)}%
        </span>
      </div>
      <span className="text-xs sm:text-sm font-bold tabular-time text-text-1">{label}</span>
    </div>
  );
};

/* ─── 7. Segmented Control ────────────────────────────────────────────────── */
export interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: string;
}

export interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (val: T) => void;
  ariaLabel: string;
  className?: string;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className = "",
}: SegmentedProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`inline-flex items-center rounded-xl bg-surface-2 p-1 border border-border-subtle overflow-x-auto max-w-full cat-nav-scroll ${className}`}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold font-devanagari transition-all shrink-0 cursor-pointer min-h-[36px] ${
              active
                ? "bg-surface-1 text-text-1 shadow-xs border border-border-subtle"
                : "text-text-2 hover:text-text-1"
            }`}
          >
            {opt.icon}
            <span>{opt.label}</span>
            {opt.badge && (
              <span className="px-1.5 py-0.5 rounded bg-saffron-lt text-saffron text-xs font-bold">
                {opt.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ─── 8. IconButton (enforces ariaLabel + 44x44px minimum target) ─────────── */
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ariaLabel: string;
  variant?: "ghost" | "subtle" | "outline";
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ ariaLabel, variant = "subtle", className = "", children, ...props }, ref) => {
    const styles = {
      ghost: "hover:bg-surface-2 text-text-2 hover:text-text-1",
      subtle: "bg-surface-2/80 hover:bg-surface-3 text-text-1 border border-border-subtle",
      outline: "bg-surface-1 hover:bg-surface-2 text-text-1 border border-border-subtle shadow-2xs",
    }[variant];

    return (
      <button
        ref={ref}
        type="button"
        aria-label={ariaLabel}
        title={ariaLabel}
        className={`inline-flex items-center justify-center rounded-xl min-h-[44px] min-w-[44px] p-2 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-saffron ${styles} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  },
);
IconButton.displayName = "IconButton";

/* ─── 9. KeyHint ──────────────────────────────────────────────────────────── */
export const KeyHint: React.FC<{ keys: string; className?: string }> = ({
  keys,
  className = "",
}) => (
  <kbd
    className={`hidden lg:inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-mono font-semibold text-text-3 bg-surface-2 border border-border-subtle rounded shadow-2xs ${className}`}
  >
    {keys}
  </kbd>
);

/* ─── 10. InfoTip (wraps VedicTermTooltip) ────────────────────────────────── */
export interface InfoTipProps {
  termKey: string;
  lang: Language;
  theme?: AppTheme;
  children: React.ReactNode;
}

export const InfoTip: React.FC<InfoTipProps> = ({ termKey, lang, theme, children }) => (
  <VedicTermTooltip termKey={termKey as any} lang={lang} theme={theme}>
    {children}
  </VedicTermTooltip>
);

/* ─── 11. EmptyState / ErrorState / Skeletons ─────────────────────────────── */
export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ icon, title, description, action }) => (
  <Card variant="flat" padding="lg" className="text-center flex flex-col items-center py-10">
    {icon && (
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-1 text-saffron border border-border-subtle">
        {icon}
      </div>
    )}
    <h3 className="type-heading text-text-1 font-devanagari">{title}</h3>
    {description && (
      <p className="type-label text-text-2 max-w-md mt-1 font-devanagari">{description}</p>
    )}
    {action && <div className="mt-4">{action}</div>}
  </Card>
);

export const ErrorState: React.FC<{
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}> = ({ title = "Calculation Notice", message, onRetry, retryLabel = "Retry" }) => (
  <Card
    variant="raised"
    padding="md"
    className="border-inauspicious/35 bg-inauspicious-subtle/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
  >
    <div className="flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-inauspicious shrink-0 mt-0.5" />
      <div>
        <h3 className="text-sm font-bold text-text-1">{title}</h3>
        <p className="text-xs text-text-2 mt-0.5">{message}</p>
      </div>
    </div>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 rounded-xl bg-surface-1 border border-border-subtle px-3.5 py-2 text-xs font-bold text-text-1 hover:bg-surface-2 transition-colors min-h-[40px] cursor-pointer"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>{retryLabel}</span>
      </button>
    )}
  </Card>
);

export const SkeletonCard: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = "",
}) => (
  <Card variant="raised" padding="md" className={`animate-pulse space-y-3 ${className}`}>
    <div className="h-4 w-1/3 rounded bg-surface-3" />
    {Array.from({ length: lines }).map((_, idx) => (
      <div
        key={idx}
        className="h-3.5 rounded bg-surface-2"
        style={{ width: `${85 - idx * 15}%` }}
      />
    ))}
  </Card>
);
