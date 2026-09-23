#!/usr/bin/env python3
"""validate_pack.py — checks a Manuscript Interrogator content pack against docs/CONTENT-PACK.md rules.
Handles both intake modes: manifest `mode: manuscript` (default, body = manuscript.md) and
`mode: topic` (body = review.md + scope.yaml; tiered references; synthesised figures).
Usage: python3 validate_pack.py <content-pack-dir>
Exit 1 on any error; warnings are informational (mirrors what Claude Code's build-content.ts must enforce)."""
import sys, re, os, glob, csv, json, collections
import yaml

root = sys.argv[1] if len(sys.argv) > 1 else "."
errors, warns = [], []
E = errors.append; W = warns.append
P = lambda *a: os.path.join(root, *a)

# ---------- manifest
m = yaml.safe_load(open(P("manifest.yaml")))
mode = m.get("mode", "manuscript")
if mode not in ("manuscript", "topic"): E(f"manifest: mode must be 'manuscript' or 'topic' (got {mode!r})")
if "mode" not in m: W("manifest: mode not set — defaulting to 'manuscript'")
TOPIC = mode == "topic"
req = ["slug", "title", "short_title", "authors", "venue", "year", "permissions", "builder", "github_account"]
if TOPIC: req += ["question", "purpose", "as_of"]
for k in req:
    if k not in m: E(f"manifest: missing {k}")
if not TOPIC and not (m.get("doi") or m.get("url")): E("manifest: doi or url required")
if TOPIC and "peer" not in str(m.get("venue", "")).lower():
    W("manifest: venue should make the non-peer-reviewed status unmissable (APP-SPEC §2)")
if not m.get("permissions", {}).get("text"): E("manifest: permissions.text is REQUIRED — no pack ships without it")
if not re.match(r"^[a-z0-9-]+$", m.get("slug", "")): E("manifest: slug must be kebab-case")
if not m.get("plain_abstract", "").strip(): W("manifest: plain_abstract empty")
delivery = m.get("delivery", "local")
if delivery not in ("local", "pages"): E(f"manifest: delivery must be 'local' or 'pages' (got {delivery!r})")
if "delivery" not in m: W("manifest: delivery not set — defaulting to 'local' (nothing will be published)")
if delivery == "pages" and str(m.get("permissions", {}).get("text", "")).strip().lower() in ("", "unknown", "tbd", "?"):
    E("manifest: delivery 'pages' requires a real permissions.text — nothing public ships from text of unknown provenance")

# ---------- body (manuscript.md | review.md | volumes/<id>/review.md)
VOLUMES = (m.get("volumes") or []) if TOPIC else []
if m.get("volumes") and not TOPIC: E("manifest: volumes are only allowed in topic mode")
vol_ids = [v.get("id") for v in VOLUMES]
if len(set(vol_ids)) != len(vol_ids): E(f"manifest: duplicate volume ids {vol_ids}")
bodies = []                                    # (label, text, volume id or None)
if VOLUMES:
    BODY = "volumes/*/review.md"
    if os.path.exists(P("review.md")): E("pack: review.md must not exist alongside volumes — each volume has its own file")
    for v in VOLUMES:
        vid = v.get("id", "")
        if not re.match(r"^v\d+$", vid): E(f"manifest: volume id {vid!r} must be v0, v1, …")
        if not v.get("title"): E(f"manifest: volume {vid} needs a title")
        st = v.get("status")
        if st not in ("ready", "planned"): E(f"manifest: volume {vid} status must be ready | planned (got {st!r})")
        f = P("volumes", vid, "review.md")
        if st == "ready":
            if not os.path.exists(f): E(f"volume {vid}: status ready but volumes/{vid}/review.md is missing")
            else: bodies.append((f"volumes/{vid}/review.md", open(f, encoding="utf-8").read(), vid))
        elif os.path.exists(f):
            W(f"volume {vid}: planned but volumes/{vid}/review.md exists — it will not be rendered")
    if not bodies: E("manifest: volumes declared but none is ready")
else:
    BODY = "review.md" if TOPIC else "manuscript.md"
    if not os.path.exists(P(BODY)):
        print(f"ERROR pack: {BODY} missing — mode {mode!r} expects it"); sys.exit(1)
    bodies.append((BODY, open(P(BODY), encoding="utf-8").read(), None))
