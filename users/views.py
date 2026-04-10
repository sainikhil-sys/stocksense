from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, UserProfileSerializer
from .models import UserProfile

User = get_user_model()


def get_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {'refresh': str(refresh), 'access': str(refresh.access_token)}


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ser = RegisterSerializer(data=request.data)
        if ser.is_valid():
            user = ser.save()
            tokens = get_tokens(user)
            return Response({**tokens, 'user': UserSerializer(user).data}, status=status.HTTP_201_CREATED)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ser = LoginSerializer(data=request.data)
        if ser.is_valid():
            user = ser.validated_data['user']
            tokens = get_tokens(user)
            return Response({**tokens, 'user': UserSerializer(user).data})
        return Response(ser.errors, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            pass
        return Response({'detail': 'Logged out.'})


class MeView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)


class ProfileSetupView(APIView):
    def post(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        data = request.data.copy()
        data['profile_completed'] = True
        ser = UserProfileSerializer(profile, data=data, partial=True)
        if ser.is_valid():
            ser.save()
            return Response(ser.data, status=status.HTTP_200_OK)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(APIView):
    def get(self, request):
        try:
            profile = request.user.profile
        except UserProfile.DoesNotExist:
            return Response({'detail': 'Profile not found'}, status=404)
        return Response(UserProfileSerializer(profile).data)

    def patch(self, request):
        profile = request.user.profile
        ser = UserProfileSerializer(profile, data=request.data, partial=True)
        if ser.is_valid():
            ser.save()
            return Response(ser.data)
        return Response(ser.errors, status=400)


class RiskScoreView(APIView):
    def get(self, request):
        try:
            profile = request.user.profile
        except UserProfile.DoesNotExist:
            return Response({'risk_level': 'moderate'})

        age = profile.age or 30
        savings_rate = profile.savings_rate

        if age < 30 and savings_rate >= 25:
            risk = 'aggressive'
        elif age >= 50 or savings_rate < 10:
            risk = 'conservative'
        else:
            risk = 'moderate'

        return Response({
            'risk_level': risk,
            'age': age,
            'savings_rate': savings_rate,
        })
