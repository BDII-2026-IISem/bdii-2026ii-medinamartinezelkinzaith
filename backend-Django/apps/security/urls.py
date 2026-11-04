from django.urls import path
from rest_framework.routers import SimpleRouter

from apps.security.auth_views import LoginAPIView, LogoutAPIView, RefreshAPIView
from apps.security.rbac_views import (
    EffectivePermissionsAPIView,
    ProfileAPIView,
    ResourceRoleViewSet,
    ResourceViewSet,
    RoleUserViewSet,
    RoleViewSet,
    UserViewSet,
    UserPermissionsAPIView,
)

router = SimpleRouter(use_regex_path=False)
router.register("users", UserViewSet, basename="user")
router.register("roles", RoleViewSet, basename="role")
router.register("role-users", RoleUserViewSet, basename="role-user")
router.register("resources", ResourceViewSet, basename="resource")
router.register("resource-roles", ResourceRoleViewSet, basename="resource-role")

urlpatterns = [
    path("auth/login/", LoginAPIView.as_view(), name="auth-login"),
    path("auth/refresh/", RefreshAPIView.as_view(), name="auth-refresh"),
    path("auth/logout/", LogoutAPIView.as_view(), name="auth-logout"),
    path("auth/profile/", ProfileAPIView.as_view(), name="auth-profile"),
    path("auth/permissions/", EffectivePermissionsAPIView.as_view(), name="auth-permissions"),
    path("users/<int:pk>/permissions/", UserPermissionsAPIView.as_view(), name="user-permissions"),
]

urlpatterns += router.urls