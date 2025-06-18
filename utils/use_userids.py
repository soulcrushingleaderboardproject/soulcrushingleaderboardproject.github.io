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

response = requests.get(f"https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values/backup!A:A?key={os.getenv('GOOGLE_SHEETS_API_KEY')}")
names = response.json().get("values", [])

ids = []
for name in names:
    if not name or not name[0].strip():
        break
    
    user = name[0]
    # try:
    response = requests.post("https://users.roblox.com/v1/usernames/users", json={"usernames": [user]})
    print(response.json())
    id = response.json()["data"][0]["id"]
    ids.append([id])
    print(user, id)
    # except:
    #     print(user)

sheet.values().update(
    spreadsheetId=SHEET_ID,
    range="backup!A:A",
    valueInputOption="RAW",
    body={"values": ids}
).execute()