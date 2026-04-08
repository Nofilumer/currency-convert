import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CurrencyService {
  private readonly apiKey = '4E0VK7BnkdeUuh1vegAt808v2IUjzUR6lxcvBMT2';
  private readonly baseUrl = 'https://api.freecurrencyapi.com/v1/currencies';

  async fetchCurrencies(currencies?: string): Promise<any> {
    try {
      const params: Record<string, string> = { apikey: this.apiKey };
      if (currencies) { params.currencies = currencies; }

      const resp = await axios.get(this.baseUrl, { params, timeout: 5000 });
      if (resp.status !== 200) {
        throw new HttpException('Upstream service error', HttpStatus.BAD_GATEWAY);
      }
      return resp.data?.data ?? {};
    } catch (err) {
      // wrap axios errors for clarity
      const message = err?.response?.data || err?.message || 'Unknown error';
      throw new HttpException(message, HttpStatus.BAD_GATEWAY);
    }
  }

  /**
   * Fetch latest conversion rates from upstream API.
   * If baseCurrency is provided, the API will return rates relative to that currency.
   */
  async fetchLatest(baseCurrency?: string, currencies?: string): Promise<{ data: Record<string, number>, meta?: any }> {
    try {
      const params: Record<string, string> = { apikey: this.apiKey };
      if (baseCurrency) { params.base_currency = baseCurrency; }
      if (currencies) { params.currencies = currencies; }

      const resp = await axios.get('https://api.freecurrencyapi.com/v1/latest', { params, timeout: 5000 });
      if (resp.status !== 200) {
        throw new HttpException('Upstream service error', HttpStatus.BAD_GATEWAY);
      }
      return { data: resp.data?.data ?? {}, meta: resp.data?.meta };
    } catch (err) {
      const message = err?.response?.data || err?.message || 'Unknown error';
      throw new HttpException(message, HttpStatus.BAD_GATEWAY);
    }
  }
}
