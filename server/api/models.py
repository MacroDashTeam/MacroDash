from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone


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
