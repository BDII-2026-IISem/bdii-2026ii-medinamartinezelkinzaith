from django.db.models.deletion import RestrictedError
from rest_framework.test import APITestCase

from apps.client.models import Client
from apps.common.status import RecordStatus
from apps.common.testing import create_active_user, grant_crud
from apps.routine.models import Exercise
from apps.trainer.models import Trainer


class RoutineApiTests(APITestCase):
    def setUp(self):
        self.user = create_active_user()
        grant_crud(self.user, "/api/exercises/", "/api/exercises/1/")
        grant_crud(self.user, "/api/routines/", "/api/routines/1/")
        grant_crud(self.user, "/api/routine-exercises/", "/api/routine-exercises/1/")
        self.client.force_authenticate(user=self.user)
        self.gym_client = Client.objects.create(
            document_type="CC",
            document_number="1234567890",
            name="Cliente Prueba",
            email="cliente@example.com",
        )
        self.trainer = Trainer.objects.create(name="Entrenador Prueba")

    def test_exercise_crud_and_duplicate(self):
        payload = {"name": "Sentadilla", "muscleGroup": "Piernas"}
        created = self.client.post("/api/exercises/", payload, format="json")
        self.assertEqual(created.status_code, 201)
        self.assertEqual(created.data["status"], RecordStatus.INACTIVE)
        duplicate = self.client.post("/api/exercises/", payload, format="json")
        self.assertEqual(duplicate.status_code, 400)
        pk = created.data["id"]
        deleted = self.client.delete(f"/api/exercises/{pk}/")
        self.assertEqual(deleted.status_code, 204)
        self.assertEqual(Exercise.objects.get(pk=pk).status, RecordStatus.INACTIVE)

    def test_routine_with_lines_and_restriction(self):
        routine = self.client.post(
            "/api/routines/",
            {
                "trainerId": self.trainer.id,
                "clientId": self.gym_client.id,
                "name": "Rutina A",
            },
            format="json",
        )
        self.assertEqual(routine.status_code, 201)
        self.assertEqual(routine.data["status"], RecordStatus.INACTIVE)
        exercise = Exercise.objects.create(name="Press de banca", muscle_group="Pecho")
        line = self.client.post(
            "/api/routine-exercises/",
            {
                "routineId": routine.data["id"],
                "exerciseId": exercise.id,
                "sets": 3,
                "repetitions": 12,
                "name": "Press de banca",
                "muscleGroup": "Pecho",
            },
            format="json",
        )
        self.assertEqual(line.status_code, 201)
        self.assertEqual(line.data["sets"], 3)
        with self.assertRaises(RestrictedError):
            self.trainer.delete()

    def test_invalid_foreign_key(self):
        response = self.client.post(
            "/api/routines/",
            {"trainerId": 9999, "clientId": self.gym_client.id, "name": "Rutina B"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)