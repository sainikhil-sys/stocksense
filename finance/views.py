from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import BudgetEntry, Transaction, FinancialGoal
from .serializers import BudgetSerializer, TransactionSerializer, GoalSerializer
from ai_assistant.gemini import get_budget_suggestions


class CurrentBudgetView(APIView):
    def get(self, request):
        today = timezone.now().date().replace(day=1)
        budget, _ = BudgetEntry.objects.get_or_create(user=request.user, month=today)
        # Auto-populate from profile income/expenses
        if budget.actual_income == 0:
            try:
                profile = request.user.profile
                budget.actual_income = profile.monthly_income
                budget.save()
            except Exception:
                pass
        return Response(BudgetSerializer(budget).data)


class BudgetView(APIView):
    def post(self, request):
        today = timezone.now().date().replace(day=1)
        budget, _ = BudgetEntry.objects.get_or_create(user=request.user, month=today)
        ser = BudgetSerializer(budget, data=request.data, partial=True)
        if ser.is_valid():
            entry = ser.save()
            entry.health_score = entry.calculate_health_score()
            entry.save()
            return Response(BudgetSerializer(entry).data)
        return Response(ser.errors, status=400)

    def get(self, request):
        budgets = BudgetEntry.objects.filter(user=request.user).order_by('-month')[:12]
        return Response(BudgetSerializer(budgets, many=True).data)


class BudgetSuggestionsView(APIView):
    def get(self, request):
        try:
            profile = request.user.profile
            today = timezone.now().date().replace(day=1)
            budget, _ = BudgetEntry.objects.get_or_create(user=request.user, month=today)
            suggestions = get_budget_suggestions(profile, budget)
            return Response({'suggestions': suggestions, 'health_score': budget.health_score})
        except Exception as e:
            return Response({'suggestions': [], 'error': str(e)}, status=500)


class TransactionView(APIView):
    def get(self, request):
        qs = Transaction.objects.filter(user=request.user)
        month = request.query_params.get('month')
        if month:
            qs = qs.filter(date__startswith=month)
        return Response(TransactionSerializer(qs[:50], many=True).data)

    def post(self, request):
        ser = TransactionSerializer(data=request.data)
        if ser.is_valid():
            tx = ser.save(user=request.user)
            # Update budget totals
            today = timezone.now().date().replace(day=1)
            budget, _ = BudgetEntry.objects.get_or_create(user=request.user, month=today)
            if tx.type == 'expense':
                budget.actual_expenses += tx.amount
                if tx.category_type == 'need':
                    budget.actual_needs += tx.amount
                else:
                    budget.actual_wants += tx.amount
            elif tx.type == 'income':
                budget.actual_income += tx.amount
            budget.health_score = budget.calculate_health_score()
            budget.save()
            return Response(TransactionSerializer(tx).data, status=201)
        return Response(ser.errors, status=400)


class TransactionDetailView(APIView):
    def delete(self, request, pk):
        try:
            tx = Transaction.objects.get(pk=pk, user=request.user)
            tx.delete()
            return Response(status=204)
        except Transaction.DoesNotExist:
            return Response(status=404)


# ─── Goals ───────────────────────────────────────────────────────────────────

class GoalListCreateView(APIView):
    def get(self, request):
        goals = FinancialGoal.objects.filter(user=request.user)
        return Response(GoalSerializer(goals, many=True).data)

    def post(self, request):
        ser = GoalSerializer(data=request.data)
        if ser.is_valid():
            goal = ser.save(user=request.user)
            return Response(GoalSerializer(goal).data, status=201)
        return Response(ser.errors, status=400)


class GoalDetailView(APIView):
    def get_object(self, pk, user):
        try:
            return FinancialGoal.objects.get(pk=pk, user=user)
        except FinancialGoal.DoesNotExist:
            return None

    def patch(self, request, pk):
        goal = self.get_object(pk, request.user)
        if not goal:
            return Response(status=404)
        ser = GoalSerializer(goal, data=request.data, partial=True)
        if ser.is_valid():
            # Auto-complete if fully saved
            updated = ser.save()
            if float(updated.current_saved) >= float(updated.target_amount):
                updated.status = 'completed'
                updated.save()
            return Response(GoalSerializer(updated).data)
        return Response(ser.errors, status=400)

    def delete(self, request, pk):
        goal = self.get_object(pk, request.user)
        if not goal:
            return Response(status=404)
        goal.delete()
        return Response(status=204)


class GoalContributeView(APIView):
    def post(self, request, pk):
        try:
            goal = FinancialGoal.objects.get(pk=pk, user=request.user)
        except FinancialGoal.DoesNotExist:
            return Response(status=404)
        amount = float(request.data.get('amount', 0))
        if amount <= 0:
            return Response({'error': 'Amount must be positive'}, status=400)
        goal.current_saved += amount
        if float(goal.current_saved) >= float(goal.target_amount):
            goal.status = 'completed'
        goal.save()
        return Response(GoalSerializer(goal).data)


class GoalPlanView(APIView):
    def get(self, request, pk):
        try:
            goal = FinancialGoal.objects.get(pk=pk, user=request.user)
        except FinancialGoal.DoesNotExist:
            return Response(status=404)
        remaining = float(goal.target_amount) - float(goal.current_saved)
        monthly = float(goal.monthly_contribution) if goal.monthly_contribution else 0
        return Response({
            'goal': GoalSerializer(goal).data,
            'remaining': remaining,
            'months_to_goal': goal.months_remaining,
            'suggested_monthly': round(remaining / 12, 2) if remaining > 0 else 0,
            'tip': f'Save ₹{round(remaining/6):,} per month to reach this in 6 months.',
        })
