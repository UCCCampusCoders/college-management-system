from http import HTTPStatus
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
import time
from college.core.logging_config import request_logger

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        client_host = request.client.host if request.client else "unknown"
        
        # Process the request and get the response
        response: Response = await call_next(request)
        
        process_time = round((time.time() - start_time) * 1000, 2)  # in ms
        status_code = response.status_code
        status_message = HTTPStatus(status_code).phrase if status_code in HTTPStatus._value2member_map_ else "Unknown Status"

        request_logger.info(
            f"{request.method} {request.url.path} from {client_host} "
            f"=> {status_code} {status_message} [{process_time}ms]"
        )

        return response