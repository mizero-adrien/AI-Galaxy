from rest_framework.authentication import SessionAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    Session authentication that exempts CSRF checks.
    Used for API endpoints where CORS handles security.
    """
    def enforce_csrf(self, request):
        # Skip CSRF check for API endpoints
        return

