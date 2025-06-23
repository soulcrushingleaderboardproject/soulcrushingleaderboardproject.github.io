from flask import Flask, render_template, make_response, send_from_directory
import os
from dotenv import load_dotenv
import utils.funcs as funcs
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