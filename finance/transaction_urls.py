from django.urls import path
from . import views

urlpatterns = [
    path('',      views.TransactionView.as_view(),       name='transactions'),
    path('<uuid:pk>/', views.TransactionDetailView.as_view(), name='transaction-detail'),
]
