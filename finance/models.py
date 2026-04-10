import uuid
from django.db import models
from django.conf import settings


class BudgetEntry(models.Model):
    id              = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user            = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='budgets')
    month           = models.DateField()  # YYYY-MM-01
    actual_income   = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    actual_needs    = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    actual_wants    = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    actual_expenses = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    health_score    = models.IntegerField(default=0)
    ai_suggestions  = models.JSONField(default=dict, blank=True)

    class Meta:
        unique_together = ['user', 'month']
        ordering = ['-month']

    def calculate_health_score(self):
        income = float(self.actual_income)
        if income == 0:
            return 0
        savings = income - float(self.actual_expenses)
        savings_rate = (savings / income) * 100
        needs_ratio  = (float(self.actual_needs)  / income) * 100
        wants_ratio  = (float(self.actual_wants)  / income) * 100
        score = 100
        if savings_rate < 10: score -= 30
        elif savings_rate < 20: score -= 10
        if needs_ratio > 60: score -= 15
        if wants_ratio > 40: score -= 15
        return max(0, min(100, score))


class Transaction(models.Model):
    TYPE_CHOICES = [('income', 'Income'), ('expense', 'Expense')]
    CATEGORY_CHOICES = [('need', 'Need'), ('want', 'Want')]

    id            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user          = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='transactions')
    description   = models.CharField(max_length=255)
    amount        = models.DecimalField(max_digits=12, decimal_places=2)
    type          = models.CharField(max_length=10, choices=TYPE_CHOICES, default='expense')
    category_type = models.CharField(max_length=10, choices=CATEGORY_CHOICES, default='want')
    date          = models.DateField()
    created_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-created_at']


class FinancialGoal(models.Model):
    STATUS_CHOICES   = [('active', 'Active'), ('completed', 'Completed'), ('paused', 'Paused')]
    PRIORITY_CHOICES = [('low', 'Low'), ('medium', 'Medium'), ('high', 'High')]

    id                   = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user                 = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='goals')
    title                = models.CharField(max_length=255)
    target_amount        = models.DecimalField(max_digits=14, decimal_places=2)
    current_saved        = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    monthly_contribution = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    deadline             = models.DateField(null=True, blank=True)
    priority             = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    status               = models.CharField(max_length=15, choices=STATUS_CHOICES, default='active')
    icon                 = models.CharField(max_length=10, default='🎯')
    created_at           = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    @property
    def months_remaining(self):
        remaining = float(self.target_amount) - float(self.current_saved)
        if remaining <= 0:
            return 0
        if not self.monthly_contribution or self.monthly_contribution <= 0:
            return None
        return round(remaining / float(self.monthly_contribution))

    @property
    def progress_pct(self):
        if self.target_amount == 0:
            return 100
        return min(round((float(self.current_saved) / float(self.target_amount)) * 100, 1), 100)
