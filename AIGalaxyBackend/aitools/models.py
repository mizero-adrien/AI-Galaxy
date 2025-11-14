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



