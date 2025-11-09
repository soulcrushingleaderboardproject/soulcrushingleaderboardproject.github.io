from flask import Flask, render_template, make_response, send_from_directory, jsonify
import os
from dotenv import load_dotenv
import utils.funcs as funcs
import math
import requests
import pycountry
import time
from google.oauth2 import service_account
from googleapiclient.discovery import build
from datetime import datetime, timedelta, timezone
from apscheduler.schedulers.background import BackgroundScheduler
import random
import atexit
import requests
import json
load_dotenv()

resp = requests.post(
    "https://towerstatsdata-production.up.railway.app/get_service",
    json={"key": os.getenv("GOOGLE_SHEETS_API_KEY")}
)
resp.raise_for_status()
service_json_str = resp.json().get("service")
service_json = json.loads(service_json_str)

if 'private_key' in service_json:
    key = service_json['private_key']
    key = key.encode('utf-8').decode('unicode_escape')
    service_json['private_key'] = key

print("PREVIEW:\n", service_json['private_key'][:100])
key = service_json["private_key"].strip()

if not key.endswith("-----END PRIVATE KEY-----"):
    key = key + "\n-----END PRIVATE KEY-----"

service_json["private_key"] = key

credentials = service_account.Credentials.from_service_account_info(
    service_json,
    scopes=["https://www.googleapis.com/auth/spreadsheets"]
)
service = build("sheets", "v4", credentials=credentials)
sheet = service.spreadsheets()

SHEET_ID = "1ffz-IFNSEDQay9jkR5JbOj7NPEljBX4jc2oIYzypRLc"

app = Flask(__name__)

@app.after_request
def add_no_cache_headers(response):
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

def country_code(x):
    country = pycountry.countries.lookup(x)
    return country.alpha_2.lower()

all_completions = funcs.get_data("comps!A:C")
all_towers = funcs.get_data("towers!A:E")
all_games = funcs.get_data("games!A:C")
countries = funcs.get_data("nationalities!A:B")
countries_map = {}

for c in countries:
    countries_map[c["username"]] = country_code(c["nationality"])

for c in all_completions:
    c["completions"] = list(set(c["completions"]))

for tower in all_towers:
    tower["id"] = int(tower["id"])
    tower["difficulty"] = int(tower["difficulty"])
    tower["xp"] = math.floor((3 ** ((tower["difficulty"] - 800) / 100)) * 100)
    
    raw = tower.get("places", "").strip()
    if not raw or raw == ";":
        tower["places"] = []
    else:
        parts = [part.strip() for part in raw.split(";") if part.strip()]
        if not parts:
            tower["places"] = []
        else:
            parsed = [p.split(",") for p in parts if p]
            if parsed == [[""]]:
                tower["places"] = []
            else:
                tower["places"] = parsed
    
    if tower["game"] == "":
        tower["game"] = None
    else:
        tower["places"].append(["Place", ""])
    
tower_xp = {t["id"]: t["xp"] for t in all_towers}
for c in all_completions:
    try:
        c["nationality"] = countries_map[c["username"]]
    except:
        c["nationality"] = None
    c["xp"] = sum(tower_xp.get(id, 0) for id in c["completions"])
    
all_completions.sort(key=lambda x: x["xp"], reverse=True)
all_towers.sort(key=lambda x: x["id"], reverse=True)
all_towers.sort(key=lambda x: x["difficulty"], reverse=True)

for t in range(len(all_towers)):
    all_towers[t]["rank"] = t + 1
for c in range(len(all_completions)):
    all_completions[c]["rank"] = c + 1
    
raw_packs = funcs.get_data("packs!A:M")
packs = []
for pack in raw_packs:
    if not pack["id"]:
        continue
    
    t = []
    for i in range(1, 11):
        current = pack[f"tower{i}"]
        if current != "":
            t.append(current)
            
    packs.append({
        "id": pack["id"],
        "name": pack["name"],
        "towers": t
    })
        
@app.route("/tower_data")
def tower_data():
    updated = funcs.get_data("towers!A:E")
    return jsonify(updated)