md = "\n\n".join(b[1] for b in bodies)
sections = re.findall(r"<!-- section: ([a-z0-9-]+) -->", md)
dups = [s for s, c in collections.Counter(sections).items() if c > 1]
if dups: E(f"{BODY}: duplicate section ids {dups}")
section_volume = {}
for label, text, vid in bodies:
    for sid in re.findall(r"<!-- section: ([a-z0-9-]+) -->", text):
        section_volume[sid] = vid
        if vid and not sid.startswith(vid + "-"): E(f"{label}: section id {sid!r} must start with '{vid}-'")
fig_markers = re.findall(r"<!-- figure: ([a-z0-9-]+) -->", md)

# ---------- topic mode: citation coverage of every review body (CONTENT-PACK §review.md, APP-SPEC §6.1)
blocks_total = blocks_cited = blocks_framing = 0
synthesis_blocks = []
per_volume = collections.Counter()
if TOPIC:
  for label, text, vid in bodies:
    raw, cur, fence = [], [], False
    for line in text.split("\n"):
        if line.strip().startswith("```"): fence = not fence
        if not line.strip() and not fence:
            if cur: raw.append("\n".join(cur)); cur = []
        else: cur.append(line)
    if cur: raw.append("\n".join(cur))
    marker = None
    for b in raw:
        st = b.strip()
        txt = re.sub(r"<!--.*?-->", "", b, flags=re.S).strip()
        if not txt:                       # comment-only block: the marker applies to the next one
            marker = "framing" if "framing" in st else ("synthesis" if "synthesis" in st else None)
            continue
        if txt.startswith("#") or txt.startswith("```") or txt.startswith("|"):
            marker = None; continue
        framing = marker == "framing" or "<!-- framing -->" in b
        synth = marker == "synthesis" or "<!-- synthesis -->" in b
        words = len(re.findall(r"[A-Za-z][A-Za-z'’-]+", txt))
        cited = bool(re.search(r"\[\d", txt))
        blocks_total += 1
        per_volume[(vid, "words")] += words
        if cited: blocks_cited += 1
        if framing: blocks_framing += 1
        if synth: synthesis_blocks.append(txt.strip()[:60])
        if words >= 25 and not cited and not framing:
            E(f"{label}: uncited block of {words} words — cite it or mark it <!-- framing -->: {txt.strip()[:70]!r}")
        marker = None
  if blocks_framing > 0.25 * max(blocks_total, 1):
      W(f"review: {blocks_framing}/{blocks_total} blocks marked framing — framing must carry no claims of fact")
  for q in re.findall(r"[“\"]([^”\"\n]{4,})[”\"]", md):
      if len(q.split()) > 25: E(f"review: quotation longer than 25 words: {q[:60]!r}")

# ---------- topic mode: scope.yaml
scope = None
if TOPIC:
    if not os.path.exists(P("scope.yaml")):
        E("scope.yaml missing — required in topic mode (it is what /methods publishes)")
    else:
        scope = yaml.safe_load(open(P("scope.yaml"))) or {}
        req_scope = ["topic", "question", "boundary", "time_window", "depth"]
        if not VOLUMES: req_scope += ["search_strategy", "corpus_profile"]
        for k in req_scope:
            if k not in scope: E(f"scope: missing {k}")
        b = scope.get("boundary") or {}
        if not b.get("in"): E("scope: boundary.in is empty — the scope must say what is in")
        if not b.get("out"): E("scope: boundary.out is empty — the scope must say what was deliberately left out")
        DEPTHS = ("brief", "standard", "deep", "textbook")
        def check_strategy(ss, where):
            for k in ("run_on", "sources", "queries", "inclusion", "exclusion"):
                if k not in ss: E(f"scope: {where}search_strategy.{k} missing")
            for q in ss.get("queries") or []:
                if not q.get("q") or "hits" not in q: E(f"scope: every query needs q + hits (got {q})")
        if "search_strategy" in scope or not VOLUMES:
            check_strategy(scope.get("search_strategy") or {}, "")
        if scope.get("depth") not in DEPTHS: E("scope: depth must be brief | standard | deep | textbook")
        if scope.get("depth") == "textbook" and not VOLUMES: E("scope: depth textbook is only allowed for volume packs")
        sv = scope.get("volumes") or {}
        for v in VOLUMES:
            vid = v.get("id"); vs = sv.get(vid)
            if v.get("status") != "ready": continue
            if not vs: E(f"scope: volumes.{vid} missing for a ready volume"); continue
            if vs.get("depth") not in DEPTHS: E(f"scope: volumes.{vid}.depth must be one of {DEPTHS}")
            for k in ("search_strategy", "corpus_profile"):
                if k not in vs: E(f"scope: volumes.{vid}.{k} missing")
            check_strategy(vs.get("search_strategy") or {}, f"volumes.{vid}.")
            if not vs.get("outline_approved"):
                (E if vs.get("depth") == "textbook" else W)(f"scope: volumes.{vid}.outline_approved not set — the outline must be approved before prose (TOPIC-WORKFLOW TV)")
        for vid in sv:
            if vid not in vol_ids: E(f"scope: volumes.{vid} is not a manifest volume")
        if scope.get("assumed"): W("scope: assumed=true — the interview went unanswered; defaults must be shown on /methods")
