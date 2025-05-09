from flask import Flask, render_template, make_response, send_from_directory
import os
from bs4 import BeautifulSoup
import csv
import requests

app = Flask(__name__)

@app.after_request
def add_no_cache_headers(response):
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@app.route("/")
def home():
    return render_template("index.html")

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

html = requests.get('https://docs.google.com/spreadsheets/d/1ffz-IFNSEDQay9jkR5JbOj7NPEljBX4jc2oIYzypRLc/edit?gid=0#gid=0').text
soup = BeautifulSoup(html, "lxml")
table = soup.find_all("table")[0]
with open("0.csv", "w") as f:
    wr = csv.writer(f, quoting=csv.QUOTE_NONNUMERIC)
    wr.writerows([[td.text for td in row.find_all("td")] for row in table.find_all("tr")])

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True, port=5000)