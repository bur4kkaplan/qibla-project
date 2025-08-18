from flask import Flask, request, jsonify
from flask_cors import CORS
from geopy.distance import geodesic
from math import atan, degrees
from datetime import datetime
import os

# WMM (World Magnetic Model) - opsiyonel güvenli import
try:
    from wmm import wmm_calc
    HAS_WMM = True
except Exception:
    wmm_calc = None
    HAS_WMM = False

app = Flask(__name__)
CORS(app, origins=["https://qibla.bur4kkaplan.com", "https://www.qibla.bur4kkaplan.com"])

kaaba_coords = (21.4225, 39.8262)

def compute_declination_deg(lat: float, lon: float, when: datetime | None = None) -> float | None:
    """
    WMM ile yerel manyetik sapmayı (declination, Doğu +) derece cinsinden hesaplar.
    True = Magnetic + Declination kuralına göre işaret Doğu için pozitiftir.
    WMM kullanılamazsa None döner.
    """
    if not HAS_WMM:
        return None
    if when is None:
        when = datetime.utcnow()
    try:
        model = wmm_calc()
        # Çevreyi ayarla (0 km, deniz seviyesi)
        try:
            # Bazı sürümler liste bekliyor
            model.setup_env([lat], [lon], [0], unit="km", msl=True)
        except Exception:
            # Diğer sürümler skalar kabul edebilir
            model.setup_env(lat, lon, 0, unit="km")
        # Zamanı ayarla (YYYY,MM,DD)
        try:
            model.setup_time(when.year, when.month, when.day)
        except Exception:
            # Fallback: kesirli yıl
            y = when.year
            start = datetime(y, 1, 1)
            doy = (when - start).days + (when - start).seconds/86400 + 1
            dyear = y + (doy / 365.2425)
            model.setup_time(dyear)
        res = model.get_all()
        # Bazı sürümlerde dizi döner
        dec = res.get("dec")
        if isinstance(dec, (list, tuple)):
            return float(dec[0])
        return float(dec)
    except Exception:
        return None

@app.route("/api/ping")
def ping():
    return "pong", 200

@app.route("/qibla")
def qibla():
    # Girdiler
    try:
        lat = float(request.args.get("lat"))
        lon = float(request.args.get("lon"))
        acc = float(request.args.get("acc", 5))
    except Exception:
        return jsonify({"error": "Geçersiz lat/lon/acc"}), 400

    user_coords = (lat, lon)

    # Kıble açısı (true north referansıyla)
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

    # Hata tahmini
    distance = geodesic(user_coords, kaaba_coords).meters
    angle_error_deg = degrees(atan(acc / max(distance, 1e-6)))  # 0'a bölünme emniyeti

    max_error_threshold = 10.0
    confidence = max(0.0, min(1.0, 1 - (angle_error_deg / max_error_threshold))) * 100

    # Declination (A)
    dec = compute_declination_deg(lat, lon)  # Doğu pozitif
    decl_meta = {
        "declination": round(dec, 3) if isinstance(dec, (int, float)) else 0.0,
        "decl_model": "WMM2025" if HAS_WMM else "none",
        "decl_date": datetime.utcnow().date().isoformat()
    }

    return jsonify({
        "qibla": round(qibla_angle, 2),
        "error": round(angle_error_deg, 2),
        "confidence": round(confidence, 2),
        **decl_meta
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)