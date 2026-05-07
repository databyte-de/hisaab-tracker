import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { formatINR } from '../lib/utils';

interface RepaymentPanelProps {
  data: { personName: string; balance: number } | null;
  onClose: () => void;
  onSubmit: (amount: number, date: string | null, note: string | null) => Promise<any>;
}

export function RepaymentPanel({ data, onClose, onSubmit }: RepaymentPanelProps) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!data) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(parseFloat(amount), date || null, note || null);
      setAmount('');
      setNote('');
      setDate('');
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save repayment');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full bg-app border border-hairline rounded-2xl px-5 py-4 text-fg text-sm placeholder:text-subtle focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500";

  return (
    <AnimatePresence>
      {data && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto bg-surface rounded-t-[48px] p-8 z-50 border-t border-hairline shadow-[0_-10px_40px_rgba(0,0,0,0.25)]"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-fg tracking-tight">Record Repayment</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-fg/5 border border-hairline flex items-center justify-center text-muted hover:text-fg transition-colors"
                aria-label="Close panel"
              >
                ✕
              </button>
            </div>

            <div className="bg-app rounded-2xl p-5 mb-8 border border-hairline">
              <p className="text-[10px] uppercase tracking-widest text-subtle mb-1">Current Balance due</p>
              <div className="flex justify-between items-center">
                 <p className="text-sm font-medium text-fg">{data.personName}</p>
                 <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">₹{formatINR(data.balance)}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 pb-12">
              <div className="grid grid-cols-2 gap-4">
                <div className="min-w-0">
                  <label className="block text-[10px] uppercase tracking-widest font-semibold text-subtle mb-3">Received Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={data.balance}
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full min-w-0 bg-app border border-hairline rounded-2xl px-3 py-4 text-fg text-sm placeholder:text-subtle focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-bold"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <label className="text-[10px] uppercase tracking-widest font-semibold text-subtle">Date (Optional)</label>
                    {date && (
                      <button
                        type="button"
                        onClick={() => setDate('')}
                        className="text-[10px] uppercase tracking-widest font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full min-w-0 bg-app border border-hairline rounded-2xl px-3 py-4 text-fg text-sm placeholder:text-subtle focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:[&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-subtle mb-3">Optional Note</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Paid via Venmo"
                  rows={2}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold tracking-widest uppercase text-sm rounded-2xl py-5 mt-4 transition-colors disabled:opacity-50 shadow-md dark:shadow-[0_10px_30px_rgba(16,185,129,0.2)]"
              >
                {submitting ? 'SAVING...' : 'SAVE REPAYMENT'}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
