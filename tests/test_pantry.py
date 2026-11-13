"""Fiche #15 : ingrédients manquants et garde-manger."""
from conftest import fixture, load_state, state, open_meal


def shop(page):
    page.click("[data-screen=menus]")
    page.click("[data-menutab=shop]")


def test_missing_ingredient_goes_to_shopping_and_suggests(page):
    load_state(page, fixture("backup-v2.0.3.json"))
    card = open_meal(page, 4)  # souper S-B : poulet aux légumes + riz
    card.locator('[data-miss="poulet"]').click()
    card = open_meal(page, 4)
    assert "miss" in card.locator('[data-miss="poulet"]').get_attribute("class")
    takes = card.locator("[data-take]")
    assert takes.count() >= 1
    code = takes.first.get_attribute("data-take")
    ing = page.evaluate(f"(data.meals['{code}'].ing||[]).join(' ').toLowerCase()")
    assert "poulet" not in ing
    takes.first.click()
    assert state(page)["logs"]["2026-11-12"]["alt"]["4"] == code
    shop(page)
    assert "Manquants (1)" in page.text_content("#shopList")
    assert page.evaluate("shopText()").split("\n")[2] == "MANQUANTS"


def test_buying_missing_item_clears_it(page):
    load_state(page, fixture("backup-v2.0.3.json"))
    open_meal(page, 4).locator('[data-miss="poulet"]').click()
    shop(page)
    page.locator('#shopList [data-shop="poulet"]').check()
    assert state(page)["missing"] == {}
    assert "Manquants" not in page.text_content("#shopList")


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
