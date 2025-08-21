const credits = {
    "Owners": ["thej10n", "PrestigeUE"],
    "Developer": ["TheHaloDeveloper"],
    "Managers": ["Z_Exzer", "ThePhantomDevil666", "Spitfire_YT5", "XChocolateMLGX", "jarofjam_14", "DJdestroyer916539", "vt_et", "jumper101110"],
    "Former Staff": ["arthraix"]
}

for (let [role, users] of Object.entries(credits)) {
    $("#credits").append(`<h3><div class="${role.toLowerCase().replaceAll(" ", "-")}">[${role}]</div>${users.join(", ")}</h3>`);
}

function formatNumber(num) {
    return new Intl.NumberFormat().format(num);
}

function getAbbr(x) {
    x = x.replace("CumpleAnos", "Cumple Anos").replace(" Facility", "").replace("GBJ Edition", "G B J").replace(/\.([^\s])/g, ' $1').split(" (")[0];
    let main = x.replace(":", " :").replaceAll('-', ' ').split(' ').map(word => {
        if (!word) return '';
        if (/^\d+$/.test(word)) return word[0];
        let letter = word[0];
        let digit = word.match(/\d/);
        return (letter === letter.toLowerCase() ? letter : letter.toUpperCase()) + (digit ? digit[0] : '');
    }).join('');
    return main;
}

all_towers.sort((a, b) => b["id"] - a["id"]);
all_towers.sort((a, b) => b["difficulty"] - a["difficulty"]);
for (let t = 0; t < all_towers.length; t++) {
    all_towers[t]["rank"] = t + 1;
    all_towers[t]["exp"] = Math.floor((3 ** ((all_towers[t]["difficulty"] - 800) / 100)) * 100);

    if (all_towers[t]["game"] != null) {
        all_towers[t]["places"].push(["Place", ""])
    }
}

var towers = all_towers;
for (let player = 0; player < all_completions.length; player++) {
    all_completions[player]["exp"] = get_total_exp(all_completions[player]["username"]);
}

all_completions.sort((a, b) => b["exp"] - a["exp"]);
for (let player = 0; player < all_completions.length; player++) {
    all_completions[player]["rank"] = player + 1;
}
var completions = all_completions;
var games = all_games;

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

