# Cryptocurrency Trading Bot

An advanced automated cryptocurrency trading platform with sophisticated algorithms, real-time market analysis, risk management, and comprehensive reporting.

## Features

### Core Trading Features
- **Automated Trading**: Execute trades based on custom strategies and market conditions
- **Multiple Exchanges**: Support for major exchanges (Binance, Coinbase, Kraken, etc.)
- **Real-time Data**: Live market data, order books, and price feeds
- **Strategy Engine**: Custom trading strategies with backtesting capabilities
- **Risk Management**: Stop-loss, take-profit, position sizing, and portfolio limits
- **Paper Trading**: Test strategies without real money

### Trading Strategies
- **Technical Analysis**: RSI, MACD, Bollinger Bands, Moving Averages, Stochastic
- **Arbitrage**: Cross-exchange arbitrage opportunities
- **Grid Trading**: Automated grid trading with customizable parameters
- **DCA (Dollar Cost Averaging)**: Systematic investment strategies
- **Momentum Trading**: Trend-following and momentum-based strategies
- **Mean Reversion**: Statistical arbitrage and mean reversion strategies
- **Custom Strategies**: User-defined algorithms and indicators

### Risk Management
- **Position Sizing**: Dynamic position sizing based on volatility and risk
- **Stop Loss**: Automatic stop-loss orders with trailing stops
- **Take Profit**: Multiple take-profit levels and profit targets
- **Portfolio Limits**: Maximum exposure and drawdown limits
- **Correlation Analysis**: Portfolio diversification and risk assessment
- **Volatility Adjustment**: Dynamic risk adjustment based on market conditions

### Analytics & Reporting
- **Performance Dashboard**: Real-time P&L, win rate, and performance metrics
- **Trade History**: Detailed trade logs with entry/exit analysis
- **Backtesting**: Historical strategy testing with realistic simulations
- **Portfolio Analytics**: Risk metrics, Sharpe ratio, maximum drawdown
- **Market Analysis**: Technical indicators and market sentiment analysis
- **Custom Reports**: PDF and Excel reports with customizable metrics

### Advanced Features
- **Machine Learning**: AI-powered price prediction and strategy optimization
- **Sentiment Analysis**: Social media and news sentiment integration
- **News Trading**: Automated trading based on news events and announcements
- **Multi-timeframe Analysis**: Strategy execution across different timeframes
- **API Integration**: Webhook support and third-party integrations
- **Mobile App**: Real-time monitoring and control via mobile application

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** for data storage
- **Redis** for caching and real-time data
- **Socket.io** for real-time updates
- **CCXT** for exchange integrations
- **Technical Indicators** for market analysis
- **Bull** for job queues and scheduling

### Frontend
- **React** with TypeScript
- **Chart.js** for data visualization
- **Socket.io Client** for real-time updates
- **Tailwind CSS** for styling
- **React Query** for data fetching
- **Framer Motion** for animations

### Infrastructure
- **Docker** for containerization
- **AWS/DigitalOcean** for deployment
- **MongoDB Atlas** for database
- **Redis Cloud** for caching
- **Cloudflare** for CDN and security

## Trading Strategies

### 1. Moving Average Crossover
```javascript
// Buy when short MA crosses above long MA
// Sell when short MA crosses below long MA
const strategy = {
  name: 'MA Crossover',
  shortPeriod: 10,
  longPeriod: 30,
  buySignal: 'shortMA > longMA && prevShortMA <= prevLongMA',
  sellSignal: 'shortMA < longMA && prevShortMA >= prevLongMA'
};
```

### 2. RSI Divergence
```javascript
// Buy when price makes lower low but RSI makes higher low
// Sell when price makes higher high but RSI makes lower high
const strategy = {
  name: 'RSI Divergence',
  rsiPeriod: 14,
  overbought: 70,
  oversold: 30,
  divergencePeriod: 5
};
```

### 3. Bollinger Bands Squeeze
```javascript
// Buy when price breaks above upper band after squeeze
// Sell when price breaks below lower band after squeeze
const strategy = {
  name: 'BB Squeeze',
  period: 20,
  stdDev: 2,
  squeezeThreshold: 0.1
};
```

