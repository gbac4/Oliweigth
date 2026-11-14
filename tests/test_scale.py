"""Fiche #27 : quantités écrites recalculées et total prévu avec ingrédients retirés."""
from conftest import fixture, load_state, state, open_meal
from test_energy import base


def s(page, txt, f, mode="down"):
    return page.evaluate("([t, f, m]) => scaleText(t, f, m)", [txt, f, mode])


def test_scale_rounds_down(page):
    assert s(page, "Poulet grillé (150 g) + 1 gros taro (environ 180 g cuit).", 1.2) == \
        "Poulet grillé (180 g) + 1 gros taro (environ 215 g cuit)."
    assert s(page, "1 fruit entier (pas de jus) + 15 g d’amandes nature (environ 12).", 1.2) == \
        "1 fruit entier (pas de jus) + 15 g d’amandes nature (environ 14)."
    assert s(page, "¾ de tasse de yaourt grec + 1 œuf + 1 tranche de pain complet.", 1.4) == \
        "1 tasse de yaourt grec + 1 œuf + 1 tranche de pain complet."
    assert s(page, "3 œufs brouillés + 2 tranches de pain complet + 1 c. à soupe d’huile.", 1.2) == \
        "3 œufs brouillés + 2 tranches de pain complet + 1 c. à soupe d’huile."
    assert s(page, "½ tasse de pois chiches (80 g)", 2) == "1 tasse de pois chiches (160 g)"
    assert s(page, "1 ½ tasse de riz", 1.2) == "1 ¾ tasses de riz"
    # tasse suivie des grammes : elle suit les grammes (¾ × 1,25 → 1 tasse, 120 → 150 g)
    assert s(page, "¾ de tasse de riz cuit (120 g)", 1.25) == "1 tasse de riz cuit (150 g)"
    assert s(page, "lait 1 %, 15 min, 2 jours", 1.5) == "lait 1 %, 15 min, 2 jours"  # pas des quantités


def test_scale_down_and_floor_mode(page):
    assert s(page, "Poisson (120 g)", 0.85) == "Poisson (100 g)"
    assert s(page, "Poisson (120 g)", 1.2, "near") == "Poisson (145 g)"
    assert s(page, "Poisson (120 g)", 1) == "Poisson (120 g)"


def test_today_shows_scaled_quantities(page):
    load_state(page, base(allaitement=True, bebeAge="0-6", allaitementType="exclusif"))
    pf = page.evaluate("portionFactor('2026-11-12')")
    assert pf != 1
    open_meal(page, 0)
    card = page.locator("[data-meal='0']").inner_text()
    assert "Quantités ajustées" in card and "Menu d’origine" in card


def test_planned_total_counts_removed_ingredients(page):
    load_state(page, fixture("backup-v2.0.3.json"))
    d = "2026-11-12"
    before = page.evaluate(f"dayKcal('{d}')")
    open_meal(page, 1)
    page.click("[data-meal='1'] [data-ing='amandes nature']")
    page.click("[data-meal='1'] [data-ing-sans='amandes nature']")
    assert page.evaluate(f"dayKcal('{d}')") == before - 88
