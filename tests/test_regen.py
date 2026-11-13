"""Fiche #23 : refaire ses menus à partir de lundi prochain."""
from conftest import fixture, load_state, state


def new_user(page, deux_jours):
    page.evaluate("localStorage.clear()")
    page.reload()
    page.wait_for_timeout(300)
    page.fill("#ob-prenom", "Test")
    page.fill("#ob-age", "35")
    page.select_option("#ob-sexe", "F")
    page.fill("#ob-startWeight", "90")
    page.select_option("#ob-deuxJours", deux_jours)
    page.click("#obSave")


def suppers(week):
    return [week["plan"][str(d)][4] for d in range(1, 8)]


def test_regenerate_keeps_current_week(page):
    new_user(page, "oui")
    d = state(page)
    cur = d["current"]["basePlan"]
    assert len(set(suppers(d["weeks"][0]))) == 4  # cuisine pour 2 jours
    page.click("[data-screen=settings]")
    page.select_option("#pf-deuxJours", "non")
    page.click("#profileSave")
    page.once("dialog", lambda dlg: dlg.accept())
    page.click("#profileWarn [data-regen]")
    d = state(page)
    assert d["current"]["basePlan"] == cur  # semaine en cours inchangée
    assert d["weeks"][0]["startDate"] == "2026-11-16"
    assert len(set(suppers(d["weeks"][0]))) == 7  # un plat différent chaque jour
    assert "Profil modifié" not in page.text_content("#banners")


def test_not_offered_for_published_cycle(page):
    load_state(page, fixture("backup-v2.0.3.json"))
    page.click("[data-screen=settings]")
    assert page.locator("[data-regen]").count() == 0
    assert page.evaluate("regenerateFromNextWeek()") is False
