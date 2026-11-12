"""Fiche #6 : bouton « Donner mon avis »."""
import base64, json
from conftest import fixture, load_state, state

H = {"access-control-allow-origin": "*"}
SYNC = {"owner": "gbac4", "repo": "oliweight-data", "token": "t", "lastPull": 9e15, "lastPhotoPull": 9e15}


def mock(page, ok=True):
    sent = []

    def handler(route):
        req = route.request
        if "/contents/feedback/" in req.url and req.method == "PUT":
            if not ok:
                return route.abort()
            sent.append((req.url.split("/")[-1], json.loads(req.post_data)["content"]))
            return route.fulfill(status=201, json={"content": {"sha": "f"}}, headers=H)
        return route.fulfill(status=201 if req.method == "PUT" else 404, json={"content": {"sha": "x"}}, headers=H)

    page.context.route("https://api.github.com/**", handler)
    return sent


def test_requires_note_or_text(page):
    load_state(page, fixture("backup-v2.0.3.json"))
    page.click("[data-screen=settings]")
    page.click("#fbSend")
    assert page.is_visible("#fbErr")
    assert not state(page).get("feedback")


def test_feedback_sent_to_private_repo(page):
    sent = mock(page)
    load_state(page, fixture("backup-v2.0.3.json"), SYNC)
    page.click("[data-screen=settings]")
    page.click("[data-fbnote='4']")
    page.select_option("#fbScreen", "menus")
    page.fill("#fbText", "Bouton photo difficile à trouver")
    page.click("#fbSend")
    page.wait_for_timeout(500)
    names = [n for n, _ in sent]
    assert len(names) == 1 and names[0].endswith(".json")
    body = json.loads(base64.b64decode(sent[0][1]))
    assert body["note"] == 4 and body["screen"] == "menus" and "photo" in body["text"]
    assert "token" not in json.dumps(body)
    assert state(page)["feedback"][0]["sent"] is True


def test_feedback_kept_when_offline(page):
    mock(page, ok=False)
    load_state(page, fixture("backup-v2.0.3.json"), SYNC)
    page.click("[data-screen=settings]")
    page.fill("#fbText", "idée")
    page.click("#fbSend")
    page.wait_for_timeout(500)
    f = state(page)["feedback"][0]
    assert f["sent"] is False and f["text"] == "idée"
    assert "en attente" in page.text_content("#fbInfo")
