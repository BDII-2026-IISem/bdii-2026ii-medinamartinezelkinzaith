from rest_framework.test import APITestCase

from apps.common.status import RecordStatus
from apps.common.testing import create_active_user, grant_crud
from apps.plan.models import Plan


class PlanApiTests(APITestCase):
    def setUp(self):
        self.user = create_active_user()
        grant_crud(self.user, "/api/plans/", "/api/plans/1/")
        self.client.force_authenticate(user=self.user)
            
    def test_crud_and_soft_delete(self):
        created = self.client.post(
            "/api/plans/",
            {"name": "Plan Mensual", "description": "Acceso mensual"},
            format="json",
        )
        self.assertEqual(created.status_code, 201)
        self.assertEqual(created.data["status"], RecordStatus.INACTIVE)
        pk = created.data["id"]
        self.assertEqual(self.client.get("/api/plans/").status_code, 200)
        detail = self.client.get(f"/api/plans/{pk}/")
        self.assertEqual(detail.data["name"], "Plan Mensual")
        updated = self.client.patch(f"/api/plans/{pk}/", {"status": "active"}, format="json")
        self.assertEqual(updated.status_code, 200)
        deleted = self.client.delete(f"/api/plans/{pk}/")
        self.assertEqual(deleted.status_code, 204)
        self.assertEqual(Plan.objects.get(pk=pk).status, RecordStatus.INACTIVE)

    def test_duplicate_name(self):
        payload = {"name": "Plan Trimestral"}
        first = self.client.post("/api/plans/", payload, format="json")
        second = self.client.post("/api/plans/", payload, format="json")
        self.assertEqual(first.status_code, 201)
        self.assertEqual(second.status_code, 400)
        self.assertEqual(Plan.objects.count(), 1)