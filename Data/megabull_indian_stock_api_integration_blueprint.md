# ArthVeda AI — External API Integration & Multi-Agent Blueprint

This blueprint maps every endpoint available from **MegaBull Paper Trading API** (`https://api.megabull.in`) and **Indian Stock Market API** (`https://stock.indianapi.in`) to our LangGraph agents, Portfolio Analytics dashboard, and Market Hours guardrails.

---

## 1. Authentication & Base Configuration

| Provider | Base URL | Auth Header | `.env` Key |
| :--- | :--- | :--- | :--- |
| **MegaBull Paper Trading** | `https://api.megabull.in` | `api-key: <token>` | `MEGABULL_API_KEY` |
| **Indian Stock API** | `https://stock.indianapi.in` | `x-api-key: <token>` | `INDIAN_API_KEY` |

---

## 2. MegaBull Paper Trading API Matrix

| Method | Endpoint | Category | Integration Owner | Purpose & Payload Normalization |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/user/my` | User | **Portfolio Analytics & Header** | Fetches investor profile & live **Available Virtual Money** balance (`virtualMoney` / `balance`). |
| `GET` | `/api/holding/my` | Holding | **My Portfolio, Analytics, Observer** | Fetches delivery holdings (`instrumentName`, `instrumentToken`, `qty`, `avgBuyPrice`, `priceAvg`). |
| `GET` | `/api/position/my` | Position | **Portfolio Analytics & Observer** | Fetches active intraday/F&O positions (`qty`, `buyAvg`, `sellAvg`, `pl`). |
| `GET` | `/api/order/my` | Order | **Executer Agent & Analytics** | Lists open, pending, and executed orders (`orderId`, `status`, `transactionType`, `qty`, `price`). |
| `POST` | `/api/order/buysell` | Order | **Executer Agent** | Places live paper `BUY`/`SELL` orders **strictly gated by `Tools/market_hours.py` (09:15–15:30 IST)**. |
| `PUT` | `/api/order/buysell/{orderId}` | Order | **Executer Agent** | Modifies pending limit orders during market hours. |
| `PUT` | `/api/order/bulk/cancel` | Order | **Executer Agent** | Cancels stale unexecuted orders before market close (`03:30 PM IST`). |
| `GET` | `/api/marketwatch/instruments` | Market Watch | **MegaBull Bridge** | Downloads CSV mapping NSE symbols to `instrumentToken` (`downloadUrl`). |
| `GET` | `/api/marketwatch/ltp/{instrumentToken}` | Market Watch | **Observer Agent** | Fast token-level LTP lookup for holdings. |
| `GET` | `/api/marketwatch/my` | Market Watch | **Observer Agent** | Syncs user's saved MegaBull watchlist symbols. |
| `GET` | `/api/report/monthly/{month}/{year}` | Report | **Portfolio Analytics** | Monthly realized/unrealized trading P&L breakdown. |
| `GET` | `/api/report/virtual/{start}/{end}` | Report | **Platform Analytics** | Historical virtual capital ledger across date ranges. |

---

## 3. Indian Stock Market API Matrix (`https://stock.indianapi.in`)

| Method | Endpoint | Integration Owner | Why It Was Selected & How It Powers Our Agents |
| :--- | :--- | :--- | :--- |
| `GET` | `/stock?name={company}` | **Stock Analyzer, Observer, Analytics** | Core fundamentals (`currentPrice`, `trailingPE`, `beta`, `dividendYield`, `52WeekHigh`, `52WeekLow`, `industry`). Resolves company name variants cleanly. |
| `GET` | `/historical_data?stock_name={name}&period={1m\|6m\|1yr\|3yr\|5yr}&filter=price` | **Portfolio Analytics & Stock Bucket** | Powers the **Historical Price Trajectory Chart** when clicking any equity in Portfolio Analytics. |
| `GET` | `/stock_target_price?stock_id={symbol}` | **Portfolio Analytics & Planner Agent** | Fetches institutional **Analyst Consensus Target Prices** (Mean, High, Low, Upside %) so users see upside potential on every holding. |
| `GET` | `/stock_forecasts?stock_id={symbol}&measure_code=EPS&period_type=Annual&data_type=Estimates&age=Current` | **Stock Bucket & Analytics** | Forward EPS & Revenue growth estimates for fundamental conviction scoring. |
| `GET` | `/corporate_actions` & `/recent_announcements` | **Notifier Agent & Analytics** | Surfaces upcoming dividends, splits, bonus issues, and board meetings directly in the Notifier Alerts & Stock Drill-Down drawer. |
| `GET` | `/trending`, `/NSE_most_active`, `/BSE_most_active` | **Stock Analyzer & Market Outlook Chart** | Computes live **Market Breadth (Advancing vs. Declining)**, **Bullish Ratio %**, and top intraday movers for the **Market Conditions & Outlook** panel. |
| `GET` | `/price_shockers` | **Observer & Notifier Agents** | Detects abnormal volume/price breakouts and circuit-limit risks across NSE/BSE equities. |
| `GET` | `/news` | **Notifier Agent (News & Events Tab)** | Feeds real-time Indian equity & macro headlines into the bifurcated Notifier drawer. |
| `GET` | `/industry_search?query={sector}` | **Stock Analyzer Agent** | Maps risk-aligned macro sectors to verified NSE/BSE sector constituents. |
| `GET` | `/fetch_52_week_high_low_data` | **Planner & Analytics** | Identifies proximity to 52-week highs/lows for dip-buying (`BUY`) or profit-booking (`SELL`) signals. |

---

## 4. Recommended Fixes for Data Gaps Observed in Portfolio Analytics

1. **Why Market Conditions & Outlook showed `Advancing: 0 | Declining: 0`**:
   - `/trending` and `/NSE_most_active` on `indianapi.in` can return nested dictionaries (`{"trending_stocks": {"top_gainers": [...], "top_losers": [...]}}`) rather than a flat top-level list. Normalizing both nested dicts and lists resolves live breadth immediately.
2. **Why `ADANIGREEN` Historical Chart & P/E showed `N/A`**:
   - `/stock` and `/historical_data` resolve full company names (`"Adani Green Energy"`) far more reliably than raw ticker symbols (`"ADANIGREEN"`). Resolving `company_name` via `/stock` first and passing that exact name to `/historical_data` (with `filter=price` and fallback `filter=default`) populates the historical chart and P/E cleanly.
3. **Connecting MegaBull Account Telemetry**:
   - Combining `GET /api/user/my` (Available Virtual Cash) + `GET /api/holding/my` (Delivery Holdings) + `GET /api/order/my` (Order Book) gives Portfolio Analytics a complete wealth picture: **Total Account Equity = Live Holdings Value + Available MegaBull Virtual Cash**.