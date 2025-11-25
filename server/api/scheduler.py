"""
Background scheduler for checking price alerts
Runs automatically when Django starts
"""
import logging
from apscheduler.schedulers.background import BackgroundScheduler
from django_apscheduler.jobstores import DjangoJobStore
from django.conf import settings
from django.core.mail import send_mail
from api.models import PriceAlert, StockInsight
from api.services import YahooFinanceService, OpenAIService
from django.utils import timezone as django_timezone

logger = logging.getLogger(__name__)

def check_price_alerts():
    """
    Check all active price alerts and send email notifications
    This function runs every 5 minutes via APScheduler
    """
    logger.info("Starting price alert check...")

    # Get all active alerts
    active_alerts = PriceAlert.objects.filter(status='active')
    total_alerts = active_alerts.count()

    if total_alerts == 0:
        logger.info("No active alerts to check")
        return

    logger.info(f"Checking {total_alerts} active alerts")

    yahoo_service = YahooFinanceService()
    triggered_count = 0
    error_count = 0

    # Group alerts by symbol to minimize API calls
    alerts_by_symbol = {}
    for alert in active_alerts:
        if alert.symbol not in alerts_by_symbol:
            alerts_by_symbol[alert.symbol] = []
        alerts_by_symbol[alert.symbol].append(alert)

    # Check each symbol
    for symbol, alerts in alerts_by_symbol.items():
        try:
            # Get current price for this symbol
            stock_data = yahoo_service.get_stock_detail(symbol)

            if stock_data.get('status') != 'success':
                logger.warning(f"Failed to get price for {symbol}")
                error_count += len(alerts)
                continue

            current_price = stock_data['data']['current_price']
            logger.debug(f"{symbol} current price: ${current_price}")

            # Check each alert for this symbol
            for alert in alerts:
                try:
                    if alert.check_and_trigger(current_price):
                        send_alert_email(alert, current_price)
                        triggered_count += 1
                        logger.info(
                            f"Alert triggered: {alert.symbol} @ ${current_price} "
                            f"(target: ${alert.target_price} {alert.condition})"
                        )
                except Exception as e:
                    logger.error(f"Error processing alert {alert.id}: {e}")
                    error_count += 1

        except Exception as e:
            logger.error(f"Error fetching price for {symbol}: {e}")
            error_count += len(alerts)

    logger.info(
        f"Price alert check complete: {triggered_count} triggered, "
        f"{error_count} errors out of {total_alerts} alerts"
    )


def fetch_stock_insights():
    """
    Fetch AI-generated insights for popular stocks
    This function runs every 24 hours via APScheduler
    """
    logger.info("Starting AI stock insights generation...")

    # List of popular stocks to fetch insights for
    POPULAR_STOCKS = [
        ('AAPL', 'Apple Inc.'),
        ('MSFT', 'Microsoft Corporation'),
        ('GOOGL', 'Alphabet Inc.'),
        ('AMZN', 'Amazon.com Inc.'),
        ('NVDA', 'NVIDIA Corporation'),
        ('TSLA', 'Tesla Inc.'),
        ('META', 'Meta Platforms Inc.'),
        ('JPM', 'JPMorgan Chase & Co.'),
        ('V', 'Visa Inc.'),
        ('WMT', 'Walmart Inc.'),
    ]

    openai_service = OpenAIService()
    total_processed = 0
    total_insights = 0
    error_count = 0

    for symbol, stock_name in POPULAR_STOCKS:
        try:
            logger.info(f"Generating insights for {symbol} ({stock_name})...")

            # Generate insights using AI
            insights_data = openai_service.generate_ai_stock_insights(symbol, stock_name)

            if not insights_data:
                logger.warning(f"No insights generated for {symbol}")
                error_count += 1
                continue

            # Save insights to database
            saved_count = 0
            for insight_data in insights_data:
                try:
                    # Parse published date
                    published_date = None
                    if 'published_date' in insight_data:
                        try:
                            published_date = django_timezone.datetime.fromisoformat(insight_data['published_date'])
                        except:
                            published_date = django_timezone.now()

                    # Create or update insight
                    insight, created = StockInsight.objects.update_or_create(
                        symbol=symbol,
                        title=insight_data['title'],
                        published_date=published_date,
                        defaults={
                            'stock_name': stock_name,
                            'summary': insight_data.get('summary', ''),
                            'source': insight_data.get('source', 'AI Generated'),
                            'content_type': insight_data.get('content_type', 'news'),
                            'sentiment': insight_data.get('sentiment', 'neutral'),
                            'sentiment_score': insight_data.get('sentiment_score', 0.0),
                            'key_points': insight_data.get('key_points', []),
                            'ai_analysis': insight_data.get('ai_analysis', ''),
                            'is_active': True,
                        }
                    )

                    if created:
                        saved_count += 1
                        logger.debug(f"Created new insight: {insight.title[:50]}...")
                    else:
                        logger.debug(f"Updated existing insight: {insight.title[:50]}...")

                except Exception as e:
                    logger.error(f"Error saving insight for {symbol}: {e}")
                    error_count += 1

            total_processed += 1
            total_insights += saved_count
            logger.info(f"Saved {saved_count} new insights for {symbol}")

        except Exception as e:
            logger.error(f"Error processing insights for {symbol}: {e}")
            error_count += 1

    logger.info(
        f"Stock insights generation complete: {total_insights} insights saved "
        f"for {total_processed}/{len(POPULAR_STOCKS)} stocks, {error_count} errors"
    )


