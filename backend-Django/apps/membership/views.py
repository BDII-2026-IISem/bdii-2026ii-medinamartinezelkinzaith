from django.utils import timezone
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny

from apps.common.status import RecordStatus
from apps.membership.models import Membership
from apps.membership.serializers import MembershipSerializer


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