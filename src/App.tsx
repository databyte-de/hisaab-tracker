import React, { useState, useMemo } from 'react';
import { useHisaabData } from './hooks/useHisaabData';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';
import { PersonCard } from './components/PersonCard';
import { AddEntryPanel } from './components/AddEntryPanel';
import { RepaymentPanel } from './components/RepaymentPanel';
import { EditEntryPanel } from './components/EditEntryPanel';
import { EditRepaymentPanel } from './components/EditRepaymentPanel';
import { SignInScreen } from './components/SignInScreen';
import { Activity, LogOut, Monitor, Moon, Plus, Sun } from 'lucide-react';
import type { Entry, Repayment } from './types';

function groupByPerson(list: Entry[]) {
  const map = new Map<string, Entry[]>();
  list.forEach(e => {
    if (!map.has(e.person_name)) map.set(e.person_name, []);
    map.get(e.person_name)!.push(e);
  });
  return Array.from(map.entries()).map(([personName, entries]) => ({ personName, entries }));
}

export default function App() {
  const { user, loading: authLoading, signInWithGoogle, signOut } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="flex flex-col items-center animate-pulse text-orange-500">
          <Activity className="w-8 h-8 mb-4 border border-orange-500 rounded p-1" />
          <p className="font-bold tracking-widest text-xs uppercase text-subtle">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <SignInScreen onSignIn={signInWithGoogle} />;
  }

  return <AuthenticatedApp onSignOut={signOut} />;
}

