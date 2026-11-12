"""Objectif, date probable, alertes de sécurité, résumé."""
from conftest import fixture, load_state


def test_goal_and_summary(page):
    bk = fixture("backup-v2.0.3.json")
    bk["weights"] = [{"date": "2026-11-10", "kg": 99.4, "waist": ""}, {"date": "2026-11-17", "kg": 98.8, "waist": ""},
                     {"date": "2026-11-24", "kg": 98.1, "waist": ""}]
    load_state(page, bk)
    page.evaluate("localStorage.setItem('__now', '2026-11-25T10:00:00')")
    page.reload()
    page.wait_for_timeout(300)
    page.click("[data-screen=progress]")
    goal = page.text_content("#goal")
    assert "60,0 kg" in goal and "Date probable" in goal
    s = page.evaluate("summaryText()")
    assert "OBJECTIF" in s and "POIDS" in s and "Semaine 3" in s or "semaine 3" in s


def test_rapid_loss_alert(page):
    bk = fixture("backup-v2.0.3.json")
    bk["weights"] = [{"date": "2026-11-05", "kg": 100.0, "waist": ""}, {"date": "2026-11-12", "kg": 98.0, "waist": ""}]
    load_state(page, bk)
    page.click("[data-screen=progress]")
    assert "plus de 1 kg" in page.text_content("#alerts")
