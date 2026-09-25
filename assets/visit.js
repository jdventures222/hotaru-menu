/* The Visit page: directions and calling first, arrival notes, then the full week.
   Only the status and today's marker follow the restaurant's clock. */
(() => {
  const { D, tr, ui, esc, $, tbc, span, dayName, days, clock, periodsOn, hoursOn, openState, icon } = Hotaru;
  const P = D.pages.visit, R = D.restaurant;
  const WEEK = [1, 2, 3, 4, 5, 6, 0];
  let lastStatus;

  /* ---- static render ---- */
  function render() {
    $("top").innerHTML =
      `<h1>${esc(tr(P.title))}</h1><ul class="meta">` +
      `<li><address class="visit-address">${esc(tr({ en: R.address.line1 }))}<br>${esc(tr({ en: R.address.line2 }))}</address>${tbc(R.address)}</li>` +
      `<li id="status" aria-live="polite" aria-atomic="true"></li></ul>`;

    $("directions-h").textContent = tr(P.directions);
    $("getting-h").textContent = tr(P.gettingHere);

    $("directions").innerHTML = P.maps.map((m, i) =>
      `<a class="btn${i === 0 ? " primary" : ""}" href="${esc(m.url)}">${icon("directions")}<span>${esc(tr(m.name))}</span></a>`).join("") +
      `<a class="btn" href="tel:${esc(R.phone.tel)}">${icon("call")}<span>${esc(tr(P.callNumber, { call: ui("call"), phone: R.phone.display }))}</span>${tbc(R.phone)}</a>`;

    $("getting").innerHTML =
      `<ul class="items"><li>${esc(tr(P.near))}</li><li>${esc(tr(P.roads))}</li>` +
      `<li><span class="label iname">${esc(tr(P.parking.name))}</span><span class="visit-fact">` +
      `${P.parking.value ? esc(tr(P.parking.value)) + " " : ""}${tbc({ confirmed: P.parking.value != null && P.parking.confirmed === true })}</span></li></ul>`;

    $("hours-h").innerHTML = `${esc(ui("hours"))} ` +
      tbc({ confirmed: [...D.hours, ...D.periods].every(h => h.confirmed === true) });
    $("hours").innerHTML = WEEK.map(d => {
      const h = hoursOn(d);
      const periods = periodsOn(d).map(p => tr(P.periodHours, { period: tr(p.name), hours: span(p.start, p.end) }))
        .reduce((first, next) => first ? tr(P.joinPeriods, { first, next }) : next, "");
      return `<div class="visit-day" data-day="${esc(d)}"><dt>${esc(dayName(d, "long"))}` +
        `<span class="visit-today" hidden><span class="led" aria-hidden="true"></span><span class="label">${esc(ui("today"))}</span><span class="vh"></span></span></dt>` +
        `<dd class="visit-opening">${esc(h ? span(h.open, h.close) : ui("closedDay"))}</dd>` +
        (periods ? `<dd class="visit-periods ptime">${esc(periods)}</dd>` : "") + `</div>`;
    }).join("");

    // Keep the shared actions inside the page gutter when they become inline on a laptop.
    $("visit-actions").append($("actions"));
  }

  /* ---- live state: today's marker stays visible after closing, but its LED goes dark ---- */
  function tick() {
    const c = clock(), o = openState(c), h = hoursOn(c.day);
    const status = `<span class="status"><span class="led${o.open ? " on" : ""}" aria-hidden="true"></span>` +
      `<strong>${esc(o.text)}</strong>${h ? `<span>${esc(tr(P.dayHours, { day: ui("today"), hours: span(h.open, h.close) }))}</span>` : ""}</span>` +
      tbc({ confirmed: [h, o.quoted].every(x => x && x.confirmed === true) });
    // An unchanged 30-second tick must not repeat the live-region announcement.
    if (status !== lastStatus) { $("status").innerHTML = status; lastStatus = status; }

    document.querySelectorAll(".visit-day").forEach(row => {
      const current = Number(row.dataset.day) === c.day, marker = row.querySelector(".visit-today");
      marker.hidden = !current;
      marker.querySelector(".led").classList.toggle("on", current && o.open);
      marker.querySelector(".vh").textContent = current ? ui(o.open ? "openStatus" : "closedStatus") : "";
      if (current) row.setAttribute("aria-current", "date"); else row.removeAttribute("aria-current");
    });
  }

  /* ---- snapshot: weekly hours, with no claim about what is open now ---- */
  function still() {
    $("status").innerHTML = `<span class="status"><span class="led" aria-hidden="true"></span><span>` +
      D.hours.map(h => esc(tr(P.dayHours, { day: days(h.days), hours: span(h.open, h.close) }))).join("<br>") +
      `</span></span>${tbc({ confirmed: D.hours.every(h => h.confirmed === true) })}`;
  }

  Hotaru.boot({ page: "visit", render, tick, still });
})();
