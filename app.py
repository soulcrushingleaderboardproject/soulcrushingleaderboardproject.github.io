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

def format_data(x):
    res = []
    for row in x:
        res.append({"name": row[0], "completions": list(map(int, row[1].split(",")))})
    return res

API_KEY = os.getenv("GOOGLE_SHEETS_API_KEY")
SHEET_ID = "1ffz-IFNSEDQay9jkR5JbOj7NPEljBX4jc2oIYzypRLc"
RANGE = "comps!A:B"

url = f"https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values/{RANGE}?key={API_KEY}"
response = requests.get(url)
values = response.json().get("values", [])

data = [row for row in values if any(row)]
data = format_data(data)

@app.route("/")
def home():
    return render_template("index.html", data=data)

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