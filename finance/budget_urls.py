from django.urls import path
from . import views

urlpatterns = [
    path('current/', views.CurrentBudgetView.as_view(),   name='budget-current'),
    path('',         views.BudgetView.as_view(),           name='budget'),
    path('history/', views.BudgetView.as_view(),           name='budget-history'),
    path('suggestions/', views.BudgetSuggestionsView.as_view(), name='budget-suggestions'),
]
