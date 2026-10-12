from django.urls import path

from apps.membership.views import ActiveMembershipListAPIView

urlpatterns = [
    path(
        "memberships/active/",
        ActiveMembershipListAPIView.as_view(),
        name="membership-active",
    ),
]