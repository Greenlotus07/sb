import axios from 'axios';

export class LiteFinanceAPI {
  constructor(apiKey, apiSecret) {
    this.baseURL = 'https://api.litefinance.com/';
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async getAccountInfo() {
    const response = await this.client.get('/account');
    return response.data;
  }

  async createOrder(symbol, type, side, amount) {
    const response = await this.client.post('/orders', {
      symbol,
      type,
      side,
      amount,
      leverage: 1:100 // LiteFinance default leverage
    });
    return response.data;
  }

  async getPrice(symbol) {
    const response = await this.client.get(`/prices/${symbol}`);
    return response.data;
  }

  async closePosition(positionId) {
    const response = await this.client.post(`/positions/${positionId}/close`);
    return response.data;
  }

  async getOpenPositions() {
    const response = await this.client.get('/positions');
    return response.data;
  }
}