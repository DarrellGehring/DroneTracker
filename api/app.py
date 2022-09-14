from flask import Flask, request, Response, jsonify
from flask_cors import CORS
from log_helper import add_positions, get_positions, get_logs
from util import DatetimeEncoder

app = Flask(__name__)
app.json_encoder = DatetimeEncoder
CORS(app)

@app.route('/position', methods=['POST', 'GET'])
def handle_position():
    if request.method == 'POST':
        positions = request.json
        result = add_positions(positions)
        return(result)
    if request.method == 'GET':
        args = request.args
        robotid = args.get('robotid', None)
        start = args.get('start', None)
        end = args.get('end', None)
        if robotid and start and end:
            response = get_positions(robotid, start, end)
            return jsonify(response)
        else:
            return Response("Missing one or more required arguments", status=400, mimetype='application/json')

@app.route('/log', methods=['GET'])
def handle_log():
    if request.method == 'GET':
        args = request.args
        response = get_logs(args)
        return jsonify(response)