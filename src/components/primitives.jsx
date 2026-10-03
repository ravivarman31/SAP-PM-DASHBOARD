
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Plus,
  X,
  ChevronDown,
  Check,
  AlertTriangle,
  Info,
} from 'lucide-react';

/* ==================================================================== toast */

const ToastContext = createContext(() => {});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);

  const push = useCallback((message, tone = 'ok') => {
    const id = Math.random().toString(36).slice(2);

    setItems((list) => [
      ...list,
      {
        id,
        message,
        tone,
      },
    ]);

    setTimeout(() => {
      setItems((list) =>
        list.filter((t) => t.id !== id)
      );
    }, 4200);
  }, []);

  const icons = {
    ok: Check,
    warn: AlertTriangle,
    error: AlertTriangle,
    info: Info,
  };

  const tones = {
    ok: 'border-l-ok text-ok',
    warn: 'border-l-warn text-warn',
    error: 'border-l-danger text-danger',
    info: 'border-l-accent text-accent',
  };

  return (
    <ToastContext.Provider value={push}>
      {children}

      <div
        className="fixed bottom-5 right-5 z-[80] flex flex-col gap-2 w-[min(92vw,26rem)]"
        role="status"
        aria-live="polite"
      >
        {items.map((t) => {
          const Icon = icons[t.tone] || Info;

          return (
            <div
              key={t.id}
              className={`rise flex items-start gap-3 bg-surface border border-line border-l-[3px] ${tones[t.tone]} rounded-md shadow-lg shadow-ink/10 px-4 py-3`}
            >
              <Icon
                size={17}
                className="mt-px shrink-0"
              />

              <p className="text-sm text-ink leading-snug">
                {t.message}
              </p>

              <button
                type="button"
                onClick={() =>
                  setItems((l) =>
                    l.filter((x) => x.id !== t.id)
                  )
                }
                className="ml-auto text-ink-mute hover:text-ink"
                aria-label="Dismiss"
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

/* =================================================================== basics */

export function Button({
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  children,
  className = '',
  type = 'button',
  ...rest
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:opacity-45 disabled:pointer-events-none whitespace-nowrap';

  const sizes = {
    sm: 'h-8 px-3 text-[13px]',
    md: 'h-10 px-4 text-sm',
  };

  const variants = {
    primary:
      'bg-accent text-white hover:bg-accent-dark',

    secondary:
      'bg-surface text-ink border border-line-strong hover:bg-raised',

    ghost:
      'text-ink-soft hover:bg-raised hover:text-ink',

    danger:
      'bg-danger text-white hover:brightness-90',
  };

  return (
    <button
      type={type}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...rest}
    >
      {Icon && (
        <Icon
          size={size === 'sm' ? 15 : 16}
        />
      )}

      {children}
    </button>
  );
}

export function Card({
  children,
  className = '',
}) {
  return (
    <section
      className={`bg-surface border border-line rounded-lg ${className}`}
    >
      {children}
    </section>
  );
}

export function SectionHeading({
  title,
  sub,
  action,
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-[15px] font-semibold text-ink">
          {title}
        </h2>

        {sub && (
          <p className="text-[13px] text-ink-mute mt-0.5">
            {sub}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}

export function PageHeader({
  icon: Icon,
  title,
  description,
  actionLabel = 'Add record',
  onAction,
  children,
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 pb-5 mb-6 border-b border-line">
      <div className="flex items-start gap-3.5">
        {Icon && (
          <span className="mt-0.5 w-10 h-10 rounded-md bg-accent-soft text-accent border border-accent-line grid place-items-center shrink-0">
            <Icon
              size={20}
              strokeWidth={1.75}
            />
          </span>
        )}

        <div>
          <h1 className="text-[22px] md:text-[26px] font-semibold text-ink tracking-[-0.015em] leading-tight">
            {title}
          </h1>

          {description && (
            <p className="text-ink-mute mt-1 text-sm max-w-[68ch] leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {children}

        {onAction && (
          <Button
            type="button"
            variant="primary"
            icon={Plus}
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

const TONES = {
  indigo: 'text-accent',
  accent: 'text-accent',
  cyan: 'text-info',
  info: 'text-info',
  emerald: 'text-ok',
  ok: 'text-ok',
  amber: 'text-warn',
  warn: 'text-warn',
  rose: 'text-danger',
  danger: 'text-danger',
  purple: 'text-accent',
};

export function StatCard({
  icon: Icon,
  label,
  value,
  note,
  tone = 'accent',
}) {
  const color =
    TONES[tone] || TONES.accent;

  return (
    <div className="bg-surface border border-line rounded-lg px-4 py-3.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] text-ink-mute font-medium">
          {label}
        </p>

        {Icon && (
          <Icon
            size={17}
            className={color}
            strokeWidth={1.75}
          />
        )}
      </div>

      <div className="tnum text-[28px] font-semibold text-ink mt-2 leading-none tracking-[-0.02em]">
        {value}
      </div>

      {note && (
        <p className="text-xs text-ink-mute mt-2">
          {note}
        </p>
      )}
    </div>
  );
}

export function Badge({ value }) {
  const v = String(value || '').toLowerCase();

  let c =
    'bg-raised text-ink-soft border-line';

  if (
    [
      'active',
      'completed',
      'closed',
      'approved',
      'available',
      'healthy',
      'released',
    ].includes(v)
  ) {
    c =
      'bg-ok-soft text-ok border-ok/20';
  }

  if (
    [
      'open',
      'pending',
      'maintenance',
      'scheduled',
      'in progress',
      'attention',
      'medium',
    ].includes(v)
  ) {
    c =
      'bg-warn-soft text-warn border-warn/20';
  }

  if (
    [
      'critical',
      'high',
      'inactive',
      'rejected',
      'overdue',
      'breakdown',
    ].includes(v)
  ) {
    c =
      'bg-danger-soft text-danger border-danger/20';
  }

  if (
    [
      'low',
      'inspection',
      'planned',
      'draft',
    ].includes(v)
  ) {
    c =
      'bg-info-soft text-info border-info/20';
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium border ${c}`}
    >
      {value || '—'}
    </span>
  );
}

/* ==================================================================== modal */

export function Modal({
  title,
  subtitle,
  children,
  onClose,
  onSave,
  saveLabel = 'Save record',
  view = false,
  size = 'md',
}) {
  const ref = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    // Focus only the first form field.
    // Do NOT focus the close button.
    const firstField =
      ref.current?.querySelector(
        'input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
      );

    firstField?.focus();

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const widths = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-5xl',
  };

  return (
    <div
      className="fixed inset-0 z-[70] bg-ink/45 backdrop-blur-[2px] p-4 grid place-items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`rise bg-surface w-full ${widths[size]} max-h-[90vh] flex flex-col rounded-lg shadow-2xl shadow-ink/25 border border-line`}
      >
        <header className="flex items-start justify-between gap-4 px-5 py-4 border-b border-line">
          <div>
            <h2 className="text-base font-semibold text-ink">
              {title}
            </h2>

            {subtitle && (
              <p className="text-[13px] text-ink-mute mt-0.5">
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 -mr-1 rounded text-ink-mute hover:bg-raised hover:text-ink"
          >
            <X size={18} />
          </button>
        </header>

        <div className="p-5 overflow-y-auto">
          {children}
        </div>

        {!view && (
          <footer className="flex justify-end gap-2 px-5 py-3.5 border-t border-line bg-raised rounded-b-lg">
            <Button
              type="button"
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="primary"
              onClick={onSave}
            >
              {saveLabel}
            </Button>
          </footer>
        )}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  title,
  body,
  confirmLabel = 'Delete',
  onConfirm,
  onClose,
}) {
  return (
    <div
      className="fixed inset-0 z-[75] bg-ink/45 backdrop-blur-[2px] p-4 grid place-items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        className="rise bg-surface w-full max-w-sm rounded-lg border border-line shadow-2xl shadow-ink/25 p-5"
      >
        <div className="flex gap-3">
          <span className="w-9 h-9 rounded-md bg-danger-soft text-danger grid place-items-center shrink-0">
            <AlertTriangle size={18} />
          </span>

          <div>
            <h2 className="font-semibold text-ink">
              {title}
            </h2>

            <p className="text-[13px] text-ink-soft mt-1 leading-relaxed">
              {body}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <Button
            type="button"
            onClick={onClose}
          >
            Keep record
          </Button>

          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ==================================================================== field */

export function Field({
  label,
  value,
  onChange,
  type = 'text',
  options,
  required,
  readOnly,
  hint,
}) {
  const cls =
    'w-full h-10 px-3 rounded-md border border-line bg-raised text-sm focus:bg-surface focus:border-accent focus:outline-none read-only:text-ink-mute';

  return (
    <label className="block">
      <span className="block text-[13px] font-medium text-ink-soft mb-1.5">
        {label}

        {required && (
          <span className="text-danger ml-0.5">
            *
          </span>
        )}
      </span>

      {options ? (
        <div className="relative">
          <select
            className={`${cls} appearance-none pr-9`}
            value={value || ''}
            onChange={(e) =>
              onChange(e.target.value)
            }
            disabled={readOnly}
          >
            <option value="">
              Select…
            </option>

            {options.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>

          <ChevronDown
            size={15}
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-mute"
          />
        </div>
      ) : (
        <input
          className={cls}
          type={type}
          value={value || ''}
          readOnly={readOnly}
          onChange={(e) =>
            onChange(e.target.value)
          }
        />
      )}

      {hint && (
        <span className="block text-xs text-ink-mute mt-1">
          {hint}
        </span>
      )}
    </label>
  );
}

/* =================================================================== select */

export function Select({
  value,
  onChange,
  className = '',
  children,
}) {
  return (
    <div
      className={`relative ${className}`}
    >
      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full h-10 pl-3 pr-9 rounded-md bg-raised border border-line text-sm appearance-none focus:bg-surface focus:border-accent focus:outline-none"
      >
        {children}
      </select>

      <ChevronDown
        size={15}
        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-mute"
      />
    </div>
  );
}
