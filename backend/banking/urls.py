from django.urls import path
from . import views

urlpatterns = [
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/refresh/', views.refresh_token_view, name='token_refresh'),
    path('profile/', views.profile_view, name='profile'),
    path('profile/update/', views.update_profile_view, name='profile_update'),
    path('accounts/', views.accounts_view, name='accounts'),
    path('transactions/', views.transactions_view, name='transactions'),
    path('deposit/', views.deposit_view, name='deposit'),
    path('withdraw/', views.withdraw_view, name='withdraw'),
    path('send/', views.send_money_view, name='send_money'),
    path('dashboard/', views.dashboard_summary, name='dashboard'),
    path('savings/', views.savings_goals_view, name='savings'),
    path('savings/contribute/', views.contribute_savings_view, name='savings_contribute'),
    path('reports/', views.reports_view, name='reports'),
]