"""
Weather fetching using Open-Meteo (free, no API key required).
Falls back to district-based lat/lon lookup from local CSV.
"""
import requests
import pandas as pd
import os

_CSV_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'district wise rainfall normal.csv')

# Rough district → (lat, lon) lookup using a hardcoded map for common Indian districts
# Extended from city_lat.csv data
DISTRICT_COORDS = {
    "KOLKATA": (22.5726, 88.3639),
    "MUMBAI": (19.0760, 72.8777),
    "DELHI": (28.6139, 77.2090),
    "CHENNAI": (13.0827, 80.2707),
    "BANGALORE": (12.9716, 77.5946),
    "HYDERABAD": (17.3850, 78.4867),
    "PUNE": (18.5204, 73.8567),
    "AHMEDABAD": (23.0225, 72.5714),
    "JAIPUR": (26.9124, 75.7873),
    "LUCKNOW": (26.8467, 80.9462),
    "PATNA": (25.5941, 85.1376),
    "BHOPAL": (23.2599, 77.4126),
    "NAGPUR": (21.1458, 79.0882),
    "INDORE": (22.7196, 75.8577),
    "SURAT": (21.1702, 72.8311),
    "KANPUR": (26.4499, 80.3319),
    "VISAKHAPATNAM": (17.6868, 83.2185),
    "COIMBATORE": (11.0168, 76.9558),
    "MADURAI": (9.9252, 78.1198),
    "VARANASI": (25.3176, 82.9739),
    "AGRA": (27.1767, 78.0081),
    "NASHIK": (19.9975, 73.7898),
    "AURANGABAD": (19.8762, 75.3433),
    "RANCHI": (23.3441, 85.3096),
    "GUWAHATI": (26.1445, 91.7362),
    "CHANDIGARH": (30.7333, 76.7794),
    "AMRITSAR": (31.6340, 74.8723),
    "LUDHIANA": (30.9010, 75.8573),
    "JODHPUR": (26.2389, 73.0243),
    "KOCHI": (9.9312, 76.2673),
    "THIRUVANANTHAPURAM": (8.5241, 76.9366),
    "MYSORE": (12.2958, 76.6394),
    "MANGALORE": (12.9141, 74.8560),
    "HUBLI": (15.3647, 75.1240),
    "BELGAUM": (15.8497, 74.4977),
    "SHIMLA": (31.1048, 77.1734),
    "DEHRADUN": (30.3165, 78.0322),
    "NAINITAL": (29.3919, 79.4542),
    "BHUBANESWAR": (20.2961, 85.8245),
    "CUTTACK": (20.4625, 85.8830),
    "RAIPUR": (21.2514, 81.6296),
    "GWALIOR": (26.2183, 78.1828),
    "JABALPUR": (23.1815, 79.9864),
    "UDAIPUR": (24.5854, 73.7125),
    "AJMER": (26.4499, 74.6399),
    "BIKANER": (28.0229, 73.3119),
    "ALLAHABAD": (25.4358, 81.8463),
    "GORAKHPUR": (26.7606, 83.3732),
    "MEERUT": (28.9845, 77.7064),
    "ALIGARH": (27.8974, 78.0880),
    "BAREILLY": (28.3470, 79.4304),
    "MORADABAD": (28.8386, 78.7733),
    "SAHARANPUR": (29.9640, 77.5461),
    "GHAZIABAD": (28.6692, 77.4538),
    "NOIDA": (28.5355, 77.3910),
    "FARIDABAD": (28.4089, 77.3178),
    "GURUGRAM": (28.4595, 77.0266),
    "ROHTAK": (28.8955, 76.6066),
    "HISAR": (29.1509, 75.7217),
    "KARNAL": (29.6857, 76.9905),
    "AMBALA": (30.3782, 76.7767),
    "PATIALA": (30.3398, 76.3869),
    "JALANDHAR": (31.3260, 75.5762),
    "BATHINDA": (30.2110, 74.9455),
    "FIROZPUR": (30.9254, 74.6130),
    "HOSHIARPUR": (31.5143, 75.9116),
    "JAMMU": (32.7266, 74.8570),
    "SRINAGAR": (34.0837, 74.7973),
    "LEHFH": (34.1526, 77.5771),
    "IMPHAL": (24.8170, 93.9368),
    "AIZAWL": (23.7271, 92.7176),
    "SHILLONG": (25.5788, 91.8933),
    "KOHIMA": (25.6751, 94.1086),
    "ITANAGAR": (27.0844, 93.6053),
    "AGARTALA": (23.8315, 91.2868),
    "GANGTOK": (27.3389, 88.6065),
    "PANAJI": (15.4909, 73.8278),
    "SILVASSA": (20.2766, 73.0169),
    "DAMAN": (20.4283, 72.8397),
    "PONDICHERRY": (11.9416, 79.8083),
    "PORT BLAIR": (11.6234, 92.7265),
    "KAVARATTI": (10.5626, 72.6369),
}


def _geocode_district(district: str):
    """Try to get lat/lon for a district name."""
    d = district.upper().strip()
    if d in DISTRICT_COORDS:
        return DISTRICT_COORDS[d]

    # Try partial match
    for key, coords in DISTRICT_COORDS.items():
        if key in d or d in key:
            return coords

    # Fallback: use Open-Meteo geocoding API
    try:
        resp = requests.get(
            "https://geocoding-api.open-meteo.com/v1/search",
            params={"name": district + " India", "count": 1, "language": "en", "format": "json"},
            timeout=5
        )
        if resp.status_code == 200:
            data = resp.json()
            if data.get("results"):
                r = data["results"][0]
                return (r["latitude"], r["longitude"])
    except Exception:
        pass

    # Final fallback: center of India
    return (20.5937, 78.9629)


def get_temp_hum(district: str):
    """Get current temperature and humidity using Open-Meteo (free, no API key)."""
    lat, lon = _geocode_district(district)

    resp = requests.get(
        "https://api.open-meteo.com/v1/forecast",
        params={
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,relative_humidity_2m,apparent_temperature",
            "timezone": "Asia/Kolkata",
        },
        timeout=10
    )

    if resp.status_code != 200:
        raise Exception(f"Weather API failed for {district}: {resp.text}")

    data = resp.json()
    current = data.get("current", {})
    temperature = current.get("temperature_2m", 25.0)
    humidity = current.get("relative_humidity_2m", 60.0)
    return (temperature, humidity)