### 4. Grid Trading
```javascript
// Place buy orders at lower prices, sell orders at higher prices
const strategy = {
  name: 'Grid Trading',
  gridLevels: 10,
  gridSpacing: 0.02, // 2% between levels
  totalInvestment: 1000,
  profitTarget: 0.01 // 1% profit per trade
};
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB database
- Redis server
- Exchange API keys
- Telegram bot token (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd crypto-trading-bot
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment setup**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Database setup**
   ```bash
   npm run setup
   ```

5. **Start the bot**
   ```bash
   # Development mode
   npm run dev
   
   # Paper trading
   npm run paper-trade
   
   # Live trading
   npm run live-trade
   ```

### Environment Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/crypto_bot
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Exchange API Keys
BINANCE_API_KEY=your_binance_api_key
BINANCE_SECRET_KEY=your_binance_secret_key
COINBASE_API_KEY=your_coinbase_api_key
COINBASE_SECRET_KEY=your_coinbase_secret_key
KRAKEN_API_KEY=your_kraken_api_key
KRAKEN_SECRET_KEY=your_kraken_secret_key

# Trading Configuration
DEFAULT_STRATEGY=ma_crossover
RISK_PER_TRADE=0.02
MAX_PORTFOLIO_RISK=0.1
STOP_LOSS_PERCENTAGE=0.05
TAKE_PROFIT_PERCENTAGE=0.1

# Notifications
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

# External APIs
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
NEWS_API_KEY=your_news_api_key
TWITTER_BEARER_TOKEN=your_twitter_bearer_token

# Security
ENCRYPTION_KEY=your_encryption_key
SESSION_SECRET=your_session_secret
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Trading
- `GET /api/trading/strategies` - Get available strategies
- `POST /api/trading/start` - Start trading bot
- `POST /api/trading/stop` - Stop trading bot
- `GET /api/trading/status` - Get bot status
- `POST /api/trading/strategy` - Update trading strategy

### Portfolio
- `GET /api/portfolio/balance` - Get account balance
- `GET /api/portfolio/positions` - Get open positions
- `GET /api/portfolio/history` - Get trade history
- `POST /api/portfolio/risk` - Update risk parameters

### Analytics
- `GET /api/analytics/performance` - Get performance metrics
- `GET /api/analytics/backtest` - Run backtest
- `GET /api/analytics/reports` - Generate reports
- `GET /api/analytics/market` - Get market analysis

## Risk Management

### Position Sizing
```javascript
// Kelly Criterion for position sizing
const kellyCriterion = (winRate, avgWin, avgLoss) => {
  return (winRate * avgWin - (1 - winRate) * avgLoss) / avgWin;
};

// Risk-based position sizing
const positionSize = (accountBalance, riskPerTrade, stopLossPercentage) => {
  return (accountBalance * riskPerTrade) / stopLossPercentage;
};
```

### Stop Loss Strategies
```javascript
// Trailing stop loss
const trailingStop = (entryPrice, currentPrice, trailingPercentage) => {
  const profit = (currentPrice - entryPrice) / entryPrice;
  if (profit > trailingPercentage) {
    return currentPrice * (1 - trailingPercentage);
  }
  return entryPrice * (1 - 0.05); // 5% stop loss
};
```

## Deployment

### Docker Deployment
```bash
# Build image
docker build -t crypto-trading-bot .

# Run container
docker run -d --name crypto-bot \
  -p 3000:3000 \
  -e MONGODB_URI=your_mongodb_uri \
  -e REDIS_URL=your_redis_url \
  crypto-trading-bot
```

### Production Setup
1. Set up MongoDB Atlas cluster
2. Configure Redis Cloud instance
3. Set up exchange API keys
4. Configure SSL certificates
5. Set up monitoring and logging
6. Configure backup strategies

## Security Features

- **API Key Encryption**: Secure storage of exchange API keys
- **Rate Limiting**: Prevent abuse and API limits
- **Input Validation**: Sanitize all user inputs
- **CORS Protection**: Configured for production
- **Helmet.js**: Security headers
- **Session Management**: Secure session handling
- **Audit Logging**: Track all trading activities

## Support

For support and questions:
- Email: support@cryptobot.com
- Documentation: docs.cryptobot.com
- Community: community.cryptobot.com

## Disclaimer

This software is for educational and research purposes. Trading cryptocurrencies involves substantial risk of loss. Use at your own risk. The authors are not responsible for any financial losses.

## License

MIT License - see LICENSE file for details 