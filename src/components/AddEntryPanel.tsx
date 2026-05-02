import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Category } from '../types';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        category,
        person_name: personName,
        purpose,
        amount: parseFloat(amount),
        note: note || null,
        date: date || null,
      });
      setPersonName('');
      setPurpose('');
      setAmount('');
      setNote('');
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save entry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
                Record Entry
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
                            : "bg-[#1a1a1a] border-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {cat === "tab" && "Udhari"}
                        {cat === "on_the_house" && "Muft"}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-slate-500 mb-3">
                  Person Name
                </label>
                <input
                  type="text"
                  required
                  list="add-person-names"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl px-5 py-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
                <datalist id="add-person-names">
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
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl px-5 py-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
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
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl px-5 py-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-bold"
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
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl px-5 py-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 [&::-webkit-calendar-picker-indicator]:filter-invert"
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
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl px-5 py-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold tracking-widest uppercase text-sm rounded-2xl py-5 mt-4 transition-colors disabled:opacity-50 shadow-[0_10px_30px_rgba(249,115,22,0.3)]"
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
