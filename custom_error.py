import json

from flask import make_response
from werkzeug.exceptions import HTTPException


class DataError(HTTPException):
    def __init__(self, status_code):
        self.response = make_response('', status_code)


class LogicError(HTTPException):
    def __init__(self, status_code, error_code, error_msg):
        msg = {"error_code": error_code, "error_message": error_msg}
        self.response = make_response(json.dumps(msg), status_code)
