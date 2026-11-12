"""Synchronisation GitHub simulée : envoi du suivi, réception des menus, refus d'un repo public, clé jamais exportée."""
import base64, json
from conftest import fixture, load_state, state

H = {"access-control-allow-origin": "*"}


def github_mock(private=True, cycle=None):
    puts = []

    def handler(route):
        req = route.request
        u = req.url
        if u.endswith("/repos/gbac4/oliweight-data"):
            return route.fulfill(status=200, json={"private": private}, headers=H)
        if "contents/menus/cycle.json" in u and cycle:
            body = base64.b64encode(json.dumps(cycle).encode()).decode()
            return route.fulfill(status=200, json={"sha": "m1", "content": body}, headers=H)
        if "contents/data/oliweight.json" in u and req.method == "PUT":
            puts.append(json.loads(base64.b64decode(json.loads(req.post_data)["content"])))
            return route.fulfill(status=201, json={"content": {"sha": "d%d" % len(puts)}}, headers=H)
        return route.fulfill(status=404, json={}, headers=H)

    return handler, puts


def connect(page):
    page.click("[data-screen=settings]")
    page.fill("#syncOwner", "gbac4")
    page.fill("#syncRepo", "oliweight-data")
    page.fill("#syncToken", "github_pat_TEST")
    page.click("#syncSave")
    page.wait_for_timeout(800)


def test_push_and_pull(page):
    load_state(page, fixture("backup-v2.0.3.json"))
    cyc = page.evaluate("DEFAULT_CYCLE")
    cyc["weeks"][0]["rev"] = 50
    cyc["weeks"][0]["label"] = "Semaine 2 (repo)"
    handler, puts = github_mock(cycle=cyc)
    page.route("https://api.github.com/**", handler)
    connect(page)
    assert "Connectée" in page.text_content("#syncStatus")
    assert len(puts) == 1
    assert "github_pat" not in json.dumps(puts[0])  # la clé n'est jamais envoyée avec les données
    assert state(page)["weeks"][0]["label"] == "Semaine 2 (repo)"


def test_public_repo_is_refused(page):
    load_state(page, fixture("backup-v2.0.3.json"))
    handler, puts = github_mock(private=False)
    page.route("https://api.github.com/**", handler)
    connect(page)
    assert "PUBLIC" in page.text_content("#syncStatus")
    assert puts == []
    assert not page.evaluate("JSON.parse(localStorage.getItem('oliweight.sync')||'{}').token")


def test_token_not_in_backup(page):
    load_state(page, fixture("backup-v2.0.3.json"), sync={"owner": "gbac4", "repo": "oliweight-data", "token": "github_pat_X"})
    assert "github_pat" not in json.dumps(state(page))
