from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings


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
    is_popular = models.BooleanField(default=False)

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
    link = models.URLField(blank=True, null=True)


    def __str__(self):
        return self.name

class AIUsage(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='usages')

    tool = models.ForeignKey(AITool, on_delete=models.CASCADE)
    input_text = models.TextField()
    output_text = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.name} - {self.tool.name} at {self.created_at}"

class Subscription(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    plan_name = models.CharField(max_length=50)
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.name} - {self.plan_name}"



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


class UserFavorite(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='favorites')
    tool = models.ForeignKey(AITool, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'tool']  # Prevent duplicate favorites
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.tool.name}"


class BlogPost(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='blog_posts')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    image = models.ImageField(upload_to='blog', blank=True, null=True)
    excerpt = models.TextField(max_length=500, blank=True, null=True)
    is_published = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    @property
    def like_count(self):
        return self.likes.count()

    @property
    def comment_count(self):
        return self.comments.count()


class BlogLike(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='blog_likes')
    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'post']  # Prevent duplicate likes
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} liked {self.post.title}"


class BlogComment(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='blog_comments')
    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} commented on {self.post.title}"



