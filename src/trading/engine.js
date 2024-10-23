import { LiteFinanceAPI } from '../api/litefinance';
import { TechnicalAnalyzer } from './indicators';
import { RiskManager } from './riskManager';

export class TradingEngine {
  constructor() {
    this.api = new LiteFinanceAPI(
      process.env.LITE_FINANCE_API_KEY,
      process.env.LITE_FINANCE_API_SECRET
    );
    this.analyzer = new TechnicalAnalyzer();
    this.riskManager = new RiskManager();
    this.isTrading = false;
    this.tradingInterval = null;
  }

  async startTrading() {
    if (this.isTrading) return;
    
    this.isTrading = true;
    this.tradingInterval = setInterval(async () => {
      await this.executeTrading();
    }, 1000);
  }

  stopTrading() {
    this.isTrading = false;
    if (this.tradingInterval) {
      clearInterval(this.tradingInterval);
    }
  }

  async executeTrading() {
    try {
      for (const symbol of ['BTCUSD', 'XAUUSD']) {
        const price = await this.api.getPrice(symbol);
        const analysis = await this.analyzer.analyzeMarket(price);
        const riskParams = this.riskManager.calculateRisk(symbol, price);

        if (analysis.confidence > 0.7) {
          if (analysis.signal === 'BUY') {
            await this.api.createOrder(symbol, 'market', 'buy', riskParams.size);
          } else if (analysis.signal === 'SELL') {
            await this.api.createOrder(symbol, 'market', 'sell', riskParams.size);
          }
        }

        // Manage existing positions
        const positions = await this.api.getOpenPositions();
        for (const position of positions) {
          if (this.shouldClosePosition(position, price)) {
            await this.api.closePosition(position.id);
          }
        }
      }
    } catch (error) {
      console.error('Trading error:', error);
    }
  }

  shouldClosePosition(position, currentPrice) {
    const pnl = this.calculatePnL(position, currentPrice);
    return pnl >= 5 || pnl <= -2; // Take profit at 5%, stop loss at 2%
  }

  calculatePnL(position, currentPrice) {
    return position.side === 'buy'
      ? ((currentPrice - position.entryPrice) / position.entryPrice) * 100
      : ((position.entryPrice - currentPrice) / position.entryPrice) * 100;
  }

  async getUpdatedData() {
    const positions = await this.api.getOpenPositions();
    const prices = await Promise.all(['BTCUSD', 'XAUUSD'].map(
      symbol => this.api.getPrice(symbol)
    ));

    return {
      prices,
      positions,
      stats: await this.getStats(),
      riskLevel: this.riskManager.getCurrentRiskLevel()
    };
  }

  async getStats() {
    const account = await this.api.getAccountInfo();
    return {
      balance: account.balance,
      equity: account.equity,
      openPositions: account.openPositions,
      dailyPnL: account.dailyPnL
    };
  }
}