from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone
from django.contrib.auth.models import User


class PriceAlert(models.Model):
    """Model for stock price alerts"""

    CONDITION_CHOICES = [
        ('above', 'Price Above'),
        ('below', 'Price Below'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('triggered', 'Triggered'),
        ('cancelled', 'Cancelled'),
    ]

    # Alert details
    symbol = models.CharField(max_length=10, db_index=True)
    stock_name = models.CharField(max_length=255, blank=True)
    target_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0.01)]
    )
    condition = models.CharField(max_length=10, choices=CONDITION_CHOICES, default='above')

    # User contact
    email = models.EmailField()

    # Status tracking
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    triggered_at = models.DateTimeField(null=True, blank=True)
    current_price_at_trigger = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )

    # Optional notes
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['symbol', 'status']),
            models.Index(fields=['email', 'status']),
        ]

    def __str__(self):
        return f"{self.symbol} {self.get_condition_display()} ${self.target_price} ({self.status})"

    def check_and_trigger(self, current_price):
        """
        Check if alert should be triggered based on current price
        Returns True if triggered, False otherwise
        """
        if self.status != 'active':
            return False

        should_trigger = False

        if self.condition == 'above' and current_price >= float(self.target_price):
            should_trigger = True
        elif self.condition == 'below' and current_price <= float(self.target_price):
            should_trigger = True

        if should_trigger:
            self.status = 'triggered'
            self.triggered_at = timezone.now()
            self.current_price_at_trigger = current_price
            self.save()
            return True

        return False


class StockInsight(models.Model):
    """Model for AI-generated stock insights from blogs, events, and news"""

    SENTIMENT_CHOICES = [
        ('positive', 'Positive'),
        ('negative', 'Negative'),
        ('neutral', 'Neutral'),
    ]

    TYPE_CHOICES = [
        ('blog', 'Blog Post'),
        ('event', 'Event'),
        ('news', 'News Article'),
        ('research', 'Research Report'),
        ('announcement', 'Company Announcement'),
    ]

    # Stock identification
    symbol = models.CharField(max_length=10, db_index=True)
    stock_name = models.CharField(max_length=255)

    # Content details
    title = models.CharField(max_length=500)
    summary = models.TextField()
    source = models.CharField(max_length=255, blank=True)
    url = models.URLField(blank=True, null=True)
    content_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='news')

    # AI Analysis
    sentiment = models.CharField(max_length=10, choices=SENTIMENT_CHOICES, default='neutral')
    sentiment_score = models.FloatField(default=0.0)  # -1.0 to 1.0
    key_points = models.JSONField(default=list)  # List of key takeaways
    ai_analysis = models.TextField(blank=True)  # Detailed AI analysis

    # Metadata
    published_date = models.DateTimeField(null=True, blank=True)
    fetched_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)  # For soft delete

    class Meta:
        ordering = ['-published_date', '-fetched_at']
        indexes = [
            models.Index(fields=['symbol', 'is_active']),
            models.Index(fields=['symbol', 'sentiment', 'is_active']),
            models.Index(fields=['fetched_at']),
        ]
        unique_together = ['symbol', 'title', 'published_date']

    def __str__(self):
        return f"{self.symbol} - {self.title[:50]} ({self.sentiment})"


class Watchlist(models.Model):
    """User's custom watchlist"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='watchlists')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_default = models.BooleanField(default=False)  # One default watchlist per user

    class Meta:
        ordering = ['-is_default', '-updated_at']
        unique_together = ['user', 'name']

    def __str__(self):
        return f"{self.user.username} - {self.name}"


class WatchlistItem(models.Model):
    """Individual stocks in a watchlist"""
    watchlist = models.ForeignKey(Watchlist, on_delete=models.CASCADE, related_name='items')
    symbol = models.CharField(max_length=10)
    stock_name = models.CharField(max_length=255, blank=True)
    added_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['added_at']
        unique_together = ['watchlist', 'symbol']

    def __str__(self):
        return f"{self.watchlist.name} - {self.symbol}"


class UserPreferences(models.Model):
    """User-specific preferences and settings"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')

    # User role
    is_admin = models.BooleanField(default=False, help_text="Admin users have access to user management and system settings")

    # Display preferences
    theme = models.CharField(max_length=20, default='dark', choices=[('dark', 'Dark'), ('light', 'Light')])
    default_time_period = models.CharField(max_length=10, default='1M',
                                          choices=[('1D', '1 Day'), ('1W', '1 Week'), ('1M', '1 Month'),
                                                  ('3M', '3 Months'), ('1Y', '1 Year'), ('5Y', '5 Years')])

    # Notification preferences
    email_alerts = models.BooleanField(default=True)
    price_alert_notifications = models.BooleanField(default=True)
    news_notifications = models.BooleanField(default=False)
    agent_notifications = models.BooleanField(default=False)  # Opt-in to receive agent email reports every 6 hours

    # Dashboard customization
    dashboard_layout = models.JSONField(default=dict, blank=True)  # Store custom dashboard layout
    favorite_indicators = models.JSONField(default=list, blank=True)  # List of favorite technical indicators

    # API preferences
    preferred_news_source = models.CharField(max_length=50, default='alpha_vantage',
                                            choices=[('alpha_vantage', 'Alpha Vantage'),
                                                    ('yahoo', 'Yahoo Finance')])

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'User preferences'

    def __str__(self):
        return f"{self.user.username} preferences"


