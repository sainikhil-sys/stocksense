from django.urls import path
from . import views

urlpatterns = [
    path('search/',                    views.StockSearchView.as_view(),   name='stock-search'),
    path('watchlist/',                 views.WatchlistView.as_view(),     name='watchlist'),
    path('watchlist/<str:symbol>/',    views.WatchlistDetailView.as_view(),name='watchlist-detail'),
    path('<str:symbol>/',              views.StockDetailView.as_view(),   name='stock-detail'),
    path('<str:symbol>/history/',      views.StockHistoryView.as_view(),  name='stock-history'),
    path('<str:symbol>/analysis/',     views.StockAnalysisView.as_view(), name='stock-analysis'),
]
