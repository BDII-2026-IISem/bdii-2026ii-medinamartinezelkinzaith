from rest_framework.test import APITestCase

from apps.client.models import Client
from apps.measurement.models import Measurement
from apps.trainer.models import Trainer


class MeasurementApiTests(APITestCase):
    def setUp(self):
        self.gym_client = Client.objects.create(
            document_type="CC",
            document_number="1234567890",
            name="Cliente Prueba",
            email="cliente@example.com",
        )
        self.trainer = Trainer.objects.create(name="Entrenador Prueba")

    def test_crud_and_hard_delete(self):
        created = self.client.post(
            "/api/measurements/",
            {
                "clientId": self.gym_client.id,
                "trainerId": self.trainer.id,
                "weight": "70.50",
                "height": "175.00",
                "bodyFat": "18.50",
                "bmi": "23.00",
            },
            format="json",
        )
        self.assertEqual(created.status_code, 201)
        self.assertNotIn("status", created.data)
        pk = created.data["id"]
        detail = self.client.get(f"/api/measurements/{pk}/")
        self.assertEqual(detail.status_code, 200)
        updated = self.client.patch(f"/api/measurements/{pk}/", {"weight": "69.00"}, format="json")
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(updated.data["weight"], "69.00")
        deleted = self.client.delete(f"/api/measurements/{pk}/")
        self.assertEqual(deleted.status_code, 204)
        self.assertEqual(Measurement.objects.count(), 0)