import ccxt from 'ccxt';
import { config } from './config.js';
import { RiskManager } from './riskManager.js';
import { TechnicalAnalyzer } from './indicators.js';
import { Dashboard } from './ui/dashboard.js';
import dotenv from 'dotenv';

dotenv.config();

class WarthogV16 {
  constructor() {
    this.exchange = new ccxt.binance({
      apiKey: process.env.API_KEY,
      secret: process.env.API_SECRET
    });
    this.riskManager = new RiskManager(config);
    this.analyzer = new TechnicalAnalyzer(config);
    this.activePositions = new Map();
    this.dashboard = new Dashboard();
    this.priceHistory = new Map();
  }

  async start() {
    this.dashboard.logTrade('🚀 Initializing Warthog V16...', 'info');
    
    while (true) {
      for (const symbol of config.tradingPairs) {
        try {
          await this.analyzePair(symbol);
          await this.updateDashboard(symbol);
        } catch (error) {
          this.dashboard.logTrade(`Error analyzing ${symbol}: ${error.message}`, 'error');
        }
        await this.sleep(1000);
      }
    }
  }

  async analyzePair(symbol) {
    const prices = await this.fetchPrices(symbol);
    const currentPrice = prices[prices.length - 1];
    
    this.updatePriceHistory(symbol, currentPrice);
    
    const volatility = this.riskManager.updateVolatility(symbol, currentPrice);
    const riskParams = this.riskManager.calculateDynamicRisk(symbol, currentPrice, volatility);
    const analysis = await this.analyzer.analyzeMarket(prices);
    
    await this.executeTrade(symbol, analysis, riskParams, currentPrice);
  }

  updatePriceHistory(symbol, price) {
    if (!this.priceHistory.has(symbol)) {
      this.priceHistory.set(symbol, []);
    }
    const history = this.priceHistory.get(symbol);
    history.push(price);
    if (history.length > 100) history.shift();
  }

  async updateDashboard(symbol) {
    const prices = this.priceHistory.get(symbol) || [];
    const times = [...Array(prices.length).keys()];
    
    this.dashboard.updatePriceChart({
      times,
      prices
    });

    const stats = this.calculateStats();
    this.dashboard.updateStats(stats);

    const positions = Array.from(this.activePositions.entries()).map(([sym, pos]) => [
      sym,
      pos.side,
      pos.entryPrice.toFixed(2),
      this.calculatePnL(pos).toFixed(2) + '%'
    ]);
    this.dashboard.updatePositions(positions);

    const riskLevel = this.riskManager.getCurrentRiskLevel();
    this.dashboard.updateRiskGauge(riskLevel);

    const sentiment = this.analyzer.getMarketSentiment();
    this.dashboard.updateSentiment(sentiment.bullish, sentiment.bearish);

    this.dashboard.refresh();
  }

  calculateStats() {
    return {
      'Total Trades': this.getTotalTrades(),
      'Win Rate': this.getWinRate().toFixed(2) + '%',
      'Daily PnL': this.getDailyPnL().toFixed(2) + '%',
      'Best Trade': this.getBestTrade().toFixed(2) + '%'
    };
  }

  calculatePnL(position) {
    const currentPrice = this.priceHistory.get(position.symbol).slice(-1)[0];
    return position.side === 'buy'
      ? ((currentPrice - position.entryPrice) / position.entryPrice) * 100
      : ((position.entryPrice - currentPrice) / position.entryPrice) * 100;
  }

  async executeTrade(symbol, analysis, riskParams, currentPrice) {
    const position = this.activePositions.get(symbol);
    
    if (position) {
      if (currentPrice <= position.stopLoss) {
        await this.closePosition(symbol, position);
        this.dashboard.logTrade(`🛑 Stop loss triggered for ${symbol}`, 'warning');
      } else if (this.shouldTakeProfit(position, currentPrice)) {
        await this.closePosition(symbol, position);
        this.dashboard.logTrade(`✨ Take profit reached for ${symbol}`, 'success');
      }
    } else if (analysis.confidence > 0.7) {
      if (analysis.signal === 'BUY') {
        await this.openPosition(symbol, 'buy', riskParams, currentPrice);
        this.dashboard.logTrade(`🔥 Opening BUY position for ${symbol}`, 'success');
      } else if (analysis.signal === 'SELL') {
        await this.openPosition(symbol, 'sell', riskParams, currentPrice);
        this.dashboard.logTrade(`💫 Opening SELL position for ${symbol}`, 'success');
      }
    }
  }

  // ... [Previous methods remain the same: openPosition, closePosition, shouldTakeProfit, fetchPrices, sleep]
}

// Start the bot
const bot = new WarthogV16();
bot.start().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});