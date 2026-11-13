"""Fiche #15 : ingrédients manquants et garde-manger."""
from conftest import fixture, load_state, state, open_meal


def shop(page):
    page.click("[data-screen=menus]")
    page.click("[data-menutab=shop]")


def ring(page):
    return int(page.text_content(".ring-center strong").replace("\u202f", "").replace(" ", ""))


def test_without_ingredient_lowers_kcal_and_adds_to_shopping(page):
    load_state(page, fixture("backup-v2.0.3.json"))
    card = open_meal(page, 4)  # souper S-B : poulet aux légumes + riz (520 kcal)
    card.locator("[data-quick=done]").click()
    before = ring(page)
    open_meal(page, 4).locator('[data-ing="riz"]').click()
    share = page.evaluate("ingShares('S-B', data.meals['S-B'])['riz']")
    assert share > 100
    open_meal(page, 4).locator('[data-ing-sans="riz"]').click()
    assert ring(page) == before - share
    assert "Sans riz" in open_meal(page, 4).locator(".ing-list").first.text_content()
    page.click("[data-screen=menus]")
    page.click("[data-menutab=shop]")
    assert "Manquants (1)" in page.text_content("#shopList")


def test_replaced_ingredient_uses_difference(page):
    load_state(page, fixture("backup-v2.0.3.json"))
    open_meal(page, 4).locator("[data-quick=done]").click()
    before = ring(page)
    share = page.evaluate("ingShares('S-B', data.meals['S-B'])['riz']")
    open_meal(page, 4).locator('[data-ing="riz"]').click()
    open_meal(page, 4).locator('[data-ing-repl^="Plantain"]').click()
    assert ring(page) == before - share + 135
    assert "Riz→Plantain" in page.evaluate("summaryText()")
    # annuler
    open_meal(page, 4).locator('[data-ing="riz"]').click()
    open_meal(page, 4).locator('[data-ing-undo="riz"]').click()
    assert ring(page) == before
    assert state(page)["missing"] == {}


def test_buying_missing_item_clears_it(page):
    load_state(page, fixture("backup-v2.0.3.json"))
    open_meal(page, 4).locator('[data-ing="poulet"]').click()
    open_meal(page, 4).locator('[data-ing-sans="poulet"]').click()
    page.click("[data-screen=menus]")
    page.click("[data-menutab=shop]")
    page.locator('#shopList [data-shop="poulet"]').check()
    assert state(page)["missing"] == {}


def test_staples_persist_across_weeks_fresh_do_not(page):
    load_state(page, fixture("backup-v2.0.3.json"))
    shop(page)
    page.locator('#shopList [data-shop="riz"]').check()
    page.locator('#shopList [data-shop="tomates"]').check()
    d = state(page)
    assert d["pantry"].get("riz") is True
    assert "tomates" not in d["pantry"]
    # semaine suivante : riz toujours « j'en ai », tomates à acheter
    page.click('#weekChips [data-week="2026-11-16"]')
    assert page.locator('#shopList [data-shop="riz"]').is_checked()
    assert not page.locator('#shopList [data-shop="tomates"]').is_checked()
    assert "- Riz" not in page.evaluate("shopText()")
