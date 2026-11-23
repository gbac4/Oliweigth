"""Journal d'erreurs et bouton « Copier le diagnostic » (aucune donnée de santé)."""
from conftest import load_state
from test_energy import base


def test_error_is_logged_without_health_data(page):
    load_state(page, base(allaitement=True, bebeAge="0-6", allaitementType="exclusif"))
    page.evaluate("setTimeout(() => { throw new Error('boom test'); }, 0)")
    page.wait_for_timeout(100)
    assert any("boom test" in e for e in page.errors)
    page.errors.clear()  # erreur provoquée exprès
    log = page.evaluate("diagRead()")
    assert len(log) == 1 and log[0]["msg"].endswith("boom test")
    assert log[0]["v"] == page.evaluate("APP_VERSION")
    t = page.evaluate("diagText()")
    assert "boom test" in t and "Erreurs : 1" in t
    # ni poids, ni profil, ni allaitement, ni adresse du site
    for mot in ["kg", "allait", "kcal", "http"]:
        assert mot not in t.lower()


def test_repeated_error_is_counted_and_capped(page):
    load_state(page, base(allaitement=False))
    page.evaluate("for (let i = 0; i < 5; i++) diagLog('pareil', 'a.js:1:1')")
    page.evaluate("for (let i = 0; i < 30; i++) diagLog('err ' + i, 'b.js:' + i + ':1')")
    log = page.evaluate("diagRead()")
    assert len(log) == 20  # jamais plus de 20 : le journal ne grossit pas
    assert log[-1]["msg"] == "err 29"
    page.evaluate("diagClear()")
    page.evaluate("diagLog('pareil', 'a.js:1:1'); diagLog('pareil', 'a.js:1:1')")
    assert page.evaluate("diagRead()")[0]["n"] == 2


def test_settings_card_and_clear(page):
    load_state(page, base(allaitement=False))
    page.evaluate("diagLog('x', 'a.js:1:1'); goto('settings'); renderSettings()")
    assert "1 erreur" in page.inner_text("#diagInfo")
    page.click("#diagClear")
    assert "Aucune erreur" in page.inner_text("#diagInfo")
    assert page.evaluate("diagRead()") == []
