from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import login
from rest_framework import viewsets, status
from .models import CustomUser, AITool, AIUsage, Subscription, Donation, Category, ContactMessage, UserFavorite, BlogPost, BlogLike, BlogComment
from .serializers import (
    UserSerializer, UserSignUpSerializer, UserLoginSerializer, 
    AIToolSerializer, AIUsageSerializer, SubscriptionSerializer, 
    DonationSerializer, CategorySerializer, ContactMessageSerializer, UserFavoriteSerializer,
    BlogPostSerializer, BlogPostListSerializer, BlogLikeSerializer, BlogCommentSerializer
)
from django.shortcuts import get_object_or_404


class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all().order_by("-created_at")
    serializer_class = ContactMessageSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer

    # Signup
    @action(
        detail=False,
        methods=['post'],
        permission_classes=[AllowAny],
        authentication_classes=[]
    )
    def signup(self, request):
        serializer = UserSignUpSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {'message': 'User registered successfully', 'user': UserSerializer(user).data},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(
        detail=False,
        methods=['post'],
        permission_classes=[AllowAny],
        authentication_classes=[]
    )
    def login(self, request):
        serializer = UserLoginSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)
            return Response(
                {"message": "Login successful", "user": UserSerializer(user).data},
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        # profile

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def profile(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


#ai tools views
class AiToolViewSet(viewsets.ModelViewSet):
    queryset = AITool.objects.all().order_by('-created_at')
    serializer_class = AIToolSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        is_popular = self.request.query_params.get('is_popular', None)
        if is_popular is not None:
            # Convert string to boolean
            is_popular_bool = is_popular.lower() in ['true', '1', 'yes']
            queryset = queryset.filter(is_popular=is_popular_bool)
        return queryset

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def premium(self,request):
        # return all premium tools
        premium_tools = AITool.objects.filter(is_premium=True)
        serializer = AIToolSerializer(premium_tools, many=True)
        return Response(serializer.data)

class AIUsageViewSet(viewsets.ModelViewSet):
    queryset = AIUsage.objects.all().order_by('-created_at')
    serializer_class = AIUsageSerializer
    permission_classes = [AllowAny]

    def perform_create(self,serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'],permission_classes=[IsAuthenticated])
    def my_usage(self,request):
        usages = AIUsage.objects.filter(user=self.request.user)
        serializer = self.get_serializer(usages, many=True)
        return Response(serializer.data)

class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = Subscription.objects.all().order_by('-start_date')
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user= self.request.user)

    @action(detail=False, methods=['get'],permission_classes=[IsAuthenticated])
    def my_subscription(self,request):
        subscription  =Subscription.objects.filter(user=request.user).first()
        if not subscription:
            return Response({'message':'No active subscription found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(subscription)
        return Response(serializer.data)

class DonationViewSet(viewsets.ModelViewSet):
    queryset = Donation.objects.all().order_by('-created_at')
    serializer_class = DonationSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserFavoriteViewSet(viewsets.ModelViewSet):
    serializer_class = UserFavoriteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserFavorite.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def toggle_favorite(self, request):
        tool_id = request.data.get('tool_id')
        if not tool_id:
            return Response({'error': 'tool_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            tool = AITool.objects.get(id=tool_id)
        except AITool.DoesNotExist:
            return Response({'error': 'Tool not found'}, status=status.HTTP_404_NOT_FOUND)
        
        favorite, created = UserFavorite.objects.get_or_create(
            user=request.user,
            tool=tool
        )
        
        if not created:
            # If favorite already exists, remove it
            favorite.delete()
            return Response({'message': 'Removed from favorites', 'is_favorite': False}, status=status.HTTP_200_OK)
        else:
            # If favorite was created, return success
            return Response({'message': 'Added to favorites', 'is_favorite': True}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def my_favorites(self, request):
        favorites = self.get_queryset()
        serializer = self.get_serializer(favorites, many=True)
        return Response(serializer.data)


# Category ViewSet
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Provides:
    - list: /api/categories/
    - retrieve: /api/categories/<slug>/
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'  # allows retrieve by slug instead of pk

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def popular(self, request):
        """
        GET /api/categories/popular/
        Returns all popular categories
        """
        popular_categories = Category.objects.filter(is_popular=True)
        serializer = self.get_serializer(popular_categories, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def tools(self, request, slug=None):
        """
        GET /api/categories/<slug>/tools/
        Returns tools in this category
        """
        category = get_object_or_404(Category, slug=slug)
        tools = category.tools.all()  # related_name='tools' in AITool
        serializer = AIToolSerializer(tools, many=True, context={'request': request})
        return Response(serializer.data)


# Blog Viewsets
class BlogPostViewSet(viewsets.ModelViewSet):
    queryset = BlogPost.objects.filter(is_published=True).order_by('-created_at')
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == 'list':
            return BlogPostListSerializer
        return BlogPostSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        # Only staff/admin can create posts
        if not self.request.user.is_staff:
            return Response(
                {'error': 'Only staff members can create blog posts'},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        """Toggle like on a blog post"""
        post = self.get_object()
        like, created = BlogLike.objects.get_or_create(
            user=request.user,
            post=post
        )
        
        if not created:
            # Unlike if already liked
            like.delete()
            return Response({'message': 'Post unliked', 'is_liked': False, 'like_count': post.like_count})
        
        return Response({'message': 'Post liked', 'is_liked': True, 'like_count': post.like_count})

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def comments(self, request, pk=None):
        """Get all comments for a blog post"""
        post = self.get_object()
        comments = post.comments.all()
        serializer = BlogCommentSerializer(comments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def comment(self, request, pk=None):
        """Add a comment to a blog post"""
        post = self.get_object()
        serializer = BlogCommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, post=post)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BlogCommentViewSet(viewsets.ModelViewSet):
    queryset = BlogComment.objects.all().order_by('-created_at')
    serializer_class = BlogCommentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        # Users can only update their own comments
        if serializer.instance.user != self.request.user:
            return Response(
                {'error': 'You can only update your own comments'},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer.save()

    def perform_destroy(self, instance):
        # Users can only delete their own comments
        if instance.user != self.request.user:
            return Response(
                {'error': 'You can only delete your own comments'},
                status=status.HTTP_403_FORBIDDEN
            )
        instance.delete()