elif os.path.exists(P("scope.yaml")):
    W("scope.yaml present but mode is manuscript — it will not be rendered")

cites = set()
for c in re.findall(r"\[(\d+(?:[,–]\d+)*)\]", re.sub(r"<!--.*?-->", "", md)):
    for part in c.split(","):
        a, b = (part.split("–") + [None])[:2]
        rng = range(int(a), int(b) + 1) if b else [int(a)]
        cites.update(rng)

# ---------- glossary
g = yaml.safe_load(open(P("glossary.yaml")))
gid = {}
for t in g:
    for k in ("id", "term", "kind", "short", "definition"):
        if k not in t: E(f"glossary: {t.get('id')} missing {k}")
    if t["id"] in gid: E(f"glossary: duplicate id {t['id']}")
    gid[t["id"]] = t
    if len(t["short"]) > 200: E(f"glossary: {t['id']} short > 200 chars ({len(t['short'])})")
    if t["kind"] not in ("science", "methods", "statistics", "notation", "drug"): E(f"glossary: {t['id']} bad kind {t['kind']}")
owner = {}
for t in g:
    for v in [t["term"]] + (t.get("variants") or []):
        key = v.lower()
        if key in owner and owner[key] != t["id"]: E(f"glossary: variant collision {v!r} between {owner[key]} and {t['id']}")
        owner[key] = t["id"]
for t in g:
    for s in t.get("see") or []:
        if s not in gid: E(f"glossary: {t['id']} see -> unknown {s}")

# ---------- concepts
concepts = {}
concept_cites = set()
for f in sorted(glob.glob(P("concepts", "*.md"))):
    s = open(f, encoding="utf-8").read()
    if not s.startswith("---"): E(f"concept {f}: no frontmatter"); continue
    fm = yaml.safe_load(s.split("---", 2)[1])
    cid = fm.get("id"); concepts[cid] = fm
    if cid != os.path.basename(f)[:-3]: E(f"concept {f}: id != filename")
    for k in ("title", "one_liner", "why_here", "prerequisites", "terms", "figures", "further_reading", "self_check"):
        if k not in fm: E(f"concept {cid}: missing {k}")
    if len(fm.get("self_check") or []) < 1: E(f"concept {cid}: needs ≥1 self_check")
    if len(fm.get("further_reading") or []) < 2: E(f"concept {cid}: needs ≥2 further_reading")
    for q in fm.get("self_check") or []:
        if not (0 <= q.get("answer", -1) < len(q.get("options", []))): E(f"concept {cid}: self_check answer index out of range")
    for term in fm.get("terms") or []:
        if term not in gid: E(f"concept {cid}: unknown term {term}")
    body = s.split("---", 2)[2]
    if "## What it is" not in body: W(f"concept {cid}: missing section '## What it is'")
    if not ("## How this paper uses it" in body or "## How this volume uses it" in body):
        W(f"concept {cid}: missing section '## How this paper/volume uses it'")
    if m.get("concept_levels"):
        for lv in ("L1", "L2", "L3", "L4"):
            if not re.search(rf"^## {lv}\b", body, flags=re.M): E(f"concept {cid}: concept_levels is on but '## {lv} …' is missing")
    prose = re.sub(r"\$\$.*?\$\$|\$[^$\n]*\$", " ", body, flags=re.S)   # KaTeX spans use [0,1] intervals
    for c in re.findall(r"\[(\d+(?:[,–]\d+)*)\]", prose) if TOPIC else []:
        ns = [int(x) for x in re.split(r"[,–]", c)]
        if 0 in ns: continue                                                # an interval, not a citation
        concept_cites.update(ns)