class SavedChartDisplay(models.Model):
    """Saved multi-series charts from Data Explorer"""

    # User identification
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE, null=True, blank=True)
    user_session = models.CharField(max_length=255, db_index=True, null=True, blank=True,
                                     help_text="Session ID for anonymous users (deprecated - use user field)")

    # Chart details
    chart_name = models.CharField(max_length=255)
    series_ids = models.JSONField(help_text="List of FRED series IDs or custom series labels")
    series_metadata = models.JSONField(default=dict, help_text="Metadata about each series (name, frequency, etc.)")

    # Data source type
    source_type = models.CharField(max_length=20, default='fred',
                                   choices=[('fred', 'FRED Economic Data'),
                                           ('custom_analysis', 'Custom Analysis'),
                                           ('crypto', 'Cryptocurrency')],
                                   help_text="Source of the chart data")

    # Custom analysis fields
    formulas = models.JSONField(null=True, blank=True,
                               help_text="List of formulas for custom analysis (e.g., ['AAPL = price(AAPL)', 'SMA = sma(AAPL, 20)'])")
    symbols = models.JSONField(null=True, blank=True,
                              help_text="List of stock symbols needed for custom analysis (e.g., ['AAPL', 'MSFT'])")

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_viewed = models.DateTimeField(null=True, blank=True)

    # Display preferences
    chart_type = models.CharField(max_length=20, default='line', choices=[('line', 'Line'), ('area', 'Area')])
    show_legend = models.BooleanField(default=True)

    class Meta:
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['user_session', 'created_at']),  # Keep for backward compatibility
        ]

    def __str__(self):
        return f"{self.chart_name} ({len(self.series_ids)} series)"


class PortfolioRecommendation(models.Model):
    """Autonomous agent-generated portfolio recommendations (BUY/SELL/HOLD)"""

    RECOMMENDATION_CHOICES = [
        ('BUY', 'BUY'),
        ('SELL', 'SELL'),
        ('HOLD', 'HOLD'),
    ]

    # Stock identification
    symbol = models.CharField(max_length=10, db_index=True)
    stock_name = models.CharField(max_length=255, blank=True)

    # Recommendation
    recommendation = models.CharField(max_length=4, choices=RECOMMENDATION_CHOICES)
    confidence_score = models.FloatField(default=0.0)  # 0.0–1.0

    # Analysis details
    reasoning = models.JSONField(default=list)  # List of reasoning strings
    signals = models.JSONField(default=dict)  # {bullish: [], bearish: []}
    raw_analysis = models.TextField(blank=True)  # Full LLM output

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['symbol', 'updated_at']),
        ]
        get_latest_by = 'updated_at'

    def __str__(self):
        return f"{self.symbol} {self.recommendation} ({self.confidence_score:.0%})"


class NewsSynthesis(models.Model):
    """Autonomous agent-synthesized news impact and sentiment analysis"""

    # Stock identification
    symbol = models.CharField(max_length=10, db_index=True)
    stock_name = models.CharField(max_length=255, blank=True)

    # Synthesis metrics
    impact_score = models.FloatField(default=0.0)  # -1.0 to 1.0
    summary = models.TextField(blank=True)
    key_developments = models.JSONField(default=list)  # List of dicts {headline, impact, sentiment}
    entities_mentioned = models.JSONField(default=list)  # [company names, people, etc.]
    articles_analyzed = models.IntegerField(default=0)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['symbol', 'updated_at']),
        ]
        get_latest_by = 'updated_at'

    def __str__(self):
        return f"{self.symbol} news synthesis (impact: {self.impact_score:.2f})"
