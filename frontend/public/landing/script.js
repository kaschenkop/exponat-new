(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var header = document.querySelector(".site-header");
  var headerOffset = function () {
    return header ? header.offsetHeight : 72;
  };

  function initHeaderScroll() {
    if (!header) return;
    function tick() {
      header.classList.toggle("is-scrolled", window.scrollY > 48);
    }
    tick();
    window.addEventListener("scroll", tick, { passive: true });
  }

  function initMobileNav() {
    var burger = document.querySelector(".site-header__burger");
    var mobile = document.querySelector(".site-header__mobile-nav");
    if (!burger || !mobile) return;
    burger.addEventListener("click", function () {
      var open = burger.classList.toggle("is-open");
      mobile.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    mobile.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        burger.classList.remove("is-open");
        mobile.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  function initTypewriter() {
    var el = document.querySelector(".hero__typed");
    if (!el) return;
    var full = el.getAttribute("data-full") || "";
    if (reducedMotion) {
      el.textContent = full;
      el.classList.add("is-done");
      return;
    }
    el.textContent = "";
    var i = 0;
    var ms = 50;
    function step() {
      if (i < full.length) {
        el.textContent += full.charAt(i);
        i += 1;
        setTimeout(step, ms);
      } else {
        el.classList.add("is-done");
      }
    }
    step();
  }

  function initParallax() {
    var tilt = document.querySelector(".hero__mockup-tilt");
    var hero = document.querySelector(".hero");
    if (!tilt || !hero) return;
    hero.addEventListener(
      "mousemove",
      function (e) {
        var r = hero.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        tilt.style.transform =
          "perspective(1200px) rotateY(" + x * 10 + "deg) rotateX(" + -y * 7 + "deg)";
      },
      { passive: true }
    );
    hero.addEventListener("mouseleave", function () {
      tilt.style.transform = "";
    });
  }

  function initFAQ() {
    document.querySelectorAll(".faq-item").forEach(function (item) {
      var panel = item.querySelector(".faq-item__panel");
      var inner = item.querySelector(".faq-item__inner");
      var btn = item.querySelector(".faq-item__trigger");
      if (!panel || !inner || !btn) return;
      inner.setAttribute("aria-hidden", "true");
      btn.addEventListener("click", function () {
        var open = btn.getAttribute("aria-expanded") === "true";
        var next = !open;
        btn.setAttribute("aria-expanded", next ? "true" : "false");
        panel.classList.toggle("is-open", next);
        inner.setAttribute("aria-hidden", next ? "false" : "true");
      });
    });
  }

  function bindSmoothAnchors(lenis) {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      var href = a.getAttribute("href");
      if (!href || href === "#") return;
      a.addEventListener("click", function (e) {
        if (href === "#top") {
          e.preventDefault();
          if (lenis) lenis.scrollTo(0, { duration: reducedMotion ? 0 : 1 });
          else window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
          return;
        }
        var target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        var off = headerOffset();
        if (lenis) {
          lenis.scrollTo(target, { offset: -off, duration: reducedMotion ? 0 : 1.1 });
        } else {
          var top = target.getBoundingClientRect().top + window.scrollY - off;
          window.scrollTo({ top: top, behavior: reducedMotion ? "auto" : "smooth" });
        }
      });
    });
  }

  function formatRu(n) {
    return new Intl.NumberFormat("ru-RU").format(n);
  }

  function initScrollAnimations(lenis) {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);
    if (lenis) {
      lenis.on("scroll", ScrollTrigger.update);
    }

    document.querySelectorAll(".section .section__title").forEach(function (title) {
      var section = title.closest(".section");
      if (!section || section.id === "problem-solution") return;
      gsap.fromTo(
        title,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          ease: "power2.out",
          scrollTrigger: { trigger: section, start: "top 88%", toggleActions: "play none none none" },
        }
      );
    });

    gsap.fromTo(
      ".stats__quote",
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.65,
        ease: "power2.out",
        scrollTrigger: { trigger: ".stats__quote", start: "top 90%", toggleActions: "play none none none" },
      }
    );

    gsap.fromTo(
      ".faq-item",
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: "power2.out",
        stagger: 0.1,
        scrollTrigger: { trigger: ".faq__list", start: "top 85%", toggleActions: "play none none none" },
      }
    );

    var psItems = [];
    document.querySelectorAll('.ps-item[data-ps="pain"]').forEach(function (el, i) {
      var sol = document.querySelectorAll('.ps-item[data-ps="solution"]')[i];
      if (sol) {
        psItems.push(el, sol);
      }
    });
    var divider = document.querySelector(".problem-solution__divider");
    if (divider) {
      gsap.fromTo(
        divider,
        { opacity: 0, scale: 0.85 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: "back.out(1.2)",
          scrollTrigger: { trigger: "#problem-solution", start: "top 82%", toggleActions: "play none none none" },
        }
      );
    }

    if (psItems.length) {
      gsap.set(psItems, {
        opacity: 0,
        x: function (i) {
          return i % 2 === 0 ? -24 : 24;
        },
      });
      gsap.to(psItems, {
        opacity: 1,
        x: 0,
        duration: 0.55,
        ease: "power2.out",
        stagger: 0.12,
        scrollTrigger: { trigger: "#problem-solution", start: "top 80%", toggleActions: "play none none none" },
      });
    }

    gsap.fromTo(
      ".step",
      { opacity: 0, y: 32 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.15,
        scrollTrigger: { trigger: ".steps__list", start: "top 85%", toggleActions: "play none none none" },
      }
    );

    gsap.fromTo(
      ".cta-banner__inner > *",
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: "power2.out",
        stagger: 0.1,
        scrollTrigger: { trigger: ".cta-banner", start: "top 88%", toggleActions: "play none none none" },
      }
    );

    var linePath = document.querySelector(".steps__line-path");
    if (linePath && !reducedMotion) {
      ScrollTrigger.create({
        trigger: ".how-it-works",
        start: "top 75%",
        once: true,
        onEnter: function () {
          linePath.classList.add("is-drawn");
        },
      });
    } else if (linePath) {
      linePath.classList.add("is-drawn");
    }

    document.querySelectorAll(".stat[data-stat]").forEach(function (stat) {
      var target = parseInt(stat.getAttribute("data-stat"), 10);
      var suffix = stat.getAttribute("data-suffix") || "";
      var numEl = stat.querySelector(".stat__num");
      if (!numEl || isNaN(target)) return;
      var obj = { v: 0 };
      gsap.to(obj, {
        v: target,
        duration: 2,
        ease: "power2.out",
        scrollTrigger: { trigger: stat, start: "top 85%", once: true },
        onUpdate: function () {
          var n = Math.round(obj.v);
          numEl.textContent = suffix === "+" ? formatRu(n) : String(n);
        },
      });
    });

    var lawStat = document.querySelector(".stat[data-stat-text]");
    if (lawStat) {
      var plain = lawStat.querySelector(".stat__value--plain");
      if (plain) {
        gsap.fromTo(
          plain,
          { opacity: 0, scale: 0.92 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: "back.out(1.4)",
            scrollTrigger: { trigger: lawStat, start: "top 85%", once: true },
          }
        );
      }
    }

    document.querySelectorAll(".price-card").forEach(function (card) {
      var featured = card.classList.contains("price-card--featured");
      gsap.fromTo(
        card,
        { scale: 0.95, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.55,
          ease: "power2.out",
          scrollTrigger: { trigger: card, start: "top 90%", once: true },
          onComplete: function () {
            if (featured) gsap.set(card, { clearProps: "scale" });
          },
        }
      );
    });

    var featCards = document.querySelectorAll(".feature-card");
    if (featCards.length) {
      gsap.fromTo(
        featCards,
        { opacity: 0, x: -36 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.1,
          scrollTrigger: { trigger: ".features__grid", start: "top 82%", once: true },
        }
      );
    }

    window.addEventListener(
      "load",
      function () {
        ScrollTrigger.refresh();
      },
      { once: true }
    );
    ScrollTrigger.refresh();
    if (lenis) {
      setTimeout(function () {
        ScrollTrigger.refresh();
      }, 150);
    }
  }

  function init() {
    document.documentElement.classList.add("lenis");
    initHeaderScroll();
    initMobileNav();
    initTypewriter();
    initFAQ();
    if (!reducedMotion) initParallax();

    var LenisCtor = window.Lenis;
    var lenis = null;
    if (!reducedMotion && typeof LenisCtor === "function") {
      try {
        lenis = new LenisCtor();
      } catch (err) {
        lenis = null;
      }
    }
    if (lenis) {
      if (typeof gsap !== "undefined") {
        gsap.ticker.add(function (t) {
          lenis.raf(t * 1000);
        });
        gsap.ticker.lagSmoothing(0);
      } else {
        function raf(time) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      }
    }

    bindSmoothAnchors(lenis);

    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      if (reducedMotion) {
        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.refresh();
      } else {
        initScrollAnimations(lenis);
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
