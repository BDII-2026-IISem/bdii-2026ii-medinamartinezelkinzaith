import re

from drf_spectacular.utils import extend_schema
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from apps.security.permissions import HasResourceAccess

from apps.common.status import RecordStatus
from apps.common.views import CatalogViewSet
from apps.security.models import Resource, ResourceRole, Role, RoleUser, User
from apps.security.serializers import (
    EffectivePermissionsSerializer,
    ProfileSerializer,
    ResourceRoleSerializer,
    ResourceSerializer,
    RoleSerializer,
    RoleUserSerializer,
    UserSerializer,
)


class ProfileAPIView(RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "patch", "head", "options"]

    def get_object(self):
        return self.request.user


class UserViewSet(CatalogViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def perform_destroy(self, instance):
        instance.status = RecordStatus.INACTIVE
        instance.save(update_fields=["status", "is_active", "updated_at"])


class RoleViewSet(CatalogViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer


class RoleUserViewSet(CatalogViewSet):
    queryset = RoleUser.objects.select_related("role", "user")
    serializer_class = RoleUserSerializer


class ResourceViewSet(CatalogViewSet):
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer


class ResourceRoleViewSet(CatalogViewSet):
    queryset = ResourceRole.objects.select_related("resource", "role")
    serializer_class = ResourceRoleSerializer

def effective_permission_rows(user):
    """Una fila por concesión cuya cadena completa está activa para ese usuario."""
    grants = (
        ResourceRole.objects.filter(
            status=RecordStatus.ACTIVE,
            resource__status=RecordStatus.ACTIVE,
            role__status=RecordStatus.ACTIVE,
            role__assignments__user=user,
            role__assignments__status=RecordStatus.ACTIVE,
        )
        .select_related("resource", "role")
        .order_by("resource__route", "resource__method", "role__name")
    )
    return [
        {
            "method": grant.resource.method,
            "path": to_frontend_path(grant.resource.route),
            "role_id": grant.role_id,
            "role_name": grant.role.name,
        }
        for grant in grants
    ]


class EffectivePermissionsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses=EffectivePermissionsSerializer)
    def get(self, request):
        rows = effective_permission_rows(request.user)
        return Response(EffectivePermissionsSerializer({"permissions": rows}).data)


class UserPermissionsAPIView(APIView):
    permission_classes = [IsAuthenticated, HasResourceAccess]

    @extend_schema(responses=EffectivePermissionsSerializer)
    def get(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        rows = effective_permission_rows(user)
        return Response(EffectivePermissionsSerializer({"permissions": rows}).data)


ROUTE_PARAM = re.compile(r"<(?:\w+:)?(\w+)>")


def to_frontend_path(route):
    path = "/" + route.strip("/")
    return ROUTE_PARAM.sub(
        lambda match: ":id" if match.group(1) == "pk" else f":{match.group(1)}",
        path,
    )

