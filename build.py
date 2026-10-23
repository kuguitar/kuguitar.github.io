#!/usr/bin/env python3
"""고기부 홈페이지 빌드 — data/years/*.js + assets/ → 연주회별 정적 페이지.

    python3 build.py

입력 (이 저장소 안의 것이 전부다):
  data/years/<년도>.js      연주회 데이터. concerts 배열은 엄격한 JSON이어야 한다
                            (이 빌더가 "concerts: " 와 "});" 사이를 json.loads 로 읽는다).
  assets/scans/<슬러그>/     팜플렛 스캔 (NN.jpg|png, thumb/NN.jpg)
  assets/posters/<id>.webp  포스터

출력 (재생성되므로 손으로 고치지 말 것):
  concert/<슬러그>/index.html   연주회 상세 (SEO·OG·JSON-LD 포함)
  sitemap.xml

표준 라이브러리만 쓴다. 서버·DB 불필요 — GitHub Actions 와 로컬에서 동일하게 동작.
"""
import html, json, pathlib, re, shutil, unicodedata, urllib.parse

HERE = pathlib.Path(__file__).parent
SITE_URL = "https://kuguitar.com"   # canonical·og·sitemap 용. 끝에 / 없음

TYPE_LABEL = {"정기": "정기연주회", "신입": "신입생환영연주회", "교우": "교우연주회", "ETC": "그외 연주회"}


def esc(s):
    return html.escape(str(s if s is not None else ""), quote=True)


def clean_title(t):
    # js/site.js 의 titleOf() 와 같은 규칙
    t = re.sub(r"^0(\d)", r"\1", t).replace("_", " ")
    t = re.sub(r"\s*\*\s*", " · ", t)
    return re.sub(r"\s+", " ", t).strip()


def fmt_date(iso):
    y, m, d = iso.split("-")
    return f"{int(y)}년 {int(m)}월 {int(d)}일"


def youtube_embed(url):
    try:
        u = urllib.parse.urlparse(url)
        qs = urllib.parse.parse_qs(u.query)
        lst = qs.get("list", [None])[0]
        v = qs.get("v", [None])[0] or (u.path.lstrip("/") if u.hostname == "youtu.be" else None)
        if v:
            return f"https://www.youtube-nocookie.com/embed/{v}" + (f"?list={lst}" if lst else "")
        if lst:
            return f"https://www.youtube-nocookie.com/embed/videoseries?list={lst}"
    except Exception:
        pass
    return None


# ---------- 데이터 읽기 ----------

def load_concerts():
    """연도 파일의 concerts 배열(엄격한 JSON)을 모아 날짜순으로 돌려준다."""
    concerts = []
    for path in sorted((HERE / "data/years").glob("[0-9][0-9][0-9][0-9].js")):
        txt = path.read_text(encoding="utf-8")
        i = txt.find("concerts: [")
        if i < 0:
            continue
        body = txt[i + len("concerts: "):txt.rindex("});")]
        try:
            items = json.loads(body)
        except json.JSONDecodeError as e:
            raise SystemExit(f"{path.name}: concerts 배열이 JSON 이 아닙니다 — {e}")
        for c in items:
            for k in ("venue", "conductor", "poster", "video", "playlist", "slug"):
                c.setdefault(k, None)
            c.setdefault("program", [])
            concerts.append(c)
    concerts.sort(key=lambda c: (c.get("date") or "", c.get("id") or ""))
    return concerts


def attach_scans(concerts):
    """assets/scans/<슬러그>/ 디렉터리에서 스캔 목록을 만든다. 1번이 포스터, 나머지는 팜플렛."""
    for c in concerts:
        c["scans"] = []
        if not c["slug"]:
            continue
        d = HERE / "assets/scans" / c["slug"]
        if not d.is_dir():
            continue
        for i, p in enumerate(sorted(x for x in d.iterdir() if x.is_file()), 1):
            stem = p.stem
            c["scans"].append({
                "file": f"assets/scans/{c['slug']}/{p.name}",
                "thumb": f"assets/scans/{c['slug']}/thumb/{stem}.jpg",
                "kind": "포스터" if i == 1 else "팜플렛",
            })


