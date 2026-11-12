"""Fiche #4 : changer un repas pour un plat équivalent."""
from conftest import fixture, load_state, state


def test_equivalents_same_moment_close_kcal(page):
    load_state(page, fixture("backup-v2.0.3.json"))
    for code, slot in [("P1", 0), ("C1", 1), ("D4", 2), ("S-B", 4)]:
        k0 = page.evaluate(f"kcalOf('{code}')")
        eq = page.evaluate(f"equivalents('{code}', {slot}).map(r=>({{m:r.moment,k:r.kcal}}))")
        assert eq, code
        want = {0: "P", 1: "C", 2: "R", 4: "R"}[slot]
        assert all(e["m"] == want and abs(e["k"] - k0) <= k0 * 0.15 for e in eq), code


def test_equivalents_respect_profile(page):
    load_state(page, fixture("backup-v2.0.3.json"))
    page.evaluate("data.profile={allergies:'poisson', done:true}")
    tags = page.evaluate("equivalents('S-B', 4).flatMap(r=>r.tags)")
    assert "poisson" not in tags


def test_switch_updates_shopping_list(page):
    load_state(page, fixture("backup-v2.0.3.json"))
    sel = page.locator(".meal-card").nth(4).locator("select[data-alt]")
    alt = sel.locator("option").nth(1).get_attribute("value")
    sel.select_option(alt)
    d = state(page)
    assert alt in d["meals"]
    codes = page.evaluate("[...new Set(shoppingItems().flatMap(i=>[...i.codes]))]")
    assert alt in codes


def test_pinned_flourish_still_offered_for_breakfast(page):
    load_state(page, fixture("backup-v2.0.3.json"))
    vals = page.locator(".meal-card").nth(0).locator("select[data-alt] option").evaluate_all("o=>o.map(x=>x.value)")
    assert "P6" in vals and len(vals) == len(set(vals))
