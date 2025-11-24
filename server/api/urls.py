from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health_check, name='health_check'),
    path('economic-data/', views.economic_data, name='economic_data'),
    path('economic-data/<str:series_id>/', views.economic_indicator_detail, name='economic_indicator_detail'),
    path('stocks/', views.stocks_list, name='stocks_list'),
    path('stocks/browse/', views.browse_stocks, name='browse_stocks'),
    path('stocks/intraday/', views.stocks_intraday, name='stocks_intraday'),
    path('stocks/<str:symbol>/', views.stock_detail, name='stock_detail'),
    path('news/<str:symbol>/', views.stock_news, name='stock_news'),
    path('dashboard/', views.dashboard_config, name='dashboard_config'),
    path('sentiment/<str:symbol>/', views.sentiment_analysis, name='sentiment_analysis'),
    # Alpha Vantage endpoints
    path('alpha-vantage/quote/<str:symbol>/', views.alpha_vantage_quote, name='alpha_vantage_quote'),
    path('alpha-vantage/intraday/<str:symbol>/', views.alpha_vantage_intraday, name='alpha_vantage_intraday'),
    path('alpha-vantage/daily/<str:symbol>/', views.alpha_vantage_daily, name='alpha_vantage_daily'),
    path('alpha-vantage/overview/<str:symbol>/', views.alpha_vantage_overview, name='alpha_vantage_overview'),
    path('alpha-vantage/news/', views.alpha_vantage_news, name='alpha_vantage_news'),
    # Company financials and analyst data
    path('company/<str:symbol>/financials/', views.company_financials, name='company_financials'),
    path('company/<str:symbol>/earnings/', views.company_earnings, name='company_earnings'),
    path('company/<str:symbol>/analyst-recommendations/', views.analyst_recommendations, name='analyst_recommendations'),
    path('company/<str:symbol>/insights/', views.stock_insights, name='stock_insights'),
    path('company/<str:symbol>/overview/', views.company_overview_yahoo, name='company_overview_yahoo'),
    # AI Chatbot
    path('chatbot/', views.chatbot, name='chatbot'),
    # Price Alerts
    path('alerts/', views.price_alerts, name='price_alerts'),
    path('alerts/<int:alert_id>/', views.price_alert_detail, name='price_alert_detail'),
    # Technical Indicators
    path('technical-indicators/<str:symbol>/', views.technical_indicators, name='technical_indicators'),
    # Cryptocurrency endpoints
    path('crypto/', views.crypto_listings, name='crypto_listings'),
    path('crypto/top/gainers/', views.crypto_top_gainers, name='crypto_top_gainers'),
    path('crypto/top/losers/', views.crypto_top_losers, name='crypto_top_losers'),
    path('crypto/<str:symbol>/historical/', views.crypto_historical, name='crypto_historical'),
    path('crypto/<str:symbol>/ohlc/', views.crypto_ohlc, name='crypto_ohlc'),
    path('crypto/<str:symbol>/', views.crypto_detail, name='crypto_detail'),
    # Custom Analysis
    path('custom-analysis/', views.custom_analysis, name='custom_analysis'),
    # AI-Generated Blog/Event Insights
    path('ai-insights/', views.all_insights, name='all_ai_insights'),
    path('ai-insights/<str:symbol>/', views.ai_stock_insights, name='ai_stock_insights'),
    # Authentication
    path('admin/users/', views.admin_users, name='admin_users'),
    # Data Explorer
    path('search/', views.search_data, name='search_data'),
    path('fred/categories/', views.fred_categories, name='fred_categories'),
    path('fred/categories/<int:category_id>/series/', views.fred_category_series, name='fred_category_series'),
    path('fred/series/<str:series_id>/metadata/', views.fred_series_metadata, name='fred_series_metadata'),
    path('export/', views.export_data, name='export_data'),
    # Saved Charts
    path('charts/', views.saved_charts, name='saved_charts'),
    path('charts/<int:chart_id>/data/', views.chart_data, name='chart_data'),
]