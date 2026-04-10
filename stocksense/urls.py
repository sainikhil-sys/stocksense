from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/',       include('users.urls')),
    path('api/profile/',    include('users.profile_urls')),
    path('api/budget/',     include('finance.budget_urls')),
    path('api/transactions/', include('finance.transaction_urls')),
    path('api/goals/',      include('finance.goal_urls')),
    path('api/portfolio/',  include('portfolio.urls')),
    path('api/stocks/',     include('stocks.urls')),
    path('api/ai/',         include('ai_assistant.urls')),
    path('accounts/',       include('allauth.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
