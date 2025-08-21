const credits = {
    "Owners": ["thej10n", "PrestigeUE"],
    "Developer": ["TheHaloDeveloper"],
    "Managers": ["Z_Exzer", "ThePhantomDevil666", "Spitfire_YT5", "XChocolateMLGX", "jarofjam_14", "DJdestroyer916539", "vt_et", "jumper101110"],
    "Former Staff": ["arthraix"]
}

for (let [role, users] of Object.entries(credits)) {
    $("#credits").append(`<h3><div class="${role.toLowerCase().replaceAll(" ", "-")}">[${role}]</div>${users.join(", ")}</h3>`);
}

towers.sort((a, b) => b["id"] - a["id"]);
towers.sort((a, b) => b["difficulty"] - a["difficulty"]);
for (let t = 0; t < towers.length; t++) {
    towers[t]["rank"] = t + 1;
    towers[t]["xp"] = Math.floor((3 ** ((towers[t]["difficulty"] - 800) / 100)) * 100);

    if (towers[t]["game"] != null) {
        towers[t]["places"].push(["Place", ""])
    }
}

for (let player of completions) {
    player["xp"] = get_total_xp(player["username"]);
}

completions.sort((a, b) => b["xp"] - a["xp"]);
for (let player = 0; player < completions.length; player++) {
    completions[player]["rank"] = player + 1;
}

$("#sclp-tower-search").on("input", function () {
    towers = search($(this).val());
    list_towers();
});
$("#sclp-player-search").on("input", function(event) {
    completions = psearch($(this).val());
    list_players();
})
$("#checklist-player").on("input", function () {
    list_towers();
    localStorage.setItem("sclp-username", $(this).val());
});

function format_location(tower, start, end) {
    const places = tower["places"].slice(start, end);
    const game = tower["game"];
    let formatted = "";

    places.forEach((loc, i) => {
        const href = loc[0] === "Place" ? game : game_from_abbr(loc[0]).link;
        const text = loc[1] ? `${loc[0]}, ${loc[1]}` : loc[0];
        formatted += `<a href='${href}' target='_blank'>${text}</a>`;
        if (i < places.length - 1) formatted += " / ";
    });

    return formatted;
}

function is_tower_in_place(places, place) {
    for (let i of places) {
        if (i[0] == place) {
            return true;
        }
    }
    return false;
}

function search(s) {
    let new_towers = [];
    let allowed_difficulties = [];
    let place_filter = $("#game-select").val();

    for (let i = 8; i < 14; i++) {
        if ($("#diff-" + i).prop("checked")) {
            allowed_difficulties.push(i);
        }
    }
    for (let tower of towers) {
        if (getAbbr(tower["name"]).toLowerCase().includes(s.toLowerCase()) || tower["name"].toLowerCase().includes(s.toLowerCase())) {
            if (allowed_difficulties.includes(Math.floor(tower["difficulty"] / 100))
            && (place_filter == "" || is_tower_in_place(tower["places"], place_filter))) {
            new_towers.push(tower)
            }
        }
    }
    return new_towers;
}

function tower_from_id(id) {
    for (let i of towers) {
        if (i["id"] == id) {
            return i;
        }
    }
}

function get_victors(id) {
    let victors = 0;
    for (let p of completions) {
        if (p["completions"].includes(id)) {
            victors += 1;
        }
    }
    return victors;
}

function open_extra(id) {
    var tower = tower_from_id(id);
    let other_locations = tower["places"].length > 1 ? `<br><i id="small">Other Locations: ${format_location(tower, 1, tower["places"].length)}</i>` : "";
    
    let diff = difficulty_to_name(tower["difficulty"]);
    var extra = `
        <p class="big">(${getAbbr(tower["name"])}) ${tower["name"]}</p>
        <br>Difficulty: <span class="${diff}" style="display: inline; width: auto; padding: 0;">${difficulty_to_range(tower["difficulty"])} ${diff}</span> (${formatNumber(tower["difficulty"] / 100)})
        <br>Location: ${format_location(tower, 0, 1)}
        ${other_locations}
        <br>Rank: #${tower["rank"]}
        <br>XP for completion: ${tower["xp"]}
        <br>Victors: ${get_victors(id)}
        <br><i id="small">Tower ID: ${id}</i>
    `;
    $("#extra-data").html(extra);
}

