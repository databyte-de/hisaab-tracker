import React from 'react';
import { CalendarPlus, Plus, X } from 'lucide-react';

export type SubItem = { id: string; label: string; amount: string; date: string };

type Accent = 'brand' | 'sky' | 'emerald';

interface Props {
  items: SubItem[];
  onChange: (items: SubItem[]) => void;
  accent: Accent;
}

const accentRing: Record<Accent, string> = {
  brand: 'focus:border-brand-500 focus:ring-brand-500',
  sky: 'focus:border-sky-500 focus:ring-sky-500',
  emerald: 'focus:border-emerald-500 focus:ring-emerald-500',
};

const accentText: Record<Accent, string> = {
  brand: 'text-brand-600 dark:text-brand-400 hover:text-brand-500 border-brand-500/30 bg-brand-500/10',
  sky: 'text-sky-600 dark:text-sky-400 hover:text-sky-500 border-sky-500/30 bg-sky-500/10',
  emerald: 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 border-emerald-500/30 bg-emerald-500/10',
};

export function newSubItem(): SubItem {
  return { id: Math.random().toString(36).slice(2), label: '', amount: '', date: '' };
}

export function breakdownTotal(items: SubItem[]): number {
  return items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
}

export function breakdownToNote(items: SubItem[]): string {
  const parts = items
    .filter((i) => (i.label.trim() || i.amount.trim()))
    .map((i) => {
      const amt = parseFloat(i.amount) || 0;
      const label = i.label.trim() || 'Item';
      const date = i.date ? ` [date:${i.date}]` : '';
      return `${label} ₹${amt.toFixed(2)}${date}`;
    });
  return parts.length ? `— ${parts.join(' · ')}` : '';
}

export function parseBreakdownFromNote(note: string | null | undefined): { cleanNote: string; items: SubItem[] } {
  if (!note) return { cleanNote: '', items: [] };
  const lines = note.split('\n');
  const idx = lines.findIndex((l) => l.trimStart().startsWith('— '));
  if (idx === -1) return { cleanNote: note, items: [] };

  const breakdownLine = lines[idx].trimStart().slice(2);
  const items: SubItem[] = breakdownLine.split(' · ').map((part) => {
    const m = part.match(/^(.*?)\s*₹\s*(-?[\d.]+)(?:\s+\[date:(\d{4}-\d{2}-\d{2})\])?\s*$/);
    return {
      id: Math.random().toString(36).slice(2),
      label: m ? m[1].trim() : part.trim(),
      amount: m ? m[2] : '',
      date: m?.[3] || '',
    };
  });

  const cleanNote = lines.filter((_, i) => i !== idx).join('\n').trim();
  return { cleanNote, items };
}

export function AmountBreakdown({ items, onChange, accent }: Props) {
  const [datePickerOpenFor, setDatePickerOpenFor] = React.useState<string | null>(null);
  const update = (id: string, patch: Partial<SubItem>) => {
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  };
  const remove = (id: string) => {
    onChange(items.filter((i) => i.id !== id));
  };
  const add = () => {
    onChange([...items, newSubItem()]);
  };

  const ring = accentRing[accent];
  const inputCls = `min-w-0 bg-app border border-hairline rounded-xl px-3 py-2.5 text-fg text-xs placeholder:text-subtle focus:outline-none focus:ring-1 ${ring}`;

  return (
    <div className="mt-3 space-y-2 rounded-2xl border border-hairline bg-app/60 p-3">
      {items.length === 0 && (
        <p className="text-[11px] text-subtle italic px-1">
          Add line items below — total fills Amount automatically.
        </p>
      )}
      {items.map((item) => {
        const isDatePickerOpen = datePickerOpenFor === item.id;
        return (
          <div key={item.id} className="rounded-xl">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={item.label}
                onChange={(e) => update(item.id, { label: e.target.value })}
                placeholder="Item"
                className={`flex-1 ${inputCls}`}
              />
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={item.amount}
                onChange={(e) => update(item.id, { amount: e.target.value })}
                placeholder="0.00"
                className={`w-24 font-bold ${inputCls}`}
              />
              <button
                type="button"
                onClick={() => setDatePickerOpenFor(isDatePickerOpen ? null : item.id)}
                aria-label={item.date ? 'Edit item date' : 'Add item date'}
                title={item.date ? 'Edit item date' : 'Add item date'}
                className={`w-8 h-8 shrink-0 rounded-lg border flex items-center justify-center transition-colors ${
                  item.date
                    ? 'border-brand-500/30 bg-brand-500/10 text-brand-600 dark:text-brand-400'
                    : 'border-hairline bg-fg/5 text-muted hover:text-fg hover:bg-fg/10'
                }`}
              >
                <CalendarPlus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => remove(item.id)}
                aria-label="Remove item"
                className="w-8 h-8 shrink-0 rounded-lg border border-hairline bg-fg/5 text-muted hover:text-fg hover:bg-fg/10 flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            {isDatePickerOpen && (
              <div className="ml-auto mt-2 flex w-[13.5rem] items-center gap-2">
                <input
                  type="date"
                  value={item.date}
                  onChange={(e) => update(item.id, { date: e.target.value })}
                  aria-label="Item date"
                  className={`${inputCls} py-2`}
                />
                {item.date && (
                  <button
                    type="button"
                    onClick={() => update(item.id, { date: '' })}
                    className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-brand-600 hover:text-brand-500 dark:text-brand-400"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
      <button
        type="button"
        onClick={add}
        className={`w-full flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-widest rounded-xl border py-2.5 transition-colors ${accentText[accent]}`}
      >
        <Plus className="w-3.5 h-3.5" />
        Add Item
      </button>
    </div>
  );
}
