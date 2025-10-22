from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime, timedelta
import json
import random
from .services import FREDService, YahooFinanceService


@csrf_exempt
def economic_data(request):
    """Real economic data from FRED API"""
    if request.method == 'GET':
        fred_service = FREDService()
        data = fred_service.get_economic_indicators()
        return JsonResponse(data)
    
    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def stocks_list(request):
    """Real market data from Yahoo Finance"""
    if request.method == 'GET':
        yahoo_service = YahooFinanceService()
        data = yahoo_service.get_market_data()
        return JsonResponse(data)
    
    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def stock_detail(request, symbol):
    """Real individual stock details with historical data"""
    if request.method == 'GET':
        yahoo_service = YahooFinanceService()
        data = yahoo_service.get_stock_detail(symbol)
        return JsonResponse(data)
    
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