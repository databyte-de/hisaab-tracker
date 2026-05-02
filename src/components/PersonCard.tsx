import React from 'react';
import { format } from 'date-fns';
import { Pencil } from 'lucide-react';
import type { Entry } from '../types';

interface PersonCardProps {
  key?: React.Key;
  personName: string;
  entries: Entry[];
  category: "tab" | "on_the_house";
  onRecordRepayment: (personName: string, balance: number) => void;
  onMarkSettled: (ids: string[], settled: boolean) => void;
  onEditEntry: (entry: Entry) => void;
  onEditRepayment: (repayment: any) => void;
  isArchived?: boolean;
}

export function PersonCard({
  personName,
  entries,
  category,
  onRecordRepayment,
  onMarkSettled,
  onEditEntry,
  onEditRepayment,
  isArchived,
}: PersonCardProps) {
  const totalAmount = entries.reduce((sum, e) => sum + e.amount, 0);

  const totalRepaid = entries.reduce((sum, e) => {
    return (
      sum +
      (e.repayments?.reduce((rSum, r) => rSum + r.amount_received, 0) || 0)
    );
  }, 0);

  const balance = totalAmount - totalRepaid;

  // Group all repayments to show a history
  const groupedRepayments: Record<
    string,
    { date: string | null; amount: number; note: string | null; ids: string[] }
  > = {};
  entries
    .flatMap((e) => e.repayments || [])
    .forEach((r) => {
      // Group by created_at to distinguish different payments made over time
      const key = `${r.created_at}_${r.date}_${r.note || ""}`;
      if (!groupedRepayments[key]) {
        groupedRepayments[key] = {
          date: r.date,
          amount: 0,
          note: r.note,
          ids: [],
        };
      }
      groupedRepayments[key].amount += r.amount_received;
      groupedRepayments[key].ids.push(r.id);
    });

  const allRepaymentsGrouped = Object.values(groupedRepayments).sort(
    (a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime(),
  );

  // Let's grab the latest entry for displaying the date in the main card
  const latestEntry = [...entries].sort(
    (a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime(),
  )[0];
  const formattedDate = latestEntry?.date
    ? format(new Date(latestEntry.date), "dd MMM")
    : "";

  // Calculate specific texts
  let rightSideContent = null;

  if (category === "tab") {
    if (isArchived) {
      rightSideContent = (
        <div className="text-right">
          <p className="text-emerald-600 dark:text-emerald-400 font-bold">₹{totalAmount.toFixed(2)}</p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-bold">
            Settled
          </p>
        </div>
      );
    } else if (balance <= 0) {
      rightSideContent = (
        <div className="text-right">
          <p className="text-emerald-600 dark:text-emerald-400 font-bold">₹0.00</p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-bold">
            Balance
          </p>
        </div>
      );
    } else if (balance > 0 && balance < totalAmount) {
      rightSideContent = (
        <div className="text-right">
          <p className="text-fg font-bold">₹{balance.toFixed(2)}</p>
          <p className="text-[10px] text-subtle italic">Partially Paid</p>
        </div>
      );
    } else {
      rightSideContent = (
        <div className="text-right">
          <p className="text-fg font-bold">₹{balance.toFixed(2)}</p>
        </div>
      );
    }
  } else if (category === "on_the_house") {
    rightSideContent = (
      <p className="text-orange-500 dark:text-orange-400 font-bold">₹{totalAmount.toFixed(2)}</p>
    );
  } else {
    rightSideContent = (
      <p className="text-sky-500 dark:text-sky-400 font-bold">₹{totalAmount.toFixed(2)}</p>
    );
  }

  const [expanded, setExpanded] = React.useState(false);

  return (
    <div
      className={`bg-surface rounded-2xl border ${
        category === "on_the_house"
          ? "border-hairline opacity-80"
          : "border-hairline"
      } overflow-hidden transition-all`}
    >
      <div
        className="flex justify-between items-center p-4 cursor-pointer hover:bg-fg/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <p className="text-fg font-medium">{personName}</p>
          <p className="text-xs text-subtle tracking-wide mt-1">
            {entries.length === 1
              ? entries[0].purpose
              : `${entries.length} items`}{" "}
            <span className="opacity-50">•</span> {formattedDate}
          </p>
        </div>
        {rightSideContent}
      </div>

      {expanded && (
        <div className="bg-app border-t border-hairline py-4 px-4 space-y-4">
          {category === "tab" ? (
            <div className="flex justify-between items-center mb-4">
              <p className="text-xs text-muted">
                Total Balance: ₹{balance.toFixed(2)}
              </p>
              <div className="flex gap-2">
                {balance > 0 && !isArchived && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRecordRepayment(personName, balance);
                    }}
                    className="text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 hover:bg-orange-500 hover:text-white transition-colors"
                  >
                    + ADD PAYMENT
                  </button>
                )}
                {balance <= 0 && !isArchived && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkSettled(entries.map((en) => en.id), true);
                    }}
                    className="text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-colors"
                  >
                    SETTLE UP
                  </button>
                )}
                {isArchived && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkSettled(entries.map((en) => en.id), false);
                    }}
                    className="text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-lg bg-fg/5 text-muted border border-hairline hover:bg-fg/10 hover:text-fg transition-colors"
                  >
                    RESTORE
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center mb-4">
              <p className="text-xs text-muted">
                Total Amount: ₹{totalAmount.toFixed(2)}
              </p>
              <div className="flex gap-2">
                {isArchived && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkSettled(entries.map((en) => en.id), false);
                    }}
                    className="text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-lg bg-fg/5 text-muted border border-hairline hover:bg-fg/10 hover:text-fg transition-colors"
                  >
                    RESTORE
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="space-y-3 relative before:absolute before:inset-y-0 before:left-3 before:w-px before:bg-hairline pl-8">
            {entries.map((entry) => {
              return (
                <div key={entry.id} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute -left-6 top-2.5 w-1.5 h-1.5 rounded-full bg-subtle border border-app"></div>

                  <div className="bg-surface p-3 rounded-xl border border-hairline">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-fg">
                            {entry.purpose}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditEntry(entry);
                            }}
                            className="text-subtle hover:text-fg transition-colors"
                            title="Edit Entry"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-[10px] text-subtle uppercase mt-1">
                          {entry.date ? format(new Date(entry.date), "dd MMM yyyy") : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-fg">
                          ₹{entry.amount.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {entry.note && (
                      <p className="text-[11px] text-muted italic mt-2 opacity-80 whitespace-pre-line">
                        "{entry.note}"
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {category === "tab" && allRepaymentsGrouped.length > 0 && (
            <div className="mt-6 pt-4 border-t border-hairline space-y-3">
              <p className="text-[10px] text-subtle uppercase font-bold tracking-widest pl-1">
                Payment History
              </p>
              {allRepaymentsGrouped.map((rep) => (
                <div
                  key={rep.ids.join(',')}
                  className="flex items-center justify-between text-xs bg-emerald-500/5 px-3 py-2 rounded-lg border border-emerald-500/10"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-muted">
                      {rep.date ? format(new Date(rep.date), "dd MMM yyyy") : ""}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditRepayment(rep);
                      }}
                      className="text-subtle hover:text-emerald-500 transition-colors"
                      title="Edit Repayment"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    +₹{rep.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
