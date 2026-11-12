"""Fiche #7 : aucune donnée personnelle par défaut sur un nouveau téléphone."""
from conftest import fixture, load_state, state


def test_fresh_install_has_neutral_profile(page):
    page.evaluate("localStorage.clear()")
    page.reload()
    page.wait_for_timeout(300)
    s = page.evaluate("data.settings")
    assert s["startWeight"] == ""
    assert s["targetWeight"] == ""
    assert "116" not in page.text_content("#weightHistory")


def test_existing_user_keeps_her_settings(page):
    load_state(page, fixture("backup-v2.0.3.json"))
    s = state(page)["settings"]
    assert float(s["startWeight"]) == 100.0
    assert float(s["targetWeight"]) == 60.0
