from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import transaction as db_transaction
from django.db.models import Sum, Q
from .models import User, Account, Transaction, SavingsGoal
from .serializers import *
import random
import string


def generate_reference():
    return 'TXN' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=12))


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def refresh_token_view(request):
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return Response({'error': 'Refresh token required'}, status=400)
    try:
        refresh = RefreshToken(refresh_token)
        return Response({'access': str(refresh.access_token), 'refresh': str(refresh)})
    except Exception:
        return Response({'error': 'Invalid or expired refresh token'}, status=401)


@api_view(['GET'])
def profile_view(request):
    user = request.user
    accounts = Account.objects.filter(user=user, is_active=True)
    return Response({
        'user': UserSerializer(user).data,
        'accounts': AccountSerializer(accounts, many=True).data,
    })


@api_view(['PUT', 'PATCH'])
def update_profile_view(request):
    user = request.user
    allowed_fields = ['first_name', 'last_name', 'phone']
    for field in allowed_fields:
        if field in request.data:
            setattr(user, field, request.data[field])
    user.save()
    return Response(UserSerializer(user).data)


@api_view(['GET'])
def accounts_view(request):
    accounts = Account.objects.filter(user=request.user, is_active=True)
    return Response(AccountSerializer(accounts, many=True).data)


@api_view(['GET'])
def transactions_view(request):
    accounts = Account.objects.filter(user=request.user)
    txns = Transaction.objects.filter(account__in=accounts)
    t_type = request.query_params.get('type')
    if t_type:
        txns = txns.filter(transaction_type=t_type)
    return Response(TransactionSerializer(txns[:50], many=True).data)


@api_view(['POST'])
def deposit_view(request):
    serializer = DepositSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data
    try:
        account = Account.objects.get(id=data['account_id'], user=request.user)
    except Account.DoesNotExist:
        return Response({'error': 'Account not found'}, status=404)

    with db_transaction.atomic():
        balance_before = account.balance
        account.balance += data['amount']
        account.save()
        txn = Transaction.objects.create(
            account=account,
            transaction_type='deposit',
            amount=data['amount'],
            balance_before=balance_before,
            balance_after=account.balance,
            description=data.get('description', 'Deposit'),
            reference=generate_reference(),
            status='completed',
        )
    return Response(TransactionSerializer(txn).data, status=201)


@api_view(['POST'])
def withdraw_view(request):
    serializer = WithdrawSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data
    try:
        account = Account.objects.get(id=data['account_id'], user=request.user)
    except Account.DoesNotExist:
        return Response({'error': 'Account not found'}, status=404)

    if account.balance < data['amount']:
        return Response({'error': 'Insufficient funds'}, status=400)

    with db_transaction.atomic():
        balance_before = account.balance
        account.balance -= data['amount']
        account.save()
        txn = Transaction.objects.create(
            account=account,
            transaction_type='withdrawal',
            amount=data['amount'],
            balance_before=balance_before,
            balance_after=account.balance,
            description=data.get('description', 'Withdrawal'),
            reference=generate_reference(),
            status='completed',
        )
    return Response(TransactionSerializer(txn).data, status=201)


@api_view(['POST'])
def send_money_view(request):
    serializer = SendMoneySerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data
    try:
        from_account = Account.objects.get(id=data['from_account_id'], user=request.user)
    except Account.DoesNotExist:
        return Response({'error': 'Source account not found'}, status=404)

    if from_account.balance < data['amount']:
        return Response({'error': 'Insufficient funds'}, status=400)

    recipient_name = 'External Account'
    try:
        recipient_user = User.objects.get(account_number=data['recipient_account'])
        recipient_account = Account.objects.filter(user=recipient_user, account_type='savings').first()
        recipient_name = recipient_user.full_name
    except User.DoesNotExist:
        recipient_account = None

    with db_transaction.atomic():
        balance_before = from_account.balance
        from_account.balance -= data['amount']
        from_account.save()
        ref = generate_reference()
        txn = Transaction.objects.create(
            account=from_account,
            transaction_type='send',
            amount=data['amount'],
            balance_before=balance_before,
            balance_after=from_account.balance,
            description=data.get('description', 'Send Money'),
            reference=ref,
            recipient_account=data['recipient_account'],
            recipient_name=recipient_name,
            status='completed',
        )
        if recipient_account:
            r_before = recipient_account.balance
            recipient_account.balance += data['amount']
            recipient_account.save()
            Transaction.objects.create(
                account=recipient_account,
                transaction_type='receive',
                amount=data['amount'],
                balance_before=r_before,
                balance_after=recipient_account.balance,
                description=f'Received from {request.user.full_name}',
                reference='R' + ref,
                status='completed',
            )
    return Response(TransactionSerializer(txn).data, status=201)