for cid, fm in concepts.items():
    for p in fm.get("prerequisites") or []:
        if p not in concepts: E(f"concept {cid}: unknown prerequisite {p}")
for t in g:
    c = t.get("concept")
    if c and c not in concepts: E(f"glossary: {t['id']} concept -> unknown {c}")

# ---------- figures
figs = yaml.safe_load(open(P("figures.yaml")))
fid = {}
KINDS = ("chart", "table", "network", "pathway", "image")
for f in figs:
    for k in ("id", "label", "title", "kind", "caption", "how_to_read", "source"):
        if k not in f: E(f"figure {f.get('id')}: missing {k}")
    if f["kind"] not in KINDS: E(f"figure {f['id']}: bad kind {f['kind']}")
    fid[f["id"]] = f
    if TOPIC:
        syn = f.get("synthesis")
        if syn not in ("data", "conceptual"):
            E(f"figure {f['id']}: topic mode needs synthesis: data | conceptual (got {syn!r})")
        if not f.get("refs"):
            E(f"figure {f['id']}: topic mode needs refs: [n, …] — a figure with no references does not ship")
        if f["kind"] == "image" and "permission" not in str(m.get("permissions", {}).get("figures", "")).lower():
            E(f"figure {f['id']}: kind image in topic mode needs explicit permission in manifest.permissions.figures")
        if syn == "data" and f.get("data", "").endswith(".csv") and os.path.exists(P(f["data"])):
            cols = list(csv.DictReader(open(P(f["data"]), encoding="utf-8")).fieldnames or [])
            if "ref" not in cols:
                E(f"figure {f['id']}: synthesis data csv needs a 'ref' column so every row is traceable (cols: {cols})")
    if f["kind"] in ("chart", "table", "network", "pathway"):
        d = f.get("data")
        if not d: E(f"figure {f['id']}: {f['kind']} needs data")
        elif not os.path.exists(P(d)): E(f"figure {f['id']}: data file missing {d}")
        else:
            if d.endswith(".csv"):
                rows = list(csv.DictReader(open(P(d), encoding="utf-8")))
                if not rows: E(f"figure {f['id']}: empty csv")
                fields = rows[0].keys()
                for col in f.get("columns") or []:
                    if col["field"] not in fields: E(f"figure {f['id']}: column field {col['field']} not in csv")
            elif d.endswith(".json"):
                j = json.load(open(P(d)))
                ids = {n["id"] for n in j["nodes"]}
                for e in j["edges"]:
                    for end in ("from", "to"):
                        if e[end] not in ids: E(f"figure {f['id']}: edge endpoint {e[end]} unknown")
                    if e.get("via") and e["via"] not in ids: E(f"figure {f['id']}: via {e['via']} unknown")
                for n in j["nodes"]:
                    if n.get("term") and n["term"] not in gid: E(f"figure {f['id']}: node term {n['term']} unknown")
        ch = f.get("chart")
        if ch and ch.get("data") and not os.path.exists(P(ch["data"])): E(f"figure {f['id']}: chart data missing {ch['data']}")
    if f["kind"] == "image":
        if not f.get("image") or not os.path.exists(P(f["image"])): E(f"figure {f['id']}: image missing")
        if not f.get("hotspots"): E(f"figure {f['id']}: image needs ≥1 hotspot")
        for pnl in f.get("panels") or []:
            if not os.path.exists(P(pnl["image"])): E(f"figure {f['id']}: panel image missing {pnl['image']}")
    if f.get("image") and not os.path.exists(P(f["image"])): E(f"figure {f['id']}: image path missing {f['image']}")
    for ex in f.get("explain") or []:
        if ex.get("term") and ex["term"] not in gid: E(f"figure {f['id']}: explain term {ex['term']} unknown")
        if ex.get("concept") and ex["concept"] not in concepts: E(f"figure {f['id']}: explain concept {ex['concept']} unknown")
    for hs in f.get("hotspots") or []:
        if hs.get("term") and hs["term"] not in gid: E(f"figure {f['id']}: hotspot term {hs['term']} unknown")
    for c in f.get("concepts") or []:
        if c not in concepts: E(f"figure {f['id']}: concept {c} unknown")
    for s in f.get("discussed_in") or []:
        if s not in sections: E(f"figure {f['id']}: discussed_in section {s} unknown")
    for n in f.get("cites") or []: cites.add(n)
