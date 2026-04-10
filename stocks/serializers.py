from rest_framework import serializers
from .models import Watchlist


class WatchlistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Watchlist
        exclude = ['user']
        read_only_fields = ['id', 'added_at']
