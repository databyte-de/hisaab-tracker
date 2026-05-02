import { useState, useEffect } from "react";
import { api } from "../lib/api";
import type { Entry, Repayment } from "../types";

export function useHisaabData() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await api.getEntries();
      setEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load data"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addEntry = async (entry: any) => {
    const newEntry = await api.addEntry(entry);
    await fetchData();
    return newEntry;
  };

  const addRepayment = async (
    repayment: Omit<Repayment, "id" | "created_at">,
  ) => {
    const newRepay = await api.addRepayment(repayment);
    // Let's refetch completely to handle sum/balances cleanly
    await fetchData();
    return newRepay;
  };

  const addRepaymentForPerson = async (
    personEntries: Entry[],
    amount: number,
    date: string | null,
    note: string | null
  ) => {
    // Sort entries oldest first
    const sortedEntries = [...personEntries].sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime());
    let remainingPayment = amount;
    const newRepayments: Omit<Repayment, "id" | "created_at">[] = [];

    for (const entry of sortedEntries) {
      if (remainingPayment <= 0) break;
      const repaid = entry.repayments?.reduce((sum, r) => sum + r.amount_received, 0) || 0;
      const entryBalance = entry.amount - repaid;
      
      if (entryBalance > 0) {
        // We can only put as much as the remaining payment, up to the entry's balance
        const chunk = Math.min(remainingPayment, entryBalance);
        newRepayments.push({
          entry_id: entry.id,
          amount_received: chunk,
          note,
          date
        });
        remainingPayment -= chunk;
      }
    }

    // If there's still remainingPayment (overpaid or exact match but floating point), 
    // put it on the newest entry
    if (remainingPayment > 0.001 && sortedEntries.length > 0) {
      const newestEntry = sortedEntries[sortedEntries.length - 1];
      newRepayments.push({
        entry_id: newestEntry.id,
        amount_received: remainingPayment,
        note,
        date
      });
    }

    if (newRepayments.length > 0) {
      await api.addRepayments(newRepayments);
      await fetchData();
    }
  };

  const markSettled = async (id: string, is_settled: boolean) => {
    await api.updateEntrySettledStatus(id, is_settled);
    await fetchData();
  };

  const markPersonSettled = async (entryIds: string[], is_settled: boolean) => {
    await api.updateEntriesSettledStatus(entryIds, is_settled);
    await fetchData();
  };

  const editEntry = async (id: string, updates: any) => {
    await api.updateEntry(id, updates);
    await fetchData();
  };

  const editRepayment = async (id: string, updates: any) => {
    await api.updateRepayment(id, updates);
    await fetchData();
  };

  const deleteEntry = async (id: string) => {
    await api.deleteEntry(id);
    await fetchData();
  };

  const deleteRepayment = async (id: string) => {
    await api.deleteRepayment(id);
    await fetchData();
  };

  return {
    entries,
    loading,
    error,
    addEntry,
    addRepayment,
    addRepaymentForPerson,
    markSettled,
    markPersonSettled,
    editEntry,
    editRepayment,
    deleteEntry,
    deleteRepayment,
    refetch: fetchData,
  };
}
