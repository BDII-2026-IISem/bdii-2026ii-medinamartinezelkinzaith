from apps.common.views import CatalogViewSet
from apps.trainer.models import Trainer
from apps.trainer.serializers import TrainerSerializer


class TrainerViewSet(CatalogViewSet):
    queryset = Trainer.objects.all()
    serializer_class = TrainerSerializer