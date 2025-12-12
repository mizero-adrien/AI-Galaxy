from django.contrib import admin
from django.utils.html import format_html
from .models import (
    CustomUser, Category, AITool, AIUsage, Subscription, Donation, ContactMessage,
    ToolModel, ToolRating, UserFavorite, NewsletterSubscriber, ToolSubmission,
    BlogPost, Comment
)


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('email', 'username', 'is_premium', 'is_staff', 'is_active')
    search_fields = ('email', 'username')
    list_filter = ('is_premium', 'is_staff', 'is_active')
    ordering = ('email',)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}  # auto-generate slug from name


class ToolModelInline(admin.TabularInline):
    model = ToolModel
    extra = 1
    fields = ('name', 'description')


@admin.register(AITool)
class AIToolAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'is_premium', 'is_popular', 'is_free', 'affiliate', 'link', 'created_at')
    list_filter = ('category', 'is_premium', 'is_popular', 'is_free', 'affiliate')
    search_fields = ('name', 'description')
    ordering = ('-created_at',)
    readonly_fields = ('preview_image',)
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'category', 'description', 'image', 'preview_image', 'link')
        }),
        ('Status & Settings', {
            'fields': ('is_premium', 'is_popular', 'is_free', 'affiliate')
        }),
        ('Additional Information', {
            'fields': ('features', 'how_it_works'),
            'classes': ('wide',)
        }),
    )
    inlines = [ToolModelInline]

    def preview_image(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="100" style="max-height: 100px; object-fit: cover;" />', obj.image.url)
        return "No image"
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
    list_display = ("firstName", "lastName", "email", "country", "is_human", "message", "created_at",)
    list_filter = ("is_human", "country", "created_at")
    search_fields = ("firstName", "lastName", "email", "message")
    readonly_fields = ("created_at",)


@admin.register(ToolModel)
class ToolModelAdmin(admin.ModelAdmin):
    list_display = ('tool', 'name', 'description', 'created_at')
    list_filter = ('tool', 'created_at')
    search_fields = ('tool__name', 'name', 'description')
    ordering = ('tool', 'name')


@admin.register(ToolRating)
class ToolRatingAdmin(admin.ModelAdmin):
    list_display = ('user', 'tool', 'rating', 'created_at', 'updated_at')
    list_filter = ('rating', 'created_at', 'tool')
    search_fields = ('user__email', 'user__username', 'tool__name', 'review')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)


@admin.register(UserFavorite)
class UserFavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'tool', 'created_at')
    list_filter = ('created_at', 'tool')
    search_fields = ('user__email', 'user__username', 'tool__name')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)


@admin.register(NewsletterSubscriber)
class NewsletterSubscriberAdmin(admin.ModelAdmin):
    list_display = ('email', 'subscribed_at', 'is_active')
    list_filter = ('is_active', 'subscribed_at')
    search_fields = ('email',)
    readonly_fields = ('subscribed_at',)
    ordering = ('-subscribed_at',)
    actions = ['activate_subscribers', 'deactivate_subscribers']

    def activate_subscribers(self, request, queryset):
        queryset.update(is_active=True)
        self.message_user(request, f"{queryset.count()} subscribers activated.")
    activate_subscribers.short_description = "Activate selected subscribers"

    def deactivate_subscribers(self, request, queryset):
        queryset.update(is_active=False)
        self.message_user(request, f"{queryset.count()} subscribers deactivated.")
    deactivate_subscribers.short_description = "Deactivate selected subscribers"


