from django.db import models


class MembershipQuerySet(models.QuerySet):
    pass


class MembershipManager(models.Manager.from_queryset(MembershipQuerySet)):
    pass