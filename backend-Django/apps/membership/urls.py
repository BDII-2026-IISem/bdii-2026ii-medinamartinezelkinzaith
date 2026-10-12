from django.urls import path
from rest_framework.routers import SimpleRouter

from apps.membership.views import (
    ActiveMembershipListAPIView,
    AttendanceViewSet,
    MembershipCollectionAPIView,
    MembershipReadViewSet,
)

router = SimpleRouter(use_regex_path=False)
router.register("attendances", AttendanceViewSet, basename="attendance")

urlpatterns = [
    path(
        "memberships/active/",
        ActiveMembershipListAPIView.as_view(),
        name="membership-active",
    ),
    path("memberships/", MembershipCollectionAPIView.as_view(), name="membership-collection"),
    path(
        "memberships/<int:pk>/",
        MembershipReadViewSet.as_view({"get": "retrieve", "delete": "destroy"}),
        name="membership-detail",
    ),
]

urlpatterns += router.urls