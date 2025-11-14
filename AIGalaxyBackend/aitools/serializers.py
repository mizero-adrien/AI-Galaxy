from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import CustomUser,AITool,AIUsage,Donation,Subscription,Category,ContactMessage


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email']


class UserSignUpSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'password']

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        user = authenticate(
            request=self.context.get('request'),
            username=email,
            password=password
        )
        if not user:
            raise serializers.ValidationError("Invalid email or password")
        data['user'] = user
        return data




class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id','name', 'slug', 'description']


class AIToolSerializer(serializers.ModelSerializer):
    # This will show category details inside AItool JSON
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True
    )

    class Meta:
        model = AITool
        fields = ['id', 'name', 'description', 'category', 'category_id','image', 'created_at']


# AIUsage Serializer
class AIUsageSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    tool = AIToolSerializer(read_only=True)
    tool_id = serializers.PrimaryKeyRelatedField(
        queryset=AITool.objects.all(),
        source='tool',
        write_only=True
    )

    class Meta:
        model = AIUsage
        fields = ['id', 'user', 'tool', 'tool_id', 'input_text', 'output_text', 'created_at']

# Subscription Serializer
class SubscriptionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Subscription
        fields = ['id', 'user', 'plan_name', 'start_date', 'end_date', 'is_active']

# Donation Serializer
class DonationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Donation
        fields = ['id', 'user', 'amount', 'message', 'created_at', 'payment_method', 'completed']

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ("id", "firstName", "lastName", "email", "country", "message", "is_human", "created_at")
        read_only_fields = ("id", "created_at")

    def validate_is_human(self, value):
        # Server-side check — require checkbox checked to accept submission.
        if not value:
            raise serializers.ValidationError("Please confirm you are not a robot.")
        return value
