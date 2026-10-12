from rest_framework.routers import SimpleRouter

from apps.plan.views import PlanViewSet

router = SimpleRouter(use_regex_path=False)
router.register("plans", PlanViewSet, basename="plan")

urlpatterns = router.urls