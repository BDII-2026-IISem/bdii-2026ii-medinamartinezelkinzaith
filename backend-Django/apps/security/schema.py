from drf_spectacular.extensions import OpenApiAuthenticationExtension


class ActivaFitJWTScheme(OpenApiAuthenticationExtension):
    target_class = "apps.security.authentication.ActivaFitJWTAuthentication"
    name = "bearerAuth"

    def get_security_definition(self, auto_schema):
        return {"type": "http", "scheme": "bearer", "bearerFormat": "JWT"}