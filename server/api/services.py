import os
import yfinance as yf
from fredapi import Fred
from datetime import datetime, timedelta
from django.conf import settings
import pandas as pd
from typing import Dict, List, Optional


class FREDService:
    """Service for fetching data from FRED API"""
    
    def __init__(self):
        # Get API key from environment variable
        self.api_key = os.getenv('FRED_API_KEY')
        if self.api_key:
            self.fred = Fred(api_key=self.api_key)
        else:
            self.fred = None
    
    def get_economic_indicators(self) -> Dict:
        """Get default economic indicators for dashboard"""
        if not self.fred:
            return self._get_mock_fred_data()
        
        try:
            indicators = {
                'DFF': 'Federal Funds Rate',
                'DFEDTARU': 'Fed Funds Upper Target Rate',
                'DFEDTARL': 'Fed Funds Lower Target Rate', 
                'SOFR': 'Secured Overnight Financing Rate',
                'IORB': 'Interest on Reserve Balances',
                'MORTGAGE30US': '30-Year Fixed Rate Mortgage',
                'DGS10': '10-Year Treasury Constant Maturity Rate',
                'T10Y2Y': '10-Year Treasury Minus 2-Year Treasury',
                'M2SL': 'M2 Money Stock',
                'CPIAUCSL': 'Consumer Price Index',
                'PCE': 'Personal Consumption Expenditures',
                'UNRATE': 'Unemployment Rate',
                'GDP': 'Gross Domestic Product',
                'GDPC1': 'Real Gross Domestic Product'
            }
            
            data = {}
            for series_id, description in indicators.items():
                try:
                    series = self.fred.get_series(series_id, limit=30)
                    if not series.empty:
                        latest = series.iloc[-1]
                        previous = series.iloc[-2] if len(series) > 1 else latest
                        
                        data[series_id] = {
                            'description': description,
                            'current': float(latest),
                            'previous': float(previous),
                            'change': float(latest - previous),
                            'change_percent': float(((latest - previous) / previous) * 100) if previous != 0 else 0,
                            'last_updated': series.index[-1].strftime('%Y-%m-%d'),
                            'historical': [
                                {
                                    'date': date.strftime('%Y-%m-%d'),
                                    'value': float(value)
                                }
                                for date, value in series.tail(30).items()
                            ]
                        }
                except Exception as e:
                    print(f"Error fetching {series_id}: {e}")
                    continue
            
            return {
                'status': 'success',
                'data': data,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"FRED API error: {e}")
            return self._get_mock_fred_data()
    
    def _get_mock_fred_data(self) -> Dict:
        """Fallback mock data when API is unavailable"""
        return {
            "status": "success",
            "data": {
                "DFF": {
                    "description": "Federal Funds Rate",
                    "current": 5.25,
                    "previous": 5.50,
                    "change": -0.25,
                    "change_percent": -4.55,
                    "last_updated": "2024-01-15",
                    "historical": []
                }
            },
            "timestamp": datetime.now().isoformat()
        }


