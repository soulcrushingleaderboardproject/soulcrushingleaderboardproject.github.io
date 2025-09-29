function init_towers() {
    let tbody = "";
    for (let t of towers) {
        let diff = t["difficulty"] / 100;
        tbody += `
            <tr data-name="${t["name"].toLowerCase()}" 
                data-abbr="${getAbbr(t["name"]).toLowerCase()}" 
                data-diff="${Math.floor(diff)}" 
                data-places="${t["places"].map(p => p[0]).join(",")}">
                <td class="${difficulty_to_name(t["difficulty"])}">#${t["rank"]}</td>
                <td><button class="tower-button" onclick="open_tower(${t["id"]})">${t["name"]}</button></td>
                <td><span class="${difficulty_to_name(diff * 100)}">${formatNumber(diff)}</span></td>
            </tr>
        `;
    }
    $("#searchmenu-table").html(tbody);
    
    $("#searchmenu-table").css('table-layout', 'fixed');
    $("#searchmenu-table td:first-child").css('width', '60px');
    $("#searchmenu-table td:first-child").css('text-align', 'right');

    filter_towers();
}

function filter_towers() {
    const search = $("#sclp-tower-search").val().toLowerCase();
    const allowed_difficulties = [];
    const place_filter = $("#game-select").val();

    let mapped_towers = [];
    let comps = player_from_name($("#checklist-player").val());

    if (comps) {
        for (let c of comps["completions"]) {
            mapped_towers.push(tower_from_id(c)["name"].toLowerCase());
        }
    }

    for (let i = 8; i < 14; i++) {
        if ($("#diff-" + i).prop("checked")) {
            allowed_difficulties.push(i);
        }
    }

    $("#searchmenu-table tr").each(function () {
        const $row = $(this);
        const name = $row.data("name");
        const abbr = $row.data("abbr");
        const diff = +$row.data("diff");
        const places = $row.data("places");

        let visible = true;

        if (!(name.includes(search) || abbr.includes(search))) visible = false;
        if (!allowed_difficulties.includes(diff)) visible = false;
        if (place_filter && !places.includes(place_filter)) visible = false;

        $row.toggle(visible);
        
        if (mapped_towers.includes(name)) {
            $row.find("button").removeClass("tower-button");
            $row.find("button").addClass("tower-button-crossed");
        } else {
            $row.find("button").removeClass("tower-button-crossed");
            $row.find("button").addClass("tower-button");
        }
    });
}

function init_players() {
    let tbody = "";
    for (let i of completions) {
        let p_name = i["username"];
        let p_xp = i["xp"];
        let p_rank = i["rank"];

        tbody += `
            <tr data-name="${p_name.toLowerCase()}">
                <td>#${p_rank}</td>
                <td><button class="player-button" onclick='open_player("${p_name}")'>${get_role(p_name, true)}</button></td>
                <td style="text-align: right;">Level ${format_level(p_xp, true)}</td>
            </tr>
        `;
    }
    $("#leaderboard-table").html(tbody);
}

function filter_players() {
    const search = $("#sclp-player-search").val().toLowerCase();

    $("#leaderboard-table tr").each(function () {
        const $row = $(this);
        const name = $row.data("name");

        let visible = name.includes(search);
        $row.toggle(visible);
    });
}

$("#sclp-tower-search, #game-select, [id^=diff-]").on("input change", filter_towers);
$("#sclp-player-search").on("input", filter_players);
$("#checklist-player").on("input", function () {
    filter_towers();
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

function open_tower(id) {
    var tower = tower_from_id(id);
    let diff = difficulty_to_name(tower["difficulty"]);

    $("#towername").html(`(${getAbbr(tower["name"])}) ${tower["name"]}`);
    $("#towerdifficulty").html(`<span class="${diff}">${difficulty_to_range(tower["difficulty"])} ${diff}</span> (${formatNumber(tower["difficulty"] / 100)})`);
    $("#towerlocation").html(format_location(tower, 0, 1));
    $("#otherlocations").html(tower["places"].length > 1 ? `<i>Other Locations: ${format_location(tower, 1, tower["places"].length)}</i>` : "");
    $("#towerrank").html(tower["rank"]);
    $("#towerxp").html(tower["xp"]);
    $("#towervictors").html(get_victors(id));
    $("#towerid").html(id);
}

$("#checklist-player").val(localStorage.getItem("sclp-username") || "");

init_towers();
init_players();

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
                    <td><button class="tower-button" onclick="open_page('Towers');open_tower(${tower["id"]})">${tower["name"]}</button></td>
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

function game_from_abbr(abbr) {
    for (let gm of games) {
        if (abbr == gm["abbr"]) {
            return gm;
        }
    }
    return false;
}

$("#game-select").html("<option value=''>All</option><option value='Place'>Place</option>");
for (let game of games) {
    $("#game-select").append(`<option value='${game["abbr"]}'>${game["abbr"]}</option>`);
}

open_tower(towers[0]["id"]);
open_player(completions[0]["username"]);

const url = window.location.search;
const params = new URLSearchParams(url);
if (params.get("u")) {
    open_page("Leaderboard");
    open_player(params.get("u"));
}