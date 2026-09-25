/* Shared runtime for every Hotaru page: the language, text lookup, times, days and money in the
   restaurant's time zone, the price and open state right now, the seven-segment readout, icons and
   the placeholder drawings. A page script reads what it needs from window.Hotaru and calls boot(). */
(() => {
  const D = HOTARU;
  // Set by tools/snapshot.mjs: render with no clock, so the saved copy reads right with no script
  // (iOS Files and Quick Look show an AirDropped page without running JavaScript).
  const STATIC = window.HOTARU_STATIC === true;

  /* ---- language: ?lang= first, then the visitor's last pick, then the browser's languages ---- */
  const byCode = c => D.languages.find(l => l.code === c);
  const saved = {
    get() { try { return localStorage.getItem("hotaru-lang"); } catch { return null; } },
    set(v) { try { localStorage.setItem("hotaru-lang", v); } catch { /* private mode: the ?lang= links still carry it */ } },
  };
  const asked = byCode(new URLSearchParams(location.search).get("lang"));
  if (asked && !STATIC) saved.set(asked.code);
  const auto = (navigator.languages || []).map(t => byCode(String(t).slice(0, 2).toLowerCase())).find(Boolean) || D.languages[0];
  const LANG = STATIC ? D.languages[0] : asked || byCode(saved.get()) || auto;
  const L = LANG.code, LOC = LANG.intl;

  const fill = (s, vars) => Object.entries(vars).reduce((out, [k, v]) => out.replaceAll(`{${k}}`, v), s);
  const tr = (o, vars = {}) => fill((o && (o[L] ?? o.en)) ?? "", vars);
  const ui = (k, vars) => tr(D.ui[k], vars);
  const esc = s => String(s).replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
  const $ = id => document.getElementById(id);

  const tbc = v => v.confirmed === true ? "" : `<span class="tbc">${esc(ui("toConfirm"))}</span>`;
  const mark = v => v.sample ? `<span class="tbc">${esc(ui("sample"))}</span>` : tbc(v);

  /* ---- time ---- */
  const mins = s => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };
  const at = s => { const [h, m] = s.split(":").map(Number); return new Date(Date.UTC(2020, 0, 1, h, m)); };
  const hourFmt = (...ts) => new Intl.DateTimeFormat(LOC, {
    hour: "numeric", minute: ts.every(t => t.endsWith(":00")) ? undefined : "2-digit", timeZone: "UTC" });
  // No-break spaces inside each time; the only line break falls after the range dash.
  const glue = s => s.replace(/ /g, "\u00a0").replace(/\s*–\s*/g, "\u00a0– ");
  const time = t => glue(hourFmt(t).format(at(t)));
  const span = (a, b) => {
    const f = hourFmt(a, b);
    return glue(f.formatRange ? f.formatRange(at(a), at(b)) : `${f.format(at(a))} – ${f.format(at(b))}`);
  };
  const dayName = (d, weekday = "short") =>
    new Intl.DateTimeFormat(LOC, { weekday, timeZone: "UTC" }).format(new Date(Date.UTC(2023, 0, 1 + d)));
  const WEEK = [1, 2, 3, 4, 5, 6, 0];
  const days = list => {
    if (list.length === 7) return ui("daily");
    const runs = [];
    for (const p of list.map(d => WEEK.indexOf(d)).sort((a, b) => a - b)) {
      const r = runs[runs.length - 1];
      if (r && p === r[1] + 1) r[1] = p; else runs.push([p, p]);
    }
    return runs.map(([a, b]) => a === b ? dayName(WEEK[a]) : `${dayName(WEEK[a])}–${dayName(WEEK[b])}`).join(", ");
  };

  const clockFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: D.timeZone, weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23" });
  const clock = () => {
    const now = new Date();
    const p = Object.fromEntries(clockFmt.formatToParts(now).map(x => [x.type, x.value]));
    return { now, day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday),
             min: (Number(p.hour) % 24) * 60 + Number(p.minute) };
  };
  const hoursOn = d => D.hours.find(h => h.days.includes(d));
  // Price periods inside the day's opening hours. A day with no hours is closed and has none.
  const periodsOn = d => {
    const h = hoursOn(d);
    return h ? D.periods.filter(p => p.days.includes(d) && mins(p.start) >= mins(h.open) && mins(p.end) <= mins(h.close))
      .sort((a, b) => mins(a.start) - mins(b.start)) : [];
  };

  // The price that applies now, or else the next one to start.
  function priceState({ day, min }) {
    const now = periodsOn(day).find(p => min >= mins(p.start) && min < mins(p.end));
    if (now) return { period: now, next: false };
    for (let off = 0; off < 8; off++) {
      const d = (day + off) % 7;
      const p = periodsOn(d).find(p => off > 0 || mins(p.start) > min);
      if (p) return { period: p, next: true, off, d };
    }
    return null;
  }
  const dayWord = (off, d) => off === 1 ? ui("tomorrow") : dayName(d, "long");
  function openState({ day, min }) {
    const h = hoursOn(day);
    if (h && min >= mins(h.open) && min < mins(h.close)) return { open: true, text: ui("openNow", { time: time(h.close) }), quoted: h };
    if (h && min < mins(h.open)) return { open: false, text: ui("opensAt", { time: time(h.open) }), quoted: h };
    for (let off = 1; off < 8; off++) {
      const d = (day + off) % 7, n = hoursOn(d);
      if (n) return { open: false, text: ui(h ? "closedToday" : "closedAllDay", { day: dayWord(off, d), time: time(n.open) }), quoted: n };
    }
    return { open: false, text: "", quoted: null };
  }

  /* ---- readouts ---- */
  // narrowSymbol: "$", not "US$", in every language (zh-Hans-US and ko-US default to "US$").
  const money = new Intl.NumberFormat(LOC, { style: "currency", currency: D.currency, currencyDisplay: "narrowSymbol" });
  function readout(price, cls = "readout") {
    if (price.amount == null && cls === "kprice" && price.confirmed !== true) return `<span class="kprice">${tbc(price)}</span>`;
    if (price.amount == null) {
      return `<span class="${cls}">${price.confirmed === true ? "" : `<span class="vh">${esc(ui("priceTbc"))}</span>`}<span class="seg" aria-hidden="true"><span class="ghost">88<span class="dp">.</span>88</span><span class="lit">--<span class="dp">.</span>--</span></span></span>`;
    }
    const parts = money.formatToParts(price.amount);
    const cur = parts.filter(p => p.type === "currency").map(p => p.value).join("");
    const num = parts.filter(p => ["integer", "group", "decimal", "fraction"].includes(p.type));
    const digits = map => num.map(p => p.type === "decimal" ? `<span class="dp">${esc(p.value)}</span>` : esc(map(p.value))).join("");
    return `<span class="${cls}"><span class="vh">${esc(money.format(price.amount))}</span>` +
      `<span class="cur" aria-hidden="true">${esc(cur)}</span>` +
      `<span class="seg" aria-hidden="true"><span class="ghost">${digits(v => v.replace(/\d/g, "8"))}</span><span class="lit">${digits(v => v)}</span></span></span>`;
  }

  /* ---- drawings for empty photo slots ---- */
  const amber = 'fill="var(--amber)" stroke="none"';
  const POT = `<path d="M80 36c-5-6 5-10 0-16s5-10 0-16"/><path d="M100 32c-5-6 5-10 0-16s5-10 0-16" opacity=".6"/><path d="M120 36c-5-6 5-10 0-16s5-10 0-16"/>` +
    `<path d="M52 46h96"/><path d="M56 46v4c0 13 14 22 30 22h28c16 0 30-9 30-22v-4"/><path d="M44 48h8M148 48h8"/><path d="M66 54h68" opacity=".5"/>` +
    `<rect x="40" y="78" width="120" height="14" rx="3"/><circle cx="146" cy="85" r="2.6" ${amber}/>`;
  const GRILL = `<circle cx="78" cy="24" r="2" ${amber}/><circle cx="112" cy="12" r="1.6" ${amber}/><circle cx="128" cy="30" r="2.2" ${amber}/><circle cx="94" cy="6" r="1.3" ${amber} opacity=".7"/>` +
    `<ellipse cx="100" cy="54" rx="58" ry="14"/><path d="M50 54h100M58 47h84M58 61h84" opacity=".6"/>` +
    `<path d="M62 67l5 15h66l5-15"/><rect x="40" y="82" width="120" height="10" rx="3"/>`;
  const svg = inner => `<svg viewBox="0 0 200 100" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
  const ART = {
    pot: () => svg(POT),
    grill: () => svg(GRILL),
    both: () => svg(`<g transform="translate(-2 24) scale(.56)">${POT}</g><g transform="translate(88 24) scale(.56)">${GRILL}</g>`),
  };
  const ICON = {
    directions: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    call: '<path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    waitlist: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  };
  const icon = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg>`;

  /* ---- site chrome: strip, header, page nav, footer, actions ---- */
  const R = D.restaurant;
  const root = document.body.dataset.root || "";
  // Links carry ?lang= whenever the language differs from the browser's own pick, so the
  // choice survives page to page even when storage is blocked.
  const langQuery = L === auto.code ? "" : `?lang=${L}`;
  const href = id => { const n = D.nav.find(x => x.id === id); return (n.slug ? `${root}${n.slug}/` : root || "./") + langQuery; };
  const dateFmt = new Intl.DateTimeFormat("en-CA", { timeZone: D.timeZone, year: "numeric", month: "2-digit", day: "2-digit" });
  const today = () => dateFmt.format(new Date()); // YYYY-MM-DD at the restaurant
  const promoLive = () => !STATIC && D.promo && today() <= D.promo.ends;

  // Every owner fact on the site. The menu's are listed; in page copy, any object with a
  // confirmed flag counts. The draft strip stays until each one is confirmed.
  function facts() {
    const out = [R.name, R.address, R.phone, ...D.hours, ...D.periods, ...D.options,
      ...D.options.flatMap(o => Object.values(o.prices)), ...D.groups.flatMap(g => g.items), ...D.rules];
    const walk = v => {
      if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === "object") { if ("confirmed" in v) out.push(v); Object.values(v).forEach(walk); }
    };
    walk(D.pages);
    if (promoLive()) out.push(D.promo);
    return out;
  }

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${tr(R.name)}, ${R.address.line1}, ${R.address.line2}`)}`;
  function renderActions(el = $("actions")) {
    if (!el) return;
    const W = R.waitlist.url;
    el.innerHTML =
      (W ? `<a class="btn primary" href="${esc(W)}">${icon("waitlist")}${esc(ui("waitlist"))}</a>` : "") +
      `<a class="btn${W ? "" : " primary"}" href="${esc(mapsUrl)}">${icon("directions")}${esc(ui("directions"))}</a>` +
      `<a class="btn" href="tel:${esc(R.phone.tel)}">${icon("call")}${esc(ui("call"))}</a>`;
  }

  function renderChrome(page) {
    const nav = D.nav.find(n => n.id === page);
    document.title = page === "home" ? ui("pageTitle", { name: tr(R.name), page: tr(D.pages.home.title) })
      : ui("pageTitle", { name: tr(R.name), page: tr(nav ? nav.label : D.pages[page].title) });

    const draft = !facts().every(v => v.confirmed === true), machine = LANG.reviewed === false;
    $("draft").hidden = !draft && !D.preview && !machine;
    $("draft-text").textContent = [D.preview && tr(D.preview), draft && ui("draft"), machine && ui("machine")].filter(Boolean).join(" · ");

    const skip = document.querySelector(".skip");
    if (skip) skip.textContent = ui("skip");

    $("site").innerHTML =
      `<div class="bar wrap">` +
      (STATIC ? `<span class="brand">` : `<a class="brand" href="${esc(href("home"))}"${page === "home" ? ' aria-current="page"' : ""}>`) +
      `<span class="led" id="brand-led" aria-hidden="true"></span><span class="wordmark">${esc(tr(R.name).split(" ")[0])}</span>` +
      `<span class="vh" id="brand-state"></span>${STATIC ? "</span>" : "</a>"}` +
      (STATIC ? "" :
        `<nav class="langs" aria-label="${esc(ui("language"))}">` + D.languages.map(l =>
          `<a href="?lang=${esc(l.code)}" hreflang="${esc(l.tag)}" lang="${esc(l.tag)}"${l.code === L ? ' aria-current="true"' : ""}>` +
          `<span aria-hidden="true">${esc(l.short)}</span><span class="vh">${esc(l.name)}</span></a>`).join("") + `</nav>` +
        `<nav class="pages" aria-label="${esc(ui("pagesNav"))}"><ul>` + D.nav.map(n =>
          `<li><a href="${esc(href(n.id))}"${n.id === page ? ' aria-current="page"' : ""}>${esc(tr(n.label))}</a></li>`).join("") +
        `</ul></nav>`) +
      `</div>`;

    const first = h => Math.min(...h.days.map(d => WEEK.indexOf(d)));
    const hours = [...D.hours].sort((a, b) => first(a) - first(b));
    $("foot").innerHTML =
      `<div class="wrap foot-grid">` +
      `<div class="foot-id"><p class="wordmark">${esc(tr(R.name))}</p>` +
      `<p>${esc(R.address.line1)}<br>${esc(R.address.line2)}</p>` +
      `<p><a class="tel" href="tel:${esc(R.phone.tel)}">${esc(R.phone.display)}</a></p></div>` +
      `<div class="foot-hours"><h2 class="label">${esc(ui("hours"))}</h2><ul>` +
      hours.map(h => `<li><span>${esc(days(h.days))}</span><span>${esc(span(h.open, h.close))}</span></li>`).join("") +
      `</ul>${tbc({ confirmed: D.hours.every(h => h.confirmed === true) })}</div>` +
      `<div class="foot-links"><h2 class="label">${esc(ui("follow"))}</h2><ul>` +
      R.social.map(s => `<li><a href="${esc(s.url)}" rel="noopener">${esc(s.name)} <span class="handle">${esc(s.handle)}</span></a></li>`).join("") +
      (STATIC ? "" : `<li><a href="${esc(root)}print/${esc(langQuery)}">${esc(ui("printMenu"))}</a></li>`) +
      `</ul></div></div>`;

    renderActions();
  }

  function chromeTick() {
    const o = openState(clock());
    $("brand-led").classList.toggle("on", o.open);
    $("brand-state").textContent = `, ${ui(o.open ? "openStatus" : "closedStatus")}`;
  }

  /* ---- start a page: chrome and page render once, then keep the live state current ---- */
  function boot({ page, render, tick, still, wire }) {
    document.documentElement.lang = LANG.tag;
    renderChrome(page);
    render();
    if (STATIC) return still && still();
    const loop = () => { chromeTick(); if (tick) tick(); };
    loop();
    setInterval(loop, 30000);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) loop(); });
    if (wire) wire();
  }

  window.Hotaru = {
    D, STATIC, LANG, L, LOC, tr, ui, esc, $, tbc, mark,
    mins, at, time, span, dayName, days, clock, periodsOn, hoursOn, priceState, dayWord, openState,
    money, readout, ART, ICON, icon, href, today, promoLive, facts, renderActions, boot,
  };
})();
