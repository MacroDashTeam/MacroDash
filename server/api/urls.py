from django.urls import path
from . import views

urlpatterns = [
    path('economic-data/', views.economic_data, name='economic_data'),
    path('stocks/', views.stocks_list, name='stocks_list'),
    path('stocks/<str:symbol>/', views.stock_detail, name='stock_detail'),
    path('news/<str:symbol>/', views.stock_news, name='stock_news'),
    path('dashboard/', views.dashboard_config, name='dashboard_config'),
    path('sentiment/<str:symbol>/', views.sentiment_analysis, name='sentiment_analysis'),
]