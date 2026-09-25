/* First time here: five steps through a meal, with current or next prices on the
   menu keys. Shared components and the restaurant's clock come from core.js. */
(() => {
  const { D: M, tr, ui, esc, $, tbc, time, span, days, clock, priceState,
          dayWord, readout, href } = Hotaru;
  const P = M.pages.firstTime;

  const answer = v => (v.value == null ? "" : esc(tr(v.value)) + " ") +
    tbc({ confirmed: v.value != null && v.confirmed === true });

  function keyPrice(o, p) {
    const price = p && o.prices[p.id];
    return price ? readout(price, "kprice") : "";
  }

  /* ---- static render ---- */
  function render() {
    $("top").innerHTML = `<h1>${esc(tr(P.title))}</h1><p class="first-time-intro">${esc(tr(P.intro))}</p>`;

    $("steps").innerHTML = P.steps.map((s, i) => {
      const facts = [...(s.facts || []), ...(s.rules || []).map(id => M.rules.find(r => r.id === id)).filter(Boolean)];
      return `<li class="card"><section class="card-body" aria-labelledby="step-${esc(s.id)}">` +
        `<div class="step-head"><span class="step-number label" aria-hidden="true">${esc(tr(P.stepNumber, { number: String(i + 1).padStart(2, "0") }))}</span>` +
        `<h2 id="step-${esc(s.id)}">${esc(tr(s.name))}</h2></div>` +
        `<p class="step-text">${esc(tr(s.text))}</p>` +
        (facts.length ? `<dl class="step-facts">` + facts.map(f =>
          `<div class="step-fact"><dt class="label">${esc(tr(f.name))}</dt><dd>${answer(f)}</dd></div>`).join("") + `</dl>` : "") +
        (s.id === "pick" ? `<div class="step-options"><p class="nowline" id="nowline"></p>` +
          `<p class="ptime step-hours" id="price-hours"></p><nav class="keys" id="keys" aria-label="${esc(ui("options"))}" aria-describedby="nowline price-hours">` +
          M.options.map(o => `<a class="key" href="${esc(href("menu") + "#card-" + o.id)}">` +
            `<span class="kname">${esc(tr(o.short))}</span>` +
            [...M.periods, null].map(p => `<span class="step-key-price" data-period="${esc(p ? p.id : "")}" hidden>${keyPrice(o, p)}</span>`).join("") +
            `</a>`).join("") + `</nav></div>` : "") +
        (s.link ? `<a class="btn" href="${esc(href(s.link.page))}">${esc(tr(s.link.text))}</a>` : "") +
        `</section></li>`;
    }).join("");

    $("action-slot").append($("actions"));
  }

  function showPrices(p, text, live = false) {
    if (!$("keys")) return;
    $("nowline").innerHTML = `<span class="led${live ? " on" : ""}" aria-hidden="true"></span>` +
      `<span>${esc(text)} ${tbc({ confirmed: !!p && p.confirmed === true && M.options.every(o => !o.prices[p.id] || o.prices[p.id].confirmed === true) })}</span>`;
    $("price-hours").textContent = p ? tr(P.periodHours, { days: days(p.days), hours: span(p.start, p.end) }) : "";
    $("price-hours").hidden = !p;
    $("keys").classList.toggle("is-now", live);
    document.querySelectorAll("#keys [data-period]").forEach(k => { k.hidden = k.dataset.period !== (p ? p.id : ""); });
  }

  /* ---- live state: keep the keys on the current or next period ---- */
  function tick() {
    const s = priceState(clock());
    if (!s) return showPrices(null, "");
    const period = tr(s.period.name);
    showPrices(s.period, !s.next ? ui("nowPrice", { period })
      : s.off === 0 ? ui("nextPrice", { period, time: time(s.period.start) })
      : ui("nextPriceDay", { period, time: time(s.period.start), day: dayWord(s.off, s.d) }), !s.next);
  }

  /* ---- snapshot: show the most frequent period without claiming it is live ---- */
  function still() {
    const p = [...M.periods].sort((a, b) => b.days.length - a.days.length)[0];
    showPrices(p, p ? ui("mainPrice", { period: tr(p.name) }) : "");
  }

  Hotaru.boot({ page: "first-time", render, tick, still });
})();
