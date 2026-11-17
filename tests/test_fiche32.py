"""Fiche #32 : retour à aujourd'hui et budget égal au minimum."""
from conftest import fixture, load_state, state
from test_energy import base


def small_profile():
    # petite femme peu active, sans allaitement, 1 kg/sem visé : le calcul tombe sous 1 500
    d = base(allaitement=False, age=40, taille=160, activite="sedentaire")
    d["settings"]["startWeight"] = 70
    d["settings"]["targetLoss"] = 1
    return d


def test_floored_budget_keeps_a_zone(page):
    load_state(page, small_profile())
    e = page.evaluate("energyBreakdown()")
    assert e["floored"] and e["target"] == 1500
    assert page.evaluate("kcalLimit()") == 1650  # zone 1 500 – 1 650
    rl = page.evaluate("realisticLoss()")
    assert 0 < rl < 1
    assert "trop rapide" in page.inner_text("#banners")
    assert "rythme réaliste" in page.evaluate("energyText()")


def test_normal_budget_has_no_slow_banner(page):
    load_state(page, base(allaitement=True, bebeAge="0-6", allaitementType="exclusif"))
    assert page.evaluate("realisticLoss()") is None
    assert "trop rapide" not in page.inner_text("#banners")


def test_go_today_button(page):
    load_state(page, fixture("backup-v2.0.3.json"))
    assert page.is_hidden("#goToday")
    page.click("#prevDay")
    page.click("#prevDay")
    assert page.evaluate("selectedDate") == "2026-11-10"
    assert page.is_visible("#goToday")
    page.click("#goToday")
    assert page.evaluate("selectedDate") == "2026-11-12"
    assert page.is_hidden("#goToday")


def test_back_after_long_pause_returns_to_today(page):
    load_state(page, fixture("backup-v2.0.3.json"))
    page.click("#prevDay")
    # simulate: app hidden 2 h ago, then shown again
    page.evaluate("hiddenAt = Date.now() - 2 * 3600 * 1000; checkDay()")
    assert page.evaluate("selectedDate") == "2026-11-12"
    # short pause: the chosen day is kept
    page.click("#prevDay")
    page.evaluate("hiddenAt = Date.now() - 5 * 60 * 1000; checkDay()")
    assert page.evaluate("selectedDate") == "2026-11-11"


def test_needs_below_floor(page):
    d = base(allaitement=False, age=45, taille=152, activite="sedentaire")
    d["settings"]["startWeight"] = 62
    load_state(page, d)
    assert page.evaluate("realisticLoss()") == 0
    assert "activité" in page.inner_text("#banners")
