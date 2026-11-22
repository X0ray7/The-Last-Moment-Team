/* ==========================================================================
   Ghurir — Shared UI Logic (Theme Persistence & Code Copy)
   ========================================================================== */

(function () {
  const THEME_KEY = "ghurir_sandbox_theme";
  const root = document.documentElement;

  function applyTheme(theme) {
    if (theme === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("data-theme");
    }
    const btn = document.getElementById("themeToggle");
    if (btn) {
      btn.textContent = theme === "light" ? "Dark Mode" : "Light Mode";
      btn.setAttribute("aria-label", theme === "light" ? "Switch to dark mode" : "Switch to light mode");
    }
  }

  let savedTheme = "dark";
  try {
    savedTheme = localStorage.getItem(THEME_KEY) || "dark";
  } catch (_) {
    savedTheme = "dark";
  }
  applyTheme(savedTheme);

  document.addEventListener("DOMContentLoaded", function () {
    const toggleBtn = document.getElementById("themeToggle");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", function () {
        const isLight = root.getAttribute("data-theme") === "light";
        const nextTheme = isLight ? "dark" : "light";
        applyTheme(nextTheme);
        try {
          localStorage.setItem(THEME_KEY, nextTheme);
        } catch (_) {
          /* ignore storage errors in restricted contexts */
        }
      });
    }

    document.querySelectorAll(".copy-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const targetId = btn.getAttribute("data-copy-target");
        const container = document.getElementById(targetId);
        if (!container) return;
        const lines = Array.from(container.querySelectorAll(".line-text"))
          .map(function (el) { return el.textContent; })
          .join("\n");

        function markCopied() {
          const orig = btn.textContent;
          btn.textContent = "Copied";
          setTimeout(function () { btn.textContent = orig; }, 1400);
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(lines).then(markCopied).catch(function () {
            fallbackCopy(lines, markCopied);
          });
        } else {
          fallbackCopy(lines, markCopied);
        }
      });
    });
  });

  function fallbackCopy(text, onSuccess) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      onSuccess();
    } catch (_) {
      /* ignore */
    }
    document.body.removeChild(ta);
  }
})();
