from apps.common.views import CatalogViewSet
from apps.plan.models import Plan
from apps.plan.serializers import PlanSerializer


class PlanViewSet(CatalogViewSet):
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer