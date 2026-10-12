from datetime import timedelta

from django.utils import timezone
from rest_framework.test import APITestCase

from apps.client.models import Client
from apps.common.status import RecordStatus
from apps.membership.models import Membership
from apps.plan.models import Plan


class MembershipAvailableTests(APITestCase):
    def setUp(self):
        today = timezone.localdate()
        self.client_obj = Client.objects.create(
            document_type="CC",
            document_number="1234567890",
            name="Cliente Prueba",
            email="cliente@example.com",
            status=RecordStatus.ACTIVE,
        )
        self.plan = Plan.objects.create(name="Plan Mensual", status=RecordStatus.ACTIVE)
        self.membership = Membership.objects.create(
            client=self.client_obj,
            plan=self.plan,
            start_date=today - timedelta(days=5),
            end_date=today + timedelta(days=25),
            status=RecordStatus.ACTIVE,
        )

    def test_active_membership_filter(self):
        available = self.client.get("/api/memberships/active/")
        self.assertEqual(available.status_code, 200)
        self.assertEqual(len(available.data), 1)
        self.assertEqual(available.data[0]["id"], self.membership.id)
        Membership.objects.filter(pk=self.membership.pk).update(
            end_date=timezone.localdate() - timedelta(days=1)
        )
        empty = self.client.get("/api/memberships/active/")
        self.assertEqual(empty.status_code, 200)
        self.assertEqual(empty.data, [])
        self.assertEqual(Membership.objects.count(), 1)