// Opportunity Cost Analyzer
// The default analysis is local/mock mode. No API key belongs in this file.

const $ = (id) => document.getElementById(id);

const translations = {
  en: {
    clearProduct: "Please enter a clear product name.",
    invalidPrice: "Please enter a purchase price greater than 0.",
    missing: "Please complete all required fields before analyzing."
  }
};

// ---------- Theme ----------
const savedTheme = localStorage.getItem("oca-theme");
if (savedTheme === "dark") document.documentElement.dataset.theme = "dark";

$("themeToggle").addEventListener("click", () => {
  const dark = document.documentElement.dataset.theme === "dark";
  if (dark) {
    delete document.documentElement.dataset.theme;
    localStorage.setItem("oca-theme", "light");
    $("themeToggle").textContent = "☾";
  } else {
    document.documentElement.dataset.theme = "dark";
    localStorage.setItem("oca-theme", "dark");
    $("themeToggle").textContent = "☀";
  }
});
if (savedTheme === "dark") $("themeToggle").textContent = "☀";

// ---------- Navigation ----------
document.querySelectorAll("[data-scroll]").forEach(btn => {
  btn.addEventListener("click", () => document.querySelector(btn.dataset.scroll)?.scrollIntoView({behavior:"smooth"}));
});

// ---------- Product validation ----------
function isClearProductName(value) {
  const name = value.trim();
  if (name.length < 2 || name.length > 100) return false;
  if (/^\d+$/.test(name)) return false;
  if (/^[^a-zA-Z0-9]+$/.test(name)) return false;
  const lower = name.toLowerCase();
  const blocked = new Set(["asdf","asdfgh","xxx","test","qwerty","aaaa","bbbb","product","item","123"]);
  if (blocked.has(lower)) return false;
  // Reject strings dominated by one repeated character.
  if (/^(.)\1{3,}$/.test(name)) return false;
  return true;
}

// Basic HTML escaping prevents user-entered text from becoming HTML.
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[ch]));
}

function money(n) {
  return new Intl.NumberFormat("en-US", {style:"currency", currency:"USD", maximumFractionDigits:2}).format(n);
}

function usageScore(usage) {
  return {
    "Every day": 4,
    "Several times a week": 3,
    "Once a week": 2,
    "Rarely": 1
  }[usage] || 0;
}

// ---------- Local/mock analysis ----------
function generateLocalAnalysis(data) {
  const score = usageScore(data.usage);
  const benefitText = escapeHtml(data.benefit);
  const lossText = escapeHtml(data.loss);
  const alternativeText = escapeHtml(data.alternative);
  const product = escapeHtml(data.productName);

  let usageInsight = {
    4: "Frequent use can make the purchase more useful over time, especially if the product solves a real recurring need.",
    3: "Regular use can support the purchase's value if the product meaningfully helps with your needs.",
    2: "Weekly use may still be worthwhile, but compare the benefit with the amount of time the product will sit unused.",
    1: "Rare use makes it especially useful to ask whether borrowing, renting, buying used, or delaying the purchase could meet the same need."
  }[score];

  let valueText;
  if (score >= 3) {
    valueText = `This purchase may provide strong value if the expected benefit (${benefitText}) is important to you, the potential downside (${lossText}) is manageable, and you will actually use ${product} ${escapeHtml(data.usage.toLowerCase())}.`;
  } else {
    valueText = `Consider whether ${product} will be used enough to justify the price. The purchase may be more reasonable when the benefit is important and alternatives cannot provide a similar result for less.`;
  }

  return {
    overview: `<p><strong>${product}</strong> is the product you are considering at a price of <strong>${money(data.price)}</strong>. This analysis uses the information you provided rather than assuming facts about the product.</p>`,
    benefits: `<p>${benefitText}</p><p>${usageInsight}</p>`,
    losses: `<p>${lossText}</p>`,
    opportunity: `<p><strong>What are you giving up by spending this money on this product?</strong></p><p>Your stated alternative is: <strong>${alternativeText}</strong>. That alternative is the opportunity cost to examine. The cost is not necessarily only a dollar amount; it can also include flexibility, time, savings, or another goal you could have supported.</p>`,
    value: `<p>${valueText}</p><p><strong>Consider waiting if</strong> the purchase would reduce your ability to handle a more important goal or if you are uncertain about the benefit.</p>`,
    about: `<p>We can describe the decision using your supplied information, but we do not have a reliable product database in this offline version. To avoid inventing facts, we will not claim specific features, prices, or typical users for ${product}.</p><p>We need more information about this product to provide a reliable explanation.</p>`,
    summary: `<p>There is no universal correct answer. Your decision depends on how important the expected benefit is, how significant the potential loss is, how often you will use the product, and what the money could accomplish through <strong>${alternativeText}</strong>.</p>`
  };
}

// ---------- Form ----------
$("purchaseForm").addEventListener("submit", (event) => {
  event.preventDefault();

  $("productError").textContent = "";
  $("formError").textContent = "";

  const data = {
    productName: $("productName").value.trim(),
    price: Number($("price").value),
    benefit: $("benefit").value.trim(),
    loss: $("loss").value.trim(),
    alternative: $("alternative").value.trim(),
    usage: $("usage").value
  };

  if (!isClearProductName(data.productName)) {
    $("productError").textContent = translations.en.clearProduct;
    $("productName").focus();
    return;
  }
  if (!Number.isFinite(data.price) || data.price <= 0) {
    $("formError").textContent = translations.en.invalidPrice;
    $("price").focus();
    return;
  }
  if (!data.benefit || !data.loss || !data.alternative || !data.usage) {
    $("formError").textContent = translations.en.missing;
    return;
  }

  const analysis = generateLocalAnalysis(data);
  $("resultTitle").textContent = data.productName;
  $("overview").innerHTML = analysis.overview;
  $("benefitsResult").innerHTML = analysis.benefits;
  $("lossesResult").innerHTML = analysis.losses;
  $("opportunity").innerHTML = analysis.opportunity;
  $("value").innerHTML = analysis.value;
  $("aboutProduct").innerHTML = analysis.about;
  $("summary").innerHTML = analysis.summary;

  $("calcPrice").textContent = money(data.price);
  $("calcAlternative").textContent = data.alternative;

  // Illustrative example only: a 10% increase is NOT a prediction.
  const illustrativeFuture = data.price * 1.10;
  $("calcFuture").textContent = money(illustrativeFuture);
  $("calcNote").textContent = `Illustration only: the ${money(illustrativeFuture)} figure assumes a hypothetical 10% change and does not predict investment returns or future prices. Replace this with real data if you later connect an appropriate calculator/API.`;

  $("results").hidden = false;
  $("results").scrollIntoView({behavior:"smooth", block:"start"});
});

$("anotherBtn").addEventListener("click", () => {
  $("results").hidden = true;
  $("purchaseForm").reset();
  $("formError").textContent = "";
  $("productError").textContent = "";
  document.querySelector("#analyzer").scrollIntoView({behavior:"smooth"});
  setTimeout(() => $("productName").focus(), 400);
});
