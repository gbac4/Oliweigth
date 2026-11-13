"""Fiche #19 : « Créer ma recette » et calculateur de portion."""
from conftest import fixture, load_state, state


def test_kpwem_totals(page):
    t = page.evaluate("recipeTotals(STANDARD_RECIPES.kpwem)")
    # feuilles 870 + palme 3959 + arachide 2658 + hareng 102 + écrevisses 55
    assert 7400 <= t["kcal"] <= 7700
    assert 380 <= t["perPart"] <= 440  # 1/18 de la marmite


def test_label_value_replaces_table(page):
    k = page.evaluate(
        "[recipeTotals({potG:100, ing:[{food:'creme-palme', g:100}]}).kcal,"
        " recipeTotals({potG:100, ing:[{food:'creme-palme', g:100, kcal100:400}]}).kcal]"
    )
    assert k == [535, 400]


def test_portion_two_options(page):
    p = page.evaluate(
        "[portionFor(STANDARD_RECIPES.kpwem, 600, 'taro', 2/3), portionFor(STANDARD_RECIPES.kpwem, 600, 'taro', 1/2)]"
    )
    sauce, starch = p
    assert sauce["sauceK"] == 400 and sauce["sideK"] == 200
    assert 135 <= sauce["sideG"] <= 145  # 200 kcal de taro ≈ 140 g
    assert 17 <= sauce["frac"] <= 20
    assert starch["sideG"] > sauce["sideG"] and starch["frac"] > sauce["frac"]


def test_portion_by_cooked_weight(page):
    p = page.evaluate("portionFor({potG:2000, ing:[{food:'huile', g:100}]}, 88.4, '', 1)")
    assert p["g"] == 200  # 884 kcal / 2000 g = 0,442 kcal/g ; 88,4 kcal → 200 g


def test_create_recipe_on_screen(page):
    load_state(page, fixture("backup-v2.0.3.json"))
    page.click("[data-screen=menus]")
    page.click("[data-menutab=recipes]")
    before = page.evaluate("recipeBank().length")
    page.click("#crNew")
    page.click("#crSave")
    assert "Il manque" in page.inner_text("#crErr")
    page.click("[data-tpl=kpwem]")
    page.fill("#crNom", "Kpwem de test")
    page.dispatch_event("#crNom", "change")
    # la crème de palme en boîtes : 1 boîte = 400 g
    page.select_option("[data-cri='1'][data-crk=unit]", "boîte")
    page.fill("[data-cri='1'][data-crk=qty]", "2")
    page.dispatch_event("[data-cri='1'][data-crk=qty]", "change")
    assert "kcal" in page.inner_text("#crTotals")
    page.click("#crSave")
    s = state(page)
    rec = list(s["customRecipes"].values())
    assert len(rec) == 1 and rec[0]["nom"] == "Kpwem de test" and rec[0]["parts"] == 18
    assert rec[0]["ing"][1]["g"] == 800
    assert page.evaluate("recipeBank().length") == before + 1
    page.fill("#rf-q", "kpwem de test")
    page.dispatch_event("#rf-q", "input")
    page.click("#recipeList summary")
    box = page.locator("[data-pcbox]")
    assert "Riche en sauce" in box.inner_text() and "Riche en féculent" in box.inner_text()
    assert "taro" in box.inner_text().lower()
    page.select_option("[data-pck=side]", "riz")
    assert "riz" in page.locator("[data-pcbox]").inner_text().lower()
    assert page.locator("#recipeList details[open]").count() == 1
