import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
// import { CurrencyService } from ';
import { CurrenciesResponseDto } from './dto/currencies-response.dto';
import { CurrencyService } from './currency.service';

@Controller('currencies')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get()
  async getCurrencies(@Query('currencies') currencies?: string): Promise<CurrenciesResponseDto> {
    try {
      const data = await this.currencyService.fetchCurrencies(currencies);
      return { data };
    } catch (err) {
      // Wrap any error into a well-formed HTTP error for client
      throw new HttpException({ message: 'Failed to fetch currencies', detail: err?.message || err }, HttpStatus.BAD_GATEWAY);
    }
  }

  @Get('latest')
  async getLatest(@Query('base_currency') base_currency?: string, @Query('currencies') currencies?: string) {
    try {
      return await this.currencyService.fetchLatest(base_currency, currencies);
    } catch (err) {
      throw new HttpException({ message: 'Failed to fetch latest rates', detail: err?.message || err }, HttpStatus.BAD_GATEWAY);
    }
  }
}
