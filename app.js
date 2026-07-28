/* =========================================================================
   We Are TIMS · Calculadora de ahorro — V2 (asistente paso a paso)
   Reutiliza la misma lógica de datos/cálculo de la v1; UI en formato wizard.
   ========================================================================= */

/* ------------------------------------------------------------------ *
 * 1. CONFIGURACIÓN
 * ------------------------------------------------------------------ */
const CSV_BASE =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQd6Mc1uBOzzyTG-Yk8c6GrVc_stlceQovtN1baV5glRML-iwXab6-OtrXyEi874xMPP6o7Me88_azU/pub?output=csv";
const CSV_HONORARIOS = CSV_BASE;
const CSV_PRIMAS = CSV_BASE + "&gid=971899218";

// Tipo de cambio USD→EUR: en vivo al cargar, con respaldo (ver v1 README).
const USD_TO_EUR_FALLBACK = 0.87;
const RATE_SOURCES = [
  { name: "Frankfurter (BCE)", url: "https://api.frankfurter.app/latest?from=USD&to=EUR", extract: (d) => ({ rate: d?.rates?.EUR, date: d?.date }) },
  { name: "exchangerate-api", url: "https://open.er-api.com/v6/latest/USD", extract: (d) => ({ rate: d?.rates?.EUR, date: (d?.time_last_update_utc || "").slice(0, 16) }) },
];

// ── CONTACTO / CTA ────────────────────────────────────────────────────────
const CALENDLY_URL = "https://calendly.com/aleix-dalmau-wearetims/30min";
// URL del backend (Apps Script del buzón de wearetims) que guarda el lead y
// manda los avisos. El backend espera form-data URL-encoded (ver leadBody).
const CONTACT_ENDPOINT = "https://script.google.com/macros/s/AKfycbxMPS8qALhRokBvXjU1ToIzuhqYAmgEBXIr0x6i3Bxw5yyQk0q2wPC70QFXpFiJSyQXBg/exec";

// Identifica DE QUÉ SITIO viene el envío (el backend es compartido por varias
// webs). Cámbialo en cada despliegue: p. ej. "Calculadora de ahorro".
const LEAD_ORIGEN = "Calculadora de ahorro";

const PERFILES = ["Ventas", "Tech", "Soporte", "Operaciones", "RRHH y Administrativo", "Marketing"];
const PAISES_RECOMENDADOS = ["Colombia", "Perú", "Venezuela"];
const SENIORITIES = ["Junior", "Mid", "Senior"];
const TOTAL_STEPS = 5;

// Iconos de línea (SVG, currentColor) por perfil — profesionales, sin emojis.
const SVG = (paths) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const PERFIL_ICON = {
  Ventas: SVG('<path d="M3 17l6-6 4 4 8-8"/><path d="M17 7h4v4"/>'),
  Tech: SVG('<path d="M8 8l-4 4 4 4"/><path d="M16 8l4 4-4 4"/><path d="M13 5l-2 14"/>'),
  Soporte: SVG('<path d="M5 12a7 7 0 0 1 14 0"/><rect x="3" y="12" width="4" height="6" rx="1.5"/><rect x="17" y="12" width="4" height="6" rx="1.5"/><path d="M19 18v1a3 3 0 0 1-3 3h-2"/>'),
  Operaciones: SVG('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>'),
  "RRHH y Administrativo": SVG('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>'),
  Marketing: SVG('<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>'),
};

// Bandera por país (emoji) — ayuda al reconocimiento visual rápido.
const PAIS_FLAG = {
  Argentina: "🇦🇷", Brasil: "🇧🇷", Chile: "🇨🇱", Colombia: "🇨🇴", "Costa Rica": "🇨🇷",
  Ecuador: "🇪🇨", "México": "🇲🇽", Paraguay: "🇵🇾", "Perú": "🇵🇪", "Puerto Rico": "🇵🇷",
  "República Dominicana": "🇩🇴", Uruguay: "🇺🇾", Venezuela: "🇻🇪",
};

/* ------------------------------------------------------------------ *
 * 2. INTERNACIONALIZACIÓN
 * ------------------------------------------------------------------ */
