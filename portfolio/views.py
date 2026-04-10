from collections import defaultdict
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Holding
from .serializers import HoldingSerializer


class PortfolioOverviewView(APIView):
    def get(self, request):
        holdings = Holding.objects.filter(user=request.user)
        return Response({
            'holdings': HoldingSerializer(holdings, many=True).data,
            'total_holdings': holdings.count(),
        })


class HoldingView(APIView):
    def post(self, request):
        ser = HoldingSerializer(data=request.data)
        if ser.is_valid():
            h = ser.save(user=request.user)
            return Response(HoldingSerializer(h).data, status=201)
        return Response(ser.errors, status=400)


class HoldingDetailView(APIView):
    def patch(self, request, pk):
        try:
            h = Holding.objects.get(pk=pk, user=request.user)
        except Holding.DoesNotExist:
            return Response(status=404)
        ser = HoldingSerializer(h, data=request.data, partial=True)
        if ser.is_valid():
            return Response(HoldingSerializer(ser.save()).data)
        return Response(ser.errors, status=400)

    def delete(self, request, pk):
        try:
            Holding.objects.get(pk=pk, user=request.user).delete()
            return Response(status=204)
        except Holding.DoesNotExist:
            return Response(status=404)


class NetWorthView(APIView):
    def get(self, request):
        holdings = Holding.objects.filter(user=request.user)
        portfolio_value = sum(h.current_value for h in holdings)

        try:
            savings = float(request.user.profile.current_savings)
        except Exception:
            savings = 0

        total_invested = sum(h.total_invested for h in holdings)
        return Response({
            'portfolio_value':  round(portfolio_value, 2),
            'savings':          round(savings, 2),
            'total_net_worth':  round(portfolio_value + savings, 2),
            'total_invested':   round(total_invested, 2),
            'total_gain_loss':  round(portfolio_value - total_invested, 2),
        })


class AllocationView(APIView):
    def get(self, request):
        holdings = Holding.objects.filter(user=request.user)
        total = sum(h.current_value for h in holdings)
        if total == 0:
            return Response({'allocation': []})

        by_type = defaultdict(float)
        for h in holdings:
            by_type[h.asset_type] += h.current_value

        allocation = [
            {'name': k, 'value': round((v / total) * 100, 1)}
            for k, v in by_type.items()
        ]
        return Response({'allocation': allocation, 'total_value': round(total, 2)})
