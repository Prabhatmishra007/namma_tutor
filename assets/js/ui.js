/* ==========================================================================
   NammaTutor — shared UI behaviour
   Nav, tabs, WhatsApp links, scroll reveal, form submit state.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  var SITE = window.SITE || {};

  /* --- WhatsApp links: <a data-wa> or <a data-wa="custom message"> --- */
  document.querySelectorAll("[data-wa]").forEach(function (a) {
    var msg = a.getAttribute("data-wa") || SITE.WA_MESSAGE || "";
    a.href = "https://wa.me/" + SITE.WHATSAPP + "?text=" + encodeURIComponent(msg);
    a.target = "_blank";
    a.rel = "noopener";
  });

  /* --- phone number placeholders --- */
  document.querySelectorAll("[data-phone]").forEach(function (el) {
    el.textContent = SITE.PHONE_DISPLAY || "";
    if (el.tagName === "A") el.href = "tel:+" + SITE.WHATSAPP;
  });

  /* --- mobile nav --- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") nav.classList.remove("is-open");
    });
  }

  /* --- tabs (parent / tutor forms) --- */
  document.querySelectorAll("[data-tabs]").forEach(function (group) {
    var tabs = group.querySelectorAll(".tab");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) {
          var on = t === tab;
          t.setAttribute("aria-selected", String(on));
          var panel = document.getElementById(t.getAttribute("aria-controls"));
          if (panel) panel.hidden = !on;
        });
      });
    });
  });

  /* --- deep link: #tutors opens the tutor tab --- */
  if (location.hash === "#tutors") {
    var t = document.querySelector('[aria-controls="panel-tutor"]');
    if (t) t.click();
  }

  /* --- scroll reveal --- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px" });
    document.querySelectorAll(".reveal").forEach(function (el, i) {
      el.style.transitionDelay = (Math.min(i % 4, 3) * 70) + "ms";
      io.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-in"); });
  }

  /* --- current year --- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* --- form submit state --- */
  document.querySelectorAll("form[data-form]").forEach(function (form) {
    form.addEventListener("submit", function () {
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
    });
  });

  /* --- FAQ accordion: close siblings for a tidier read --- */
  document.querySelectorAll(".faq details").forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (!d.open) return;
      d.parentElement.querySelectorAll("details").forEach(function (o) {
        if (o !== d) o.open = false;
      });
    });
  });
});
