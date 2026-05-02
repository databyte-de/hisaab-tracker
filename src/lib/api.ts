import { supabase } from "./supabase";
import type { Entry, Repayment } from "../types";

export const api = {
  getEntries: async () => {
    const { data, error } = await supabase
      .from("entries")
      .select("*, repayments(*)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Entry[];
  },

  addEntry: async (
    entry: Omit<Entry, "id" | "created_at" | "is_settled" | "repayments">,
  ) => {
    const { data, error } = await supabase
      .from("entries")
      .insert([entry])
      .select()
      .single();

    if (error) throw error;
    return data as Entry;
  },

  addRepayment: async (repayment: Omit<Repayment, "id" | "created_at">) => {
    const { data, error } = await supabase
      .from("repayments")
      .insert([repayment])
      .select()
      .single();

    if (error) throw error;
    return data as Repayment;
  },

  addRepayments: async (repayments: Omit<Repayment, "id" | "created_at">[]) => {
    const { data, error } = await supabase
      .from("repayments")
      .insert(repayments)
      .select();

    if (error) throw error;
    return data as Repayment[];
  },

  updateRepayment: async (id: string, updates: Partial<Omit<Repayment, "id" | "created_at" | "entry_id">>) => {
    const { data, error } = await supabase
      .from("repayments")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Repayment;
  },

  updateEntrySettledStatus: async (id: string, is_settled: boolean) => {
    const { data, error } = await supabase
      .from("entries")
      .update({ is_settled })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Entry;
  },

  updateEntriesSettledStatus: async (ids: string[], is_settled: boolean) => {
    const { data, error } = await supabase
      .from("entries")
      .update({ is_settled })
      .in("id", ids)
      .select();

    if (error) throw error;
    return data as Entry[];
  },

  updateEntry: async (id: string, updates: Partial<Omit<Entry, "id" | "created_at" | "repayments">>) => {
    const { data, error } = await supabase
      .from("entries")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Entry;
  },

  deleteEntry: async (id: string) => {
    const { error } = await supabase.from("entries").delete().eq("id", id);
    if (error) throw error;
  },

  deleteRepayment: async (id: string) => {
    const { error } = await supabase.from("repayments").delete().eq("id", id);
    if (error) throw error;
  },
};