const I18N = {
  es: {
    q1: "¿Qué perfil necesitas?", q1help: "Elige el área del profesional que quieres incorporar.",
    posLabel: "Posición concreta",
    q2: "¿Qué nivel y cuántas personas?", q2help: "El nivel de experiencia influye en la tarifa.",
    personasLabel: "Número de personas",
    q3: "¿Desde qué país?", q3help: "Cada tarjeta muestra el coste mensual del profesional. Verás marcado el más barato.",
    q4: "¿Cuánto te costaría en España?", q4help: "Introduce el salario bruto anual; calcularemos el coste-empresa real.",
    salarioLabel: "Salario bruto anual ({ccy})",
    salarioHint: "Escribe lo que te cuesta ese trabajador: el salario bruto anual que le pagarías en España.",
    recLabel2: "Tipo de reclutamiento", interno: "Interno", internoSub: "Sin coste extra", externo: "Externo", externoSub: "+{pct}% reclutamiento",
    advanced: "Ajustes avanzados", ssLabel: "Seguridad Social (%)", recPctLabel: "Reclutamiento externo (%)",
    primasTitle: "Primas (extras)", primasNote: "Extras opcionales. Toca para añadirlas al coste TIMS.",
    resultLabel: "Ahorro mensual", espana: "España", tims: "TIMS", ahorroAnual: "Ahorro anual",
    pctLess: "{pct}% menos que España", pctMore: "{pct}% MÁS caro que España",
    noData: "Sin datos", noDataMsg: "Esta posición no está disponible para el país elegido.",
    onboardingValue: "48 hrs", onboardingLabel: "Onboarding", availValue: "Inmediata", availLabel: "Disponibilidad",
    why1: "Talento latinoamericano altamente cualificado", why2: "Misma zona horaria o solapamiento garantizado",
    why3: "Sin costes de seguridad social ni IRPF", why4: "Onboarding en menos de 2 semanas",
    cta: "Habla con un experto",
    trustOnboard: "Onboarding en 48 h", trustAvail: "Disponibilidad inmediata",
    back: "Atrás", next: "Continuar", seeSavings: "Ver mi ahorro", restart: "Empezar de nuevo",
    // Modal de contacto
    contactTitle: "¿Cómo prefieres continuar?",
    optScheduleTitle: "Agendar una reunión", optScheduleSub: "Elige un hueco en nuestro calendario",
    optContactTitle: "Que te contactemos", optContactSub: "Déjanos tus datos y te llamamos",
    formName: "Nombre", formEmail: "Email", formPhone: "Teléfono", formCompany: "Empresa",
    formMessage: "Mensaje (opcional)",
    scheduleTitle: "Antes de agendar", scheduleSub: "Cuéntanos con quién hablará el equipo, para preparar la reunión.",
    scheduleCompany: "Empresa", scheduleGo: "Continuar a Calendly",
    formSend: "Enviar", formBack: "Cancelar", formSending: "Enviando…",
    validationMsg: "Revisa el nombre, el email y la empresa antes de enviar.",
    errorMsg: "No se pudo enviar. Inténtalo de nuevo en un momento.",
    successTitle: "¡Gracias!", successMsg: "Hemos recibido tus datos. Un experto de TIMS te contactará muy pronto.",
    contactCtxLabel: "Tu simulación", ctxAhorro: "ahorro estimado",
    stepName: ["Perfil", "Nivel", "País", "Coste", "Ahorro"],
    progressCount: "Paso {n} de {total}",
    revealHeadline: "Ahorras un <strong>{pct}%</strong> frente a España",
    revealSummary: "{personas}× {posicion} · {seniority} · {pais}",
    costeEspana: "De tu coste mensual en España ({total})",
    tuAhorro: "Tu ahorro", vaTims: "Coste TIMS",
    kpiMonthly: "Al mes", kpiAnnual: "Al año", kpi3y: "En 3 años",
    tagRec: "Recomendado", tagCheap: "Más barato",
    senJuniorSub: "0–2 años de experiencia", senMidSub: "2–5 años", senSeniorSub: "5+ años",
    loading: "Cargando datos y tipo de cambio…",
    errorTitle: "No se pudieron cargar los datos.", errorHelp: "Comprueba tu conexión o inténtalo de nuevo.",
    rateNote: "Importes en USD convertidos a EUR · 1 USD = {rate} EUR ({origen}). Estimación orientativa.",
    rateOrigenFallback: "tipo de respaldo", rateOrigenLive: "fuente: {source}{date}",
    perfil: {},
  },
  en: {
    q1: "Which profile do you need?", q1help: "Choose the area of the professional you want to hire.",
    posLabel: "Specific position",
    q2: "What level and how many people?", q2help: "Experience level affects the rate.",
    personasLabel: "Number of people",
    q3: "From which country?", q3help: "Each card shows the professional's monthly cost. The cheapest is flagged.",
    q4: "How much would it cost in Spain?", q4help: "Enter the gross annual salary; we'll compute the real employer cost.",
    salarioLabel: "Gross annual salary ({ccy})",
    salarioHint: "Enter what that worker costs you: the gross annual salary you'd pay them in Spain.",
    recLabel2: "Recruitment type", interno: "In-house", internoSub: "No extra cost", externo: "External", externoSub: "+{pct}% recruitment",
    advanced: "Advanced settings", ssLabel: "Social Security (%)", recPctLabel: "External recruitment (%)",
    primasTitle: "Add-ons (extras)", primasNote: "Optional extras. Tap to add them to the TIMS cost.",
    resultLabel: "Monthly savings", espana: "Spain", tims: "TIMS", ahorroAnual: "Annual savings",
    pctLess: "{pct}% less than Spain", pctMore: "{pct}% MORE expensive than Spain",
    noData: "No data", noDataMsg: "This position isn't available for the chosen country.",
    onboardingValue: "48 hrs", onboardingLabel: "Onboarding", availValue: "Immediate", availLabel: "Availability",
    why1: "Highly qualified Latin American talent", why2: "Same time zone or guaranteed overlap",
    why3: "No social security or income-tax costs", why4: "Onboarding in under 2 weeks",
    cta: "Talk to an expert",
    trustOnboard: "Onboarding in 48 h", trustAvail: "Immediate availability",
    back: "Back", next: "Continue", seeSavings: "See my savings", restart: "Start over",
    // Contact modal
    contactTitle: "How would you like to continue?",
    optScheduleTitle: "Schedule a meeting", optScheduleSub: "Pick a slot in our calendar",
    optContactTitle: "Get contacted", optContactSub: "Leave your details and we'll reach out",
    formName: "Name", formEmail: "Email", formPhone: "Phone", formCompany: "Company",
    formMessage: "Message (optional)",
    scheduleTitle: "Before you book", scheduleSub: "Tell us who the team will be speaking with, so we can prepare the meeting.",
    scheduleCompany: "Company", scheduleGo: "Continue to Calendly",
    formSend: "Send", formBack: "Cancel", formSending: "Sending…",
    validationMsg: "Please check your name, email and company before sending.",
    errorMsg: "Couldn't send. Please try again in a moment.",
    successTitle: "Thank you!", successMsg: "We've received your details. A TIMS expert will contact you very soon.",
    contactCtxLabel: "Your simulation", ctxAhorro: "estimated savings",
    stepName: ["Profile", "Level", "Country", "Cost", "Savings"],
    progressCount: "Step {n} of {total}",
    revealHeadline: "You save <strong>{pct}%</strong> versus Spain",
    revealSummary: "{personas}× {posicion} · {seniority} · {pais}",
    costeEspana: "Of your monthly cost in Spain ({total})",
    tuAhorro: "Your savings", vaTims: "TIMS cost",
    kpiMonthly: "Monthly", kpiAnnual: "Yearly", kpi3y: "Over 3 years",
    tagRec: "Recommended", tagCheap: "Cheapest",
    senJuniorSub: "0–2 years of experience", senMidSub: "2–5 years", senSeniorSub: "5+ years",
    loading: "Loading data and exchange rate…",
    errorTitle: "Could not load the data.", errorHelp: "Check your connection or try again.",
    rateNote: "Amounts in USD converted to EUR · 1 USD = {rate} EUR ({origen}). Indicative estimate.",
    rateOrigenFallback: "fallback rate", rateOrigenLive: "source: {source}{date}",
    perfil: {},
  },
};
const PERFIL_LABELS = {
  es: {},
  en: { Ventas: "Sales", Tech: "Tech", Soporte: "Support", Operaciones: "Operations", "RRHH y Administrativo": "HR & Admin", Marketing: "Marketing" },
};
const CAT_LABELS = { en: { Idiomas: "Languages", "Jornadas Especiales": "Special Shifts", "Competencias Especializadas": "Specialized Skills", Otros: "Others" } };

