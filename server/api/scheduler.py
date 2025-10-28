"""
Background scheduler for checking price alerts
Runs automatically when Django starts
"""
import logging
from apscheduler.schedulers.background import BackgroundScheduler
from django_apscheduler.jobstores import DjangoJobStore
from django.conf import settings
from django.core.mail import send_mail
from api.models import PriceAlert
from api.services import YahooFinanceService

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
        scheduler = BackgroundScheduler(timezone=settings.TIME_ZONE)
        scheduler.add_jobstore(DjangoJobStore(), "default")

        # Add job to check price alerts every 5 minutes
        scheduler.add_job(
            check_price_alerts,
            'interval',
            minutes=5,
            id='check_price_alerts',
            name='Check all active price alerts',
            replace_existing=True,
        )

        scheduler.start()
        logger.info("APScheduler started successfully! Checking alerts every 5 minutes.")

    except Exception as e:
        logger.error(f"Failed to start scheduler: {e}")


def stop_scheduler():
    """Stop the scheduler (called when Django shuts down)"""
    global scheduler

    if scheduler is not None and scheduler.running:
        logger.info("Shutting down APScheduler...")
        scheduler.shutdown()
        logger.info("APScheduler shut down successfully")
