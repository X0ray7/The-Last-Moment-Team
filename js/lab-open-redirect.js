/* ==========================================================================
   Lab 1: Open Redirect Interactive Simulation
   ========================================================================== */

(function () {
  const TRUSTED_ORIGIN = "https://ghurir-portal.demo";
  let mode = "vulnerable";

  const panel = document.getElementById("sandboxPanel");
  const modeLabel = document.getElementById("modeLabel");
  const btnVuln = document.getElementById("btnVuln");
  const btnFixed = document.getElementById("btnFixed");
  const redirectInput = document.getElementById("redirectInput");
  const runBtn = document.getElementById("runRedirectBtn");
  const simLock = document.getElementById("simLock");
  const simUrl = document.getElementById("simUrl");
  const simViewport = document.getElementById("simViewport");
  const shortcutBtn = document.getElementById("switchToFixShortcut");

  function setMode(nextMode) {
    mode = nextMode;
    const isFixed = mode === "fixed";
    panel.classList.toggle("mode-fixed", isFixed);
    modeLabel.textContent = isFixed ? "FIXED MODE — SAME-ORIGIN CHECK ACTIVE" : "VULNERABLE MODE";
    btnVuln.classList.toggle("active-vuln", !isFixed);
    btnFixed.classList.toggle("active-fix", isFixed);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function runRedirect(rawPayload) {
    const target = (rawPayload || "/dashboard").trim();
    redirectInput.value = target;

    let parsed;
    try {
      parsed = new URL(target, TRUSTED_ORIGIN);
    } catch (_) {
      parsed = new URL("/dashboard", TRUSTED_ORIGIN);
    }

    const isExternal = !target.startsWith("/") || target.startsWith("//") || parsed.origin !== TRUSTED_ORIGIN;

    if (mode === "vulnerable") {
      if (isExternal) {
        simLock.textContent = "\u26A0";
        simUrl.className = "sim-url-pill danger";
        simUrl.textContent = parsed.href;
        simViewport.innerHTML =
          '<div class="alert-box danger">' +
          '<strong>EXPLOIT SUCCEEDED — Redirected to External Phishing Site!</strong>' +
          'The victim clicked a trusted <code>ghurir-portal.demo</code> login link, but landed on ' +
          '<code>' + escapeHtml(parsed.host) + '</code> (a simulated credential-harvesting page).' +
          '</div>';
      } else {
        simLock.textContent = "\uD83D\uDD12";
        simUrl.className = "sim-url-pill safe";
        simUrl.textContent = parsed.href;
        simViewport.innerHTML =
          '<div class="alert-box success">' +
          '<strong>Normal Internal Navigation</strong>' +
          'User logged in and safely arrived at <code>' + escapeHtml(parsed.pathname) + '</code>.' +
          '</div>';
      }
    } else {
      if (isExternal) {
        simLock.textContent = "\uD83D\uDEE1";
        simUrl.className = "sim-url-pill safe";
        simUrl.textContent = TRUSTED_ORIGIN + "/dashboard";
        simViewport.innerHTML =
          '<div class="alert-box success">' +
          '<strong>ATTACK BLOCKED — External Redirect Rejected!</strong>' +
          'Blocked untrusted destination <code>' + escapeHtml(target) + '</code> (origin mismatch: ' +
          '<code>' + escapeHtml(parsed.origin) + '</code>). Forced safe fallback to <code>/dashboard</code>.' +
          '</div>';
      } else {
        simLock.textContent = "\uD83D\uDD12";
        simUrl.className = "sim-url-pill safe";
        simUrl.textContent = parsed.href;
        simViewport.innerHTML =
          '<div class="alert-box success">' +
          '<strong>Verified Same-Origin Route</strong>' +
          'Validated relative path <code>' + escapeHtml(parsed.pathname) + '</code> and allowed navigation.' +
          '</div>';
      }
    }
  }

  btnVuln.addEventListener("click", function () {
    setMode("vulnerable");
    runRedirect(redirectInput.value);
  });

  btnFixed.addEventListener("click", function () {
    setMode("fixed");
    runRedirect(redirectInput.value);
  });

  if (shortcutBtn) {
    shortcutBtn.addEventListener("click", function () {
      setMode("fixed");
      panel.scrollIntoView({ behavior: "smooth", block: "center" });
      runRedirect(redirectInput.value);
    });
  }

  document.querySelectorAll(".btn-payload").forEach(function (btn) {
    btn.addEventListener("click", function () {
      runRedirect(btn.getAttribute("data-payload"));
    });
  });

  runBtn.addEventListener("click", function () {
    runRedirect(redirectInput.value);
  });
})();