// Descripciones aclaratorias para primas concretas (opcional, por nombre exacto del CSV).
const PRIMA_DESC = {
  es: {
    "Nocturno": "Cubre tu horario completo de España (aprox. 9:00–18:00 hora ES).",
    "Nocturno part-time (conexión desde 5 o 6 am)": "Solapamiento parcial con España (aprox. 12:00–21:00 hora ES).",
    "Mixto Fin de Semana": "Jornada de 5 días que incluye sábado/domingo (ya cubre los festivos en finde).",
  },
  en: {
    "Nocturno": "Covers your full Spain schedule (approx. 9:00–18:00 ES time).",
    "Nocturno part-time (conexión desde 5 o 6 am)": "Partial overlap with Spain (approx. 12:00–21:00 ES time).",
    "Mixto Fin de Semana": "5-day schedule including Saturday/Sunday (weekend holidays already covered).",
  },
};
const primaDesc = (nombre) => (PRIMA_DESC[state.lang] && PRIMA_DESC[state.lang][nombre]) || "";

// Nota aclaratoria bajo el título de una categoría (visible, para no perder contexto).
const CAT_NOTE = {
  es: { "Jornadas Especiales": "Nocturno / Nocturno part-time (elige uno): horario completo de España (9:00–18:00) o solapamiento parcial (12:00–21:00). Mixto Fin de Semana: jornada de 5 días con sábado/domingo (cubre festivos en finde)." },
  en: { "Jornadas Especiales": "Nocturno / Nocturno part-time (pick one): full Spain schedule (9:00–18:00) or partial overlap (12:00–21:00). Mixto Fin de Semana: 5-day schedule with Sat/Sun (weekend holidays covered)." },
};
const catNote = (cat) => (CAT_NOTE[state.lang] && CAT_NOTE[state.lang][cat]) || "";

// Grupos de primas mutuamente excluyentes (por nombre exacto del CSV).
const PRIMA_MUTEX = [
  ["Nocturno", "Nocturno part-time (conexión desde 5 o 6 am)"],
];

function t(key, params) {
  let s = (I18N[state.lang] && I18N[state.lang][key]);
  if (s == null) s = I18N.es[key];
  if (s == null) s = key;
  if (typeof s === "string" && params) for (const k in params) s = s.replaceAll("{" + k + "}", params[k]);
  return s;
}
const perfilLabel = (p) => (PERFIL_LABELS[state.lang] && PERFIL_LABELS[state.lang][p]) || p;
const catLabel = (c) => (CAT_LABELS[state.lang] && CAT_LABELS[state.lang][c]) || c;

/* ------------------------------------------------------------------ *
 * 3. UTILIDADES DE DATOS
 * ------------------------------------------------------------------ */
function parseMoney(raw) {
  if (raw == null) return 0;
  const n = parseFloat(String(raw).replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}
function fetchCsv(url) {
  return fetch(url).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); })
    .then((txt) => Papa.parse(txt, { header: true, skipEmptyLines: true }).data);
}
async function fetchRate() {
  for (const src of RATE_SOURCES) {
    try {
      const res = await fetch(src.url);
      if (!res.ok) continue;
      const { rate, date } = src.extract(await res.json());
      if (Number.isFinite(rate) && rate > 0) return { rate, date, source: src.name };
    } catch (_) {}
  }
  return null;
}