for fm in fig_markers:
    if fm not in fid: E(f"manuscript: figure marker {fm} not in figures.yaml")
for f in figs:
    if f["id"] not in fig_markers: W(f"figure {f['id']} has no marker in {BODY}")
for cid, fm in concepts.items():
    for fg in fm.get("figures") or []:
        if fg not in fid: E(f"concept {cid}: unknown figure {fg}")

# ---------- references
cites |= concept_cites
refs = yaml.safe_load(open(P("references.yaml")))
rn = {}
for r in refs:
    if r["n"] in rn: E(f"references: duplicate n {r['n']}")
    rn[r["n"]] = r
    if not (r.get("doi") or r.get("url")): E(f"references/{r['n']}: doi or url required")
    if not r.get("summary", "").strip():
        if r.get("verified"): E(f"references/{r['n']}: no summary")
        else: W(f"references/{r['n']}: no summary (unverified)")
    if r.get("role_here") not in ("support", "method", "contrast", "prior-result", "data-source", "background", "guideline", "review", "consensus"):
        E(f"references/{r['n']}: bad role_here")
    if TOPIC:
        tier = r.get("tier")
        if tier not in ("seminal", "classic", "current", "background"):
            E(f"references/{r['n']}: topic mode needs tier: seminal | classic | current | background (got {tier!r})")
        if not r.get("year"): E(f"references/{r['n']}: topic mode needs year")
        if tier in ("seminal", "classic"):
            if len(str(r.get("summary", "")).split()) < 30:
                E(f"references/{r['n']}: {tier} tier needs a full summary (3–6 sentences)")
            if tier == "seminal" and not str(r.get("why_it_mattered", "")).strip():
                E(f"references/{r['n']}: seminal tier needs why_it_mattered")
        cur_from = ((scope or {}).get("time_window") or {}).get("current_from")
        if tier == "current" and cur_from and r.get("year") and r["year"] < cur_from:
            W(f"references/{r['n']}: tier current but year {r['year']} predates scope current_from {cur_from}")
        if not r.get("verified") and r["n"] in cites:
            E(f"references/{r['n']}: cited in {BODY} but verified: false — no claim may rest on an unverified reference")
    for s in r.get("cited_in") or []:
        if s not in sections and s not in fid: E(f"references/{r['n']}: cited_in {s} unknown")
for f in figs:
    for n in f.get("refs") or []:
        if n not in rn: E(f"figure {f['id']}: refs -> [{n}] has no reference entry")
for n in sorted(cites):
    if n not in rn: E(f"{BODY} cites [{n}] with no reference entry")
for n in rn:
    if n not in cites: W(f"reference {n} never cited in text/captions")

