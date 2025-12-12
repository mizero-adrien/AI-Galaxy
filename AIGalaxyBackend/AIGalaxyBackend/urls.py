"""
URL configuration for AIGalaxyBackend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

@require_http_methods(["GET"])
def api_root(request):
    """Simple API root endpoint"""
    return JsonResponse({
        'message': 'AI Galaxy Backend API',
        'version': '1.0.0',
        'endpoints': {
            'admin': '/admin/',
            'api_root': '/api/',
            'categories': '/api/categories/',
            'ai_tools': '/api/ai-tools/',
            'users': '/api/users/',
            'contact': '/api/contact/',
            'favorites': '/api/favorites/',
            'blog_posts': '/api/blog/posts/',
        }
    })

urlpatterns = [
    path('', api_root, name='api_root'),
    path('admin/', admin.site.urls),
    path('api/', include('aitools.urls')),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
