from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime, timedelta
import json
import random


@csrf_exempt
def economic_data(request):
    """Mock economic data from FRED API"""
    if request.method == 'GET':
        mock_data = {
            "status": "success",
            "data": {
                "gdp": {
                    "current": 26950.0,
                    "previous": 26850.0,
                    "change": 100.0,
                    "change_percent": 0.37,
                    "unit": "Billions of Dollars",
                    "last_updated": "2024-01-15"
                },
                "unemployment_rate": {
                    "current": 3.7,
                    "previous": 3.9,
                    "change": -0.2,
                    "change_percent": -5.13,
                    "unit": "Percent",
                    "last_updated": "2024-01-15"
                },
                "federal_funds_rate": {
                    "current": 5.25,
                    "previous": 5.50,
                    "change": -0.25,
                    "change_percent": -4.55,
                    "unit": "Percent",
                    "last_updated": "2024-01-15"
                },
                "inflation_rate": {
                    "current": 3.2,
                    "previous": 3.7,
                    "change": -0.5,
                    "change_percent": -13.51,
                    "unit": "Percent",
                    "last_updated": "2024-01-15"
                },
                "consumer_confidence": {
                    "current": 110.7,
                    "previous": 108.3,
                    "change": 2.4,
                    "change_percent": 2.22,
                    "unit": "Index",
                    "last_updated": "2024-01-15"
                }
            },
            "timestamp": datetime.now().isoformat()
        }
        return JsonResponse(mock_data)
    
    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def stocks_list(request):
    """Mock top stocks data from Yahoo Finance"""
    if request.method == 'GET':
        mock_stocks = {
            "status": "success",
            "data": {
                "top_stocks": [
                    {
                        "symbol": "AAPL",
                        "name": "Apple Inc.",
                        "price": 192.53,
                        "change": 2.85,
                        "change_percent": 1.50,
                        "volume": 45678900,
                        "market_cap": 2980000000000
                    },
                    {
                        "symbol": "MSFT",
                        "name": "Microsoft Corporation",
                        "price": 378.85,
                        "change": -1.25,
                        "change_percent": -0.33,
                        "volume": 23456789,
                        "market_cap": 2810000000000
                    },
                    {
                        "symbol": "GOOGL",
                        "name": "Alphabet Inc.",
                        "price": 142.56,
                        "change": 0.89,
                        "change_percent": 0.63,
                        "volume": 18765432,
                        "market_cap": 1790000000000
                    },
                    {
                        "symbol": "AMZN",
                        "name": "Amazon.com Inc.",
                        "price": 151.94,
                        "change": -0.67,
                        "change_percent": -0.44,
                        "volume": 34567890,
                        "market_cap": 1580000000000
                    },
                    {
                        "symbol": "TSLA",
                        "name": "Tesla Inc.",
                        "price": 248.42,
                        "change": 12.78,
                        "change_percent": 5.42,
                        "volume": 67890123,
                        "market_cap": 789000000000
                    }
                ],
                "market_summary": {
                    "sp500": {
                        "value": 4783.45,
                        "change": 15.67,
                        "change_percent": 0.33
                    },
                    "dow_jones": {
                        "value": 37863.80,
                        "change": -45.23,
                        "change_percent": -0.12
                    },
                    "nasdaq": {
                        "value": 14968.78,
                        "change": 89.34,
                        "change_percent": 0.60
                    }
                }
            },
            "timestamp": datetime.now().isoformat()
        }
        return JsonResponse(mock_stocks)
    
    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def stock_detail(request, symbol):
    """Mock individual stock details with historical data"""
    if request.method == 'GET':
        # Generate mock historical data
        historical_data = []
        base_price = 150.0 + random.uniform(-50, 100)
        
        for i in range(30):  # 30 days of data
            date = (datetime.now() - timedelta(days=29-i)).strftime('%Y-%m-%d')
            price = base_price + random.uniform(-10, 10)
            historical_data.append({
                "date": date,
                "open": round(price + random.uniform(-2, 2), 2),
                "high": round(price + random.uniform(0, 5), 2),
                "low": round(price - random.uniform(0, 5), 2),
                "close": round(price, 2),
                "volume": random.randint(1000000, 100000000)
            })
            base_price = price
        
        mock_detail = {
            "status": "success",
            "data": {
                "symbol": symbol.upper(),
                "name": f"{symbol.upper()} Corporation",
                "current_price": historical_data[-1]["close"],
                "change": round(historical_data[-1]["close"] - historical_data[-2]["close"], 2),
                "change_percent": round(((historical_data[-1]["close"] - historical_data[-2]["close"]) / historical_data[-2]["close"]) * 100, 2),
                "volume": historical_data[-1]["volume"],
                "market_cap": random.randint(10000000000, 3000000000000),
                "pe_ratio": round(random.uniform(10, 35), 2),
                "dividend_yield": round(random.uniform(0, 5), 2),
                "52_week_high": max([day["high"] for day in historical_data]),
                "52_week_low": min([day["low"] for day in historical_data]),
                "historical_data": historical_data
            },
            "timestamp": datetime.now().isoformat()
        }
        return JsonResponse(mock_detail)
    
    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def stock_news(request, symbol):
    """Mock financial news for a specific stock"""
    if request.method == 'GET':
        mock_news = {
            "status": "success",
            "data": {
                "symbol": symbol.upper(),
                "news": [
                    {
                        "headline": f"{symbol.upper()} Reports Strong Q4 Earnings Beat",
                        "summary": f"{symbol.upper()} exceeded analyst expectations with strong revenue growth and improved margins.",
                        "source": "Financial News Network",
                        "published_at": (datetime.now() - timedelta(hours=2)).isoformat(),
                        "url": f"https://example.com/news/{symbol.lower()}-earnings",
                        "sentiment": "positive"
                    },
                    {
                        "headline": f"Analysts Upgrade {symbol.upper()} Price Target",
                        "summary": f"Several Wall Street analysts have raised their price targets for {symbol.upper()} following recent developments.",
                        "source": "Market Watch",
                        "published_at": (datetime.now() - timedelta(hours=6)).isoformat(),
                        "url": f"https://example.com/news/{symbol.lower()}-upgrade",
                        "sentiment": "positive"
                    },
                    {
                        "headline": f"{symbol.upper()} Faces Supply Chain Challenges",
                        "summary": f"{symbol.upper()} management discusses ongoing supply chain issues in latest investor call.",
                        "source": "Business Today",
                        "published_at": (datetime.now() - timedelta(hours=12)).isoformat(),
                        "url": f"https://example.com/news/{symbol.lower()}-supply-chain",
                        "sentiment": "neutral"
                    },
                    {
                        "headline": f"New Product Launch Drives {symbol.upper()} Innovation",
                        "summary": f"{symbol.upper()} unveils new product line expected to boost revenue in upcoming quarters.",
                        "source": "Tech Tribune",
                        "published_at": (datetime.now() - timedelta(days=1)).isoformat(),
                        "url": f"https://example.com/news/{symbol.lower()}-product-launch",
                        "sentiment": "positive"
                    }
                ]
            },
            "timestamp": datetime.now().isoformat()
        }
        return JsonResponse(mock_news)
    
    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def dashboard_config(request):
    """Mock dashboard configuration"""
    if request.method == 'GET':
        mock_config = {
            "status": "success",
            "data": {
                "user_id": "user123",
                "dashboard_layout": {
                    "economic_indicators": {
                        "enabled": True,
                        "position": {"x": 0, "y": 0, "width": 6, "height": 4},
                        "indicators": ["gdp", "unemployment_rate", "federal_funds_rate", "inflation_rate"]
                    },
                    "top_stocks": {
                        "enabled": True,
                        "position": {"x": 6, "y": 0, "width": 6, "height": 4},
                        "count": 5
                    },
                    "watchlist": {
                        "enabled": True,
                        "position": {"x": 0, "y": 4, "width": 8, "height": 3},
                        "stocks": ["AAPL", "MSFT", "GOOGL", "AMZN"]
                    },
                    "news_feed": {
                        "enabled": True,
                        "position": {"x": 8, "y": 4, "width": 4, "height": 3},
                        "sources": ["Financial News Network", "Market Watch", "Business Today"]
                    }
                },
                "preferences": {
                    "theme": "light",
                    "refresh_interval": 30,
                    "currency": "USD",
                    "timezone": "EST"
                }
            },
            "timestamp": datetime.now().isoformat()
        }
        return JsonResponse(mock_config)
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            # In a real app, we would save this to the database
            response = {
                "status": "success",
                "message": "Dashboard configuration updated",
                "data": data
            }
            return JsonResponse(response)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
    
    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def sentiment_analysis(request, symbol):
    """Mock LLM-powered sentiment analysis"""
    if request.method == 'GET':
        sentiments = ["positive", "negative", "neutral"]
        overall_sentiment = random.choice(sentiments)
        
        mock_sentiment = {
            "status": "success",
            "data": {
                "symbol": symbol.upper(),
                "overall_sentiment": overall_sentiment,
                "sentiment_score": round(random.uniform(-1, 1), 3),
                "confidence": round(random.uniform(0.6, 0.95), 3),
                "analysis": {
                    "positive_factors": [
                        "Strong earnings growth",
                        "Market expansion opportunities",
                        "Positive analyst coverage"
                    ],
                    "negative_factors": [
                        "Supply chain concerns",
                        "Regulatory challenges",
                        "Increased competition"
                    ],
                    "key_themes": [
                        "Innovation",
                        "Market position",
                        "Financial health"
                    ]
                },
                "sources_analyzed": 15,
                "time_period": "last_7_days",
                "summary": f"Based on analysis of recent news and social media, {symbol.upper()} shows {overall_sentiment} sentiment with moderate confidence. Key factors include earnings performance and market conditions.",
                "disclaimer": "This analysis is for informational purposes only and should not be considered as financial advice."
            },
            "timestamp": datetime.now().isoformat()
        }
        return JsonResponse(mock_sentiment)
    
    return JsonResponse({"error": "Method not allowed"}, status=405)