cool_members = requests.get("https://towerstatsdata-production.up.railway.app/cool_members").json()
staff = funcs.get_data("credits!A:B")

@app.route("/")
def home():
    return render_template("index.html", all_completions=all_completions, all_towers=all_towers, all_games=all_games, cool_members=cool_members, packs=packs, credits=staff, scotw_points=scotw_points)

@app.route("/static/<path:filename>")
def static_files(filename):
    response = make_response(send_from_directory(os.path.join(app.root_path, 'static'), filename))
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@app.route("/favicon.ico")
def favicon():
    return app.send_static_file("images/sclp.png")

def difficulty_to_name(d):
    if d < 900: return "Insane"
    if d < 1000: return "Extreme"
    if d < 1100: return "Terrifying"
    if d < 1200: return "Catastrophic"
    if d < 1300: return "Horrific"
    if d < 1400: return "Unreal"
    return "Nil"

scotw_points = funcs.get_data("scotwpoints!A:B")
current_scotw = funcs.get_data("scotw!A:B")[0]
start_time = datetime.fromtimestamp(int(current_scotw['Time']), tz=timezone.utc)
target_time = start_time + timedelta(weeks=1)

scotw_chances = {
    "Insane": 45,
    "Extreme": 45,
    "Terrifying": 9,
    "Catastrophic": 1
}
scotw_diffs = []
for k, v in scotw_chances.items():
    scotw_diffs.extend([k] * v)

last_webhook_time = None
resp = requests.post(
    "https://towerstatsdata-production.up.railway.app/get_service",
    json={"key": os.getenv("GOOGLE_SHEETS_API_KEY") + "2"}
)
resp.raise_for_status()
WEBHOOK_URL = resp.json().get("webhook")

def refresh_scotw():
    global current_scotw, start_time, target_time, last_webhook_time

    now = datetime.now(tz=timezone.utc)
    if last_webhook_time and (now - last_webhook_time) < timedelta(minutes=10):
        return 

    diff = random.choice(scotw_diffs)
    tower_set = [t for t in all_towers if difficulty_to_name(t["difficulty"]) == diff]   
    selection = random.choice(tower_set)

    current_scotw['Tower'] = selection["id"]
    current_scotw['Time'] = str(int(datetime.now(tz=timezone.utc).timestamp()))
    
    start_time = datetime.fromtimestamp(int(current_scotw['Time']), tz=timezone.utc)
    target_time = start_time + timedelta(weeks=1)

    sheet.values().update(
        spreadsheetId=SHEET_ID,
        range="scotw!A2:B2",
        valueInputOption="RAW",
        body={"values": [[current_scotw['Tower'], current_scotw['Time']]]}
    ).execute()

    tickets = math.floor((3 ** ((selection["difficulty"] - 800) / 100)) * 100 / 100)

    diff_name = difficulty_to_name(selection["difficulty"])
    diff_emoji = {
        "Insane": "<:insane:1306835966765437058>",
        "Extreme": "<:extreme:1306835963850264598>",
        "Terrifying": "<:terrifying:1306835967855820810>",
        "Catastrophic": "<:catastrophic:1306835963166720000>"
    }.get(diff_name, "")

    discord_ts = int(target_time.timestamp())

    webhook_content = f"""<@&1387969989142909099>
SC of the Week
# [{selection['name']}](https://sclp.vercel.app/?t={selection['id']})

Difficulty: {diff_emoji} {diff_name}

Beat this tower <t:{discord_ts}:R> for {tickets} Weekly Tickets!
"""

    requests.post(WEBHOOK_URL, json={"content": webhook_content})
    last_webhook_time = now

def check_scotw():
    global target_time
    now = datetime.now(tz=timezone.utc)
    
    if now >= target_time:
        overtime = now - target_time
        refresh_scotw()

check_scotw()

scheduler = BackgroundScheduler(daemon=True)
scheduler.add_job(check_scotw, 'interval', minutes=1)
scheduler.start()

atexit.register(lambda: scheduler.shutdown())

@app.route("/get_scotw")
def get_scotw():
    return jsonify(current_scotw)

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True, port=5000)