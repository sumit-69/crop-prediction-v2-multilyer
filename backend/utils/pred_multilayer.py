"""
Multi-Layer Prediction: runs the crop model across multiple
environmental scenario layers and returns a ranked matrix.
"""
from .pred_crop import _forward, CLASSES, predict_top3
import numpy as np

SCENARIO_OFFSETS = {
    "Optimistic":    {"temp": +3.0,  "humidity": +8.0,  "rainfall": +25.0},
    "Current":       {"temp":  0.0,  "humidity":  0.0,  "rainfall":   0.0},
    "Dry Season":    {"temp": +2.0,  "humidity": -12.0, "rainfall": -30.0},
    "Monsoon Peak":  {"temp": -1.5,  "humidity": +15.0, "rainfall": +60.0},
    "Drought Risk":  {"temp": +5.0,  "humidity": -20.0, "rainfall": -50.0},
}

PH_VARIANTS = {
    "Acidic (pH-0.5)": -0.5,
    "Current pH":       0.0,
    "Alkaline (+0.5)": +0.5,
}


def predict_scenarios(nitrogen, phosphorous, potassium, temperature, humidity, ph, rainfall):
    """Return top-3 predictions for each weather scenario."""
    results = []
    for scenario, offsets in SCENARIO_OFFSETS.items():
        t = max(0, temperature + offsets["temp"])
        h = max(0, min(100, humidity + offsets["humidity"]))
        r = max(0, rainfall + offsets["rainfall"])
        probs = _forward(nitrogen, phosphorous, potassium, t, h, ph, r)
        top3_idx = probs.argsort()[-3:][::-1]
        top3 = [
            {"crop": CLASSES[int(i)], "confidence": round(float(probs[i]) * 100, 1)}
            for i in top3_idx
        ]
        results.append({
            "scenario": scenario,
            "conditions": {
                "temperature": round(t, 1),
                "humidity": round(h, 1),
                "rainfall": round(r, 1),
            },
            "top3": top3,
            "winner": CLASSES[int(probs.argmax())],
            "confidence": round(float(probs.max()) * 100, 1),
        })
    return results


def predict_ph_layers(nitrogen, phosphorous, potassium, temperature, humidity, ph, rainfall):
    """Return predictions for 3 pH variants."""
    results = []
    for label, offset in PH_VARIANTS.items():
        adjusted_ph = round(ph + offset, 2)
        probs = _forward(nitrogen, phosphorous, potassium, temperature, humidity, adjusted_ph, rainfall)
        top3_idx = probs.argsort()[-3:][::-1]
        top3 = [
            {"crop": CLASSES[int(i)], "confidence": round(float(probs[i]) * 100, 1)}
            for i in top3_idx
        ]
        results.append({
            "ph_label": label,
            "ph_value": adjusted_ph,
            "top3": top3,
            "winner": CLASSES[int(probs.argmax())],
        })
    return results


def predict_consistency(nitrogen, phosphorous, potassium, temperature, humidity, ph, rainfall):
    """Score how consistently a crop appears across all scenarios (0–100)."""
    scenario_data = predict_scenarios(nitrogen, phosphorous, potassium, temperature, humidity, ph, rainfall)
    counts = {}
    confidence_sum = {}
    for s in scenario_data:
        for item in s["top3"]:
            crop = item["crop"]
            counts[crop] = counts.get(crop, 0) + 1
            confidence_sum[crop] = confidence_sum.get(crop, 0) + item["confidence"]

    max_count = len(scenario_data) * 3  # total slots
    ranked = sorted(counts.keys(), key=lambda c: (counts[c], confidence_sum[c]), reverse=True)
    return [
        {
            "crop": c,
            "appearances": counts[c],
            "total_slots": max_count,
            "consistency_score": round((counts[c] / max_count) * 100, 1),
            "avg_confidence": round(confidence_sum[c] / counts[c], 1),
        }
        for c in ranked[:5]
    ]


MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"]

SEASON_GROUPS = {
    "Winter":  ["NOV","DEC","JAN","FEB"],
    "Summer":  ["MAR","APR","MAY"],
    "Kharif":  ["JUN","JUL","AUG","SEP"],
    "Rabi":    ["OCT","NOV","DEC","JAN"],
}

TEMP_BY_MONTH = {
    "JAN":22,"FEB":24,"MAR":28,"APR":32,"MAY":35,
    "JUN":32,"JUL":29,"AUG":29,"SEP":29,"OCT":28,
    "NOV":25,"DEC":22
}
HUM_BY_MONTH = {
    "JAN":55,"FEB":50,"MAR":45,"APR":40,"MAY":45,
    "JUN":70,"JUL":85,"AUG":88,"SEP":80,"OCT":70,
    "NOV":62,"DEC":58
}


def predict_seasonal(nitrogen, phosphorous, potassium, ph, rainfall_base):
    """Return top-2 predictions for each month."""
    results = []
    for month in MONTHS:
        t = TEMP_BY_MONTH[month]
        h = HUM_BY_MONTH[month]
        # scale rainfall by month (peak in monsoon)
        rf_factor = {"JAN":0.3,"FEB":0.2,"MAR":0.2,"APR":0.2,"MAY":0.3,
                     "JUN":1.4,"JUL":2.2,"AUG":2.0,"SEP":1.5,"OCT":0.8,
                     "NOV":0.4,"DEC":0.3}[month]
        r = max(0, rainfall_base * rf_factor)
        probs = _forward(nitrogen, phosphorous, potassium, t, h, ph, r)
        top2_idx = probs.argsort()[-2:][::-1]
        results.append({
            "month": month,
            "temperature": t,
            "humidity": h,
            "rainfall": round(r, 1),
            "winner": CLASSES[int(top2_idx[0])],
            "winner_conf": round(float(probs[top2_idx[0]]) * 100, 1),
            "runner_up": CLASSES[int(top2_idx[1])],
            "runner_up_conf": round(float(probs[top2_idx[1]]) * 100, 1),
        })
    return results