# ---------- claims.yaml (CONTENT-PACK v0.4)
claims_n = 0; claims_status = collections.Counter(); threatens_pairs = []
if os.path.exists(P("claims.yaml")):
    if not TOPIC: E("claims.yaml is only allowed in topic mode")
    cy = yaml.safe_load(open(P("claims.yaml"))) or {}
    voc = cy.get("vocabulary") or {}
    for k in ("node_types", "predicates", "levels", "evidence"):
        if not voc.get(k): E(f"claims: vocabulary.{k} missing or empty")
    rival_ids, rival_used = {}, set()
    hids = set()
    for h in cy.get("hypotheses") or []:
        hid = h.get("id")
        if hid in hids: E(f"claims: duplicate hypothesis id {hid}")
        hids.add(hid)
        if not h.get("question"): E(f"claims: hypothesis {hid} needs a question")
        rv = h.get("rivals") or []
        if len(rv) < 2: E(f"claims: hypothesis {hid} needs ≥ 2 rivals")
        for r in rv:
            if r.get("id") in rival_ids: E(f"claims: duplicate rival id {r.get('id')}")
            rival_ids[r.get("id")] = hid
            for n in r.get("refs") or []:
                if n not in rn: E(f"claims: rival {r.get('id')} refs [{n}] has no reference entry")
        if h.get("section") and h["section"] not in sections: E(f"claims: hypothesis {hid} section {h['section']} unknown")
    seen = set()
    for c in cy.get("claims") or []:
        cid = c.get("id"); claims_n += 1
        if not cid: E("claims: every claim needs an id"); continue
        if cid in seen: E(f"claims: duplicate id {cid}")
        seen.add(cid)
        for end in ("subject", "object"):
            node = c.get(end) or {}
            if not node.get("label"): E(f"claims/{cid}: {end}.label missing")
            if node.get("type") not in (voc.get("node_types") or []): E(f"claims/{cid}: {end}.type {node.get('type')!r} not in vocabulary")
            if node.get("term") and node["term"] not in gid: E(f"claims/{cid}: {end}.term {node['term']} unknown")
            if node.get("xref") and not re.match(r"^[A-Za-z][A-Za-z0-9_.-]*:\S+$", str(node["xref"])): E(f"claims/{cid}: {end}.xref {node['xref']!r} is not a CURIE")
        for k, vk in (("predicate", "predicates"), ("level", "levels"), ("evidence", "evidence")):
            if c.get(k) not in (voc.get(vk) or []): E(f"claims/{cid}: {k} {c.get(k)!r} not in vocabulary.{vk}")
        if not c.get("refs"): E(f"claims/{cid}: refs required")
        for n in c.get("refs") or []:
            if n not in rn: E(f"claims/{cid}: refs [{n}] has no reference entry")
            elif not rn[n].get("verified"): E(f"claims/{cid}: refs [{n}] is verified: false — no claim may rest on it")
        if c.get("section") not in sections: E(f"claims/{cid}: section {c.get('section')!r} unknown")
        if not c.get("species"): W(f"claims/{cid}: species not stated")
        st = c.get("status"); claims_status[st] += 1
        if st not in ("supported", "contested", "inferred"): E(f"claims/{cid}: status must be supported | contested | inferred")
        if st == "contested":
            if c.get("hypothesis") not in rival_ids: E(f"claims/{cid}: contested claims need hypothesis = an existing rival id (got {c.get('hypothesis')!r})")
            else: rival_used.add(c["hypothesis"])
        elif c.get("hypothesis"):
            if c["hypothesis"] in rival_ids: rival_used.add(c["hypothesis"])
            else: E(f"claims/{cid}: hypothesis {c['hypothesis']!r} unknown")
        inferred = st == "inferred"; flagged = bool(c.get("synthesis")) or c.get("evidence") == "inferred"
        if inferred != flagged: E(f"claims/{cid}: status inferred ⇔ synthesis: true or evidence: inferred")
        # CONTENT-PACK v0.8 — n-ary claim roles
        MED_ROLES = ("proposed_primary", "named_rival", "required_relay", "permissive_gate")
        med = c.get("mediator")
        if med is not None:
            if not isinstance(med, list) or not med: E(f"claims/{cid}: mediator must be a non-empty list")
            elif len(med) > 3: E(f"claims/{cid}: mediator takes at most 3 entries (got {len(med)})")
            else:
                for i, mn in enumerate(med):
                    w = f"claims/{cid}: mediator[{i}]"
                    if not isinstance(mn, dict): E(f"{w} must be a node mapping"); continue
                    if not mn.get("label"): E(f"{w}.label missing")
                    if mn.get("type") not in (voc.get("node_types") or []): E(f"{w}.type {mn.get('type')!r} not in vocabulary")
                    if mn.get("term") and mn["term"] not in gid: E(f"{w}.term {mn['term']} unknown")
                    if mn.get("xref") and not re.match(r"^[A-Za-z][A-Za-z0-9_.-]*:\S+$", str(mn["xref"])): E(f"{w}.xref {mn['xref']!r} is not a CURIE")
                    if mn.get("role") not in MED_ROLES: E(f"{w}.role must be one of {' | '.join(MED_ROLES)} (got {mn.get('role')!r})")
        elif c.get("predicate") == "couples_via":
            W(f"claims/{cid}: couples_via claim has no mediator (CONTENT-PACK v0.8)")
        thr = c.get("threatens")
        if thr is not None:
            is_confound = c.get("predicate") == "confounds" or (c.get("subject") or {}).get("type") == "Confound"
            if not is_confound: E(f"claims/{cid}: threatens is only allowed on a confound claim")
            if not isinstance(thr, list) or not thr: E(f"claims/{cid}: threatens must be a non-empty list of claim ids")
            else:
                for target in thr:
                    if target == cid: E(f"claims/{cid}: a claim may not threaten itself")
                    threatens_pairs.append((cid, target))
        elif c.get("threatens_note"): E(f"claims/{cid}: threatens_note without threatens")
        for n in c.get("refs") or []: cites.add(n)
    for src, target in threatens_pairs:
        if target not in seen: E(f"claims/{src}: threatens [{target}] is not a claim id")
    for r in rival_ids:
        if r not in rival_used: W(f"claims: rival {r} is used by no claim")
    covered = {c.get("section") for c in cy.get("claims") or []}
    for vid in {v for v in section_volume.values() if v}:
        n_vol = sum(1 for sid, v in section_volume.items() if v == vid and sid in covered)
        if n_vol == 0: W(f"claims: volume {vid} has no claims yet")
