from rest_framework.routers import SimpleRouter

from apps.trainer.views import TrainerViewSet

router = SimpleRouter(use_regex_path=False)
router.register("trainers", TrainerViewSet, basename="trainer")

urlpatterns = router.urls