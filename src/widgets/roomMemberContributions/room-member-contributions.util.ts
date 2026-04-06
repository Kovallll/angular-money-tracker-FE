import { RoomContributionMember } from '@/shared';

/** Схлопнуть строки одного участника; суммы в основной валюте. */
export function mergeContributorsForPrimary(
  members: RoomContributionMember[],
  primaryCode: string,
  convert: (amount: number, from: string, to: string) => number,
): Array<{ userId: string; name: string; amount: number }> {
  const map = new Map<string, { name: string; amount: number }>();
  for (const m of members) {
    const conv = convert(m.amount, m.currencyCode, primaryCode);
    const prev = map.get(m.userId);
    if (prev) prev.amount += conv;
    else map.set(m.userId, { name: m.name, amount: conv });
  }
  return [...map.entries()]
    .map(([userId, v]) => ({ userId, ...v }))
    .sort((a, b) => b.amount - a.amount);
}