function list_towers() {
    var r = "<br>";
    let player = player_from_name($("#checklist-player").val());
    if (player) {
        for (let t of towers) {
            r += "<div id='item'>";
            r += "<span class='" + difficulty_to_name(t["difficulty"]) + "'>#" + t["rank"] + "</span>";
            
            if (player["completions"].includes(t["id"])) {
                r += `<button class='tower-button-crossed' onclick='open_extra(${t["id"]})' style="margin-left: 5px;"><b><s>${t["name"]}</s></b></button>`;
            } else {
                r += `<button class='tower-button' onclick='open_extra(${t["id"]})' style="margin-left: 5px;"><b>${t["name"]}</b></button>`;
            }

            if ($("#extra-tower-info").prop("checked")) {
                r += "<i id='small'><br><span></span>";
                r += `(${formatNumber(t["difficulty"] / 100)} - ${t["places"][0][0]} - ${t["xp"]} XP)</i>`;
            }
            r += "</div>";
        }
    } else {
        for (let t of towers) {
            r += `
                <div id="item">
                    <span class="${difficulty_to_name(t["difficulty"])}">#${t["rank"]}</span>
                    <button class="tower-button" onclick="open_extra(${t["id"]})"><b>${t["name"]}</b></button>
                    ${$("#extra-tower-info").prop("checked") ? `<i id="small"><br><span></span>(${formatNumber(t["difficulty"] / 100)} - ${t["places"][0][0]} - ${t["xp"]} XP)</i>` : ''}
                </div>
            `;          
        }
    }
    $("#searchmenu").html(r);
}
$("#checklist-player").val(localStorage.getItem("sclp-username") || "");
list_towers();

function player_from_name(name) {
    for (let i of completions) {
        if (i["username"] == name) {
            return i;
        }
    }
    return false;
}

function format_level(xp, level_only) {
    let current_level = 0;
    let last_xp = 150;
    let total = 0;

    if (xp < 175) {
        if (level_only == true) {
            return "0";
        } else {
            return "0 (" + xp + "/175)";
        }
    }

    while (total <= xp) {
        current_level += 1;
        last_xp = 150 + (25 * (current_level ** 2));
        total += last_xp;
    }

    if (level_only == true) {
        return current_level - 1;
    } else {
        return (current_level - 1) + " (" + (xp - (total - last_xp)) + "/" + (150 + (25 * (current_level ** 2))) + ")";
    }
}

function get_total_xp(player) {
    c = player_from_name(player)["completions"];
    let total_xp = 0;
    for (let id of c) {
        total_xp += tower_from_id(id)["xp"];
    }
    return total_xp;
}

function psearch(s) {
    new_players = [];
    for (let player of completions) {
        if (player["username"].toLowerCase().includes(s.toLowerCase())) {
            new_players.push(player)
        }
    }
    return new_players;
}

function get_role(x, t=false) {
    for (let [r, users] of Object.entries(credits)) {
        if (users.includes(x)) {
            if (!t) return r;
            return `<span class="${r.toLowerCase().replaceAll(" ", "-")}">${x}</span>`;
        }
    }
    return t ? x : "";
}

function add_badges(rank, role, comps) {
    let e = document.getElementById("playername");
    if (rank <= 3) {
        e.innerHTML += `<img src='/static/images/badges/top${rank}.png' class="badge">`;
    }

    if (role != "" && !role.includes("Former")) {
        e.innerHTML += `<img src='/static/images/badges/staff.png' class="badge">`;
    }

    let scs = comps.length;
    let sc_levels = [50, 100, 200, 300, 400];
    let sc_badge = "";
    for (let level of sc_levels) {
        if (scs >= level) {
            sc_badge = `<img src='/static/images/badges/${level}.png' class="badge">`;
        }
    }
    e.innerHTML += sc_badge;

    let hardest_diff = get_hardest_tower(comps);
    if (hardest_diff >= 1100) {
        e.innerHTML += `<img src='/static/images/badges/${difficulty_to_name(hardest_diff).toLowerCase()}.png' class="badge">`;
    }
}

