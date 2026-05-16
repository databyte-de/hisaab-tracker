import type { Entry } from '../types';
import { formatINR } from './utils';

interface RepaymentGroup {
  date: string | null;
  amount: number;
  note: string | null;
  ids: string[];
}

interface BuildShareMessageArgs {
  personName: string;
  entries: Entry[];
  totalAmount: number;
  totalRepaid: number;
  balance: number;
  allRepaymentsGrouped: RepaymentGroup[];
  isArchived: boolean;
}

function sortByDateAsc<T extends { date: string | null }>(arr: T[]): T[] {
  return [...arr].sort(
    (a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime(),
  );
}

export function buildShareMessage({
  personName,
  entries,
  totalAmount,
  totalRepaid,
  balance,
  allRepaymentsGrouped,
  isArchived,
}: BuildShareMessageArgs): string {
  const sortedEntries = sortByDateAsc(entries);
  const sortedRepayments = sortByDateAsc(allRepaymentsGrouped);

  const entriesBlock = sortedEntries
    .map((e) => `• ${e.purpose} — ₹${formatINR(e.amount)}`)
    .join('\n');

  const repaymentsBlock = sortedRepayments
    .map((r) => `• ₹${formatINR(r.amount)}`)
    .join('\n');

  const hasRepayments = sortedRepayments.length > 0;

  if (isArchived) {
    const lines = [
      'Hisaab-Barabar ✅',
      '',
      'Purpose - Amount',
      entriesBlock,
      `Total: ₹${formatINR(totalAmount)}`,
    ];
    if (hasRepayments) {
      lines.push('', 'Repayments received:', repaymentsBlock, `Total: ₹${formatINR(totalRepaid)}`);
    }
    lines.push('', '— Mohammad Maaz');
    return lines.join('\n');
  }

  const lines = [
    'Purpose - Amount',
    entriesBlock,
    `Total: ₹${formatINR(totalAmount)}`,
  ];
  if (hasRepayments) {
    lines.push('', 'Repayments received:', repaymentsBlock, `Total: ₹${formatINR(totalRepaid)}`);
  }
  lines.push('', `Balance: ₹${formatINR(balance)}`, '', '— Mohammad Maaz');
  return lines.join('\n');
}

export async function shareHisaab(message: string): Promise<void> {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ text: message });
      return;
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
    }
  }
  const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
