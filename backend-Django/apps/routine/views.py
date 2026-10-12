from apps.common.views import CatalogViewSet
from apps.routine.models import Exercise, Routine, RoutineExercise
from apps.routine.serializers import (
    ExerciseSerializer,
    RoutineExerciseSerializer,
    RoutineSerializer,
)


class ExerciseViewSet(CatalogViewSet):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer


class RoutineViewSet(CatalogViewSet):
    queryset = Routine.objects.select_related("trainer", "client")
    serializer_class = RoutineSerializer


class RoutineExerciseViewSet(CatalogViewSet):
    queryset = RoutineExercise.objects.select_related("routine", "exercise")
    serializer_class = RoutineExerciseSerializer