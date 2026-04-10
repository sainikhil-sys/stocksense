import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=150, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email


class UserProfile(models.Model):
    RISK_CHOICES = [
        ('conservative', 'Conservative'),
        ('moderate',     'Moderate'),
        ('aggressive',   'Aggressive'),
    ]
    EXPERIENCE_CHOICES = [
        ('none',         'None'),
        ('beginner',     'Beginner'),
        ('intermediate', 'Intermediate'),
    ]

    id              = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user            = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    age             = models.PositiveIntegerField(null=True, blank=True)
    monthly_income  = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    monthly_expenses= models.DecimalField(max_digits=12, decimal_places=2, default=0)
    current_savings = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    risk_level      = models.CharField(max_length=20, choices=RISK_CHOICES, default='moderate')
    investment_experience = models.CharField(max_length=20, choices=EXPERIENCE_CHOICES, default='beginner')
    primary_goal    = models.CharField(max_length=255, blank=True)
    profile_completed = models.BooleanField(default=False)
    updated_at      = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile({self.user.email})"

    @property
    def monthly_savings(self):
        return float(self.monthly_income) - float(self.monthly_expenses)

    @property
    def savings_rate(self):
        if self.monthly_income == 0:
            return 0
        return round((self.monthly_savings / float(self.monthly_income)) * 100, 1)
