from rest_framework.routers import SimpleRouter

from apps.routine.views import ExerciseViewSet, RoutineExerciseViewSet, RoutineViewSet

router = SimpleRouter(use_regex_path=False)
router.register("exercises", ExerciseViewSet, basename="exercise")
router.register("routines", RoutineViewSet, basename="routine")
router.register("routine-exercises", RoutineExerciseViewSet, basename="routine-exercise")

urlpatterns = router.urls