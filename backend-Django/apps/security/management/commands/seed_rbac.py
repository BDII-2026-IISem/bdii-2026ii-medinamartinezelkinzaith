from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.urls import resolve

from apps.common.status import RecordStatus
from apps.security.models import Resource, ResourceRole, Role, RoleUser, User

CRUD_COLLECTIONS = (
    "clients",
    "trainers",
    "plans",
    "exercises",
    "routines",
    "routine-exercises",
    "measurements",
    "attendances",
    "users",
    "roles",
    "role-users",
    "resources",
    "resource-roles",
)


def build_samples():
    samples = []
    for name in CRUD_COLLECTIONS:
        samples.append(("GET", f"/api/{name}/"))
        samples.append(("POST", f"/api/{name}/"))
        for method in ("GET", "PUT", "PATCH", "DELETE"):
            samples.append((method, f"/api/{name}/1/"))
    samples += [
        ("GET", "/api/memberships/active/"),
        ("GET", "/api/memberships/"),
        ("POST", "/api/memberships/"),
        ("GET", "/api/memberships/1/"),
        ("DELETE", "/api/memberships/1/"),
    ]
    return samples


def activate(instance):
    if instance.status != RecordStatus.ACTIVE:
        instance.status = RecordStatus.ACTIVE
        instance.save(update_fields=["status", "updated_at"])


class Command(BaseCommand):
    help = "Carga los recursos RBAC desde las rutas reales y los concede al rol admin."

    def add_arguments(self, parser):
        parser.add_argument(
            "--username",
            help="Usuario al que se le asigna el rol admin.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        username = options.get("username")
        user = None
        if username:
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist as exc:
                raise CommandError(f"No existe el usuario '{username}'.") from exc
            if user.status != RecordStatus.ACTIVE:
                self.stderr.write(
                    self.style.WARNING(
                        f"El usuario '{username}' no está active: no podrá iniciar sesión."
                    )
                )

        role, _created = Role.objects.get_or_create(
            name="admin",
            defaults={
                "description": "Administrador de ActivaFit",
                "status": RecordStatus.ACTIVE,
            },
        )
        activate(role)

        created_resources = 0
        created_grants = 0

        for method, path in build_samples():
            route = resolve(path).route
            resource, resource_created = Resource.objects.get_or_create(
                method=method,
                route=route,
                defaults={"name": f"{method} {route}", "status": RecordStatus.ACTIVE},
            )
            if resource_created:
                created_resources += 1
            activate(resource)
            grant, grant_created = ResourceRole.objects.get_or_create(
                resource=resource,
                role=role,
                defaults={"status": RecordStatus.ACTIVE},
            )
            if grant_created:
                created_grants += 1
            activate(grant)

        if user is not None:
            link, _created = RoleUser.objects.get_or_create(
                role=role,
                user=user,
                defaults={"status": RecordStatus.ACTIVE},
            )
            activate(link)

        self.stdout.write(
            self.style.SUCCESS(
                "Recursos RBAC sincronizados. "
                f"Recursos nuevos: {created_resources}. "
                f"Permisos nuevos: {created_grants}."
            )
        )