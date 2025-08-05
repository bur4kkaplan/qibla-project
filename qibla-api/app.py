from flask import Flask, request, jsonify
from flask_cors import CORS
from geopy.distance import geodesic
from math import atan, degrees
import os

app = Flask(__name__)

CORS(app, origins=["https://qibla.bur4kkaplan.com", "https://www.qibla.bur4kkaplan.com"])

kaaba_coords = (21.4225, 39.8262)

@app.route("/api/ping")
def ping():
    return "pong", 200

@app.route("/qibla")
def qibla():
    try:
        lat = float(request.args.get("lat"))
        lon = float(request.args.get("lon"))
        acc = float(request.args.get("acc", 5))
    except:
        return jsonify({"error": "Geçersiz lat/lon/acc"}), 400

    user_coords = (lat, lon)

    def calculate_initial_compass_bearing(pointA, pointB):
        import math
        lat1 = math.radians(pointA[0])
        lat2 = math.radians(pointB[0])
        diffLong = math.radians(pointB[1] - pointA[1])

        x = math.sin(diffLong) * math.cos(lat2)
        y = math.cos(lat1) * math.sin(lat2) - (
            math.sin(lat1) * math.cos(lat2) * math.cos(diffLong)
        )

        initial_bearing = math.atan2(x, y)
        initial_bearing = math.degrees(initial_bearing)
        compass_bearing = (initial_bearing + 360) % 360

        return compass_bearing

    qibla_angle = calculate_initial_compass_bearing(user_coords, kaaba_coords)
    distance = geodesic(user_coords, kaaba_coords).meters
    angle_error_deg = degrees(atan(acc / distance))

    max_error_threshold = 10.0
    confidence = max(0.0, min(1.0, 1 - (angle_error_deg / max_error_threshold))) * 100

    return jsonify({
        "qibla": round(qibla_angle, 2),
        "error": round(angle_error_deg, 2),
        "confidence": round(confidence, 2)
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
