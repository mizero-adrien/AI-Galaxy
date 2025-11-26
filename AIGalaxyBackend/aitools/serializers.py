from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import CustomUser,AITool,AIUsage,Donation,Subscription,Category,ContactMessage,UserFavorite,BlogPost,BlogLike,BlogComment


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email']


class UserSignUpSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    username = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'password']

    def create(self, validated_data):
        email = validated_data['email']
        # Auto-generate username from email if not provided
        username = validated_data.get('username') or email.split('@')[0]
        # Ensure username is unique by appending numbers if needed
        base_username = username
        counter = 1
        while CustomUser.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1
        
        user = CustomUser.objects.create_user(
            username=username,
            email=email,
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
        fields = ['id','name', 'slug', 'description', 'is_popular']


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
        fields = ['id', 'name', 'description', 'category', 'category_id','image','is_popular','is_free','link', 'created_at']


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

class UserFavoriteSerializer(serializers.ModelSerializer):
    tool = AIToolSerializer(read_only=True)
    tool_id = serializers.PrimaryKeyRelatedField(
        queryset=AITool.objects.all(),
        source='tool',
        write_only=True
    )

    class Meta:
        model = UserFavorite
        fields = ['id', 'tool', 'tool_id', 'created_at']


class BlogCommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = BlogComment
        fields = ['id', 'user', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class BlogLikeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = BlogLike
        fields = ['id', 'user', 'created_at']
        read_only_fields = ['id', 'created_at']


class BlogPostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    like_count = serializers.IntegerField(read_only=True)
    comment_count = serializers.IntegerField(read_only=True)
    likes = BlogLikeSerializer(many=True, read_only=True)
    comments = BlogCommentSerializer(many=True, read_only=True)
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = ['id', 'title', 'content', 'excerpt', 'author', 'created_at', 'updated_at', 
                  'image', 'is_published', 'like_count', 'comment_count', 'likes', 'comments', 'is_liked']
        read_only_fields = ['id', 'created_at', 'updated_at', 'author']

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return BlogLike.objects.filter(user=request.user, post=obj).exists()
        return False


class BlogPostListSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    like_count = serializers.IntegerField(read_only=True)
    comment_count = serializers.IntegerField(read_only=True)
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = ['id', 'title', 'excerpt', 'author', 'created_at', 'image', 
                  'is_published', 'like_count', 'comment_count', 'is_liked']
        read_only_fields = ['id', 'created_at', 'author']

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return BlogLike.objects.filter(user=request.user, post=obj).exists()
        return False
