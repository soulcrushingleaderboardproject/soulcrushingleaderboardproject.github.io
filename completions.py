import os
import requests
from dotenv import load_dotenv
load_dotenv()

def format(data):
    pairs = {}
    for row in data:
        pairs[row[0]] = row[1]
            
    return pairs

API_KEY = os.getenv("GOOGLE_SHEETS_API_KEY")
SHEET_ID = "1ffz-IFNSEDQay9jkR5JbOj7NPEljBX4jc2oIYzypRLc"
RANGE = "comps!A:B"

url = f"https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values/{RANGE}?key={API_KEY}"
response = requests.get(url)
values = response.json().get("values", [])

data = [row for row in values if any(row)]
data = format(data)

with open("edit.txt", "r") as f:
    for line in f:
        parts = line.split(";")
        if parts[0] in data:
            #user exists
            pass

print(data)