@api_view(['GET'])
def dashboard_summary(request):
    accounts = Account.objects.filter(user=request.user, is_active=True)
    total_balance = sum(a.balance for a in accounts)
    txns = Transaction.objects.filter(account__in=accounts)
    total_in = txns.filter(transaction_type__in=['deposit', 'receive']).aggregate(s=Sum('amount'))['s'] or 0
    total_out = txns.filter(transaction_type__in=['withdrawal', 'send']).aggregate(s=Sum('amount'))['s'] or 0
    recent = txns[:5]
    return Response({
        'total_balance': float(total_balance),
        'total_in': float(total_in),
        'total_out': float(total_out),
        'accounts': AccountSerializer(accounts, many=True).data,
        'recent_transactions': TransactionSerializer(recent, many=True).data,
    })


@api_view(['GET', 'POST'])
def savings_goals_view(request):
    if request.method == 'GET':
        goals = SavingsGoal.objects.filter(user=request.user)
        return Response(SavingsGoalSerializer(goals, many=True).data)
    serializer = SavingsGoalSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    goal = serializer.save(user=request.user)
    return Response(SavingsGoalSerializer(goal).data, status=201)


@api_view(['POST'])
def contribute_savings_view(request):
    serializer = SavingsContributeSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data
    try:
        account = Account.objects.get(id=data['account_id'], user=request.user)
        goal = SavingsGoal.objects.get(id=data['goal_id'], user=request.user)
    except (Account.DoesNotExist, SavingsGoal.DoesNotExist):
        return Response({'error': 'Not found'}, status=404)

    if account.balance < data['amount']:
        return Response({'error': 'Insufficient funds'}, status=400)

    with db_transaction.atomic():
        balance_before = account.balance
        account.balance -= data['amount']
        account.save()
        goal.current_amount += data['amount']
        if goal.current_amount >= goal.target_amount:
            goal.is_completed = True
        goal.save()
        txn = Transaction.objects.create(
            account=account,
            transaction_type='send',
            amount=data['amount'],
            balance_before=balance_before,
            balance_after=account.balance,
            description=f'Savings: {goal.name}',
            reference=generate_reference(),
            status='completed',
        )
    return Response({'goal': SavingsGoalSerializer(goal).data, 'transaction': TransactionSerializer(txn).data})


@api_view(['GET'])
def reports_view(request):
    accounts = Account.objects.filter(user=request.user)
    txns = Transaction.objects.filter(account__in=accounts)
    by_type = {}
    for t in ['deposit', 'withdrawal', 'send', 'receive']:
        agg = txns.filter(transaction_type=t).aggregate(total=Sum('amount'), count=models.Count('id'))
        by_type[t] = {'total': float(agg['total'] or 0), 'count': agg['count']}
    monthly = []
    from django.db.models.functions import TruncMonth
    monthly_data = txns.annotate(month=TruncMonth('created_at')).values('month', 'transaction_type').annotate(
        total=Sum('amount')).order_by('month')
    for m in monthly_data:
        monthly.append({
            'month': m['month'].strftime('%Y-%m') if m['month'] else None,
            'type': m['transaction_type'],
            'total': float(m['total'] or 0),
        })
    return Response({'by_type': by_type, 'monthly': monthly})


from django.db import models