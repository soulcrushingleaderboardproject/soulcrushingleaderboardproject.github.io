from google.oauth2 import service_account
from googleapiclient.discovery import build
import os
import requests
from dotenv import load_dotenv
load_dotenv()

creds = service_account.Credentials.from_service_account_file("service.json", scopes=["https://www.googleapis.com/auth/spreadsheets"])
service = build('sheets', 'v4', credentials=creds)
sheet = service.spreadsheets()

SHEET_ID = "1ffz-IFNSEDQay9jkR5JbOj7NPEljBX4jc2oIYzypRLc"

#sybau 🥀🥀
def format(data, key):
    pairs = {}
    for row in data:
        if len(row) > key:
            value = row[:key] + row[key+1:]
            pairs[row[key]] = value
    return pairs

def get_data(range, key):
    response = requests.get(f"https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values/{range}?key={os.getenv('GOOGLE_SHEETS_API_KEY')}")
    values = response.json().get("values", [])
    data = [row for row in values if any(row)]
    return format(data, key)

data = get_data("comps!A:B", 0)
towers = get_data("towers!A:D", 1)

with open("edit.txt", "r") as f:
    for line in f:
        user, tower = line.strip().split(";")
        
        if user not in data:
            print(f"[WARN] User '{user}' not found.")
            continue

        if tower not in towers:
            print(f"""[WARN] "{tower}" not found. User: {user}""")
            continue

        id = towers[tower][0]

        current = data[user][0] if data[user] else ""
        current_ids = set(current.split(",")) if current else set()
        current_ids.add(id)
        data[user] = [",".join(sorted(current_ids, key=int))]

updated_data = [[user, data[user][0] if data[user] else ""] for user in data]

request = sheet.values().update(
    spreadsheetId=SHEET_ID,
    range="comps!A:B",
    valueInputOption="USER_ENTERED",
    body={"values": updated_data}
)
response = request.execute()
print("Done")