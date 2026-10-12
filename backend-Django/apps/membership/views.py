from django.utils import timezone
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.status import RecordStatus
from apps.membership.models import Membership
from apps.membership.serializers import MembershipRegisterSerializer, MembershipSerializer


class ActiveMembershipListAPIView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = MembershipSerializer

    def get_queryset(self):
        today = timezone.localdate()
        return (
            Membership.objects.select_related("client", "plan")
            .prefetch_related("payments")
            .filter(
                status=RecordStatus.ACTIVE,
                client__status=RecordStatus.ACTIVE,
                plan__status=RecordStatus.ACTIVE,
                start_date__lte=today,
                end_date__gte=today,
            )
        )


class MembershipRegisterAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = MembershipRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        membership = serializer.save()
        membership = Membership.objects.select_related("client", "plan").prefetch_related(
            "payments"
        ).get(pk=membership.pk)
        return Response(MembershipSerializer(membership).data, status=status.HTTP_201_CREATED)


class MembershipCollectionAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        handler = MembershipRegisterAPIView()
        handler.request = request
        handler.format_kwarg = None
        handler.args = ()
        handler.kwargs = {}
        return handler.post(request)