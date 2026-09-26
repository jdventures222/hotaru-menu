/* The printable menu: responsive paper on screen, one Letter sheet in print. The same
   markup keeps every provisional label intact. Shared helpers come from core.js. */
(() => {
  const { D: M, L, tr, ui, esc, $, tbc, mark, itemChips, span, days, periodSchedule, readout, facts } = Hotaru;
  const P = M.pages.print;

  /* ---- the sheet has no live prices: every period keeps its own days and hours ---- */
  function render() {
    const R = M.restaurant;
    $("print-toolbar").innerHTML =
      `<h1>${esc(tr(P.title))}</h1><p>${esc(tr(P.intro))}</p>` +
      `<button class="btn primary" id="print-button" type="button">${esc(tr(P.button))}</button>`;

    $("print-heading").innerHTML =
      `<p class="wordmark print-name" id="sheet-name">${esc(tr(R.name))} ${tbc(R.name)}</p>` +
      `<p class="print-contact">${esc(tr(P.contact, {
        line1: R.address.line1, line2: R.address.line2, phone: R.phone.display,
      }))} ${tbc({ confirmed: R.address.confirmed === true && R.phone.confirmed === true })}</p>` +
      `<div class="print-hours"><h2 class="label">${esc(ui("hours"))}</h2><ul>` +
      M.hours.map(h => `<li><span>${esc(tr(P.schedule, { days: days(h.days), hours: span(h.open, h.close) }))}</span>${tbc(h, "hoursTbc")}</li>`).join("") +
      `</ul></div>`;

    $("options-h").textContent = ui("pickOne");
    $("prices-note").textContent = tr(P.prices);
    $("included-h").textContent = ui("included");
    $("rules-h").textContent = ui("rules");

    // One shared name track, then a price track and an hours track for every period.
    // Explicit period positions keep later rows aligned even when an option omits a price.
    $("print-options").style.setProperty("--print-option-rows", String(1 + M.periods.length * 2));
    $("print-options").innerHTML = M.options.map(o =>
      `<article class="print-option" aria-labelledby="option-${esc(o.id)}">` +
      `<div class="print-option-name"><h3 id="option-${esc(o.id)}">${esc(tr(o.name))}</h3>${tbc(o)}</div>` +
      `<ul class="rows">` + M.periods.map((p, i) => {
        const price = o.prices[p.id];
        if (!price) return "";
        const schedule = periodSchedule(p, P.schedule, { details: true });
        const scheduleHTML = schedule.parts.map(part => part.type === "element"
          ? `<span class="print-schedule-unit">${esc(part.value)}</span>` : esc(part.value)).join("");
        return `<li class="print-period" style="--print-period-row: ${esc(1 + i * 2)}"><div class="print-period-head"><span class="label">${esc(tr(p.name))}</span>` +
          `<span class="print-price">${readout(price)}${tbc(price)}</span></div>` +
          `<span class="ptime"><span class="print-schedule">${scheduleHTML}</span> ` +
          `${tbc(schedule, "hoursTbc")}</span></li>`;
      }).join("") + `</ul></article>`).join("");

    $("sample-note").hidden = !M.groups.some(g => g.items.some(it => it.sample));
    $("sample-note").textContent = ui("sampleNote");
    $("print-groups").innerHTML = M.groups.map(g =>
      `<div class="print-group"><h3 class="label">${esc(tr(g.name))}</h3><ul>` +
      g.items.map(it => `<li${it.sample ? ' class="sample"' : ""}><span class="iname">${esc(tr(it.name))}</span>` +
        `<span class="print-item-marks">${itemChips(it)}${mark(it)}</span></li>`).join("") +
      `</ul></div>`).join("");

    $("print-rules").innerHTML = M.rules.map(r =>
      `<div class="print-rule" data-rule="${esc(r.id)}"><dt class="label">${esc(tr(r.name))}</dt>` +
      `<dd>${r.value ? esc(tr(r.value)) + " " : ""}${tbc({ confirmed: r.value != null && r.confirmed === true })}</dd></div>`).join("");

    // Keep this notice identical to the top strip, including an unreviewed language.
    const draft = !facts().every(v => v.confirmed === true);
    const machine = M.languages.find(l => l.code === L).reviewed === false;
    const notice = [M.preview && tr(M.preview), draft && ui("draft"), machine && ui("machine")].filter(Boolean).join(" · ");
    $("print-sheet-foot").innerHTML = `<p class="print-site">${esc(tr(P.site))}</p>` +
      (notice ? `<p>${esc(notice)}</p>` : "");
  }

  /* ---- let the browser reflow and zoom; wait for the readout fonts before printing ---- */
  function wire() {
    $("print-button").addEventListener("click", async () => {
      await document.fonts.ready;
      window.print();
    });
  }

  Hotaru.boot({ page: "print", render, wire });
})();
