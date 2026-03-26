#!/usr/bin/env python3
"""Static code analysis of backend implementation"""
import re

print("=" * 70)
print("STATIC CODE ANALYSIS - BACKEND IMPLEMENTATION")
print("=" * 70)
print()

# Test 1: Check models.py
print("TEST 1: Models Definition")
print("-" * 70)
with open('api/models.py', 'r') as f:
    models_content = f.read()

    # Check PortfolioRecommendation
    if 'class PortfolioRecommendation(models.Model):' in models_content:
        print("✅ PortfolioRecommendation model class defined")
    else:
        print("❌ PortfolioRecommendation model class NOT found")

    # Check NewsSynthesis
    if 'class NewsSynthesis(models.Model):' in models_content:
        print("✅ NewsSynthesis model class defined")
    else:
        print("❌ NewsSynthesis model class NOT found")

    # Check agent_notifications field
    if 'agent_notifications = models.BooleanField' in models_content:
        print("✅ agent_notifications field added to UserPreferences")
    else:
        print("❌ agent_notifications field NOT found")

    # Check required fields in PortfolioRecommendation
    pr_checks = [
        ('symbol', 'CharField'),
        ('recommendation', 'CharField'),
        ('confidence_score', 'FloatField'),
        ('reasoning', 'JSONField'),
        ('signals', 'JSONField'),
    ]
    
    for field, field_type in pr_checks:
        pattern = f"{field}.*{field_type}"
        if re.search(pattern, models_content):
            print(f"  ✅ {field}: {field_type}")

print()

# Test 2: Check services.py
print("TEST 2: Service Methods")
print("-" * 70)
with open('api/services.py', 'r') as f:
    services_content = f.read()

    # Check run_portfolio_agent
    if 'def run_portfolio_agent(self, symbols: List[tuple]) -> List[Dict]:' in services_content:
        print("✅ run_portfolio_agent method signature correct")
    else:
        print("❌ run_portfolio_agent method signature incorrect")

    if 'PortfolioRecommendation.objects.update_or_create' in services_content:
        print("✅ run_portfolio_agent uses upsert pattern")
    else:
        print("❌ run_portfolio_agent missing upsert")

    # Check run_news_synthesis_agent
    if 'def run_news_synthesis_agent(self, symbols: List[tuple]) -> List[Dict]:' in services_content:
        print("✅ run_news_synthesis_agent method signature correct")
    else:
        print("❌ run_news_synthesis_agent method signature incorrect")

    if 'NewsSynthesis.objects.update_or_create' in services_content:
        print("✅ run_news_synthesis_agent uses upsert pattern")
    else:
        print("❌ run_news_synthesis_agent missing upsert")

    # Check GPT-4o-mini model
    if 'gpt-4o-mini' in services_content:
        print("✅ Using gpt-4o-mini model")
    else:
        print("❌ Model not specified correctly")

    # Check prompt parsing
    if 'RECOMMENDATION:' in services_content:
        print("✅ Portfolio agent has response parsing logic")
    else:
        print("❌ Portfolio agent missing response parsing")

print()

# Test 3: Check views.py
print("TEST 3: API Endpoints")
print("-" * 70)
with open('api/views.py', 'r') as f:
    views_content = f.read()

    endpoints = [
        ('portfolio_recommendations', 'GET /api/agent/portfolio/'),
        ('news_synthesis', 'GET /api/agent/news-synthesis/'),
        ('user_preferences', 'GET/PATCH /api/preferences/'),
    ]

    for func_name, endpoint_desc in endpoints:
        if f'def {func_name}(request):' in views_content or f'@api_view.*\ndef {func_name}' in views_content:
            print(f"✅ {func_name} endpoint - {endpoint_desc}")
        else:
            print(f"❌ {func_name} endpoint NOT found")

    # Check authentication handling
    if '@api_view' in views_content and 'IsAuthenticated' in views_content:
        print("✅ Authentication decorators present")
    else:
        print("⚠️  Check authentication handling manually")

print()

# Test 4: Check urls.py
print("TEST 4: URL Routes")
print("-" * 70)
with open('api/urls.py', 'r') as f:
    urls_content = f.read()

    routes = [
        "path('agent/portfolio/', views.portfolio_recommendations",
        "path('agent/news-synthesis/', views.news_synthesis",
        "path('preferences/', views.user_preferences",
    ]

    for route in routes:
        if route in urls_content:
            print(f"✅ Route registered: {route.split(',')[0]}")
        else:
            print(f"❌ Route NOT registered: {route}")

print()

# Test 5: Check scheduler.py
print("TEST 5: Scheduler Jobs")
print("-" * 70)
with open('api/scheduler.py', 'r') as f:
    scheduler_content = f.read()

    if 'def run_portfolio_agent():' in scheduler_content:
        print("✅ run_portfolio_agent job function defined")
    else:
        print("❌ run_portfolio_agent job NOT defined")

    if 'def run_news_synthesis_agent():' in scheduler_content:
        print("✅ run_news_synthesis_agent job function defined")
    else:
        print("❌ run_news_synthesis_agent job NOT defined")

    if 'def send_agent_report_email' in scheduler_content:
        print("✅ send_agent_report_email function defined")
    else:
        print("❌ send_agent_report_email function NOT defined")

    # Check job registration
    if "scheduler.add_job(\n            run_portfolio_agent" in scheduler_content:
        print("✅ run_portfolio_agent registered with scheduler")
    else:
        print("⚠️  Check run_portfolio_agent scheduler registration")

    if "scheduler.add_job(\n            run_news_synthesis_agent" in scheduler_content:
        print("✅ run_news_synthesis_agent registered with scheduler")
    else:
        print("⚠️  Check run_news_synthesis_agent scheduler registration")

    # Check 6-hour interval
    if "hours=6" in scheduler_content:
        print("✅ Jobs configured for 6-hour interval")
    else:
        print("❌ Jobs NOT configured for correct interval")

    # Check email sending
    if 'send_mail' in scheduler_content and 'UserPreferences' in scheduler_content:
        print("✅ Email notification logic present")
    else:
        print("❌ Email notification logic incomplete")

print()

# Test 6: Check frontend components
print("TEST 6: Frontend Components")
print("-" * 70)

import os
frontend_path = '../client/src/components'

components = [
    'agent-recommendations-panel.tsx',
    'news-synthesis-panel.tsx',
]

for component in components:
    path = os.path.join(frontend_path, component)
    if os.path.exists(path):
        with open(path, 'r') as f:
            content = f.read()
            lines = len(content.split('\n'))
            print(f"✅ {component} created ({lines} lines)")
    else:
        print(f"❌ {component} NOT found")

# Check dashboard-home.tsx modifications
if os.path.exists(os.path.join(frontend_path, 'dashboard-home.tsx')):
    with open(os.path.join(frontend_path, 'dashboard-home.tsx'), 'r') as f:
        content = f.read()
        if 'AgentRecommendationsPanel' in content and 'NewsSynthesisPanel' in content:
            print("✅ dashboard-home.tsx updated with agent panels")
        else:
            print("❌ dashboard-home.tsx NOT updated correctly")

# Check settings.tsx modifications
if os.path.exists(os.path.join(frontend_path, 'settings.tsx')):
    with open(os.path.join(frontend_path, 'settings.tsx'), 'r') as f:
        content = f.read()
        if 'agent_notifications' in content and 'Checkbox' in content:
            print("✅ settings.tsx updated with notifications toggle")
        else:
            print("❌ settings.tsx NOT updated correctly")

print()
print("=" * 70)
print("STATIC ANALYSIS COMPLETE")
print("=" * 70)

