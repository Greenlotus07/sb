export class RiskManager {
  constructor(config) {
    this.config = config;
    this.volatilityHistory = new Map();
  }

  calculateDynamicRisk(symbol, currentPrice, volatility) {
    // Base risk starts at minimum
    let riskPercentage = this.config.baseRiskPercentage;
    
    // Adjust risk based on volatility
    if (volatility < this.config.volatilityThreshold) {
      riskPercentage = Math.min(
        riskPercentage * (1 + volatility),
        this.config.maxRiskPercentage
      );
    } else {
      riskPercentage = Math.max(
        this.config.baseRiskPercentage,
        riskPercentage * (1 - volatility/10)
      );
    }

    return {
      riskPercentage,
      stopLoss: currentPrice * (1 - this.config.stopLossPercentage / 100),
      maxPositionSize: this.calculatePositionSize(riskPercentage, currentPrice)
    };
  }

  calculatePositionSize(riskPercentage, currentPrice) {
    const accountBalance = this.getAccountBalance();
    return (accountBalance * (riskPercentage / 100)) / currentPrice;
  }

  updateVolatility(symbol, price) {
    if (!this.volatilityHistory.has(symbol)) {
      this.volatilityHistory.set(symbol, []);
    }
    
    const history = this.volatilityHistory.get(symbol);
    history.push(price);
    
    if (history.length > this.config.volatilityWindow) {
      history.shift();
    }
    
    return this.calculateVolatility(history);
  }

  calculateVolatility(prices) {
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
    
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
    return Math.sqrt(variance);
  }
}