# ---------- 연주회 상세 정적 페이지 ----------

PAGE = """<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <base href="../../">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title} · 고려대학교 고전기타부</title>
  <meta name="description" content="{desc}">
  <link rel="canonical" href="{url}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="{title} · 고려대학교 고전기타부">
  <meta property="og:description" content="{desc}">
  <meta property="og:url" content="{url}">
{og_image}  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#9e1b32">
  <link rel="icon" href="assets/photos/logo.webp">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
  <link rel="stylesheet" href="css/style.css">
  <script src="js/site.js"></script>
  <script type="application/ld+json">{jsonld}</script>
</head>
<body>
  <header id="site-header"></header>

  <main class="wrap">
    <div class="concert">
      <aside class="concert-aside"><div class="poster-frame">{poster}</div></aside>
      <article>
        <nav class="crumbs" aria-label="현재 위치"><a href="concerts/">연주회 아카이브</a><span>/</span><a href="concerts/?type={type}">{type_label}</a></nav>
        <span class="badge" data-type="{type}">{type_label}</span>
        <h1 class="concert-title">{title}</h1>
        <dl class="facts">{facts}</dl>
{actions}{embed}{program}
        <nav class="concert-nav" aria-label="이전·다음 연주회">{prev}{next}</nav>
      </article>
    </div>
  </main>

  <footer id="site-footer"></footer>
</body>
</html>
"""


