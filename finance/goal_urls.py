from django.urls import path
from . import views

urlpatterns = [
    path('',                       views.GoalListCreateView.as_view(), name='goals'),
    path('<uuid:pk>/',             views.GoalDetailView.as_view(),     name='goal-detail'),
    path('<uuid:pk>/contribute/',  views.GoalContributeView.as_view(), name='goal-contribute'),
    path('<uuid:pk>/plan/',        views.GoalPlanView.as_view(),       name='goal-plan'),
]
