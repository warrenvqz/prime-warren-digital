/* prime.warren.digital — shared interactions
   - scroll reveal
   - active nav highlighting
   - row drag/scroll niceties
   - X-Ray expand/collapse (progressive enhancement; open by default) */

(function () {
  "use strict";

  /* ---- scroll reveal ---- */
  function initReveal() {
    var els = document.querySelectorAll(".pv-reveal");
    if (!("IntersectionObserver" in window) || !els.length) {
      els.forEach(function (e) { e.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    els.forEach(function (e, i) {
      e.style.transitionDelay = (Math.min(i % 6, 5) * 0.06) + "s";
      io.observe(e);
    });
  }

  /* ---- active nav link based on filename ---- */
  function initNav() {
    var path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    if (path === "") path = "index.html";
    document.querySelectorAll(".pv-navlinks a").forEach(function (a) {
      var href = (a.getAttribute("href") || "").toLowerCase();
      if (href === path || (path === "index.html" && (href === "" || href === "./" || href === "index.html"))) {
        a.setAttribute("aria-current", "page");
      }
    });
  }

  /* ---- horizontal rows: shift+wheel to scroll, and optional arrow buttons ---- */
  function initRows() {
    document.querySelectorAll(".pv-row-scroll").forEach(function (row) {
      row.addEventListener("wheel", function (e) {
        if (Math.abs(e.deltaX) < Math.abs(e.deltaY) && e.shiftKey) {
          row.scrollLeft += e.deltaY; e.preventDefault();
        }
      }, { passive: false });
    });
    document.querySelectorAll("[data-scroll-target]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = document.getElementById(btn.getAttribute("data-scroll-target"));
        if (!target) return;
        var dir = btn.getAttribute("data-dir") === "prev" ? -1 : 1;
        target.scrollBy({ left: dir * Math.min(target.clientWidth * 0.9, 700), behavior: "smooth" });
      });
    });

    /* Auto-enhance every carousel: wrap it, inject arrows + edge fades, and add a
       "Scroll →" cue in the row head — so it's obvious the row scrolls sideways. */
    document.querySelectorAll(".pv-row-scroll").forEach(function (scroll) {
      if (scroll.parentNode && scroll.parentNode.classList.contains("pv-row-viewport")) return;
      var vp = document.createElement("div");
      vp.className = "pv-row-viewport";
      scroll.parentNode.insertBefore(vp, scroll);
      vp.appendChild(scroll);

      function makeArrow(dir) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "pv-row-arrow " + dir;
        b.setAttribute("aria-label", dir === "next" ? "Scroll right for more" : "Scroll left");
        b.innerHTML = '<span class="chev" aria-hidden="true">' + (dir === "next" ? "›" : "‹") + "</span>";
        b.addEventListener("click", function () {
          scroll.scrollBy({ left: (dir === "next" ? 1 : -1) * Math.min(scroll.clientWidth * 0.85, 720), behavior: "smooth" });
        });
        return b;
      }
      var prevBtn = makeArrow("prev");
      var nextBtn = makeArrow("next");
      vp.appendChild(prevBtn);
      vp.appendChild(nextBtn);

      /* scroll cue in the row head (previous sibling of the viewport) */
      var head = vp.previousElementSibling;
      var cue = null;
      if (head && head.classList.contains("pv-row-head")) {
        cue = document.createElement("span");
        cue.className = "pv-row-scrollcue";
        cue.innerHTML = 'Scroll <span class="arrow" aria-hidden="true">→</span>';
        head.appendChild(cue);
      }

      function update() {
        var max = scroll.scrollWidth - scroll.clientWidth - 2;
        var scrollable = scroll.scrollWidth > scroll.clientWidth + 6;
        var atStart = scroll.scrollLeft <= 4;
        var atEnd = scroll.scrollLeft >= max;
        vp.classList.toggle("scrollable", scrollable);
        vp.classList.toggle("at-start", atStart);
        vp.classList.toggle("at-end", atEnd);
        prevBtn.disabled = !scrollable || atStart;
        nextBtn.disabled = !scrollable || atEnd;
        prevBtn.setAttribute("aria-hidden", (!scrollable || atStart) ? "true" : "false");
        nextBtn.setAttribute("aria-hidden", (!scrollable || atEnd) ? "true" : "false");
        // keep the "Scroll →" cue visible while there is more to the right
        if (cue) cue.classList.toggle("show", scrollable && !atEnd);
      }
      scroll.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
      if (window.requestAnimationFrame) requestAnimationFrame(update);
      setTimeout(update, 120);
      update();
    });
  }

  /* ---- X-Ray toggles (button with [data-xray-toggle="id"]) ---- */
  function initXray() {
    document.querySelectorAll("[data-xray-toggle]").forEach(function (btn) {
      var panel = document.getElementById(btn.getAttribute("data-xray-toggle"));
      if (!panel) return;
      btn.addEventListener("click", function () {
        var open = panel.hasAttribute("hidden");
        if (open) { panel.removeAttribute("hidden"); btn.setAttribute("aria-expanded", "true"); }
        else { panel.setAttribute("hidden", ""); btn.setAttribute("aria-expanded", "false"); }
      });
    });
  }

  /* ---- year stamp ---- */
  function initYear() {
    document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  /* ---- MODAL engine (Prime Video title-detail overlay) ----
     A card with [data-modal="modalId"] opens the <div class="pv-modal-scrim" id="modalId">.
     Close via [data-modal-close], the scrim backdrop, or Escape. */
  var lastFocus = null;
  function openModal(scrim) {
    if (!scrim) return;
    lastFocus = document.activeElement;
    scrim.classList.add("open");
    scrim.setAttribute("aria-hidden", "false");
    document.body.classList.add("pv-noscroll");
    var close = scrim.querySelector(".pv-modal-close, [data-modal-close]");
    if (close) close.focus();
    scrim.scrollTop = 0;
  }
  function closeModal(scrim) {
    if (!scrim) return;
    scrim.classList.remove("open");
    scrim.setAttribute("aria-hidden", "true");
    document.body.classList.remove("pv-noscroll");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function initModals() {
    document.querySelectorAll("[data-modal]").forEach(function (trigger) {
      trigger.addEventListener("click", function (e) {
        if (e.target.closest("a[href]") && e.target.closest("a[href]") !== trigger) return;
        e.preventDefault();
        openModal(document.getElementById(trigger.getAttribute("data-modal")));
      });
      trigger.setAttribute("role", trigger.tagName === "A" ? trigger.getAttribute("role") || "button" : "button");
      trigger.setAttribute("tabindex", trigger.hasAttribute("tabindex") ? trigger.getAttribute("tabindex") : "0");
      trigger.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openModal(document.getElementById(trigger.getAttribute("data-modal"))); }
      });
    });
    document.querySelectorAll(".pv-modal-scrim").forEach(function (scrim) {
      scrim.addEventListener("click", function (e) { if (e.target === scrim) closeModal(scrim); });
      scrim.querySelectorAll("[data-modal-close], .pv-modal-close").forEach(function (btn) {
        btn.addEventListener("click", function () { closeModal(scrim); });
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { var open = document.querySelector(".pv-modal-scrim.open"); if (open) closeModal(open); }
    });
    /* deep-link: #modal-xyz in the URL opens that modal on load */
    if (location.hash && location.hash.length > 1) {
      var target = document.getElementById(location.hash.slice(1));
      if (target && target.classList.contains("pv-modal-scrim")) openModal(target);
    }
  }

  /* ---- TABS (inside modals: Details / X-Ray) ---- */
  function initTabs() {
    document.querySelectorAll("[data-tabs]").forEach(function (group) {
      var tabs = group.querySelectorAll(".pv-tab");
      tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          tabs.forEach(function (t) {
            var panel = document.getElementById(t.getAttribute("aria-controls"));
            var on = t === tab;
            t.setAttribute("aria-selected", on ? "true" : "false");
            if (panel) { if (on) panel.removeAttribute("hidden"); else panel.setAttribute("hidden", ""); }
          });
        });
      });
    });
  }

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }
  ready(function () { initReveal(); initNav(); initRows(); initXray(); initModals(); initTabs(); initYear(); });
})();
