import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator } from 'lucide-react';
import type { Category } from '../types';
import { AmountBreakdown, breakdownToNote, breakdownTotal, newSubItem, type SubItem } from './AmountBreakdown';

interface AddEntryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<any>;
  uniqueNames: string[];
}

export function AddEntryPanel({ isOpen, onClose, onSubmit, uniqueNames }: AddEntryPanelProps) {
  const [category, setCategory] = useState<Category>('tab');
  const [personName, setPersonName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [subItems, setSubItems] = useState<SubItem[]>([]);

  const computedTotal = breakdownTotal(subItems);
  const effectiveAmount = breakdownOpen ? computedTotal.toFixed(2) : amount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const breakdownText = breakdownOpen ? breakdownToNote(subItems) : '';
      const finalNote = breakdownText
        ? note.trim() ? `${note.trim()}\n${breakdownText}` : breakdownText
        : note || null;
      await onSubmit({
        category,
        person_name: personName,
        purpose,
        amount: parseFloat(effectiveAmount),
        note: finalNote || null,
        date: date || null,
      });
      setPersonName('');
      setPurpose('');
      setAmount('');
      setNote('');
      setDate('');
      setCategory('tab');
      setBreakdownOpen(false);
      setSubItems([]);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save entry');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full bg-app border border-hairline rounded-2xl px-5 py-4 text-fg text-sm placeholder:text-subtle focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto bg-surface rounded-t-[48px] p-8 z-50 border-t border-hairline shadow-[0_-10px_40px_rgba(0,0,0,0.25)]"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold tracking-tight text-fg">
                Record Entry
              </h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-fg/5 border border-hairline flex items-center justify-center text-muted hover:text-fg transition-colors"
                aria-label="Close panel"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 pb-12">
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-subtle mb-3">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["tab", "on_the_house"] as Category[]).map(
                    (cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`p-3 text-[11px] rounded-2xl border text-center font-bold tracking-wide transition-all ${
                          category === cat
                            ? "bg-orange-500 border-orange-400 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)] shadow-inner"
                            : "bg-app border-hairline text-muted hover:bg-fg/5 hover:text-fg"
                        }`}
                      >
                        {cat === "tab" && "Lent"}
                        {cat === "on_the_house" && "On The House"}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-subtle mb-3">
                  Person Name
                </label>
                <input
                  type="text"
                  required
                  list="add-person-names"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="e.g. Alex"
                  className={inputClass}
                />
                <datalist id="add-person-names">
                  {uniqueNames.map(n => <option key={n} value={n} />)}
                </datalist>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-subtle mb-3">
                  Purpose
                </label>
                <input
                  type="text"
                  required
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Dinner, Uber, Rent"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="min-w-0">
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <label className="text-[10px] uppercase tracking-widest font-semibold text-subtle">
                      Amount (₹)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const next = !breakdownOpen;
                        setBreakdownOpen(next);
                        if (next && subItems.length === 0) {
                          setSubItems([newSubItem(), newSubItem()]);
                        }
                      }}
                      aria-label="Toggle breakdown calculator"
                      className={`flex items-center gap-1 text-[10px] uppercase tracking-widest font-semibold transition-colors ${
                        breakdownOpen ? 'text-orange-600 dark:text-orange-400' : 'text-subtle hover:text-orange-600 dark:hover:text-orange-400'
                      }`}
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      {breakdownOpen ? 'Done' : 'Split'}
                    </button>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    readOnly={breakdownOpen}
                    value={effectiveAmount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className={`w-full min-w-0 bg-app border border-hairline rounded-2xl px-3 py-4 text-fg text-sm placeholder:text-subtle focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-bold ${
                      breakdownOpen ? 'opacity-80 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <label className="text-[10px] uppercase tracking-widest font-semibold text-subtle">
                      Date (Optional)
                    </label>
                    {date && (
                      <button
                        type="button"
                        onClick={() => setDate('')}
                        className="text-[10px] uppercase tracking-widest font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-500"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full min-w-0 bg-app border border-hairline rounded-2xl px-3 py-4 text-fg text-sm placeholder:text-subtle focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 dark:[&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>
              </div>

              {breakdownOpen && (
                <AmountBreakdown items={subItems} onChange={setSubItems} accent="orange" />
              )}

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-subtle mb-3">
                  Optional Note
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Any extra details..."
                  rows={2}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold tracking-widest uppercase text-sm rounded-2xl py-5 mt-4 transition-colors disabled:opacity-50 shadow-md dark:shadow-[0_10px_30px_rgba(249,115,22,0.3)]"
              >
                {submitting ? "Saving..." : "Save Record"}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
