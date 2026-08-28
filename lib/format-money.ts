export function formatMoney(amount: number | null) {
  return amount === null ? "—" : `${amount.toLocaleString("da-DK")} kr.`;
}
