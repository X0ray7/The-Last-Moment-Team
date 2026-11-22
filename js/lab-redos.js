/* ==========================================================================
   Lab 2: ReDoS (Regular Expression Denial of Service) Live Benchmark
   ========================================================================== */

(function () {
  const VULN_REGEX = /^([a-zA-Z0-9]+)+@demo\.local$/;
  const SAFE_REGEX = /^[a-zA-Z0-9]+@demo\.local$/;
  const MAX_SAFE_LEN = 35;

  let mode = "vulnerable";

  const panel = document.getElementById("sandboxPanel");
  const modeLabel = document.getElementById("modeLabel");
  const btnVuln = document.getElementById("btnVuln");
  const btnFixed = document.getElementById("btnFixed");
  const regexInput = document.getElementById("regexInput");
  const runBtn = document.getElementById("runRegexBtn");
  const metricTime = document.getElementById("metricTime");
  const metricLen = document.getElementById("metricLen");
  const metricMatch = document.getElementById("metricMatch");
  const gaugeFill = document.getElementById("gaugeFill");
  const regexOutput = document.getElementById("regexOutput");
  const shortcutBtn = document.getElementById("switchToFixShortcut");

  function setMode(nextMode) {
    mode = nextMode;
    const isFixed = mode === "fixed";
    panel.classList.toggle("mode-fixed", isFixed);
    modeLabel.textContent = isFixed ? "FIXED MODE — LINEAR-TIME REGEX" : "VULNERABLE MODE";
    btnVuln.classList.toggle("active-vuln", !isFixed);
    btnFixed.classList.toggle("active-fix", isFixed);
  }

  function runTest(rawValue) {
    let val = String(rawValue || "");
    if (val.length > MAX_SAFE_LEN) {
      val = val.slice(0, MAX_SAFE_LEN);
    }
    regexInput.value = val;
    metricLen.textContent = val.length + " chars";
    metricMatch.textContent = "Running...";
    regexOutput.className = "alert-box";
    regexOutput.innerHTML = "<strong>Running regex engine...</strong> Measuring main-thread execution time.";

    setTimeout(function () {
      const regex = mode === "vulnerable" ? VULN_REGEX : SAFE_REGEX;
      const t0 = performance.now();
      const matched = regex.test(val);
      const elapsed = performance.now() - t0;

      metricTime.textContent = elapsed.toFixed(2) + " ms";
      metricMatch.textContent = matched ? "Valid" : "Invalid";

      const pct = Math.min(100, Math.max(4, (elapsed / 250) * 100));
      gaugeFill.style.width = pct + "%";

      if (elapsed >= 15) {
        gaugeFill.style.backgroundColor = "var(--danger)";
        regexOutput.className = "alert-box danger";
        regexOutput.innerHTML =
          "<strong>ReDoS TRIGGERED — Catastrophic Backtracking Detected!</strong>" +
          "The nested quantifier regex blocked the JavaScript main thread for <code>" +
          elapsed.toFixed(2) + " ms</code> on just " + val.length +
          " characters. Adding 6 more characters would freeze the tab for over a minute.";
      } else if (mode === "fixed" && !matched && val.indexOf("aaaa") !== -1) {
        gaugeFill.style.backgroundColor = "var(--success)";
        regexOutput.className = "alert-box success";
        regexOutput.innerHTML =
          "<strong>ATTACK BLOCKED — Linear-Time Execution (" + elapsed.toFixed(2) + " ms)</strong>" +
          "The fixed regex rejected the exact same ReDoS payload instantly with zero backtracking.";
      } else {
        gaugeFill.style.backgroundColor = "var(--success)";
        regexOutput.className = "alert-box success";
        regexOutput.innerHTML =
          "<strong>Normal Fast Execution (" + elapsed.toFixed(2) + " ms)</strong>" +
          "Input evaluated cleanly in linear time without stalling the thread.";
      }
    }, 25);
  }

  btnVuln.addEventListener("click", function () {
    setMode("vulnerable");
    runTest(regexInput.value);
  });

  btnFixed.addEventListener("click", function () {
    setMode("fixed");
    runTest(regexInput.value);
  });

  if (shortcutBtn) {
    shortcutBtn.addEventListener("click", function () {
      setMode("fixed");
      panel.scrollIntoView({ behavior: "smooth", block: "center" });
      runTest(regexInput.value);
    });
  }

  document.querySelectorAll(".btn-payload").forEach(function (btn) {
    btn.addEventListener("click", function () {
      runTest(btn.getAttribute("data-payload"));
    });
  });

  runBtn.addEventListener("click", function () {
    runTest(regexInput.value);
  });
})();
