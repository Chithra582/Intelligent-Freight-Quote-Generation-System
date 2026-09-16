import uuid
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import APIException


class BusinessLogicException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_code = 'BUSINESS_RULE_VIOLATION'
    default_detail = 'A business rule constraint was violated.'

    def __init__(self, detail=None, code=None, status_code=None, details=None):
        if status_code:
            self.status_code = status_code
        if code:
            self.default_code = code
        self.details = details or []
        super().__init__(detail=detail or self.default_detail, code=self.default_code)


class MarginFloorBreachException(BusinessLogicException):
    status_code = status.HTTP_409_CONFLICT
    default_code = 'QUOTE_BELOW_MARGIN_FLOOR'
    default_detail = 'Submitted margin percentage is strictly below the mandatory lane margin floor.'


class LaneUnservicedException(BusinessLogicException):
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    default_code = 'PORT_PAIR_UNSERVICED'
    default_detail = 'No active carrier routing or transshipment corridor services this origin/destination pair.'


class RateCardExpiredException(BusinessLogicException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_code = 'RATE_CARD_EXPIRED'
    default_detail = 'The referenced carrier rate card validity period has lapsed.'


def custom_exception_handler(exc, context):
    """Formats all API exceptions into the standardized enterprise error envelope."""
    response = exception_handler(exc, context)
    request_id = str(uuid.uuid4())

    if response is not None:
        code = getattr(exc, 'default_code', 'API_ERROR')
        if hasattr(exc, 'get_codes'):
            c = exc.get_codes()
            if isinstance(c, str):
                code = c
            elif isinstance(c, dict):
                code = 'VALIDATION_ERROR'

        if hasattr(exc, 'detail'):
            if isinstance(exc.detail, dict):
                first_val = next(iter(exc.detail.values()), '')
                if isinstance(first_val, list) and len(first_val) > 0:
                    message = str(first_val[0])
                else:
                    message = str(first_val)
            elif isinstance(exc.detail, list) and len(exc.detail) > 0:
                message = str(exc.detail[0])
            else:
                message = str(exc.detail)
        else:
            message = str(exc)

        details = []

        if isinstance(response.data, dict):
            for k, v in response.data.items():
                if k not in ('detail', 'code'):
                    details.append({'field': k, 'message': v if isinstance(v, list) else [str(v)]})

        elif isinstance(response.data, list):
            details = [{'message': item} for item in response.data]

        response.data = {
            'success': False,
            'error': {
                'code': code.upper() if isinstance(code, str) else 'VALIDATION_ERROR',
                'message': message,
                'details': details,
                'request_id': request_id
            }
        }
    else:
        # Unhandled Python Exceptions (500)
        response = Response(
            {
                'success': False,
                'error': {
                    'code': 'INTERNAL_SERVER_ERROR',
                    'message': 'An unexpected error occurred during processing.',
                    'details': [{'error': str(exc)}],
                    'request_id': request_id
                }
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return response
