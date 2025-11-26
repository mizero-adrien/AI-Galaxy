from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet,
    AiToolViewSet,
    AIUsageViewSet,
    SubscriptionViewSet,
    DonationViewSet, CategoryViewSet,
    ContactMessageViewSet, UserFavoriteViewSet,
    BlogPostViewSet, BlogCommentViewSet
)

# Create a router and register all viewsets
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='users')

router.register(r'ai-tools',AiToolViewSet, basename='aitools')
router.register(r'usage', AIUsageViewSet, basename='usage')
router.register(r'subscriptions', SubscriptionViewSet, basename='subscriptions')
router.register(r'donations', DonationViewSet, basename='donations')
router.register(r'categories', CategoryViewSet, basename='categories')
router.register("contact", ContactMessageViewSet, basename="contact")
router.register(r'favorites', UserFavoriteViewSet, basename='favorites')
router.register(r'blog/posts', BlogPostViewSet, basename='blogposts')
router.register(r'blog/comments', BlogCommentViewSet, basename='blogcomments')

urlpatterns = [
    path('', include(router.urls)),
]
