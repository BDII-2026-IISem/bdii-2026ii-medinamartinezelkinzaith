from rest_framework.routers import SimpleRouter

from apps.measurement.views import MeasurementViewSet

router = SimpleRouter(use_regex_path=False)
router.register("measurements", MeasurementViewSet, basename="measurement")

urlpatterns = router.urls