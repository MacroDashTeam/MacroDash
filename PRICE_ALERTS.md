# Price Alert System Documentation

## Overview
The MacroDash price alert system allows users to set email notifications when a stock reaches a target price. The system includes:
- Database model for storing alerts
- REST API endpoints for managing alerts
- Heartbeat mechanism for checking prices
- Email notification service

## ✅ Completed Components

### 1. Database Model (`api/models.py`)
**PriceAlert Model** with the following fields:
- `symbol`: Stock symbol (e.g., "AAPL")
- `stock_name`: Company name
- `target_price`: Price threshold
- `condition`: "above" or "below"
- `email`: User's email address
- `status`: "active", "triggered", or "cancelled"
- `created_at`, `triggered_at`: Timestamps
- `notes`: Optional user notes

**Key Method:**
- `check_and_trigger(current_price)`: Checks if alert should trigger and updates status

### 2. API Endpoints (`api/views.py` & `api/urls.py`)

#### Create Alert
```
POST /api/alerts/
{
  "symbol": "AAPL",
  "stock_name": "Apple Inc.",
  "target_price": 180.00,
  "condition": "above",  // or "below"
  "email": "user@example.com",
  "notes": "Optional notes"
}
```

#### List User's Alerts
```
GET /api/alerts/?email=user@example.com
```

#### Get Specific Alert
```
GET /api/alerts/1/
```

#### Cancel Alert
```
DELETE /api/alerts/1/
```

## 📋 Pending Implementation

### 3. Heartbeat Management Command

**Location**: `api/management/commands/check_price_alerts.py`

**Purpose**: Periodically check all active alerts and trigger notifications

**Implementation**:
```python
from django.core.management.base import BaseCommand
from api.models import PriceAlert
from api.services import YahooFinanceService
from django.core.mail import send_mail
from django.conf import settings

class Command(BaseCommand):
    help = 'Check all active price alerts and send notifications'

    def handle(self, *args, **options):
        # Get all active alerts
        active_alerts = PriceAlert.objects.filter(status='active')
        yahoo_service = YahooFinanceService()

        for alert in active_alerts:
            # Get current price
            stock_data = yahoo_service.get_stock_detail(alert.symbol)
            if stock_data.get('status') == 'success':
                current_price = stock_data['data']['current_price']

                # Check if alert should trigger
                if alert.check_and_trigger(current_price):
                    # Send email notification
                    self.send_alert_email(alert, current_price)
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'Alert triggered: {alert.symbol} @ ${current_price}'
                        )
                    )

    def send_alert_email(self, alert, current_price):
        subject = f'Price Alert: {alert.symbol} hit ${current_price}'
        message = f'''
Your price alert has been triggered!

Stock: {alert.stock_name} ({alert.symbol})
Target Price: ${alert.target_price}
Current Price: ${current_price}
Condition: Price {alert.get_condition_display()}

Set on: {alert.created_at.strftime('%Y-%m-%d %H:%M:%S')}
Triggered on: {alert.triggered_at.strftime('%Y-%m-%d %H:%M:%S')}

Notes: {alert.notes if alert.notes else 'None'}

---
MacroDash Price Alert System
        '''

        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [alert.email],
            fail_silently=False,
        )
```

**Run manually**:
```bash
python manage.py check_price_alerts
```

**Run via cron** (every 5 minutes):
```bash
*/5 * * * * cd /path/to/server && ./macrodash_env/bin/python manage.py check_price_alerts
```

### 4. Email Configuration

**Add to `.env`**:
```env
# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=MacroDash <your-email@gmail.com>
```

**Add to `settings.py`**:
```python
import os

# Email Configuration
EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = os.getenv('EMAIL_HOST', 'localhost')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 25))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'False') == 'True'
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'webmaster@localhost')
```

### 5. Frontend UI Component

**Create**: `client/src/components/price-alert-dialog.tsx`

**Features**:
- Dialog to create new alert
- Form with stock symbol, target price, condition (above/below), email
- Validation
- Success/error messages

**Integration in `stock-detail.tsx`**:
- Add "Set Alert" button near stock price
- Show user's active alerts for this stock
- Allow canceling alerts

## Real-Time Data & Heartbeat Mechanism

### Data Freshness
- **Yahoo Finance**: ~15-minute delayed data (free)
- **For Real-Time**: Use Alpha Vantage Premium or IEX Cloud (paid)
- **Current Implementation**: Sufficient for most use cases

### Heartbeat Mechanism
The system uses a **cron-based heartbeat**:

1. **Cron Job** runs every 1-5 minutes
2. **Management Command** queries all active alerts
3. **Price Check**: Fetches current price for each symbol
4. **Trigger Logic**: Compares current price vs target price
5. **Email Notification**: Sends if condition met
6. **Status Update**: Marks alert as "triggered"
7. **Duplicate Prevention**: Only triggers once per alert

### Advantages
- ✅ Simple and reliable
- ✅ No background processes needed
- ✅ Easy to monitor and debug
- ✅ Scales well for moderate alert volumes

### Alternative: Celery (for high-volume)
For thousands of users, consider Celery:
```python
# tasks.py
from celery import shared_task

@shared_task
def check_price_alerts():
    # Same logic as management command
    pass
```

## Testing

### Test Alert Creation
```bash
curl -X POST http://localhost:8000/api/alerts/ \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "stock_name": "Apple Inc.",
    "target_price": 180.00,
    "condition": "above",
    "email": "test@example.com"
  }'
```

### Test Alert Listing
```bash
curl "http://localhost:8000/api/alerts/?email=test@example.com"
```

### Test Heartbeat
```bash
python manage.py check_price_alerts
```

## Production Deployment

### 1. Set up cron job
```bash
crontab -e

# Add this line (check every 5 minutes)
*/5 * * * * cd /path/to/server && /path/to/venv/bin/python manage.py check_price_alerts >> /var/log/price_alerts.log 2>&1
```

### 2. Configure email service
- Gmail: Use app passwords
- SendGrid: Use API key
- AWS SES: Configure credentials

### 3. Monitor logs
```bash
tail -f /var/log/price_alerts.log
```

### 4. Database indexes
Already included in the model:
- `symbol` + `status` for fast querying
- `email` + `status` for user lookups

## Security Considerations

1. **Email Validation**: Validate email addresses before creating alerts
2. **Rate Limiting**: Limit alerts per user (e.g., max 10 active alerts)
3. **API Authentication**: Add user authentication (currently uses email only)
4. **Email Verification**: Verify email before activating alerts
5. **CSRF Protection**: Already enabled via `@csrf_exempt` (for testing)

## Future Enhancements

- [ ] SMS notifications (via Twilio)
- [ ] Push notifications
- [ ] Percentage-based alerts (e.g., "notify when price changes 5%")
- [ ] Multi-condition alerts (e.g., price AND volume)
- [ ] Alert history and analytics
- [ ] User dashboard for managing all alerts
- [ ] Alert templates and presets
