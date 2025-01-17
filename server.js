const WebSocket = require('ws');
const axios = require('axios');
const crypto = require('crypto');

// Binance API keys (replace with your keys)
const API_KEY = '<your-api-key>';
const SECRET_KEY = '<your-secret-key>';

// Symbol and Binance Trade WebSocket URL
const symbol = 'btcusdt'; // Example: BTC/USDT trading pair
const tradeWsUrl = `wss://stream.binance.com:9443/ws/${symbol}@trade`;

// Binance REST API Base URL
const binanceApiBase = 'https://api.binance.com';

// Function to place a market buy order
const placeMarketOrder = async (symbol, quantity,side,type) => {
    try {
        const endpoint = '/api/v3/order';
        const timestamp = Date.now();

        // Create the query string
        const query = `symbol=${symbol.toUpperCase()}&side=${side.toUpperCase()}&type=${type.toUpperCase()}&quantity=${quantity}&timestamp=${timestamp}`;

        // Sign the query string with your secret key
        const signature = crypto.createHmac('sha256', SECRET_KEY).update(query).digest('hex');

        // Send the API request
        const response = await axios.post(`${binanceApiBase}${endpoint}?${query}&signature=${signature}`, null, {
            headers: { 'X-MBX-APIKEY': API_KEY },
        });

        console.log('Market Buy Order Placed:', response.data);
    } catch (error) {
        console.error('Error placing market buy order:', error.response?.data || error.message);
    }
};

// WebSocket for Trade Stream
const ws = new WebSocket(tradeWsUrl);

// Handle WebSocket connection opening
ws.on('open', () => {
    console.log(`Connected to Binance Trade Stream for ${symbol}`);
});

// Handle incoming WebSocket messages
ws.on('message', async (data) => {
    const tradeData = JSON.parse(data);
    console.log('Trade Data:', tradeData);

    const price = parseFloat(tradeData.p); // Current price
    const quantity = 0.001; // Amount to buy (in BTC, adjust as needed)
    const side = "BUY"; // Side to buy (in Buy, adjust as needed)
    const type = "MARKET"; // Type to buy (in Market, adjust as needed)

    // Example: Automatically place a market buy order when price drops below a certain threshold
    const priceThreshold = 27000; // Example threshold
    if (price < priceThreshold) {
        console.log(`Price dropped below ${priceThreshold}, placing market buy order...`);
        await placeMarketOrder(symbol, quantity,side,type);
    }
});

// Handle WebSocket errors
ws.on('error', (error) => {
    console.error('WebSocket Error:', error);
});

// Handle WebSocket closure
ws.on('close', () => {
    console.log('WebSocket connection closed');
});