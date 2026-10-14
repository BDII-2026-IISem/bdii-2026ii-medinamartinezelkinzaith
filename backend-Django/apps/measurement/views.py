from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.measurement.models import Measurement
from apps.measurement.serializers import MeasurementSerializer
from apps.security.permissions import HasResourceAccess


class MeasurementViewSet(viewsets.ModelViewSet):
    queryset = Measurement.objects.select_related("client", "trainer")
    serializer_class = MeasurementSerializer
    permission_classes = [IsAuthenticated, HasResourceAccess]
    lookup_value_converter = "int"