/* ------------------------------------------------------------------ *
 * 4. ESTADO
 * ------------------------------------------------------------------ */
const state = {
  honorarios: [], primasByCat: {}, paises: [],
  perfil: "Ventas", posicion: null, seniority: "Mid",
  salarioAnual: 30000, reclutamiento: "interno", personas: 1, pais: null,
  ssPct: 32, recPct: 15, primasSel: new Set(),
  moneda: "EUR", lang: "es", step: 1,
  usdToEur: USD_TO_EUR_FALLBACK, rateSource: "respaldo", rateDate: null,
};

/* ------------------------------------------------------------------ *
 * 5. CÁLCULO (idéntico a v1)
 * ------------------------------------------------------------------ */
function posicionesDePerfil(perfil) {
  const set = new Set(state.honorarios.filter((h) => h.perfil === perfil).map((h) => h.posicion));
  return [...set].sort((a, b) => a.localeCompare(b, "es"));
}
function precioTims(posicion, pais, seniority) {
  const row = state.honorarios.find((h) => h.posicion === posicion && h.pais === pais);
  if (!row) return null;
  const p = row.precios[seniority];
  return Number.isFinite(p) ? p : null;
}
function paisMasBarato(lista) {
  let best = null, bp = Infinity;
  for (const pais of lista) {
    const p = precioTims(state.posicion, pais, state.seniority);
    if (p != null && p < bp) { bp = p; best = pais; }
  }
  return best;
}
function sumaPrimasUSD() {
  let total = 0;
  for (const cat of Object.values(state.primasByCat)) for (const pr of cat) if (state.primasSel.has(pr.id)) total += pr.precioUSD;
  return total;
}
function toDisplay(amount, nativeCcy) {
  if (state.moneda === nativeCcy) return amount;
  return state.moneda === "EUR" ? amount * state.usdToEur : amount * (1 / state.usdToEur);
}
function calcular() {
  const timsBaseUSD = precioTims(state.posicion, state.pais, state.seniority);
  const disponible = timsBaseUSD != null;
  const timsUSD = disponible ? timsBaseUSD + sumaPrimasUSD() : 0;
  const brutoMensual = state.salarioAnual / 12;
  const ss = brutoMensual * (state.ssPct / 100);
  const base = brutoMensual + ss;
  const reclutamiento = state.reclutamiento === "externo" ? base * (state.recPct / 100) : 0;
  const espanaEUR = base + reclutamiento;
  const timsDisp = toDisplay(timsUSD, "USD");
  const espanaDisp = toDisplay(espanaEUR, "EUR");
  const ahorroUnit = espanaDisp - timsDisp;
  const ahorroMensual = ahorroUnit * state.personas;
  const pct = espanaDisp > 0 ? (ahorroUnit / espanaDisp) * 100 : 0;
  return { disponible, espana: { brutoMensual, ss, reclutamiento, total: espanaEUR }, timsDisp, espanaDisp, ahorroMensual, ahorroAnual: ahorroMensual * 12, pct };
}

/* ------------------------------------------------------------------ *
 * 6. FORMATO
 * ------------------------------------------------------------------ */
function fmt(amount, ccy = state.moneda, decimals = 0) {
  return new Intl.NumberFormat(state.lang === "es" ? "es-ES" : "en-US",
    { style: "currency", currency: ccy, minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(amount || 0);
}

/* ------------------------------------------------------------------ *
 * 7. RENDER
 * ------------------------------------------------------------------ */
const $ = (s) => document.querySelector(s);

function applyStaticI18n() {
  document.documentElement.lang = state.lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
}

function renderPerfiles() {
  const grid = $("#perfilGrid");
  grid.innerHTML = "";
  for (const perfil of PERFILES) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "opt" + (perfil === state.perfil ? " is-active" : "");
    b.innerHTML = `<span class="opt-icon">${PERFIL_ICON[perfil] || "•"}</span><span class="opt-title">${perfilLabel(perfil)}</span>`;
    b.addEventListener("click", () => {
      state.perfil = perfil;
      state.posicion = posicionesDePerfil(perfil)[0] || null;
      renderPerfiles();
      renderPosiciones();
    });
    grid.appendChild(b);
  }
  $("#posicionWrap").hidden = false;
}

function renderPosiciones() {
  const sel = $("#posicion");
  const posiciones = posicionesDePerfil(state.perfil);
  sel.innerHTML = "";
  for (const pos of posiciones) {
    const o = document.createElement("option");
    o.value = pos; o.textContent = pos;
    if (pos === state.posicion) o.selected = true;
    sel.appendChild(o);
  }
  if (!state.posicion && posiciones.length) state.posicion = posiciones[0];
}

function renderSeniority() {
  const grid = $("#seniorityGrid");
  const subs = { Junior: "senJuniorSub", Mid: "senMidSub", Senior: "senSeniorSub" };
  grid.innerHTML = "";
  for (const sen of SENIORITIES) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "opt" + (sen === state.seniority ? " is-active" : "");
    b.innerHTML = `<span class="opt-title">${sen}</span><span class="opt-sub">${t(subs[sen])}</span>`;
    b.addEventListener("click", () => { state.seniority = sen; renderSeniority(); });
    grid.appendChild(b);
  }
}

