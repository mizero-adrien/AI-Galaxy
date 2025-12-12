from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import (
    CustomUser, AITool, AIUsage, Donation, Subscription, Category, ContactMessage,
    ToolModel, ToolRating, UserFavorite, NewsletterSubscriber, ToolSubmission,
    BlogPost, Comment
)


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


class ToolModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = ToolModel
        fields = ['id', 'name', 'description', 'created_at']


class ToolRatingSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    
    class Meta:
        model = ToolRating
        fields = ['id', 'user', 'user_id', 'tool', 'rating', 'review', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class AIToolSerializer(serializers.ModelSerializer):
    # This will show category details inside AItool JSON
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True,
        required=False
    )
    models = ToolModelSerializer(many=True, read_only=True)
    ratings = ToolRatingSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    user_rating = serializers.SerializerMethodField()

    class Meta:
        model = AITool
        fields = ['id', 'name', 'description', 'category', 'category_id', 'image', 'is_premium', 'is_popular', 'is_free', 'affiliate', 'link', 'features', 'how_it_works', 'models', 'ratings', 'average_rating', 'user_rating', 'created_at']

    def get_average_rating(self, obj):
        ratings = obj.ratings.all()
        if ratings.exists():
            return round(sum(r.rating for r in ratings) / ratings.count(), 2)
        return None

    def get_user_rating(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                rating = obj.ratings.get(user=request.user)
                return {
                    'rating': rating.rating,
                    'review': rating.review,
                    'id': rating.id
                }
            except ToolRating.DoesNotExist:
                return None
        return None


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
    
    class Meta:
        model = UserFavorite
        fields = ['id', 'tool', 'created_at']
        read_only_fields = ['id', 'created_at']


class NewsletterSubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscriber
        fields = ['id', 'email', 'subscribed_at', 'is_active']
        read_only_fields = ['id', 'subscribed_at']


class ToolSubmissionSerializer(serializers.ModelSerializer):
    reviewed_by_username = serializers.CharField(source='reviewed_by.username', read_only=True, allow_null=True)
    
    class Meta:
        model = ToolSubmission
        fields = ['id', 'name', 'email', 'image', 'features', 'how_it_works', 'status', 'submitted_at', 'reviewed_at', 'admin_notes', 'reviewed_by', 'reviewed_by_username']
        read_only_fields = ['id', 'submitted_at', 'reviewed_at', 'reviewed_by', 'status']


class ToolSubmissionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ToolSubmission
        fields = ['name', 'email', 'image', 'features', 'how_it_works']


class CommentSerializer(serializers.ModelSerializer):
    """Serializer for threaded comments"""
    author = UserSerializer(read_only=True)
    author_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(),
        source='author',
        write_only=True,
        required=False
    )
    replies = serializers.SerializerMethodField()
    reply_count = serializers.SerializerMethodField()
    is_reply = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'author_id', 'body', 'parent', 'active',
                  'created_at', 'updated_at', 'replies', 'reply_count', 'is_reply']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_replies(self, obj):
        """Get active replies to this comment"""
        replies = obj.replies.filter(active=True).order_by('created_at')
        return CommentSerializer(replies, many=True, context=self.context).data

    def get_reply_count(self, obj):
        return obj.get_reply_count()

    def get_is_reply(self, obj):
        return obj.is_reply

    def validate_parent(self, value):
        """Ensure parent comment belongs to same post"""
        post = self.initial_data.get('post')
        if value and post and value.post_id != post:
            raise serializers.ValidationError("Parent comment must belong to the same post.")
        return value


class BlogPostSerializer(serializers.ModelSerializer):
    """Professional blog post serializer with SEO and directory integration"""
    author = UserSerializer(read_only=True)
    author_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(),
        source='author',
        write_only=True,
        required=False
    )
    tools_mentioned = AIToolSerializer(many=True, read_only=True)
    tools_mentioned_ids = serializers.PrimaryKeyRelatedField(
        queryset=AITool.objects.all(),
        source='tools_mentioned',
        many=True,
        write_only=True,
        required=False
    )
    comments = CommentSerializer(many=True, read_only=True)
    like_count = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    active_comment_count = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'excerpt', 'content', 'cover_image', 'author', 'author_id',
            'status', 'published_at', 'created_at', 'updated_at', 'tools_mentioned', 'tools_mentioned_ids',
            'meta_title', 'meta_description', 'view_count', 'featured', 'category_tag',
            'comments', 'like_count', 'comment_count', 'active_comment_count', 'is_liked'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'slug', 'view_count']

    def get_like_count(self, obj):
        return obj.total_likes()

    def get_comment_count(self, obj):
        return obj.comments.count()

    def get_active_comment_count(self, obj):
        return obj.comments.filter(active=True).count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False
