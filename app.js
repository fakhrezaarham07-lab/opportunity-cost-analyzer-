const AI_API_URL =
  "https://GANTI-DENGAN-URL-VERCEL-KAMU.vercel.app/api/analyze";

const $ = (id) => document.getElementById(id);

// =========================
// THEME
// =========================

const themeToggle = $("themeToggle");

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    const isDark =
      document.body.classList.contains("dark");

    localStorage.setItem(
      "theme",
      isDark ? "dark" : "light"
    );
  });
}

if (
  localStorage.getItem("theme") === "dark"
) {
  document.body.classList.add("dark");
}


// =========================
// ANALYZER
// =========================

const form = $("purchaseForm");

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const productInput = $("productName");
    const languageInput = $("language");

    const product = productInput.value.trim();
    const language =
      languageInput?.value || "id";

    const errorBox = $("formError");
    const productError = $("productError");

    if (errorBox) {
      errorBox.textContent = "";
    }

    if (productError) {
      productError.textContent = "";
    }

    if (!product) {
      if (productError) {
        productError.textContent =
          "Masukkan nama produk terlebih dahulu.";
      }

      return;
    }

    // =========================
    // LOADING
    // =========================

    const results = $("results");

    if (results) {
      results.style.display = "block";
    }

    setText(
      "resultTitle",
      "AI sedang menganalisis..."
    );

    setText(
      "overview",
      "Mohon tunggu..."
    );

    setText(
      "benefitsResult",
      "AI sedang mencari manfaat produk..."
    );

    setText(
      "lossesResult",
      "AI sedang menganalisis risiko..."
    );

    setText(
      "opportunity",
      "AI sedang menghitung opportunity cost..."
    );

    setText(
      "value",
      "AI sedang menilai nilai produk..."
    );

    setText(
      "aboutProduct",
      "AI sedang menjelaskan produk..."
    );

    setText(
      "summary",
      "AI sedang membuat kesimpulan..."
    );

    try {
      const response = await fetch(
        AI_API_URL,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            product,
            language
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          "Gagal mendapatkan jawaban AI."
        );
      }

      // =========================
      // DISPLAY RESULT
      // =========================

      setText(
        "resultTitle",
        `AI Analysis: ${product}`
      );

      setText(
        "overview",
        data.overview
      );

      setText(
        "benefitsResult",
        data.benefits
      );

      setText(
        "lossesResult",
        data.risks
      );

      setText(
        "opportunity",
        data.opportunityCost
      );

      setText(
        "value",
        data.value
      );

      setText(
        "aboutProduct",
        data.productInfo
      );

      setText(
        "summary",
        data.summary
      );

      if (results) {
        results.scrollIntoView({
          behavior: "smooth"
        });
      }

    } catch (error) {

      console.error(error);

      if (errorBox) {
        errorBox.textContent =
          "Gagal terhubung ke AI. Periksa URL backend dan konfigurasi API key.";
      }
    }
  });
}


// =========================
// HELPER
// =========================

function setText(id, text) {
  const element = $(id);

  if (element) {
    element.textContent =
      text || "Tidak ada informasi.";
  }
}


// =========================
// ANOTHER ANALYSIS
// =========================

const anotherBtn = $("anotherBtn");

if (anotherBtn) {
  anotherBtn.addEventListener(
    "click",
    () => {

      const analyzer = $("analyzer");

      if (analyzer) {
        analyzer.scrollIntoView({
          behavior: "smooth"
        });
      }

      const input = $("productName");

      if (input) {
        input.focus();
      }
    }
  );
            }
