// =====================================================================
// PeerHub — shared site behaviour
// Mobile nav toggle, sticky-nav scroll state, scroll-reveal animation,
// and a small count-up for the hero phone balance. No dependencies.
// =====================================================================
(function () {
  "use strict";

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- Mobile hamburger menu ---------------------------------------
  (function mobileMenu() {
    var burger = document.getElementById("burger");
    var mobMenu = document.getElementById("mobMenu");
    if (!burger || !mobMenu) return;

    function closeMenu() {
      burger.classList.remove("open");
      mobMenu.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    }

    function toggleMenu() {
      var isOpen = mobMenu.classList.toggle("open");
      burger.classList.toggle("open", isOpen);
      burger.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }

    burger.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleMenu();
    });

    mobMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", function (e) {
      if (!mobMenu.contains(e.target) && !burger.contains(e.target)) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  })();

  // --- Nav background once the page scrolls past the hero ----------
  (function stickyNav() {
    var navOuter = document.getElementById("navOuter");
    if (!navOuter) return;

    function update() {
      if (window.scrollY > 24) {
        navOuter.classList.add("stuck");
      } else {
        navOuter.classList.remove("stuck");
      }
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
  })();

  // --- Scroll reveal --------------------------------------------------
  (function scrollReveal() {
    var items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;

    items.forEach(function (el) {
      var delay = el.getAttribute("data-reveal-delay");
      if (delay) el.style.setProperty("--reveal-delay", delay);
    });

    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach(function (el) {
      observer.observe(el);
    });
  })();

  // --- Count-up for [data-count] figures (e.g. the hero phone balance)
  (function countUp() {
    var nodes = document.querySelectorAll("[data-count]");
    if (!nodes.length) return;

    function formatCurrency(value, prefix) {
      return (
        prefix +
        value.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    }

    function run(el) {
      var target = parseFloat(el.getAttribute("data-count"));
      if (isNaN(target)) return;
      var prefix = (el.textContent.match(/^[^0-9]*/) || [""])[0] || "$";

      if (reduceMotion) {
        el.textContent = formatCurrency(target, prefix);
        return;
      }

      var duration = 1200;
      var start = null;

      function step(ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = formatCurrency(target * eased, prefix);
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    if (!("IntersectionObserver" in window)) {
      nodes.forEach(run);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            run(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    nodes.forEach(function (el) {
      observer.observe(el);
    });
  })();
})();
