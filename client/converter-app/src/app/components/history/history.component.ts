import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface HistoryItem {
  from: string;
  to: string;
  amount: number;
  result: number;
  date: string;
}

@Component({
  selector: 'app-history',
  standalone: true,
  templateUrl: './history.component.html',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule]
})
export class HistoryComponent implements OnInit {
  history: HistoryItem[] = [];

  constructor() {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      this.load();
    }
  }

  @HostListener('window:storage', ['$event'])
  onStorage(event: StorageEvent) {
    if (event.key === 'conversion-history' || event.key === null) {
      this.load();
    }
  }

  load() {
    // Load history from localStorage. This is safe even if the data is missing or malformed.
    this.history = this.safeGetHistory();
  }

  clearHistory() {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') { return; }
    const confirmed = window.confirm('Clear all conversion history? This cannot be undone.');
    if (!confirmed) { return; }
    try {
      localStorage.removeItem('conversion-history');
      // Update local view
      this.history = [];
      // Notify other tabs/windows by dispatching a storage event
      try {
        window.dispatchEvent(new StorageEvent('storage', { key: 'conversion-history', newValue: null }));
      } catch (e) {
        // Some browsers don't allow creating StorageEvent directly; as fallback, write then remove a marker
        try {
          localStorage.setItem('__conversion_history_cleared__', Date.now().toString());
          localStorage.removeItem('__conversion_history_cleared__');
        } catch (e2) { /* ignore */ }
      }
    } catch (e) {
      console.error('Failed to clear conversion history', e);
      // best-effort: still clear in-memory view
      this.history = [];
    }
  }

  private safeGetHistory(): HistoryItem[] {
    if (typeof localStorage === 'undefined') { return []; }
    try {
      const raw = localStorage.getItem('conversion-history');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn('Failed to parse conversion-history:', e);
      return [];
    }
  }

  // TrackBy function for better performance with *ngFor
  trackByDate(index: number, item: HistoryItem): string {
    return item.date;
  }
}