function difficulty_to_name(d) {
    if (d < 900) return "Insane";
    if (d < 1000) return "Extreme";
    if (d < 1100) return "Terrifying";
    if (d < 1200) return "Catastrophic";
    if (d < 1300) return "Horrific";
    if (d < 1400) return "Unreal";
    return "Nil";
}
function difficulty_to_range(d) {
    d %= 100;
    if (d < 11) return "Bottom";
    if (d < 22) return "Bottom-Low";
    if (d < 33) return "Low";
    if (d < 45) return "Low-Mid";
    if (d < 56) return "Mid";
    if (d < 67) return "Mid-High";
    if (d < 78) return "High";
    if (d < 89) return "High-Peak";
    return "Peak";
}

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
    for (let i = 0; i < places.length; i++) {
        let game = places[i][0];
        if (game == place) {
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
    for (let tower_search = 0; tower_search < all_towers.length; tower_search++) {
        let tower = all_towers[tower_search];
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
    for (let i = 0; i < all_towers.length; i++) {
        if (all_towers[i]["id"] == id) {
            return all_towers[i];
        }
    }
}

function get_victors(id) {
    let victors = 0;
    for (let p = 0; p < all_completions.length; p++) {
        if (all_completions[p]["completions"].includes(id)) {
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
        <p class="big"><b>(${getAbbr(tower["name"])})</b> ${tower["name"]}</p>
        <br>Difficulty: <span class="${diff}" style="display: inline; width: auto; padding: 0;">${difficulty_to_range(tower["difficulty"])} ${diff}</span> (${formatNumber(tower["difficulty"] / 100)})
        <br>Location: ${format_location(tower, 0, 1)}
        ${other_locations}
        <br>Rank: #${tower["rank"]}
        <br>EXP for completion: ${tower["exp"]}
        <br>Victors: ${get_victors(id)}
        <br><i id="small">Tower ID: ${id}</i>
    `;
    $("#extra-data").html(extra);
}

function list_towers() {
    var r = "<br>";
    let player = player_from_name($("#checklist-player").val());
    if (player) {
        for (let i = 0; i < towers.length; i++) {
            let t = towers[i];
            r += "<div id='item'>";
            r += "<span class='" + difficulty_to_name(t["difficulty"]) + "'>#" + t["rank"] + "</span>";
            
            if (player["completions"].includes(t["id"])) {
                r += `<button id='tower-button-crossed' onclick='open_extra(${t["id"]})' style="margin-left: 5px;"><b><s>${t["name"]}</s></b></button>`;
            } else {
                r += `<button id='tower-button' onclick='open_extra(${t["id"]})' style="margin-left: 5px;"><b>${t["name"]}</b></button>`;
            }

            if ($("#extra-tower-info").prop("checked")) {
                r += "<i id='small'><br><span></span>";
                r += `(${formatNumber(t["difficulty"] / 100)} - ${t["places"][0][0]} - ${t["exp"]} EXP)</i>`;
            }
            r += "</div>";
        }
    } else {
        for (let i = 0; i < towers.length; i++) {
            let t = towers[i];
            r += `
                <div id="item">
                    <span class="${difficulty_to_name(t["difficulty"])}">#${t["rank"]}</span>
                    <button id="tower-button" onclick="open_extra(${t["id"]})"><b>${t["name"]}</b></button>
                    ${$("#extra-tower-info").prop("checked") ? `<i id="small"><br><span></span>(${formatNumber(t["difficulty"] / 100)} - ${t["places"][0][0]} - ${t["exp"]} EXP)</i>` : ''}
                </div>
            `;          
        }
    }
    $("#searchmenu").html(r);
}
$("#checklist-player").val(localStorage.getItem("sclp-username") || "");
list_towers();

// player leaderboard
function player_from_name(name) {
    for (let i = 0; i < all_completions.length; i++) {
        if (all_completions[i]["username"] == name) {
            return all_completions[i];
        }
    }
    return false;
}

function format_level(exp, level_only) {
    let current_level = 0;
    let last_exp = 150;
    let total = 0;

    if (exp < 175) {
        if (level_only == true) {
            return "0";
        } else {
            return "0 (" + exp + "/175)";
        }
    }

    while (total <= exp) {
        current_level += 1;
        last_exp = 150 + (25 * (current_level ** 2));
        total += last_exp;
    }

    if (level_only == true) {
        return current_level - 1;
    } else {
        return (current_level - 1) + " (" + (exp - (total - last_exp)) + "/" + (150 + (25 * (current_level ** 2))) + ")";
    }
}

function get_total_exp(player) {
    c = player_from_name(player)["completions"];
    let total_exp = 0;
    for (let comp_index = 0; comp_index < c.length; comp_index++) {
        total_exp += tower_from_id(c[comp_index])["exp"];
    }
    return total_exp;
}

function psearch(s) {
    new_players = [];
    for (let player_search = 0; player_search < all_completions.length; player_search++) {
        player = all_completions[player_search];
        if (player["username"].toLowerCase().includes(s.toLowerCase())) {
            new_players.push(player)
        }
    }
    return new_players;
}

function get_towers_within_range(towers, minimum, maximum) {
    let towers_within_range = [];
    for (let i = 0; i < towers.length; i++) {
        if (minimum <= towers[i]["difficulty"] && towers[i]["difficulty"] <= maximum) {
            towers_within_range.push(towers[i]);
        }
    }
    return towers_within_range;
}

function get_completed_data(c) {
    let c_data = [];
    for (let comp = 0; comp < c.length; comp++) {
        c_data.push(tower_from_id(c[comp]));
    }
    return c_data;
}

function format_comps(c) {
    let f = "";
    let rank = 1;

    for (let t = 0; t < all_towers.length; t++) {
        if (c.includes(all_towers[t]["id"])) {
            let tower = all_towers[t];

            f += `
                <span class="${difficulty_to_name(tower["difficulty"])}">#${tower["rank"]}</span>
                <button id="tower-button" onclick="open_page('Towers');open_extra(${tower["id"]})"><b>${tower["name"]}</b></button>
                <br>
            `;          
            rank++;
        }
    }
    return f;
}

function format_ratio(a, b) {
    return `<span class="difficulty-display">${a}/${b}</span><span class="difficulty-display">${formatNumber(((a / b) * 100).toFixed(2))}%</span>`;
}

function get_role(x, t=false) {
    let role = "";
    let tag = t ? "span" : "p";
    for (let [r, users] of Object.entries(credits)) {
        if (users.includes(x)) {
            let text = t ? x : r;
            role = `<${tag} class="${r.toLowerCase().replaceAll(" ", "-")}" ${t ? "style='width: unset; padding: unset;'" : ""}>${text}</${tag}>`;
            break;
        }
    }
    return t && role == "" ? x : role;
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

function open_player(name) {
    var player = player_from_name(name);
    var completion_link = "sclp.vercel.app?u=" + name;
    let role = get_role(player["username"]);

    var extra = `
        <p class="big"><b id="playername">${name}</b></p>
        ${role}
        <br>Total EXP: ${formatNumber(player["exp"])}
        <br>Level: ${format_level(player["exp"])}
        <br>Rank: #${player["rank"]}
        <br><a href="https://${completion_link}">${completion_link}</a>
        <br><br><b class='big'>Stats</b><br><br>
        <span class='difficulty-display' style="width: 3em;"><b>TOTAL</b></span> ${format_ratio(player["completions"].length, all_towers.length)}
    `;

    for (let d = 8; d < 14; d++) {
        extra += `<br><span class="${difficulty_to_name(d * 100)}" class="difficulty-display">${difficulty_to_name(d * 100)}</span> ${format_ratio(get_towers_within_range(get_completed_data(player["completions"]), d * 100, (d * 100) + 99).length, get_towers_within_range(all_towers, d * 100, (d * 100) + 99).length)}`;
    }
    
    extra += "<br><br><b class='big'>Completions</b><br><br>";
    extra += format_comps(player["completions"]);
    $("#player-data").html(extra);
    add_badges(player["rank"], role, player["completions"]);
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
    for (let i = 0; i < completions.length; i++) {
        let p_name = completions[i]["username"];
        let p_comps = completions[i]["completions"];
        let p_exp = completions[i]["exp"];
        let p_rank = completions[i]["rank"];

        p += `<div id='item'>
            <span>#${p_rank}</span>
            <button class='player-button' onclick='open_player("${p_name}")'><b>${get_role(p_name, true)}</b></button> Level ${format_level(p_exp, true)}
        `;

        if ($("#extra-player-info").prop("checked")) {
            p += "<i id='small'><br><span></span>";
            p += `(${p_comps.length} SCs - ${p_exp} Total EXP)</i>`;
        }
        p += "</div>";
    }
    $("#leaderboard").html(p);
}
list_players();

// game links
function game_from_abbr(abbr) {
    for (let gm = 0; gm < games.length; gm++) {
        if (abbr == games[gm]["abbr"]) {
            return games[gm];
        }
    }
    return false;
}

// idfk what im doing anymore
gm = "<option value=''>All</option><option value='Place'>Place</option>";
for (let i = 0; i < all_games.length; i++) {
    game = all_games[i];
    gm += `<option value='${game["abbr"]}'>${game["abbr"]}</option>`;
}
$("#game-select").html(gm);

$("#towers-page").hide();
$("#leaderboard-page").hide();

let pages = ["Home", "Towers", "Leaderboard"];
for (let page of pages) {
    $("#links").append(`<button class="seamless-button" onclick="open_page('${page}')">${page}</button>`);
}

function scaleLayout() {
    const designedWidth = 800;
    const screenWidth = window.innerWidth;
    const scale = Math.min(screenWidth / designedWidth, 1);
    const main = document.getElementById('main');
    if (screenWidth < designedWidth) {
        main.style.transform = `scale(${scale})`;
        main.style.transformOrigin = 'top left';
        main.style.width = `${designedWidth}px`;
        main.style.height = `${100 / scale}%`;
    } else {
        main.style.transform = '';
        main.style.width = '';
        main.style.height = '';
    }
}

window.addEventListener('resize', scaleLayout);
scaleLayout();
            
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

let old_url = "soulcrushingleaderboardproject.github.io";
if (window.location.hostname == old_url) {
    window.location.href = window.location.href.replace(old_url, "sclp.vercel.app");
}

let inputs = document.querySelectorAll("input");
inputs.forEach(input => {
    input.setAttribute("autocomplete", "off");
    input.setAttribute("autocorrect", "off");
    input.setAttribute("autocapitalize", "off");
    input.setAttribute("spellcheck", false);
})