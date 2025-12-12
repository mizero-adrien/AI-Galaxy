from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify


class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    is_premium = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True,default='')
    slug = models.SlugField(max_length=100, unique=True,default='')
    description = models.TextField(blank=True, null=True,default='')

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class AITool(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='tools',blank=True, null=True)
    name = models.CharField(max_length=100)
    description = models.TextField()
    is_premium = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to='aitools', blank=True, null=True)
    is_popular =models.BooleanField(default=False)
    is_free = models.BooleanField(default=True)
    link = models.URLField(blank=True, null=True, help_text='External URL to the AI tool')
    affiliate = models.BooleanField(default=False, help_text='Whether this tool is an affiliate link')
    features = models.JSONField(blank=True, default=list, help_text='List of features as JSON array')
    how_it_works = models.TextField(blank=True, null=True, help_text='Description of how the tool works')

    def __str__(self):
        return self.name

class AIUsage(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='usages')

    tool = models.ForeignKey(AITool, on_delete=models.CASCADE)
    input_text = models.TextField()
    output_text = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.tool.name} at {self.created_at}"

class Subscription(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    plan_name = models.CharField(max_length=50)
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username} - {self.plan_name}"



class Donation(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)  # amount donated
    message = models.TextField(blank=True, null=True)  # optional message
    created_at = models.DateTimeField(auto_now_add=True)
    payment_method = models.CharField(max_length=50, choices=[('paypal', 'PayPal'), ('card', 'Card'), ('crypto', 'Crypto')], default='card')
    completed = models.BooleanField(default=False)  # mark if payment was successful

    def __str__(self):
        return f"{self.user} donated {self.amount}"

class ContactMessage(models.Model):
    firstName = models.CharField(max_length=150)
    lastName = models.CharField(max_length=150)
    email = models.EmailField()
    country = models.CharField(max_length=100, blank=True, null=True)
    message = models.TextField()
    is_human = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.firstName} {self.lastName} <{self.email}>"


class ToolModel(models.Model):
    """Model representing different AI models used by a tool (e.g., GPT-4, Claude 3)"""
    tool = models.ForeignKey(AITool, on_delete=models.CASCADE, related_name='models')
    name = models.CharField(max_length=200, help_text='Model name (e.g., GPT-4, Claude 3)')
    description = models.TextField(blank=True, null=True, help_text='Description of the model')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        unique_together = [('tool', 'name')]

    def __str__(self):
        return f"{self.tool.name} - {self.name}"


class ToolRating(models.Model):
    """User ratings and reviews for AI tools"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tool_ratings')
    tool = models.ForeignKey(AITool, on_delete=models.CASCADE, related_name='ratings')
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text='Rating from 1 to 5 stars'
    )
    review = models.TextField(blank=True, null=True, help_text='Optional review text')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = [('user', 'tool')]

    def __str__(self):
        return f"{self.user.username} - {self.tool.name} ({self.rating} stars)"


class UserFavorite(models.Model):
    """User's favorite AI tools"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorites')
    tool = models.ForeignKey(AITool, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = [('user', 'tool')]

    def __str__(self):
        return f"{self.user.username} - {self.tool.name}"


class NewsletterSubscriber(models.Model):
    """Newsletter subscription management"""
    email = models.EmailField(unique=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Newsletter Subscriber'
        verbose_name_plural = 'Newsletter Subscribers'
        ordering = ['-subscribed_at']

    def __str__(self):
        return self.email


class ToolSubmission(models.Model):
    """User-submitted AI tools for review"""
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending Review'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'

    name = models.CharField(max_length=200)
    email = models.EmailField()
    image = models.URLField(max_length=500)
    features = models.TextField(blank=True, null=True)
    how_it_works = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)
    admin_notes = models.TextField(blank=True, null=True, help_text='Internal notes for admin')
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='reviewed_tools',
        limit_choices_to={'is_staff': True}
    )

    class Meta:
        verbose_name = 'Tool Submission'
        verbose_name_plural = 'Tool Submissions'
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.name} - {self.status}"


class BlogPost(models.Model):
    """Blog post model with SEO and engagement features"""
    class Status(models.TextChoices):
        DRAFT = 'DF', 'Draft'
        PUBLISHED = 'PB', 'Published'

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, blank=True, null=True, unique=True)
    excerpt = models.TextField(
        blank=True,
        null=True,
        max_length=300,
        help_text="A short 'TL;DR' summary for the card view."
    )
    content = models.TextField(help_text='Main blog post content')
    cover_image = models.ImageField(upload_to='blog_covers/', blank=True, null=True)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='blog_posts'
    )
    status = models.CharField(max_length=2, choices=Status.choices, default=Status.DRAFT)
    published_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    tools_mentioned = models.ManyToManyField(
        AITool,
        blank=True,
        related_name='blog_mentions',
        help_text='AI tools mentioned in this blog post'
    )
    likes = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        blank=True,
        related_name='blog_likes'
    )
    anonymous_likes = models.PositiveIntegerField(
        default=0,
        help_text='Number of likes from anonymous users'
    )
    view_count = models.PositiveIntegerField(
        default=0,
        help_text='Number of times this post has been viewed'
    )
    featured = models.BooleanField(
        default=False,
        help_text='Featured posts appear prominently on the blog homepage'
    )
    category_tag = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text='Optional category tag for grouping posts'
    )
    meta_title = models.CharField(
        max_length=60,
        blank=True,
        help_text='Keep under 60 chars for Google snippets.'
    )
    meta_description = models.CharField(
        max_length=160,
        blank=True,
        help_text='Keep under 160 chars. This appears in search results.'
    )

    class Meta:
        verbose_name = 'Blog Post'
        verbose_name_plural = 'Blog Posts'
        ordering = ['-published_at']
        indexes = [
            models.Index(fields=['slug', 'status']),
            models.Index(fields=['published_at', 'status']),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def increment_view_count(self):
        """Increment the view count for this post"""
        self.view_count += 1
        self.save(update_fields=['view_count'])

    def total_likes(self):
        """Get total number of likes (authenticated + anonymous)"""
        return self.likes.count() + self.anonymous_likes


class Comment(models.Model):
    """Threaded comment system for blog posts"""
    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='blog_comments'
    )
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name='replies'
    )
    body = models.TextField()
    active = models.BooleanField(
        default=True,
        help_text='For moderation (hide instead of delete)'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Comment'
        verbose_name_plural = 'Comments'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['post', 'active']),
            models.Index(fields=['parent']),
        ]

    def __str__(self):
        return f"Comment by {self.author.username} on {self.post.title}"

    def get_reply_count(self):
        """Get count of active replies"""
        return self.replies.filter(active=True).count()

    @property
    def is_reply(self):
        """Check if this comment is a reply to another comment"""
        return self.parent is not None


