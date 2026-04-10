import uuid
from django.db import models
from django.conf import settings


class ChatMessage(models.Model):
    ROLE_CHOICES = [('user', 'User'), ('assistant', 'Assistant')]

    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chat_messages')
    session_id = models.UUIDField()
    role       = models.CharField(max_length=10, choices=ROLE_CHOICES)
    message    = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']


class InvestmentRecommendation(models.Model):
    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user         = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='recommendations')
    generated_at = models.DateTimeField(auto_now_add=True)
    risk_level   = models.CharField(max_length=20)
    allocation   = models.JSONField(default=list)
    categories   = models.JSONField(default=list)
    reasoning    = models.TextField()
    is_active    = models.BooleanField(default=True)

    class Meta:
        ordering = ['-generated_at']
