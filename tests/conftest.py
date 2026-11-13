"""Serveur local + navigateur mobile pour les tests OliWeight."""
import functools, http.server, json, os, threading
import pytest
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FIX = os.path.join(ROOT, "tests", "fixtures")


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


@pytest.fixture(scope="session")
def base_url():
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    yield f"http://127.0.0.1:{srv.server_address[1]}"
    srv.shutdown()


@pytest.fixture(scope="session")
def browser():
    with sync_playwright() as p:
        exe = os.environ.get("CHROME_PATH")
        b = p.chromium.launch(executable_path=exe) if exe else p.chromium.launch()
        yield b
        b.close()


def fixture(name):
    with open(os.path.join(FIX, name), encoding="utf-8") as f:
        return json.load(f)


FAKE_CLOCK = """(() => {
  const D = Date, key = '__now';
  const base = new D(localStorage.getItem(key) || '%s').getTime(), start = D.now();
  class FD extends D {
    constructor(...a) { super(...(a.length ? a : [base + (D.now() - start)])); }
    static now() { return base + (D.now() - start); }
  }
  window.Date = FD;
})()"""


@pytest.fixture
def page(browser, base_url):
    """Page mobile (360x740) avec une horloge figée au jeudi 12 nov. 2026, 18 h."""
    ctx = browser.new_context(viewport={"width": 360, "height": 740}, device_scale_factor=2)
    ctx.add_init_script(FAKE_CLOCK % "2026-11-12T18:00:00")
    pg = ctx.new_page()
    errors = []
    pg.on("pageerror", lambda e: errors.append(str(e)))
    pg.errors = errors
    pg.goto(base_url + "/index.html")
    yield pg
    assert errors == [], errors
    ctx.close()


def load_state(pg, state, sync=None):
    pg.evaluate(
        "([d, s]) => { localStorage.clear(); localStorage.setItem('oliweight.v2', JSON.stringify(d));"
        " if (s) localStorage.setItem('oliweight.sync', JSON.stringify(s)); }",
        [state, sync],
    )
    pg.reload()
    pg.wait_for_timeout(300)


def state(pg):
    return pg.evaluate("JSON.parse(localStorage.getItem('oliweight.v2'))")


def open_meal(pg, i):
    """Déplie le repas i dans le fil de la journée et renvoie sa carte."""
    card = pg.locator(".meal-card").nth(i)
    if card.locator(".tl-body").is_hidden():
        card.locator("[data-open]").click()
    return pg.locator(".meal-card").nth(i)