function renderPaisGrid() {
  const grid = $("#paisGrid");
  grid.innerHTML = "";
  const cheapest = paisMasBarato(state.paises);
  for (const pais of state.paises) {
    const precioUSD = precioTims(state.posicion, pais, state.seniority);
    const b = document.createElement("button");
    b.type = "button";
    b.className = "country" + (pais === state.pais ? " is-active" : "");
    const badges = [];
    if (PAISES_RECOMENDADOS.includes(pais)) badges.push(`<span class="tag tag-rec">${t("tagRec")}</span>`);
    if (pais === cheapest) badges.push(`<span class="tag tag-cheap">${t("tagCheap")}</span>`);
    const priceHtml = precioUSD != null
      ? `<span class="country-price">${fmt(toDisplay(precioUSD, "USD"))}/mes</span>`
      : `<span class="country-price na">—</span>`;
    b.innerHTML =
      `<span class="country-flag">${PAIS_FLAG[pais] || "🌎"}</span>` +
      `<span class="country-name">${pais}</span>` + priceHtml +
      (badges.length ? `<span class="country-badges">${badges.join("")}</span>` : "");
    b.addEventListener("click", () => { state.pais = pais; renderPaisGrid(); });
    grid.appendChild(b);
  }
}

// Primas como chips seleccionables en flujo (toggle al tocar), por categoría.
function renderPrimas() {
  const cont = $("#primasContainer");
  cont.innerHTML = "";
  for (const [cat, primas] of Object.entries(state.primasByCat)) {
    const block = document.createElement("div");
    block.className = "prima-cat";
    const note = catNote(cat);
    block.innerHTML = `<h4>${catLabel(cat)}</h4>` + (note ? `<p class="prima-cat-note">${note}</p>` : "");
    const grid = document.createElement("div");
    grid.className = "prima-grid";
    for (const prima of primas) {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "prima-chip" + (state.primasSel.has(prima.id) ? " is-active" : "");
      chip.setAttribute("aria-pressed", state.primasSel.has(prima.id));
      const desc = primaDesc(prima.nombre);
      if (desc) chip.title = desc;                 // aclaración al pasar el ratón
      chip.innerHTML =
        `<span class="prima-name">${prima.nombre}</span>` +
        `<span class="p-price prima-price" data-usd="${prima.precioUSD}">+${fmt(toDisplay(prima.precioUSD, "USD"))}</span>`;
      chip.addEventListener("click", () => {
        if (state.primasSel.has(prima.id)) {
          state.primasSel.delete(prima.id);
        } else {
          state.primasSel.add(prima.id);
          // Exclusión mutua: al activar una, desactiva las de su grupo.
          const group = PRIMA_MUTEX.find((g) => g.includes(prima.nombre));
          if (group) {
            for (const cat of Object.values(state.primasByCat))
              for (const p of cat)
                if (p.id !== prima.id && group.includes(p.nombre)) state.primasSel.delete(p.id);
          }
        }
        renderPrimas();   // refleja el estado (incluida la exclusión mutua)
      });
      grid.appendChild(chip);
    }
    block.appendChild(grid);
    cont.appendChild(block);
  }
}

// Sincroniza el campo de salario con la moneda activa (símbolo + valor mostrado).
function symbolMoneda() { return state.moneda === "EUR" ? "€" : "$"; }
function renderSalaryField(updateValue) {
  const sym = symbolMoneda();
  const lbl = $("#salarioLabel"); if (lbl) lbl.textContent = t("salarioLabel", { ccy: sym });
  const pre = $("#salarioPrefix"); if (pre) pre.textContent = sym;
  if (updateValue) { const inp = $("#salario"); if (inp) inp.value = Math.round(toDisplay(state.salarioAnual, "EUR")); }
}

// El % de reclutamiento solo tiene sentido (y se muestra) con "Externo".
function updateRecVisibility() {
  const row = $("#recPctRow");
  if (row) row.hidden = state.reclutamiento !== "externo";
}

function renderBreakdown() {
  const r = calcular();
  $("#externoSub").textContent = t("externoSub", { pct: state.recPct });
  const eEsp = (v) => fmt(toDisplay(v, "EUR"));
  let rows = `<div class="bd-row"><span>${t("resultLabel") && ""}${state.lang === "es" ? "Bruto mensual" : "Gross monthly"}</span><span>${eEsp(r.espana.brutoMensual)}</span></div>` +
    `<div class="bd-row"><span>${state.lang === "es" ? "Seguridad Social" : "Social Security"} (${state.ssPct}%)</span><span>${eEsp(r.espana.ss)}</span></div>`;
  if (state.reclutamiento === "externo")
    rows += `<div class="bd-row"><span>${state.lang === "es" ? "Reclutamiento" : "Recruitment"} (${state.recPct}%)</span><span>${eEsp(r.espana.reclutamiento)}</span></div>`;
  rows += `<div class="bd-row total"><span>${state.lang === "es" ? "Coste empresa / mes" : "Employer cost / month"}</span><span>${eEsp(r.espana.total)}</span></div>`;
  $("#breakdownEspana").innerHTML = rows;
}

