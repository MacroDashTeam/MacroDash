import os
import yfinance as yf
from fredapi import Fred
from datetime import datetime, timedelta
from django.conf import settings
from django.core.cache import cache
import pandas as pd
from typing import Dict, List, Optional
import requests
from openai import OpenAI
import talib
import numpy as np


class FREDService:
    """Service for fetching data from FRED API"""
    
    def __init__(self):
        # Get API key from environment variable
        self.api_key = os.getenv('FRED_API_KEY')
        if self.api_key:
            self.fred = Fred(api_key=self.api_key)
        else:
            self.fred = None
    
    def get_single_indicator(self, series_id: str) -> Dict:
        """Get detailed historical data for a single economic indicator"""
        if not self.fred:
            return self._get_mock_single_indicator(series_id)

        try:
            # Get description mapping
            indicators_map = {
                'DFF': 'Federal Funds Effective Rate',
                'DFEDTARU': 'Fed Funds Upper Target Rate',
                'DFEDTARL': 'Fed Funds Lower Target Rate',
                'SOFR': 'Secured Overnight Financing Rate',
                'IORB': 'Interest on Reserve Balances',
                'MORTGAGE30US': '30-Year Fixed Rate Mortgage',
                'DGS10': '10-Year Treasury Constant Maturity Rate',
                'T10Y2Y': '10-Year Treasury Minus 2-Year Treasury',
                'M2SL': 'M2 Money Stock',
                'CPIAUCSL': 'Consumer Price Index for All Urban Consumers',
                'PCE': 'Personal Consumption Expenditures',
                'UNRATE': 'Unemployment Rate',
                'GDP': 'Gross Domestic Product',
                'GDPC1': 'Real Gross Domestic Product'
            }

            description = indicators_map.get(series_id, series_id)

            # Get 5 years of historical data
            series = self.fred.get_series(series_id, observation_start=datetime.now() - timedelta(days=5*365))

            if series.empty:
                return {'status': 'error', 'message': f'No data found for {series_id}'}

            latest = series.iloc[-1]
            previous = series.iloc[-2] if len(series) > 1 else latest

            return {
                'status': 'success',
                'data': {
                    'series_id': series_id,
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
                        for date, value in series.items()
                        if pd.notna(value)
                    ]
                },
                'timestamp': datetime.now().isoformat()
            }

        except Exception as e:
            print(f"Error fetching {series_id}: {e}")
            return self._get_mock_single_indicator(series_id)

    def get_economic_indicators(self) -> Dict:
        """Get default economic indicators for dashboard"""
        if not self.fred:
            return self._get_mock_fred_data()

        try:
            indicators = {
                'DFF': 'Federal Funds Effective Rate',
                'DFEDTARU': 'Fed Funds Upper Target Rate',
                'DFEDTARL': 'Fed Funds Lower Target Rate',
                'SOFR': 'Secured Overnight Financing Rate',
                'IORB': 'Interest on Reserve Balances',
                'MORTGAGE30US': '30-Year Fixed Rate Mortgage',
                'DGS10': '10-Year Treasury Constant Maturity Rate',
                'T10Y2Y': '10-Year Treasury Minus 2-Year Treasury',
                'M2SL': 'M2 Money Stock',
                'CPIAUCSL': 'Consumer Price Index for All Urban Consumers',
                'PCE': 'Personal Consumption Expenditures',
                'UNRATE': 'Unemployment Rate',
                'GDP': 'Gross Domestic Product',
                'GDPC1': 'Real Gross Domestic Product'
            }
            
            data = {}
            for series_id, description in indicators.items():
                try:
                    # Get recent data (no limit to get latest values)
                    series = self.fred.get_series(series_id)
                    if not series.empty:
                        # Take only the last 30 data points
                        series = series.tail(30)
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
                                    'value': float(value) if pd.notna(value) else None
                                }
                                for date, value in series.items()
                                if pd.notna(value)
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
    
    def _get_mock_single_indicator(self, series_id: str) -> Dict:
        """Fallback mock data for single indicator"""
        return {
            "status": "success",
            "data": {
                "series_id": series_id,
                "description": f"Mock data for {series_id}",
                "current": 5.25,
                "previous": 5.50,
                "change": -0.25,
                "change_percent": -4.55,
                "last_updated": "2024-01-15",
                "historical": []
            },
            "timestamp": datetime.now().isoformat()
        }

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
                # Market Indices
                '^GSPC',   # S&P 500
                '^DJI',    # Dow Jones Industrial Average
                '^IXIC',   # NASDAQ Composite
                '^VIX',    # CBOE Volatility Index
                'GC=F',    # Gold Futures
                # Sector ETFs
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
                'XLU',     # Utilities Select Sector SPDR Fund
                # Popular Individual Stocks
                'AAPL',    # Apple Inc.
                'MSFT',    # Microsoft Corporation
                'GOOGL',   # Alphabet Inc. (Class A)
                'GOOG',    # Alphabet Inc. (Class C)
                'AMZN',    # Amazon.com Inc.
                'NVDA',    # NVIDIA Corporation
                'TSLA',    # Tesla Inc.
                'META',    # Meta Platforms Inc.
            ]
            
            data = {}
            for symbol in symbols:
                try:
                    ticker = yf.Ticker(symbol)
                    hist = ticker.history(period="30d")
                    info = ticker.info

                    if not hist.empty:
                        # Get current price (real-time or most recent)
                        current_price = info.get('currentPrice') or info.get('regularMarketPrice')

                        # If no current price in info, fall back to latest historical close
                        if current_price is None:
                            current_price = hist['Close'].iloc[-1]

                        # Get previous close for comparison
                        previous_close = info.get('previousClose')
                        if previous_close is None:
                            previous_close = hist['Close'].iloc[-2] if len(hist) > 1 else current_price

                        # Calculate change
                        change = current_price - previous_close
                        change_percent = ((change / previous_close) * 100) if previous_close != 0 else 0

                        data[symbol] = {
                            'name': info.get('longName', symbol),
                            'current_price': round(float(current_price), 2),
                            'previous_close': round(float(previous_close), 2),
                            'change': round(float(change), 2),
                            'change_percent': round(float(change_percent), 2),
                            'volume': info.get('volume') or (int(hist['Volume'].iloc[-1]) if 'Volume' in hist.columns else 0),
                            'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
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

            # Get current price (real-time or most recent)
            current_price = info.get('currentPrice') or info.get('regularMarketPrice')

            # If no current price in info, fall back to latest historical close
            if current_price is None:
                current_price = hist['Close'].iloc[-1]

            # Get previous close for comparison
            previous_close = info.get('previousClose')
            if previous_close is None:
                previous_close = hist['Close'].iloc[-2] if len(hist) > 1 else current_price

            # Calculate change
            change = current_price - previous_close
            change_percent = ((change / previous_close) * 100) if previous_close != 0 else 0

            return {
                'status': 'success',
                'data': {
                    'symbol': symbol.upper(),
                    'name': info.get('longName', symbol),
                    'current_price': round(float(current_price), 2),
                    'change': round(float(change), 2),
                    'change_percent': round(float(change_percent), 2),
                    'volume': info.get('volume') or (int(hist['Volume'].iloc[-1]) if 'Volume' in hist.columns else 0),
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
    
    def get_intraday_data(self, symbols: List[str] = None) -> Dict:
        """Get intraday data for major indices (1-minute intervals for today)"""
        if symbols is None:
            symbols = ['^GSPC', '^DJI', '^IXIC']

        try:
            data = {}
            for symbol in symbols:
                try:
                    ticker = yf.Ticker(symbol)
                    # Get today's intraday data (1-minute intervals)
                    hist = ticker.history(period="1d", interval="1m")

                    if not hist.empty:
                        info = ticker.info

                        # Calculate overall change for the day
                        first_close = hist['Close'].iloc[0]
                        latest_close = hist['Close'].iloc[-1]

                        data[symbol] = {
                            'symbol': symbol,
                            'name': info.get('longName', symbol),
                            'current_price': round(float(latest_close), 2),
                            'change': round(float(latest_close - first_close), 2),
                            'change_percent': round(float(((latest_close - first_close) / first_close) * 100), 2) if first_close != 0 else 0,
                            'intraday': [
                                {
                                    'timestamp': date.strftime('%H:%M'),
                                    'price': round(float(row['Close']), 2),
                                    'volume': int(row['Volume']) if 'Volume' in row and pd.notna(row['Volume']) else 0
                                }
                                for date, row in hist.iterrows()
                            ]
                        }
                except Exception as e:
                    print(f"Error fetching intraday for {symbol}: {e}")
                    continue

            return {
                'status': 'success',
                'data': data,
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            print(f"Yahoo Finance intraday error: {e}")
            return {'status': 'error', 'message': str(e)}

    def get_analyst_recommendations(self, symbol: str) -> Dict:
        """Get analyst recommendations for a stock using yfinance"""
        try:
            ticker = yf.Ticker(symbol)

            # Get recommendations
            recommendations = ticker.recommendations

            # Get analyst price targets
            info = ticker.info
            target_high = info.get('targetHighPrice')
            target_low = info.get('targetLowPrice')
            target_mean = info.get('targetMeanPrice')
            target_median = info.get('targetMedianPrice')
            num_analysts = info.get('numberOfAnalystOpinions')

            # Process recommendations to get counts
            recommendation_counts = {
                'strongBuy': 0,
                'buy': 0,
                'hold': 0,
                'sell': 0,
                'strongSell': 0
            }

            if recommendations is not None and not recommendations.empty:
                # Get the latest month's recommendations
                latest_period = recommendations.tail(30)

                for _, row in latest_period.iterrows():
                    rec_value = row.get('To Grade', row.get('Action', '')).lower()

                    if 'strong buy' in rec_value or 'outperform' in rec_value:
                        recommendation_counts['strongBuy'] += 1
                    elif 'buy' in rec_value:
                        recommendation_counts['buy'] += 1
                    elif 'hold' in rec_value or 'neutral' in rec_value:
                        recommendation_counts['hold'] += 1
                    elif 'sell' in rec_value or 'underperform' in rec_value:
                        recommendation_counts['sell'] += 1
                    elif 'strong sell' in rec_value:
                        recommendation_counts['strongSell'] += 1

            total_recommendations = sum(recommendation_counts.values())

            # Calculate percentages
            recommendation_percentages = {}
            if total_recommendations > 0:
                for key, count in recommendation_counts.items():
                    recommendation_percentages[key] = round((count / total_recommendations) * 100, 1)
            else:
                recommendation_percentages = {k: 0.0 for k in recommendation_counts.keys()}

            return {
                'status': 'success',
                'data': {
                    'symbol': symbol.upper(),
                    'counts': recommendation_counts,
                    'percentages': recommendation_percentages,
                    'total': total_recommendations,
                    'target_price': {
                        'high': target_high,
                        'low': target_low,
                        'mean': target_mean,
                        'median': target_median
                    },
                    'num_analysts': num_analysts
                },
                'timestamp': datetime.now().isoformat()
            }

        except Exception as e:
            print(f"Error fetching analyst recommendations for {symbol}: {e}")
            return {
                'status': 'error',
                'error': f"Failed to fetch analyst recommendations for {symbol}",
                'timestamp': datetime.now().isoformat()
            }

    def browse_stocks(self, category: str = None, sector: str = None) -> Dict:
        """Get stocks categorized by market cap or sector"""
        try:
            # Define stock lists by category
            stocks_by_category = {
                'mega_cap': ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK-B', 'UNH', 'XOM', 'JNJ', 'JPM'],
                'large_cap': ['V', 'PG', 'MA', 'HD', 'CVX', 'MRK', 'ABBV', 'PEP', 'COST', 'AVGO', 'ADBE', 'CRM'],
                'mid_cap': ['ALGN', 'ANSS', 'CBOE', 'CDNS', 'CERN', 'CHTR', 'CSCO', 'CTSH', 'DXCM', 'EXPD', 'FAST', 'FFIV'],
                'small_cap': ['AAL', 'ALK', 'JBLU', 'UAL', 'DAL', 'SAVE', 'HA', 'LUV']
            }

            stocks_by_sector = {
                'technology': ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'META', 'ADBE', 'CRM', 'INTC', 'CSCO', 'ORCL', 'AMD', 'QCOM'],
                'healthcare': ['UNH', 'JNJ', 'PFE', 'ABBV', 'TMO', 'MRK', 'ABT', 'DHR', 'LLY', 'BMY', 'AMGN', 'GILD'],
                'financial': ['JPM', 'BAC', 'WFC', 'C', 'GS', 'MS', 'BLK', 'SCHW', 'AXP', 'USB', 'PNC', 'TFC'],
                'consumer': ['AMZN', 'TSLA', 'HD', 'NKE', 'MCD', 'SBUX', 'TGT', 'LOW', 'TJX', 'DG', 'ROST', 'ULTA'],
                'energy': ['XOM', 'CVX', 'COP', 'SLB', 'EOG', 'MPC', 'PSX', 'VLO', 'OXY', 'HAL', 'DVN', 'FANG'],
                'industrial': ['HON', 'UPS', 'RTX', 'BA', 'CAT', 'GE', 'LMT', 'MMM', 'DE', 'FDX', 'NOC', 'ETN']
            }

            # Determine which stocks to fetch
            if category and category in stocks_by_category:
                symbols = stocks_by_category[category]
                category_name = category.replace('_', ' ').title()
            elif sector and sector in stocks_by_sector:
                symbols = stocks_by_sector[sector]
                category_name = sector.title()
            else:
                # Return all mega cap stocks by default
                symbols = stocks_by_category['mega_cap']
                category_name = 'Mega Cap'

            # Fetch stock data
            stocks = []
            for symbol in symbols:
                try:
                    ticker = yf.Ticker(symbol)
                    info = ticker.info
                    hist = ticker.history(period="5d")

                    if not hist.empty:
                        latest_close = hist['Close'].iloc[-1]
                        previous_close = hist['Close'].iloc[-2] if len(hist) > 1 else latest_close

                        stocks.append({
                            'symbol': symbol,
                            'name': info.get('longName', symbol),
                            'sector': info.get('sector', 'N/A'),
                            'industry': info.get('industry', 'N/A'),
                            'market_cap': info.get('marketCap', 0),
                            'current_price': round(float(latest_close), 2),
                            'change': round(float(latest_close - previous_close), 2),
                            'change_percent': round(float(((latest_close - previous_close) / previous_close) * 100), 2) if previous_close != 0 else 0,
                            'volume': int(hist['Volume'].iloc[-1]) if 'Volume' in hist.columns else 0,
                            'pe_ratio': info.get('forwardPE'),
                            'dividend_yield': info.get('dividendYield'),
                            'beta': info.get('beta')
                        })
                except Exception as e:
                    print(f"Error fetching {symbol}: {e}")
                    continue

            return {
                'status': 'success',
                'data': {
                    'category': category_name,
                    'stocks': stocks,
                    'total': len(stocks)
                },
                'timestamp': datetime.now().isoformat()
            }

        except Exception as e:
            print(f"Error in browse_stocks: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }

    def get_stock_news(self, symbol: str, limit: int = 10) -> Dict:
        """Get stock news from Yahoo Finance with AI-powered sentiment classification"""
        try:
            ticker = yf.Ticker(symbol)
            news = ticker.news

            if not news:
                return {
                    'status': 'success',
                    'data': {
                        'items': 0,
                        'feed': []
                    },
                    'timestamp': datetime.now().isoformat()
                }

            # Initialize OpenAI service for sentiment analysis
            openai_service = OpenAIService()

            # Convert Yahoo Finance news format to match Alpha Vantage format
            news_articles = []
            for article in news[:limit]:
                content = article.get('content', {})
                title = content.get('title', '')
                summary = content.get('summary', '')

                # Use OpenAI to classify sentiment if available
                sentiment_result = self._classify_news_sentiment(
                    openai_service, symbol, title, summary
                )

                news_articles.append({
                    'title': title,
                    'url': content.get('canonicalUrl', {}).get('url', ''),
                    'time_published': content.get('pubDate', ''),
                    'authors': [content.get('provider', {}).get('displayName', 'Yahoo Finance')],
                    'summary': summary,
                    'source': content.get('provider', {}).get('displayName', 'Yahoo Finance'),
                    'category_within_source': '',
                    'overall_sentiment_score': sentiment_result['score'],
                    'overall_sentiment_label': sentiment_result['label'],
                    'ticker_sentiment': {},
                    'topics': []
                })

            return {
                'status': 'success',
                'data': {
                    'items': len(news_articles),
                    'feed': news_articles
                },
                'timestamp': datetime.now().isoformat()
            }

        except Exception as e:
            print(f"Error fetching Yahoo Finance news for {symbol}: {e}")
            return {
                'status': 'success',
                'data': {
                    'items': 0,
                    'feed': []
                },
                'timestamp': datetime.now().isoformat()
            }

    def _classify_news_sentiment(self, openai_service: 'OpenAIService', symbol: str, title: str, summary: str) -> Dict:
        """Use OpenAI to classify news sentiment for a stock"""
        # Return neutral if OpenAI is not configured
        if not openai_service.client:
            return {'score': 0.0, 'label': 'Neutral'}

        try:
            # Create a concise prompt for sentiment analysis
            text = f"{title}. {summary}" if summary else title

            prompt = f"""Analyze the sentiment of this news article about {symbol} stock and classify it as Bullish, Bearish, or Neutral.

News: {text[:500]}

Respond with ONLY a JSON object in this exact format:
{{"sentiment": "Bullish|Bearish|Neutral", "score": 0.0}}

Where score is:
- For Bullish: 0.1 to 1.0 (higher = more bullish)
- For Bearish: -0.1 to -1.0 (lower = more bearish)
- For Neutral: 0.0"""

            response = openai_service.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a financial sentiment analysis expert. Analyze news and return JSON only."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=50
            )

            # Parse the response
            import json
            result = json.loads(response.choices[0].message.content.strip())

            return {
                'score': float(result.get('score', 0.0)),
                'label': result.get('sentiment', 'Neutral')
            }

        except Exception as e:
            print(f"Error classifying sentiment with OpenAI: {e}")
            # Fallback to neutral sentiment
            return {'score': 0.0, 'label': 'Neutral'}

    def get_company_info(self, symbol: str) -> Dict:
        """Get company overview/info from Yahoo Finance"""
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info

            return {
                'status': 'success',
                'data': {
                    'symbol': symbol.upper(),
                    'name': info.get('longName', symbol),
                    'description': info.get('longBusinessSummary', ''),
                    'sector': info.get('sector', ''),
                    'industry': info.get('industry', ''),
                    'website': info.get('website', ''),
                    'country': info.get('country', ''),
                    'city': info.get('city', ''),
                    'address': info.get('address1', ''),
                    'employees': info.get('fullTimeEmployees'),
                    'market_cap': info.get('marketCap'),
                    'pe_ratio': info.get('forwardPE'),
                    'peg_ratio': info.get('pegRatio'),
                    'book_value': info.get('bookValue'),
                    'dividend_per_share': info.get('dividendRate'),
                    'dividend_yield': info.get('dividendYield'),
                    'eps': info.get('trailingEps'),
                    '52_week_high': info.get('fiftyTwoWeekHigh'),
                    '52_week_low': info.get('fiftyTwoWeekLow'),
                    '50_day_ma': info.get('fiftyDayAverage'),
                    '200_day_ma': info.get('twoHundredDayAverage'),
                    'revenue_ttm': info.get('totalRevenue'),
                    'gross_profit_ttm': info.get('grossProfits'),
                    'profit_margin': info.get('profitMargins'),
                    'operating_margin_ttm': info.get('operatingMargins'),
                    'return_on_assets': info.get('returnOnAssets'),
                    'return_on_equity': info.get('returnOnEquity'),
                    'revenue_growth': info.get('revenueGrowth'),
                    'earnings_growth': info.get('earningsGrowth')
                },
                'timestamp': datetime.now().isoformat()
            }

        except Exception as e:
            print(f"Yahoo Finance company info error for {symbol}: {e}")
            return {
                'status': 'error',
                'error': f"Failed to fetch company info for {symbol}",
                'timestamp': datetime.now().isoformat()
            }

    def get_financials(self, symbol: str, statement_type: str = 'income') -> Dict:
        """Get financial statements from Yahoo Finance with Alpha Vantage as backup"""
        try:
            ticker = yf.Ticker(symbol)

            # Get the appropriate financial statement
            if statement_type == 'income':
                annual_data = ticker.income_stmt
                quarterly_data = ticker.quarterly_income_stmt
            elif statement_type == 'balance':
                annual_data = ticker.balance_sheet
                quarterly_data = ticker.quarterly_balance_sheet
            elif statement_type == 'cashflow':
                annual_data = ticker.cashflow
                quarterly_data = ticker.quarterly_cashflow
            else:
                return {'status': 'error', 'message': 'Invalid statement type'}

            # Convert DataFrames to list of dicts
            annual_reports = []
            if annual_data is not None and not annual_data.empty:
                for date in annual_data.columns:
                    report = {'fiscalDateEnding': date.strftime('%Y-%m-%d')}
                    for index, value in annual_data[date].items():
                        if pd.notna(value):
                            report[index.replace(' ', '')] = float(value) if isinstance(value, (int, float)) else str(value)
                    annual_reports.append(report)

            quarterly_reports = []
            if quarterly_data is not None and not quarterly_data.empty:
                for date in quarterly_data.columns:
                    report = {'fiscalDateEnding': date.strftime('%Y-%m-%d')}
                    for index, value in quarterly_data[date].items():
                        if pd.notna(value):
                            report[index.replace(' ', '')] = float(value) if isinstance(value, (int, float)) else str(value)
                    quarterly_reports.append(report)

            return {
                'status': 'success',
                'data': {
                    'symbol': symbol.upper(),
                    'annual_reports': annual_reports,
                    'quarterly_reports': quarterly_reports,
                    'source': 'Yahoo Finance'
                },
                'timestamp': datetime.now().isoformat()
            }

        except Exception as e:
            print(f"Yahoo Finance financial data error for {symbol}: {e}")
            print(f"Falling back to Alpha Vantage for {symbol} {statement_type} statement")

            # Fallback to Alpha Vantage
            av_service = AlphaVantageService()
            if statement_type == 'income':
                return av_service.get_income_statement(symbol)
            elif statement_type == 'balance':
                return av_service.get_balance_sheet(symbol)
            elif statement_type == 'cashflow':
                return av_service.get_cash_flow(symbol)

            return {'status': 'error', 'message': str(e)}

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


class AlphaVantageService:
    """Service for fetching data from Alpha Vantage API"""

    BASE_URL = "https://www.alphavantage.co/query"

    def __init__(self):
        # Get API key from environment variable
        self.api_key = os.getenv('ALPHA_VANTAGE_API_KEY')

    def get_quote(self, symbol: str) -> Dict:
        """Get real-time quote for a symbol"""
        if not self.api_key:
            return self._get_mock_quote_data(symbol)

        try:
            params = {
                'function': 'GLOBAL_QUOTE',
                'symbol': symbol,
                'apikey': self.api_key
            }

            response = requests.get(self.BASE_URL, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            if 'Global Quote' in data and data['Global Quote']:
                quote = data['Global Quote']
                return {
                    'status': 'success',
                    'data': {
                        'symbol': quote.get('01. symbol', symbol),
                        'price': float(quote.get('05. price', 0)),
                        'change': float(quote.get('09. change', 0)),
                        'change_percent': quote.get('10. change percent', '0%').replace('%', ''),
                        'volume': int(quote.get('06. volume', 0)),
                        'latest_trading_day': quote.get('07. latest trading day', ''),
                        'previous_close': float(quote.get('08. previous close', 0)),
                        'open': float(quote.get('02. open', 0)),
                        'high': float(quote.get('03. high', 0)),
                        'low': float(quote.get('04. low', 0))
                    },
                    'timestamp': datetime.now().isoformat()
                }
            else:
                return self._get_mock_quote_data(symbol)

        except Exception as e:
            print(f"Alpha Vantage API error: {e}")
            return self._get_mock_quote_data(symbol)

    def get_intraday(self, symbol: str, interval: str = '5min') -> Dict:
        """Get intraday time series data"""
        if not self.api_key:
            return self._get_mock_intraday_data(symbol)

        try:
            params = {
                'function': 'TIME_SERIES_INTRADAY',
                'symbol': symbol,
                'interval': interval,
                'apikey': self.api_key
            }

            response = requests.get(self.BASE_URL, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            time_series_key = f'Time Series ({interval})'
            if time_series_key in data:
                time_series = data[time_series_key]

                historical = []
                for timestamp, values in sorted(time_series.items())[:100]:  # Last 100 data points
                    historical.append({
                        'timestamp': timestamp,
                        'open': float(values.get('1. open', 0)),
                        'high': float(values.get('2. high', 0)),
                        'low': float(values.get('3. low', 0)),
                        'close': float(values.get('4. close', 0)),
                        'volume': int(values.get('5. volume', 0))
                    })

                return {
                    'status': 'success',
                    'data': {
                        'symbol': symbol,
                        'interval': interval,
                        'historical': historical
                    },
                    'timestamp': datetime.now().isoformat()
                }
            else:
                return self._get_mock_intraday_data(symbol)

        except Exception as e:
            print(f"Alpha Vantage API error: {e}")
            return self._get_mock_intraday_data(symbol)

    def get_daily(self, symbol: str, outputsize: str = 'compact') -> Dict:
        """Get daily time series data"""
        if not self.api_key:
            return self._get_mock_daily_data(symbol)

        try:
            params = {
                'function': 'TIME_SERIES_DAILY',
                'symbol': symbol,
                'outputsize': outputsize,
                'apikey': self.api_key
            }

            response = requests.get(self.BASE_URL, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            if 'Time Series (Daily)' in data:
                time_series = data['Time Series (Daily)']

                historical = []
                for date, values in sorted(time_series.items(), reverse=True)[:100]:
                    historical.append({
                        'date': date,
                        'open': float(values.get('1. open', 0)),
                        'high': float(values.get('2. high', 0)),
                        'low': float(values.get('3. low', 0)),
                        'close': float(values.get('4. close', 0)),
                        'volume': int(values.get('5. volume', 0))
                    })

                return {
                    'status': 'success',
                    'data': {
                        'symbol': symbol,
                        'historical': historical
                    },
                    'timestamp': datetime.now().isoformat()
                }
            else:
                return self._get_mock_daily_data(symbol)

        except Exception as e:
            print(f"Alpha Vantage API error: {e}")
            return self._get_mock_daily_data(symbol)

    def get_company_overview(self, symbol: str) -> Dict:
        """Get company overview and fundamentals"""
        if not self.api_key:
            return self._get_mock_overview_data(symbol)

        try:
            params = {
                'function': 'OVERVIEW',
                'symbol': symbol,
                'apikey': self.api_key
            }

            response = requests.get(self.BASE_URL, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            if 'Symbol' in data:
                return {
                    'status': 'success',
                    'data': {
                        'symbol': data.get('Symbol', symbol),
                        'name': data.get('Name', ''),
                        'description': data.get('Description', ''),
                        'sector': data.get('Sector', ''),
                        'industry': data.get('Industry', ''),
                        'market_cap': data.get('MarketCapitalization', ''),
                        'pe_ratio': data.get('PERatio', ''),
                        'peg_ratio': data.get('PEGRatio', ''),
                        'book_value': data.get('BookValue', ''),
                        'dividend_per_share': data.get('DividendPerShare', ''),
                        'dividend_yield': data.get('DividendYield', ''),
                        'eps': data.get('EPS', ''),
                        '52_week_high': data.get('52WeekHigh', ''),
                        '52_week_low': data.get('52WeekLow', ''),
                        '50_day_ma': data.get('50DayMovingAverage', ''),
                        '200_day_ma': data.get('200DayMovingAverage', ''),
                        'analyst_target_price': data.get('AnalystTargetPrice', ''),
                        'revenue_per_share_ttm': data.get('RevenuePerShareTTM', ''),
                        'profit_margin': data.get('ProfitMargin', ''),
                        'operating_margin_ttm': data.get('OperatingMarginTTM', ''),
                        'return_on_assets_ttm': data.get('ReturnOnAssetsTTM', ''),
                        'return_on_equity_ttm': data.get('ReturnOnEquityTTM', ''),
                        'revenue_ttm': data.get('RevenueTTM', ''),
                        'gross_profit_ttm': data.get('GrossProfitTTM', ''),
                        'diluted_eps_ttm': data.get('DilutedEPSTTM', ''),
                        'quarterly_earnings_growth_yoy': data.get('QuarterlyEarningsGrowthYOY', ''),
                        'quarterly_revenue_growth_yoy': data.get('QuarterlyRevenueGrowthYOY', '')
                    },
                    'timestamp': datetime.now().isoformat()
                }
            else:
                return self._get_mock_overview_data(symbol)

        except Exception as e:
            print(f"Alpha Vantage API error: {e}")
            return self._get_mock_overview_data(symbol)

    def get_news_sentiment(self, tickers: str = None, topics: str = None, limit: int = 50) -> Dict:
        """Get news and sentiment data from Alpha Vantage"""
        if not self.api_key:
            print("No Alpha Vantage API key found - using mock data")
            return self._get_mock_news_data(tickers)

        try:
            params = {
                'function': 'NEWS_SENTIMENT',
                'apikey': self.api_key,
                'limit': limit
            }

            if tickers:
                params['tickers'] = tickers
            if topics:
                params['topics'] = topics

            response = requests.get(self.BASE_URL, params=params, timeout=15)
            response.raise_for_status()
            data = response.json()

            # Log the response for debugging
            print(f"Alpha Vantage NEWS_SENTIMENT response keys: {data.keys()}")

            # Check for informational or error messages
            if 'Information' in data:
                print(f"Alpha Vantage Info: {data['Information']}")
                # This is just an informational message, not an error
                # Return mock data for now
                return self._get_mock_news_data(tickers)

            if 'Note' in data:
                print(f"Alpha Vantage Note: {data['Note']}")
                return self._get_mock_news_data(tickers)

            if 'Error Message' in data:
                print(f"Alpha Vantage Error: {data['Error Message']}")
                return self._get_mock_news_data(tickers)

            if 'feed' in data:
                print(f"Successfully fetched {len(data['feed'])} news articles")
                news_articles = []
                for article in data['feed'][:limit]:
                    # Get ticker sentiments
                    ticker_sentiments = {}
                    if 'ticker_sentiment' in article:
                        for ts in article['ticker_sentiment']:
                            ticker_sentiments[ts.get('ticker', '')] = {
                                'relevance_score': float(ts.get('relevance_score', 0)),
                                'sentiment_score': float(ts.get('ticker_sentiment_score', 0)),
                                'sentiment_label': ts.get('ticker_sentiment_label', 'Neutral')
                            }

                    news_articles.append({
                        'title': article.get('title', ''),
                        'url': article.get('url', ''),
                        'time_published': article.get('time_published', ''),
                        'authors': article.get('authors', []),
                        'summary': article.get('summary', ''),
                        'source': article.get('source', ''),
                        'category_within_source': article.get('category_within_source', ''),
                        'overall_sentiment_score': float(article.get('overall_sentiment_score', 0)),
                        'overall_sentiment_label': article.get('overall_sentiment_label', 'Neutral'),
                        'ticker_sentiment': ticker_sentiments,
                        'topics': article.get('topics', [])
                    })

                return {
                    'status': 'success',
                    'data': {
                        'items': len(news_articles),
                        'sentiment_score_definition': data.get('sentiment_score_definition', ''),
                        'relevance_score_definition': data.get('relevance_score_definition', ''),
                        'feed': news_articles
                    },
                    'timestamp': datetime.now().isoformat()
                }
            else:
                print(f"No 'feed' key in Alpha Vantage response. Full response: {data}")
                return self._get_mock_news_data(tickers)

        except Exception as e:
            print(f"Alpha Vantage News API error: {e}")
            return self._get_mock_news_data(tickers)

    def _get_mock_quote_data(self, symbol: str) -> Dict:
        """Fallback mock quote data"""
        return {
            'status': 'success',
            'data': {
                'symbol': symbol,
                'price': 150.25,
                'change': 2.35,
                'change_percent': '1.59',
                'volume': 1000000,
                'latest_trading_day': datetime.now().strftime('%Y-%m-%d'),
                'previous_close': 147.90,
                'open': 148.50,
                'high': 151.20,
                'low': 147.80
            },
            'timestamp': datetime.now().isoformat()
        }

    def _get_mock_intraday_data(self, symbol: str) -> Dict:
        """Fallback mock intraday data"""
        return {
            'status': 'success',
            'data': {
                'symbol': symbol,
                'interval': '5min',
                'historical': []
            },
            'timestamp': datetime.now().isoformat()
        }

    def _get_mock_daily_data(self, symbol: str) -> Dict:
        """Fallback mock daily data"""
        return {
            'status': 'success',
            'data': {
                'symbol': symbol,
                'historical': []
            },
            'timestamp': datetime.now().isoformat()
        }

    def _get_mock_overview_data(self, symbol: str) -> Dict:
        """Fallback mock overview data"""
        return {
            'status': 'success',
            'data': {
                'symbol': symbol,
                'name': 'Mock Company',
                'description': 'This is mock data. Please configure Alpha Vantage API key.',
                'sector': 'Technology',
                'industry': 'Software',
                'market_cap': '1000000000',
                'pe_ratio': '25.5',
                'eps': '5.25'
            },
            'timestamp': datetime.now().isoformat()
        }

    def get_income_statement(self, symbol: str) -> Dict:
        """Get income statement data from Alpha Vantage"""
        if not self.api_key:
            return self._get_mock_income_statement(symbol)

        try:
            params = {
                'function': 'INCOME_STATEMENT',
                'symbol': symbol,
                'apikey': self.api_key
            }

            response = requests.get(self.BASE_URL, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            if 'annualReports' in data and 'quarterlyReports' in data:
                return {
                    'status': 'success',
                    'data': {
                        'symbol': symbol,
                        'annual_reports': data['annualReports'],
                        'quarterly_reports': data['quarterlyReports']
                    },
                    'timestamp': datetime.now().isoformat()
                }
            else:
                return self._get_mock_income_statement(symbol)

        except Exception as e:
            print(f"Alpha Vantage Income Statement API error: {e}")
            return self._get_mock_income_statement(symbol)

    def get_balance_sheet(self, symbol: str) -> Dict:
        """Get balance sheet data from Alpha Vantage"""
        if not self.api_key:
            return self._get_mock_balance_sheet(symbol)

        try:
            params = {
                'function': 'BALANCE_SHEET',
                'symbol': symbol,
                'apikey': self.api_key
            }

            response = requests.get(self.BASE_URL, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            if 'annualReports' in data and 'quarterlyReports' in data:
                return {
                    'status': 'success',
                    'data': {
                        'symbol': symbol,
                        'annual_reports': data['annualReports'],
                        'quarterly_reports': data['quarterlyReports']
                    },
                    'timestamp': datetime.now().isoformat()
                }
            else:
                return self._get_mock_balance_sheet(symbol)

        except Exception as e:
            print(f"Alpha Vantage Balance Sheet API error: {e}")
            return self._get_mock_balance_sheet(symbol)

    def get_cash_flow(self, symbol: str) -> Dict:
        """Get cash flow statement data from Alpha Vantage"""
        if not self.api_key:
            return self._get_mock_cash_flow(symbol)

        try:
            params = {
                'function': 'CASH_FLOW',
                'symbol': symbol,
                'apikey': self.api_key
            }

            response = requests.get(self.BASE_URL, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            if 'annualReports' in data and 'quarterlyReports' in data:
                return {
                    'status': 'success',
                    'data': {
                        'symbol': symbol,
                        'annual_reports': data['annualReports'],
                        'quarterly_reports': data['quarterlyReports']
                    },
                    'timestamp': datetime.now().isoformat()
                }
            else:
                return self._get_mock_cash_flow(symbol)

        except Exception as e:
            print(f"Alpha Vantage Cash Flow API error: {e}")
            return self._get_mock_cash_flow(symbol)

    def get_earnings(self, symbol: str) -> Dict:
        """Get earnings data with analyst estimates from Alpha Vantage"""
        if not self.api_key:
            return self._get_mock_earnings(symbol)

        try:
            params = {
                'function': 'EARNINGS',
                'symbol': symbol,
                'apikey': self.api_key
            }

            response = requests.get(self.BASE_URL, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            if 'annualEarnings' in data and 'quarterlyEarnings' in data:
                return {
                    'status': 'success',
                    'data': {
                        'symbol': symbol,
                        'annual_earnings': data['annualEarnings'],
                        'quarterly_earnings': data['quarterlyEarnings']
                    },
                    'timestamp': datetime.now().isoformat()
                }
            else:
                return self._get_mock_earnings(symbol)

        except Exception as e:
            print(f"Alpha Vantage Earnings API error: {e}")
            return self._get_mock_earnings(symbol)

    def _get_mock_income_statement(self, symbol: str) -> Dict:
        """Fallback mock income statement data"""
        return {
            'status': 'success',
            'data': {
                'symbol': symbol,
                'annual_reports': [],
                'quarterly_reports': []
            },
            'timestamp': datetime.now().isoformat()
        }

    def _get_mock_balance_sheet(self, symbol: str) -> Dict:
        """Fallback mock balance sheet data"""
        return {
            'status': 'success',
            'data': {
                'symbol': symbol,
                'annual_reports': [],
                'quarterly_reports': []
            },
            'timestamp': datetime.now().isoformat()
        }

    def _get_mock_cash_flow(self, symbol: str) -> Dict:
        """Fallback mock cash flow data"""
        return {
            'status': 'success',
            'data': {
                'symbol': symbol,
                'annual_reports': [],
                'quarterly_reports': []
            },
            'timestamp': datetime.now().isoformat()
        }

    def _get_mock_earnings(self, symbol: str) -> Dict:
        """Fallback mock earnings data"""
        return {
            'status': 'success',
            'data': {
                'symbol': symbol,
                'annual_earnings': [],
                'quarterly_earnings': []
            },
            'timestamp': datetime.now().isoformat()
        }

    def _get_mock_news_data(self, tickers: str = None) -> Dict:
        """Fallback to Yahoo Finance news when Alpha Vantage is unavailable"""
        print(f"Alpha Vantage unavailable - falling back to Yahoo Finance news for {tickers}")

        # Extract the first ticker if multiple provided
        symbol = tickers.split(',')[0].strip() if tickers else 'AAPL'

        # Use Yahoo Finance to get real news
        yahoo_service = YahooFinanceService()
        result = yahoo_service.get_stock_news(symbol, limit=10)

        if result['data']['items'] > 0:
            print(f"Successfully fetched {result['data']['items']} articles from Yahoo Finance")
            return result

        # If Yahoo Finance also fails, return minimal mock data
        print("Both Alpha Vantage and Yahoo Finance failed - using minimal mock data")
        return {
            'status': 'success',
            'data': {
                'items': 1,
                'feed': [
                    {
                        'title': f'Latest news for {symbol}',
                        'url': f'https://finance.yahoo.com/quote/{symbol}/news',
                        'time_published': datetime.now().strftime('%Y%m%dT%H%M%S'),
                        'authors': ['Yahoo Finance'],
                        'summary': f'Visit Yahoo Finance for the latest {symbol} news and analysis.',
                        'source': 'Yahoo Finance',
                        'overall_sentiment_score': 0.0,
                        'overall_sentiment_label': 'Neutral',
                        'ticker_sentiment': {},
                        'topics': []
                    }
                ]
            },
            'timestamp': datetime.now().isoformat()
        }


class OpenAIService:
    """Service for generating insights using OpenAI GPT API"""

    def __init__(self):
        self.api_key = os.getenv('OPENAI_API_KEY')
        if self.api_key:
            self.client = OpenAI(api_key=self.api_key)
        else:
            self.client = None

    def generate_stock_insights(self, symbol: str, news_data: List[Dict]) -> Dict:
        """Generate positive and negative insights based on news sentiment"""
        if not self.client:
            return self._get_mock_insights(symbol)

        try:
            # Filter and prepare news summaries
            positive_news = [n for n in news_data if 'Bullish' in n.get('overall_sentiment_label', '')][:5]
            negative_news = [n for n in news_data if 'Bearish' in n.get('overall_sentiment_label', '')][:5]

            # Create prompt for GPT
            prompt = f"""Based on the following news about {symbol}, generate 3 concise positive insights and 3 concise negative insights. Each insight should be one short sentence (max 15 words).

Positive News:
{chr(10).join([f"- {n['title']}" for n in positive_news[:3]])}

Negative News:
{chr(10).join([f"- {n['title']}" for n in negative_news[:3]])}

Return only a JSON object with this exact format:
{{
  "positive": ["insight1", "insight2", "insight3"],
  "negative": ["insight1", "insight2", "insight3"]
}}"""

            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a financial analyst providing concise stock insights."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=300
            )

            # Parse the response
            import json
            insights = json.loads(response.choices[0].message.content)

            return {
                'status': 'success',
                'data': insights,
                'timestamp': datetime.now().isoformat()
            }

        except Exception as e:
            print(f"OpenAI API error: {e}")
            return self._get_mock_insights(symbol)

    def _get_mock_insights(self, symbol: str) -> Dict:
        """Fallback mock insights"""
        return {
            'status': 'success',
            'data': {
                'positive': [
                    f"{symbol} shows strong revenue growth potential",
                    "Market position continues to strengthen",
                    "Analyst sentiment remains optimistic"
                ],
                'negative': [
                    "Regulatory challenges may impact growth",
                    "Increased competition in key markets",
                    "Supply chain concerns persist"
                ]
            },
            'timestamp': datetime.now().isoformat()
        }

    def chat_with_context(self, question: str, context: Dict) -> Dict:
        """Chat with GPT using stock context"""
        if not self.client:
            return {
                'status': 'error',
                'error': 'OpenAI API key not configured',
                'answer': 'I apologize, but the AI assistant is not configured. Please set up the OPENAI_API_KEY environment variable.',
                'timestamp': datetime.now().isoformat()
            }

        try:
            # Build context-aware prompt
            symbol = context.get('symbol', 'N/A')
            stock = context.get('stock', {})
            financials = context.get('financials', {})
            news = context.get('news', [])
            insights = context.get('insights', {})
            analyst = context.get('analyst', {})

            # Format financial data
            financial_context = ""
            if financials and financials.get('annual_reports'):
                latest = financials['annual_reports'][0]
                revenue = f"${latest.get('TotalRevenue', 0):,.0f}" if isinstance(latest.get('TotalRevenue'), (int, float)) else 'N/A'
                net_income = f"${latest.get('NetIncome', 0):,.0f}" if isinstance(latest.get('NetIncome'), (int, float)) else 'N/A'
                assets = f"${latest.get('TotalAssets', 0):,.0f}" if isinstance(latest.get('TotalAssets'), (int, float)) else 'N/A'
                cashflow = f"${latest.get('OperatingCashFlow', 0):,.0f}" if isinstance(latest.get('OperatingCashFlow'), (int, float)) else 'N/A'

                financial_context = f"""
Latest Annual Financials:
- Revenue: {revenue}
- Net Income: {net_income}
- Total Assets: {assets}
- Operating Cash Flow: {cashflow}
"""

            # Format news
            news_context = ""
            if news:
                news_context = "Recent News Headlines:\n" + "\n".join([f"- {n.get('title', '')}" for n in news[:5]])

            # Format insights
            insights_context = ""
            if insights:
                pos = insights.get('positive', [])
                neg = insights.get('negative', [])
                if pos:
                    insights_context += "Positive Insights:\n" + "\n".join([f"- {p}" for p in pos[:3]]) + "\n"
                if neg:
                    insights_context += "Negative Insights:\n" + "\n".join([f"- {n}" for n in neg[:3]])

            # Format analyst recommendations
            analyst_context = ""
            if analyst and analyst.get('target_price'):
                target = analyst['target_price']
                analyst_context = f"""
Analyst Recommendations:
- Average Target Price: ${target.get('mean', 'N/A')}
- High Target: ${target.get('high', 'N/A')}
- Low Target: ${target.get('low', 'N/A')}
- Number of Analysts: {analyst.get('num_analysts', 'N/A')}
"""

            # Format market cap and volume
            market_cap = f"${stock.get('market_cap', 0):,}" if isinstance(stock.get('market_cap'), (int, float)) else 'N/A'
            volume = f"{stock.get('volume', 0):,}" if isinstance(stock.get('volume'), (int, float)) else 'N/A'

            system_prompt = f"""You are a knowledgeable financial analyst assistant helping users understand stock data and make informed decisions.

You have access to comprehensive data about {symbol}:

Stock Information:
- Symbol: {symbol}
- Current Price: ${stock.get('current_price', 'N/A')}
- Market Cap: {market_cap}
- P/E Ratio: {stock.get('pe_ratio', 'N/A')}
- 52-Week High: ${stock.get('52_week_high', 'N/A')}
- 52-Week Low: ${stock.get('52_week_low', 'N/A')}
- Volume: {volume}

{financial_context}

{analyst_context}

{insights_context}

{news_context}

Guidelines:
- Provide clear, concise answers based on the data provided
- If asked about data you don't have, politely say you don't have that specific information
- Use financial terminology appropriately but explain complex concepts
- When discussing price targets or predictions, always mention this is analyst opinion and not guaranteed
- Format numbers with proper currency symbols and commas
- Be helpful but remind users this is for informational purposes only, not financial advice
"""

            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": question}
                ],
                temperature=0.7,
                max_tokens=500
            )

            answer = response.choices[0].message.content

            return {
                'status': 'success',
                'answer': answer,
                'timestamp': datetime.now().isoformat()
            }

        except Exception as e:
            print(f"ChatGPT error: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'answer': 'I apologize, but I encountered an error processing your question. Please try again.',
                'timestamp': datetime.now().isoformat()
            }

class TechnicalIndicatorService:
    """Service for calculating technical indicators using TA-Lib"""
    
    def get_technical_indicators(self, symbol: str, period: str = '1y') -> Dict:
        """
        Get all technical indicators for a symbol
        
        Args:
            symbol: Stock symbol (e.g., 'AAPL')
            period: Data period - '1y', '6mo', '3mo', '1mo'
        
        Returns:
            Dict containing RSI, MACD, Bollinger Bands, SMA, and EMA
        """
        try:
            # Fetch historical data using yfinance
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period=period)
            
            if hist.empty:
                return {
                    'status': 'error',
                    'error': f'No historical data found for {symbol}',
                    'timestamp': datetime.now().isoformat()
                }
            
            # Extract close prices as numpy array
            close_prices = hist['Close'].values
            high_prices = hist['High'].values
            low_prices = hist['Low'].values
            
            # Calculate all indicators
            indicators = {
                'symbol': symbol.upper(),
                'period': period,
                'data_points': len(close_prices),
                'rsi': self._calculate_rsi(close_prices),
                'macd': self._calculate_macd(close_prices),
                'bbands': self._calculate_bollinger_bands(close_prices),
                'sma': self._calculate_sma(close_prices),
                'ema': self._calculate_ema(close_prices),
                'dates': [date.strftime('%Y-%m-%d') for date in hist.index]
            }
            
            return {
                'status': 'success',
                'data': indicators,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error calculating technical indicators for {symbol}: {e}")
            import traceback
            traceback.print_exc()
            return {
                'status': 'error',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def _calculate_rsi(self, close_prices: np.ndarray, timeperiod: int = 14) -> Dict:
        """Calculate Relative Strength Index (RSI)"""
        try:
            rsi = talib.RSI(close_prices, timeperiod=timeperiod)
            
            # Filter out NaN values and convert to list
            valid_indices = ~np.isnan(rsi)
            rsi_values = rsi[valid_indices].tolist()
            
            return {
                'timeperiod': timeperiod,
                'values': rsi_values,
                'latest': float(rsi[-1]) if not np.isnan(rsi[-1]) else None,
                'description': 'RSI > 70 indicates overbought, RSI < 30 indicates oversold'
            }
        except Exception as e:
            print(f"Error calculating RSI: {e}")
            return {'error': str(e)}
    
    def _calculate_macd(self, close_prices: np.ndarray, 
                       fastperiod: int = 12, slowperiod: int = 26, signalperiod: int = 9) -> Dict:
        """Calculate Moving Average Convergence Divergence (MACD)"""
        try:
            macd, signal, hist = talib.MACD(close_prices, 
                                           fastperiod=fastperiod,
                                           slowperiod=slowperiod,
                                           signalperiod=signalperiod)
            
            # Filter out NaN values
            valid_indices = ~np.isnan(macd)
            
            return {
                'fastperiod': fastperiod,
                'slowperiod': slowperiod,
                'signalperiod': signalperiod,
                'macd': macd[valid_indices].tolist(),
                'signal': signal[valid_indices].tolist(),
                'histogram': hist[valid_indices].tolist(),
                'latest_macd': float(macd[-1]) if not np.isnan(macd[-1]) else None,
                'latest_signal': float(signal[-1]) if not np.isnan(signal[-1]) else None,
                'latest_histogram': float(hist[-1]) if not np.isnan(hist[-1]) else None,
                'description': 'MACD crossover signals: MACD > Signal = Bullish, MACD < Signal = Bearish'
            }
        except Exception as e:
            print(f"Error calculating MACD: {e}")
            return {'error': str(e)}
    
    def _calculate_bollinger_bands(self, close_prices: np.ndarray, 
                                  timeperiod: int = 20, nbdevup: int = 2, nbdevdn: int = 2) -> Dict:
        """Calculate Bollinger Bands"""
        try:
            upper, middle, lower = talib.BBANDS(close_prices,
                                               timeperiod=timeperiod,
                                               nbdevup=nbdevup,
                                               nbdevdn=nbdevdn,
                                               matype=0)
            
            # Filter out NaN values
            valid_indices = ~np.isnan(upper)
            
            return {
                'timeperiod': timeperiod,
                'nbdevup': nbdevup,
                'nbdevdn': nbdevdn,
                'upper_band': upper[valid_indices].tolist(),
                'middle_band': middle[valid_indices].tolist(),
                'lower_band': lower[valid_indices].tolist(),
                'latest_upper': float(upper[-1]) if not np.isnan(upper[-1]) else None,
                'latest_middle': float(middle[-1]) if not np.isnan(middle[-1]) else None,
                'latest_lower': float(lower[-1]) if not np.isnan(lower[-1]) else None,
                'description': 'Price near upper band = overbought, price near lower band = oversold'
            }
        except Exception as e:
            print(f"Error calculating Bollinger Bands: {e}")
            return {'error': str(e)}
    
    def _calculate_sma(self, close_prices: np.ndarray) -> Dict:
        """Calculate Simple Moving Averages for multiple periods"""
        try:
            sma_20 = talib.SMA(close_prices, timeperiod=20)
            sma_50 = talib.SMA(close_prices, timeperiod=50)
            sma_200 = talib.SMA(close_prices, timeperiod=200)
            
            return {
                'sma_20': {
                    'values': sma_20[~np.isnan(sma_20)].tolist(),
                    'latest': float(sma_20[-1]) if not np.isnan(sma_20[-1]) else None
                },
                'sma_50': {
                    'values': sma_50[~np.isnan(sma_50)].tolist(),
                    'latest': float(sma_50[-1]) if not np.isnan(sma_50[-1]) else None
                },
                'sma_200': {
                    'values': sma_200[~np.isnan(sma_200)].tolist(),
                    'latest': float(sma_200[-1]) if not np.isnan(sma_200[-1]) else None
                },
                'description': 'Golden Cross: 50 SMA crosses above 200 SMA = Bullish'
            }
        except Exception as e:
            print(f"Error calculating SMA: {e}")
            return {'error': str(e)}
    
    def _calculate_ema(self, close_prices: np.ndarray) -> Dict:
        """Calculate Exponential Moving Averages for multiple periods"""
        try:
            ema_12 = talib.EMA(close_prices, timeperiod=12)
            ema_26 = talib.EMA(close_prices, timeperiod=26)
            ema_50 = talib.EMA(close_prices, timeperiod=50)
            
            return {
                'ema_12': {
                    'values': ema_12[~np.isnan(ema_12)].tolist(),
                    'latest': float(ema_12[-1]) if not np.isnan(ema_12[-1]) else None
                },
                'ema_26': {
                    'values': ema_26[~np.isnan(ema_26)].tolist(),
                    'latest': float(ema_26[-1]) if not np.isnan(ema_26[-1]) else None
                },
                'ema_50': {
                    'values': ema_50[~np.isnan(ema_50)].tolist(),
                    'latest': float(ema_50[-1]) if not np.isnan(ema_50[-1]) else None
                },
                'description': 'EMA reacts faster to price changes than SMA'
            }
        except Exception as e:
            print(f"Error calculating EMA: {e}")
            return {'error': str(e)}


class CoinMarketCapService:
    """Service for fetching cryptocurrency data from CoinMarketCap API"""

    BASE_URL = "https://pro-api.coinmarketcap.com/v1"

    def __init__(self):
        # Get API key from environment variable
        self.api_key = os.getenv('COINMARKETCAP_API_KEY')
        self.headers = {
            'Accepts': 'application/json',
            'X-CMC_PRO_API_KEY': self.api_key,
        } if self.api_key else None

    def get_crypto_listings(self, limit: int = 100) -> Dict:
        """Get list of cryptocurrencies with market data"""
        # Check cache first (60 second cache)
        cache_key = f'crypto_listings_{limit}'
        cached_data = cache.get(cache_key)
        if cached_data:
            return cached_data

        if not self.api_key:
            return self._get_mock_crypto_listings(limit)

        try:
            url = f"{self.BASE_URL}/cryptocurrency/listings/latest"
            params = {
                'limit': limit,
                'convert': 'USD'
            }

            response = requests.get(url, headers=self.headers, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            if 'data' in data:
                cryptos = []
                for crypto in data['data']:
                    quote = crypto.get('quote', {}).get('USD', {})
                    cryptos.append({
                        'id': crypto.get('id'),
                        'symbol': crypto.get('symbol'),
                        'name': crypto.get('name'),
                        'slug': crypto.get('slug'),
                        'cmc_rank': crypto.get('cmc_rank'),
                        'current_price': round(quote.get('price', 0), 2),
                        'market_cap': quote.get('market_cap'),
                        'volume_24h': quote.get('volume_24h'),
                        'circulating_supply': crypto.get('circulating_supply'),
                        'total_supply': crypto.get('total_supply'),
                        'max_supply': crypto.get('max_supply'),
                        'change_1h': round(quote.get('percent_change_1h', 0), 2),
                        'change_24h': round(quote.get('percent_change_24h', 0), 2),
                        'change_7d': round(quote.get('percent_change_7d', 0), 2),
                        'change_30d': round(quote.get('percent_change_30d', 0), 2),
                        'last_updated': quote.get('last_updated')
                    })

                result = {
                    'status': 'success',
                    'data': {
                        'cryptos': cryptos,
                        'total': len(cryptos)
                    },
                    'timestamp': datetime.now().isoformat()
                }

                # Cache for 60 seconds
                cache.set(cache_key, result, 60)
                return result
            else:
                return self._get_mock_crypto_listings(limit)

        except Exception as e:
            print(f"CoinMarketCap API error: {e}")
            return self._get_mock_crypto_listings(limit)

    def get_crypto_detail(self, symbol: str) -> Dict:
        """Get detailed information for a specific cryptocurrency"""
        # Check cache first (60 second cache)
        cache_key = f'crypto_detail_{symbol.upper()}'
        cached_data = cache.get(cache_key)
        if cached_data:
            return cached_data

        if not self.api_key:
            return self._get_mock_crypto_detail(symbol)

        try:
            # First get the quote data
            url = f"{self.BASE_URL}/cryptocurrency/quotes/latest"
            params = {
                'symbol': symbol.upper(),
                'convert': 'USD'
            }

            response = requests.get(url, headers=self.headers, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            if 'data' in data and symbol.upper() in data['data']:
                crypto = data['data'][symbol.upper()]
                quote = crypto.get('quote', {}).get('USD', {})

                # Get additional metadata
                info_url = f"{self.BASE_URL}/cryptocurrency/info"
                info_params = {'symbol': symbol.upper()}
                info_response = requests.get(info_url, headers=self.headers, params=info_params, timeout=10)
                info_data = info_response.json().get('data', {}).get(symbol.upper(), {})

                result = {
                    'status': 'success',
                    'data': {
                        'id': crypto.get('id'),
                        'symbol': crypto.get('symbol'),
                        'name': crypto.get('name'),
                        'slug': crypto.get('slug'),
                        'description': info_data.get('description', ''),
                        'website': info_data.get('urls', {}).get('website', []),
                        'whitepaper': info_data.get('urls', {}).get('technical_doc', []),
                        'twitter': info_data.get('urls', {}).get('twitter', []),
                        'logo': info_data.get('logo'),
                        'cmc_rank': crypto.get('cmc_rank'),
                        'current_price': round(quote.get('price', 0), 2),
                        'market_cap': quote.get('market_cap'),
                        'market_cap_dominance': round(quote.get('market_cap_dominance', 0), 2),
                        'fully_diluted_market_cap': quote.get('fully_diluted_market_cap'),
                        'volume_24h': quote.get('volume_24h'),
                        'circulating_supply': crypto.get('circulating_supply'),
                        'total_supply': crypto.get('total_supply'),
                        'max_supply': crypto.get('max_supply'),
                        'change_1h': round(quote.get('percent_change_1h', 0), 2),
                        'change_24h': round(quote.get('percent_change_24h', 0), 2),
                        'change_7d': round(quote.get('percent_change_7d', 0), 2),
                        'change_30d': round(quote.get('percent_change_30d', 0), 2),
                        'change_60d': round(quote.get('percent_change_60d', 0), 2),
                        'change_90d': round(quote.get('percent_change_90d', 0), 2),
                        'last_updated': quote.get('last_updated'),
                        'tags': crypto.get('tags', []),
                        'category': info_data.get('category', ''),
                        'date_added': crypto.get('date_added')
                    },
                    'timestamp': datetime.now().isoformat()
                }

                # Cache for 60 seconds
                cache.set(cache_key, result, 60)
                return result
            else:
                return self._get_mock_crypto_detail(symbol)

        except Exception as e:
            print(f"CoinMarketCap API error for {symbol}: {e}")
            return self._get_mock_crypto_detail(symbol)

    def get_top_gainers(self, limit: int = 10) -> Dict:
        """Get top gaining cryptocurrencies in last 24 hours"""
        if not self.api_key:
            return self._get_mock_top_movers('gainers', limit)

        try:
            # Get listings and sort by 24h change
            listings = self.get_crypto_listings(limit=200)

            if listings['status'] == 'success':
                cryptos = listings['data']['cryptos']
                # Filter and sort by 24h change (positive only)
                gainers = [c for c in cryptos if c['change_24h'] > 0]
                gainers.sort(key=lambda x: x['change_24h'], reverse=True)

                return {
                    'status': 'success',
                    'data': {
                        'cryptos': gainers[:limit],
                        'total': len(gainers[:limit])
                    },
                    'timestamp': datetime.now().isoformat()
                }
            else:
                return self._get_mock_top_movers('gainers', limit)

        except Exception as e:
            print(f"CoinMarketCap gainers error: {e}")
            return self._get_mock_top_movers('gainers', limit)

    def get_top_losers(self, limit: int = 10) -> Dict:
        """Get top losing cryptocurrencies in last 24 hours"""
        if not self.api_key:
            return self._get_mock_top_movers('losers', limit)

        try:
            # Get listings and sort by 24h change
            listings = self.get_crypto_listings(limit=200)

            if listings['status'] == 'success':
                cryptos = listings['data']['cryptos']
                # Filter and sort by 24h change (negative only)
                losers = [c for c in cryptos if c['change_24h'] < 0]
                losers.sort(key=lambda x: x['change_24h'])

                return {
                    'status': 'success',
                    'data': {
                        'cryptos': losers[:limit],
                        'total': len(losers[:limit])
                    },
                    'timestamp': datetime.now().isoformat()
                }
            else:
                return self._get_mock_top_movers('losers', limit)

        except Exception as e:
            print(f"CoinMarketCap losers error: {e}")
            return self._get_mock_top_movers('losers', limit)

    def _get_mock_crypto_listings(self, limit: int) -> Dict:
        """Fallback mock data for crypto listings"""
        mock_cryptos = [
            {
                'id': 1,
                'symbol': 'BTC',
                'name': 'Bitcoin',
                'slug': 'bitcoin',
                'cmc_rank': 1,
                'current_price': 43250.50,
                'market_cap': 850000000000,
                'volume_24h': 25000000000,
                'circulating_supply': 19600000,
                'total_supply': 21000000,
                'max_supply': 21000000,
                'change_1h': 0.5,
                'change_24h': 2.3,
                'change_7d': 5.1,
                'change_30d': 12.5,
                'last_updated': datetime.now().isoformat()
            },
            {
                'id': 1027,
                'symbol': 'ETH',
                'name': 'Ethereum',
                'slug': 'ethereum',
                'cmc_rank': 2,
                'current_price': 2350.75,
                'market_cap': 280000000000,
                'volume_24h': 15000000000,
                'circulating_supply': 120000000,
                'total_supply': None,
                'max_supply': None,
                'change_1h': 0.8,
                'change_24h': 3.1,
                'change_7d': 7.2,
                'change_30d': 15.8,
                'last_updated': datetime.now().isoformat()
            }
        ]

        return {
            'status': 'success',
            'data': {
                'cryptos': mock_cryptos[:limit],
                'total': len(mock_cryptos[:limit])
            },
            'timestamp': datetime.now().isoformat()
        }

    def _get_mock_crypto_detail(self, symbol: str) -> Dict:
        """Fallback mock data for crypto detail"""
        return {
            'status': 'success',
            'data': {
                'id': 1,
                'symbol': symbol.upper(),
                'name': f'Mock {symbol}',
                'slug': symbol.lower(),
                'description': f'This is mock data for {symbol}. Please configure CoinMarketCap API key.',
                'website': [],
                'whitepaper': [],
                'twitter': [],
                'logo': '',
                'cmc_rank': 1,
                'current_price': 43250.50,
                'market_cap': 850000000000,
                'market_cap_dominance': 45.5,
                'fully_diluted_market_cap': 900000000000,
                'volume_24h': 25000000000,
                'circulating_supply': 19600000,
                'total_supply': 21000000,
                'max_supply': 21000000,
                'change_1h': 0.5,
                'change_24h': 2.3,
                'change_7d': 5.1,
                'change_30d': 12.5,
                'change_60d': 18.2,
                'change_90d': 25.7,
                'last_updated': datetime.now().isoformat(),
                'tags': ['mineable', 'pow'],
                'category': 'cryptocurrency',
                'date_added': '2013-04-28T00:00:00.000Z'
            },
            'timestamp': datetime.now().isoformat()
        }

    def _get_mock_top_movers(self, type: str, limit: int) -> Dict:
        """Fallback mock data for top gainers/losers"""
        if type == 'gainers':
            mock_data = [
                {
                    'symbol': 'SOL',
                    'name': 'Solana',
                    'current_price': 105.25,
                    'change_24h': 15.3,
                    'market_cap': 45000000000,
                    'volume_24h': 3500000000
                },
                {
                    'symbol': 'AVAX',
                    'name': 'Avalanche',
                    'current_price': 38.50,
                    'change_24h': 12.1,
                    'market_cap': 14000000000,
                    'volume_24h': 800000000
                }
            ]
        else:
            mock_data = [
                {
                    'symbol': 'DOGE',
                    'name': 'Dogecoin',
                    'current_price': 0.08,
                    'change_24h': -8.5,
                    'market_cap': 11000000000,
                    'volume_24h': 500000000
                },
                {
                    'symbol': 'SHIB',
                    'name': 'Shiba Inu',
                    'current_price': 0.000009,
                    'change_24h': -6.2,
                    'market_cap': 5000000000,
                    'volume_24h': 300000000
                }
            ]

        return {
            'status': 'success',
            'data': {
                'cryptos': mock_data[:limit],
                'total': len(mock_data[:limit])
            },
            'timestamp': datetime.now().isoformat()
        }


class CoinGeckoService:
    """Service for fetching cryptocurrency historical data from CoinGecko API (free)"""

    BASE_URL = "https://api.coingecko.com/api/v3"

    # Mapping of common symbols to CoinGecko IDs
    SYMBOL_TO_ID = {
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'BNB': 'binancecoin',
        'SOL': 'solana',
        'XRP': 'ripple',
        'ADA': 'cardano',
        'DOGE': 'dogecoin',
        'AVAX': 'avalanche-2',
        'DOT': 'polkadot',
        'MATIC': 'matic-network',
        'LINK': 'chainlink',
        'UNI': 'uniswap',
        'LTC': 'litecoin',
        'ATOM': 'cosmos',
        'XLM': 'stellar',
        'ALGO': 'algorand',
        'NEAR': 'near',
        'APT': 'aptos',
        'ARB': 'arbitrum',
        'OP': 'optimism',
    }

    def get_coin_id(self, symbol: str) -> str:
        """Convert symbol to CoinGecko coin ID"""
        return self.SYMBOL_TO_ID.get(symbol.upper(), symbol.lower())

    def get_historical_data(self, symbol: str, days: int = 7) -> Dict:
        """
        Get historical market data (price, market cap, volume) for a cryptocurrency

        Args:
            symbol: Cryptocurrency symbol (e.g., 'BTC', 'ETH')
            days: Number of days of data (1, 7, 30, 90, 180, 365, max)

        Returns:
            Dict with historical prices, market_caps, and volumes
        """
        # Check cache first (5 minute cache for historical data)
        cache_key = f'crypto_historical_{symbol.upper()}_{days}'
        cached_data = cache.get(cache_key)
        if cached_data:
            return cached_data

        try:
            coin_id = self.get_coin_id(symbol)
            url = f"{self.BASE_URL}/coins/{coin_id}/market_chart"
            params = {
                'vs_currency': 'usd',
                'days': days,
                'interval': 'daily' if days > 1 else 'hourly'
            }

            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            # Format the data for frontend
            prices = []
            if 'prices' in data:
                for timestamp, price in data['prices']:
                    prices.append({
                        'timestamp': timestamp,
                        'date': datetime.fromtimestamp(timestamp / 1000).strftime('%Y-%m-%d %H:%M'),
                        'price': round(price, 2)
                    })

            market_caps = []
            if 'market_caps' in data:
                for timestamp, market_cap in data['market_caps']:
                    market_caps.append({
                        'timestamp': timestamp,
                        'date': datetime.fromtimestamp(timestamp / 1000).strftime('%Y-%m-%d %H:%M'),
                        'market_cap': round(market_cap, 2)
                    })

            volumes = []
            if 'total_volumes' in data:
                for timestamp, volume in data['total_volumes']:
                    volumes.append({
                        'timestamp': timestamp,
                        'date': datetime.fromtimestamp(timestamp / 1000).strftime('%Y-%m-%d %H:%M'),
                        'volume': round(volume, 2)
                    })

            result = {
                'status': 'success',
                'data': {
                    'symbol': symbol.upper(),
                    'coin_id': coin_id,
                    'days': days,
                    'prices': prices,
                    'market_caps': market_caps,
                    'volumes': volumes
                },
                'timestamp': datetime.now().isoformat()
            }

            # Cache for 5 minutes (300 seconds)
            cache.set(cache_key, result, 300)
            return result

        except requests.exceptions.RequestException as e:
            print(f"CoinGecko API error: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }

    def get_ohlc_data(self, symbol: str, days: int = 7) -> Dict:
        """
        Get OHLC (Open, High, Low, Close) candlestick data for a cryptocurrency

        Args:
            symbol: Cryptocurrency symbol (e.g., 'BTC', 'ETH')
            days: Number of days (1, 7, 14, 30, 90, 180, 365)

        Returns:
            Dict with OHLC candlestick data
        """
        # Check cache first (5 minute cache for OHLC data)
        cache_key = f'crypto_ohlc_{symbol.upper()}_{days}'
        cached_data = cache.get(cache_key)
        if cached_data:
            return cached_data

        try:
            coin_id = self.get_coin_id(symbol)
            url = f"{self.BASE_URL}/coins/{coin_id}/ohlc"
            params = {
                'vs_currency': 'usd',
                'days': days
            }

            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            # Format the OHLC data for frontend
            ohlc_data = []
            for candle in data:
                timestamp, open_price, high, low, close = candle
                ohlc_data.append({
                    'timestamp': timestamp,
                    'date': datetime.fromtimestamp(timestamp / 1000).strftime('%Y-%m-%d %H:%M'),
                    'open': round(open_price, 2),
                    'high': round(high, 2),
                    'low': round(low, 2),
                    'close': round(close, 2)
                })

            result = {
                'status': 'success',
                'data': {
                    'symbol': symbol.upper(),
                    'coin_id': coin_id,
                    'days': days,
                    'ohlc': ohlc_data
                },
                'timestamp': datetime.now().isoformat()
            }

            # Cache for 5 minutes (300 seconds)
            cache.set(cache_key, result, 300)
            return result

        except requests.exceptions.RequestException as e:
            print(f"CoinGecko OHLC API error: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
