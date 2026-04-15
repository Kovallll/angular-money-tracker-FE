import { CategoryItem, GroupTransactionItem, Transaction } from '@/shared';

export function hashUuidToStableInt(uuid: string): number {
  const s = uuid.replace(/-/g, '');
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const n = h | 0;
  return n === 0 ? -1 : n;
}

export function mapGroupTxToTransaction(
  g: GroupTransactionItem,
  catById: Map<string, CategoryItem>,
): Transaction {
  const cat = g.categoryId ? catById.get(String(g.categoryId)) : undefined;
  const dateStr = (g.date || '').includes('T') ? (g.date as string).split('T')[0] : g.date;
  const byName = (g.createdByName ?? '').trim();
  return {
    id: hashUuidToStableInt(g.id),
    groupTransactionId: g.id,
    userId: 0,
    cardId: 0,
    categoryId: 0,
    transferToCardId: g.transferToCardId ?? undefined,
    title: g.title,
    description: g.description ?? undefined,
    category: cat?.title ?? '—',
    amount: g.amount,
    currencyCode: g.currencyCode,
    date: dateStr,
    type: g.type === 'revenue' ? 'revenue' : g.type === 'transfer' ? 'transfer' : 'expense',
    paymentMethod: undefined,
    createdAt: g.createdAt,
    ...(byName && byName !== '—' ? { groupCreatedByName: byName } : {}),
  };
}
