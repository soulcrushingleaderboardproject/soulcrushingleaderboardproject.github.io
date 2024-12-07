function g(element_id) {
  return document.getElementById(element_id);
}
g("tower-lookup-page").style.display = "none";
g("leaderboard-page").style.display = "none";
function open_page(page_num) {
  // 1 - Home
  // 2 - Towers
  // 3 - Leaderboard
  g("menu-page").style.display = "none";
  g("tower-lookup-page").style.display = "none";
  g("leaderboard-page").style.display = "none";
  if (page_num == 1) {
    g("menu-page").style.display = "";
  } else if (page_num == 2) {
    g("tower-lookup-page").style.display = "";
  } else if (page_num == 3) {
    g("leaderboard-page").style.display = "";
  }
}