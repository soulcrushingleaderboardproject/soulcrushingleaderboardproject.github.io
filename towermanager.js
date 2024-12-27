all_towers.sort((a, b) => a["diff"] - b["diff"]);
for (t = 0; t < all_towers.length; t++) {
  all_towers[t]["rank"] = all_towers.length - t;
  all_towers[t]["exp"] = Math.floor((3 ** ((all_towers[t]["diff"] - 800) / 100)) * 100);
}
var towers = all_towers;
for (player = 0; player < all_completions.length; player++) {
  all_completions[player]["exp"] = get_total_exp(all_completions[player]["name"]);
}
all_completions.sort((a, b) => b["exp"] - a["exp"]);
for (player = 0; player < all_completions.length; player++) {
  all_completions[player]["rank"] = player + 1;
}
var completions = all_completions;
var games = all_games;
function g(element_id) {
  return document.getElementById(element_id);
}
g("sclp-tower-search").addEventListener("keypress", function(event) {
  if (event.key == "Enter") {
    towers = search(g("sclp-tower-search").value);
    list_towers();
  }
})
g("sclp-player-search").addEventListener("keypress", function(event) {
  if (event.key == "Enter") {
    completions = psearch(g("sclp-player-search").value);
    list_players();
  }
})
function difficulty_to_name(d) {
  if (d < 900) {return "Insane";}
  if (d < 1000) {return "Extreme";}
  if (d < 1100) {return "Terrifying";}
  if (d < 1200) {return "Catastrophic";}
  if (d < 1300) {return "Horrific";}
  if (d < 1400) {return "Unreal";}
  return "Nil";
}
function difficulty_to_range(d) {
  d %= 100;
  if (d < 11) {return "Bottom";}
  if (d < 22) {return "Bottom-Low";}
  if (d < 33) {return "Low";}
  if (d < 45) {return "Low-Mid";}
  if (d < 56) {return "Mid";}
  if (d < 67) {return "Mid-High";}
  if (d < 78) {return "High";}
  if (d < 89) {return "High-Peak";}
  return "Peak";
}
function format_difficulty(d) {
  s = d.toString();
  return s.slice(0, s.length - 2) + "," + s.slice(s.length - 2, s.length + 1);
}
function format_location(a) {
  s = "";
  for (j = 0; j < a.length; j++) {
    l = a[j];
    s += l[0];
    if (l[1] != "") {
      s += ", " + l[1];
    }
    if (j != a.length - 1) {
      s += " / ";
    }
  }
  return s;
}
function is_tower_in_place(places, place) {
  for (i = 0; i < places.length; i++) {
    game = places[i][0]
    if (game == place) {
      return true;
    }
  }
  return false;
}
function search(s) {
  new_towers = [];
  allowed_difficulties = [];
  place_filter = g("game-select").value;
  if (g("diff-8").checked) {
    allowed_difficulties.push(8);
  }
  if (g("diff-9").checked) {
    allowed_difficulties.push(9);
  }
  if (g("diff-10").checked) {
    allowed_difficulties.push(10);
  }
  if (g("diff-11").checked) {
    allowed_difficulties.push(11);
  }
  if (g("diff-12").checked) {
    allowed_difficulties.push(12);
  }
  if (g("diff-13").checked) {
    allowed_difficulties.push(13);
  }
  for (tower_search = 0; tower_search < all_towers.length; tower_search++) {
    tower = all_towers[tower_search];
    if (tower["abbr"].toLowerCase().includes(s.toLowerCase()) || tower["name"].toLowerCase().includes(s.toLowerCase())) {
      if (allowed_difficulties.includes(Math.floor(tower["diff"] / 100))
        && (place_filter == "" || is_tower_in_place(tower["places"], place_filter))) {
        new_towers.push(tower)
      }
    }
  }
  return new_towers;
}
function tower_from_id(id) {
  for (i = 0; i < all_towers.length; i++) {
    if (all_towers[i]["id"] == id) {
      return all_towers[i];
    }
  }
}
function get_victors(id) {
  victors = 0;
  for (p = 0; p < all_completions.length; p++) {
    if (all_completions[p]["completions"].includes(id) ){
      victors += 1;
    }
  }
  return victors;
}
function open_extra(id) {
  var tower = tower_from_id(id);
  var extra = "";
  extra += "<p id='big'><b>(" + tower["abbr"] + ")</b> " + tower["name"] + "</p>";
  extra += "<b id=\"" + difficulty_to_name(tower["diff"]) + "\">[*] </b> Difficulty: " + difficulty_to_range(tower["diff"]) + " " + difficulty_to_name(tower["diff"]) + " (" + format_difficulty(tower["diff"]) + ")";
  extra += "<br>Location: " + format_location(tower["places"]);
  if (format_location(tower["places"]) == "Place") {
    extra += " <a href='" + tower["game"] + "' target='_blank'>(Game link)</a>";
  }
  extra += "<br>Rank: #" + tower["rank"];
  extra += "<br>EXP for completion: " + tower["exp"];
  extra += "<br>Victors: " + get_victors(id);
  extra += "<br><i id='small'>Tower ID: " + id + "</i>";
  g("extra-data").innerHTML = extra;
}
function list_towers() {
  var t = "";
  var is_valid_name = player_from_name(g("checklist-player").value) != false;
  if (is_valid_name) {
    var comp_data = player_from_name(g("checklist-player").value)["completions"];
  }
  for (i = 0; i < towers.length; i++) {
    t_id = towers[i]["id"];
    t_abbr = towers[i]["abbr"];
    t_name = towers[i]["name"];
    t_diff = towers[i]["diff"];
    t_area = towers[i]["places"];
    t_rank = towers[i]["rank"];

    if (is_valid_name && g("color-checklist").checked) {
      if (comp_data.includes(t_id)) {
        t += "<p id='itemCompleted'>";
      } else {
        t += "<p id='itemUncompleted'>";
      }
    } else {
      t += "<p id='item" + difficulty_to_name(t_diff) + "'>";
    }

    t += "<button id='info-button' onclick='open_extra(" + t_id + ")'>+</button>"
    t += "<b> (" + t_abbr + ") </b>" + t_name;
    t += "<i id='small'> (";
    t += format_difficulty(t_diff) + " - " + format_location(t_area) + " - #" + t_rank;
    t += ")</i></p>";
  }
  g("searchmenu").innerHTML = t;
}
list_towers();





