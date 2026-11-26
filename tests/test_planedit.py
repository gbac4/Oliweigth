"""Fiche #47 : changer un plat des jours à venir, « Pas aujourd'hui ». Date simulée : jeudi 12 novembre 2026."""
from conftest import state, open_meal
from test_regen import new_user


def plan(page):
    return page.evaluate("data.plan")


def open_menus(page):
    page.evaluate("goto('menus'); viewWeek = 'cur'; renderMenus()")
    page.wait_for_timeout(150)
    page.evaluate("document.querySelectorAll('#menuDays details.day-panel').forEach(d => d.open = true)")


def test_future_day_can_change_dish_past_day_cannot(page):
    new_user(page, "non")
    open_menus(page)
    assert page.locator('[data-repl="1-4"]').count() == 0  # lundi : passé
    sel = page.locator('[data-repl="5-4"]')  # vendredi, souper
    assert sel.count() == 1
    p0 = plan(page)
    old = p0["5"][4]
    new = [o for o in sel.locator("option").evaluate_all("os => os.map(o => o.value)") if o != old][0]
    sel.select_option(new)
    page.wait_for_timeout(100)
    p = plan(page)
    assert p["5"][4] == new and p["4"][4] == p0["4"][4]  # jeudi (aujourd'hui) ne change pas
    # Aujourd'hui et la liste de courses suivent le plan
    assert page.evaluate("effCode('2026-11-13', 4)") == new
    ing = page.evaluate(f"(data.meals['{new}'].ing || []).map(x => String(x).split(':').pop().trim().toLowerCase())")
    items = page.evaluate("shoppingItems().map(x => x.name.toLowerCase())")
    assert any(i in items for i in ing)


def test_two_day_cooking_changes_both_days(page):
    new_user(page, "oui")
    open_menus(page)
    p = plan(page)
    assert p["5"][2] == p["6"][2]  # vendredi et samedi : même dîner (cuisiné pour 2 jours)
    sel = page.locator('[data-repl="5-2"]')
    new = [o for o in sel.locator("option").evaluate_all("os => os.map(o => o.value)") if o != p["5"][2]][0]
    sel.select_option(new)
    page.wait_for_timeout(100)
    p2 = plan(page)
    assert p2["5"][2] == new and p2["6"][2] == new


def test_undo_removes_dish_changes(page):
    new_user(page, "non")
    open_menus(page)
    old = plan(page)["6"][4]
    sel = page.locator('[data-repl="6-4"]')
    sel.select_option([o for o in sel.locator("option").evaluate_all("os => os.map(o => o.value)") if o != old][0])
    page.on("dialog", lambda d: d.accept())
    page.locator("#swapUndo").scroll_into_view_if_needed()
    page.click("#swapUndo")
    assert plan(page)["6"][4] == old


def test_logged_meal_is_locked(page):
    new_user(page, "non")
    page.evaluate("logFor('2026-11-14').meals[4] = {status: 'done'}; save()")
    open_menus(page)
    assert page.locator('[data-repl="6-4"]').count() == 0


def test_not_today_swaps_with_later_day(page):
    new_user(page, "non")
    page.evaluate("goto('today')")
    p = plan(page)
    sel = open_meal(page, 4).locator('[data-later="4"]')
    assert sel.count() == 1
    assert sel.locator("option").evaluate_all("os => os.map(o => o.value)") == ["", "5", "6", "7"]
    sel.select_option("6")
    page.wait_for_timeout(100)
    p2 = plan(page)
    assert p2["4"][4] == p["6"][4] and p2["6"][4] == p["4"][4]
    assert state(page)["current"]["swaps"][-1] == {"mode": "slot", "a": "4", "b": "6", "slot": 4}
