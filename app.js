const rules = [
  { id: "consent", category: "Consentement", title: "Consentement aux cookies", detail: "Refus aussi simple que l'acceptation", level: "Critique" },
  { id: "rgpd", category: "Données", title: "Finalités avant collecte", detail: "Formulaires conformes au recueil minimal", level: "Critique" },
  { id: "rgpd-exit", category: "Données", title: "Gestion des préférences", detail: "Accès durable aux choix de confidentialité", level: "Important" },
  { id: "rgaa-nav", category: "Accessibilité", title: "Navigation clavier", detail: "Ordre, focus visible et contenu atteignable", level: "Critique" },
  { id: "rgaa-text", category: "Accessibilité", title: "Lisibilité des contenus", detail: "Contraste, zoom, titre et structure", level: "Critique" },
  { id: "rgaa-forms", category: "Accessibilité", title: "Formulaires accessibles", detail: "Étiquettes, aides et erreurs explicites", level: "Critique" },
  { id: "pricing", category: "Commerce", title: "Prix clairement annoncés", detail: "Coût total, récurrence et frais visibles", level: "Important" },
  { id: "cta", category: "Conversion", title: "Action principale explicite", detail: "Verbe précis et conséquence compréhensible", level: "Important" },
  { id: "errors", category: "Parcours", title: "Erreurs récupérables", detail: "Correction possible sans perdre les données", level: "Critique" },
  { id: "trust", category: "Confiance", title: "Preuve à proximité", detail: "Conditions, garanties et sécurité accessibles", level: "Important" },
  { id: "loading", category: "Performance", title: "États de chargement", detail: "Progression visible et reprise sûre", level: "Important" },
  { id: "friction", category: "Parcours", title: "Étapes nécessaires", detail: "Absence de champs ou confirmations superflus", level: "Important" }
];

const journeys = {
  achat: {
    meta: "Démonstration · 5 étapes · conversion principale",
    steps: [
      { title: "Découverte", detail: "Page produit", state: "Conforme", tone: "ok" },
      { title: "Choix", detail: "Options et prix", state: "Choix ambigus", tone: "warning" },
      { title: "Panier", detail: "Frais affichés", state: "Friction", tone: "critical" },
      { title: "Paiement", detail: "Identité et consentement", state: "À vérifier", tone: "warning" },
      { title: "Confirmation", detail: "Prochaines étapes", state: "Conforme", tone: "ok" }
    ]
  },
  compte: {
    meta: "Démonstration · 5 étapes · création de compte",
    steps: [
      { title: "Accès", detail: "Choix du parcours", state: "Conforme", tone: "ok" },
      { title: "Identité", detail: "Nom et email", state: "Champ redondant", tone: "warning" },
      { title: "Consentement", detail: "Options marketing", state: "Refus peu visible", tone: "critical" },
      { title: "Vérification", detail: "Lien ou code", state: "Délai insuffisant", tone: "warning" },
      { title: "Activation", detail: "Accueil personnalisé", state: "Conforme", tone: "ok" }
    ]
  }
};

const findingsByJourney = {
  achat: [
    { title: "Prix final hors panier", detail: "Le coût de livraison n'apparaît qu'après deux étapes.", level: "Critique", type: "neg" },
    { title: "Bouton principal ambigu", detail: "« Continuer » ne précise pas la prochaine étape.", level: "Important", type: "warn" },
    { title: "Recours au paiement", detail: "La suppression du panier exige une confirmation supplémentaire.", level: "À réduire", type: "warn" }
  ],
  compte: [
    { title: "Refus des cookies peu visible", detail: "Le second choix nécessite de quitter le bandeau principal.", level: "Critique", type: "neg" },
    { title: "Vérification trop courte", detail: "Le code expire avant la reprise d'une autre tâche.", level: "Important", type: "warn" },
    { title: "Champ d'identité redondant", detail: "Une donnée déjà connue est demandée une seconde fois.", level: "À réduire", type: "warn" }
  ]
};

const activeRules = new Set(rules.map(rule => rule.id));
let currentJourney = "achat";
let reportCount = 0;

function renderRules() {
  const grid = document.querySelector("#rules-grid");
  grid.innerHTML = rules.map(rule => `
    <article class="rule">
      <div>
        <h3>${rule.title}</h3>
        <p>${rule.category} · ${rule.detail}</p>
      </div>
      <input class="switch rule-switch" type="checkbox" checked aria-label="Activer ${rule.title}" data-rule="${rule.id}">
    </article>
  `).join("");

  grid.addEventListener("change", event => {
    if (!event.target.matches(".rule-switch")) return;
    if (event.target.checked) activeRules.add(event.target.dataset.rule);
    else activeRules.delete(event.target.dataset.rule);
    document.querySelector("#rules-count").textContent = activeRules.size;
  });
}

