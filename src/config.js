export const config = {
  // Risk Management
  baseRiskPercentage: 1,
  maxRiskPercentage: 5,
  stopLossPercentage: 2,
  
  // Trading Pairs
  tradingPairs: ['BTC/USDT', 'XAUUSD'],
  
  // Timeframes
  timeframes: ['1m', '5m', '15m'],
  
  // Indicators
  rsiPeriod: 14,
  emaPeriods: [9, 21, 50],
  
  // Volatility Settings
  volatilityWindow: 24,
  volatilityThreshold: 2,
  
  // UI Settings
  theme: {
    primary: '#00ff00',
    secondary: '#0088ff',
    accent: '#ff0088',
    background: '#000000',
    text: '#ffffff'
  }
};