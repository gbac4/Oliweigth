"""Fiche #3 : banque de recettes, filtres et menus proposés selon le profil."""
from conftest import fixture, load_state, state


def new_user(page, **extra):
    page.evaluate("localStorage.clear()")
    page.reload()
    page.wait_for_timeout(300)
    page.fill("#ob-prenom", "Test")
    page.fill("#ob-age", "35")
    page.select_option("#ob-sexe", "F")
    page.fill("#ob-startWeight", "90")
    for k, v in extra.items():
        page.fill(f"#ob-{k}", v)
    page.click("#obSave")


def test_bank_has_recipes_with_metadata(page):
    bank = page.evaluate("recipeBank().map(r=>({c:r.code,m:r.moment,cu:r.cuisine,t:r.tags,k:r.kcal}))")
    assert len(bank) >= 40
    assert {b["m"] for b in bank} == {"P", "C", "R"}
    assert all(b["k"] > 0 for b in bank)
    assert len({b["c"] for b in bank}) == len(bank)


def test_filters_on_screen(page):
    load_state(page, fixture("backup-v2.0.3.json"))
    page.click("[data-screen=menus]")
    page.click("[data-menutab=recipes]")
    total = len(page.locator("#recipeList details").all())
    page.select_option("#rf-moment", "P")
    n_p = len(page.locator("#recipeList details").all())
    assert 0 < n_p < total
    page.fill("#rf-q", "saumon")
    page.select_option("#rf-moment", "")
    assert all("aumon" in t for t in page.locator("#recipeList summary").all_text_contents())


def test_allergy_and_coeliac_exclusions(page):
    ex = page.evaluate(
        "compatibleRecipes({allergies:'arachide', sante:['coeliaque'], refuses:'porc'}).map(r=>r.tags).flat()"
    )
    assert "arachide" not in ex and "gluten" not in ex and "porc" not in ex


def test_new_user_gets_menus_from_bank(page):
    new_user(page, allergies="arachide")
    d = state(page)
    assert d["meta"]["menusFrom"] == "banque"
    assert len(d["weeks"]) == 4
    codes = {c for p in [d["current"]["basePlan"]] + [w["basePlan"] for w in d["weeks"]] for day in p.values() for c in day}
    assert codes <= set(d["meals"])
    assert not any("arachide" in " ".join(d["meals"][c]["ing"]).lower() for c in codes)
    # souper cuisiné pour 2 jours : lundi = mardi
    p = d["current"]["basePlan"]
    assert p["1"][4] == p["2"][4]
    assert page.locator(".meal-card").count() == 5


def test_existing_user_menus_untouched(page):
    load_state(page, fixture("backup-v2.0.3.json"))
    d = state(page)
    assert d["meta"].get("menusFrom") is None
    assert d["plan"]["1"][4] == "S-A"