function renderJourney(name) {
  currentJourney = name;
  const data = journeys[name];
  document.querySelector("#journey-meta").textContent = data.meta;
  document.querySelector("#journey-empty").hidden = true;
  const map = document.querySelector("#journey-map");
  map.hidden = false;
  map.innerHTML = data.steps.map(step => `
    <article class="journey-step ${step.tone}">
      <strong>${step.title}</strong>
      <p>${step.detail}</p>
      <span class="step-state">${step.state}</span>
    </article>
  `).join("");

  document.querySelectorAll("[data-journey]").forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.journey === name));
  });

  const findings = findingsByJourney[name];
  document.querySelector("#finding-count").textContent = `${findings.length} constats identifiés`;
  document.querySelector("#findings-list").innerHTML = findings.map(finding => `
    <article class="finding">
      <div class="finding-head">
        <h3>${finding.title}</h3>
        <span class="pill ${finding.type}">${finding.level}</span>
      </div>
      <p>${finding.detail}</p>
    </article>
  `).join("");
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2600);
}

document.querySelector("#audit-form").addEventListener("submit", event => {
  event.preventDefault();
  const input = document.querySelector("#url");
  let url;
  try {
    url = new URL(input.value);
  } catch {
    input.focus();
    showToast("Saisissez une URL complète commençant par http");
    return;
  }

  const submit = document.querySelector("#audit-submit");
  submit.disabled = true;
  submit.textContent = "Analyse...";
  window.setTimeout(() => {
    const isSecure = url.protocol === "https:";
    const score = isSecure ? 72 : 58;
    const critical = currentJourney === "compte" ? 2 : 1;
    document.querySelector("#audit-domain").textContent = `${url.hostname} · audit de démonstration`;
    document.querySelector("#score").textContent = `${score} %`;
    document.querySelector("#score-note").textContent = isSecure ? "Base HTTPS détectée" : "Protocole à sécuriser";
    document.querySelector("#critical").textContent = String(critical);
    document.querySelector("#critical-note").textContent = "À traiter en priorité";
    document.querySelector("#steps").textContent = "5";
    document.querySelector("#steps-note").textContent = "1 parcours actif";
    renderJourney(currentJourney);
    submit.disabled = false;
    submit.textContent = "Analyser";

    reportCount += 1;
    const row = document.querySelector("#reports-body");
    if (reportCount === 1) row.innerHTML = "";
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${url.hostname}</td><td>${currentJourney === "achat" ? "Achat" : "Compte"}</td><td><span class="pill ${score >= 70 ? "pos" : "warn"}">${score} %</span></td><td>Aujourd'hui</td><td><button class="btn ghost" type="button">Ouvrir</button></td>`;
    row.prepend(tr);
    showToast("Audit de démonstration terminé");
  }, 650);
});

document.querySelectorAll("[data-journey]").forEach(button => {
  button.addEventListener("click", () => renderJourney(button.dataset.journey));
});

document.querySelector("#select-all").addEventListener("click", event => {
  const switches = [...document.querySelectorAll(".rule-switch")];
  const willEnable = activeRules.size !== rules.length;
  switches.forEach(input => {
    input.checked = willEnable;
    if (willEnable) activeRules.add(input.dataset.rule);
    else activeRules.delete(input.dataset.rule);
  });
  event.target.textContent = willEnable ? "Tout désactiver" : "Tout activer";
  document.querySelector("#rules-count").textContent = activeRules.size;
});

document.querySelector("#theme-toggle").addEventListener("click", () => {
  const isDark = document.documentElement.dataset.theme === "dark";
  document.documentElement.dataset.theme = isDark ? "" : "dark";
});

document.querySelector("#menu-toggle").addEventListener("click", event => {
  const sidebar = document.querySelector("#sidebar");
  const open = sidebar.classList.toggle("open");
  event.target.setAttribute("aria-expanded", String(open));
});

document.querySelectorAll(".nav-item[href]").forEach(link => {
  link.addEventListener("click", () => document.querySelector("#sidebar").classList.remove("open"));
});

document.querySelector("#export-btn").addEventListener("click", () => {
  showToast(reportCount ? "Export préparé dans cette démonstration" : "Lancez d'abord un audit");
});

renderRules();

document.querySelector("#audit-domain").textContent = "exemple.fr · démonstration";
document.querySelector("#score").textContent = "72 %";
document.querySelector("#score-note").textContent = "Base HTTPS détectée";
document.querySelector("#critical").textContent = "1";
document.querySelector("#critical-note").textContent = "À traiter en priorité";
document.querySelector("#steps").textContent = "5";
document.querySelector("#steps-note").textContent = "1 parcours actif";
renderJourney("achat");
