"""Fiche #36 : rotation avec historique, semaines créées automatiquement, banque élargie."""
from conftest import fixture, load_state, state, FAKE_CLOCK
from test_regen import new_user


GEN = "generateCycle(%s, '2026-11-23', 6)"


def gen(page, profile="{deuxJours:true}"):
    return page.evaluate(GEN % profile)


def days(weeks):
    return [d for w in weeks for d in [w["plan"][str(i)] for i in range(1, 8)]]


def test_bank_is_larger(page):
    n = page.evaluate("(() => {const b = recipeBank(); return ['P','C','R'].map(m => b.filter(r => r.moment === m).length)})()")
    assert n[0] >= 12 and n[1] >= 12 and n[2] >= 30


def test_mains_do_not_repeat_within_window(page):
    w = gen(page)
    mains = [set(d[2] for d in days([x])) | set(d[4] for d in days([x])) for x in w]
    for i in range(len(mains) - 2):
        assert not (mains[i] & mains[i + 1]) and not (mains[i] & mains[i + 2])  # 3 semaines sans répétition


def test_two_day_cooking_is_kept(page):
    d = days(gen(page))
    assert d[0][4] == d[1][4] and d[2][4] == d[3][4]  # cuisiner pour 2 jours : répétition voulue
    d7 = days(gen(page, "{deuxJours:false}"))
    assert len({x[4] for x in d7[:7]}) == 7


def test_breakfasts_and_snacks_spread(page):
    d = days(gen(page))
    for slot, min_gap in ((0, 10), (1, 5)):
        seen = {}
        for i, day in enumerate(d):
            codes = [day[1], day[3]] if slot == 1 else [day[0]]
            for c in codes:
                if c in seen:
                    assert i - seen[c] >= min_gap, (slot, c, i, seen[c])
                seen[c] = i
    assert all(day[1] != day[3] for day in d)  # deux collations différentes le même jour


def test_protein_alternates(page):
    seq = page.evaluate("""(() => { const w = generateCycle({deuxJours:true}, '2026-11-23', 2);
      const by = Object.fromEntries(recipeBank().map(r => [r.code, r]));
      const out = []; for (const x of w) for (const i of [1,3,5,7]) { out.push(proteinOf(by[x.plan[i][2]])); out.push(proteinOf(by[x.plan[i][4]])); }
      return out; })()""")
    same = sum(1 for a, b in zip(seq, seq[1:]) if a == b and a != "autre")
    assert same <= 1


def test_allergy_never_proposed(page):
    w = gen(page, "{deuxJours:true, allergies:'arachide'}")
    bad = page.evaluate("(codes) => codes.filter(c => recipeBank().find(r => r.code === c)?.tags.includes('arachide'))",
                        [c for d in days(w) for c in d])
    assert bad == []


def test_history_window_avoids_recent(page):
    # ce qui a été servi la semaine d'avant passe après le reste
    first = gen(page)[0]
    used = {c: "2026-11-22" for d in first["plan"].values() for c in (d[2], d[4])}
    nxt = page.evaluate("(u) => generateCycle({deuxJours:true}, '2026-11-23', 1, u)", used)[0]
    assert not ({d[2] for d in nxt["plan"].values()} | {d[4] for d in nxt["plan"].values()}) & set(used)


def test_weeks_are_created_automatically(page, browser):
    new_user(page, "oui")
    st = page.evaluate("localStorage.getItem('oliweight.v2')")
    c = browser.new_context()
    c.add_init_script(FAKE_CLOCK % "2027-01-15T09:00:00")
    pg = c.new_page()
    pg.goto(page.url)
    pg.evaluate("([s]) => localStorage.setItem('oliweight.v2', s)", [st])
    pg.reload()
    pg.wait_for_timeout(400)
    s = pg.evaluate("JSON.parse(localStorage.getItem('oliweight.v2'))")
    assert s["current"]["startDate"] == "2027-01-11"
    assert len([w for w in s["weeks"] if w["startDate"] > "2027-01-15"]) >= 3
    hist = list(s["history"].values())
    assert s["current"]["basePlan"] != hist[-1]  # la semaine ne se répète pas
    c.close()


def test_published_cycle_untouched(page):
    load_state(page, fixture("backup-v2.0.3.json"))
    s = state(page)
    assert s["meta"].get("menusFrom") != "banque"
    assert page.evaluate("ensureFutureWeeks()") is False