let dp = {};
function get_dp(comps) {
    dp = {};
    for (let tower of towers) {
        let diff = difficulty_to_name(tower["difficulty"]);
        if (!dp[diff]) {
            dp[diff] = [0, 1];
        } else {
            dp[diff][1] += 1;
        }

        if (comps.includes(tower["id"])) {
            dp[diff][0] += 1;
        }
    }
}

function open_player(name) {
    var player = player_from_name(name);
    let role = get_role(player["username"]);
    let comps = player["completions"];
    get_dp(comps);

    $("#playername").html(name);
    $("#playerrole").html("");
    if (role) $("#playerrole").html(`<span class="${role.toLowerCase().replaceAll(" ", "-")}">${role}</span>`);
    $("#playerxp").html(formatNumber(player["xp"]));
    $("#playerlevel").html(format_level(player["xp"]));
    $("#playerrank").html(`#${player["rank"]}`);
    $("#playerlink").html(`<a href="https://sclp.vercel.app?u=${name}">sclp.vercel.app?u=${name}</a>`);

    let c1 = Object.values(dp).reduce((a,[x])=>a+x,0);
    let c2 = Object.values(dp).reduce((a,[,y])=>a+y,0);
    let row = `
        <th>TOTAL</th>
        <th>${c1}/${c2}</th>
        <th>${+(c1 / c2 * 100).toFixed(2)}%</th>
    `;
    $("#difficulty-progress").html(row);

    for (let d = 8; d < 14; d++) {
        let diff = difficulty_to_name(d * 100);
        row = `
            <tr>
                <td class="${diff}">${diff}</td>
                <td>${dp[diff][0]}/${dp[diff][1]}</td>
                <td>${+(dp[diff][0] / dp[diff][1] * 100).toFixed(2)}%</td>
            </tr>
        `;
        $("#difficulty-progress").append(row);
    }
    
    $("#playercompletions").html("");
    for (let tower of towers) {
        if (comps.includes(tower["id"])) {
            let row = `
                <tr>
                    <td class="${difficulty_to_name(tower["difficulty"])}">#${tower["rank"]}</td>
                    <td><button class="tower-button" onclick="open_page('Towers');open_extra(${tower["id"]})"><b>${tower["name"]}</b></button></td>
                </tr>
            `;
            $("#playercompletions").append(row);
        }
    }
    add_badges(player["rank"], role, comps);
}

function get_hardest_tower(x) {
    let highest_diff = 0;
    for (let id of x) {
        let tower = tower_from_id(id);
        highest_diff = Math.max(highest_diff, tower["difficulty"]);
    }
    return highest_diff;
}

function list_players() {
    var p = "<br>";
    for (let i of completions) {
        let p_name = i["username"];
        let p_comps = i["completions"];
        let p_xp = i["xp"];
        let p_rank = i["rank"];

        p += `<div id='item'>
            <span>#${p_rank}</span>
            <button class='player-button' onclick='open_player("${p_name}")'><b>${get_role(p_name, true)}</b></button> Level ${format_level(p_xp, true)}
        `;

        if ($("#extra-player-info").prop("checked")) {
            p += "<i id='small'><br><span></span>";
            p += `(${p_comps.length} SCs - ${p_xp} Total XP)</i>`;
        }
        p += "</div>";
    }
    $("#leaderboard").html(p);
}
list_players();

function game_from_abbr(abbr) {
    for (let gm of games) {
        if (abbr == gm["abbr"]) {
            return gm;
        }
    }
    return false;
}

gm = "<option value=''>All</option><option value='Place'>Place</option>";
for (let game of games) {
    gm += `<option value='${game["abbr"]}'>${game["abbr"]}</option>`;
}
$("#game-select").html(gm);

let pages = ["Home", "Towers", "Leaderboard"];
for (let page of pages) {
    $("#links").append(`<button class="seamless-button" onclick="open_page('${page}')">${page}</button>`);
}
open_page("Home");

function open_page(page_name) {
    for (let page of pages) {
        $(`#${page.toLowerCase()}-page`).hide();
    }
    $(`#${page_name.toLowerCase()}-page`).css("display", "");
}

const url = window.location.search;
const params = new URLSearchParams(url);
if (params.get("u")) {
    open_page("Leaderboard");
    open_player(params.get("u"));
}