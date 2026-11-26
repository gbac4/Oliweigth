"""Fiche #46 : « Ma semaine type » — fréquence des familles de protéines sur les 14 dîners et soupers."""
import json
from conftest import state
from test_regen import new_user

GEN = """((sem, two) => { data.profile.semaine = sem; const W = generateCycle({deuxJours: two}, '2026-11-23', 6, {});
 const bank = Object.fromEntries(recipeBank().map(r => [r.code, r]));
 const seen = {}; let rep = 0;
 W.forEach((w, i) => { const s = new Set(); for (let d = 1; d <= 7; d++) { s.add(w.plan[d][2]); s.add(w.plan[d][4]); }
   s.forEach(c => { if (seen[c] !== undefined && i - seen[c] < 3) rep++; seen[c] = i; }); });
 return {weeks: W.map(w => weekFamilyCounts(w.plan, c => data.meals[c] || bank[c])), repeats: rep}; })"""


def run(page, sem="null", two="true"):
    return page.evaluate(GEN + "(%s, %s)" % (sem, two))


def test_families_are_read_from_dish_name_first(page):
    new_user(page, "oui")
    f = page.evaluate("""JSON.stringify(Object.fromEntries(recipeBank().filter(r => ['S-C','DCR','D3D','D4D','S3A','D2C'].includes(r.code)).map(r => [r.code, familyOf(r)])))""")
    f = json.loads(f)
    assert f["S-C"] == "boeuf"  # sauce gombo au bœuf, même avec des crevettes séchées
    assert f["DCR"] == "mer" and f["D3D"] == "legumineuse" and f["D4D"] == "oeuf"
    assert f["D2C"] == "poisson" and f["S3A"] == "volaille"  # pâté chinois : dindon ou bœuf → dindon


def test_default_rules_are_respected(page):
    new_user(page, "oui")
    for two in ("true", "false"):
        res = run(page, two=two)
        for wk in res["weeks"]:
            assert 2 <= wk.get("poisson", 0) <= 3
            assert wk.get("volaille", 0) <= 4 and wk.get("boeuf", 0) <= 2 and wk.get("mer", 0) <= 2
            assert wk.get("legumineuse", 0) >= 2
            assert sum(wk.values()) == 14
    assert run(page)["repeats"] <= 1  # banque actuelle : 7 plats de légumineuses seulement


def test_tester_preferences_maxima_and_monthly(page):
    new_user(page, "oui")
    pref = {"volaille": {"min": 2, "max": 2}, "poisson": {"min": 2, "max": 2}, "boeuf": {"min": 0, "max": 2},
            "mer": {"min": 0, "max": 2}, "porc": {"min": 0, "max": "mois"},
            "legumineuse": {"min": 0, "max": None}, "oeuf": {"min": 0, "max": None}}
    for wk in run(page, json.dumps(pref))["weeks"]:
        assert wk.get("volaille", 0) == 2 and wk.get("poisson", 0) == 2
        assert wk.get("boeuf", 0) <= 2 and wk.get("porc", 0) <= 1


def test_impossible_rules_are_refused(page):
    new_user(page, "oui")
    pb = page.evaluate("""semaineProblems({volaille:{min:8,max:null}, boeuf:{min:0,max:null}, porc:{min:1,max:'mois'},
        poisson:{min:4,max:3}, mer:{min:0,max:null}, legumineuse:{min:3,max:null}, oeuf:{min:0,max:null}})""")
    assert any("14 dîners" in x for x in pb)  # 8 + 1 + 4 + 3 = 16 > 14
    assert any("Poisson" in x for x in pb) and any("Porc" in x for x in pb)


def test_menus_counter_and_form(page):
    new_user(page, "oui")
    page.evaluate("goto('menus')")
    page.wait_for_timeout(200)
    txt = page.inner_text("#weekFamilies")
    assert "Repas principaux" in txt and "Poisson" in txt
    page.click("#semaineBox >> xpath=ancestor::details/summary")
    page.select_option('[data-sem-min="volaille"]', "2")
    page.select_option('[data-sem-max="volaille"]', "2")
    page.on("dialog", lambda d: d.accept())
    page.click("#semSave")
    page.wait_for_timeout(200)
    assert state(page)["profile"]["semaine"]["volaille"] == {"min": 2, "max": 2}
    # les semaines refaites à partir de lundi prochain respectent la règle
    counts = page.evaluate("""data.weeks.map(w => weekFamilyCounts(effPlan(w), c => data.meals[c]).volaille || 0)""")
    assert counts and all(c == 2 for c in counts)


def test_invalid_form_shows_error(page):
    new_user(page, "oui")
    page.evaluate("goto('menus')")
    page.click("#semaineBox >> xpath=ancestor::details/summary")
    page.select_option('[data-sem-min="poisson"]', "5")
    page.select_option('[data-sem-max="poisson"]', "3")
    page.click("#semSave")
    assert "dépasse le maximum" in page.inner_text("#semWarn")
    assert "semaine" not in (state(page)["profile"] or {})
