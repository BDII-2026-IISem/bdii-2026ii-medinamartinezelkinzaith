from rest_framework.test import APITestCase

from apps.common.status import RecordStatus
from apps.trainer.models import Trainer


class TrainerApiTests(APITestCase):
    def test_crud_and_soft_delete(self):
        created = self.client.post(
            "/api/trainers/",
            {"name": "Carlos Ruiz", "email": "Carlos@Example.com", "specialty": "Fuerza"},
            format="json",
        )
        self.assertEqual(created.status_code, 201)
        self.assertEqual(created.data["status"], RecordStatus.INACTIVE)
        self.assertEqual(created.data["email"], "carlos@example.com")
        pk = created.data["id"]
        detail = self.client.get(f"/api/trainers/{pk}/")
        self.assertEqual(detail.status_code, 200)
        updated = self.client.patch(f"/api/trainers/{pk}/", {"status": "active"}, format="json")
        self.assertEqual(updated.status_code, 200)
        deleted = self.client.delete(f"/api/trainers/{pk}/")
        self.assertEqual(deleted.status_code, 204)
        self.assertEqual(Trainer.objects.get(pk=pk).status, RecordStatus.INACTIVE)