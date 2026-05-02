import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Entry } from '../types';

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

  return (
    <AnimatePresence>
      {data && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#000]/60 z-40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto bg-[#121212] rounded-t-[48px] p-8 z-50 border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-white tracking-tight">Record Repayment</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                aria-label="Close panel"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#1a1a1a] rounded-2xl p-5 mb-8 border border-white/5">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Current Balance due</p>
              <div className="flex justify-between items-center">
                 <p className="text-sm font-medium text-slate-300">{data.personName}</p>
                 <p className="text-2xl font-bold text-emerald-400">₹{data.balance.toFixed(2)}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 pb-12">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold text-slate-500 mb-3">Received Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={data.balance}
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl px-5 py-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-bold"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <label className="text-[10px] uppercase tracking-widest font-semibold text-slate-500">Date (Optional)</label>
                    {date && (
                      <button
                        type="button"
                        onClick={() => setDate('')}
                        className="text-[10px] uppercase tracking-widest font-semibold text-emerald-400 hover:text-emerald-300"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full min-w-0 bg-[#1a1a1a] border border-white/10 rounded-2xl px-3 py-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-slate-500 mb-3">Optional Note</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Paid via Venmo"
                  rows={2}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl px-5 py-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#050505] font-bold tracking-widest uppercase text-sm rounded-2xl py-5 mt-4 transition-colors disabled:opacity-50 shadow-[0_10px_30px_rgba(16,185,129,0.2)]"
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
