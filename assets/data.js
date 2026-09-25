/* ==========================================================================
   HOTARU SITE DATA. Edit values here; every page renders entirely from this.

   confirmed: false  shows a small "to confirm" label beside the value.
   The draft banner shows while ANY value is false and disappears on its own
   once every flag is true. Flip a flag only after Hotaru's owner confirms it.

   Text is keyed by language code ({ en: "...", es: "...", zh: "...", ko: "..." }).
   A missing language falls back to English.
   Days: 0 = Sunday, 1 = Monday ... 6 = Saturday. Times: 24-hour "HH:MM",
   in the restaurant's time zone.
   ========================================================================== */
const HOTARU = {
  // The switcher lists these in order; the first is the default.
  // intl: the locale for times, days and money. reviewed: false adds a
  // "machine translation" note until a native speaker has checked the text.
  languages: [
    { code: "en", name: "English", short: "EN",     tag: "en",      intl: "en-US" },
    { code: "es", name: "Español", short: "ES",     tag: "es",      intl: "es-US",      reviewed: false },
    { code: "zh", name: "中文",     short: "中文",   tag: "zh-Hans", intl: "zh-Hans-US", reviewed: false },
    { code: "ko", name: "한국어",   short: "한국어", tag: "ko",      intl: "ko-US",      reviewed: false },
  ],
  timeZone: "America/Los_Angeles",
  currency: "USD",
  // Shown in the top strip while this page is hosted anywhere but Hotaru's own site. null hides it.
  preview: { en: "Concept preview. Not Hotaru's official menu.", es: "Vista previa del concepto. No es el menú oficial de Hotaru.", zh: "概念预览。非 Hotaru 官方菜单。", ko: "콘셉트 미리보기예요. Hotaru의 공식 메뉴가 아니에요." },

  // Name, address and phone: Hotaru's own grand-opening flyer (Facebook, found 2026-09-25).
  restaurant: {
    name:    { en: "Hotaru Shabu & Grill", es: "Hotaru Shabu & Grill", zh: "Hotaru Shabu & Grill", ko: "Hotaru Shabu & Grill", confirmed: true },
    address: { line1: "1056 Walnut Ave", line2: "Tustin, CA 92780", confirmed: true },
    phone:   { tel: "+16572321441", display: "(657) 232-1441", confirmed: true },
    // A Waitlist button appears only when url is set. Only the owner can supply this link,
    // so it carries no confirmed flag. Keep null until they do.
    waitlist: { url: null },
    // Handles printed on Hotaru's grand-opening flyer.
    social: [
      { id: "instagram", name: "Instagram", handle: "@hotarushabuandgrill", url: "https://www.instagram.com/hotarushabuandgrill/" },
      { id: "facebook",  name: "Facebook",  handle: "Hotaru Shabu & Grill", url: "https://www.facebook.com/p/Hotaru-Shabu-Grill-Tustin-California-61580694346814/" },
    ],
  },

  // Grand-opening offer, from the flyer. It hides itself after `ends` (restaurant date).
  promo: {
    text: { en: "Grand opening: 20% off your total bill through September 30", es: "Gran apertura: 20% de descuento en tu cuenta hasta el 30 de septiembre", zh: "开业优惠：截至9月30日，整单优惠20%", ko: "오픈 기념: 9월 30일까지 총 결제 금액 20% 할인" },
    ends: "2026-09-30",
    confirmed: true,
  },

  // Site pages, in nav order. slug is the folder under the site root ("" is the home page).
  nav: [
    { id: "home",       slug: "",           label: { en: "Home", es: "Inicio", zh: "首页", ko: "홈" } },
    { id: "menu",       slug: "menu",       label: { en: "Menu", es: "Menú", zh: "菜单", ko: "메뉴" } },
    { id: "first-time", slug: "first-time", label: { en: "First time here?", es: "¿Primera visita?", zh: "初次来店？", ko: "처음이세요?" } },
    { id: "groups",     slug: "groups",     label: { en: "Groups", es: "Grupos", zh: "聚餐", ko: "단체 모임" } },
    { id: "visit",      slug: "visit",      label: { en: "Visit", es: "Visítanos", zh: "到店信息", ko: "방문 안내" } },
  ],

  // Opening hours (Roadtrippers listing, 2026-09-24).
  hours: [
    { days: [1, 2, 3, 4, 5], open: "16:00", close: "23:00", confirmed: false },
    { days: [6, 0],          open: "11:00", close: "23:00", confirmed: false },
  ],

  // When each price applies. A period must fall inside that day's opening hours; outside them it is ignored. No source gives the lunch window: weekdays open at 4 pm,
  // so lunch can only be on weekends, and the 16:00 end is a placeholder.
  periods: [
    { id: "lunch",  name: { en: "Lunch", es: "Almuerzo", zh: "午餐", ko: "점심" },  days: [6, 0],                start: "11:00", end: "16:00", confirmed: false },
    { id: "dinner", name: { en: "Dinner", es: "Cena", zh: "晚餐", ko: "저녁" }, days: [0, 1, 2, 3, 4, 5, 6], start: "16:00", end: "23:00", confirmed: false },
  ],

  // Per-adult prices by period id. amount: null shows "to confirm" with no number.
  // To show that an option isn't offered in a period, delete that period's line.
  // Listings say lunch $39.95 / dinner $49.95; one guest review says both = $49.99.
  // James confirmed the five numeric prices on 2026-09-25, and with them the three options. The
  // descriptions use Hotaru's own flyer words. The Both lunch price is still unknown.
  // photo: a path under photos/ once real photos exist; until then art picks the drawing.
  options: [
    {
      id: "shabu",
      name:  { en: "Shabu", es: "Shabu", zh: "涮涮锅", ko: "샤브샤브" },
      short: { en: "Shabu", es: "Shabu", zh: "涮涮锅", ko: "샤브샤브" },
      about: { en: "Premium shabu shabu. Cook meats and seafood in hot broth.", es: "Shabu shabu de primera. Cocina carnes, pescados y mariscos en caldo caliente.", zh: "精品涮涮锅。在热汤中涮煮肉类和海鲜。", ko: "프리미엄 샤브샤브예요. 뜨거운 육수에 고기와 해산물을 익혀 드세요." },
      confirmed: true,
      photo: null, art: "pot",
      prices: {
        lunch:  { amount: 39.95, confirmed: true },
        dinner: { amount: 49.95, confirmed: true },
      },
    },
    {
      id: "grill",
      name:  { en: "Grill", es: "Parrilla", zh: "烤肉", ko: "고기구이" },
      short: { en: "Grill", es: "Parrilla", zh: "烤肉", ko: "고기구이" },
      about: { en: "Korean BBQ grill. Sear meats on the grill at your table.", es: "Parrilla coreana. Asa las carnes en la parrilla de tu mesa.", zh: "韩式烤肉。在餐桌上的烤盘上烤肉。", ko: "한식 바비큐예요. 테이블의 불판에서 고기를 구워 드세요." },
      confirmed: true,
      photo: null, art: "grill",
      prices: {
        lunch:  { amount: 39.95, confirmed: true },
        dinner: { amount: 49.95, confirmed: true },
      },
    },
    {
      id: "both",
      name:  { en: "Shabu + Grill", es: "Shabu + Parrilla", zh: "涮涮锅 + 烤肉", ko: "샤브샤브 + 고기구이" },
      short: { en: "Both", es: "Ambos", zh: "两种", ko: "둘 다" },
      about: { en: "Hot pot and Korean BBQ at the same table.", es: "Shabu shabu y parrilla coreana en la misma mesa.", zh: "同桌享用涮涮锅和韩式烤肉。", ko: "한 테이블에서 샤브샤브와 한식 바비큐를 함께 드실 수 있어요." },
      combines: ["shabu", "grill"],
      confirmed: true,
      photo: null, art: "both",
      prices: {
        lunch:  { amount: null,  confirmed: false },
        dinner: { amount: 49.99, confirmed: true },
      },
    },
  ],

  // What's included. in: the option ids that include the item.
  // sample: true marks a placeholder row, not Hotaru's; replace with the owner's list.
  groups: [
    { id: "meats", name: { en: "Meats", es: "Carnes", zh: "肉类", ko: "고기" }, items: [
      { name: { en: "Steak", es: "Bistec", zh: "牛排", ko: "스테이크" },            in: ["grill", "both"],          confirmed: false },
      { name: { en: "Thin-sliced beef", es: "Res en láminas finas", zh: "薄切牛肉", ko: "얇게 썬 소고기" }, in: ["shabu", "grill", "both"], confirmed: false, sample: true },
      { name: { en: "Pork belly", es: "Panceta de cerdo", zh: "五花肉", ko: "삼겹살" },       in: ["shabu", "grill", "both"], confirmed: false, sample: true },
    ] },
    { id: "seafood", name: { en: "Seafood", es: "Pescados y mariscos", zh: "海鲜", ko: "해산물" }, items: [
      { name: { en: "Snakehead fish", es: "Pez cabeza de serpiente", zh: "黑鱼", ko: "가물치" }, in: ["shabu", "both"],          confirmed: false },
      { name: { en: "Shrimp", es: "Camarones", zh: "虾", ko: "새우" },         in: ["shabu", "grill", "both"], confirmed: false, sample: true },
    ] },
    { id: "broths", name: { en: "Broths", es: "Caldos", zh: "汤底", ko: "육수" }, items: [
      { name: { en: "Mild broth", es: "Caldo suave", zh: "清淡汤底", ko: "순한 육수" },  in: ["shabu", "both"], confirmed: false, sample: true },
      { name: { en: "Spicy broth", es: "Caldo picante", zh: "辣味汤底", ko: "매운 육수" }, in: ["shabu", "both"], confirmed: false, sample: true },
    ] },
    { id: "sides", name: { en: "Sauces and sides", es: "Salsas y guarniciones", zh: "酱料与配菜", ko: "소스와 곁들임" }, items: [
      { name: { en: "Appetizers", es: "Entradas", zh: "前菜", ko: "전채 요리" },               in: ["shabu", "grill", "both"], confirmed: false },
      { name: { en: "Self-serve vegetable bar", es: "Barra de verduras de autoservicio", zh: "蔬菜自助区", ko: "셀프 채소 코너" }, in: ["shabu", "grill", "both"], confirmed: false },
      { name: { en: "Dipping sauces", es: "Salsas para acompañar", zh: "蘸料", ko: "찍어 먹는 소스" },           in: ["shabu", "grill", "both"], confirmed: false, sample: true },
    ] },
    { id: "desserts", name: { en: "Desserts", es: "Postres", zh: "甜点", ko: "디저트" }, items: [
      { name: { en: "Ice cream", es: "Helado", zh: "冰淇淋", ko: "아이스크림" },   in: ["shabu", "grill", "both"], confirmed: false, sample: true },
      { name: { en: "Fresh fruit", es: "Fruta fresca", zh: "新鲜水果", ko: "신선한 과일" }, in: ["shabu", "grill", "both"], confirmed: false, sample: true },
    ] },
    { id: "drinks", name: { en: "Drinks", es: "Bebidas", zh: "饮品", ko: "음료" }, items: [
      { name: { en: "Sodas", es: "Refrescos", zh: "汽水", ko: "탄산음료" },   in: ["shabu", "grill", "both"], confirmed: false },
      { name: { en: "Calpico", es: "Calpico", zh: "可尔必思", ko: "칼피스" }, in: ["shabu", "grill", "both"], confirmed: false },
    ] },
  ],

  // Dining rules. value: null shows "to confirm" in place of an answer.
  rules: [
    { id: "time",      name: { en: "Time limit", es: "Tiempo límite", zh: "用餐时限", ko: "제한 시간" },                 value: null, confirmed: false },
    { id: "leftovers", name: { en: "Leftover charge", es: "Cargo por sobras", zh: "剩餐收费", ko: "잔반 요금" },            value: null, confirmed: false },
    { id: "kids",      name: { en: "Kids pricing", es: "Precio para niños", zh: "儿童价格", ko: "어린이 요금" },               value: null, confirmed: false },
    { id: "gratuity",  name: { en: "Group gratuity", es: "Propina para grupos", zh: "团体小费", ko: "단체 팁" },             value: null, confirmed: false },
    { id: "mix",       name: { en: "Can one table mix options?", es: "¿Se pueden combinar opciones en una mesa?", zh: "同桌可选不同套餐吗？", ko: "한 테이블에서 옵션 혼합 가능?" }, value: null, confirmed: false },
  ],

  // Copy for each page. Any object with a confirmed flag is an owner fact: false shows
  // "to confirm" and keeps the draft strip up. value: null means the answer is unknown.
  pages: {
    home: {
      title:   { en: "Shabu, grill or both in Tustin", es: "Shabu, parrilla o ambos en Tustin", zh: "在 Tustin 吃涮涮锅、烤肉，或两种都选", ko: "Tustin에서 샤브샤브, 고기구이 또는 둘 다" },
      tagline: { en: "All-you-can-eat shabu shabu and Korean BBQ. Pick one, or have both at the same table.", es: "Shabu shabu y parrilla coreana, todo lo que puedas comer. Elige uno o pide ambos en la misma mesa.", zh: "涮涮锅和韩式烤肉自助畅吃。任选一种，也可同桌享用两种。", ko: "샤브샤브와 한식 바비큐 무한리필이에요. 하나를 고르거나 한 테이블에서 둘 다 드세요." },
      spread:  { art: "both", photo: null, alt: { en: "Shabu and grill at one table", es: "Shabu y parrilla en una mesa", zh: "同桌吃涮涮锅和烤肉", ko: "한 테이블에서 샤브샤브와 고기구이" } },
      prices:  { en: "See everything each option includes", es: "Mira todo lo que incluye cada opción", zh: "查看各套餐包含的全部菜品", ko: "옵션별 포함 항목 보기" },
      promiseHeading: { en: "In Hotaru's own words", es: "Así lo describe Hotaru", zh: "Hotaru 的介绍", ko: "Hotaru의 소개" },
      hoursLine: { en: "{day} {hours}", es: "{day} {hours}", zh: "{day} {hours}", ko: "{day} {hours}" },
      periodWindow: { en: "{days} · {hours}", es: "{days} · {hours}", zh: "{days} · {hours}", ko: "{days} · {hours}" },
      // Hotaru's own words, from the grand-opening flyer.
      promise: [
        { art: "pot",   name: { en: "Premium shabu shabu", es: "Shabu shabu de primera", zh: "精品涮涮锅", ko: "프리미엄 샤브샤브" } },
        { art: "grill", name: { en: "Korean BBQ grill", es: "Parrilla coreana", zh: "韩式烤肉", ko: "한식 바비큐" } },
        { art: "leaf",  name: { en: "Fresh ingredients", es: "Ingredientes frescos", zh: "新鲜食材", ko: "신선한 재료" }, note: { en: "Quality you can taste", es: "Calidad que se saborea", zh: "吃得出的好品质", ko: "맛으로 느끼는 품질" } },
      ],
      more: [
        { page: "first-time", text: { en: "How a meal works, from picking a table to the last round.", es: "Cómo funciona, desde que eliges tu mesa hasta el último pedido.", zh: "从选择用餐方式到最后一轮点单，了解用餐流程。", ko: "이용 방식을 고르는 것부터 마지막 주문까지 안내해요." } },
        { page: "groups",     text: { en: "Birthdays, team dinners and big tables.", es: "Cumpleaños, cenas de equipo y mesas grandes.", zh: "生日、团队聚餐与大桌用餐。", ko: "생일, 팀 회식, 단체 식사 안내예요." } },
        { page: "visit",      text: { en: "Hours, directions and parking.", es: "Horarios, cómo llegar y estacionamiento.", zh: "营业时间、路线与停车信息。", ko: "영업시간, 오시는 길, 주차 안내예요." } },
      ],
    },

    firstTime: {
      title: { en: "First time here?", es: "¿Primera visita?", zh: "初次来店？", ko: "처음이세요?" },
      intro: { en: "How a meal at Hotaru works, in five steps.", es: "Cómo comer en Hotaru, en cinco pasos.", zh: "五步了解 Hotaru 的用餐流程。", ko: "Hotaru 이용 방법을 다섯 단계로 안내해요." },
      stepNumber: { en: "{number}", es: "{number}", zh: "{number}", ko: "{number}" },
      periodHours: { en: "{days} · {hours}", es: "{days} · {hours}", zh: "{days} · {hours}", ko: "{days} · {hours}" },
      steps: [
        { id: "pick",  name: { en: "Pick your table", es: "Elige tu opción", zh: "选择用餐方式", ko: "이용 방식 선택" },
          text: { en: "Choose shabu, grill, or both. Prices are per person and depend on whether you come for lunch or dinner.", es: "Elige shabu, parrilla o ambos. Los precios son por persona y dependen de si vienes a almorzar o a cenar.", zh: "选择涮涮锅、烤肉，或两种都选。按人收费，价格以午餐或晚餐时段为准。", ko: "샤브샤브, 고기구이 또는 둘 다 골라 보세요. 가격은 1인 기준이며 점심과 저녁 시간대에 따라 적용돼요." },
          rules: ["mix", "kids"],
          link: { page: "menu", text: { en: "Compare the options", es: "Compara las opciones", zh: "比较套餐", ko: "옵션 비교" } } },
        { id: "order", name: { en: "Order as you like", es: "Pide a tu gusto", zh: "随心点餐", ko: "원하는 만큼 주문" },
          text: { en: "It's all you can eat: order meats, seafood and sides, then order again whenever you're ready.", es: "Puedes comer todo lo que quieras: pide carnes, pescados, mariscos y guarniciones, y vuelve a pedir cuando quieras.", zh: "自助畅吃：先点肉类、海鲜和配菜，想再吃时可以继续加点。", ko: "무한리필이에요. 고기, 해산물, 곁들임을 주문하고 더 드시고 싶을 때 다시 주문하세요." },
          facts: [ { name: { en: "How to order", es: "Cómo pedir", zh: "点单方式", ko: "주문 방법" }, value: null, confirmed: false } ] },
        { id: "cook",  name: { en: "Cook at your seat", es: "Cocina en tu mesa", zh: "在桌上涮煮、烧烤", ko: "자리에서 조리" },
          text: { en: "Shabu: dip thin slices in hot broth for a few seconds. Grill: sear meats at your table. Cook meat and seafood until done.", es: "Shabu: sumerge las láminas finas en caldo caliente unos segundos. Parrilla: asa las carnes en tu mesa. Cocina bien las carnes, los pescados y los mariscos.", zh: "涮涮锅：将薄肉片放入热汤中涮几秒。烤肉：在餐桌上的烤盘上烤肉。肉类和海鲜都要完全煮熟或烤熟。", ko: "샤브샤브: 얇게 썬 고기를 뜨거운 육수에 몇 초간 담가 익혀요. 고기구이: 테이블에서 고기를 구워요. 고기와 해산물은 속까지 익혀 드세요." },
          facts: [ { name: { en: "Hot pot burners", es: "Quemadores para shabu", zh: "涮涮锅炉具", ko: "샤브샤브 버너" }, value: { en: "One per guest", es: "Uno por persona", zh: "每人一个", ko: "1인당 하나" }, confirmed: false } ] },
        { id: "bar",   name: { en: "Help yourself", es: "Sírvete a tu gusto", zh: "自助取菜", ko: "셀프 이용" },
          text: { en: "Vegetables are self-serve, so take what you like for your pot or grill.", es: "Las verduras son de autoservicio: toma las que te gusten para tu olla o parrilla.", zh: "蔬菜自取，喜欢的都可以拿来涮煮或烧烤。", ko: "채소는 셀프예요. 샤브샤브나 구이에 넣을 채소를 원하는 대로 가져오세요." },
          facts: [
            { name: { en: "Vegetable bar", es: "Barra de verduras", zh: "蔬菜区", ko: "채소 코너" }, value: { en: "Self-serve", es: "Autoservicio", zh: "自助", ko: "셀프" }, confirmed: false },
            { name: { en: "Sauces", es: "Salsas", zh: "酱料", ko: "소스" }, value: null, confirmed: false },
          ] },
        { id: "time",  name: { en: "Mind the clock", es: "Cuida el tiempo", zh: "留意用餐时间", ko: "시간 확인" },
          text: { en: "Before your last round, check whether there is a time limit or a leftover charge.", es: "Antes de tu último pedido, pregunta si hay tiempo límite o cargo por sobras.", zh: "最后一轮点单前，请确认是否有用餐时限或剩餐收费。", ko: "마지막 주문 전에 제한 시간이나 잔반 요금이 있는지 확인하세요." },
          rules: ["time", "leftovers"] },
      ],
    },

    groups: {
      title: { en: "Groups and parties", es: "Grupos y celebraciones", zh: "聚餐与派对", ko: "단체 모임과 파티" },
      intro: { en: "Birthdays, team dinners and club nights: how a big table works at Hotaru, and how to plan one.", es: "Cumpleaños, cenas de equipo y reuniones de clubes: cómo funcionan las mesas grandes en Hotaru y cómo organizar tu visita.", zh: "生日、团队聚餐和社团聚会：了解 Hotaru 的大桌用餐安排，以及如何提前规划。", ko: "생일, 팀 회식, 동호회 모임을 위한 Hotaru 단체 식사 이용 방법과 준비 방법을 안내해요." },
      how: { en: "How big tables work", es: "Cómo funcionan las mesas grandes", zh: "大桌用餐须知", ko: "단체 식사 안내" },
      facts: [
        { id: "size",     name: { en: "Largest table", es: "Mesa más grande", zh: "最大餐桌", ko: "최대 테이블 크기" }, value: null, confirmed: false },
        { id: "book",     name: { en: "Reservations", es: "Reservaciones", zh: "订位", ko: "예약" },  value: null, confirmed: false },
        { id: "birthday", name: { en: "Birthdays", es: "Cumpleaños", zh: "生日", ko: "생일" },     value: null, confirmed: false },
      ],
      rules: ["gratuity", "mix", "kids"],
      estimate: {
        heading: { en: "Estimate your table", es: "Calcula el costo de tu grupo", zh: "估算聚餐费用", ko: "단체 식사 비용 계산" },
        period:  { en: "Meal period", es: "Horario de comida", zh: "用餐时段", ko: "식사 시간대" },
        guests:  { en: "Adults", es: "Adultos", zh: "成人", ko: "성인" },
        fewer:   { en: "Fewer adults", es: "Menos adultos", zh: "减少成人", ko: "성인 수 줄이기" },
        more:    { en: "More adults", es: "Más adultos", zh: "增加成人", ko: "성인 수 늘리기" },
        perAdult: { en: "Per adult", es: "Por adulto", zh: "每位成人", ko: "성인 1인당" },
        schedule: { en: "{days} · {hours}", es: "{days} · {hours}", zh: "{days} · {hours}", ko: "{days} · {hours}" },
        total:   { en: "Estimated total", es: "Total estimado", zh: "预计总额", ko: "예상 총액" },
        each:    { en: "{count} × {price}", es: "{count} × {price}", zh: "{count} × {price}", ko: "{count} × {price}" },
        note:    { en: "Adult prices, before tax and gratuity. Kids pricing is to be confirmed.", es: "Precios para adultos, sin impuestos ni propina. Precio para niños por confirmar.", zh: "成人价格，未含税和小费。儿童价格待确认。", ko: "세금과 팁을 제외한 성인 요금이에요. 어린이 요금은 확인이 필요해요." },
        min: 1, max: 40, start: 8,
      },
      plan: {
        heading: { en: "Plan it with us", es: "Organízalo con nosotros", zh: "和我们一起安排", ko: "함께 준비해요" },
        intro:   { en: "Call and have these ready:", es: "Llama y ten estos datos a la mano:", zh: "致电时请准备好以下信息：", ko: "아래 내용을 준비해서 전화해 주세요:" },
        checklist: [
          { en: "The date and time", es: "La fecha y la hora", zh: "日期和时间", ko: "날짜와 시간" },
          { en: "How many guests, and how many are kids", es: "Cuántas personas vienen y cuántas son niños", zh: "总人数及儿童人数", ko: "전체 인원과 어린이 수" },
          { en: "Shabu, grill or both", es: "Shabu, parrilla o ambos", zh: "涮涮锅、烤肉，或两种都选", ko: "샤브샤브, 고기구이 또는 둘 다" },
          { en: "The occasion, if there is one", es: "El motivo de la reunión, si lo hay", zh: "聚会事由（如有）", ko: "모임 목적(있는 경우)" },
        ],
        // Set email once the owner gives one; the page then offers to send the plan by email.
        email: null,
        call: { en: "Call {phone}", es: "Llama al {phone}", zh: "致电 {phone}", ko: "{phone}로 전화하기" },
        send: { en: "Email your plan", es: "Envía tu plan por correo", zh: "电邮发送聚餐计划", ko: "계획 이메일로 보내기" },
        emailIntro: { en: "Send your estimate and include these details:", es: "Envía tu estimación e incluye estos datos:", zh: "发送费用估算，并附上以下信息：", ko: "예상 비용과 함께 아래 내용을 보내 주세요:" },
        subject: { en: "Group planning: {count} adults · {option} · {period}", es: "Plan para grupo: {count} adultos · {option} · {period}", zh: "聚餐计划：{count}位成人 · {option} · {period}", ko: "단체 식사 계획: 성인 {count}명 · {option} · {period}" },
        body: { en: "Hello, I'd like to plan a group meal.\n\nAdults: {count}\nOption: {option}\nMeal period: {period}\nListed schedule: {schedule}\nPer adult: {price}\nEstimated total: {total}\n{note}\n\nDate and time:\nNumber of kids:\nOccasion:\n\nPlease confirm availability, pricing and group policies. Thank you.", es: "Hola, me gustaría organizar una comida en grupo.\n\nAdultos: {count}\nOpción: {option}\nHorario de comida: {period}\nHorario indicado: {schedule}\nPor adulto: {price}\nTotal estimado: {total}\n{note}\n\nFecha y hora:\nNúmero de niños:\nMotivo de la reunión:\n\nPor favor, confirma la disponibilidad, los precios y las políticas para grupos. Gracias.", zh: "你好，我想安排一次聚餐。\n\n成人：{count}位\n套餐：{option}\n用餐时段：{period}\n所列时间：{schedule}\n每位成人：{price}\n预计总额：{total}\n{note}\n\n日期和时间：\n儿童人数：\n聚会事由：\n\n请确认是否有位、价格及团体用餐规定。谢谢。", ko: "안녕하세요, 단체 식사를 계획하고 싶어요.\n\n성인: {count}명\n옵션: {option}\n식사 시간대: {period}\n안내된 시간: {schedule}\n성인 1인당: {price}\n예상 총액: {total}\n{note}\n\n날짜와 시간:\n어린이 수:\n모임 목적:\n\n예약 가능 여부와 가격, 단체 이용 규정을 확인해 주세요. 감사해요." },
        provisional: { en: "{value} (to confirm)", es: "{value} (por confirmar)", zh: "{value}（待确认）", ko: "{value} (확인 필요)" },
      },
    },

    visit: {
      title: { en: "Visit", es: "Visítanos", zh: "到店信息", ko: "방문 안내" },
      directions:  { en: "Get directions", es: "Cómo llegar", zh: "查看路线", ko: "길찾기" },
      gettingHere: { en: "Where we are", es: "Dónde estamos", zh: "我们的位置", ko: "위치 안내" },
      callNumber:  { en: "{call} {phone}", es: "{call} al {phone}", zh: "{call} {phone}", ko: "{call} {phone}" },
      dayHours:    { en: "{day} {hours}", es: "{day} {hours}", zh: "{day} {hours}", ko: "{day} {hours}" },
      periodHours: { en: "{period} {hours}", es: "{period} {hours}", zh: "{period} {hours}", ko: "{period} {hours}" },
      joinPeriods: { en: "{first} · {next}", es: "{first} · {next}", zh: "{first} · {next}", ko: "{first} · {next}" },
      // From the 2026-09-24 research (market/REPORT.md): R-Ranch Market's own site lists 1112 Walnut Ave;
      // the I-5 Newport Ave and SR-55 McFadden Ave exits are each about half a mile away in a straight line.
      near:  { en: "On Walnut Ave near Newport Ave, by R\u2011Ranch Market.", es: "En Walnut Ave, cerca de Newport Ave, junto a R‑Ranch Market.", zh: "位于 Walnut Ave，靠近 Newport Ave，在 R‑Ranch Market 旁。", ko: "Walnut Ave에 있으며 Newport Ave 근처, R‑Ranch Market 옆이에요." },
      roads: { en: "Close to the I-5 (Newport Ave exit) and the 55 (McFadden Ave exit).", es: "Cerca de la I-5 (salida Newport Ave) y la 55 (salida McFadden Ave).", zh: "靠近 I-5（Newport Ave 出口）和 55（McFadden Ave 出口）。", ko: "I-5(Newport Ave 출구)와 55(McFadden Ave 출구)에서 가까워요." },
      parking: { name: { en: "Parking", es: "Estacionamiento", zh: "停车", ko: "주차" }, value: null, confirmed: false },
      maps: [
        { id: "apple",  name: { en: "Apple Maps", es: "Mapas de Apple", zh: "Apple 地图", ko: "Apple 지도" },  url: "https://maps.apple.com/?q=Hotaru+Shabu+%26+Grill&address=1056+Walnut+Ave,+Tustin,+CA+92780" },
        { id: "google", name: { en: "Google Maps", es: "Google Maps", zh: "Google 地图", ko: "Google 지도" }, url: "https://www.google.com/maps/search/?api=1&query=Hotaru+Shabu+%26+Grill%2C+1056+Walnut+Ave%2C+Tustin%2C+CA+92780" },
      ],
    },

    print: {
      title:  { en: "Printable menu", es: "Menú para imprimir", zh: "可打印菜单", ko: "인쇄용 메뉴" },
      intro:  { en: "One letter-size page for the host stand and tables.", es: "Una página tamaño carta para la recepción y las mesas.", zh: "一页 Letter 纸尺寸，供迎宾台和餐桌使用。", ko: "안내 데스크와 테이블에 놓을 레터 용지 한 장 분량이에요." },
      button: { en: "Print", es: "Imprimir", zh: "打印", ko: "인쇄" },
      contact: { en: "{line1}, {line2} · {phone}", es: "{line1}, {line2} · {phone}", zh: "{line1}, {line2} · {phone}", ko: "{line1}, {line2} · {phone}" },
      schedule: { en: "{days} · {hours}", es: "{days} · {hours}", zh: "{days} · {hours}", ko: "{days} · {hours}" },
      prices: { en: "Adult prices, per person", es: "Precios para adultos, por persona", zh: "成人价格，按人收费", ko: "성인 1인 요금" },
      site: { en: "hotaru.fyt.life", es: "hotaru.fyt.life", zh: "hotaru.fyt.life", ko: "hotaru.fyt.life" },
    },
  },

  // Every interface string. {time}, {day}, {period}, {name} and {page} are filled in by the page.
  ui: {
    pageTitle:     { en: "{name} · {page}", es: "{name} · {page}", zh: "{name} · {page}", ko: "{name} · {page}" },
    skip:          { en: "Skip to content", es: "Saltar al contenido", zh: "跳至正文", ko: "본문으로 건너뛰기" },
    language:      { en: "Language", es: "Idioma", zh: "语言", ko: "언어" },
    pagesNav:      { en: "Pages", es: "Páginas", zh: "页面", ko: "페이지" },
    machine:       { en: "Machine translation, not yet checked", es: "Traducción automática, aún sin revisión humana", zh: "机器翻译，尚未经人工审核", ko: "아직 사람이 검토하지 않은 기계 번역이에요" },
    hours:         { en: "Hours", es: "Horarios", zh: "营业时间", ko: "영업시간" },
    follow:        { en: "Follow Hotaru", es: "Sigue a Hotaru", zh: "关注 Hotaru", ko: "Hotaru 팔로우" },
    printMenu:     { en: "Printable menu", es: "Menú para imprimir", zh: "可打印菜单", ko: "인쇄용 메뉴" },
    openStatus:    { en: "Open now", es: "Abierto ahora", zh: "营业中", ko: "영업 중" },
    closedStatus:  { en: "Closed now", es: "Cerrado ahora", zh: "未营业", ko: "현재 영업하지 않음" },
    more:          { en: "More", es: "Más", zh: "更多", ko: "더 보기" },
    draft:         { en: "Draft: prices and items to be confirmed", es: "Borrador: precios y productos por confirmar", zh: "草稿：价格和菜品待确认", ko: "초안: 가격과 메뉴 확인 필요" },
    toConfirm:     { en: "to confirm", es: "por confirmar", zh: "待确认", ko: "확인 필요" },
    priceTbc:      { en: "Price to confirm", es: "Precio por confirmar", zh: "价格待确认", ko: "가격 확인 필요" },
    notOffered:    { en: "Not offered at this time", es: "No disponible en este horario", zh: "该时段不提供", ko: "이 시간대에는 제공되지 않아요" },
    sample:        { en: "sample", es: "ejemplo", zh: "示例", ko: "예시" },
    sampleNote:    { en: "Rows marked sample are placeholders until Hotaru shares its item list.", es: "Las filas marcadas como ejemplo son provisionales hasta que Hotaru comparta su lista de productos.", zh: "标有“示例”的条目仅作占位，待 Hotaru 提供菜品清单后替换。", ko: "예시로 표시된 항목은 Hotaru에서 메뉴 목록을 제공하기 전까지 임시로 넣은 내용이에요." },
    photoComing:   { en: "photo coming", es: "foto pendiente", zh: "照片待补", ko: "사진 준비 중" },
    today:         { en: "Today", es: "Hoy", zh: "今天", ko: "오늘" },
    tomorrow:      { en: "tomorrow", es: "mañana", zh: "明天", ko: "내일" },
    daily:         { en: "Daily", es: "Todos los días", zh: "每天", ko: "매일" },
    closed:        { en: "Closed", es: "Cerrado", zh: "非营业时间", ko: "영업시간 외" },
    closedDay:     { en: "Closed", es: "Cerrado", zh: "休息", ko: "휴무" },
    openNow:       { en: "Open now until {time}", es: "Abierto ahora hasta las {time}", zh: "营业中，至{time}", ko: "영업 중 · {time}까지" },
    opensAt:       { en: "Opens today at {time}", es: "Abre hoy a las {time}", zh: "今天{time}开始营业", ko: "오늘 {time}에 열어요" },
    closedToday:   { en: "Closed for today. Opens {day} at {time}", es: "Cerrado por hoy. Próxima apertura: {day} a las {time}", zh: "今天已打烊，{day}{time}开始营业", ko: "오늘 영업은 끝났어요. {day} {time}에 열어요" },
    closedAllDay:  { en: "Closed today. Opens {day} at {time}", es: "Cerrado hoy. Próxima apertura: {day} a las {time}", zh: "今天不营业，{day}{time}开始营业", ko: "오늘은 쉬어요. {day} {time}에 열어요" },
    nowPrice:      { en: "{period} prices now, per person", es: "{period}: precios actuales por persona", zh: "当前为{period}价格，按人收费", ko: "현재 {period} 요금 · 1인 기준" },
    mainPrice:     { en: "{period} prices, per person", es: "{period}: precios por persona", zh: "{period}价格，按人收费", ko: "{period} 요금 · 1인 기준" },
    nextPrice:     { en: "{period} prices from {time}, per person", es: "{period}: precios por persona desde las {time}", zh: "{time}起为{period}价格，按人收费", ko: "{time}부터 {period} 요금 · 1인 기준" },
    nextPriceDay:  { en: "{period} prices {day} from {time}, per person", es: "{period}: precios por persona · {day}, desde las {time}", zh: "{day}{time}起为{period}价格，按人收费", ko: "{day} {time}부터 {period} 요금 · 1인 기준" },
    now:           { en: "Now", es: "Ahora", zh: "当前", ko: "현재" },
    next:          { en: "Next", es: "Después", zh: "接下来", ko: "다음" },
    pickOne:       { en: "Pick your table", es: "Elige tu opción", zh: "选择用餐方式", ko: "이용 방식 선택" },
    options:       { en: "Options", es: "Opciones", zh: "套餐", ko: "옵션" },
    included:      { en: "What's included", es: "Qué incluye", zh: "包含菜品", ko: "포함 항목" },
    onlyWith:      { en: "Only with", es: "Solo con", zh: "仅限", ko: "다음 옵션에만 포함:" },
    compare:       { en: "Side by side", es: "Comparación", zh: "对比", ko: "한눈에 비교" },
    item:          { en: "Item", es: "Producto", zh: "菜品", ko: "항목" },
    yes:           { en: "Included", es: "Incluido", zh: "包含", ko: "포함" },
    no:            { en: "Not included", es: "No incluido", zh: "不包含", ko: "미포함" },
    rules:         { en: "Before you sit down", es: "Antes de sentarte", zh: "入座前须知", ko: "착석 전 안내" },
    directions:    { en: "Directions", es: "Cómo llegar", zh: "路线", ko: "길찾기" },
    call:          { en: "Call", es: "Llama", zh: "致电", ko: "전화" },
    waitlist:      { en: "Join the waitlist", es: "Anótate en la lista de espera", zh: "加入候位", ko: "대기 등록" },
  },
};
