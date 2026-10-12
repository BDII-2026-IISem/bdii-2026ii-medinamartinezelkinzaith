from django.urls import path

from apps.membership.views import ActiveMembershipListAPIView, MembershipCollectionAPIView

urlpatterns = [
    path(
        "memberships/active/",
        ActiveMembershipListAPIView.as_view(),
        name="membership-active",
    ),
    path("memberships/", MembershipCollectionAPIView.as_view(), name="membership-collection"),
]