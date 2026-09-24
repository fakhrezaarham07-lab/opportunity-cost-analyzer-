const $ = (id) => document.getElementById(id);

const savedTheme = localStorage.getItem("oca-theme");
if (savedTheme === "dark") {
  document.documentElement.dataset.theme = "dark";
}

$("themeToggle")?.addEventListener("click", () => {
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

if (savedTheme === "dark" && $("themeToggle")) {
  $("themeToggle").textContent = "☀";
}

document.querySelectorAll("[data-scroll]").forEach((button) => {
  button.addEventListener("click", () => {
    document
      .querySelector(button.dataset.scroll)
      ?.scrollIntoView({ behavior: "smooth" });
  });
});

function clearName(value) {
  const name = value.trim();

  const badNames = [
    "asdf",
    "asdfgh",
    "xxx",
    "test",
    "qwerty",
    "aaaa",
    "bbbb",
    "product",
    "item",
    "123"
  ];

  return (
    name.length >= 2 &&
    !/^\d+$/.test(name) &&
    !/^[^a-zA-Z0-9]+$/.test(name) &&
    !badNames.includes(name.toLowerCase()) &&
    !/^(.)\1{3,}$/.test(name)
  );
}

function esc(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

$("purchaseForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const productName = $("productName").value.trim();

  $("productError").textContent = "";
  $("formError").textContent = "";

  if (!clearName(productName)) {
    $("productError").textContent =
      "Please enter a clear product name.";
    return;
  }

  // Loading state
  const button = event.submitter;
  if (button) {
    button.disabled = true;
    button.textContent = "Analyzing...";
  }

  $("results").hidden = false;
  $("resultTitle").textContent = productName;

  $("overview").innerHTML =
    "<p>AI is analyzing this product...</p>";

  $("benefitsResult").innerHTML =
    "<p>Finding potential benefits...</p>";

  $("lossesResult").innerHTML =
    "<p>Finding potential risks and losses...</p>";

  $("opportunity").innerHTML =
    "<p>Calculating the opportunity cost...</p>";

  $("value").innerHTML =
    "<p>Evaluating the potential value of the purchase...</p>";

  $("aboutProduct").innerHTML =
    "<p>Generating product information...</p>";

  $("summary").innerHTML =
    "<p>Preparing the analysis...</p>";

  $("results").scrollIntoView({
    behavior: "smooth"
  });

  /*
    NANTI BAGIAN INI AKAN DIHUBUNGKAN
    KE BACKEND AI.

    Contoh:
    
    const response = await fetch("URL-BACKEND-KAMU", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        product: productName
      })
    });

    const data = await response.json();

    $("overview").innerHTML = `<p>${esc(data.overview)}</p>`;
    $("benefitsResult").innerHTML = `<p>${esc(data.benefits)}</p>`;
    $("lossesResult").innerHTML = `<p>${esc(data.losses)}</p>`;
    $("opportunity").innerHTML = `<p>${esc(data.opportunityCost)}</p>`;
    $("value").innerHTML = `<p>${esc(data.value)}</p>`;
    $("aboutProduct").innerHTML = `<p>${esc(data.aboutProduct)}</p>`;
    $("summary").innerHTML = `<p>${esc(data.summary)}</p>`;
  */

  // Sementara untuk testing tampilan
  setTimeout(() => {
    $("overview").innerHTML = `
      <p>
        <strong>${esc(productName)}</strong>
        has been submitted for AI analysis.
      </p>
    `;

    $("benefitsResult").innerHTML = `
      <p>
        The AI will identify potential benefits of
        <strong>${esc(productName)}</strong>.
      </p>
    `;

    $("lossesResult").innerHTML = `
      <p>
        The AI will identify possible disadvantages,
        risks, and potential losses.
      </p>
    `;

    $("opportunity").innerHTML = `
      <p>
        The AI will estimate what alternatives could be
        sacrificed by spending money on
        <strong>${esc(productName)}</strong>.
      </p>
    `;

    $("value").innerHTML = `
      <p>
        The AI will evaluate whether the purchase could
        provide meaningful value based on the available
        information.
      </p>
    `;

    $("aboutProduct").innerHTML = `
      <p>
        AI-generated information about
        <strong>${esc(productName)}</strong>
        will appear here.
      </p>
    `;

    $("summary").innerHTML = `
      <p>
        AI analysis for
        <strong>${esc(productName)}</strong>
        is ready.
      </p>
    `;

    if (button) {
      button.disabled = false;
      button.textContent = "Analyze";
    }
  }, 1000);
});

$("anotherBtn")?.addEventListener("click", () => {
  $("purchaseForm")?.reset();

  if ($("results")) {
    $("results").hidden = true;
  }

  if ($("productError")) {
    $("productError").textContent = "";
  }

  if ($("formError")) {
    $("formError").textContent = "";
  }

  $("analyzer")?.scrollIntoView({
    behavior: "smooth"
  });
});
