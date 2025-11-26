from django.contrib import admin
from .models import CustomUser, Category, AITool, AIUsage, Subscription, Donation, ContactMessage, BlogPost, BlogLike, BlogComment


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('email', 'username', 'is_premium', 'is_staff', 'is_active')
    search_fields = ('email', 'username')
    list_filter = ('is_premium', 'is_staff', 'is_active')
    ordering = ('email',)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_popular')
    search_fields = ('name',)
    list_filter = ('is_popular',)
    prepopulated_fields = {'slug': ('name',)}  # auto-generate slug from name


@admin.register(AITool)
class AIToolAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'is_premium','image','link','is_popular','is_free', 'created_at')
    list_filter = ('category', 'is_premium')
    search_fields = ('name', 'description')
    ordering = ('-created_at',)
    readonly_fields = ('preview_image',)

    def preview_image(self, obj):
        if obj.image:
            return f'<img src="{obj.image.url}" width="100" />'
        return "No image"

    preview_image.allow_tags = True
    preview_image.short_description = "Preview"


@admin.register(AIUsage)
class AIUsageAdmin(admin.ModelAdmin):
    list_display = ('user', 'tool', 'created_at')
    search_fields = ('user__email', 'tool__name')
    list_filter = ('tool', 'created_at')


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'plan_name', 'start_date', 'end_date', 'is_active')
    list_filter = ('is_active', 'plan_name')
    search_fields = ('user__email',)


@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ('user', 'amount', 'payment_method', 'completed', 'created_at')
    list_filter = ('payment_method', 'completed')
    search_fields = ('user__email', 'message')
    ordering = ('-created_at',)

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("firstName", "lastName", "email", "country", "is_human","message", "created_at",)
    list_filter = ("is_human", "country", "created_at")
    search_fields = ("firstName", "lastName", "email", "message")
    readonly_fields = ("created_at",)


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'is_published', 'created_at', 'like_count', 'comment_count')
    list_filter = ('is_published', 'created_at')
    search_fields = ('title', 'content', 'author__username', 'author__email')
    readonly_fields = ('created_at', 'updated_at', 'like_count', 'comment_count')
    prepopulated_fields = {'excerpt': ('title',)}

    def like_count(self, obj):
        return obj.like_count
    like_count.short_description = 'Likes'

    def comment_count(self, obj):
        return obj.comment_count
    comment_count.short_description = 'Comments'


@admin.register(BlogLike)
class BlogLikeAdmin(admin.ModelAdmin):
    list_display = ('user', 'post', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'user__email', 'post__title')


@admin.register(BlogComment)
class BlogCommentAdmin(admin.ModelAdmin):
    list_display = ('user', 'post', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('user__username', 'user__email', 'post__title', 'content')
    readonly_fields = ('created_at', 'updated_at')

