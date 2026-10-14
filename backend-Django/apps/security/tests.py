from datetime import timedelta 
from django.utils import timezone
from django.core.exceptions import ImproperlyConfigured
from django.test import SimpleTestCase, TestCase 
from django.urls import resolve

from config.database import database_from_environ
from rest_framework import status
from rest_framework.response import Response 
from rest_framework.test import APIRequestFactory, APITestCase, force_authenticate 
from rest_framework.views import APIView
from io import StringIO  
from django.core.management import call_command

from apps.common.status import RecordStatus
from apps.common.testing import PASSWORD, create_active_user, grant, grant_crud
from apps.security.authentication import ActivaFitJWTAuthentication 
from apps.security.models import RefreshToken, Resource, ResourceRole, Role, RoleUser, User
from apps.security.permissions import HasResourceAccess
from apps.security.tokens import hash_token

class DatabaseSelectionTests(SimpleTestCase):
    def _env(self, engine):
        return {
            "DB_ENGINE": engine,
            "POSTGRES_DB": "ActivaFit",
            "POSTGRES_USER": "postgres",
            "POSTGRES_PASSWORD": "1234",
            "POSTGRES_HOST": "172.21.63.86",
            "POSTGRES_PORT": "5432",
            "MYSQL_DB": "ActivaFit",
            "MYSQL_USER": "admin",
            "MYSQL_PASSWORD": "1234",
            "MYSQL_HOST": "172.21.63.86",
            "MYSQL_PORT": "3306",
            "MSSQL_DB": "ActivaFit",
            "MSSQL_USER": "activafit",
            "MSSQL_PASSWORD": "Elkin1234!",
            "MSSQL_HOST": "172.21.63.86",
            "MSSQL_PORT": "1433",
            "ORACLE_DB": "ActivaFit",
            "ORACLE_USER": "activafit",
            "ORACLE_PASSWORD": "Elkin1234!",
            "ORACLE_HOST": "172.21.63.86",
            "ORACLE_PORT": "1521",
            "ORACLE_SERVICE_NAME": "FREEPDB1",
        }

    def test_postgresql_engine(self):
        config = database_from_environ(self._env("postgresql"))
        self.assertEqual(config["default"]["ENGINE"], "django.db.backends.postgresql")

    def test_mysql_engine(self):
        config = database_from_environ(self._env("mysql"))
        self.assertEqual(config["default"]["ENGINE"], "django.db.backends.mysql")
        self.assertEqual(config["default"]["OPTIONS"]["charset"], "utf8mb4")

    def test_mssql_engine(self):
        config = database_from_environ(self._env("mssql"))
        self.assertEqual(config["default"]["ENGINE"], "mssql")

    def test_oracle_uses_service_name(self):
        config = database_from_environ(self._env("oracle"))
        self.assertIn("SERVICE_NAME=FREEPDB1", config["default"]["NAME"])
        self.assertEqual(config["default"]["PORT"], "")

    def test_invalid_engine(self):
        with self.assertRaises(ImproperlyConfigured):
            database_from_environ({"DB_ENGINE": "sqlite"})

    def test_missing_variable(self):
        env = self._env("postgresql")
        env["POSTGRES_DB"] = ""
        with self.assertRaises(ImproperlyConfigured):
            database_from_environ(env)

