def valid_towername(name, js):
  for tower in js:
    if tower["name"] == name:
      return tower
  return False
def valid_playername(name, js):
  for player in js:
    if player["name"] == name:
      return player
  return False
all_towers, all_completions = [], []
with open("\\".join(__file__.split("\\")[:-2]) + "\\static\\json\\towers.js") as towersjs:
  exec(towersjs.read()[4:])
towernames = []
for t in all_towers:
  if t["name"] in towernames:
    print(f"\n\033[0;31mCannot run: Duplicate tower name ({t['name']})\033[0m\n")
    quit()
  towernames.append(t["name"])
with open("\\".join(__file__.split("\\")[:-2]) + "\\static\\json\\comps.js") as compsjs:
  exec(compsjs.read()[4:])
newcomps = []
with open("\\".join(__file__.split("\\")[:-1]) + "\\edit.txt") as edit:
  lines = edit.read().split("\n")
for i, l in enumerate(lines):
  if len(l.split(";")) == 2:
    newcomps.append([m.strip(" ") for m in l.split(";")] + [i + 1])
print(f"\n{len(newcomps)} completions total. Starting...\n")
for c in newcomps:
  valid = True
  player = valid_playername(c[0], all_completions)
  tower = valid_towername(c[1], all_towers)
  if tower == False:
    valid = False
    print(f"\033[0;31mError at line {c[2]}: Invalid tower name ({c[1]})\033[0m")
  if player == False:
    valid = False
    print(f"\033[0;31mError at line {c[2]}: Invalid player name ({c[0]})\033[0m")
  if valid:
    if tower["id"] in player["completions"]:
      print(f"\033[1;33mWarning at line {c[2]}: Tower already in player's completions\033[0m")
      continue
    player["completions"].append(tower["id"])
    player["completions"] = sorted(player["completions"])
print(f"\033[0;32m\nFinished!\033[0m\n")
with open("\\".join(__file__.split("\\")[:-2]) + "\\static\\json\\comps.js", "w") as output:
  output.write("all_completions = " + str(all_completions).replace(" ", "").replace("\'", "\"").replace("[{", "[\n\t{").replace("]},", "]},\n\t").replace("}]", "}\n]"))