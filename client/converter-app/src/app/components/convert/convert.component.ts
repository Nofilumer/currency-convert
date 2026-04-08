import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { getCurrencies, getLatest } from '../../services/api.service';

export interface HistoryItem {
  from: string;
  to: string;
  amount: number;
  result: number;
  date: string;
}

@Component({
  selector: 'app-convert',
  standalone: true,
  templateUrl: './convert.component.html',
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatProgressSpinnerModule, MatSnackBarModule]
})
export class ConvertComponent {
  // indicates whether currencies are loaded from the backend
  loadingCurrencies = false;
  // converting flag controls UI while we fetch latest rates
  converting = false;
  amount = 100;
  from = 'USD';
  to = 'EUR';
  result: number | null = null;
  lastUpdated: string | null = null;
  // per-unit rates (to display 1 FROM = X TO and reciprocal)
  unitRate: number | null = null;
  reciprocalRate: number | null = null;

  constructor(private snackBar: MatSnackBar) {}

  // currencies will be loaded from the backend API on init
  currencies: Array<{ code: string; name: string }> = [];

  ngOnInit(): void {
    this.loadCurrenciesFromServer();
  }

  /**
   * Fetch available currencies from backend API. Falls back to the mock list on error.
   */
  async loadCurrenciesFromServer(): Promise<void> {
    this.loadingCurrencies = true;
    try {
      const body = await getCurrencies();
      // API returns { data: { USD: {...}, EUR: {...} } }
      const data = body?.data ?? body;
      if (data && typeof data === 'object') {
        this.currencies = Object.keys(data).map(code => ({ code, name: data[code]?.name || code }));
        // keep sensible defaults if USD/EUR present
        if (!this.currencies.find(c => c.code === this.from)) { this.from = this.currencies[0]?.code ?? this.from; }
        if (!this.currencies.find(c => c.code === this.to)) { this.to = this.currencies[1]?.code ?? this.to; }
      }
    } catch (e) {
      // keep existing mock currencies on error
      console.warn('Could not load currencies from server, using defaults.', e);
      this.snackBar.open('Could not load currencies from server. Using defaults.', 'Close', { duration: 4000 });
    } finally {
      this.loadingCurrencies = false;
    }
  }

  // converting flag controls UI while we fetch latest rates
  // Note: rates are now fetched from the backend; the old local rates object was removed.

  
  private saveConversionToLocalStorage(record: HistoryItem): void {
    try {
      const raw = localStorage.getItem('conversion-history') || '[]';
      const existing = JSON.parse(raw);

      // If existing data is not an array, reset it to a new array with our record.
      if (!Array.isArray(existing)) {
        localStorage.setItem('conversion-history', JSON.stringify([record]));
        return;
      }

      // Insert the new record at the start and keep only the latest 50 entries.
      existing.unshift(record);
      localStorage.setItem('conversion-history', JSON.stringify(existing.slice(0, 50)));
    } catch (e) {
      // If anything fails (storage disabled or parse error), overwrite with a fresh array.
      localStorage.setItem('conversion-history', JSON.stringify([record]));
    }
  }

  
  //  * Convert the current amount from the selected 'from' currency to 'to' currency.

  async convert(): Promise<void> {
    // validate amount before conversion
    if (!this.isAmountValid()) {
      this.snackBar.open('Please enter an amount greater than 0', 'Close', { duration: 4000 });
      return;
    }

    this.converting = true;
    try {
      // Call our backend to get latest rates. We request only the 'to' currency and use 'from' as base.
      const body = await getLatest(this.from, this.to);
      const rate = body?.data?.[this.to];

      if (typeof rate === 'number') {
        const converted = this.amount * rate; // rate is to-target per 1 base currency
        this.result = Number(converted.toFixed(2));
        this.unitRate = rate;
        this.reciprocalRate = rate !== 0 ? Number((1 / rate).toFixed(8)) : null;
      } else {
        // fallback: keep old behavior with local (no-op)
        console.warn('Latest rate not available, falling back to 1:1');
        this.result = Number(this.amount.toFixed(2));
        this.unitRate = 1;
        this.reciprocalRate = 1;
      }

      const record: HistoryItem = {
        from: this.from,
        to: this.to,
        amount: this.amount,
        result: this.result ?? this.amount,
        date: new Date().toISOString()
      };
      this.saveConversionToLocalStorage(record);
      this.lastUpdated = new Date().toLocaleTimeString();
    } catch (e) {
      console.error('Conversion failed, please try again', e);
      this.snackBar.open('Conversion failed — please try again', 'Close', { duration: 4000 });
    } finally {
      this.converting = false;
    }
  }

  /** Simple amount validation: must be a number > 0 */
  isAmountValid(): boolean {
    return typeof this.amount === 'number' && isFinite(this.amount) && this.amount > 0;
  }
}
