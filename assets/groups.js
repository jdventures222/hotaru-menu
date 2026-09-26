/* Groups and parties: a plan to share, an adult-price estimate and honest table policies.
   Shared helpers come from core.js; only the initial period follows the restaurant's clock. */
(() => {
  const { D, LOC, tr, ui, esc, $, tbc, periodSchedule, clock, priceState, money, readout, href } = Hotaru;
  const G = D.pages.groups, E = G.estimate, P = G.plan;
  const countFmt = new Intl.NumberFormat(LOC);
  let option = D.options[0], period = null, count = E.start;
  const schedule = p => periodSchedule(p, E.schedule);
  const estimateNote = () => {
    const kids = D.rules.find(r => r.id === "kids");
    return tr(kids?.confirmed === true && tr(kids.value).trim() ? E.note : E.noteKidsTbc);
  };
  const lineIcon = path => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;

  /* ---- static render ---- */
  function render() {
    $("top").innerHTML = `<h1>${esc(tr(G.title))}</h1><p class="groups-intro">${esc(tr(G.intro))}</p>`;
    $("rules-h").textContent = tr(G.how);
    $("estimate-h").textContent = tr(E.heading);
    $("plan-h").textContent = tr(P.heading);
    $("all-prices").setAttribute("href", `${href("menu")}#prices`);
    $("all-prices").textContent = tr(G.prices);

    const rules = [...G.facts, ...G.rules.map(id => D.rules.find(r => r.id === id)).filter(Boolean)];
    $("rules").innerHTML = rules.map(r =>
      `<div class="rule"><dt class="label">${esc(tr(r.name))}</dt><dd>` +
      `${r.value == null ? tbc({ confirmed: false }) : esc(tr(r.value)) + " " + tbc(r)}</dd></div>`).join("");

    $("estimate").innerHTML = `<div class="card-body estimate-body">` +
      `<fieldset class="estimate-field"><legend class="label">${esc(ui("options"))}</legend><div class="estimate-options">` +
      D.options.map((o, i) => `<label class="key estimate-choice">` +
        `<input type="radio" name="option" id="option-${esc(o.id)}" value="${esc(o.id)}"${i === 0 ? " checked" : ""}>` +
        `<span class="kname">${esc(tr(o.short))}</span>${tbc(o)}</label>`).join("") +
      `</div></fieldset>` +
      `<fieldset class="estimate-field"><legend class="label">${esc(tr(E.period))}</legend><div class="estimate-periods">` +
      D.periods.map(p => `<label class="key estimate-choice">` +
        `<input type="radio" name="period" id="period-${esc(p.id)}" value="${esc(p.id)}">` +
        `<span class="kname">${esc(tr(p.name))}</span><span class="ptime">${esc(schedule(p))}</span>${tbc(periodSchedule(p, E.schedule, { details: true }), "hoursTbc")}</label>`).join("") +
      `</div></fieldset>` +
      `<div class="estimate-guests"><label class="label" for="adults">${esc(tr(E.guests))}</label>` +
      `<div class="estimate-stepper"><button class="btn" type="button" id="fewer" aria-label="${esc(tr(E.fewer))}" aria-controls="adults">${lineIcon('<path d="M5 12h14"/>')}</button>` +
      `<input id="adults" name="adults" type="number" inputmode="numeric" min="${esc(E.min)}" max="${esc(E.max)}" step="1" value="${esc(E.start)}" required>` +
      `<button class="btn" type="button" id="more" aria-label="${esc(tr(E.more))}" aria-controls="adults">${lineIcon('<path d="M5 12h14M12 5v14"/>')}</button></div></div>` +
      `<output class="estimate-result" id="result" for="adults ${esc(D.options.map(o => `option-${o.id}`).join(" "))} ${esc(D.periods.map(p => `period-${p.id}`).join(" "))}" aria-live="polite" aria-atomic="true" aria-describedby="estimate-note"></output>` +
      `<p class="about" id="estimate-note">${esc(estimateNote())}</p></div>`;

    $("plan").innerHTML = `<p class="groups-plan-intro">${esc(tr(P.email ? P.emailIntro : P.intro))}</p>` +
      `<ul class="items groups-checklist" role="list">` + P.checklist.map(item =>
        `<li>${lineIcon('<path d="m5 12 4 4L19 6"/>')}<span>${esc(tr(item))}</span></li>`).join("") +
      `</ul>` + (P.email ? `<a class="btn groups-contact" id="contact"></a>` : "");
    // Keep a single Call button: fixed on phones, beside the checklist on laptops.
    $("plan").appendChild($("actions"));
  }

  /* ---- estimates are never lit; integer cents keep the multiplication exact ---- */
  function update() {
    const price = option.prices[period.id];
    $("fewer").disabled = count <= E.min;
    $("more").disabled = count >= E.max;
    // No price line means the option is not offered in this period.
    if (!price) {
      $("result").innerHTML = `<span class="estimate-each">${esc(ui("notOffered"))}</span>`;
      return contact({ amount: null, notOffered: true }, { amount: null, notOffered: true });
    }
    const quoted = { amount: price.amount, confirmed: price.amount != null && price.confirmed === true };
    const total = { amount: price.amount == null ? null : Math.round(price.amount * 100) * count / 100, confirmed: quoted.confirmed };
    $("result").innerHTML =
      `<span class="estimate-unit"><span class="label">${esc(tr(E.perAdult))}</span><span class="estimate-amount">${readout(quoted)}${tbc(quoted)}</span></span>` +
      `<span class="estimate-each">${esc(tr(E.each, { count: countFmt.format(count), price: price.amount == null ? ui("toConfirm") : money.format(price.amount) }))}</span>` +
      `<span class="label">${esc(tr(E.total))}</span>` +
      `<span class="estimate-amount estimate-total">${readout(total)}${tbc(total)}</span>`;
    contact(price, total);
  }

  function contact(price, total) {
    if (!P.email) return;
    const a = $("contact");
    const qualified = (value, confirmed) => confirmed === true ? value : tr(P.provisional, { value });
    const quotedMoney = p => p.notOffered ? ui("notOffered") : p.amount == null ? ui("toConfirm") : qualified(money.format(p.amount), p.confirmed);
    const vars = {
      count: countFmt.format(count), option: tr(option.name), period: tr(period.name),
      schedule: qualified(schedule(period), periodSchedule(period, E.schedule, { details: true }).confirmed), price: quotedMoney(price),
      total: quotedMoney(total), note: estimateNote(),
    };
    const body = tr(P.body, { ...vars, option: qualified(vars.option, option.confirmed) });
    a.setAttribute("href", `mailto:${P.email}?subject=${encodeURIComponent(tr(P.subject, vars))}&body=${encodeURIComponent(body)}`);
    a.innerHTML = `${lineIcon('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>')}<span>${esc(tr(P.send))}</span>`;
  }

  /* ---- choose the current or next period once; later ticks leave the plan alone ---- */
  function selectPeriod(p) {
    // The live period is a clipped copy; use its id to select the listed planning schedule.
    period = D.periods.find(listed => listed.id === p.id);
    $(`period-${p.id}`).checked = true;
    update();
  }
  function tick() {
    if (!period) selectPeriod(priceState(clock())?.period || D.periods[0]);
  }
  function still() {
    selectPeriod([...D.periods].sort((a, b) => b.days.length - a.days.length)[0]);
  }

  /* ---- native radios and number input keep keyboard and touch behavior familiar ---- */
  function wire() {
    const input = $("adults");
    const clamp = n => Math.min(E.max, Math.max(E.min, Math.round(n)));
    const setCount = n => { count = clamp(n); input.value = count; update(); };
    $("estimate").addEventListener("submit", e => e.preventDefault());
    $("estimate").addEventListener("change", e => {
      if (e.target.name === "option") option = D.options.find(o => o.id === e.target.value);
      else if (e.target.name === "period") period = D.periods.find(p => p.id === e.target.value);
      else return;
      update();
    });
    input.addEventListener("input", () => {
      if (Number.isFinite(input.valueAsNumber)) setCount(input.valueAsNumber);
    });
    input.addEventListener("change", () => setCount(Number.isFinite(input.valueAsNumber) ? input.valueAsNumber : count));
    input.addEventListener("blur", () => { if (!input.value) setCount(count); });
    $("fewer").addEventListener("click", () => setCount(count - 1));
    $("more").addEventListener("click", () => setCount(count + 1));
  }

  Hotaru.boot({ page: "groups", render, tick, still, wire, primary: "call" });
})();
