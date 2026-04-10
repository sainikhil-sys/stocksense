from django.urls import path
from . import views

urlpatterns = [
    path('chat/',                     views.ChatView.as_view(),                  name='ai-chat'),
    path('chat/history/',             views.ChatHistoryView.as_view(),           name='ai-chat-history'),
    path('recommendations/',          views.RecommendationsView.as_view(),       name='ai-recommendations'),
    path('recommendations/generate/', views.GenerateRecommendationsView.as_view(), name='ai-recommendations-generate'),
    path('simulate/',                 views.SimulateView.as_view(),              name='ai-simulate'),
]
