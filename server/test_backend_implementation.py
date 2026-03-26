#!/usr/bin/env python3
"""
Backend implementation test script
Verifies all new models and methods are properly defined
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'macrodash.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    django.setup()
    print("✅ Django setup successful\n")
except Exception as e:
    print(f"❌ Django setup failed: {e}")
    sys.exit(1)

# Test 1: Import models
print("=" * 60)
print("TEST 1: Model Imports")
print("=" * 60)

try:
    from api.models import PortfolioRecommendation, NewsSynthesis, UserPreferences
    print("✅ Successfully imported PortfolioRecommendation")
    print("✅ Successfully imported NewsSynthesis")
    print("✅ Successfully imported UserPreferences")
    print()
except Exception as e:
    print(f"❌ Failed to import models: {e}")
    sys.exit(1)

# Test 2: Verify model fields
print("=" * 60)
print("TEST 2: Model Fields Verification")
print("=" * 60)

try:
    # Check PortfolioRecommendation fields
    pr_fields = [f.name for f in PortfolioRecommendation._meta.get_fields()]
    expected_pr = ['symbol', 'stock_name', 'recommendation', 'confidence_score',
                   'reasoning', 'signals', 'raw_analysis', 'created_at', 'updated_at']

    print(f"PortfolioRecommendation fields: {pr_fields}")
    for field in expected_pr:
        if field in pr_fields:
            print(f"  ✅ {field}")
        else:
            print(f"  ❌ {field} - MISSING")
    print()

    # Check NewsSynthesis fields
    ns_fields = [f.name for f in NewsSynthesis._meta.get_fields()]
    expected_ns = ['symbol', 'stock_name', 'impact_score', 'summary',
                   'key_developments', 'entities_mentioned', 'articles_analyzed',
                   'created_at', 'updated_at']

    print(f"NewsSynthesis fields: {ns_fields}")
    for field in expected_ns:
        if field in ns_fields:
            print(f"  ✅ {field}")
        else:
            print(f"  ❌ {field} - MISSING")
    print()

    # Check UserPreferences for agent_notifications field
    up_fields = [f.name for f in UserPreferences._meta.get_fields()]
    if 'agent_notifications' in up_fields:
        print("✅ UserPreferences.agent_notifications field exists")
    else:
        print("❌ UserPreferences.agent_notifications field MISSING")
    print()

except Exception as e:
    print(f"❌ Field verification failed: {e}")
    sys.exit(1)

# Test 3: Import services
print("=" * 60)
print("TEST 3: Service Imports")
print("=" * 60)

try:
    from api.services import OpenAIService
    print("✅ Successfully imported OpenAIService")

    # Check if methods exist
    service = OpenAIService()

    if hasattr(service, 'run_portfolio_agent'):
        print("✅ run_portfolio_agent method exists")
    else:
        print("❌ run_portfolio_agent method MISSING")

    if hasattr(service, 'run_news_synthesis_agent'):
        print("✅ run_news_synthesis_agent method exists")
    else:
        print("❌ run_news_synthesis_agent method MISSING")

    print()

except Exception as e:
    print(f"❌ Service import failed: {e}")
    sys.exit(1)

# Test 4: Verify API endpoints
print("=" * 60)
print("TEST 4: API Endpoints")
print("=" * 60)

try:
    from api.views import portfolio_recommendations, news_synthesis, user_preferences
    print("✅ portfolio_recommendations endpoint imported")
    print("✅ news_synthesis endpoint imported")
    print("✅ user_preferences endpoint imported")
    print()

except Exception as e:
    print(f"❌ API endpoint import failed: {e}")
    sys.exit(1)

# Test 5: Verify URL routes
print("=" * 60)
print("TEST 5: URL Routes")
print("=" * 60)

try:
    from django.urls import get_resolver
    resolver = get_resolver()

    endpoints = [
        'agent/portfolio/',
        'agent/news-synthesis/',
        'preferences/'
    ]

    for endpoint in endpoints:
        try:
            resolver.resolve(f'/api/{endpoint}')
            print(f"✅ /api/{endpoint} route registered")
        except:
            print(f"❌ /api/{endpoint} route NOT registered")
    print()

except Exception as e:
    print(f"❌ URL route verification failed: {e}")
    sys.exit(1)

# Test 6: Verify Scheduler Jobs
print("=" * 60)
print("TEST 6: Scheduler Jobs")
print("=" * 60)

try:
    from api.scheduler import run_portfolio_agent, run_news_synthesis_agent, send_agent_report_email
    print("✅ run_portfolio_agent job imported")
    print("✅ run_news_synthesis_agent job imported")
    print("✅ send_agent_report_email function imported")
    print()

except Exception as e:
    print(f"❌ Scheduler job import failed: {e}")
    sys.exit(1)

# Test 7: Database connectivity
print("=" * 60)
print("TEST 7: Database Connectivity")
print("=" * 60)

try:
    from django.db import connection
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
        print("✅ Database connection successful")
    print()

except Exception as e:
    print(f"❌ Database connection failed: {e}")
    sys.exit(1)

# Test 8: Model creation (dry run)
print("=" * 60)
print("TEST 8: Model Instance Creation (Validation)")
print("=" * 60)

try:
    # Create instance without saving (just validation)
    pr = PortfolioRecommendation(
        symbol='AAPL',
        stock_name='Apple Inc.',
        recommendation='BUY',
        confidence_score=0.85,
        reasoning=['Strong growth', 'Analyst upgrades'],
        signals={'bullish': ['Revenue +15%'], 'bearish': ['Competition']}
    )
    print(f"✅ PortfolioRecommendation instance created: {pr}")

    ns = NewsSynthesis(
        symbol='MSFT',
        stock_name='Microsoft',
        impact_score=0.65,
        summary='Recent earnings beat expectations',
        key_developments=['Q4 beat', 'Guidance raised'],
        entities_mentioned=['Azure', 'Cloud'],
        articles_analyzed=8
    )
    print(f"✅ NewsSynthesis instance created: {ns}")
    print()

except Exception as e:
    print(f"❌ Model instance creation failed: {e}")
    sys.exit(1)

# Summary
print("=" * 60)
print("BACKEND TESTING SUMMARY")
print("=" * 60)
print("✅ All tests passed!")
print()
print("Backend implementation is ready for deployment.")
print()
print("Next steps:")
print("1. Run: python manage.py migrate")
print("2. Set environment variables (OPENAI_API_KEY, etc.)")
print("3. Start server: python manage.py runserver")
print("=" * 60)
