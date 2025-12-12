from django.shortcuts import render

# Create your views here.
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import login
from rest_framework import viewsets, status
from rest_framework.exceptions import PermissionDenied
from .models import (
    CustomUser, AITool, AIUsage, Subscription, Donation, Category, ContactMessage,
    ToolRating, UserFavorite, BlogPost, Comment, NewsletterSubscriber, ToolSubmission
)
from .serializers import (
    UserSerializer, UserSignUpSerializer, UserLoginSerializer, AIToolSerializer,
    AIUsageSerializer, SubscriptionSerializer, DonationSerializer, CategorySerializer,
    ContactMessageSerializer, ToolRatingSerializer, UserFavoriteSerializer,
    BlogPostSerializer, CommentSerializer, NewsletterSubscriberSerializer,
    ToolSubmissionSerializer
)



class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_classes = UserSerializer

    # Signup
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def signup(self, request):
        serializer = UserSignUpSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {'message': 'User registered successfully', 'User': UserSerializer(user).data},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)
            return Response(
                {"message": "Login successful", "user": UserSerializer(user).data},
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        # profile

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def profile(self, request):
        """Get current user profile - works with or without authentication"""
        if not request.user.is_authenticated:
            # Return empty response for unauthenticated users (Firebase users)
            return Response({
                'id': None,
                'username': None,
                'email': None,
                'message': 'User not authenticated with Django. Firebase authentication is not synced with backend.'
            }, status=status.HTTP_200_OK)
        
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def sync_firebase_user(self, request):
        """Sync Firebase user with Django backend - creates user if doesn't exist"""
        email = request.data.get('email')
        username = request.data.get('username')
        firebase_uid = request.data.get('firebase_uid')  # Optional: Firebase user ID
        
        if not email:
            return Response(
                {'error': 'Email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate username from email if not provided
        if not username:
            username = email.split('@')[0]
        
        # Check if user already exists by email
        try:
            user = CustomUser.objects.get(email=email)
            # User exists, return existing user data
            return Response(
                {
                    'message': 'User already exists',
                    'user': UserSerializer(user).data
                },
                status=status.HTTP_200_OK
            )
        except CustomUser.DoesNotExist:
            # User doesn't exist, create new user
            # Generate a unique username if the default one is taken
            base_username = username
            counter = 1
            while CustomUser.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            
            # Create user without password (Firebase handles authentication)
            # Set a random password that won't be used
            import secrets
            random_password = secrets.token_urlsafe(32)
            user = CustomUser.objects.create_user(
                username=username,
                email=email,
                password=random_password  # Password won't be used since Firebase handles auth
            )
            
            return Response(
                {
                    'message': 'User created successfully',
                    'user': UserSerializer(user).data
                },
                status=status.HTTP_201_CREATED
            )
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]  # public access
    lookup_field = 'slug'  # Use slug instead of ID for lookups

    # Optional: Custom action to list all tools in a category
    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def tools(self, request, slug=None):
        """List all AI tools under a specific category"""
        category = self.get_object()
        tools = category.tools.all()  # uses related_name='tools' in AITool
        from .serializers import AIToolSerializer
        serializer = AIToolSerializer(tools, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def popular(self, request):
        """Get popular categories"""
        # Return categories that have popular tools or are marked as popular
        popular_categories = Category.objects.filter(
            tools__is_popular=True
        ).distinct()[:10]  # Limit to 10 popular categories
        serializer = self.get_serializer(popular_categories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
#ai tools views
class AiToolViewSet(viewsets.ModelViewSet):
    queryset = AITool.objects.all().order_by('-created_at')
    serializer_class = AIToolSerializer
    permission_classes = [AllowAny]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def premium(self, request):
        # return all premium tools
        premium_tools = AITool.objects.filter(is_premium=True)
        serializer = AIToolSerializer(premium_tools, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def free_tools(self, request):
        """Get all free tools"""
        free_tools = AITool.objects.filter(is_free=True).order_by('-created_at')
        serializer = AIToolSerializer(free_tools, many=True, context={'request': request})
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
        serializer.save(user= self.request.user)

    @action(detail=False, methods=['get'],permission_classes=[IsAuthenticated])
    def my_donation(self,request):
        donations = Donation.objects.filter(user=request.user)
        serializer = self.get_serializer(donations, many=True)
        return Response(serializer.data)


class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all().order_by('-created_at')
    serializer_class = ContactMessageSerializer
    
    def get_permissions(self):
        # Allow anyone to create (submit contact form)
        # Require authentication to list/retrieve (admin use)
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]


class ToolRatingViewSet(viewsets.ModelViewSet):
    queryset = ToolRating.objects.all().order_by('-created_at')
    serializer_class = ToolRatingSerializer

    def get_permissions(self):
        # Allow anyone to view ratings, but require auth to create/update/delete
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.is_authenticated and self.action in ['update', 'partial_update', 'destroy']:
            # For update/delete, only own ratings
            return queryset.filter(user=self.request.user)
        return queryset


class UserFavoriteViewSet(viewsets.ModelViewSet):
    serializer_class = UserFavoriteSerializer
    permission_classes = [AllowAny]  # Changed to AllowAny to work with Firebase auth

    def get_queryset(self):
        # Only return favorites for authenticated users
        if self.request.user.is_authenticated:
            return UserFavorite.objects.filter(user=self.request.user).order_by('-created_at')
        return UserFavorite.objects.none()

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def toggle_favorite(self, request):
        """Toggle favorite status for a tool - works with Django auth or Firebase email"""
        tool_id = request.data.get('tool_id')
        if not tool_id:
            return Response(
                {'error': 'tool_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            tool = AITool.objects.get(id=tool_id)
        except AITool.DoesNotExist:
            return Response(
                {'error': 'Tool not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get user - either from Django session or from request data (Firebase)
        user = None
        if request.user.is_authenticated:
            user = request.user
        else:
            # Try to get user from email in request (for Firebase users)
            user_email = request.data.get('user_email')
            if user_email:
                try:
                    user = CustomUser.objects.get(email=user_email)
                except CustomUser.DoesNotExist:
                    pass

        if not user:
            return Response({
                'message': 'Please log in to save favorites',
                'is_favorite': False
            })

        favorite, created = UserFavorite.objects.get_or_create(
            user=user,
            tool=tool
        )

        if not created:
            # Already exists, remove it
            favorite.delete()
            return Response({
                'message': 'Removed from favorites',
                'is_favorite': False
            })

        return Response({
            'message': 'Added to favorites',
            'is_favorite': True
        })

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def my_favorites(self, request):
        """Get current user's favorites"""
        if not request.user.is_authenticated:
            return Response([], status=status.HTTP_200_OK)
        
        favorites = UserFavorite.objects.filter(user=request.user).order_by('-created_at')
        serializer = self.get_serializer(favorites, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def check_favorite(self, request):
        """Check if a tool is favorited by current user"""
        tool_id = request.query_params.get('tool_id')
        if not tool_id:
            return Response(
                {'error': 'tool_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not request.user.is_authenticated:
            return Response({'is_favorite': False})

        is_favorite = UserFavorite.objects.filter(
            user=request.user,
            tool_id=tool_id
        ).exists()

        return Response({'is_favorite': is_favorite})


class NewsletterSubscriberViewSet(viewsets.ModelViewSet):
    queryset = NewsletterSubscriber.objects.all()
    serializer_class = NewsletterSubscriberSerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def subscribe(self, request):
        """Subscribe to newsletter"""
        email = request.data.get('email')
        if not email:
            return Response(
                {'error': 'email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        subscriber, created = NewsletterSubscriber.objects.get_or_create(email=email)
        if created:
            return Response(
                {'message': 'Successfully subscribed to newsletter'},
                status=status.HTTP_201_CREATED
            )
        return Response(
            {'message': 'Email already subscribed'},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def unsubscribe(self, request):
        """Unsubscribe from newsletter"""
        email = request.data.get('email')
        if not email:
            return Response(
                {'error': 'email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            subscriber = NewsletterSubscriber.objects.get(email=email)
            subscriber.delete()
            return Response({'message': 'Successfully unsubscribed'})
        except NewsletterSubscriber.DoesNotExist:
            return Response(
                {'error': 'Email not found in subscribers'},
                status=status.HTTP_404_NOT_FOUND
            )


class ToolSubmissionViewSet(viewsets.ModelViewSet):
    queryset = ToolSubmission.objects.all().order_by('-submitted_at')
    serializer_class = ToolSubmissionSerializer
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == 'create':
            return ToolSubmissionCreateSerializer
        return ToolSubmissionSerializer

    def get_permissions(self):
        # Allow anyone to submit tools
        # Require staff for list/retrieve/approve/reject
        if self.action == 'create':
            return [AllowAny()]
        # For list, retrieve, update, delete - require staff
        return [IsAuthenticated()]
    
    def get_queryset(self):
        # Only staff can see all submissions
        # Regular users can't list submissions
        if self.request.user.is_staff:
            return ToolSubmission.objects.all().order_by('-submitted_at')
        return ToolSubmission.objects.none()

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def approve(self, request, pk=None):
        """Approve a tool submission (staff only)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Permission denied. Staff access required.'},
                status=status.HTTP_403_FORBIDDEN
            )
        from django.utils import timezone
        submission = self.get_object()
        submission.status = ToolSubmission.Status.APPROVED
        submission.reviewed_by = request.user
        submission.reviewed_at = timezone.now()
        submission.save()
        serializer = self.get_serializer(submission)
        return Response({
            'message': 'Tool submission approved',
            'submission': serializer.data
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def reject(self, request, pk=None):
        """Reject a tool submission (staff only)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Permission denied. Staff access required.'},
                status=status.HTTP_403_FORBIDDEN
            )
        from django.utils import timezone
        submission = self.get_object()
        submission.status = ToolSubmission.Status.REJECTED
        submission.reviewed_by = request.user
        submission.reviewed_at = timezone.now()
        admin_notes = request.data.get('admin_notes', '')
        if admin_notes:
            submission.admin_notes = admin_notes
        submission.save()
        serializer = self.get_serializer(submission)
        return Response({
            'message': 'Tool submission rejected',
            'submission': serializer.data
        })


class BlogPostViewSet(viewsets.ModelViewSet):
    """Professional blog post viewset with SEO and directory integration"""
    serializer_class = BlogPostSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        queryset = BlogPost.objects.select_related('author').prefetch_related(
            'tools_mentioned', 'likes', 'comments', 'comments__author', 'comments__replies'
        )
        
        # Filter by status - only published for non-staff
        if not self.request.user.is_staff:
            queryset = queryset.filter(status=BlogPost.Status.PUBLISHED)
        
        # Filter by featured
        featured = self.request.query_params.get('featured', None)
        if featured == 'true':
            queryset = queryset.filter(featured=True)
        
        # Filter by category tag
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category_tag=category)
        
        # Filter by author
        author = self.request.query_params.get('author', None)
        if author:
            queryset = queryset.filter(author_id=author)
        
        return queryset.order_by('-published_at', '-created_at')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def retrieve(self, request, *args, **kwargs):
        """Increment view count when post is viewed"""
        instance = self.get_object()
        instance.increment_view_count()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def perform_create(self, serializer):
        # Set author to current user if not provided
        if not serializer.validated_data.get('author'):
            serializer.save(author=self.request.user)
        else:
            serializer.save()

    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def toggle_like(self, request, slug=None):
        """Toggle like status for a blog post - works with or without authentication"""
        post = self.get_object()
        
        # Get user - either from Django session or from request data (Firebase)
        user = None
        if request.user.is_authenticated:
            user = request.user
        else:
            # Try to get user from email in request (for Firebase users)
            user_email = request.data.get('user_email')
            if user_email:
                try:
                    user = CustomUser.objects.get(email=user_email)
                except CustomUser.DoesNotExist:
                    pass
        
        if user:
            # Authenticated user - toggle like in ManyToMany
            if post.likes.filter(id=user.id).exists():
                post.likes.remove(user)
                is_liked = False
            else:
                post.likes.add(user)
                is_liked = True
        else:
            # Anonymous user - increment anonymous likes counter
            # Use session to prevent duplicate likes from same browser session
            session_key = f'liked_post_{post.id}'
            if not request.session.get(session_key, False):
                post.anonymous_likes += 1
                post.save(update_fields=['anonymous_likes'])
                request.session[session_key] = True
                is_liked = True
            else:
                # Already liked in this session, remove like
                if post.anonymous_likes > 0:
                    post.anonymous_likes -= 1
                    post.save(update_fields=['anonymous_likes'])
                request.session[session_key] = False
                is_liked = False
        
        return Response({
            'message': 'Post liked' if is_liked else 'Like removed',
            'is_liked': is_liked,
            'like_count': post.total_likes()
        })

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def check_like(self, request, slug=None):
        """Check if a blog post is liked by current user (authenticated or anonymous)"""
        post = self.get_object()
        is_liked = False
        
        if request.user.is_authenticated:
            is_liked = post.likes.filter(id=request.user.id).exists()
        else:
            # Check if anonymous user liked in this session
            session_key = f'liked_post_{post.id}'
            is_liked = request.session.get(session_key, False)
        
        return Response({
            'is_liked': is_liked,
            'like_count': post.total_likes()
        })

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def share(self, request, slug=None):
        """Get shareable link for blog post with metadata"""
        post = self.get_object()
        share_url = request.build_absolute_uri(f'/blog/{post.slug}')
        
        return Response({
            'share_url': share_url,
            'title': post.title,
            'excerpt': post.excerpt or (post.content[:200] + '...' if len(post.content) > 200 else post.content),
            'cover_image': request.build_absolute_uri(post.cover_image.url) if post.cover_image else None,
            'meta_title': post.meta_title or post.title,
            'meta_description': post.meta_description or post.excerpt
        })


class CommentViewSet(viewsets.ModelViewSet):
    """Threaded comment viewset with reply support"""
    serializer_class = CommentSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Comment.objects.select_related('author', 'post', 'parent').prefetch_related(
            'replies', 'replies__author'
        ).filter(active=True)
        
        # Filter by post if provided
        post_id = self.request.query_params.get('post', None)
        if post_id:
            queryset = queryset.filter(post_id=post_id)
        
        # Only show top-level comments or replies based on parent
        parent_id = self.request.query_params.get('parent', None)
        if parent_id == 'null' or parent_id == '':
            queryset = queryset.filter(parent__isnull=True)
        elif parent_id:
            queryset = queryset.filter(parent_id=parent_id)
        
        return queryset.order_by('created_at')

    def get_permissions(self):
        # Allow anyone to view comments, but require auth to create/update/delete
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        # Get user - either from Django session or from request data (Firebase)
        user = None
        if self.request.user.is_authenticated:
            user = self.request.user
        else:
            # Try to get user from email in request (for Firebase users)
            user_email = self.request.data.get('user_email')
            if user_email:
                try:
                    user = CustomUser.objects.get(email=user_email)
                except CustomUser.DoesNotExist:
                    pass
        
        if not user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Please log in to add comments")
        
        # Set author to user
        serializer.save(author=user)
    
    def perform_update(self, serializer):
        # Users can only update their own comments
        if serializer.instance.author != self.request.user and not self.request.user.is_staff:
            raise PermissionDenied("You can only edit your own comments.")
        serializer.save()
    
    def perform_destroy(self, instance):
        # Soft delete - set active to False instead of deleting
        if instance.author != self.request.user and not self.request.user.is_staff:
            raise PermissionDenied("You can only delete your own comments.")
        instance.active = False
        instance.save()