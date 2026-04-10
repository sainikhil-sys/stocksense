import uuid
from django.db import models
from django.conf import settings


class Holding(models.Model):
    ASSET_TYPES = [
        ('stock', 'Stock'), ('mutual_fund', 'Mutual Fund'),
        ('fixed_deposit', 'Fixed Deposit'), ('gold', 'Gold'),
        ('crypto', 'Crypto'), ('other', 'Other'),
    ]

    id             = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user           = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='holdings')
    symbol         = models.CharField(max_length=20, blank=True)
    name           = models.CharField(max_length=255)
    quantity       = models.DecimalField(max_digits=12, decimal_places=4)
    avg_buy_price  = models.DecimalField(max_digits=12, decimal_places=2)
    current_price  = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    asset_type     = models.CharField(max_length=20, choices=ASSET_TYPES, default='stock')
    purchase_date  = models.DateField(null=True, blank=True)
    updated_at     = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-purchase_date']

    @property
    def total_invested(self):
        return float(self.avg_buy_price) * float(self.quantity)

    @property
    def current_value(self):
        price = float(self.current_price or self.avg_buy_price)
        return price * float(self.quantity)

    @property
    def gain_loss(self):
        return self.current_value - self.total_invested

    @property
    def gain_loss_pct(self):
        if self.total_invested == 0:
            return 0
        return round((self.gain_loss / self.total_invested) * 100, 2)
