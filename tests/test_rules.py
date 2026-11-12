"""Fiche #5 : règles automatiques selon la situation."""
from conftest import fixture, load_state, state


def set_profile(page, **p):
    page.click("[data-screen=settings]")
    page.fill("#pf-prenom", "Test")
    page.fill("#pf-age", "30")
    for k, v in p.items():
        if k == "sante":
            for x in v:
                page.check(f"[data-pf=sante][value={x}]")
        else:
            page.select_option(f"#pf-{k}", v)
    page.click("#profileSave")
    page.click("[data-screen=today]")


def test_existing_user_is_breastfeeding_by_default(page):
    load_state(page, fixture("backup-v2.0.3.json"))
    assert page.is_visible("#feedsCard")
    assert page.evaluate("[kcalMin(), maxLoss()]") == [1800, 0.5]


def test_stop_breastfeeding_updates_rules(page):
    load_state(page, fixture("backup-v2.0.3.json"))
    set_profile(page, allaitement="non")
    assert not page.is_visible("#feedsCard")
    assert page.evaluate("[kcalMin(), maxLoss()]") == [1500, 1.0]  # 1 % de 100 kg
    assert "Profil modifié" in page.text_content("#banners")


def test_sick_pause_mode(page):
    load_state(page, fixture("backup-v2.0.3.json"))
    set_profile(page, pause="oui")
    assert page.evaluate("maxLoss()") == 0
    assert "Mode pause" in page.text_content("#kcalRing")
    assert "pause" in page.text_content("#banners")
    assert "MODE PAUSE" in page.evaluate("summaryText()")


def test_health_exclusions(page):
    load_state(page, fixture("backup-v2.0.3.json"))
    tags = page.evaluate("compatibleRecipes({sante:['hypertension','diabete','coeliaque']}).flatMap(r=>r.tags)")
    assert not {"sel", "sucre", "gluten"} & set(tags)
    eq = page.evaluate("data.profile={sante:['hypertension'],done:true}; equivalents('S-B',4).flatMap(r=>r.tags)")
    assert "sel" not in eq


def test_menus_review_flag_cleared_by_new_menus(page):
    load_state(page, fixture("backup-v2.0.3.json"))
    set_profile(page, sante=["anemie"])
    assert page.evaluate("menusToReview()") is True
    page.evaluate("data.meta.menusReviewedAt=new Date(Date.now()+1000).toISOString()")
    assert page.evaluate("menusToReview()") is False
