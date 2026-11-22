/* ==========================================================================
   Lab 3: Prototype Pollution Interactive Simulation (Auto-Cleaning)
   ========================================================================== */

(function () {
  const BLOCKED_KEYS = new Set(["__proto__", "constructor", "prototype"]);
  let mode = "vulnerable";

  const panel = document.getElementById("sandboxPanel");
  const modeLabel = document.getElementById("modeLabel");
  const btnVuln = document.getElementById("btnVuln");
  const btnFixed = document.getElementById("btnFixed");
  const jsonInput = document.getElementById("jsonInput");
  const runBtn = document.getElementById("runMergeBtn");
  const roleBadge = document.getElementById("roleBadge");
  const protoLog = document.getElementById("protoLog");
  const adminVault = document.getElementById("adminVault");
  const protoState = document.getElementById("protoState");
  const shortcutBtn = document.getElementById("switchToFixShortcut");

  function cleanGlobalPrototype() {
    if (Object.prototype.hasOwnProperty.call(Object.prototype, "isAdmin")) {
      delete Object.prototype.isAdmin;
    }
  }

  function vulnerableMerge(target, source) {
    for (const key of Object.keys(source)) {
      const val = source[key];
      if (val && typeof val === "object" && !Array.isArray(val)) {
        if (!target[key]) target[key] = {};
        vulnerableMerge(target[key], val);
      } else {
        target[key] = val;
      }
    }
    return target;
  }

  function safeMerge(target, source, blockedLog) {
    for (const key of Object.keys(source)) {
      if (BLOCKED_KEYS.has(key)) {
        blockedLog.push(key);
        continue;
      }
      const val = source[key];
      if (val && typeof val === "object" && !Array.isArray(val)) {
        if (!Object.prototype.hasOwnProperty.call(target, key)) {
          target[key] = {};
        }
        safeMerge(target[key], val, blockedLog);
      } else {
        target[key] = val;
      }
    }
    return target;
  }

  function setMode(nextMode) {
    mode = nextMode;
    cleanGlobalPrototype();
    const isFixed = mode === "fixed";
    panel.classList.toggle("mode-fixed", isFixed);
    modeLabel.textContent = isFixed ? "FIXED MODE — PROTOTYPE KEYS BLOCKED" : "VULNERABLE MODE";
    btnVuln.classList.toggle("active-vuln", !isFixed);
    btnFixed.classList.toggle("active-fix", isFixed);
  }

  function runMerge(rawJson) {
    jsonInput.value = rawJson;
    cleanGlobalPrototype();

    let parsed;
    try {
      parsed = JSON.parse(rawJson);
    } catch (_) {
      protoLog.className = "alert-box danger";
      protoLog.innerHTML = "<strong>Invalid JSON</strong> Enter a valid JSON object to test.";
      return;
    }

    const userPrefs = {};
    const blockedLog = [];

    if (mode === "vulnerable") {
      vulnerableMerge(userPrefs, parsed);
    } else {
      safeMerge(userPrefs, parsed, blockedLog);
    }

    // Create a brand-new, unrelated user session object to prove prototype inheritance
    const freshUser = { username: "guest_42" };
    const isEscalated = freshUser.isAdmin === true;
    const protoPolluted = Object.prototype.isAdmin;

    protoState.textContent = JSON.stringify(
      {
        "userPrefs": userPrefs,
        "freshUser.ownKeys": Object.keys(freshUser),
        "freshUser.isAdmin": Boolean(freshUser.isAdmin),
        "Object.prototype.isAdmin": protoPolluted === undefined ? "undefined (clean)" : protoPolluted
      },
      null,
      2
    );

    if (isEscalated) {
      roleBadge.className = "badge badge-red";
      roleBadge.textContent = "ADMIN (Polluted!)";
      adminVault.classList.remove("hidden");
      protoLog.className = "alert-box danger";
      protoLog.innerHTML =
        "<strong>EXPLOIT SUCCEEDED — Prototype Polluted!</strong>" +
        "Merging the JSON wrote <code>isAdmin: true</code> onto <code>Object.prototype</code>. " +
        "Every fresh user object now evaluates <code>freshUser.isAdmin === true</code>.";
    } else if (blockedLog.length > 0) {
      roleBadge.className = "badge badge-green";
      roleBadge.textContent = "Standard User";
      adminVault.classList.add("hidden");
      protoLog.className = "alert-box success";
      protoLog.innerHTML =
        "<strong>ATTACK BLOCKED — Dangerous Keys Stripped!</strong>" +
        "Blocked prototype-chain key(s): <code>" + blockedLog.join(", ") + "</code>. " +
        "<code>Object.prototype</code> remains clean and role stays Standard User.";
    } else {
      roleBadge.className = "badge badge-neutral";
      roleBadge.textContent = "Standard User";
      adminVault.classList.add("hidden");
      protoLog.className = "alert-box success";
      protoLog.innerHTML =
        "<strong>Preferences Updated Safely</strong>" +
        "Merged normal settings with no prototype modification.";
    }

    // Immediately clean up Object.prototype after capturing the demo state so page scripts stay safe
    cleanGlobalPrototype();
  }

  btnVuln.addEventListener("click", function () {
    setMode("vulnerable");
    runMerge(jsonInput.value);
  });

  btnFixed.addEventListener("click", function () {
    setMode("fixed");
    runMerge(jsonInput.value);
  });

  if (shortcutBtn) {
    shortcutBtn.addEventListener("click", function () {
      setMode("fixed");
      panel.scrollIntoView({ behavior: "smooth", block: "center" });
      runMerge(jsonInput.value);
    });
  }

  document.querySelectorAll(".btn-payload").forEach(function (btn) {
    btn.addEventListener("click", function () {
      runMerge(btn.getAttribute("data-payload"));
    });
  });

  runBtn.addEventListener("click", function () {
    runMerge(jsonInput.value);
  });
})();