// Animación de conteo del número protagonista (respeta prefers-reduced-motion).
let _countRAF = null;
function countUp(el, target) {
  if (_countRAF) cancelAnimationFrame(_countRAF);
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) { el.textContent = fmt(target); return; }
  const dur = 850, start = performance.now();
  const ease = (x) => 1 - Math.pow(1 - x, 3);
  const tick = (now) => {
    const p = Math.min(1, (now - start) / dur);
    el.textContent = fmt(target * ease(p));
    if (p < 1) _countRAF = requestAnimationFrame(tick);
  };
  _countRAF = requestAnimationFrame(tick);
}

function renderResultado() {
  const r = calcular();
  const card = $("#resultCard");
  $("#revealSummary").textContent = t("revealSummary", {
    personas: state.personas, posicion: state.posicion || "—", seniority: state.seniority, pais: state.pais || "—",
  });

  if (!r.disponible) {
    $("#revealHeadline").textContent = t("noDataMsg");
    $("#resAhorroMensual").textContent = t("noData");
    card.classList.add("is-negative");
    $("#segTims").style.width = "0%"; $("#segSave").style.width = "0%";
    $("#splitCaption").textContent = "";
    $("#legTims").textContent = "—"; $("#legSave").textContent = "—";
    $("#kpiAnual").textContent = "—"; $("#kpi3y").textContent = "—";
    return;
  }

  const neg = r.ahorroMensual < 0;
  card.classList.toggle("is-negative", neg);
  const pctAbs = Math.abs(r.pct).toFixed(0);
  $("#revealHeadline").innerHTML = neg ? t("pctMore", { pct: pctAbs }) : t("revealHeadline", { pct: pctAbs });

  // Número protagonista con conteo animado
  countUp($("#resAhorroMensual"), r.ahorroMensual);

  // Barra parte-sobre-todo: del coste total en España, cuánto va a TIMS y cuánto ahorras.
  const espanaTotal = r.espanaDisp * state.personas;
  const timsTotal = r.timsDisp * state.personas;
  const saveTotal = r.ahorroMensual;                 // (España − TIMS) × personas
  const timsW = espanaTotal > 0 ? Math.max(0, Math.min(100, (timsTotal / espanaTotal) * 100)) : 0;
  const saveW = espanaTotal > 0 && saveTotal > 0 ? Math.max(0, Math.min(100 - timsW, (saveTotal / espanaTotal) * 100)) : 0;
  $("#segTims").style.width = timsW + "%";
  $("#segSave").style.width = saveW + "%";
  $("#splitCaption").textContent = t("costeEspana", { total: fmt(espanaTotal) });
  $("#legTims").textContent = fmt(timsTotal);
  $("#legSave").textContent = fmt(Math.max(0, saveTotal));

  // Proyección (totales, × nº de personas)
  $("#kpiAnual").textContent = fmt(r.ahorroAnual);
  $("#kpi3y").textContent = fmt(r.ahorroAnual * 3);
}

// Iconos SVG del modal de contacto (calendario, teléfono, check).
function renderModalIcons() {
  const cal = SVG('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>');
  const phone = SVG('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.4a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2z"/>');
  const check = SVG('<path d="M20 6 9 17l-5-5"/>');
  const a = $("#iconSchedule"), b = $("#iconContact"), c = $("#iconSuccess");
  if (a) a.innerHTML = cal; if (b) b.innerHTML = phone; if (c) c.innerHTML = check;
}

function renderRateNote() {
  const el = $("#rateNote");
  if (!el) return;
  const rate = state.usdToEur.toFixed(4);
  const origen = state.rateSource === "respaldo"
    ? t("rateOrigenFallback")
    : t("rateOrigenLive", { source: state.rateSource, date: state.rateDate ? ` · ${state.rateDate}` : "" });
  el.textContent = t("rateNote", { rate, origen });
}
function refreshPrimaPrices() {
  document.querySelectorAll(".p-price").forEach((el) => { el.textContent = "+" + fmt(toDisplay(parseFloat(el.dataset.usd), "USD")); });
}

