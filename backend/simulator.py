import random
import time
import httpx
from datetime import datetime

API_URL = "http://localhost:8000/api/sensores/lectura"
INTERVAL = 15  # segundos

NODES = [
    {"node_id": "VN-03", "sector_id": "VN-CENTRO",     "ph_base": 7.1,  "turb_base": 0.8},
    {"node_id": "VN-01", "sector_id": "VN-CENTRO",     "ph_base": 7.2,  "turb_base": 1.1},
    {"node_id": "MF-07", "sector_id": "VN-MIRAFLORES", "ph_base": 7.4,  "turb_base": 2.0},
    {"node_id": "MF-02", "sector_id": "VN-MIRAFLORES", "ph_base": 7.2,  "turb_base": 1.1},
    {"node_id": "FO-01", "sector_id": "VN-FORESTAL",   "ph_base": 7.3,  "turb_base": 1.4},
    {"node_id": "RN-05", "sector_id": "VN-RENACA",     "ph_base": 7.0,  "turb_base": 0.9},
    {"node_id": "RC-06", "sector_id": "VN-RECREO",     "ph_base": 7.5,  "turb_base": 1.2},
]

def generate_reading(node: dict) -> dict:
    anomaly = random.random() < 0.15
    if anomaly:
        ph = random.choice([
            round(random.uniform(4.5, 6.4), 2),
            round(random.uniform(8.6, 10.5), 2),
        ])
        turbidity = round(random.uniform(0.5, node["turb_base"] + 1.5), 2)
    else:
        ph = round(node["ph_base"] + random.uniform(-0.3, 0.3), 2)
        turbidity = round(node["turb_base"] + random.uniform(-0.3, 0.8), 2)
    return {"node_id": node["node_id"], "sector_id": node["sector_id"], "ph": ph, "turbidity": turbidity}

def run():
    print(f"[SIMCA Simulator] Iniciando — enviando lecturas cada {INTERVAL}s")
    while True:
        ts = datetime.now().strftime("%H:%M:%S")
        for node in NODES:
            payload = generate_reading(node)
            try:
                r = httpx.post(API_URL, json=payload, timeout=5)
                status = r.json().get("status", "?")
                icon = "CONTAMINADO" if status == "CONTAMINATED" else "PRECAUCION" if status == "WARNING" else "OK"
                print(f"[{ts}] {payload['node_id']} -> pH {payload['ph']}, turb {payload['turbidity']} NTU -> {status} {icon}")
            except Exception as e:
                print(f"[{ts}] {payload['node_id']} -> ERROR: {e}")
        time.sleep(INTERVAL)

if __name__ == "__main__":
    run()
