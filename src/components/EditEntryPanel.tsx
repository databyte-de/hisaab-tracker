import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Category, Entry } from '../types';

interface EditEntryPanelProps {
  entry: Entry | null;
  onClose: () => void;
  onSubmit: (id: string, data: any) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
  uniqueNames: string[];
}

export function EditEntryPanel({ entry, onClose, onSubmit, onDelete, uniqueNames }: EditEntryPanelProps) {
  const [personName, setPersonName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (entry) {
      setPersonName(entry.person_name);
      setPurpose(entry.purpose);
      setAmount(entry.amount.toString());
      setNote(entry.note || '');
      setDate(entry.date || '');
    }
  }, [entry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry) return;
    
    setSubmitting(true);
    try {
      await onSubmit(entry.id, {
        person_name: personName,
        purpose,
        amount: parseFloat(amount),
        note: note || null,
        date: date || null,
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to update entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!entry) return;
    
    setIsDeleting(true);
    try {
      await onDelete(entry.id);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to delete entry');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!entry) return null;

  return (
    <AnimatePresence>
      {entry && (
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
              <h2 className="text-xl font-bold tracking-tight text-white">
                Edit Entry
              </h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                aria-label="Close panel"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 pb-12">
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-slate-500 mb-3">
                  Person Name
                </label>
                <input
                  type="text"
                  required
                  list="edit-person-names"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl px-5 py-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
                <datalist id="edit-person-names">
                  {uniqueNames.map(n => <option key={n} value={n} />)}
                </datalist>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-slate-500 mb-3">
                  Purpose
                </label>
                <input
                  type="text"
                  required
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Dinner, Uber, Rent"
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl px-5 py-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold text-slate-500 mb-3">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl px-5 py-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold text-slate-500 mb-3">
                    Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl px-5 py-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 [&::-webkit-calendar-picker-indicator]:filter-invert"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-slate-500 mb-3">
                  Optional Note
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Any extra details..."
                  rows={2}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl px-5 py-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={submitting || isDeleting}
                  className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-bold tracking-widest uppercase text-sm rounded-2xl py-5 mt-4 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? "DELETING..." : "DELETE"}
                </button>
                <button
                  type="submit"
                  disabled={submitting || isDeleting}
                  className="w-full bg-sky-500 hover:bg-sky-400 text-[#050505] font-bold tracking-widest uppercase text-sm rounded-2xl py-5 mt-4 transition-colors disabled:opacity-50 shadow-[0_10px_30px_rgba(14,165,233,0.3)]"
                >
                  {submitting ? "SAVING..." : "SAVE"}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