// player leaderboard
function player_from_name(name) {
  for (i = 0; i < all_completions.length; i++) {
    if (all_completions[i]["name"] == name) {
      return all_completions[i];
    }
  }
  return false;
}
function format_level(exp) {
  current_level = 0;
  last_exp = 150;
  total = 0;
  if (exp < 175) {
    return "0 (" + exp + "/175)";
  }
  while (total <= exp) {
    current_level += 1;
    last_exp = 150 + (25 * (current_level ** 2));
    total += last_exp;
  }
  return (current_level - 1) + " (" + (exp - (total - last_exp)) + "/" + (150 + (25 * (current_level ** 2))) + ")";
}
function get_total_exp(player) {
  c = player_from_name(player)["completions"];
  total_exp = 0;
  for (comp_index = 0; comp_index < c.length; comp_index++) {
    total_exp += tower_from_id(c[comp_index])["exp"]
  }
  return total_exp;
}
function psearch(s) {
  new_players = [];
  for (player_search = 0; player_search < all_completions.length; player_search++) {
    player = all_completions[player_search];
    if (player["name"].toLowerCase().includes(s.toLowerCase())) {
      new_players.push(player)
    }
  }
  return new_players;
}
function get_towers_within_range(towers, minimum, maximum) {
  towers_within_range = [];
  for (i = 0; i < towers.length; i++) {
    if (minimum <= towers[i]["diff"] && towers[i]["diff"] <= maximum) {
      towers_within_range.push(towers[i]);
    }
  }
  return towers_within_range;
}
function get_completed_data(c) {
  c_data = [];
  for (comp = 0; comp < c.length; comp++) {
    c_data.push(tower_from_id(c[comp]))
  }
  return c_data;
}
function format_comps(c) {
  f = "";
  rank = 1;
  padding = c.length.toString().length;
  for (t = all_towers.length - 1; t >= 0; t--) {
    if (c.includes(all_towers[t]["id"])) {
      tower = all_towers[t];
      f += "<b id=\"" + difficulty_to_name(tower["diff"]) + "\">[#" + "0".repeat(padding - rank.toString().length) + rank + "] </b>"
      f += "<b>(" + tower["abbr"] + ") </b>" + tower["name"];
      f += " <i id='small'>";
      f += format_difficulty(tower["diff"]) + " - #" + tower["rank"];
      f += "</i><br>";
      rank++;
    }
  }
  return f;
}
function format_ratio(a, b) {
  return a + "/" + b + " (" + Math.floor((a / b) * 100) + "%)";
}
function open_player(name) {
  var player = player_from_name(name);
  var extra = "";
  var completion_link = "soulcrushingleaderboardproject.github.io?u=" + name;
  extra += "<p id='big'><b>" + name + "</b></p>";
  extra += "<br>Total EXP: " + player["exp"];
  extra += "<br>Level: " + format_level(player["exp"]);
  extra += "<br>Rank: #" + player["rank"];
  extra += "<br><a href='https://" + completion_link + "'>" + completion_link + "</a>";
  extra += "<br><br><b>... Total:</b> " + format_ratio(player["completions"].length, all_towers.length);
  for (d = 8; d < 14; d++) {
    extra += "<br><b id='" + difficulty_to_name(d * 100) + "'>[*]</b> <b>" + difficulty_to_name(d * 100) + ":</b> " + 
    format_ratio(get_towers_within_range(get_completed_data(player["completions"]), d * 100, (d * 100) + 99).length, get_towers_within_range(all_towers, d * 100, (d * 100) + 99).length);
  }
  extra += "<br><br><b>Completions:</b><br>";
  extra += format_comps(player["completions"]);
  g("player-data").innerHTML = extra;
}
function list_players() {
  var p = "";
  for (i = 0; i < completions.length; i++) {
    p_name = completions[i]["name"];
    p_comps = completions[i]["completions"];
    p_exp = completions[i]["exp"];
    p_rank = completions[i]["rank"];

    p += "<p id='item'>";
    p += "<b>[" + (i + 1) + "] </b>"
    p += p_name;
    p += " <button id='info-button' onclick='open_player(\"" + p_name + "\")'>+</button>"
    p += "<br><i id='small'>";
    p += p_comps.length + " Completions - " + p_exp + " EXP - Level " + format_level(p_exp) + " - #" + p_rank;
    p += "</i></p>";
  }
  g("leaderboard").innerHTML = p;
}
list_players();



