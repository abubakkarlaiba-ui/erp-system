import logging

from rest_framework.exceptions import (
    APIException,
    AuthenticationFailed,
    NotFound,
    PermissionDenied,
    Throttled,
    ValidationError,
)
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger("apps")


class ERPException(APIException):
    status_code = 400
    default_detail = "An error occurred."
    default_code = "error"

    def __init__(self, detail=None, code=None, status_code=None):
        super().__init__(detail, code)
        if status_code is not None:
            self.status_code = status_code


class BadRequestException(ERPException):
    status_code = 400
    default_detail = "Bad request."
    default_code = "bad_request"


class NotFoundException(ERPException):
    status_code = 404
    default_detail = "Not found."
    default_code = "not_found"


class ForbiddenException(ERPException):
    status_code = 403
    default_detail = "Forbidden."
    default_code = "forbidden"


class ConflictException(ERPException):
    status_code = 409
    default_detail = "Conflict."
    default_code = "conflict"


class custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        error_data = {
            "success": False,
            "error": {
                "status_code": response.status_code,
                "message": _get_error_message(response.data),
                "details": response.data if isinstance(response.data, dict) else {"detail": response.data},
            },
        }
        return Response(error_data, status=response.status_code)

    logger.exception("Unhandled exception: %s", exc)
    return Response(
        {
            "success": False,
            "error": {
                "status_code": 500,
                "message": "Internal server error.",
                "details": {},
            },
        },
        status=500,
    )


def _get_error_message(data):
    if isinstance(data, dict):
        for key in ["detail", "non_field_errors", "error"]:
            if key in data:
                value = data[key]
                if isinstance(value, list):
                    return value[0] if value else "An error occurred."
                return str(value)
        first_key = next(iter(data), None)
        if first_key:
            value = data[first_key]
            if isinstance(value, list):
                return value[0] if value else "An error occurred."
            return str(value)
    if isinstance(data, list):
        return data[0] if data else "An error occurred."
    return str(data) if data else "An error occurred."
