from django.urls import path
from . import views

urlpatterns = [
    path('',                    views.PortfolioOverviewView.as_view(), name='portfolio-overview'),
    path('holdings/',           views.HoldingView.as_view(),           name='holdings'),
    path('holdings/<uuid:pk>/', views.HoldingDetailView.as_view(),     name='holding-detail'),
    path('net-worth/',          views.NetWorthView.as_view(),           name='net-worth'),
    path('allocation/',         views.AllocationView.as_view(),         name='allocation'),
]
