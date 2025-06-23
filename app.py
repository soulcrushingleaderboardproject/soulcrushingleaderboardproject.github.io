from flask import Flask, render_template, make_response, send_from_directory
import os
import requests
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)

@app.after_request
def add_no_cache_headers(response):
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

def get_data(r):
    url = f"https://sheets.googleapis.com/v4/spreadsheets/1ffz-IFNSEDQay9jkR5JbOj7NPEljBX4jc2oIYzypRLc/values/{r}?key={os.getenv("GOOGLE_SHEETS_API_KEY")}"
    
    response = requests.get(url).json()
    values = response.get("values", [])
    if len(values) < 2:
        return []

    headers = values[0]
    data = []

    for row in values[1:]:
        item = {}
        for i, header in enumerate(headers):
            val = row[i] if i < len(row) else ""
            if header.lower() == "completions":
                item[header] = [int(x) for x in val.split(",") if x] if val else []
            else:
                item[header] = val
        data.append(item)

    return data

all_completions = get_data("comps!A:C")
all_towers = get_data("towers!A:E")
for tower in all_towers:
    tower["id"] = int(tower["id"])
    tower["difficulty"] = int(tower["difficulty"])
    
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

@app.route("/")
def home():
    return render_template("index.html", all_completions=all_completions, all_towers=all_towers)

@app.route("/static/<path:filename>")
def static_files(filename):
    response = make_response(send_from_directory(os.path.join(app.root_path, 'static'), filename))
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@app.route("/favicon.ico")
def favicon():
    return app.send_static_file("sclp.png")

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True, port=5000)