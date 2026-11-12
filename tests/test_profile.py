"""Fiche #2 : profil modifiable et écran de premier lancement."""
from conftest import fixture, load_state, state


def new_phone(page):
    page.evaluate("localStorage.clear()")
    page.reload()
    page.wait_for_timeout(300)


def fill_onboarding(page, age="32"):
    page.fill("#ob-prenom", "Test")
    page.fill("#ob-age", age)
    page.fill("#ob-startWeight", "90")
    page.fill("#ob-targetWeight", "75")
    page.select_option("#ob-allaitement", "non")
    page.click("#obSave")


def test_new_phone_shows_onboarding_without_nav(page):
    new_phone(page)
    assert page.is_visible("#onboarding")
    assert not page.is_visible(".nav")


def test_onboarding_saves_profile(page):
    new_phone(page)
    fill_onboarding(page)
    assert page.is_visible("#today") and page.is_visible(".nav")
    d = state(page)
    assert d["profile"]["prenom"] == "Test" and d["profile"]["done"] is True
    assert d["profile"]["allaitement"] is False
    assert float(d["settings"]["startWeight"]) == 90 and float(d["settings"]["targetWeight"]) == 75


def test_onboarding_refuses_minor(page):
    new_phone(page)
    fill_onboarding(page, age="16")
    assert page.is_visible("#onboarding")
    assert "adultes" in page.text_content("#obErr")


def test_existing_user_gets_partial_profile_and_banner(page):
    load_state(page, fixture("backup-v2.0.3.json"))
    d = state(page)
    assert d["profile"] == {"allaitement": True, "done": False}
    assert not page.is_visible("#onboarding")
    assert "Complète ton profil" in page.text_content("#banners")


def test_profile_edit_in_settings_and_summary(page):
    load_state(page, fixture("backup-v2.0.3.json"))
    page.click("[data-screen=settings]")
    page.fill("#pf-prenom", "Test")
    page.fill("#pf-age", "30")
    page.check("[data-pf=sante][value=anemie]")
    page.click("#profileSave")
    d = state(page)
    assert d["profile"]["sante"] == ["anemie"] and d["profile"]["done"] is True
    assert float(d["settings"]["startWeight"]) == 100.0  # inchangé
    assert "médecin" in page.text_content("#profileWarn")
    assert "PROFIL : Test, 30 ans" in page.evaluate("summaryText()")
