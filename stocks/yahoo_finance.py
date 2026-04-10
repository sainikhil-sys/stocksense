"""
Yahoo Finance data fetcher using yfinance library.
All prices are in the currency returned by Yahoo Finance.
For Indian stocks, append .NS (NSE) or .BO (BSE) to the ticker.
"""
import yfinance as yf
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

PERIOD_MAP = {
    '1D': ('1d',  '5m'),
    '1W': ('5d',  '30m'),
    '1M': ('1mo', '1d'),
    '3M': ('3mo', '1d'),
    '1Y': ('1y',  '1wk'),
}


def search_stocks(query: str) -> list:
    """Search stocks using yfinance Ticker lookup."""
    try:
        ticker = yf.Ticker(query.upper())
        info = ticker.info
        if info.get('symbol'):
            return [_format_stock_item(info)]
    except Exception:
        pass
    # Try appending .NS for Indian stocks
    try:
        ticker = yf.Ticker(f"{query.upper()}.NS")
        info = ticker.info
        if info.get('symbol'):
            return [_format_stock_item(info)]
    except Exception:
        pass
    return []


def _format_stock_item(info: dict) -> dict:
    return {
        'symbol':   info.get('symbol', ''),
        'name':     info.get('longName') or info.get('shortName', ''),
        'exchange': info.get('exchange', ''),
        'sector':   info.get('sector', ''),
    }


def get_stock_detail(symbol: str) -> dict:
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        hist_1y = ticker.history(period='1y')
        return_1y = None
        if not hist_1y.empty and len(hist_1y) > 1:
            first = hist_1y['Close'].iloc[0]
            last  = hist_1y['Close'].iloc[-1]
            return_1y = round(((last - first) / first) * 100, 2)

        price     = info.get('currentPrice') or info.get('regularMarketPrice') or 0
        prev_close = info.get('previousClose') or price
        change    = round(price - prev_close, 2)
        change_pct = round(((change / prev_close) * 100) if prev_close else 0, 2)

        # Simple risk classification
        beta = info.get('beta', 1)
        if beta is None: beta = 1
        risk = 'Low' if beta < 0.8 else 'High' if beta > 1.5 else 'Medium'

        return {
            'symbol':        info.get('symbol', symbol),
            'name':          info.get('longName') or info.get('shortName', ''),
            'exchange':      info.get('exchange', ''),
            'price':         round(price, 2),
            'change':        change,
            'change_pct':    change_pct,
            'week52_high':   info.get('fiftyTwoWeekHigh'),
            'week52_low':    info.get('fiftyTwoWeekLow'),
            'pe_ratio':      info.get('trailingPE'),
            'market_cap':    info.get('marketCap'),
            'volume':        info.get('volume'),
            'beta':          info.get('beta'),
            'return_1y':     return_1y,
            'sector':        info.get('sector', ''),
            'currency':      info.get('currency', 'INR'),
            'risk_level':    risk,
        }
    except Exception as e:
        logger.error(f"Error fetching stock {symbol}: {e}")
        return {}


def get_stock_history(symbol: str, period: str = '1M') -> list:
    try:
        yf_period, interval = PERIOD_MAP.get(period, ('1mo', '1d'))
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=yf_period, interval=interval)
        data = []
        for ts, row in hist.iterrows():
            data.append({
                'date':  ts.strftime('%Y-%m-%d %H:%M') if interval != '1d' else ts.strftime('%Y-%m-%d'),
                'open':  round(float(row['Open']), 2),
                'high':  round(float(row['High']), 2),
                'low':   round(float(row['Low']), 2),
                'close': round(float(row['Close']), 2),
                'volume': int(row['Volume']),
            })
        return data
    except Exception as e:
        logger.error(f"Error fetching history for {symbol}: {e}")
        return []
