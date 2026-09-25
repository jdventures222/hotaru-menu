/* The printable menu: one Letter sheet, scaled down for the screen. The same markup
   prints with every provisional label intact. Shared helpers come from core.js. */
(() => {
  const { D: M, L, tr, ui, esc, $, tbc, mark, span, days, readout, facts } = Hotaru;
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
      M.hours.map(h => `<li>${esc(tr(P.schedule, { days: days(h.days), hours: span(h.open, h.close) }))} ${tbc(h)}</li>`).join("") +
      `</ul></div>`;

    $("options-h").textContent = ui("pickOne");
    $("prices-note").textContent = tr(P.prices);
    $("included-h").textContent = ui("included");
    $("rules-h").textContent = ui("rules");

    $("print-options").innerHTML = M.options.map(o =>
      `<article class="print-option" aria-labelledby="option-${esc(o.id)}">` +
      `<div class="print-option-name"><h3 id="option-${esc(o.id)}">${esc(tr(o.name))}</h3>${tbc(o)}</div>` +
      `<ul class="rows">` + M.periods.filter(p => o.prices[p.id]).map(p => {
        const price = o.prices[p.id];
        return `<li class="print-period"><div class="print-period-head"><span class="label">${esc(tr(p.name))}</span>` +
          `${readout(price)}</div>` +
          `<span class="ptime">${esc(tr(P.schedule, { days: days(p.days), hours: span(p.start, p.end) }))} ` +
          `${tbc({ confirmed: price.amount != null && price.confirmed === true && p.confirmed === true })}</span></li>`;
      }).join("") + `</ul></article>`).join("");

    // Match the Menu's base-option chips and sample labels.
    const chips = it => {
      if (M.options.every(o => it.in.includes(o.id))) return "";
      const has = M.options.filter(o => it.in.includes(o.id));
      const bases = has.filter(o => !o.combines);
      return (bases.length ? bases : has).map(o =>
        `<span class="chip"><span class="vh">${esc(ui("onlyWith"))} </span>${esc(tr(o.short))}</span>`).join("");
    };
    $("sample-note").hidden = !M.groups.some(g => g.items.some(it => it.sample));
    $("sample-note").textContent = ui("sampleNote");
    $("print-groups").innerHTML = M.groups.map(g =>
      `<div class="print-group"><h3 class="label">${esc(tr(g.name))}</h3><ul>` +
      g.items.map(it => `<li${it.sample ? ' class="sample"' : ""}><span class="iname">${esc(tr(it.name))}</span>` +
        `<span class="print-item-marks">${chips(it)}${mark(it)}</span></li>`).join("") +
      `</ul></div>`).join("");

    $("print-rules").innerHTML = M.rules.map(r =>
      `<div class="print-rule"><dt class="label">${esc(tr(r.name))}</dt>` +
      `<dd>${r.value ? esc(tr(r.value)) + " " : ""}${tbc({ confirmed: r.value != null && r.confirmed === true })}</dd></div>`).join("");

    // Keep this notice identical to the top strip, including an unreviewed language.
    const draft = !facts().every(v => v.confirmed === true);
    const machine = M.languages.find(l => l.code === L).reviewed === false;
    const notice = [M.preview && tr(M.preview), draft && ui("draft"), machine && ui("machine")].filter(Boolean).join(" · ");
    $("print-sheet-foot").innerHTML = `<p class="print-site">${esc(tr(P.site))}</p>` +
      (notice ? `<p>${esc(notice)}</p>` : "");
  }

  /* ---- fit the paper to the preview; printing always restores its physical size ---- */
  function wire() {
    const preview = $("print-preview"), sheet = $("print-sheet");
    const fit = () => sheet.style.setProperty("--preview-scale", Math.min(1, preview.clientWidth / sheet.offsetWidth));
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(preview);
    $("print-button").addEventListener("click", async () => {
      await document.fonts.ready;
      window.print();
    });
  }

  Hotaru.boot({ page: "print", render, wire });
})();
