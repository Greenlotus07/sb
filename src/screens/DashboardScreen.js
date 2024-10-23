import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Card, Title, Text, Button, useTheme } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { TradingEngine } from '../trading/engine';

export const DashboardScreen = () => {
  const theme = useTheme();
  const [tradingData, setTradingData] = useState({
    prices: [],
    positions: [],
    stats: {},
    riskLevel: 0
  });

  const engine = new TradingEngine();

  useEffect(() => {
    const updateInterval = setInterval(async () => {
      const data = await engine.getUpdatedData();
      setTradingData(data);
    }, 1000);

    return () => clearInterval(updateInterval);
  }, []);

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#1a237e', '#0d47a1']}
        style={styles.header}>
        <Title style={styles.headerText}>Warthog V16</Title>
      </LinearGradient>

      <Card style={styles.chartCard}>
        <Card.Content>
          <Title>Price Movement</Title>
          <LineChart
            data={{
              labels: tradingData.prices.map((_, i) => ''),
              datasets: [{
                data: tradingData.prices
              }]
            }}
            width={350}
            height={220}
            chartConfig={{
              backgroundColor: '#022173',
              backgroundGradientFrom: '#022173',
              backgroundGradientTo: '#1b3fa0',
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            }}
          />
        </Card.Content>
      </Card>

      <Card style={styles.statsCard}>
        <Card.Content>
          <Title>Trading Statistics</Title>
          {Object.entries(tradingData.stats).map(([key, value]) => (
            <Text key={key}>{`${key}: ${value}`}</Text>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.positionsCard}>
        <Card.Content>
          <Title>Active Positions</Title>
          {tradingData.positions.map((position, index) => (
            <Text key={index}>
              {`${position.symbol}: ${position.side} @ ${position.price}`}
            </Text>
          ))}
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button mode="contained" onPress={() => engine.startTrading()}>
          Start Trading
        </Button>
        <Button mode="outlined" onPress={() => engine.stopTrading()}>
          Stop Trading
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    padding: 20,
    alignItems: 'center'
  },
  headerText: {
    color: 'white',
    fontSize: 24
  },
  chartCard: {
    margin: 10,
    elevation: 4
  },
  statsCard: {
    margin: 10,
    elevation: 4
  },
  positionsCard: {
    margin: 10,
    elevation: 4
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10
  }
});