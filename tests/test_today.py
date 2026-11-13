"""Écran Aujourd'hui : statuts, calories, options, extras, ajouts rapides."""
from conftest import fixture, load_state, state, open_meal


def ring_kcal(page):
    return int(page.text_content(".ring-center strong").replace(" ", "").replace(" ", ""))


def test_status_updates_ring(page):
    load_state(page, fixture("backup-v2.0.3.json"))
    assert ring_kcal(page) == 0
    open_meal(page, 0).locator("[data-status=done]").click()
    assert ring_kcal(page) == 570  # P1
    open_meal(page, 0).locator("[data-status=done]").click()  # re-clic = annule
    assert ring_kcal(page) == 0


def test_alternative_option_changes_calories(page):
    load_state(page, fixture("backup-v2.0.3.json"))
    sel = open_meal(page, 0).locator("select[data-alt]")
    alt = sel.locator("option").nth(1).get_attribute("value")
    sel.select_option(alt)
    open_meal(page, 0).locator("[data-status=done]").click()
    assert ring_kcal(page) == page.evaluate(f"kcalOf('{alt}')")
    assert state(page)["logs"]["2026-11-12"]["alt"]["0"] == alt


def test_quick_adds_and_extras(page):
    load_state(page, fixture("backup-v2.0.3.json"))
    open_meal(page, 0).locator("[data-status=done]").click()
    open_meal(page, 0).locator('[data-add="0"]').click()  # huile +120
    page.click('[data-jump=extrasSec]')
    page.click('#extraChips [data-extra="0"]')  # beignet +200
    page.fill("#extraName", "Bonbon")
    page.fill("#extraKcal", "25")
    page.click("#extraAdd")
    assert ring_kcal(page) == 570 + 120 + 200 + 25
    page.locator('[data-add-undo]').click()
    assert ring_kcal(page) == 570 + 200 + 25


def test_replaced_meal_with_estimate(page):
    load_state(page, fixture("backup-v2.0.3.json"))
    card = open_meal(page, 2)
    card.locator("[data-status=replaced]").click()
    card.locator("[data-replacement]").fill("riz sauce")
    card.locator("[data-repl-kcal]").fill("600")
    card.locator("[data-repl-kcal]").blur()
    assert ring_kcal(page) == 600


def test_day_rollover_when_app_stays_open(page):
    load_state(page, fixture("backup-v2.0.3.json"))
    assert "jeudi 12" in page.text_content("#todayLabel")
    page.evaluate("localStorage.setItem('__now', '2026-11-13T00:01:00')")
    page.reload()
    page.wait_for_timeout(200)
    assert "vendredi 13" in page.text_content("#todayLabel")
