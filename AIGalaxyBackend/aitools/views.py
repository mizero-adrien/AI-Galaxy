from django.shortcuts import render

# Create your views here.
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import login
from rest_framework import viewsets, status
from .models import CustomUser, AITool, AIUsage, Subscription, Donation,Category, ContactMessage
from .serializers import UserSerializer, UserSignUpSerializer, UserLoginSerializer, AIToolSerializer,AIUsageSerializer,SubscriptionSerializer,DonationSerializer,CategorySerializer, ContactMessageSerializer


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
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]  # public access
    lookup_field = 'slug'

    # Optional: Custom action to list all tools in a category
    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def tools(self, request, pk=None):
        """List all AI tools under a specific category"""
        category = self.get_object()
        tools = category.tools.all()  # uses related_name='tools' in AITool
        from .serializers import AIToolSerializer
        serializer = AIToolSerializer(tools, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
#ai tools views
class AiToolViewSet(viewsets.ModelViewSet):
    queryset = AITool.objects.all().order_by('-created_at')
    serializer_class = AIToolSerializer
    permission_classes = [AllowAny]

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
        serializer.save(user= self.request.user)

    @action(detail=False, methods=['get'],permission_classes=[IsAuthenticated])
    def my_donation(self,request):
        donations = Donation.objects.filter(user=request.user)
        serializer = self.get_serializer(donations, many=True)
        return Response(serializer.data)