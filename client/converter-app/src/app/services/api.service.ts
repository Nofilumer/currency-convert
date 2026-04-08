import { environment } from '../../environments/environment';

const base = environment.baseApiUrl || '';

export async function getCurrencies() {
  const resp = await fetch(`${base}/currencies`);
  if (!resp.ok) throw new Error('Failed to fetch currencies');
  return resp.json();
}

export async function getLatest(baseCurrency: string, currencies: string) {
  const resp = await fetch(`${base}/currencies/latest?base_currency=${encodeURIComponent(baseCurrency)}&currencies=${encodeURIComponent(currencies)}`);
  if (!resp.ok) throw new Error('Failed to fetch latest');
  return resp.json();
}
