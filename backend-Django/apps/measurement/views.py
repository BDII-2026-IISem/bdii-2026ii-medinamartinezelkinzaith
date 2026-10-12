from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from apps.measurement.models import Measurement
from apps.measurement.serializers import MeasurementSerializer


class MeasurementViewSet(viewsets.ModelViewSet):
    queryset = Measurement.objects.select_related("client", "trainer")
    serializer_class = MeasurementSerializer
    permission_classes = [AllowAny]
    lookup_value_converter = "int"