class YahooFinanceService:
    """Service for fetching data from Yahoo Finance"""
    
    def get_market_data(self) -> Dict:
        """Get default market data for dashboard"""
        try:
            symbols = [
                '^GSPC',   # S&P 500
                '^VIX',    # CBOE Volatility Index
                'GC=F',    # Gold Futures
                'XLK',     # Technology Select Sector SPDR Fund
                'XLF',     # Financial Select Sector SPDR Fund
                'XLY',     # Consumer Discretionary Select Sector SPDR Fund
                'XLC',     # Communication Services Select Sector SPDR Fund
                'XLV',     # Health Care Select Sector SPDR Fund
                'XLI',     # Industrial Select Sector SPDR Fund
                'XLP',     # Consumer Staples Select Sector SPDR Fund
                'XLE',     # Energy Select Sector SPDR Fund
                'XLB',     # Materials Select Sector SPDR Fund
                'XLRE',    # Real Estate Select Sector SPDR Fund
                'XLU'      # Utilities Select Sector SPDR Fund
            ]
            
            data = {}
            for symbol in symbols:
                try:
                    ticker = yf.Ticker(symbol)
                    hist = ticker.history(period="30d")
                    info = ticker.info
                    
                    if not hist.empty:
                        latest_close = hist['Close'].iloc[-1]
                        previous_close = hist['Close'].iloc[-2] if len(hist) > 1 else latest_close
                        
                        data[symbol] = {
                            'name': info.get('longName', symbol),
                            'current_price': round(float(latest_close), 2),
                            'previous_close': round(float(previous_close), 2),
                            'change': round(float(latest_close - previous_close), 2),
                            'change_percent': round(float(((latest_close - previous_close) / previous_close) * 100), 2) if previous_close != 0 else 0,
                            'volume': int(hist['Volume'].iloc[-1]) if 'Volume' in hist.columns else 0,
                            'last_updated': hist.index[-1].strftime('%Y-%m-%d'),
                            'historical': [
                                {
                                    'date': date.strftime('%Y-%m-%d'),
                                    'open': round(float(row['Open']), 2),
                                    'high': round(float(row['High']), 2),
                                    'low': round(float(row['Low']), 2),
                                    'close': round(float(row['Close']), 2),
                                    'volume': int(row['Volume']) if 'Volume' in row and pd.notna(row['Volume']) else 0
                                }
                                for date, row in hist.tail(30).iterrows()
                            ]
                        }
                except Exception as e:
                    print(f"Error fetching {symbol}: {e}")
                    continue
            
            return {
                'status': 'success',
                'data': data,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Yahoo Finance API error: {e}")
            return self._get_mock_market_data()
    
    def get_stock_detail(self, symbol: str) -> Dict:
        """Get detailed data for a specific stock"""
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period="1y")
            info = ticker.info
            
            if hist.empty:
                return {"error": f"No data found for symbol {symbol}"}
            
            latest_close = hist['Close'].iloc[-1]
            previous_close = hist['Close'].iloc[-2] if len(hist) > 1 else latest_close
            
            return {
                'status': 'success',
                'data': {
                    'symbol': symbol.upper(),
                    'name': info.get('longName', symbol),
                    'current_price': round(float(latest_close), 2),
                    'change': round(float(latest_close - previous_close), 2),
                    'change_percent': round(float(((latest_close - previous_close) / previous_close) * 100), 2) if previous_close != 0 else 0,
                    'volume': int(hist['Volume'].iloc[-1]) if 'Volume' in hist.columns else 0,
                    'market_cap': info.get('marketCap'),
                    'pe_ratio': info.get('forwardPE'),
                    'dividend_yield': info.get('dividendYield'),
                    '52_week_high': round(float(hist['High'].max()), 2),
                    '52_week_low': round(float(hist['Low'].min()), 2),
                    'historical_data': [
                        {
                            'date': date.strftime('%Y-%m-%d'),
                            'open': round(float(row['Open']), 2),
                            'high': round(float(row['High']), 2),
                            'low': round(float(row['Low']), 2),
                            'close': round(float(row['Close']), 2),
                            'volume': int(row['Volume']) if 'Volume' in row and pd.notna(row['Volume']) else 0
                        }
                        for date, row in hist.tail(252).iterrows()  # ~1 year of trading days
                    ]
                },
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error fetching stock detail for {symbol}: {e}")
            return {"error": f"Failed to fetch data for {symbol}"}
    
    def _get_mock_market_data(self) -> Dict:
        """Fallback mock data when API is unavailable"""
        return {
            "status": "success", 
            "data": {
                "^GSPC": {
                    "name": "S&P 500",
                    "current_price": 4783.45,
                    "change": 15.67,
                    "change_percent": 0.33,
                    "volume": 0,
                    "last_updated": "2024-01-15",
                    "historical": []
                }
            },
            "timestamp": datetime.now().isoformat()
        }