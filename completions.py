import os
import requests
from dotenv import load_dotenv
load_dotenv()

def format(data, key):
    pairs = {}
    for row in data:
        if len(row) > key:
            value = row[:key] + row[key+1:]
            pairs[row[key]] = value
    return pairs

def get_data(range, key):
    response = requests.get(f"https://sheets.googleapis.com/v4/spreadsheets/1ffz-IFNSEDQay9jkR5JbOj7NPEljBX4jc2oIYzypRLc/values/{range}?key={os.getenv("GOOGLE_SHEETS_API_KEY")}")
    values = response.json().get("values", [])

    data = [row for row in values if any(row)]
    return format(data, key)

data = get_data("comps!A:B", 0)
towers = get_data("towers!A:D", 1)
print(towers)

with open("edit.txt", "r") as f:
    for line in f:
        parts = line.split(";")
        if parts[0] in data:
            #user exists
            pass

print(data)