// game links
function list_games() {
  var gm = "";
  for (i = 0; i < games.length; i++) {
    g_abbr = games[i]["abbr"];
    g_name = games[i]["name"];
    g_link = games[i]["link"];

    gm += "<a href='" + g_link + "'><b>(" + g_abbr + ") </b>" + g_name + "</a><br>"
  }
  g("games").innerHTML = gm;
}
list_games();

// idfk what im doing anymore
gm = "<option value=''>All</option><option value='Place'>Place</option>";
for (i = 0; i < all_games.length; i++) {
  game = all_games[i];
  gm += "<option value='" + game["abbr"] + "'>" + game["abbr"] + "</option>";
}
g("game-select").innerHTML = gm;


g("tower-lookup-page").style.display = "none";
g("leaderboard-page").style.display = "none";
g("game-links-page").style.display = "none";
function open_page(page_num) {
  // 1 - Home
  // 2 - Towers
  // 3 - Leaderboard
  // 4 - Games
  g("menu-page").style.display = "none";
  g("tower-lookup-page").style.display = "none";
  g("leaderboard-page").style.display = "none";
  g("game-links-page").style.display = "none";
  if (page_num == 1) {
    g("menu-page").style.display = "";
  } else if (page_num == 2) {
    g("tower-lookup-page").style.display = "";
  } else if (page_num == 3) {
    g("leaderboard-page").style.display = "";
  } else if (page_num == 4) {
    g("game-links-page").style.display = "";
  }
}
const url = window.location.search;
const params = new URLSearchParams(url);
if (params.get("u")) {
  open_page(3);
  open_player(params.get("u"));
}
