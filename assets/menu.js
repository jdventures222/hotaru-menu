/* Menu: live prices or a guest's chosen meal, option panels, one item list and a
   comparison disclosure. Shared facts, formatting and readouts come from core.js. */
(() => {
  const { D: M, STATIC, LOC, tr, ui, esc, $, tbc, mark, itemChips, mins, time, span,
          dayName, days, clock, periodWindows, periodSchedule, periodsOn, hoursOn, priceState, priceText, mainPriceText,
          openState, readout, ART } = Hotaru;
  let selectedPeriod = ""; // Empty follows the clock. A lookup survives every tick.
  const schedule = (p, day) => day == null ? periodSchedule(p) : ui("periodHours", {
    days: dayName(day, "long"), hours: span(p.start, p.end),
  });
  const rule = r => `<div class="rule"><dt class="label">${esc(tr(r.name))}</dt>` +
    `<dd>${r.value ? esc(tr(r.value)) + " " : ""}${tbc(r)}</dd></div>`;
  const dot = yes => `<span class="led${yes ? " on" : ""}" aria-hidden="true"></span>`;
  const renderedHTML = new WeakMap();
  const setHTML = (el, html) => {
    if (renderedHTML.get(el) !== html) { el.innerHTML = html; renderedHTML.set(el, html); }
  };

  function render() {
    const R = M.restaurant;
    $("top").innerHTML = `<h1>${esc(tr(M.nav.find(n => n.id === "menu").label))}</h1><div id="status"></div>`;
    $("contact").innerHTML =
      `<li><span>${esc(ui("menuAddress", R.address))}</span>${tbc(R.address)}</li>` +
      `<li><a class="tel" href="tel:${esc(R.phone.tel)}">${esc(R.phone.display)}</a>${tbc(R.phone)}</li>`;
    for (const [id, key] of Object.entries({ "choose-h": "pickOne", "included-h": "included",
      "compare-h": "compare", "compare-more": "compareMore", "rules-h": "rules", "info-h": "menuInfo",
      "ayc-note": "aycNote", "ayc-kids-note": "aycKidsNote" })) {
      $(id).textContent = ui(key);
    }
    const kids = M.rules.find(r => r.id === "kids");
    $("ayc-kids-note").hidden = !!kids && kids.confirmed === true && !!tr(kids.value).trim();

    $("meal-picker").hidden = STATIC;
    $("meal-picker").setAttribute("aria-label", ui("priceLookup"));
    if (!STATIC) $("meal-picker").innerHTML =
      `<button type="button" data-meal="" aria-pressed="true" aria-controls="nowline keys">${esc(ui("lookupNow"))}</button>` +
      M.periods.map(p => `<button type="button" data-meal="${esc(p.id)}" aria-pressed="false" aria-controls="nowline keys">` +
        `${esc(ui("periodChoice", { period: tr(p.name), days: days(periodWindows(p).flatMap(w => w.days)) }))}</button>`).join("");

    $("keys").setAttribute("aria-label", ui("options"));
    $("keys").innerHTML = M.options.map(o =>
      (STATIC ? `<a class="key" href="#card-${esc(o.id)}">`
        : `<button class="key" type="button" data-card="card-${esc(o.id)}" aria-controls="card-${esc(o.id)}">`) +
      `<span class="kname">${esc(tr(o.short))}</span>` +
      M.periods.map(p => {
        const price = o.prices[p.id];
        return `<span data-period="${esc(p.id)}" hidden>` + (price
          ? readout(price, "kprice") + (price.amount == null ? "" : tbc(price))
          : `<span class="key-unavailable">${esc(ui("notOffered"))}</span>`) + `</span>`;
      }).join("") + (STATIC ? `</a>` : `</button>`)).join("");

    $("cards").innerHTML = M.options.map(o =>
      `<article class="card" id="card-${esc(o.id)}" aria-labelledby="name-${esc(o.id)}">` +
      (o.photo
        ? `<div class="art"><img src="${esc(o.photo)}" alt="${esc(tr(o.name))}"></div>`
        : `<div class="art">${ART[o.art] ? ART[o.art]() : ""}<span class="label">${esc(ui("photoComing"))}</span></div>`) +
      `<div class="card-body"><h3 id="name-${esc(o.id)}">${esc(tr(o.name))}${tbc(o)}</h3>` +
      `<p class="about">${esc(tr(o.about))}</p><ul class="rows">` +
      M.periods.filter(p => o.prices[p.id]).map(p =>
        `<li class="row" data-period="${esc(p.id)}">${dot(false)}` +
        `<span class="pname label">${esc(tr(p.name))}</span>` +
        `<span class="price">${readout(o.prices[p.id])}${tbc(o.prices[p.id])}</span>` +
        `<span class="ptime">${esc(schedule(p))} ${tbc(periodSchedule(p, undefined, { details: true }), "hoursTbc")}</span></li>`).join("") +
      `</ul></div></article>`).join("");

    $("sample-note").hidden = !M.groups.some(g => g.items.some(it => it.sample));
    $("sample-note").textContent = ui("sampleNote");
    $("groups").innerHTML = M.groups.map(g =>
      `<section class="group" aria-labelledby="g-${esc(g.id)}"><h3 class="label" id="g-${esc(g.id)}">${esc(tr(g.name))}</h3><ul class="items">` +
      g.items.map(it => `<li${it.sample ? ' class="sample"' : ""}><span class="iname">${esc(tr(it.name))}</span>${itemChips(it)}${mark(it)}</li>`).join("") +
      `</ul></section>`).join("");

    $("compare").open = STATIC; // The script-free snapshot exposes every item and heading.
    $("compare-key").innerHTML = [true, false].map(yes => `<span>${dot(yes)}${esc(ui(yes ? "yes" : "no"))}</span>`).join("");
    const cell = yes => `<td>${dot(yes)}<span class="vh">${esc(ui(yes ? "yes" : "no"))}</span></td>`;
    $("compare-table").innerHTML =
      `<table><caption class="vh">${esc(ui("compare"))}</caption><colgroup><col>${M.options.map(() => '<col class="opt">').join("")}</colgroup>` +
      `<thead><tr><th scope="col" class="label">${esc(ui("item"))}</th>${M.options.map(o => `<th scope="col" class="label">${esc(tr(o.short))}</th>`).join("")}</tr></thead>` +
      M.groups.map(g => `<tbody><tr class="grp"><th scope="colgroup" colspan="${esc(M.options.length + 1)}" class="label">${esc(tr(g.name))}</th></tr>` +
        g.items.map(it => `<tr><th scope="row">${esc(tr(it.name))} ${mark(it)}</th>${M.options.map(o => cell(it.in.includes(o.id))).join("")}</tr>`).join("") +
        `</tbody>`).join("") + `</table>`;

    const quick = ["kids", "time", "mix"].map(id => M.rules.find(r => r.id === id)).filter(Boolean);
    const quickIds = new Set(quick.map(r => r.id));
    $("all-rules").innerHTML = M.rules.filter(r => !quickIds.has(r.id)).map(rule).join("");
    $("quick-rules").innerHTML = quick.map(rule).join("");
    $("ask-first").hidden = !quick.some(r => r.value == null || r.confirmed !== true);
    $("ask-first").innerHTML = `<span>${esc(ui("askFirst"))}</span> ` +
      `<a class="tel" href="tel:${esc(R.phone.tel)}">${esc(ui("callPhone", { phone: R.phone.display }))}</a>${tbc(R.phone)}`;
  }

  // Format parts in the locale's order: Korean keeps its day period before the digits.
  function clockFace(now) {
    const fmt = new Intl.DateTimeFormat(LOC, { timeZone: M.timeZone, hour: "numeric", minute: "2-digit" });
    const runs = [];
    for (const p of fmt.formatToParts(now)) {
      const numeric = ["hour", "minute"].includes(p.type) || (p.type === "literal" && /^[:.]+$/.test(p.value));
      const previous = runs[runs.length - 1];
      if (previous && previous.numeric === numeric) previous.text += p.value;
      else runs.push({ numeric, text: p.value });
    }
    return `<span class="clock"><span class="vh">${esc(fmt.format(now))}</span>` + runs.map(r => r.numeric
      ? `<span class="seg" aria-hidden="true"><span class="ghost">${esc(r.text.replace(/\d/g, "8"))}</span><span class="lit">${esc(r.text)}</span></span>`
      : `<span class="ap" aria-hidden="true">${esc(r.text)}</span>`).join("") + `</span>`;
  }

  // Original 16 x 18 firefly: two wing cases and an amber abdomen over the timer line.
  const firefly = `<svg class="firefly" viewBox="0 0 16 18" aria-hidden="true" fill="var(--panel)" stroke="var(--text-3)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">` +
    `<path d="M7 3 5 1M9 3l2-2M8 5C5 3 1 6 1 11c3 1 6-1 7-4C9 10 12 12 15 11c0-5-4-8-7-6Z"/>` +
    `<path d="M6 6V4a2 2 0 0 1 4 0v2"/><path d="M8 6v5"/><ellipse cx="8" cy="13" rx="3" ry="4" fill="var(--amber)" stroke="none"/></svg>`;

  function renderRail(c, s, h) {
    const rail = $("rail");
    rail.hidden = !M.hours.length;
    if (rail.hidden) { rail.innerHTML = ""; return; }
    const start = Math.min(...M.hours.map(x => mins(x.open))), end = Math.max(...M.hours.map(x => mins(x.close)));
    if (end <= start) { rail.hidden = true; rail.innerHTML = ""; return; }
    const pct = m => ((m - start) / (end - start)) * 100;
    const today = periodsOn(c.day); // Already clipped by core; match these copies by id.
    const stops = [...new Set([start, ...today.flatMap(p => [mins(p.start), mins(p.end)]), end])].sort((a, b) => a - b);
    const hhmm = m => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
    const live = s && !s.next;
    const description = ui(!h ? "railClosed" : live ? "railNow" : "railNoPrice", {
      day: dayName(c.day, "long"), hours: h ? span(h.open, h.close) : "", prices: priceText(live ? s : null),
    });
    const gap = (a, b) => b > a ? `<div class="gap" style="left:${esc(pct(a))}%;width:${esc(pct(b) - pct(a))}%">${esc(ui("closed"))}</div>` : "";
    rail.innerHTML = `<p class="vh">${esc(description)} ${tbc({ confirmed: [h, live && s.period].every(x => !x || x.confirmed === true) }, "hoursTbc")}</p>` +
      `<div class="rail-head"><span class="label" aria-hidden="true">${esc(ui("todayDay", { day: dayName(c.day, "long") }))}</span>${clockFace(c.now)}</div>` +
      `<div class="rail-drawing" aria-hidden="true"><div class="rail"><div class="rail-bar">` +
      (h ? gap(start, mins(h.open)) + gap(mins(h.close), end) : gap(start, end)) +
      today.map(p => `<div class="band${live && s.period.id === p.id ? " is-lit" : ""}" style="left:${esc(pct(mins(p.start)))}%;width:${esc(pct(mins(p.end)) - pct(mins(p.start)))}%">${esc(tr(p.name))}</div>`).join("") +
      `</div>` + (c.min >= start && c.min <= end ? `<span class="marker" style="left:${esc(pct(c.min))}%">${firefly}</span>` : "") +
      `</div><div class="ticks">${stops.map(m => `<span style="left:${esc(pct(m))}%">${esc(time(hhmm(m)))}</span>`).join("")}</div></div>`;
  }

  function showPrices(p, text, liveState, day) {
    $("nowline").hidden = !p;
    setHTML($("nowline"), p ? `${dot(!!liveState && !liveState.next)}<span>${esc(text)} ` +
      `<span class="menu-price-window ptime">${esc(schedule(p, day))} ${tbc(periodSchedule(p, undefined, { details: true }), "hoursTbc")}</span></span>` : "");
    $("keys").classList.toggle("is-now", !!liveState && !liveState.next);
    $("keys").querySelectorAll("[data-period]").forEach(k => { k.hidden = k.dataset.period !== (p && p.id); });
    $("cards").querySelectorAll(".row").forEach(r => {
      const period = M.periods.find(x => x.id === r.dataset.period);
      const mine = !!liveState && r.dataset.period === liveState.period.id, lit = mine && !liveState.next;
      // Keep the class and digits in place so the 30-second tick cannot restart power-on.
      if (lit !== r.classList.contains("is-lit")) r.classList.toggle("is-lit", lit);
      r.classList.toggle("is-next", mine && liveState.next);
      r.querySelector(".pname").textContent = mine
        ? ui("periodState", { period: tr(period.name), state: ui(liveState.next ? "next" : "now") }) : tr(period.name);
    });
  }

  function tick() {
    const c = clock(), s = priceState(c), o = openState(c), h = hoursOn(c.day);
    setHTML($("status"), `<span class="status">${dot(o.open)}<span><strong>${esc(o.text)}</strong> ` +
      `${tbc({ confirmed: !!o.quoted && o.quoted.confirmed === true }, "hoursTbc")}</span></span>`);
    renderRail(c, s, h);
    const chosen = M.periods.find(p => p.id === selectedPeriod);
    if (chosen) showPrices(chosen, mainPriceText(chosen), null);
    else showPrices(s && s.period, priceText(s), s, s && (s.next ? s.d : c.day));
  }

  function still() {
    const main = [...M.periods].sort((a, b) => b.days.length - a.days.length)[0];
    $("status").innerHTML = `<span class="status">${dot(false)}<span>` +
      M.hours.map(h => esc(ui("periodHours", { days: days(h.days), hours: span(h.open, h.close) })) + ` ${tbc(h, "hoursTbc")}`).join("<br>") +
      (!M.hours.length ? tbc({ confirmed: false }, "hoursTbc") : "") + `</span></span>`;
    $("rail").hidden = true;
    showPrices(main, mainPriceText(main), null);
  }

  function wire() {
    $("meal-picker").querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
      selectedPeriod = button.dataset.meal;
      $("meal-picker").querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b === button)));
      tick();
    }));

    const track = $("cards"), keys = [...$("keys").querySelectorAll(".key")];
    let currentCard;
    const setKey = (id, announce = true) => {
      if (id === currentCard) return;
      currentCard = id;
      keys.forEach(k => k.setAttribute("aria-current", String(k.dataset.card === id)));
      const index = M.options.findIndex(o => `card-${o.id}` === id);
      if (announce && index >= 0) $("card-announcement").textContent = ui("showingCard", {
        option: tr(M.options[index].name), n: index + 1, count: M.options.length,
      });
    };
    setKey(keys[0] && keys[0].dataset.card, false);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const moveTo = (card, behavior) => track.scrollTo({
      left: card.offsetLeft - track.offsetLeft - parseFloat(getComputedStyle(track).scrollPaddingLeft || 0), behavior,
    });
    keys.forEach(k => k.addEventListener("click", () => {
      moveTo($(k.dataset.card), reduce ? "auto" : "smooth");
      setKey(k.dataset.card);
    }));
    const io = new IntersectionObserver(es => {
      if (!matchMedia("(max-width: 879px)").matches) return;
      es.forEach(e => { if (e.intersectionRatio >= 0.6) setKey(e.target.id); });
    }, { root: track, threshold: 0.6 });
    track.querySelectorAll(".card").forEach(c => io.observe(c));

    const revealHash = () => {
      if (location.hash === "#compare") {
        $("compare").open = true;
        $("compare").scrollIntoView({ block: "start" });
      }
      const card = [...track.querySelectorAll(".card")].find(c => `#${c.id}` === location.hash);
      if (card) { moveTo(card, "auto"); setKey(card.id); }
    };
    window.addEventListener("hashchange", revealHash);
    window.addEventListener("load", revealHash, { once: true });
    revealHash();
  }

  Hotaru.boot({ page: "menu", render, tick, still, wire });
})();
