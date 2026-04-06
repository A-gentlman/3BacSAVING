
export function formatMAD(amount: number): string {
  return `${amount.toLocaleString('fr-MA', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} MAD`;
}

export function formatRiyal(madAmount: number): string {
  const riyal = madAmount * 20;
  return `${riyal.toLocaleString('fr-MA', { maximumFractionDigits: 0 })} Riyal`;
}

export function formatCurrency(amount: number, currency: 'MAD' | 'Riyal'): string {
  if (currency === 'Riyal') {
    return formatRiyal(amount);
  }
  return formatMAD(amount);
}

export function formatBoth(madAmount: number, preferredCurrency: 'MAD' | 'Riyal' = 'MAD'): string {
  return formatCurrency(madAmount, preferredCurrency);
}
