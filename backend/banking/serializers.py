from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Account, Transaction, SavingsGoal
import random
import string


def generate_reference():
    return 'TXN' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=12))


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'email', 'phone', 'first_name', 'last_name', 'password', 'confirm_password',
            'security_question_pet', 'security_question_food',
            'security_question_nickname', 'security_question_color'
        ]

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        Account.objects.create(user=user, account_type='savings')
        Account.objects.create(user=user, account_type='current')
        return user


class LoginSerializer(serializers.Serializer):
    identifier = serializers.CharField()  # email or phone
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        identifier = data.get('identifier')
        password = data.get('password')

        user = None
        if '@' in identifier:
            try:
                u = User.objects.get(email=identifier)
                if u.check_password(password):
                    user = u
            except User.DoesNotExist:
                pass
        else:
            try:
                u = User.objects.get(phone=identifier)
                if u.check_password(password):
                    user = u
            except User.DoesNotExist:
                pass

        if not user:
            raise serializers.ValidationError('Invalid credentials.')
        if not user.is_active:
            raise serializers.ValidationError('Account is disabled.')
        data['user'] = user
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'email', 'phone', 'first_name', 'last_name',
            'account_number', 'date_joined'
        ]


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['id', 'account_type', 'balance', 'currency', 'is_active', 'created_at']


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ['id', 'reference', 'balance_before', 'balance_after', 'created_at']


class DepositSerializer(serializers.Serializer):
    account_id = serializers.UUIDField()
    amount = serializers.DecimalField(max_digits=15, decimal_places=2, min_value=1)
    description = serializers.CharField(required=False, default='Deposit')


class WithdrawSerializer(serializers.Serializer):
    account_id = serializers.UUIDField()
    amount = serializers.DecimalField(max_digits=15, decimal_places=2, min_value=1)
    description = serializers.CharField(required=False, default='Withdrawal')


class SendMoneySerializer(serializers.Serializer):
    from_account_id = serializers.UUIDField()
    recipient_account = serializers.CharField()
    amount = serializers.DecimalField(max_digits=15, decimal_places=2, min_value=1)
    description = serializers.CharField(required=False, default='Transfer')


class SavingsGoalSerializer(serializers.ModelSerializer):
    progress_percentage = serializers.ReadOnlyField()

    class Meta:
        model = SavingsGoal
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'progress_percentage']


class SavingsContributeSerializer(serializers.Serializer):
    account_id = serializers.UUIDField()
    goal_id = serializers.UUIDField()
    amount = serializers.DecimalField(max_digits=15, decimal_places=2, min_value=1)