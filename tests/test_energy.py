"""Fiche #21 : calories personnalisées (Mifflin-St Jeor) et nombre de repas."""
from conftest import fixture, load_state, state


def base(**p):
    d = fixture("backup-v2.0.3.json")
    d["profile"] = {"prenom": "T", "age": 37, "taille": 165, "sexe": "F", "activite": "legere", "done": True, **p}
    d["settings"]["startWeight"] = 116
    d["settings"]["targetLoss"] = 0.5
    d["weights"] = []
    return d


def test_breastfeeding_woman(page):
    load_state(page, base(allaitement=True, bebeAge="0-6", allaitementType="exclusif"))
    e = page.evaluate("energyBreakdown()")
    # repos = 1160 + 1031,25 − 185 − 161 = 1845,25 ; × 1,375 ; + 330 ; − 500 (plafond allaitement)
    assert round(e["bmr"]) == 1845 and e["lact"] == 330 and e["deficit"] == 500
    assert e["target"] == round((1845.25 * 1.375 + 330 - 500) / 10) * 10
    assert page.evaluate("kcalLimit()") == e["target"]


def test_partial_and_older_baby(page):
    load_state(page, base(allaitement=True, bebeAge="7+", allaitementType="partiel"))
    assert page.evaluate("energyBreakdown().lact") == 200


def test_man_never_breastfeeding_and_floor(page):
    load_state(page, base(sexe="H", allaitement=True, age=60, taille=160, activite="sedentaire"))
    d = state(page)
    assert page.evaluate("isBreastfeeding()") is False
    load_state(page, {**d, "settings": {**d["settings"], "startWeight": 50, "targetLoss": 1}})
    e = page.evaluate("energyBreakdown()")
    assert e["target"] >= 1500 and page.evaluate("kcalMin()") == 1500


def test_latest_weight_is_used(page):
    d = base(allaitement=False)
    d["weights"] = [{"date": "2026-11-01", "kg": 110, "waist": ""}]
    load_state(page, d)
    assert page.evaluate("energyBreakdown().w") == 110


def test_incomplete_profile_falls_back(page):
    d = base(allaitement=True)
    del d["profile"]["taille"]
    load_state(page, d)
    assert page.evaluate("kcalTarget()") is None
    assert page.evaluate("kcalLimit()") == max(1800, d["settings"].get("kcalMax", 2300))


def test_fewer_meals_keep_day_total(page):
    load_state(page, base(allaitement=True, repas="3"))
    day = "2026-11-12"
    goal = page.evaluate(f"dayGoal('{day}')")
    assert page.evaluate(f"activeSlots('{day}')") == [0, 2, 4]
    assert page.evaluate(f"portionFactor('{day}')") > 1
    assert abs(page.evaluate(f"dayKcal('{day}')") - goal) / goal < 0.05
    assert page.locator("#todayMeals .meal-card").count() == 3


def test_change_meals_for_one_day(page):
    load_state(page, base(allaitement=True))
    assert page.locator("#todayMeals .meal-card").count() == 5
    page.click("[data-mealcount='4']")
    assert page.locator("#todayMeals .meal-card").count() == 4
    assert state(page)["logs"]["2026-11-12"]["mealCount"] == 4
    assert "/4 repas" in page.inner_text("#kcalRing")
    page.click("[data-mealcount='5']")
    assert "mealCount" not in state(page)["logs"]["2026-11-12"]


def test_old_behaviour_without_profile_is_unchanged(page):
    d = base(allaitement=False)
    del d["profile"]["sexe"]
    load_state(page, d)
    assert page.evaluate("portionFactor('2026-11-12')") == 1


def test_trend_suggests_adjustment(page):
    d = base(allaitement=False)
    d["settings"]["startDate"] = "2026-09-01"
    d["weights"] = [{"date": x, "kg": 115.0 - i * 0.05, "waist": ""} for i, x in
                    enumerate(["2026-10-16", "2026-10-23", "2026-10-30", "2026-11-06", "2026-11-12"])]
    load_state(page, d)
    s = page.evaluate("kcalSuggestion()")
    assert s["why"] == "slow" and s["delta"] == -100
    before = page.evaluate("kcalTarget()")
    page.click("[data-screen=progress]")
    page.click("[data-kadj='-100']")
    assert page.evaluate("kcalTarget()") == before - 100
    assert page.evaluate("kcalSuggestion()") is None  # pas avant 3 semaines


def test_onboarding_hides_breastfeeding_for_men(page):
    page.evaluate("localStorage.clear()")
    page.reload()
    page.wait_for_timeout(300)
    assert page.is_hidden("#ob-allaitement")
    page.select_option("#ob-sexe", "F")
    assert page.is_visible("#ob-allaitement") and page.is_hidden("#ob-bebeAge")
    page.select_option("#ob-allaitement", "oui")
    assert page.is_visible("#ob-bebeAge")
    page.select_option("#ob-sexe", "H")
    assert page.is_hidden("#ob-allaitement")


def test_all_done_only_marks_kept_meals(page):
    load_state(page, base(allaitement=True, repas="3"))
    page.click("#allDone")
    assert sorted(state(page)["logs"]["2026-11-12"]["meals"].keys()) == ["0", "2", "4"]
