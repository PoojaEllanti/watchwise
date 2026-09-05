import yfinance as yf
from datetime import datetime


def get_market_data(symbol: str):
    symbol = symbol.upper().strip()

    try:
        # First try the symbol exactly as entered
        ticker = yf.Ticker(symbol)
        history = ticker.history(period="5d")

        # If no data is found, try NSE suffix
        if history.empty and "." not in symbol:
            nse_symbol = f"{symbol}.NS"

            ticker = yf.Ticker(nse_symbol)
            history = ticker.history(period="5d")

        # If still no data, return unavailable
        if history.empty:
            return None

        # Get latest available trading day's data
        latest = history.iloc[-1]

        price = float(latest["Close"])

        if price <= 0:
            return None

        return {
            "symbol": symbol,
            "price": price,
            "timestamp": datetime.utcnow()
        }

    except Exception as e:
        print(f"Market data error for {symbol}: {e}")
        return None