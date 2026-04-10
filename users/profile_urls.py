from django.urls import path
from . import views

urlpatterns = [
    path('',         views.ProfileView.as_view(),     name='profile'),
    path('setup/',   views.ProfileSetupView.as_view(),name='profile-setup'),
    path('update/',  views.ProfileView.as_view(),     name='profile-update'),
    path('risk-score/', views.RiskScoreView.as_view(), name='risk-score'),
]
