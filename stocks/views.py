from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .yahoo_finance import search_stocks, get_stock_detail, get_stock_history
from .models import Watchlist
from .serializers import WatchlistSerializer
from ai_assistant.gemini import get_stock_analysis


class StockSearchView(APIView):
    def get(self, request):
        q = request.query_params.get('q', '').strip()
        if not q:
            return Response([], status=200)
        results = search_stocks(q)
        return Response(results)


class StockDetailView(APIView):
    def get(self, request, symbol):
        data = get_stock_detail(symbol)
        if not data:
            return Response({'error': f'Stock {symbol} not found'}, status=404)
        return Response(data)


class StockHistoryView(APIView):
    def get(self, request, symbol):
        period = request.query_params.get('period', '1M')
        data = get_stock_history(symbol, period)
        return Response({'symbol': symbol, 'period': period, 'data': data})


class StockAnalysisView(APIView):
    def get(self, request, symbol):
        stock_data = get_stock_detail(symbol)
        if not stock_data:
            return Response({'error': 'Stock not found'}, status=404)
        try:
            profile = request.user.profile
        except Exception:
            profile = None
        analysis = get_stock_analysis(stock_data, profile)
        return Response(analysis)


class WatchlistView(APIView):
    def get(self, request):
        items = Watchlist.objects.filter(user=request.user)
        return Response(WatchlistSerializer(items, many=True).data)

    def post(self, request):
        symbol = request.data.get('symbol', '').upper().strip()
        if not symbol:
            return Response({'error': 'Symbol required'}, status=400)
        item, _ = Watchlist.objects.get_or_create(user=request.user, symbol=symbol)
        return Response(WatchlistSerializer(item).data, status=201)


class WatchlistDetailView(APIView):
    def delete(self, request, symbol):
        try:
            Watchlist.objects.get(user=request.user, symbol=symbol.upper()).delete()
            return Response(status=204)
        except Watchlist.DoesNotExist:
            return Response(status=404)