elif VOLUMES:
    E("claims.yaml missing — required for volume packs (CONTENT-PACK v0.4)")

# ---------- todo
if os.path.exists(P("todo.yaml")):
    todo = yaml.safe_load(open(P("todo.yaml")))
    for t in todo:
        if not (t.get("where") and t.get("what")): E("todo: entries need where + what")
    unverified = [r["n"] for r in refs if not r.get("verified")]
    covered = {t["where"] for t in todo}
    for n in unverified:
        if f"references/{n}" not in covered: W(f"references/{n} unverified but not in todo.yaml")

# ---------- coverage report
body = re.sub(r"<!--.*?-->", "", md)
hits = collections.Counter()
for t in g:
    for v in [t["term"]] + (t.get("variants") or []):
        if re.search(r"(?<![\w-])" + re.escape(v) + r"(?![\w-])", body, flags=re.I): hits[t["id"]] += 1
unmatched = [t["id"] for t in g if not hits[t["id"]]]

print(f"pack: {m['slug']}  mode={mode}  sections={len(sections)} figures={len(figs)} terms={len(g)} concepts={len(concepts)} refs={len(refs)}")
if TOPIC:
    tiers = collections.Counter(r.get("tier") for r in refs)
    if VOLUMES:
        print("volumes: " + ", ".join(f"{v.get('id')}={v.get('status')}" + (f"/{per_volume[(v.get('id'),'words')]}w" if v.get('status')=='ready' else '') for v in VOLUMES))
    if os.path.exists(P("claims.yaml")):
        print(f"claims: {claims_n} {dict(claims_status)}")
    print(f"topic: as_of={m.get('as_of')} tiers={dict(tiers)} blocks={blocks_total} cited={blocks_cited} "
          f"framing={blocks_framing} synthesis={len(synthesis_blocks)} "
          f"figures_synthesis={dict(collections.Counter(f.get('synthesis') for f in figs))}")
print(f"refs verified={sum(1 for r in refs if r.get('verified'))} doi_confirmed={sum(1 for r in refs if r.get('doi_confirmed'))} cited={len(cites)}")
print(f"glossary terms matched in text: {len(g)-len(unmatched)}/{len(g)}  unmatched: {unmatched}")
for w in warns: print("WARN ", w)
for e in errors: print("ERROR", e)
print(f"{len(errors)} errors, {len(warns)} warnings")
sys.exit(1 if errors else 0)
