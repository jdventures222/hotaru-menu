/* The Menu page (the tier guide): the time rail, option keys and panels, what's included,
   the side-by-side table and the rules. Shared helpers come from core.js. */
(() => {
  const { D: M, STATIC, LOC, tr, ui, esc, $, tbc, mark, mins, time, span, dayName, days, clock,
          periodsOn, hoursOn, priceState, dayWord, openState, readout, ART } = Hotaru;

  /* ---- static render ---- */
  function render() {
    const R = M.restaurant;
    $("top").innerHTML =
      `<h1>${esc(tr(R.name))}${tbc(R.name)}</h1><ul class="meta">` +
      `<li><span>${esc(R.address.line1)}, ${esc(R.address.line2)}</span>${tbc(R.address)}</li>` +
      `<li><a class="tel" href="tel:${esc(R.phone.tel)}">${esc(R.phone.display)}</a>${tbc(R.phone)}</li>` +
      `<li id="status"></li></ul>`;

    $("choose-h").textContent = ui("pickOne");
    $("included-h").textContent = ui("included");
    $("compare-h").textContent = ui("compare");
    $("rules-h").textContent = ui("rules");

    $("keys").setAttribute("aria-label", ui("options"));
    $("keys").innerHTML = M.options.map(o =>
      (STATIC ? `<a class="key" href="#card-${esc(o.id)}">`
        : `<button class="key" type="button" data-card="card-${esc(o.id)}" aria-controls="card-${esc(o.id)}">`) +
      `<span class="kname">${esc(tr(o.short))}</span>` +
      M.periods.map(p => o.prices[p.id]
        ? `<span data-period="${esc(p.id)}" hidden>${readout(o.prices[p.id], "kprice")}</span>` : "").join("") +
      (STATIC ? `</a>` : `</button>`)).join("");

    $("cards").innerHTML = M.options.map(o =>
      `<article class="card" id="card-${esc(o.id)}" aria-labelledby="name-${esc(o.id)}">` +
      (o.photo
        ? `<div class="art"><img src="${esc(o.photo)}" alt="${esc(tr(o.name))}"></div>`
        : `<div class="art">${ART[o.art] ? ART[o.art]() : ""}<span class="label">${esc(ui("photoComing"))}</span></div>`) +
      `<div class="card-body"><h3 id="name-${esc(o.id)}">${esc(tr(o.name))}${tbc(o)}</h3>` +
      `<ul class="rows">` + M.periods.filter(p => o.prices[p.id]).map(p =>
        `<li class="row" data-period="${esc(p.id)}"><span class="led" aria-hidden="true"></span>` +
        `<span class="when"><span class="pname label">${esc(tr(p.name))}<span class="state"></span></span>` +
        `<span class="ptime">${esc(days(p.days))} · ${esc(span(p.start, p.end))}</span></span>` +
        `<span class="price">${readout(o.prices[p.id])}${tbc({ confirmed: p.confirmed === true && o.prices[p.id].confirmed === true })}</span></li>`).join("") +
      `</ul><p class="about">${esc(tr(o.about))}</p></div></article>`).join("");

    // Items only some options include carry the base option's name.
    const chips = it => {
      if (M.options.every(o => it.in.includes(o.id))) return "";
      const has = M.options.filter(o => it.in.includes(o.id));
      const bases = has.filter(o => !o.combines);
      return (bases.length ? bases : has).map(o =>
        `<span class="chip"><span class="vh">${esc(ui("onlyWith"))} </span>${esc(tr(o.short))}</span>`).join("");
    };
    $("sample-note").hidden = !M.groups.some(g => g.items.some(it => it.sample));
    $("sample-note").textContent = ui("sampleNote");
    $("groups").innerHTML = M.groups.map(g =>
      `<section class="group" aria-labelledby="g-${esc(g.id)}"><h3 class="label" id="g-${esc(g.id)}">${esc(tr(g.name))}</h3><ul class="items">` +
      g.items.map(it => `<li${it.sample ? ' class="sample"' : ""}><span class="iname">${esc(tr(it.name))}</span>${chips(it)}${mark(it)}</li>`).join("") +
      `</ul></section>`).join("");

    const cell = yes => `<td><span class="led${yes ? " on" : ""}" aria-hidden="true"></span><span class="vh">${esc(ui(yes ? "yes" : "no"))}</span></td>`;
    $("compare").innerHTML =
      `<table><caption class="vh">${esc(ui("compare"))}</caption><colgroup><col>${M.options.map(() => '<col class="opt">').join("")}</colgroup>` +
      `<thead><tr><th scope="col" class="label">${esc(ui("item"))}</th>${M.options.map(o => `<th scope="col" class="label">${esc(tr(o.short))}</th>`).join("")}</tr></thead>` +
      M.groups.map(g => `<tbody><tr class="grp"><th scope="colgroup" colspan="${M.options.length + 1}" class="label">${esc(tr(g.name))}</th></tr>` +
        g.items.map(it => `<tr><th scope="row">${esc(tr(it.name))} ${mark(it)}</th>${M.options.map(o => cell(it.in.includes(o.id))).join("")}</tr>`).join("") +
        `</tbody>`).join("") + `</table>`;

    $("rules").innerHTML = M.rules.map(r =>
      `<div class="rule"><dt class="label">${esc(tr(r.name))}</dt><dd>${r.value ? esc(tr(r.value)) + " " : ""}${tbc(r)}</dd></div>`).join("");
  }

  /* ---- live state: what is lit right now ---- */
  function tick() {
    const c = clock(), s = priceState(c), o = openState(c), h = hoursOn(c.day);

    $("status").innerHTML = `<span class="status"><span class="led${o.open ? " on" : ""}" aria-hidden="true"></span>` +
      `<strong>${esc(o.text)}</strong>${h ? `<span>${esc(ui("today"))} ${esc(span(h.open, h.close))}</span>` : ""}</span>` +
      tbc({ confirmed: [h, o.quoted].every(x => !x || x.confirmed === true) });

    // Rail spans the widest opening hours in the week; today's periods sit on it.
    const start = Math.min(...M.hours.map(x => mins(x.open))), end = Math.max(...M.hours.map(x => mins(x.close)));
    const pct = m => ((m - start) / (end - start)) * 100;
    const today = periodsOn(c.day).filter(p => h && mins(p.start) >= mins(h.open) && mins(p.end) <= mins(h.close));
    const stops = [...new Set([start, ...today.flatMap(p => [mins(p.start), mins(p.end)]), end])].sort((a, b) => a - b);
    const hhmm = m => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
    const tparts = new Intl.DateTimeFormat(LOC, { timeZone: M.timeZone, hour: "numeric", minute: "2-digit" }).formatToParts(c.now);
    const digits = tparts.filter(p => ["hour", "minute", "literal"].includes(p.type) && !/\s/.test(p.value)).map(p => p.value).join("");
    const ap = tparts.filter(p => p.type === "dayPeriod").map(p => p.value).join("");
    const gapStart = h ? mins(h.open) : end;
    $("rail").innerHTML =
      `<div class="rail-head"><span class="label">${esc(ui("today"))} · ${esc(dayName(c.day, "long"))}</span>` +
      `<span class="clock"><span class="vh">${esc(digits + " " + ap)}</span><span class="seg" aria-hidden="true"><span class="ghost">${esc(digits.replace(/\d/g, "8"))}</span><span class="lit">${esc(digits)}</span></span>` +
      `<span class="ap" aria-hidden="true">${esc(ap)}</span></span></div>` +
      `<div class="rail"><div class="rail-bar">` +
      (gapStart > start ? `<div class="gap" style="left:0;width:${pct(gapStart)}%">${esc(ui("closed"))}</div>` : "") +
      today.map(p => `<div class="band${!s.next && s.period === p ? " is-lit" : ""}" style="left:${pct(mins(p.start))}%;width:${pct(mins(p.end)) - pct(mins(p.start))}%">${esc(tr(p.name))}</div>`).join("") +
      `</div>` + (c.min >= start && c.min <= end ? `<span class="marker" style="left:${pct(c.min)}%" aria-hidden="true"></span>` : "") +
      `</div><div class="ticks" aria-hidden="true">${stops.map(m => `<span style="left:${pct(m)}%">${esc(time(hhmm(m)))}</span>`).join("")}</div>`;

    if (!s) return;
    const name = tr(s.period.name);
    const shown = M.options.map(o => o.prices[s.period.id]).filter(Boolean);
    $("nowline").innerHTML = `<span class="led${s.next ? "" : " on"}" aria-hidden="true"></span><span>${esc(
      !s.next ? ui("nowPrice", { period: name })
      : s.off === 0 ? ui("nextPrice", { period: name, time: time(s.period.start) })
      : ui("nextPriceDay", { period: name, time: time(s.period.start), day: dayWord(s.off, s.d) }))} ` +
      `${tbc({ confirmed: s.period.confirmed === true && shown.every(p => p.confirmed === true) })}</span>`;

    document.querySelectorAll(".row").forEach(r => {
      const mine = r.dataset.period === s.period.id, lit = mine && !s.next;
      if (lit !== r.classList.contains("is-lit")) r.classList.toggle("is-lit", lit);
      r.classList.toggle("is-next", mine && s.next);
      r.querySelector(".state").textContent = mine ? ` · ${ui(s.next ? "next" : "now")}` : "";
    });
    $("keys").classList.toggle("is-now", !s.next);
    document.querySelectorAll(".key [data-period]").forEach(k => { k.hidden = k.dataset.period !== s.period.id; });
  }

  /* ---- snapshot: every day's hours and the prices of the period that runs every day ---- */
  function still() {
    const main = [...M.periods].sort((a, b) => b.days.length - a.days.length)[0];
    const shown = M.options.map(o => o.prices[main.id]).filter(Boolean);
    $("status").innerHTML = `<span class="status"><span class="led" aria-hidden="true"></span><span>` +
      M.hours.map(h => esc(`${days(h.days)} ${span(h.open, h.close)}`)).join("<br>") +
      `</span></span>${tbc({ confirmed: M.hours.every(h => h.confirmed === true) })}`;
    $("rail").hidden = true;
    $("nowline").innerHTML = `<span class="led" aria-hidden="true"></span><span>${esc(ui("mainPrice", { period: tr(main.name) }))} ` +
      `${tbc({ confirmed: main.confirmed === true && shown.every(p => p.confirmed === true) })}</span>`;
    document.querySelectorAll(".key [data-period]").forEach(k => { k.hidden = k.dataset.period !== main.id; });
  }

  /* ---- keys follow the swipe; a tap swipes to its card ---- */
  function wireKeys() {
    const track = $("cards"), keys = [...document.querySelectorAll(".key")];
    const setKey = id => keys.forEach(k => k.setAttribute("aria-current", String(k.dataset.card === id)));
    setKey(keys[0] && keys[0].dataset.card);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    keys.forEach(k => k.addEventListener("click", () => {
      const card = $(k.dataset.card);
      track.scrollTo({ left: card.offsetLeft - track.offsetLeft - parseFloat(getComputedStyle(track).scrollPaddingLeft || 0),
                       behavior: reduce ? "auto" : "smooth" });
      setKey(k.dataset.card);
    }));
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.intersectionRatio >= 0.6) setKey(e.target.id); }),
      { root: track, threshold: 0.6 });
    track.querySelectorAll(".card").forEach(c => io.observe(c));
  }

  Hotaru.boot({ page: "menu", render, tick, still, wire: wireKeys });
})();