def send_alert_email(alert, current_price):
    """Send email notification when alert triggers"""
    try:
        # Format the condition in human-readable form
        condition_text = f"went above" if alert.condition == 'above' else "dropped below"

        subject = f'🔔 Price Alert: {alert.symbol} {condition_text} ${alert.target_price}'

        message = f'''
Your price alert has been triggered!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Stock: {alert.stock_name if alert.stock_name else alert.symbol}
Symbol: {alert.symbol}

Target Price: ${alert.target_price}
Current Price: ${current_price}
Condition: Price {condition_text} ${alert.target_price}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Alert Details:
• Created: {alert.created_at.strftime('%Y-%m-%d %H:%M:%S')}
• Triggered: {alert.triggered_at.strftime('%Y-%m-%d %H:%M:%S')}

{f"Notes: {alert.notes}" if alert.notes else ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is an automated notification from MacroDash.
This alert will not trigger again.

View stock details: http://localhost:3000/stocks/{alert.symbol}
        '''

        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [alert.email],
            fail_silently=False,
        )

        logger.info(f"Email sent to {alert.email} for alert {alert.id}")

    except Exception as e:
        logger.error(f"Failed to send email for alert {alert.id}: {e}")
        # Don't raise - we still want to mark the alert as triggered
        # User can see it triggered in the UI


# Global scheduler instance
scheduler = None

def start_scheduler():
    """
    Start the background scheduler
    Called automatically when Django app starts
    """
    global scheduler

    # Don't start scheduler if it's already running
    if scheduler is not None and scheduler.running:
        logger.warning("Scheduler already running, skipping start")
        return

    logger.info("Starting APScheduler for price alerts...")

    try:
        # Configure scheduler with SQLite-friendly settings
        scheduler = BackgroundScheduler(
            timezone=settings.TIME_ZONE,
            job_defaults={
                'coalesce': True,  # Combine multiple missed runs into one
                'max_instances': 1,  # Only one instance of each job at a time
            }
        )

        # Use DjangoJobStore with SQLite-friendly configuration
        jobstore = DjangoJobStore()
        scheduler.add_jobstore(jobstore, "default")

        # Add job to check price alerts every 5 minutes
        scheduler.add_job(
            check_price_alerts,
            'interval',
            minutes=5,
            id='check_price_alerts',
            name='Check all active price alerts',
            replace_existing=True,
        )

        # Add job to fetch AI stock insights every 6 hours
        scheduler.add_job(
            fetch_stock_insights,
            'interval',
            hours=6,
            id='fetch_stock_insights',
            name='Fetch AI-powered stock insights',
            replace_existing=True,
        )

        scheduler.start()
        logger.info("APScheduler started successfully! Price alerts every 5min, Stock insights every 6hrs.")

        # Disabled immediate insights generation to speed up startup
        # Insights will be generated on the first scheduled run (every 6 hours)
        # logger.info("Triggering immediate stock insights generation...")
        # try:
        #     fetch_stock_insights()
        # except Exception as e:
        #     logger.error(f"Error in initial insights generation: {e}")

    except Exception as e:
        logger.error(f"Failed to start scheduler: {e}")


def stop_scheduler():
    """Stop the scheduler (called when Django shuts down)"""
    global scheduler

    if scheduler is not None and scheduler.running:
        logger.info("Shutting down APScheduler...")
        scheduler.shutdown()
        logger.info("APScheduler shut down successfully")
