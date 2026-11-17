"""Fiche #34 : objectif perdre / stabiliser."""
from conftest import fixture, load_state, state
from test_energy import base


def test_existing_profiles_keep_losing(page):
    load_state(page, base(allaitement=True, bebeAge="0-6", allaitementType="exclusif"))
    assert page.evaluate("goal()") == "perdre"
    assert page.evaluate("energyBreakdown().deficit") == 500


def test_stabilize_budget_is_maintenance(page):
    d = base(allaitement=False, objectif="stabiliser")
    d["settings"]["stabWeight"] = 116
    load_state(page, d)
    e = page.evaluate("energyBreakdown()")
    assert e["deficit"] == 0 and e["target"] == round(e["maint"] / 10) * 10
    assert page.evaluate("kcalLimit()") == e["target"] + 100
    assert page.evaluate("stabRange()") == [115, 117]
    assert page.evaluate("weeklyLoss()") == 0


def test_goal_reached_offers_stabilize(page):
    d = base(allaitement=False)
    d["settings"]["targetWeight"] = 112
    d["weights"] = [{"date": "2026-11-10", "kg": 111.8, "waist": ""}]
    load_state(page, d)
    page.evaluate("data.settings.targetWeight = 112; save(); renderAll()")  # un correctif de migration fixe la cible
    assert "poids visé" in page.inner_text("#banners")
    page.click("[data-goal-stab]")
    s = state(page)
    assert s["profile"]["objectif"] == "stabiliser" and s["settings"]["stabWeight"] == 111.8
    assert "poids visé" not in page.inner_text("#banners")


def test_offer_can_be_dismissed(page):
    d = base(allaitement=False)
    d["settings"]["targetWeight"] = 112
    d["weights"] = [{"date": "2026-11-10", "kg": 111.8, "waist": ""}]
    load_state(page, d)
    page.evaluate("data.settings.targetWeight = 112; save(); renderAll()")
    page.click("[data-goal-stab-no]")
    assert "poids visé" not in page.inner_text("#banners")
    assert page.evaluate("goal()") == "perdre"


def test_out_of_range_banner_and_trend(page):
    d = base(allaitement=False, objectif="stabiliser")
    d["settings"]["stabWeight"] = 70
    d["settings"]["startDate"] = "2026-09-01"
    d["weights"] = [{"date": x, "kg": 70 - i * 0.4, "waist": ""} for i, x in
                    enumerate(["2026-10-16", "2026-10-23", "2026-10-30", "2026-11-06", "2026-11-12"])]
    load_state(page, d)
    assert "sous ta fourchette" in page.inner_text("#banners")
    assert page.evaluate("kcalSuggestion()")["delta"] == 100


def test_onboarding_stabilize_hides_target(page):
    page.evaluate("localStorage.clear()")
    page.reload()
    page.wait_for_timeout(300)
    assert page.is_visible("#ob-targetWeight")
    page.select_option("#ob-objectif", "stabiliser")
    assert page.is_hidden("#ob-targetWeight")
    page.fill("#ob-prenom", "S")
    page.fill("#ob-age", "40")
    page.select_option("#ob-sexe", "F")
    page.fill("#ob-startWeight", "68")
    page.click("#obSave")
    s = state(page)
    assert s["profile"]["objectif"] == "stabiliser" and s["settings"]["stabWeight"] == 68
