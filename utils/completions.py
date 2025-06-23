from google.oauth2 import service_account
from googleapiclient.discovery import build
import funcs
from dotenv import load_dotenv
load_dotenv()

creds = service_account.Credentials.from_service_account_file("service.json", scopes=["https://www.googleapis.com/auth/spreadsheets"])
service = build('sheets', 'v4', credentials=creds)
sheet = service.spreadsheets()

#sybau 🥀🥀
data = funcs.get_data("comps!A:C")
towers = funcs.get_data("towers!A:D")

data = {entry["username"]: entry for entry in data}
towers = {entry["name"]: entry for entry in towers}

with open("edit.txt", "r") as f:
    for line in f:
        user, tower = line.strip().split(";")
        
        if user not in data:
            print(f"[WARN] User '{user}' not found.")
            continue

        if tower not in towers:
            print(f"""[WARN] "{tower}" not found. User: {user}""")
            continue

        id = str(towers[tower]["id"])

        current = data[user].get("completions", [])
        current_ids = set(map(str, current))
        current_ids.add(id)
        data[user]["completions"] = sorted(map(int, current_ids))

updated_data = [
    [entry["username"], entry["userid"], ",".join(map(str, entry["completions"]))]
    for entry in data.values()
]

request = sheet.values().update(
    spreadsheetId="1ffz-IFNSEDQay9jkR5JbOj7NPEljBX4jc2oIYzypRLc",
    range="comps!A:C",
    valueInputOption="USER_ENTERED",
    body={"values": updated_data}
)
response = request.execute()
print("Done")