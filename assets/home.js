/* The Home page: the spread, current prices and a quick way to the table.
   Shared components and the restaurant's clock come from core.js. */
(() => {
  const { D: M, tr, ui, esc, $, tbc, time, span, days, clock, hoursOn,
          priceState, dayWord, openState, readout, ART, href, promoLive } = Hotaru;
  const H = M.pages.home;
  const priceMarkup = new WeakMap();
  const chevron = `<svg class="home-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>`;
  const leaf = () => `<svg viewBox="0 0 200 100" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">` +
    `<path d="M68 75C48 40 83 15 142 10c-2 52-28 82-65 65"/><path d="M58 90 126 26M80 68l-3-23M94 54l25 1M108 40l-1-16"/></svg>`;

  /* ---- static render ---- */
  function render() {
    const R = M.restaurant;
    $("top").innerHTML = `<h1>${esc(tr(R.name))}${tbc(R.name)}</h1>` +
      `<p class="home-tagline">${esc(tr(H.tagline))}</p><ul class="meta"><li id="status"></li></ul>`;

    $("offer").innerHTML = `<span class="led on" aria-hidden="true"></span><span>${esc(tr(M.promo && M.promo.text))} ${M.promo ? tbc(M.promo) : ""}</span>`;
    $("spread").innerHTML = H.spread.photo
      ? `<img src="${esc(H.spread.photo)}" alt="${esc(tr(H.spread.alt))}">`
      : `${ART.both()}<span class="label">${esc(ui("photoComing"))}</span>`;

    $("prices-h").textContent = ui("pickOne");
    $("prices").innerHTML = M.options.map(o =>
      `<li><a class="row home-price" href="${esc(href("menu"))}#card-${esc(o.id)}" aria-describedby="nowline price-window">` +
      `<span class="led" aria-hidden="true"></span><span class="home-option">${esc(tr(o.name))}</span>` +
      `<span class="price"></span>${chevron}</a></li>`).join("");
    $("menu-link").href = href("menu");
    $("menu-link").textContent = tr(H.prices);

    $("promise-h").textContent = tr(H.promiseHeading);
    $("promise").innerHTML = H.promise.map(p =>
      `<div class="rule home-promise-cell"><span class="home-drawing">${p.art === "leaf" ? leaf() : ART[p.art]()}</span>` +
      `<div><h3 class="label">${esc(tr(p.name))}</h3>${p.note ? `<p class="about">${esc(tr(p.note))}</p>` : ""}</div></div>`).join("");

    $("more-h").textContent = ui("more");
    $("more").innerHTML = H.more.map(m =>
      `<a class="home-more-link" href="${esc(href(m.page))}"><span>` +
      `<span class="home-more-title">${esc(tr(M.nav.find(n => n.id === m.page).label))}</span>` +
      `<span class="about">${esc(tr(m.text))}</span></span>${chevron}</a>`).join("");

    // The same action bar stays fixed on phones and sits below prices on laptops.
    $("home-prices").append($("actions"));
  }

  function confirmedPrice(p, price) {
    return p && p.confirmed === true && price && price.amount != null && price.confirmed === true;
  }

  function showPrices(p, next, live) {
    $("price-window").textContent = p ? tr(H.periodWindow, { days: days(p.days), hours: span(p.start, p.end) }) : "";
    $("price-window").hidden = !p;
    $("prices").querySelectorAll(".row").forEach((r, i) => {
      const price = p && M.options[i].prices[p.id];
      const markup = price ? readout(price) : "";
      const value = r.querySelector(".price");
      // Keep the digits and link intact on ordinary ticks: no repeated power-on or lost focus.
      if (priceMarkup.get(value) !== markup) {
        value.innerHTML = markup;
        priceMarkup.set(value, markup);
      }
      r.dataset.period = p ? p.id : "";
      r.classList.toggle("is-lit", live);
      r.classList.toggle("is-next", next);
    });
  }

  /* ---- live state: what is lit right now ---- */
  function tick() {
    const c = clock(), s = priceState(c), o = openState(c), h = hoursOn(c.day);
    $("status").innerHTML = `<span class="status"><span class="led${o.open ? " on" : ""}" aria-hidden="true"></span>` +
      `<strong>${esc(o.text)}</strong>${h ? `<span>${esc(tr(H.hoursLine, { day: ui("today"), hours: span(h.open, h.close) }))}</span>` : ""}</span>` +
      tbc({ confirmed: !!o.quoted && [h, o.quoted].every(x => !x || x.confirmed === true) });
    $("offer").hidden = !promoLive();

    if (!s) {
      $("nowline").innerHTML = `<span class="led" aria-hidden="true"></span><span>${tbc({ confirmed: false })}</span>`;
      showPrices(null, false, false);
      return;
    }
    const name = tr(s.period.name);
    $("nowline").innerHTML = `<span class="led${s.next ? "" : " on"}" aria-hidden="true"></span><span>${esc(
      !s.next ? ui("nowPrice", { period: name })
      : s.off === 0 ? ui("nextPrice", { period: name, time: time(s.period.start) })
      : ui("nextPriceDay", { period: name, time: time(s.period.start), day: dayWord(s.off, s.d) }))} ` +
      `${tbc({ confirmed: M.options.every(o => !o.prices[s.period.id] || confirmedPrice(s.period, o.prices[s.period.id])) })}</span>`;
    showPrices(s.period, s.next, !s.next);
  }

  /* ---- snapshot: hours and the most frequent period, with nothing lit ---- */
  function still() {
    const main = [...M.periods].sort((a, b) => b.days.length - a.days.length)[0];
    $("status").innerHTML = `<span class="status"><span class="led" aria-hidden="true"></span><span>` +
      M.hours.map(h => esc(tr(H.hoursLine, { day: days(h.days), hours: span(h.open, h.close) }))).join("<br>") +
      `</span></span>${tbc({ confirmed: M.hours.length > 0 && M.hours.every(h => h.confirmed === true) })}`;
    $("nowline").innerHTML = `<span class="led" aria-hidden="true"></span><span>` +
      (main ? esc(ui("mainPrice", { period: tr(main.name) })) + " " : "") +
      `${tbc({ confirmed: M.options.every(o => !(main && o.prices[main.id]) || confirmedPrice(main, o.prices[main.id])) })}</span>`;
    showPrices(main, false, false);
  }

  Hotaru.boot({ page: "home", render, tick, still });
})();
