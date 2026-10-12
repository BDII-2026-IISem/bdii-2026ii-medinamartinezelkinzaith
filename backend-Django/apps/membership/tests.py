from datetime import timedelta

from django.utils import timezone
from rest_framework.test import APITestCase

from apps.client.models import Client
from apps.common.status import RecordStatus
from unittest.mock import patch  
from apps.membership.models import Attendance, Membership, Payment
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

class MembershipRegisterTests(APITestCase):
    def setUp(self):
        self.buyer = Client.objects.create(
            document_type="CC",
            document_number="9876543210",
            name="Comprador",
            email="comprador@example.com",
            status=RecordStatus.ACTIVE,
        )
        self.plan = Plan.objects.create(name="Plan Mensual", status=RecordStatus.ACTIVE)

    def _payload(self, payments, start_date=None, end_date=None):
        today = timezone.localdate()
        return {
            "clientId": self.buyer.id,
            "planId": self.plan.id,
            "startDate": (start_date or today).isoformat(),
            "endDate": (end_date or today + timedelta(days=30)).isoformat(),
            "payments": payments,
        }

    def test_register_creates_membership_and_payments(self):
        response = self.client.post(
            "/api/memberships/",
            self._payload(
                [
                    {"method": "efectivo", "amount": "50000.00"},
                    {"method": "tarjeta", "amount": "30000.00"},
                ]
            ),
            format="json",
        )
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data["status"], "active")
        self.assertEqual(len(response.data["payments"]), 2)
        self.assertTrue(all(p["status"] == "active" for p in response.data["payments"]))
        self.assertEqual(Membership.objects.count(), 1)
        self.assertEqual(Payment.objects.count(), 2)

    def test_overlapping_dates_are_rejected(self):
        payload = self._payload([{"method": "efectivo", "amount": "50000.00"}])
        first = self.client.post("/api/memberships/", payload, format="json")
        second = self.client.post("/api/memberships/", payload, format="json")
        self.assertEqual(first.status_code, 201)
        self.assertEqual(second.status_code, 400)
        self.assertEqual(Membership.objects.count(), 1)

    def test_payment_failure_rolls_back_the_membership(self):
        with patch.object(Payment, "save", side_effect=RuntimeError("fallo de pago")):
            with self.assertRaises(RuntimeError):
                self.client.post(
                    "/api/memberships/",
                    self._payload([{"method": "efectivo", "amount": "50000.00"}]),
                    format="json",
                )
        self.assertEqual(Membership.objects.count(), 0)
        self.assertEqual(Payment.objects.count(), 0)

    def test_inactive_client_or_plan_is_rejected(self):
        payload = self._payload([{"method": "efectivo", "amount": "50000.00"}])
        self.plan.status = RecordStatus.INACTIVE
        self.plan.save()
        inactive_plan = self.client.post("/api/memberships/", payload, format="json")
        self.assertEqual(inactive_plan.status_code, 400)
        self.plan.status = RecordStatus.ACTIVE
        self.plan.save()
        self.buyer.status = RecordStatus.INACTIVE
        self.buyer.save()
        inactive_client = self.client.post("/api/memberships/", payload, format="json")
        self.assertEqual(inactive_client.status_code, 400)
        self.assertEqual(Membership.objects.count(), 0)

    def test_end_date_before_start_date_is_rejected(self):
        today = timezone.localdate()
        response = self.client.post(
            "/api/memberships/",
            self._payload(
                [{"method": "efectivo", "amount": "50000.00"}],
                start_date=today,
                end_date=today - timedelta(days=1),
            ),
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(Membership.objects.count(), 0)
    def test_detail_includes_payments(self):
        created = self.client.post(
            "/api/memberships/",
            self._payload([{"method": "efectivo", "amount": "50000.00"}]),
            format="json",
        )
        detail = self.client.get(f"/api/memberships/{created.data['id']}/")
        self.assertEqual(detail.status_code, 200)
        self.assertEqual(len(detail.data["payments"]), 1)
        self.assertEqual(detail.data["payments"][0]["amount"], "50000.00")

    def test_list_returns_the_registered_membership(self):
        created = self.client.post(
            "/api/memberships/",
            self._payload([{"method": "efectivo", "amount": "50000.00"}]),
            format="json",
        )
        listed = self.client.get("/api/memberships/")
        self.assertEqual(listed.status_code, 200)
        self.assertTrue(any(row["id"] == created.data["id"] for row in listed.data))

    def test_void_deactivates_once_and_keeps_attendances(self):
        created = self.client.post(
            "/api/memberships/",
            self._payload([{"method": "efectivo", "amount": "50000.00"}]),
            format="json",
        )
        membership_id = created.data["id"]
        Attendance.objects.create(membership_id=membership_id, type="entrada")
        first = self.client.delete(f"/api/memberships/{membership_id}/")
        second = self.client.delete(f"/api/memberships/{membership_id}/")
        self.assertEqual(first.status_code, 204)
        self.assertEqual(second.status_code, 204)
        membership = Membership.objects.get(pk=membership_id)
        self.assertEqual(membership.status, RecordStatus.INACTIVE)
        self.assertEqual(Payment.objects.filter(status=RecordStatus.ACTIVE).count(), 0)
        self.assertEqual(Attendance.objects.count(), 1)

class AttendanceApiTests(APITestCase):
    def setUp(self):
        today = timezone.localdate()
        gym_client = Client.objects.create(
            document_type="CC",
            document_number="1122334455",
            name="Cliente Asistencia",
            email="asistencia@example.com",
            status=RecordStatus.ACTIVE,
        )
        plan = Plan.objects.create(name="Plan Asistencia", status=RecordStatus.ACTIVE)
        self.membership = Membership.objects.create(
            client=gym_client,
            plan=plan,
            start_date=today,
            end_date=today + timedelta(days=30),
            status=RecordStatus.ACTIVE,
        )

    def test_crud_and_hard_delete(self):
        created = self.client.post(
            "/api/attendances/",
            {"membershipId": self.membership.id, "type": "entrada"},
            format="json",
        )
        self.assertEqual(created.status_code, 201)
        pk = created.data["id"]
        detail = self.client.get(f"/api/attendances/{pk}/")
        self.assertEqual(detail.status_code, 200)
        updated = self.client.patch(f"/api/attendances/{pk}/", {"type": "salida"}, format="json")
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(updated.data["type"], "salida")
        deleted = self.client.delete(f"/api/attendances/{pk}/")
        self.assertEqual(deleted.status_code, 204)
        self.assertEqual(Attendance.objects.count(), 0)

    def test_invalid_membership(self):
        response = self.client.post(
            "/api/attendances/",
            {"membershipId": 9999, "type": "entrada"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
