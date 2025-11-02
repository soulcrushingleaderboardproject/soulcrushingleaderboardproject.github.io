from flask import Flask, render_template, make_response, send_from_directory, jsonify
import os
from dotenv import load_dotenv
import utils.funcs as funcs
import math
import requests
load_dotenv()

app = Flask(__name__)

@app.after_request
def add_no_cache_headers(response):
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

all_completions = funcs.get_data("comps!A:C")
all_towers = funcs.get_data("towers!A:E")
all_games = funcs.get_data("games!A:C")

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
    return render_template("index.html", all_completions=all_completions, all_towers=all_towers, all_games=all_games, cool_members=cool_members, packs=packs, credits=staff)

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

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True, port=5000)