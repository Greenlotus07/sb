import { RSI, EMA, MACD } from 'technicalindicators';

export class TechnicalAnalyzer {
  constructor(config) {
    this.config = config;
  }

  async analyzeMarket(prices) {
    const signals = {
      rsi: await this.calculateRSI(prices),
      ema: await this.calculateEMAs(prices),
      macd: await this.calculateMACD(prices),
      trend: this.determineTrend(prices)
    };

    return this.generateSignal(signals);
  }

  calculateRSI(prices) {
    return RSI.calculate({
      values: prices,
      period: this.config.rsiPeriod
    });
  }

  calculateEMAs(prices) {
    return this.config.emaPeriods.map(period => 
      EMA.calculate({
        values: prices,
        period: period
      })
    );
  }

  calculateMACD(prices) {
    return MACD.calculate({
      values: prices,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9
    });
  }

  determineTrend(prices) {
    const shortEMA = EMA.calculate({
      values: prices,
      period: this.config.emaPeriods[0]
    });

    const longEMA = EMA.calculate({
      values: prices,
      period: this.config.emaPeriods[2]
    });

    return shortEMA[shortEMA.length - 1] > longEMA[longEMA.length - 1] ? 'UPTREND' : 'DOWNTREND';
  }

  generateSignal(signals) {
    let signal = 'NEUTRAL';
    const lastRSI = signals.rsi[signals.rsi.length - 1];
    
    if (signals.trend === 'UPTREND' && lastRSI < 70) {
      if (signals.macd[signals.macd.length - 1].histogram > 0) {
        signal = 'BUY';
      }
    } else if (signals.trend === 'DOWNTREND' && lastRSI > 30) {
      if (signals.macd[signals.macd.length - 1].histogram < 0) {
        signal = 'SELL';
      }
    }

    return {
      signal,
      confidence: this.calculateSignalConfidence(signals)
    };
  }

  calculateSignalConfidence(signals) {
    let confidence = 0;
    const lastRSI = signals.rsi[signals.rsi.length - 1];
    
    // RSI confidence
    if (lastRSI < 30 || lastRSI > 70) confidence += 0.3;
    
    // Trend confidence
    if (signals.trend === 'UPTREND') confidence += 0.3;
    
    // MACD confidence
    const lastMACD = signals.macd[signals.macd.length - 1];
    if (Math.abs(lastMACD.histogram) > 0.5) confidence += 0.4;
    
    return confidence;
  }
}