def render_page(c, older, newer):
    title = clean_title(c["title"])
    tl = TYPE_LABEL.get(c["type"], c["type"])
    url = f"{SITE_URL}/concert/{c['slug']}/"
    npieces = sum(len(g.get("pieces", [])) for g in c["program"])
    desc = f"{fmt_date(c['date'])}"
    if c["venue"]: desc += f" · {c['venue']}"
    desc += f" — 고려대학교 고전기타부 {tl}"
    if npieces: desc += f". 프로그램 {npieces}곡 수록."

    fallback = (f'<div class="poster-fallback" aria-hidden="true"><span class="pf-year">{c["date"][:4]}</span>'
                f'<span class="pf-title">{esc(title)}</span></div>')
    poster = fallback
    if c["poster"]:
        poster += f'<img src="{esc(c["poster"])}" alt="{esc(title)} 포스터">'

    facts = "".join(f"<dt>{k}</dt><dd>{esc(v)}</dd>" for k, v in
                    [("구분", tl), ("일시", fmt_date(c["date"])), ("장소", c["venue"]), ("지휘", c["conductor"])] if v)

    ALLOW = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    pl = c["playlist"]
    actions = ""
    if pl:
        actions += (f'<button type="button" class="btn btn-primary" id="playlist-toggle" '
                    f'aria-expanded="false" aria-controls="player">재생목록 보기 · {len(pl["tracks"])}곡</button>')
    elif c["video"]:
        actions += (f'<a class="btn btn-primary" href="{esc(c["video"])}" target="_blank" rel="noopener">공연 영상 보기</a>')
    if c["scans"]:
        actions += (f'<a class="btn btn-ghost" href="concert/{c["slug"]}/#pamphlet">'
                    f'팜플렛 스캔 {len(c["scans"])}장 보기</a>')
    actions = f'        <div class="concert-actions">{actions}</div>\n' if actions else ""

    if pl:   # 재생목록 플레이어 + 트랙리스트 (기본 숨김, 버튼으로 토글)
        def dur(s): return f"{s // 60}:{s % 60:02d}" if s else ""
        tot_m = round(sum(t["d"] for t in pl["tracks"]) / 60)
        total = f"{tot_m // 60}시간 {tot_m % 60}분" if tot_m >= 60 else f"{tot_m}분"
        PLAY_SVG = ('<svg class="tp" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">'
                    '<path d="M7 4.5v15a1 1 0 0 0 1.5.9l12-7.5a1 1 0 0 0 0-1.8l-12-7.5A1 1 0 0 0 7 4.5z"/></svg>')
        lis = "".join(
            f'<li><button type="button" class="track" data-v="{esc(t["v"])}">'
            f'<span class="tno"><span class="tn">{i}</span>{PLAY_SVG}'
            f'<span class="eq" aria-hidden="true"><span></span><span></span><span></span></span></span>'
            f'<img class="tthumb" src="https://i.ytimg.com/vi/{esc(t["v"])}/mqdefault.jpg" alt="" '
            f'loading="lazy" decoding="async">'
            f'<span class="tt">{esc(t["t"])}</span><span class="td">{dur(t["d"])}</span></button></li>'
            for i, t in enumerate(pl["tracks"], 1))
        embed = (f'        <section class="player" id="player" data-list="{esc(pl["id"])}" hidden>\n'
                 f'        <div class="player-grid">\n'
                 f'        <div class="video-embed"><iframe id="player-frame" '
                 f'data-src="https://www.youtube-nocookie.com/embed/videoseries?list={esc(pl["id"])}" '
                 f'title="{esc(title)} 공연 영상" allow="{ALLOW}" allowfullscreen></iframe></div>\n'
                 f'        <aside class="tracklist"><div class="tracklist-head">'
                 f'<span class="tl-eyebrow">YouTube 재생목록</span><strong>{esc(pl["title"])}</strong>'
                 f'<span class="tl-meta">{len(pl["tracks"])}곡 · {total} · '
                 f'<a href="https://www.youtube.com/playlist?list={esc(pl["id"])}" target="_blank" '
                 f'rel="noopener">YouTube에서 열기 ↗</a></span></div><ol>{lis}</ol></aside>\n'
                 f'        </div></section>\n')
    else:
        embed_url = youtube_embed(c["video"]) if c["video"] else None
        embed = (f'        <div class="video-embed"><iframe src="{esc(embed_url)}" title="{esc(title)} 공연 영상" loading="lazy" '
                 f'allow="{ALLOW}" allowfullscreen></iframe></div>\n') if embed_url else ""

    groups = []
    for g in c["program"]:
        performers = g.get("performers", "")
        is_cond = performers.startswith("지휘")
        head = f'<div class="performers{" conductor" if is_cond else ""}">{esc(performers)}</div>' if performers else ""
        items = []
        for p in g.get("pieces", []):
            mv = ""
            if p.get("movements"):
                stripped = [re.sub(r"^\d+\s*\.\s*", "", m) for m in p["movements"]]
                mv = "<ul class=\"movements\">" + "".join(f"<li>{esc(m)}</li>" for m in stripped) + "</ul>"
            pv = ""
            for v_ in p.get("videos", []):
                emb = youtube_embed(v_["url"])
                if not emb:
                    continue
                length = f' <span class="pv-len">{esc(v_["length"])}</span>' if v_.get("length") else ""
                pv += (f'<details class="pv"><summary>'
                       f'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15a1 1 0 0 0 1.5.9l12-7.5a1 1 0 0 0 0-1.8l-12-7.5A1 1 0 0 0 7 4.5z"/></svg>'
                       f'공연 영상{length}</summary>'
                       f'<div class="pv-box" data-embed="{esc(emb)}">'
                       f'<a href="{esc(v_["url"])}" target="_blank" rel="noopener">유튜브에서 보기 ↗</a>'
                       f'</div></details>')
            items.append(f'<li class="piece"><span class="piece-title">{esc(p["title"])}</span>'
                         f'<span class="piece-composer">{esc(p.get("composer", ""))}</span>{mv}{pv}</li>')
        pieces = f'<ul class="pieces">{"".join(items)}</ul>' if items else ""
        roster = ""
        if g.get("roster"):
            rows = []
            for r in g["roster"]:
                m = re.match(r"^(\S+)\s+(.*)$", r)
                rows.append(f"<div><b>{esc(m.group(1))}</b><span>{esc(m.group(2))}</span></div>" if m else f"<div>{esc(r)}</div>")
            roster = f'<div class="roster">{"".join(rows)}</div>'
        groups.append(f'<div class="program-group">{head}{pieces}{roster}</div>')
    program = ('        <section class="program"><h2>프로그램</h2>' + "".join(groups) + "</section>\n") if groups else \
              ('        <section class="program"><h2>프로그램</h2><p style="padding:24px 0;color:var(--muted)">'
               "아직 정리된 프로그램이 없어요.</p></section>\n")

    if c["scans"]:
        cells = "".join(
            f'<a href="{esc(s["file"])}" target="_blank" rel="noopener">'
            f'<img src="{esc(s["thumb"])}" alt="{esc(title)} {"포스터" if s["kind"] == "포스터" else "팜플렛"} {i}쪽" '
            f'loading="lazy" decoding="async"></a>'
            for i, s in enumerate(c["scans"], 1))
        program += (f'        <section class="pamphlet" id="pamphlet"><h2>팜플렛</h2>'
                    f'<div class="scan-grid">{cells}</div></section>\n')

    def nav(x, cls, label):
        if not x: return "<div></div>"
        return (f'<a class="{cls}" href="concert/{x["slug"]}/"><span>{label}</span>'
                f'<strong>{esc(clean_title(x["title"]))}</strong></a>')

    img = c["poster"] or (c["scans"][0]["file"] if c["scans"] else None)
    jsonld = json.dumps({
        "@context": "https://schema.org", "@type": "Event", "name": title,
        "startDate": c["date"], "eventStatus": "https://schema.org/EventScheduled",
        "location": {"@type": "Place", "name": c["venue"]} if c["venue"] else None,
        "organizer": {"@type": "Organization", "name": "고려대학교 고전기타부", "url": SITE_URL},
        "image": f"{SITE_URL}/{img}" if img else None,
    }, ensure_ascii=False)
    og_image = f'  <meta property="og:image" content="{SITE_URL}/{img}">\n' if img else ""

    return PAGE.format(
        title=esc(title), desc=esc(desc), url=url, og_image=og_image, jsonld=jsonld,
        poster=poster, type=c["type"], type_label=tl, facts=facts,
        actions=actions, embed=embed, program=program,
        prev=nav(older, "prev", "← 이전 연주회"), next=nav(newer, "next", "다음 연주회 →"))


def main():
    concerts = load_concerts()
    attach_scans(concerts)
    missing = [c["title"] for c in concerts if not c["slug"]]
    if missing:
        raise SystemExit(f"slug 없는 연주회: {missing} — 연도 파일에 slug 를 넣어 주세요")

    outdir = HERE / "concert"
    if outdir.exists():
        shutil.rmtree(outdir)
    for i, c in enumerate(concerts):
        older = concerts[i - 1] if i > 0 else None
        newer = concerts[i + 1] if i + 1 < len(concerts) else None
        d = outdir / c["slug"]
        d.mkdir(parents=True)
        (d / "index.html").write_text(render_page(c, older, newer), encoding="utf-8")

    pages = ["", "about/", "concerts/", "students/", "alumni/", "people/", "notices/", "rules/"]
    urls = [f"{SITE_URL}/{p}" for p in pages] + [f"{SITE_URL}/concert/{c['slug']}/" for c in concerts]
    (HERE / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "".join(f"  <url><loc>{u}</loc></url>\n" for u in urls) + "</urlset>\n", encoding="utf-8")

    print(f"연주회 {len(concerts)}개 → concert/<슬러그>/index.html")
    print(f"sitemap.xml {len(urls)}개 URL")


if __name__ == "__main__":
    main()