/* --------------------------- NAVEGACIÓN --------------------------- */
function goToStep(n) {
  state.step = Math.min(TOTAL_STEPS, Math.max(1, n));
  document.querySelectorAll(".step").forEach((s) => { s.hidden = Number(s.dataset.step) !== state.step; });

  // Render dependiente del paso
  if (state.step === 3) renderPaisGrid();      // precios dependen de posición/seniority
  if (state.step === 4) renderBreakdown();
  if (state.step === 5) renderResultado();

  // Progreso
  $("#progressFill").style.width = (state.step / TOTAL_STEPS) * 100 + "%";
  $("#progressLabel").textContent = t("stepName")[state.step - 1];
  $("#progressCount").textContent = t("progressCount", { n: state.step, total: TOTAL_STEPS });

  // Botones
  const back = $("#navBack"), next = $("#navNext");
  back.hidden = state.step === 1;
  if (state.step === TOTAL_STEPS) {
    next.textContent = t("restart");
    next.classList.add("secondary");
  } else {
    next.textContent = state.step === TOTAL_STEPS - 1 ? t("seeSavings") : t("next");
    next.classList.remove("secondary");
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Re-render completo (tras cambiar idioma) manteniendo el paso actual.
function renderAll() {
  applyStaticI18n();
  renderSalaryField(false);
  renderPerfiles();
  renderPosiciones();
  renderSeniority();
  renderPrimas();
  updateRecVisibility();
  renderRateNote();
  goToStep(state.step);
}

// Reinicia la calculadora a los valores por defecto (mantiene idioma y moneda).
function resetWizard() {
  state.perfil = "Ventas";
  state.seniority = "Mid";
  state.salarioAnual = 30000;
  state.reclutamiento = "interno";
  state.personas = 1;
  state.ssPct = 32;
  state.recPct = 15;
  state.primasSel = new Set();
  state.posicion = posicionesDePerfil(state.perfil)[0] || null;
  state.pais = state.paises.includes("Colombia") ? "Colombia" : state.paises[0];
  state.step = 1;
  // Campos del DOM que no se reconstruyen en renderAll
  $("#ssPct").value = 32;
  $("#recPct").value = 15;
  $("#peopleValue").textContent = 1;
  $("#salario").value = Math.round(toDisplay(state.salarioAnual, "EUR"));
  document.querySelectorAll("#reclutamientoGrid .opt").forEach((b) => b.classList.toggle("is-active", b.dataset.rec === "interno"));
  renderAll();
}

// Construye el cuerpo del envío (form-data URL-encoded) en el orden EXACTO que
// espera el buzón: tipo, origen, nombre, email, empresa, telefono, perfil,
// posicion, pais, seniority, personas, mensaje. Los que no apliquen van vacíos.
function leadBody(extra) {
  const fields = {
    tipo: extra.tipo || "formulario",   // "formulario" | "reunion" → el backend enruta por aquí
    origen: LEAD_ORIGEN,                 // de qué web viene
    nombre: extra.nombre || "",
    email: extra.email || "",
    empresa: extra.empresa || "",
    telefono: extra.telefono || "",
    perfil: state.perfil || "",
    posicion: state.posicion || "",
    pais: state.pais || "",
    seniority: state.seniority || "",
    personas: String(state.personas || ""),
    mensaje: extra.mensaje || "",
  };
  const body = new URLSearchParams();
  for (const k in fields) body.append(k, fields[k]);
  return body;
}

// Avisa al backend cuando alguien va a agendar reunión (para que el equipo
// llegue con contexto). No lleva nombre/email: los captura Calendly. La marca
// de "solicitud de reunión" y el ahorro estimado van dentro de "mensaje".
function notificarReunion(extra) {
  if (!CONTACT_ENDPOINT) return;
  const r = calcular();
  const ahorro = r.disponible ? `${fmt(r.ahorroMensual)}/mes` : "—";
  const body = leadBody({
    tipo: "reunion",
    empresa: (extra && extra.empresa) || "",
    mensaje: `Solicitud de reunión (Calendly). Ahorro estimado: ${ahorro}`,
  });
  try {
    fetch(CONTACT_ENDPOINT, { method: "POST", body }).catch(() => {});
  } catch (_) { /* no bloquea la apertura de Calendly */ }
}

/* ------------------------------------------------------------------ *
 * 8. EVENTOS
 * ------------------------------------------------------------------ */
function bindEvents() {
  $("#posicion").addEventListener("change", (e) => { state.posicion = e.target.value; });

  $("#peopleMinus").addEventListener("click", () => { state.personas = Math.max(1, state.personas - 1); $("#peopleValue").textContent = state.personas; });
  $("#peoplePlus").addEventListener("click", () => { state.personas = Math.min(999, state.personas + 1); $("#peopleValue").textContent = state.personas; });

  $("#salario").addEventListener("input", (e) => {
    const typed = Math.max(0, parseFloat(e.target.value) || 0);
    // El usuario escribe en la moneda mostrada; guardamos internamente en EUR.
    state.salarioAnual = state.moneda === "EUR" ? typed : typed * state.usdToEur;
    renderBreakdown();
  });

  $("#reclutamientoGrid").addEventListener("click", (e) => {
    const btn = e.target.closest(".opt"); if (!btn) return;
    state.reclutamiento = btn.dataset.rec;
    document.querySelectorAll("#reclutamientoGrid .opt").forEach((b) => b.classList.toggle("is-active", b === btn));
    updateRecVisibility();
    renderBreakdown();
  });
  $("#ssPct").addEventListener("input", (e) => { state.ssPct = Math.max(0, parseFloat(e.target.value) || 0); renderBreakdown(); });
  $("#recPct").addEventListener("input", (e) => { state.recPct = Math.max(0, parseFloat(e.target.value) || 0); renderBreakdown(); });

  // Navegación
  $("#navBack").addEventListener("click", () => goToStep(state.step - 1));
  $("#navNext").addEventListener("click", () => {
    if (state.step === TOTAL_STEPS) resetWizard();   // "empezar de nuevo" → reinicio real
    else goToStep(state.step + 1);
  });

  // Moneda
  document.querySelectorAll("[data-ccy]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.moneda = btn.dataset.ccy;
      document.querySelectorAll("[data-ccy]").forEach((b) => b.classList.toggle("is-active", b === btn));
      renderSalaryField(true);
      refreshPrimaPrices();
      if (state.step === 3) renderPaisGrid();
      if (state.step === 4) renderBreakdown();
      if (state.step === 5) renderResultado();
    });
  });

  // Idioma
  document.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.lang = btn.dataset.lang;
      document.querySelectorAll("[data-lang]").forEach((b) => b.classList.toggle("is-active", b === btn));
      renderAll();
    });
  });

  // --- Contacto: dos botones directos (agendar reunión / dejar datos) ---
  const modal = $("#contactModal");
  const showModalStep = (which) => {
    $("#scheduleForm").hidden = which !== "schedule";
    $("#contactForm").hidden = which !== "form";
    $("#contactSuccess").hidden = which !== "success";
  };
  const closeModal = () => { modal.hidden = true; document.body.style.overflow = ""; };

  // Botón 1: agendar reunión → pide empresa/nombre antes de abrir Calendly
  $("#ctaSchedule").addEventListener("click", () => {
    $("#scheduleForm").reset();
    showModalStep("schedule");
    modal.hidden = false; document.body.style.overflow = "hidden";
  });
  $("#scheduleBack").addEventListener("click", closeModal);
  $("#scheduleForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target).entries());
    notificarReunion({ empresa: d.empresa });   // el nombre lo captura Calendly
    window.open(CALENDLY_URL, "_blank", "noopener");              // gesto de usuario: no lo bloquea el popup blocker
    closeModal();
  });

  // Botón 2: dejar datos → abre el formulario con el contexto de la simulación
  $("#ctaContact").addEventListener("click", () => {
    const r = calcular();
    const ahorro = r.disponible ? `${fmt(r.ahorroMensual)}/mes` : "—";
    $("#formContext").textContent =
      `${t("contactCtxLabel")}: ${state.personas}× ${state.posicion} · ${state.seniority} · ${state.pais} · ${t("ctxAhorro")} ${ahorro}`;
    $("#formError").hidden = true;
    showModalStep("form");
    modal.hidden = false; document.body.style.overflow = "hidden";
  });

  $("#modalClose").addEventListener("click", closeModal);
  $("#formBack").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) closeModal(); });

  $("#contactForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const btn = $("#formSubmit");
    const errEl = $("#formError");
    const data = Object.fromEntries(new FormData(form).entries());

    // Validación: nombre, email y empresa obligatorios; email con formato válido.
    const nombre = (data.nombre || "").trim();
    const email = (data.email || "").trim();
    const empresa = (data.empresa || "").trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!nombre || !emailOk || !empresa) {
      errEl.textContent = t("validationMsg");
      errEl.hidden = false;
      return;
    }
    errEl.hidden = true;

    btn.disabled = true;
    btn.textContent = t("formSending");
    try {
      // El backend espera form-data URL-encoded. URLSearchParams pone solo el
      // Content-Type application/x-www-form-urlencoded (petición "simple", sin
      // preflight CORS) — NO añadimos cabecera a mano.
      const body = leadBody({ tipo: "formulario", nombre, email, empresa, telefono: data.telefono, mensaje: data.mensaje });
      const res = await fetch(CONTACT_ENDPOINT, { method: "POST", body });
      const result = await res.json();
      if (result && result.ok) {
        form.reset();
        showModalStep("success");
      } else {
        throw new Error(result && result.error ? result.error : "respuesta no ok");
      }
    } catch (_) {
      errEl.textContent = t("errorMsg");
      errEl.hidden = false;
    } finally {
      btn.disabled = false;
      btn.textContent = t("formSend");
    }
  });
}

