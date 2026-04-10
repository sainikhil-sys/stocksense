from rest_framework import serializers
from .models import Holding


class HoldingSerializer(serializers.ModelSerializer):
    total_invested  = serializers.ReadOnlyField()
    current_value   = serializers.ReadOnlyField()
    gain_loss       = serializers.ReadOnlyField()
    gain_loss_pct   = serializers.ReadOnlyField()

    class Meta:
        model = Holding
        exclude = ['user']
        read_only_fields = ['id', 'updated_at']
