import json

from rest_framework import status
from rest_framework.test import APITestCase

from apps.client.models import Client
from apps.common.status import RecordStatus


class ClientApiTests(APITestCase):
    def test_create_defaults_and_persists(self):
        response = self.client.post(
            "/api/clients/",
            {
                "document_type": "CC",
                "document_number": "1234567890",
                "name": "María García",
                "email": "Maria@Example.com",
                "phone": "3001234567",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], RecordStatus.INACTIVE)
        self.assertEqual(response.data["email"], "maria@example.com")
        wire = json.loads(response.content)
        self.assertIn("createdAt", wire)
        self.assertNotIn("created_at", wire)
        stored = Client.objects.get(pk=response.data["id"])
        self.assertEqual(stored.name, "María García")

    def test_invalid_name_and_duplicate_email(self):
        invalid = self.client.post(
            "/api/clients/",
            {
                "document_type": "CC",
                "document_number": "1111111111",
                "name": "A",
                "email": "a@example.com",
            },
            format="json",
        )
        self.assertEqual(invalid.status_code, status.HTTP_400_BAD_REQUEST)
        self.client.post(
            "/api/clients/",
            {
                "document_type": "CC",
                "document_number": "2222222222",
                "name": "Ana Ruiz",
                "email": "ana@example.com",
            },
            format="json",
        )
        duplicate = self.client.post(
            "/api/clients/",
            {
                "document_type": "CC",
                "document_number": "3333333333",
                "name": "Otra Ana",
                "email": "ana@example.com",
            },
            format="json",
        )
        self.assertEqual(duplicate.status_code, status.HTTP_400_BAD_REQUEST)

    def test_soft_delete_keeps_the_row(self):
        created = self.client.post(
            "/api/clients/",
            {
                "document_type": "CC",
                "document_number": "4444444444",
                "name": "Pedro León",
                "email": "pedro@example.com",
            },
            format="json",
        )
        deleted = self.client.delete(f"/api/clients/{created.data['id']}/")
        self.assertEqual(deleted.status_code, status.HTTP_204_NO_CONTENT)
        stored = Client.objects.get(pk=created.data["id"])
        self.assertEqual(stored.status, RecordStatus.INACTIVE)
        self.assertEqual(Client.objects.count(), 1)

    def test_list_retrieve_and_update(self):
        created = self.client.post(
            "/api/clients/",
            {
                "document_type": "CC",
                "document_number": "5555555555",
                "name": "Luisa Mora",
                "email": "luisa@example.com",
                "phone": "111",
            },
            format="json",
        )
        pk = created.data["id"]
        listed = self.client.get("/api/clients/")
        self.assertEqual(listed.status_code, status.HTTP_200_OK)
        detail = self.client.get(f"/api/clients/{pk}/")
        self.assertEqual(detail.status_code, status.HTTP_200_OK)
        self.assertEqual(detail.data["name"], "Luisa Mora")
        updated = self.client.patch(
            f"/api/clients/{pk}/",
            {"phone": "222", "status": "active"},
            format="json",
        )
        self.assertEqual(updated.status_code, status.HTTP_200_OK)
        self.assertEqual(updated.data["status"], "active")