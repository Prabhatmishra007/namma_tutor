/* ==========================================================================
   NammaTutor — theme (dark / light)
   Works on every page. Remembers the choice, and respects the operating
   system preference the first time someone visits.
   ========================================================================== */

(function () {
  var KEY = (window.SITE && window.SITE.THEME_KEY) || "nt-theme";

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function save(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
  }
  function systemPref() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark" : "light";
  }
  function current() {
    return document.documentElement.getAttribute("data-theme") || "light";
  }

  function apply(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    save(theme);

    // keep the browser UI (address bar) in step
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0C1526" : "#F6F7FB");

    // update every toggle on the page
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      var dark = theme === "dark";
      btn.setAttribute("aria-pressed", String(dark));
      btn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
      btn.setAttribute("title", dark ? "Switch to light mode" : "Switch to dark mode");
      var label = btn.querySelector(".theme-btn__label");
      if (label) label.textContent = dark ? "Light" : "Dark";
    });

    // let page-specific code (SVG widgets) redraw with new colours
    document.dispatchEvent(new CustomEvent("themechange", { detail: { theme: theme } }));
  }

  // The inline snippet in <head> already set the attribute to avoid a flash.
  // Re-apply here so toggles and meta tags sync up.
  document.addEventListener("DOMContentLoaded", function () {
    apply(stored() || current() || systemPref());

    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        apply(current() === "dark" ? "light" : "dark");
      });
    });
  });

  // Follow the OS if the visitor has never chosen explicitly
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var onChange = function (e) { if (!stored()) apply(e.matches ? "dark" : "light"); };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  window.NTTheme = { apply: apply, current: current };
})();
