from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import ChatMessage, InvestmentRecommendation
from .gemini import chat_with_ai, get_investment_recommendations, simulate_investment
import uuid


class ChatView(APIView):
    def post(self, request):
        message    = request.data.get('message', '').strip()
        session_id = request.data.get('session_id') or str(uuid.uuid4())
        if not message:
            return Response({'error': 'Message required'}, status=400)

        try:
            profile = request.user.profile
        except Exception:
            profile = None

        # Get recent history for context
        recent = ChatMessage.objects.filter(user=request.user, session_id=session_id).order_by('-created_at')[:10]
        history = [{'role': m.role, 'content': m.message} for m in reversed(recent)]

        # Save user message
        ChatMessage.objects.create(user=request.user, session_id=session_id, role='user', message=message)

        # Get AI reply
        reply = chat_with_ai(message, profile, history)

        # Save AI reply
        ChatMessage.objects.create(user=request.user, session_id=session_id, role='assistant', message=reply)

        return Response({'reply': reply, 'session_id': str(session_id)})


class ChatHistoryView(APIView):
    def get(self, request):
        session_id = request.query_params.get('session_id')
        qs = ChatMessage.objects.filter(user=request.user)
        if session_id:
            qs = qs.filter(session_id=session_id)
        messages = [{'role': m.role, 'content': m.message, 'created_at': m.created_at} for m in qs[:50]]
        return Response(messages)


class RecommendationsView(APIView):
    def get(self, request):
        rec = InvestmentRecommendation.objects.filter(user=request.user, is_active=True).first()
        if not rec:
            return Response({})
        return Response({
            'risk_level': rec.risk_level,
            'allocation': rec.allocation,
            'categories': rec.categories,
            'reasoning':  rec.reasoning,
            'generated_at': rec.generated_at,
        })


class GenerateRecommendationsView(APIView):
    def post(self, request):
        try:
            profile = request.user.profile
        except Exception:
            return Response({'error': 'Please complete your profile first'}, status=400)

        # Deactivate old ones
        InvestmentRecommendation.objects.filter(user=request.user).update(is_active=False)

        data = get_investment_recommendations(profile)
        rec = InvestmentRecommendation.objects.create(
            user=request.user,
            risk_level=data.get('risk_level', 'moderate'),
            allocation=data.get('allocation', []),
            categories=data.get('categories', []),
            reasoning=data.get('reasoning', ''),
            is_active=True,
        )
        return Response({
            'risk_level': rec.risk_level,
            'allocation': rec.allocation,
            'categories': rec.categories,
            'reasoning':  rec.reasoning,
        }, status=201)


class SimulateView(APIView):
    def post(self, request):
        monthly = float(request.data.get('monthly', 10000))
        years   = int(request.data.get('years', 10))
        rate    = float(request.data.get('rate', 12))

        if monthly <= 0 or years <= 0 or rate <= 0:
            return Response({'error': 'All values must be positive'}, status=400)

        result = simulate_investment(monthly, years, rate)
        return Response(result)
