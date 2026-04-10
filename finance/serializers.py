from rest_framework import serializers
from .models import BudgetEntry, Transaction, FinancialGoal


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        exclude = ['user']
        read_only_fields = ['id', 'created_at']


class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = BudgetEntry
        exclude = ['user']
        read_only_fields = ['id', 'health_score', 'ai_suggestions']


class GoalSerializer(serializers.ModelSerializer):
    months_remaining = serializers.ReadOnlyField()
    progress_pct     = serializers.ReadOnlyField()

    class Meta:
        model = FinancialGoal
        exclude = ['user']
        read_only_fields = ['id', 'created_at']
