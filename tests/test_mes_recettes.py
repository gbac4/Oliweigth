"""Fiche #40 : « Mes recettes » en remplacement, portion ajustée ou complète avec rééquilibrage."""
from conftest import load_state, state, open_meal
from test_energy import base

KPWEM = {"nom": "Kpwem de test", "moment": "R", "sauce": True, "potG": 0, "parts": 18,
         "ing": [{"food": "feuilles-manioc", "g": 1450}, {"food": "creme-palme", "g": 740}, {"food": "beurre-arachide", "g": 452}]}
D = "2026-11-12"


def setup(page, **p):
    d = base(allaitement=True, bebeAge="0-6", allaitementType="exclusif", **p)
    d["customRecipes"] = {"RUTEST": KPWEM}
    load_state(page, d)


def choose(page, i, value):
    open_meal(page, i)
    page.select_option(f"[data-meal='{i}'] [data-alt]", value)


def test_my_recipes_are_offered(page):
    setup(page)
    open_meal(page, 4)
    opts = page.locator("[data-meal='4'] [data-alt] option").evaluate_all("o => o.map(x => x.value)")
    assert "RUTEST|fit" in opts and "RUTEST|full" in opts
    assert page.locator("[data-meal='4'] optgroup[label='Mes recettes']").count() == 1


def test_fit_keeps_the_day_total(page):
    setup(page)
    before = page.evaluate(f"dayKcal('{D}')")
    choose(page, 4, "RUTEST|fit")
    s = state(page)["logs"][D]
    assert s["alt"]["4"] == "RUTEST" and "altMode" not in s
    assert abs(page.evaluate(f"dayKcal('{D}')") - before) <= 2
    assert "Portion ajustée" in page.inner_text("[data-meal='4']")


def test_full_rebalances_remaining_meals_only(page):
    setup(page)
    page.evaluate(f"logFor('{D}').meals[0] = {{status: 'done'}}; save(); renderToday()")
    eaten = page.evaluate(f"slotKcal('{D}', 0)")
    base_k = page.evaluate(f"[0,1,2,3,4].map(i => Math.round(mealBaseKcal('{D}', i) * portionFactor('{D}')))")
    choose(page, 2, "RUTEST|full")
    s = state(page)["logs"][D]
    assert s["altMode"]["2"] == "full"
    reb = {int(k): v for k, v in s.get("rebal", {}).items()}
    assert reb and 0 not in reb and 2 not in reb  # ni le repas mangé, ni la recette elle-même
    for i, v in reb.items():
        assert v <= base_k[i] * 0.15 + 1
    assert page.evaluate(f"slotKcal('{D}', 0)") == eaten
    extra = page.evaluate(f"customFullKcal('RUTEST') - Math.round(plannedKcal('{D}', 2) * portionFactor('{D}'))")
    assert sum(reb.values()) + s.get("carryOut", 0) == extra


def test_overflow_is_spread_on_next_days(page):
    setup(page)
    next_goal = page.evaluate("dayGoal('2026-11-13')")
    choose(page, 2, "RUTEST|full")
    choose(page, 4, "RUTEST|full")
    s = state(page)["logs"][D]
    carry = s.get("carryOut", 0)
    assert carry > 0
    assert page.evaluate("carryIn('2026-11-13')") == min(100, carry)
    assert page.evaluate("dayGoal('2026-11-13')") == max(page.evaluate("kcalMin()"), next_goal - min(100, carry))


def test_small_gap_is_tolerated(page):
    setup(page)
    page.evaluate(f"computeRebalance('{D}')")
    assert "rebal" not in state(page)["logs"].get(D, {})


def test_allergy_hides_unsafe_recipe(page):
    setup(page, allergies="arachide")
    assert page.evaluate("customOptions(4).length") == 0


def test_choice_survives_reload(page):
    setup(page)
    choose(page, 4, "RUTEST|full")
    page.reload()
    page.wait_for_timeout(400)
    s = state(page)["logs"][D]
    assert s["alt"]["4"] == "RUTEST" and s["altMode"]["4"] == "full"
    open_meal(page, 4)
    assert "Portion complète" in page.inner_text("[data-meal='4']")
