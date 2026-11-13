"""Semaines de menus, échanges de jours, bascule du lundi, liste de courses."""
from conftest import fixture, load_state, state


def test_week_chips_and_shopping(page):
    load_state(page, fixture("backup-v2.0.3.json"))
    page.click("[data-screen=menus]")
    chips = page.text_content("#weekChips")
    assert "Cette semaine" in chips and "16 nov" in chips
    page.click('#weekChips [data-week="2026-11-16"]')
    page.click("[data-menutab=shop]")
    assert int(page.text_content("#shopCount").split()[0]) > 20


def test_bloc_swap_is_kept(page):
    load_state(page, fixture("backup-v2.0.3.json"))
    page.click("[data-screen=menus]")
    page.click('#weekChips [data-week="2026-11-16"]')
    page.select_option("#swapMode", "bloc")
    page.select_option("#swapA", "1")
    page.select_option("#swapB", "3")
    page.click("#swapDo")
    w2 = state(page)["weeks"][0]
    assert w2["swaps"] == [{"mode": "bloc", "a": "1", "b": "3"}]
    assert page.evaluate("vPlan()['1'][4]") == "S2B"
    assert page.evaluate("vPlan()['3'][4]") == "S2A"


def test_monday_switch_archives_current_week(page):
    load_state(page, fixture("backup-v2.0.3.json"))
    page.evaluate("localStorage.setItem('__now', '2026-11-16T09:00:00')")
    page.reload()
    page.wait_for_timeout(300)
    d = state(page)
    assert d["current"]["startDate"] == "2026-11-16"
    assert d["settings"]["menuLabel"] == "Menus semaine 2"
    assert "2026-11-09" in d["history"]
    assert page.evaluate("planFor('2026-11-10')") == ["P2", "C1", "D2", "C3", "S-A"]  # historique conservé


def test_import_cycle_file_respects_rev(page, tmp_path):
    load_state(page, fixture("backup-v2.0.3.json"))
    cyc = page.evaluate("DEFAULT_CYCLE")
    cyc["weeks"][0]["rev"] = 99
    cyc["weeks"][0]["meals"]["S2A"]["nom"] = "Poulet révisé"
    f = tmp_path / "cycle.json"
    f.write_text(__import__("json").dumps(cyc), encoding="utf-8")
    page.click("[data-screen=settings]")
    page.set_input_files("#menuImport", str(f))
    page.click("#importMenu")
    page.wait_for_timeout(300)
    assert state(page)["weeks"][0]["meals"]["S2A"]["nom"] == "Poulet révisé"
