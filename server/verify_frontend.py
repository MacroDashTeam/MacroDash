#!/usr/bin/env python3
"""Verify frontend implementation"""

import os
import re

print("=" * 70)
print("FRONTEND IMPLEMENTATION VERIFICATION")
print("=" * 70)
print()

frontend_path = '../client/src/components'

# Test 1: Component files exist
print("TEST 1: Component Files")
print("-" * 70)

files_to_check = {
    'agent-recommendations-panel.tsx': {
        'required_imports': ['useQuery', 'Card', 'Badge', 'Skeleton', 'useState'],
        'required_functions': ['export default function AgentRecommendationsPanel'],
        'required_features': ['useQuery.*agent-portfolio', 'getRecommendationColor', 'ChevronDown']
    },
    'news-synthesis-panel.tsx': {
        'required_imports': ['useQuery', 'Card', 'Badge', 'Skeleton', 'useState'],
        'required_functions': ['export default function NewsSynthesisPanel'],
        'required_features': ['useQuery.*news-synthesis', 'getImpactColor', 'ChevronDown']
    }
}

for filename, checks in files_to_check.items():
    filepath = os.path.join(frontend_path, filename)
    
    if os.path.exists(filepath):
        print(f"\n✅ {filename} exists")
        
        with open(filepath, 'r') as f:
            content = f.read()
            
            # Check imports
            for imp in checks['required_imports']:
                if imp in content:
                    print(f"  ✅ Import: {imp}")
                else:
                    print(f"  ❌ Import missing: {imp}")
            
            # Check functions
            for func in checks['required_functions']:
                if func in content:
                    print(f"  ✅ Function: {func}")
                else:
                    print(f"  ❌ Function missing: {func}")
            
            # Check features
            for feature in checks['required_features']:
                if re.search(feature, content):
                    print(f"  ✅ Feature: {feature}")
                else:
                    print(f"  ❌ Feature missing: {feature}")
    else:
        print(f"\n❌ {filename} NOT FOUND")

print()

# Test 2: Dashboard integration
print("TEST 2: Dashboard Integration")
print("-" * 70)

dashboard_path = os.path.join(frontend_path, 'dashboard-home.tsx')
if os.path.exists(dashboard_path):
    with open(dashboard_path, 'r') as f:
        content = f.read()
        
        if "import AgentRecommendationsPanel from './agent-recommendations-panel'" in content:
            print("✅ AgentRecommendationsPanel imported")
        else:
            print("❌ AgentRecommendationsPanel NOT imported")
        
        if "import NewsSynthesisPanel from './news-synthesis-panel'" in content:
            print("✅ NewsSynthesisPanel imported")
        else:
            print("❌ NewsSynthesisPanel NOT imported")
        
        if '<AgentRecommendationsPanel />' in content:
            print("✅ AgentRecommendationsPanel component used")
        else:
            print("❌ AgentRecommendationsPanel component NOT used")
        
        if '<NewsSynthesisPanel />' in content:
            print("✅ NewsSynthesisPanel component used")
        else:
            print("❌ NewsSynthesisPanel component NOT used")
else:
    print("❌ dashboard-home.tsx NOT found")

print()

# Test 3: Settings integration
print("TEST 3: Settings Integration")
print("-" * 70)

settings_path = os.path.join(frontend_path, 'settings.tsx')
if os.path.exists(settings_path):
    with open(settings_path, 'r') as f:
        content = f.read()
        
        if 'useQuery' in content and 'useMutation' in content:
            print("✅ React Query hooks imported")
        else:
            print("❌ React Query hooks NOT imported")
        
        if "'/api/preferences/'" in content:
            print("✅ /api/preferences/ endpoint referenced")
        else:
            print("❌ /api/preferences/ endpoint NOT referenced")
        
        if 'agent_notifications' in content:
            print("✅ agent_notifications preference field referenced")
        else:
            print("❌ agent_notifications preference field NOT referenced")
        
        if 'Checkbox' in content:
            print("✅ Checkbox component used for toggles")
        else:
            print("❌ Checkbox component NOT used")
        
        if 'AI Agent Reports' in content:
            print("✅ AI Agent Reports toggle label present")
        else:
            print("❌ AI Agent Reports toggle label NOT present")
else:
    print("❌ settings.tsx NOT found")

print()

# Test 4: API endpoint usage
print("TEST 4: API Endpoint Usage")
print("-" * 70)

# Check agent-recommendations-panel
if os.path.exists(os.path.join(frontend_path, 'agent-recommendations-panel.tsx')):
    with open(os.path.join(frontend_path, 'agent-recommendations-panel.tsx'), 'r') as f:
        content = f.read()
        if "'/api/agent/portfolio/'" in content:
            print("✅ agent-recommendations-panel uses /api/agent/portfolio/")
        else:
            print("❌ agent-recommendations-panel endpoint usage incorrect")

# Check news-synthesis-panel
if os.path.exists(os.path.join(frontend_path, 'news-synthesis-panel.tsx')):
    with open(os.path.join(frontend_path, 'news-synthesis-panel.tsx'), 'r') as f:
        content = f.read()
        if "'/api/agent/news-synthesis/'" in content:
            print("✅ news-synthesis-panel uses /api/agent/news-synthesis/")
        else:
            print("❌ news-synthesis-panel endpoint usage incorrect")

# Check settings preferences endpoint
if os.path.exists(os.path.join(frontend_path, 'settings.tsx')):
    with open(os.path.join(frontend_path, 'settings.tsx'), 'r') as f:
        content = f.read()
        if "'/api/preferences/'" in content:
            print("✅ settings.tsx uses /api/preferences/")
        else:
            print("❌ settings.tsx endpoint usage incorrect")

print()

# Test 5: UI components usage
print("TEST 5: UI Components Usage")
print("-" * 70)

components_to_check = [
    ('Card', 'card.tsx'),
    ('Badge', 'badge.tsx'),
    ('Skeleton', 'skeleton.tsx'),
    ('Checkbox', 'checkbox.tsx'),
]

for component_name, component_file in components_to_check:
    ui_path = os.path.join(frontend_path, 'ui', component_file)
    if os.path.exists(ui_path):
        print(f"✅ {component_name} UI component available ({component_file})")
    else:
        print(f"❌ {component_name} UI component NOT found ({component_file})")

print()

# Test 6: TypeScript types
print("TEST 6: TypeScript Definitions")
print("-" * 70)

for filename in ['agent-recommendations-panel.tsx', 'news-synthesis-panel.tsx']:
    filepath = os.path.join(frontend_path, filename)
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            content = f.read()
            
            if 'interface' in content and ':' in content:
                print(f"✅ {filename} has TypeScript interfaces")
            else:
                print(f"⚠️  {filename} TypeScript usage")

print()
print("=" * 70)
print("FRONTEND VERIFICATION COMPLETE")
print("=" * 70)