@admin.register(ToolSubmission)
class ToolSubmissionAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'status', 'submitted_at', 'reviewed_at', 'reviewed_by', 'preview_image')
    list_filter = ('status', 'submitted_at', 'reviewed_at', 'reviewed_by')
    search_fields = ('name', 'email', 'admin_notes')
    readonly_fields = ('submitted_at', 'reviewed_at', 'preview_image')
    ordering = ('-submitted_at',)
    list_editable = ('status',)  # Allow quick status change from list view
    fieldsets = (
        ('Submission Details', {
            'fields': ('name', 'email', 'image', 'preview_image', 'features', 'how_it_works')
        }),
        ('Review Status', {
            'fields': ('status', 'reviewed_by', 'reviewed_at', 'admin_notes')
        }),
        ('Timestamps', {
            'classes': ('collapse',),
            'fields': ('submitted_at',),
        }),
    )
    actions = ['approve_submissions', 'reject_submissions', 'mark_pending']

    def preview_image(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="100" style="max-height: 100px; object-fit: cover;" />', obj.image)
        return "No image"
    preview_image.short_description = "Preview"

    def approve_submissions(self, request, queryset):
        from django.utils import timezone
        from .models import ToolSubmission
        count = queryset.update(
            status=ToolSubmission.Status.APPROVED, 
            reviewed_by=request.user, 
            reviewed_at=timezone.now()
        )
        self.message_user(request, f"{count} submission(s) approved.")
    approve_submissions.short_description = "Approve selected submissions"

    def reject_submissions(self, request, queryset):
        from django.utils import timezone
        from .models import ToolSubmission
        count = queryset.update(
            status=ToolSubmission.Status.REJECTED, 
            reviewed_by=request.user, 
            reviewed_at=timezone.now()
        )
        self.message_user(request, f"{count} submission(s) rejected.")
    reject_submissions.short_description = "Reject selected submissions"

    def mark_pending(self, request, queryset):
        from .models import ToolSubmission
        count = queryset.update(status=ToolSubmission.Status.PENDING)
        self.message_user(request, f"{count} submission(s) marked as pending.")
    mark_pending.short_description = "Mark selected as pending"


# Optional: Inline to see comments directly inside the Post view
class CommentInline(admin.TabularInline):
    model = Comment
    extra = 0
    readonly_fields = ('author', 'created_at', 'is_reply_display')
    fields = ('author', 'body', 'active', 'parent', 'is_reply_display', 'created_at')
    can_delete = True
    show_change_link = True
    fk_name = 'post'

    def is_reply_display(self, obj):
        return "Yes" if obj.is_reply else "No"
    is_reply_display.short_description = "Is Reply"


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    # What you see in the list view
    list_display = ('title', 'status', 'author', 'published_at', 'total_likes_count', 'comment_count', 'view_count', 'featured')
    
    # Filters sidebar
    list_filter = ('status', 'featured', 'created_at', 'published_at', 'author', 'category_tag')
    
    # Search bar behavior
    search_fields = ('title', 'content', 'excerpt', 'meta_title', 'meta_description')
    
    # Auto-fill slug from title
    prepopulated_fields = {'slug': ('title',)}
    
    # Filter horizontal for many-to-many (better UX)
    filter_horizontal = ('tools_mentioned', 'likes')
    
    # Visual grouping of fields
    fieldsets = (
        ('Main Content', {
            'fields': ('title', 'slug', 'author', 'status', 'published_at', 'featured', 'category_tag')
        }),
        ('The Article', {
            'fields': ('excerpt', 'cover_image', 'preview_image', 'content', 'tools_mentioned')
        }),
        ('Engagement', {
            'fields': ('likes', 'view_count'),
            'classes': ('collapse',)
        }),
        ('SEO Optimization', {
            'classes': ('collapse',), # Makes this section collapsible/hidden by default
            'fields': ('meta_title', 'meta_description'),
            'description': "Fill these out to rank higher on Google."
        }),
        ('Timestamps', {
            'classes': ('collapse',),
            'fields': ('created_at', 'updated_at'),
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at', 'preview_image', 'view_count')
    
    inlines = [CommentInline]

    # Custom column to show likes in the admin list
    def total_likes_count(self, obj):
        return obj.total_likes()
    total_likes_count.short_description = 'Likes'

    def comment_count(self, obj):
        return obj.comments.filter(active=True).count()
    comment_count.short_description = 'Comments'

    def preview_image(self, obj):
        if obj.cover_image:
            return format_html('<img src="{}" width="200" style="max-height: 200px; object-fit: cover;" />', obj.cover_image.url)
        return "No cover image"
    preview_image.short_description = "Cover Image Preview"

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('author').prefetch_related('likes', 'tools_mentioned', 'comments')


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('author', 'post', 'short_body', 'is_reply_display', 'parent', 'active', 'reply_count', 'created_at')
    list_filter = ('active', 'created_at', 'post')
    search_fields = ('author__username', 'author__email', 'body', 'post__title')
    readonly_fields = ('created_at', 'updated_at', 'reply_count_display')
    actions = ['approve_comments', 'hide_comments']
    raw_id_fields = ('parent', 'post', 'author')  # Better for performance with many comments

    fieldsets = (
        ('Comment Details', {
            'fields': ('post', 'author', 'body', 'parent')
        }),
        ('Moderation', {
            'fields': ('active',)
        }),
        ('Threading', {
            'fields': ('reply_count_display',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'classes': ('collapse',),
            'fields': ('created_at', 'updated_at'),
        }),
    )

    def short_body(self, obj):
        return obj.body[:50] + "..." if len(obj.body) > 50 else obj.body
    short_body.short_description = "Comment"

    def is_reply_display(self, obj):
        return "Yes" if obj.is_reply else "No"
    is_reply_display.short_description = "Is Reply"

    def reply_count(self, obj):
        return obj.get_reply_count()
    reply_count.short_description = "Replies"

    def reply_count_display(self, obj):
        return obj.get_reply_count()
    reply_count_display.short_description = "Number of Replies"

    def approve_comments(self, request, queryset):
        queryset.update(active=True)
        self.message_user(request, f"{queryset.count()} comments approved.")
    approve_comments.short_description = "Approve selected comments"
    
    def hide_comments(self, request, queryset):
        queryset.update(active=False)
        self.message_user(request, f"{queryset.count()} comments hidden.")
    hide_comments.short_description = "Hide selected comments"
