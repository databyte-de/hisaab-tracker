import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface EditRepaymentPanelProps {
  repayment: { date: string | null; amount: number; note: string | null; ids: string[] } | null;
  onClose: () => void;
  onSubmit: (amount: number, date: string | null, note: string | null) => Promise<any>;
  onDelete: (ids: string[]) => Promise<any>;
}

export function EditRepaymentPanel({ repayment, onClose, onSubmit, onDelete }: EditRepaymentPanelProps) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (repayment) {
      setAmount(repayment.amount.toString());
      setNote(repayment.note || '');
      setDate(repayment.date || '');
    }
  }, [repayment]);

  if (!repayment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(parseFloat(amount), date || null, note || null);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to update repayment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!repayment) return;
    
    setIsDeleting(true);
    try {
      await onDelete(repayment.ids);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to delete repayment');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {repayment && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#000]/60 z-40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto bg-[#121212] rounded-t-[48px] p-8 z-50 border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold tracking-tight text-white">Edit Payment</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 pb-12">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold text-slate-500 mb-3">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl px-5 py-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold text-slate-500 mb-3">Date (Optional)</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl px-5 py-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 [&::-webkit-calendar-picker-indicator]:filter-invert"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-slate-500 mb-3">Note</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Paid via Venmo"
                  rows={2}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl px-5 py-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={submitting || isDeleting}
                  className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-bold tracking-widest uppercase text-sm rounded-2xl py-5 mt-4 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'DELETING...' : 'DELETE'}
                </button>
                <button
                  type="submit"
                  disabled={submitting || isDeleting}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#050505] font-bold tracking-widest uppercase text-sm rounded-2xl py-5 mt-4 transition-colors disabled:opacity-50 shadow-[0_10px_30px_rgba(16,185,129,0.3)]"
                >
                  {submitting ? 'UPDATING...' : 'UPDATE'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
