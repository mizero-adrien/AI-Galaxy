from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet,
    AiToolViewSet,
    AIUsageViewSet,
    SubscriptionViewSet,
    DonationViewSet,
    CategoryViewSet,
    ContactMessageViewSet,
    ToolRatingViewSet,
    UserFavoriteViewSet,
    NewsletterSubscriberViewSet,
    ToolSubmissionViewSet,
    BlogPostViewSet,
    CommentViewSet
)

# Create a router and register all viewsets
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='users')

router.register(r'ai-tools',AiToolViewSet, basename='aitools')
router.register(r'usage', AIUsageViewSet, basename='usage')
router.register(r'subscriptions', SubscriptionViewSet, basename='subscriptions')
router.register(r'donations', DonationViewSet, basename='donations')
router.register(r'categories', CategoryViewSet, basename='categories')
router.register(r'contact', ContactMessageViewSet, basename='contact')
router.register(r'tool-ratings', ToolRatingViewSet, basename='tool-ratings')
router.register(r'favorites', UserFavoriteViewSet, basename='favorites')
router.register(r'newsletter', NewsletterSubscriberViewSet, basename='newsletter')
router.register(r'submit-tool', ToolSubmissionViewSet, basename='submit-tool')
router.register(r'blog', BlogPostViewSet, basename='blog')
router.register(r'comments', CommentViewSet, basename='comments')

urlpatterns = [
    path('', include(router.urls)),
]