class AuthFlowTests(APITestCase):
    def setUp(self):
        self.user = create_active_user()

    def test_login_with_username_and_email(self):
        by_username = self.client.post(
            "/api/auth/login/",
            {"username": "ana", "password": PASSWORD},
            format="json",
        )
        self.assertEqual(by_username.status_code, status.HTTP_200_OK)
        self.assertIn("access", by_username.data)
        self.assertIn("refresh", by_username.data)
        self.assertNotIn("password", by_username.data)
        stored = RefreshToken.objects.get()
        self.assertEqual(stored.token_hash, hash_token(by_username.data["refresh"]))

        by_email = self.client.post(
            "/api/auth/login/",
            {"email": "ANA@activafit.test", "password": PASSWORD},
            format="json",
        )
        self.assertEqual(by_email.status_code, status.HTTP_200_OK)

    def test_inactive_user_and_bad_password_are_401(self):
        self.user.status = RecordStatus.INACTIVE
        self.user.save()
        inactive = self.client.post(
            "/api/auth/login/",
            {"username": "ana", "password": PASSWORD},
            format="json",
        )
        self.assertEqual(inactive.status_code, status.HTTP_401_UNAUTHORIZED)

        self.user.status = RecordStatus.ACTIVE
        self.user.save()
        bad = self.client.post(
            "/api/auth/login/",
            {"username": "ana", "password": "otra-clave"},
            format="json",
        )
        self.assertEqual(bad.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(bad.data["detail"], inactive.data["detail"])

    def test_refresh_rotates_and_reuse_revokes_family(self):
        login = self.client.post(
            "/api/auth/login/",
            {"username": "ana", "password": PASSWORD},
            format="json",
        )
        first = login.data["refresh"]
        rotated = self.client.post("/api/auth/refresh/", {"refresh": first}, format="json")
        self.assertEqual(rotated.status_code, status.HTTP_200_OK)
        second = rotated.data["refresh"]
        self.assertNotEqual(first, second)
        reused = self.client.post("/api/auth/refresh/", {"refresh": first}, format="json")
        self.assertEqual(reused.status_code, status.HTTP_401_UNAUTHORIZED)
        after_reuse = self.client.post("/api/auth/refresh/", {"refresh": second}, format="json")
        self.assertEqual(after_reuse.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refresh_expired_or_inactive_user_is_401(self):
        login = self.client.post(
            "/api/auth/login/",
            {"username": "ana", "password": PASSWORD},
            format="json",
        )
        RefreshToken.objects.update(expires_at=timezone.now() - timedelta(seconds=1))
        expired = self.client.post(
            "/api/auth/refresh/", {"refresh": login.data["refresh"]}, format="json"
        )
        self.assertEqual(expired.status_code, status.HTTP_401_UNAUTHORIZED)
        stored = RefreshToken.objects.get()
        self.assertEqual(stored.status, RecordStatus.INACTIVE)
        self.assertIsNone(stored.revoked_at)

        second_login = self.client.post(
            "/api/auth/login/",
            {"username": "ana", "password": PASSWORD},
            format="json",
        )
        self.user.status = RecordStatus.INACTIVE
        self.user.save()
        inactive = self.client.post(
            "/api/auth/refresh/", {"refresh": second_login.data["refresh"]}, format="json"
        )
        self.assertEqual(inactive.status_code, status.HTTP_401_UNAUTHORIZED)
    def test_logout_invalidates_refresh(self):
        login = self.client.post(
            "/api/auth/login/",
            {"username": "ana", "password": PASSWORD},
            format="json",
        )
        raw = login.data["refresh"]
        logout = self.client.post("/api/auth/logout/", {"refresh": raw}, format="json")
        self.assertEqual(logout.status_code, status.HTTP_204_NO_CONTENT)
        again = self.client.post("/api/auth/refresh/", {"refresh": raw}, format="json")
        self.assertEqual(again.status_code, status.HTTP_401_UNAUTHORIZED)
        second_logout = self.client.post("/api/auth/logout/", {"refresh": raw}, format="json")
        self.assertEqual(second_logout.status_code, status.HTTP_204_NO_CONTENT)

    def test_logout_unknown_or_rotated_token_is_401(self):
        unknown = self.client.post(
            "/api/auth/logout/", {"refresh": "no-existe"}, format="json"
        )
        self.assertEqual(unknown.status_code, status.HTTP_401_UNAUTHORIZED)

        login = self.client.post(
            "/api/auth/login/",
            {"username": "ana", "password": PASSWORD},
            format="json",
        )
        first = login.data["refresh"]
        rotated = self.client.post("/api/auth/refresh/", {"refresh": first}, format="json")
        second = rotated.data["refresh"]
        reused_logout = self.client.post("/api/auth/logout/", {"refresh": first}, format="json")
        self.assertEqual(reused_logout.status_code, status.HTTP_401_UNAUTHORIZED)
        after = self.client.post("/api/auth/refresh/", {"refresh": second}, format="json")
        self.assertEqual(after.status_code, status.HTTP_401_UNAUTHORIZED)  

    def test_profile_requires_token_and_rejects_inactive_user(self):
        anonymous = self.client.get("/api/auth/profile/")
        self.assertEqual(anonymous.status_code, status.HTTP_401_UNAUTHORIZED)
        login = self.client.post(
            "/api/auth/login/",
            {"username": "ana", "password": PASSWORD},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
        profile = self.client.get("/api/auth/profile/")
        self.assertEqual(profile.status_code, status.HTTP_200_OK)
        self.assertEqual(profile.data["username"], "ana")
        self.assertNotIn("password", profile.data)
        patched = self.client.patch(
            "/api/auth/profile/",
            {"firstName": "Ana"},
            format="json",
        )
        self.assertEqual(patched.status_code, status.HTTP_200_OK)
        self.assertEqual(patched.data["first_name"], "Ana")
        self.user.status = RecordStatus.INACTIVE
        self.user.save()
        denied = self.client.get("/api/auth/profile/")
        self.assertEqual(denied.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_patch_ignores_username_and_status(self):
        login = self.client.post(
            "/api/auth/login/",
            {"username": "ana", "password": PASSWORD},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
        patched = self.client.patch(
            "/api/auth/profile/",
            {"username": "otro", "status": "inactive", "lastName": "Pérez"},
            format="json",
        )
        self.assertEqual(patched.status_code, status.HTTP_200_OK)
        self.assertEqual(patched.data["username"], "ana")
        self.assertEqual(patched.data["last_name"], "Pérez")
        self.user.refresh_from_db()
        self.assertEqual(self.user.status, RecordStatus.ACTIVE)  

class ProbeView(APIView):
    authentication_classes = [ActivaFitJWTAuthentication]
    permission_classes = [HasResourceAccess]

    def get(self, request, *args, **kwargs):
        return Response({"ok": True})


class HasResourceAccessTests(TestCase):
    def setUp(self):
        self.user = create_active_user(username="recepcion", email="recepcion@activafit.test")
        self.role = Role.objects.create(name="Recepcionista", status=RecordStatus.ACTIVE)
        self.assignment = RoleUser.objects.create(
            role=self.role, user=self.user, status=RecordStatus.ACTIVE
        )
        self.resource = Resource.objects.create(
            name="Listar clientes",
            method="GET",
            route="api/clients/",
            status=RecordStatus.ACTIVE,
        )

    def _grant(self, resource=None):
        return ResourceRole.objects.create(
            resource=resource or self.resource,
            role=self.role,
            status=RecordStatus.ACTIVE,
        )

    def _call(self, path="/api/clients/", method="get", user=None):
        request = getattr(APIRequestFactory(), method)(path)
        request.resolver_match = resolve(path)
        if user is not None:
            force_authenticate(request, user=user)
        return ProbeView.as_view()(request)

    def test_denied_without_grant_and_unauthenticated(self):
        anonymous = self._call()
        self.assertEqual(anonymous.status_code, status.HTTP_401_UNAUTHORIZED)
        no_grant = self._call(user=self.user)
        self.assertEqual(no_grant.status_code, status.HTTP_403_FORBIDDEN)

    def test_grant_allows_get_and_head(self):
        self._grant()
        allowed = self._call(user=self.user)
        self.assertEqual(allowed.status_code, status.HTTP_200_OK)
        head = self._call(method="head", user=self.user)
        self.assertEqual(head.status_code, status.HTTP_200_OK)

    def test_each_inactive_link_returns_403(self):
        grant = self._grant()
        for link in (self.role, self.assignment, grant, self.resource):
            with self.subTest(link=link.__class__.__name__):
                link.status = RecordStatus.INACTIVE
                link.save()
                denied = self._call(user=self.user)
                self.assertEqual(denied.status_code, status.HTTP_403_FORBIDDEN)
                link.status = RecordStatus.ACTIVE
                link.save()
        self.assertEqual(self._call(user=self.user).status_code, status.HTTP_200_OK)

    def test_route_pattern_matches_any_id(self):
        detail = Resource.objects.create(
            name="Detalle de cliente",
            method="GET",
            route="api/clients/<int:pk>/",
            status=RecordStatus.ACTIVE,
        )
        self._grant(detail)
        for path in ("/api/clients/15/", "/api/clients/16/"):
            with self.subTest(path=path):
                response = self._call(path=path, user=self.user)
                self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_options_needs_no_resource(self):
        response = self._call(method="options", user=self.user)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

class SecurityMatrixApiTests(APITestCase):
    NEW_PASSWORD = "Vitalidad-Plan-77"

    def setUp(self):
        self.admin = create_active_user(username="admin_matriz", email="admin@activafit.test")
        for collection in ("users", "roles", "role-users", "resources", "resource-roles"):
            grant_crud(self.admin, f"/api/{collection}/", f"/api/{collection}/1/")
        self.client.force_authenticate(user=self.admin)

    def test_role_crud(self):
        created = self.client.post(
            "/api/roles/",
            {"name": "Recepcion", "description": "Atiende la entrada"},
            format="json",
        )
        self.assertEqual(created.status_code, status.HTTP_201_CREATED)
        self.assertEqual(created.data["status"], RecordStatus.INACTIVE)
        pk = created.data["id"]
        self.assertEqual(self.client.get("/api/roles/").status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.get(f"/api/roles/{pk}/").status_code, status.HTTP_200_OK)
        patched = self.client.patch(f"/api/roles/{pk}/", {"status": "active"}, format="json")
        self.assertEqual(patched.data["status"], RecordStatus.ACTIVE)
        deleted = self.client.delete(f"/api/roles/{pk}/")
        self.assertEqual(deleted.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Role.objects.get(pk=pk).status, RecordStatus.INACTIVE)

    def test_user_role_resource_chain(self):
        role = self.client.post(
            "/api/roles/", {"name": "recepcion", "status": "active"}, format="json"
        )
        self.assertEqual(role.status_code, status.HTTP_201_CREATED)
        user = self.client.post(
            "/api/users/",
            {
                "username": "recep1",
                "email": "recep1@activafit.test",
                "password": self.NEW_PASSWORD,
                "status": "active",
            },
            format="json",
        )
        self.assertEqual(user.status_code, status.HTTP_201_CREATED)
        self.assertNotIn("password", user.data)
        recep = User.objects.get(pk=user.data["id"])

        def clients_as(who):
            self.client.force_authenticate(user=who)
            code = self.client.get("/api/clients/").status_code
            self.client.force_authenticate(user=self.admin)
            return code

        self.assertEqual(clients_as(recep), status.HTTP_403_FORBIDDEN)

        link = self.client.post(
            "/api/role-users/",
            {"roleId": role.data["id"], "userId": user.data["id"], "status": "active"},
            format="json",
        )
        self.assertEqual(link.status_code, status.HTTP_201_CREATED)
        duplicate = self.client.post(
            "/api/role-users/",
            {"roleId": role.data["id"], "userId": user.data["id"], "status": "active"},
            format="json",
        )
        self.assertEqual(duplicate.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(clients_as(recep), status.HTTP_403_FORBIDDEN)

        resource = self.client.post(
            "/api/resources/",
            {
                "name": "Listar clientes",
                "method": "GET",
                "route": "api/clients/",
                "status": "active",
            },
            format="json",
        )
        self.assertEqual(resource.status_code, status.HTTP_201_CREATED)
        self.assertEqual(clients_as(recep), status.HTTP_403_FORBIDDEN)

        grant = self.client.post(
            "/api/resource-roles/",
            {
                "resourceId": resource.data["id"],
                "roleId": role.data["id"],
                "status": "active",
            },
            format="json",
        )
        self.assertEqual(grant.status_code, status.HTTP_201_CREATED)
        self.assertEqual(clients_as(recep), status.HTTP_200_OK)

        self.client.force_authenticate(user=recep)
        denied = self.client.post(
            "/api/clients/",
            {"document_type": "CC", "document_number": "1234567890", "name": "Cliente"},
            format="json",
        )
        self.assertEqual(denied.status_code, status.HTTP_403_FORBIDDEN)

    def test_user_password_is_hashed_hidden_and_soft_deleted(self):
        created = self.client.post(
            "/api/users/",
            {
                "username": "hash1",
                "email": "hash1@activafit.test",
                "password": self.NEW_PASSWORD,
                "status": "active",
            },
            format="json",
        )
        self.assertEqual(created.status_code, status.HTTP_201_CREATED)
        self.assertNotIn("password", created.data)
        pk = created.data["id"]
        stored = User.objects.get(pk=pk)
        self.assertNotEqual(stored.password, self.NEW_PASSWORD)
        self.assertTrue(stored.check_password(self.NEW_PASSWORD))

        weak = self.client.post(
            "/api/users/",
            {"username": "weak1", "email": "weak1@activafit.test", "password": "123"},
            format="json",
        )
        self.assertEqual(weak.status_code, status.HTTP_400_BAD_REQUEST)

        self.client.force_authenticate(user=None)
        login = self.client.post(
            "/api/auth/login/",
            {"username": "hash1", "password": self.NEW_PASSWORD},
            format="json",
        )
        self.assertEqual(login.status_code, status.HTTP_200_OK)

        self.client.force_authenticate(user=self.admin)
        deleted = self.client.delete(f"/api/users/{pk}/")
        self.assertEqual(deleted.status_code, status.HTTP_204_NO_CONTENT)
        stored.refresh_from_db()
        self.assertEqual(stored.status, RecordStatus.INACTIVE)
        self.assertFalse(stored.is_active)

        self.client.force_authenticate(user=None)
        blocked = self.client.post(
            "/api/auth/login/",
            {"username": "hash1", "password": self.NEW_PASSWORD},
            format="json",
        )
        self.assertEqual(blocked.status_code, status.HTTP_401_UNAUTHORIZED)

class SeedRbacTests(APITestCase):
    def test_seed_is_idempotent_and_grants_the_admin_role(self):
        user = create_active_user(username="admin_seed", email="admin_seed@activafit.test")
        call_command("seed_rbac", username="admin_seed", stdout=StringIO())
        first = Resource.objects.count()
        call_command("seed_rbac", username="admin_seed", stdout=StringIO())
        self.assertEqual(Resource.objects.count(), first)
        self.assertTrue(
            Resource.objects.filter(method="GET", route="api/clients/<int:pk>/").exists()
        )
        self.assertFalse(Resource.objects.filter(route__startswith="api/auth/").exists())
        self.assertTrue(
            RoleUser.objects.filter(
                role__name="admin", user=user, status=RecordStatus.ACTIVE
            ).exists()
        )
        self.assertEqual(
            ResourceRole.objects.filter(role__name="admin", status=RecordStatus.ACTIVE).count(),
            first,
        )

        self.client.force_authenticate(user=user)
        self.assertEqual(self.client.get("/api/clients/").status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.get("/api/plans/").status_code, status.HTTP_200_OK)

class RbacTests(APITestCase):
    def setUp(self):
        self.user = create_active_user()
        self.client.force_authenticate(user=self.user)

    def test_missing_grant_is_403_and_missing_identity_is_401(self):
        denied = self.client.get("/api/clients/")
        self.assertEqual(denied.status_code, status.HTTP_403_FORBIDDEN)
        self.client.force_authenticate(user=None)
        anonymous = self.client.get("/api/clients/")
        self.assertEqual(anonymous.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_any_inactive_link_denies(self):
        role = grant(self.user, "GET", "/api/clients/")
        self.assertEqual(self.client.get("/api/clients/").status_code, status.HTTP_200_OK)
        links = [
            role,
            RoleUser.objects.get(role=role, user=self.user),
            ResourceRole.objects.get(role=role),
            Resource.objects.get(method="GET", route="api/clients/"),
        ]
        for link in links:
            with self.subTest(link=link.__class__.__name__):
                link.status = RecordStatus.INACTIVE
                link.save(update_fields=["status", "updated_at"])
                denied = self.client.get("/api/clients/")
                self.assertEqual(denied.status_code, status.HTTP_403_FORBIDDEN)
                link.status = RecordStatus.ACTIVE
                link.save(update_fields=["status", "updated_at"])
        self.assertEqual(self.client.get("/api/clients/").status_code, status.HTTP_200_OK)

    def test_invalid_jwt_and_inactive_user_with_valid_jwt_are_401(self):
        self.client.force_authenticate(user=None)
        login = self.client.post(
            "/api/auth/login/",
            {"username": "ana", "password": PASSWORD},
            format="json",
        )
        self.assertEqual(login.status_code, status.HTTP_200_OK)

        self.client.credentials(HTTP_AUTHORIZATION="Bearer token-invalido")
        invalid = self.client.get("/api/clients/")
        self.assertEqual(invalid.status_code, status.HTTP_401_UNAUTHORIZED)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
        valid_without_grant = self.client.get("/api/clients/")
        self.assertEqual(valid_without_grant.status_code, status.HTTP_403_FORBIDDEN)

        self.user.status = RecordStatus.INACTIVE
        self.user.save()
        inactive = self.client.get("/api/clients/")
