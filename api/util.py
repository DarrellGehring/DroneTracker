import json
from datetime import datetime

class DatetimeEncoder(json.JSONEncoder):
    def default(self, obj):
        try:
            return super().default(obj)
        except TypeError:
            if type(obj) == datetime:
                return obj.isoformat()
            return str(obj)