/* ------------------------------------------------------------------ *
 * 9. INICIALIZACIÓN
 * ------------------------------------------------------------------ */
function setStatus(html, isError = false) {
  const el = $("#status");
  el.hidden = false;
  el.classList.toggle("is-error", isError);
  el.innerHTML = isError ? html : `<span class="spin"></span>${html}`;
}
function normalizeHonorarios(rows) {
  return rows.filter((r) => r.Posicion && r.Pais && r.Perfil).map((r) => ({
    posicion: r.Posicion.trim(), pais: r.Pais.trim(), perfil: r.Perfil.trim(),
    precios: { Junior: parseMoney(r.Junior), Mid: parseMoney(r.Mid), Senior: parseMoney(r.Senior) },
  }));
}
function normalizePrimas(rows) {
  const byCat = {};
  rows.forEach((r, i) => {
    const cat = (r.Categoria || "").trim(), nombre = (r.Prima || "").trim();
    if (!cat || !nombre) return;
    (byCat[cat] ||= []).push({ id: `${cat}::${nombre}::${i}`, nombre, precioUSD: parseMoney(r["Price After Fees"]) });
  });
  return byCat;
}
async function init() {
  setStatus(t("loading"));
  try {
    const [honRows, primaRows, rateInfo] = await Promise.all([
      fetchCsv(CSV_HONORARIOS), fetchCsv(CSV_PRIMAS).catch(() => []), fetchRate(),
    ]);
    if (rateInfo) { state.usdToEur = rateInfo.rate; state.rateSource = rateInfo.source; state.rateDate = rateInfo.date || null; }

    state.honorarios = normalizeHonorarios(honRows);
    if (!state.honorarios.length) throw new Error("El CSV de honorarios llegó vacío o con formato inesperado.");
    state.primasByCat = normalizePrimas(primaRows);
    state.paises = [...new Set(state.honorarios.map((h) => h.pais))];
    state.posicion = posicionesDePerfil(state.perfil)[0] || null;
    state.pais = state.paises.includes("Colombia") ? "Colombia" : state.paises[0];

    $("#status").hidden = true;
    $("#wizard").hidden = false;
    $("#peopleValue").textContent = state.personas;
    bindEvents();
    renderModalIcons();
    renderAll();
  } catch (err) {
    console.error(err);
    setStatus(`<strong>${t("errorTitle")}</strong><br>${err.message}<br>${t("errorHelp")}`, true);
  }
}
document.addEventListener("DOMContentLoaded", init);