function AuthenticatedApp({ onSignOut }: { onSignOut: () => void }) {
  const { entries, loading, error, addEntry, addRepayment, markSettled, editEntry, markPersonSettled, addRepaymentForPerson, editRepayment, deleteEntry, deleteRepayment } = useHisaabData();
  const { mode: themeMode, cycle: cycleTheme } = useTheme();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [repaymentData, setRepaymentData] = useState<{ personName: string; balance: number; entries: Entry[] } | null>(null);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [editingRepayment, setEditingRepayment] = useState<Repayment | null>(null);

  const { uniqueNames } = useMemo(() => {
    const names = new Set<string>();
    entries.forEach(e => {
      names.add(e.person_name);
    });
    return {
      uniqueNames: Array.from(names).sort(),
    };
  }, [entries]);

  const { tabData, onTheHouseData, archivedData, summary } = useMemo(() => {
    // Only show active (un-archived) entries
    const activeEntries = entries.filter(e => !e.is_settled);
    const archivedEntries = entries.filter(e => e.is_settled);
    
    const tabEntries = activeEntries.filter((e) => e.category === 'tab');
    const onHouseEntries = activeEntries.filter((e) => e.category === 'on_the_house');

    let totalRecover = 0;
    tabEntries.forEach(e => {
      const repaid = e.repayments?.reduce((sum, r) => sum + r.amount_received, 0) || 0;
      totalRecover += (e.amount - repaid);
    });

    const totalGiven = onHouseEntries.reduce((sum, e) => sum + e.amount, 0);

    return {
      tabData: groupByPerson(tabEntries),
      onTheHouseData: groupByPerson(onHouseEntries),
      archivedData: groupByPerson(archivedEntries),
      summary: { totalRecover, totalGiven }
    };
  }, [entries]);

  if (loading && entries.length === 0) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="flex flex-col items-center animate-pulse text-orange-500">
          <Activity className="w-8 h-8 mb-4 border border-orange-500 rounded p-1" />
          <p className="font-bold tracking-widest text-xs uppercase text-subtle">Loading Len-Den...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app text-fg font-sans pb-24 relative overflow-x-hidden">
      {/* App Header */}
      <header className="pt-12 px-6 pb-4 sticky top-0 bg-app/90 backdrop-blur-xl z-10">
        <div className="flex justify-between items-center mb-6 relative">
          <h1 className="text-2xl font-bold tracking-tight text-fg absolute left-1/2 transform -translate-x-1/2">Len-Den</h1>
          <button
            onClick={cycleTheme}
            aria-label={`Theme: ${themeMode}. Click to change.`}
            title={`Theme: ${themeMode}`}
            className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20 cursor-pointer hover:bg-orange-500/20 transition-colors"
          >
            {themeMode === 'auto' && <Monitor className="w-5 h-5 text-orange-500" />}
            {themeMode === 'light' && <Sun className="w-5 h-5 text-orange-500" />}
            {themeMode === 'dark' && <Moon className="w-5 h-5 text-orange-500" />}
          </button>
          <div className="flex gap-2">
            <button
              onClick={onSignOut}
              aria-label="Sign out"
              className="w-10 h-10 rounded-full bg-fg/5 flex items-center justify-center border border-hairline cursor-pointer hover:bg-fg/10 transition-colors"
            >
              <LogOut className="w-4 h-4 text-muted" />
            </button>
            <button
              onClick={() => setIsAddOpen(true)}
              aria-label="Add entry"
              className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20 cursor-pointer hover:bg-orange-500/20 transition-colors"
            >
              <Plus className="w-5 h-5 text-orange-500" />
            </button>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-surface p-3 rounded-2xl border border-hairline">
            <span className="text-[10px] tracking-wider text-subtle block mb-1">Owed</span>
            <span className="text-emerald-500 dark:text-emerald-400 font-semibold text-sm">₹{summary.totalRecover.toFixed(2)}</span>
          </div>
          <div className="bg-surface p-3 rounded-2xl border border-hairline">
            <span className="text-[10px] tracking-wider text-subtle block mb-1">On The House</span>
            <span className="text-orange-500 dark:text-orange-400 font-semibold text-sm">₹{summary.totalGiven.toFixed(2)}</span>
          </div>
        </div>
      </header>

      {/* Main Content / Categories */}
      <main className="px-6 mt-6 space-y-6">
        
        {/* The Tab */}
        <section>
          <div className="flex justify-between items-center mb-3 px-1">
             <h2 className="text-sm font-medium text-muted flex items-center gap-2">
                <span className="text-lg">🤝</span> Lent
             </h2>
             <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
               {tabData.length} OPEN
             </span>
          </div>
          
          <div className="space-y-3">
            {tabData.length === 0 ? (
              <div className="text-center py-6 text-xs text-subtle bg-surface rounded-2xl border border-hairline">
                No pending tabs. You're all settled up!
              </div>
            ) : (
              tabData.map(({ personName, entries }) => (
                <PersonCard
                  key={`tab-${personName}`}
                  personName={personName}
                  entries={entries}
                  category="tab"
                  onRecordRepayment={(name, balance) => setRepaymentData({ personName: name, balance, entries })}
                  onMarkSettled={markPersonSettled}
                  onEditEntry={(entry) => setEditingEntry(entry)}
                  onEditRepayment={(rep) => setEditingRepayment(rep)}
                />
              ))
            )}
          </div>
        </section>

        {/* On The House */}
        <section>
          <div className="flex items-center gap-2 mb-3 px-1">
            <h2 className="text-sm font-medium text-muted flex items-center gap-2">
              <span className="text-lg">🫂</span> On The House
            </h2>
          </div>
          
          <div className="space-y-3">
            {onTheHouseData.length === 0 ? (
              <div className="text-center py-6 text-xs text-subtle bg-surface rounded-2xl border border-hairline opacity-80">
                No records here.
              </div>
            ) : (
              onTheHouseData.map(({ personName, entries }) => (
                <PersonCard
                  key={`house-${personName}`}
                  personName={personName}
                  entries={entries}
                  category="on_the_house"
                  onRecordRepayment={() => {}}
                  onMarkSettled={markPersonSettled}
                  onEditEntry={(entry) => setEditingEntry(entry)}
                  onEditRepayment={() => {}}
                />
              ))
            )}
          </div>
        </section>

        {/* Archived Section */}
        <section>
          <div className="flex items-center gap-2 mb-3 px-1">
            <h2 className="text-sm font-medium text-muted flex items-center gap-2">
              <span className="text-lg">📦</span> Settled
            </h2>
          </div>
          
          <div className="space-y-3">
            {archivedData.length === 0 ? (
              <div className="text-center py-6 text-xs text-subtle bg-surface rounded-2xl border border-hairline opacity-80">
                No archived records.
              </div>
            ) : (
              archivedData.map(({ personName, entries }) => (
                <PersonCard
                  key={`archived-${personName}`}
                  personName={personName}
                  entries={entries}
                  category={entries[0].category}
                  onRecordRepayment={(name, balance) => setRepaymentData({ personName: name, balance, entries })}
                  onMarkSettled={markPersonSettled}
                  onEditEntry={(entry) => setEditingEntry(entry)}
                  onEditRepayment={(rep) => setEditingRepayment(rep)}
                  isArchived={true}
                />
              ))
            )}
          </div>
        </section>

      </main>

      <AddEntryPanel 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        onSubmit={addEntry}
        uniqueNames={uniqueNames}
      />

      <RepaymentPanel
        data={repaymentData}
        onClose={() => setRepaymentData(null)}
        onSubmit={async (amount, date, note) => {
          if (repaymentData) {
            await addRepaymentForPerson(repaymentData.entries, amount, date, note);
          }
        }}
      />

      <EditEntryPanel
        entry={editingEntry}
        onClose={() => setEditingEntry(null)}
        onSubmit={editEntry}
        onDelete={deleteEntry}
        uniqueNames={uniqueNames}
      />

      <EditRepaymentPanel
        repayment={editingRepayment}
        onClose={() => setEditingRepayment(null)}
        onSubmit={async (amount, date, note) => {
          if (editingRepayment) {
            const allReps = entries.flatMap(e => e.repayments || []);
            const groupReps = editingRepayment.ids.map(id => allReps.find(r => r.id === id)).filter(Boolean) as Repayment[];
            
            if (groupReps.length === 0) return;
            
            let remaining = amount;
            for (let i = 0; i < groupReps.length; i++) {
              const rep = groupReps[i];
              if (i === groupReps.length - 1) {
                // The last repayment chunk absorbs all remaining amount (can be higher or lower)
                await editRepayment(rep.id, { amount_received: remaining, date, note });
              } else {
                // Previous chunks keep their original amount, unless remaining is less
                const keep = Math.max(0, Math.min(rep.amount_received, remaining));
                await editRepayment(rep.id, { amount_received: keep, date, note });
                remaining -= keep;
              }
            }
          }
        }}
        onDelete={async (ids) => {
          for (const id of ids) {
            await deleteRepayment(id);
          }
        }}
      />
    </div>
  );
}
