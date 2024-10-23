import blessed from 'blessed';
import contrib from 'blessed-contrib';
import gradient from 'gradient-string';
import chalk from 'chalk';

export class Dashboard {
  constructor() {
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'Warthog V16'
    });

    this.grid = new contrib.grid({
      rows: 12,
      cols: 12,
      screen: this.screen
    });

    this.initializeComponents();
    this.setupKeyBindings();
  }

  initializeComponents() {
    // Title and Status
    this.header = this.grid.set(0, 0, 1, 12, blessed.box, {
      content: gradient.rainbow('🐗 WARTHOG V16 - Advanced Trading System'),
      align: 'center',
      style: {
        fg: 'white',
        bold: true
      }
    });

    // Live Chart
    this.priceChart = this.grid.set(1, 0, 4, 6, contrib.line, {
      style: {
        line: 'yellow',
        text: 'green',
        baseline: 'white'
      },
      xLabelPadding: 3,
      xPadding: 5,
      label: 'Price Movement',
      showLegend: true
    });

    // Trading Stats
    this.stats = this.grid.set(1, 6, 2, 6, contrib.table, {
      keys: true,
      fg: 'green',
      label: 'Trading Statistics',
      columnSpacing: 2,
      columnWidth: [15, 12]
    });

    // Active Positions
    this.positions = this.grid.set(3, 6, 2, 6, contrib.table, {
      keys: true,
      fg: 'white',
      label: 'Active Positions',
      columnSpacing: 2,
      columnWidth: [12, 12, 12, 12]
    });

    // Trading Log
    this.log = this.grid.set(5, 0, 4, 12, blessed.log, {
      fg: 'green',
      label: 'Trading Log',
      tags: true,
      border: {
        type: 'line'
      }
    });

    // Risk Monitor
    this.riskGauge = this.grid.set(9, 0, 3, 4, contrib.gauge, {
      label: 'Risk Level',
      percent: [0],
      stroke: 'green',
      fill: ['white']
    });

    // Market Sentiment
    this.sentiment = this.grid.set(9, 4, 3, 4, contrib.donut, {
      label: 'Market Sentiment',
      radius: 8,
      arcWidth: 3,
      remainColor: 'black',
      yPadding: 2
    });

    // Performance
    this.performance = this.grid.set(9, 8, 3, 4, contrib.line, {
      style: {
        line: 'cyan',
        text: 'white',
        baseline: 'white'
      },
      label: 'Performance',
      showLegend: true
    });
  }

  setupKeyBindings() {
    this.screen.key(['escape', 'q', 'C-c'], () => process.exit(0));
    this.screen.key('r', () => this.refresh());
  }

  updatePriceChart(data) {
    this.priceChart.setData({
      title: 'Price Movement',
      x: data.times,
      y: data.prices
    });
  }

  updateStats(stats) {
    this.stats.setData({
      headers: ['Metric', 'Value'],
      data: Object.entries(stats)
    });
  }

  updatePositions(positions) {
    this.positions.setData({
      headers: ['Symbol', 'Side', 'Price', 'PnL'],
      data: positions
    });
  }

  logTrade(message, type = 'info') {
    const colors = {
      info: chalk.blue,
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red
    };
    this.log.log(colors[type](message));
  }

  updateRiskGauge(riskLevel) {
    this.riskGauge.setPercent(riskLevel);
  }

  updateSentiment(bullish, bearish) {
    this.sentiment.setData([
      {percent: bullish, label: 'Bullish', color: 'green'},
      {percent: bearish, label: 'Bearish', color: 'red'}
    ]);
  }

  refresh() {
    this.screen.render();
  }
}