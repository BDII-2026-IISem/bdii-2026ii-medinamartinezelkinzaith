from apps.common.status import RecordStatus
from apps.security.models import User

PASSWORD = "ActivaFit-Test-1"


def create_active_user(username="ana", email="ana@activafit.test", password=PASSWORD):
    return User.objects.create_user(
        username=username,
        email=email,
        password=password,
        status=RecordStatus.ACTIVE,
    )