def predict_stability_matrix(nitrogen, phosphorous, potassium, temperature, humidity, ph, rainfall):
    """
    Build a matrix: top-5 crops × 5 scenarios with confidence values.
    Good for rendering a heatmap.
    """
    # Collect all probabilities per scenario
    scenario_probs = {}
    for scenario, offsets in SCENARIO_OFFSETS.items():
        t = max(0, temperature + offsets["temp"])
        h = max(0, min(100, humidity + offsets["humidity"]))
        r = max(0, rainfall + offsets["rainfall"])
        probs = _forward(nitrogen, phosphorous, potassium, t, h, ph, r)
        scenario_probs[scenario] = {CLASSES[i]: round(float(probs[i]) * 100, 1) for i in range(len(CLASSES))}

    # Find top-7 crops by average confidence
    avg = {}
    for crop in CLASSES:
        avg[crop] = round(sum(scenario_probs[s][crop] for s in SCENARIO_OFFSETS) / len(SCENARIO_OFFSETS), 1)
    top_crops = sorted(avg, key=lambda c: avg[c], reverse=True)[:7]

    rows = []
    for crop in top_crops:
        row = {"crop": crop, "avg": avg[crop], "scenarios": {}}
        for scenario in SCENARIO_OFFSETS:
            row["scenarios"][scenario] = scenario_probs[scenario][crop]
        rows.append(row)

    return {
        "crops": top_crops,
        "scenarios": list(SCENARIO_OFFSETS.keys()),
        "rows": rows,
    }


def predict_risk_profile(nitrogen, phosphorous, potassium, temperature, humidity, ph, rainfall):
    """
    Compute a risk profile for the top predicted crop:
    - Stability score (variance across scenarios)
    - Best/worst case confidence
    - Risk level: Low / Medium / High
    - Sensitivity breakdown per input dimension
    """
    base_probs = _forward(nitrogen, phosphorous, potassium, temperature, humidity, ph, rainfall)
    base_crop_idx = int(base_probs.argmax())
    base_crop = CLASSES[base_crop_idx]

    # Collect scenario confidences for base crop
    confs = []
    for offsets in SCENARIO_OFFSETS.values():
        t = max(0, temperature + offsets["temp"])
        h = max(0, min(100, humidity + offsets["humidity"]))
        r = max(0, rainfall + offsets["rainfall"])
        p = _forward(nitrogen, phosphorous, potassium, t, h, ph, r)
        confs.append(float(p[base_crop_idx]) * 100)

    variance = float(np.var(confs))
    std_dev = float(np.std(confs))
    best = round(max(confs), 1)
    worst = round(min(confs), 1)
    mean_conf = round(float(np.mean(confs)), 1)

    if std_dev < 5:
        risk_level = "Low"
        risk_color = "#27AE60"
        risk_desc = "This crop performs consistently across all weather scenarios."
    elif std_dev < 15:
        risk_level = "Medium"
        risk_color = "#E67E22"
        risk_desc = "Some sensitivity to weather changes. Consider backup options."
    else:
        risk_level = "High"
        risk_color = "#C0392B"
        risk_desc = "Strong sensitivity to conditions. Confidence varies significantly."

    # Sensitivity: how much does each input dimension shift the winner?
    deltas = {}
    nudge_map = {
        "temperature": (temperature + 3, humidity, ph, rainfall),
        "humidity":    (temperature, humidity + 10, ph, rainfall),
        "rainfall":    (temperature, humidity, ph, rainfall + 30),
        "ph":          (temperature, humidity, ph + 0.5, rainfall),
        "nitrogen":    (temperature, humidity, ph, rainfall),  # handled differently
    }
    # temperature sensitivity
    for dim, (t2, h2, ph2, r2) in [
        ("Temperature ±3°C",  (temperature+3, humidity,    ph,      rainfall)),
        ("Humidity ±10%",     (temperature,   humidity+10, ph,      rainfall)),
        ("Rainfall ±30mm",    (temperature,   humidity,    ph,      rainfall+30)),
        ("Soil pH ±0.5",      (temperature,   humidity,    ph+0.5,  rainfall)),
        ("Nitrogen ±20",      (temperature,   humidity,    ph,      rainfall)),
    ]:
        if dim == "Nitrogen ±20":
            p2 = _forward(nitrogen+20, phosphorous, potassium, temperature, humidity, ph, rainfall)
        else:
            p2 = _forward(nitrogen, phosphorous, potassium, t2, h2, ph2, r2)
        winner2 = CLASSES[int(p2.argmax())]
        conf2 = round(float(p2[base_crop_idx]) * 100, 1)
        conf_delta = round(conf2 - float(base_probs[base_crop_idx]) * 100, 1)
        deltas[dim] = {
            "delta": conf_delta,
            "new_winner": winner2,
            "flipped": winner2 != base_crop,
        }

    return {
        "crop": base_crop,
        "mean_confidence": mean_conf,
        "best_case": best,
        "worst_case": worst,
        "std_dev": round(std_dev, 2),
        "risk_level": risk_level,
        "risk_color": risk_color,
        "risk_desc": risk_desc,
        "sensitivity": deltas,
    }
