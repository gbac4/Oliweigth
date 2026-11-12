"""Reprise des données : v1 → v2, et v2.0.3 → version courante (ses vraies structures, valeurs anonymisées)."""
from conftest import fixture, load_state, state


def test_v1_backup_is_migrated(page):
    v1 = fixture("backup-v1.json")
    page.evaluate("l => { localStorage.clear(); localStorage.setItem('oliweight.v1', JSON.stringify(l)); }", v1)
    page.reload()
    page.wait_for_timeout(300)
    d = state(page)
    log = d["logs"]["2026-11-09"]
    assert log["meals"]["0"]["status"] == "partial"
    assert log["meals"]["1"]["status"] == "replaced"
    assert "Thé vert test" == log["meals"]["1"]["replacement"].strip()
    assert log["water"] == 500  # 2 verres → ml
    assert d["settings"]["waterGoal"] == 2500
    assert page.evaluate("!!localStorage.getItem('oliweight.v1')")  # l'ancienne clé reste


def test_v203_backup_keeps_everything(page):
    bk = fixture("backup-v2.0.3.json")
    load_state(page, bk)
    d = state(page)
    assert len(d["logs"]) == 2
    assert d["weights"][0]["kg"] == 99.4
    assert d["settings"]["targetWeight"] == 60.0  # startWeight − 40
    assert d["settings"]["cutoffTime"] == "21:00"
    assert d["current"]["startDate"] == "2026-11-09"
    assert [w["startDate"] for w in d["weeks"]] == ["2026-11-16", "2026-11-23", "2026-11-30", "2026-12-07"]
    assert "C3" in d["meals"] and "P6" in d["meals"] and "DCR" in d["meals"]
    assert set(d["meta"]["patches"]) >= {"chia-c3", "cycle-1", "quantites-1", "cible-40", "v23-options"}


def test_patches_run_once(page):
    load_state(page, fixture("backup-v2.0.3.json"))
    before = state(page)["meta"]["patches"]
    page.reload()
    page.wait_for_timeout(200)
    assert state(page)["meta"]["patches"] == before
