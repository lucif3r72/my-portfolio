/**
 * ================================================================
 *  MAIN.JS — UX//RAW Portfolio  v6
 *
 *  CHANGES IN THIS VERSION:
 *   • Lenis smooth scroll replaces ScrollSmoother
 *     - Lenis loaded via CDN in HTML <head>
 *     - ScrollTrigger ticker synced to Lenis RAF loop
 *     - ScrollToPlugin still used for back-to-top
 *   • Sticky pin disabled on mobile (< 809px) — experience
 *     and favourite-stack headings no longer overlap content
 *   • Contact/Work footer reveal fixed — start threshold
 *     changed to '80%' so it fires even on short pages
 *   • All GSAP targets guarded against null/empty sets
 *   • timeScale tweened on GSAP tween object (not DOM)
 * ================================================================
 */

$(function () {
  /* ═══════════════════════════════════════════════════
       1. GSAP Plugin Registration
          NOTE: ScrollSmoother removed — Lenis handles smooth
          scroll now. ScrollSmoother is NOT registered.
    ═══════════════════════════════════════════════════ */
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, SplitText);

  /* ═══════════════════════════════════════════════════
       2. Body scroll-lock during preloader
    ═══════════════════════════════════════════════════ */
  function lockScroll() {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  }
  function unlockScroll() {
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  }
  lockScroll();

  /* ═══════════════════════════════════════════════════
       3. Lenis Smooth Scroll
          Initialised here but NOT started until preloader
          finishes — lenisStart() called from buildTimeline.
          ScrollTrigger is synced via the RAF loop so all
          scroll-based animations work correctly with Lenis.
    ═══════════════════════════════════════════════════ */
  let lenis = null;

  function initLenis() {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: "vertical",
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    // Sync Lenis RAF with GSAP ticker for perfect ScrollTrigger integration
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    // Tell GSAP ticker NOT to use requestAnimationFrame itself
    gsap.ticker.lagSmoothing(0);

    // Keep ScrollTrigger in sync with Lenis scroll position
    lenis.on("scroll", ScrollTrigger.update);
  }

  function lenisStart() {
    if (lenis) lenis.start();
  }

  function lenisPause() {
    if (lenis) lenis.stop();
  }

  // Initialise Lenis (paused — starts after preloader)
  initLenis();
  lenisPause();

  // Back-to-top — use Lenis scrollTo
  const btt = document.querySelector("#back-to-top");
  if (btt) {
    btt.addEventListener("click", () => {
      if (lenis) {
        lenis.scrollTo(0, {
          duration: 1.4,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      } else {
        gsap.to(window, { scrollTo: 0, duration: 1.2, ease: "power3.inOut" });
      }
    });
  }

  /* ═══════════════════════════════════════════════════
       4. UX//RAW Preloader — CMH split-panel wipe
    ═══════════════════════════════════════════════════ */
  let marqueeTween = null;

  (function initPreloader() {
    const preloader = document.getElementById("uxrPreloader");
    if (!preloader) {
      unlockScroll();
      lenisStart();
      initPageAnims();
      return;
    }

    const panelL = document.getElementById("uxrPanelL");
    const panelR = document.getElementById("uxrPanelR");
    const progress = document.getElementById("uxrProgress");
    const corners = ["ccTL", "ccTR", "ccBL", "ccBR"].map((id) =>
      document.getElementById(id),
    );
    const counter = document.getElementById("uxrCounter");
    const divider = document.getElementById("uxrDivider");
    const sub = document.getElementById("uxrSub");
    const lU = document.getElementById("lU");
    const lX = document.getElementById("lX");
    const lSep = document.getElementById("lSep");
    const lR = document.getElementById("lR");
    const lA = document.getElementById("lA");
    const lW = document.getElementById("lW");
    const gX = document.getElementById("gX");
    const gR = document.getElementById("gR");
    const gW = document.getElementById("gW");

    if (!panelL || !panelR || !lU) {
      unlockScroll();
      lenisStart();
      initPageAnims();
      return;
    }

    function getGapWidths() {
      gsap.set([lX, lR, lW], { opacity: 1, y: 0 });
      const wX = lX.offsetWidth || 58;
      const wR = lR.offsetWidth || 58;
      const wW = lW.offsetWidth || 72;
      gsap.set([lX, lR, lW], { clearProps: "all" });
      return { wX, wR, wW };
    }

    let counterVal = 0;
    function animateCounter(to, dur) {
      gsap.to(
        { v: counterVal },
        {
          v: to,
          duration: dur,
          ease: "none",
          onUpdate: function () {
            counterVal = Math.round(this.targets()[0].v);
            if (counter)
              counter.textContent = String(counterVal).padStart(3, "0");
          },
        },
      );
    }

    function initStates() {
      gsap.set([lU, lSep, lA], { y: 40, opacity: 0 });
      gsap.set([lX, lR, lW], { y: 40, opacity: 0 });
      gsap.set([gX, gR, gW], { width: 0 });
      gsap.set(sub, { y: 14, opacity: 0 });
      gsap.set(corners, { opacity: 0, scale: 0.6 });
      gsap.set(counter, { opacity: 0 });
      gsap.set(divider, { width: 0 });
      gsap.set(progress, { width: "0%" });
      gsap.set([panelL, panelR], { x: 0 });
    }

    function buildTimeline(wX, wR, wW) {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.to(counter, { opacity: 0.45, duration: 0.4, ease: "power2.out" }, 0)
        .to(
          corners,
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            stagger: 0.06,
            ease: "power2.out",
          },
          0.05,
        )
        .to(
          progress,
          { width: "100%", duration: 1.6, ease: "power2.inOut" },
          0.2,
        );

      animateCounter(100, 1.6);

      tl.to(
        [lU, lSep, lA],
        { y: 0, opacity: 1, duration: 0.75, stagger: 0.08 },
        0.3,
      )
        .to(
          [gX, gR, gW],
          { width: (i) => [wX, wR, wW][i], duration: 0.65, stagger: 0.05 },
          1.05,
        )
        .to(
          [lX, lR, lW],
          { y: 0, opacity: 1, duration: 0.65, stagger: 0.05 },
          1.05,
        )
        .to(
          sub,
          { y: 0, opacity: 0.55, duration: 0.55, ease: "power2.out" },
          1.5,
        )
        .to(
          divider,
          { width: "200px", duration: 0.55, ease: "power2.out" },
          1.55,
        )
        .to(
          [panelL, panelR],
          {
            x: (i) => ["-101%", "101%"][i],
            duration: 1.0,
            stagger: 0,
            ease: "power3.inOut",
            onComplete: () => {
              gsap.set(preloader, { display: "none" });
              unlockScroll();
              lenisStart(); // ← start smooth scroll when panels exit
            },
          },
          2.4,
        )
        .to(
          [lU, lX, lSep, lR, lA, lW, sub, divider, corners, counter, progress],
          {
            opacity: 0,
            duration: 0.45,
            ease: "power2.out",
          },
          2.55,
        )
        .add(() => {
          initPageAnims();
        }, 3.0);

      return tl;
    }

    initStates();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const { wX, wR, wW } = getGapWidths();
        buildTimeline(wX, wR, wW);
      });
    });
  })();

  /* ═══════════════════════════════════════════════════
       5. Hero entrance
    ═══════════════════════════════════════════════════ */
  function initHeroAnims() {
    const heroLines = document.querySelectorAll(".hero-line-inner");
    if (heroLines.length) {
      gsap.to(heroLines, {
        y: "0%",
        duration: 1.1,
        ease: "power4.out",
        stagger: 0.12,
        delay: 0.05,
      });
    }
    const heroItems = document.querySelectorAll(
      ".hero-anim-item, .hero-sec .hero-footer-wrap",
    );
    if (heroItems.length) {
      gsap.to(heroItems, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.1,
        delay: 0.5,
      });
    }
    const header = document.querySelector(".header-wrap");
    if (header) {
      gsap.from(header, {
        yPercent: -100,
        duration: 0.9,
        ease: "power3.out",
        delay: 0.15,
      });
    }
  }

  /* ═══════════════════════════════════════════════════
       6. Page animations — fired after preloader
    ═══════════════════════════════════════════════════ */
  function initPageAnims() {
    initHeroAnims();

    /* ── Marquee — store tween ref, tween timeScale on object ── */
    const marqueeTrack = document.querySelector(".marquee-track");
    if (marqueeTrack) {
      const list = marqueeTrack.querySelector(".marquee-list");
      if (list) {
        const listWidth = list.scrollWidth / 2;
        marqueeTween = gsap.to(marqueeTrack, {
          x: "-=" + listWidth,
          duration: 28,
          ease: "none",
          repeat: -1,
          modifiers: {
            x: gsap.utils.unitize((x) => parseFloat(x) % listWidth),
          },
        });
        ScrollTrigger.create({
          trigger: ".marquee-divider",
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const ts = Math.max(0.5, 1 + self.getVelocity() / 3000);
            gsap.to(marqueeTween, {
              timeScale: ts,
              duration: 0.4,
              ease: "power2.out",
              overwrite: "auto",
            });
          },
        });
      }
    }

    /* ── Stats counter ── */
    document.querySelectorAll(".js-counter").forEach((el) => {
      const target = parseInt(el.dataset.target, 10);
      if (isNaN(target)) return;
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: () => {
          let current = 0;
          const step = Math.ceil(target / 40);
          const timer = setInterval(() => {
            current += step;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            el.textContent = current;
          }, 28);
        },
      });
    });

    /* ── Card reveals — stagger per 3-col row ── */
    const allCards = gsap.utils.toArray(".js-card-reveal");
    for (let i = 0; i < allCards.length; i += 3) {
      const row = allCards.slice(i, i + 3);
      if (!row.length) continue;
      gsap.to(row, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: {
          trigger: row[0],
          start: "top 88%",
          toggleActions: "play none none reverse",
        },
      });
    }

    /* ── Process steps ── */
    const processSteps = gsap.utils.toArray(".js-process-step");
    if (processSteps.length) {
      gsap.to(processSteps, {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: "power3.out",
        stagger: 0.14,
        scrollTrigger: {
          trigger: ".process-steps",
          start: "top 82%",
          toggleActions: "play none none reverse",
        },
      });
    }

    /* ── Process title SplitText ── */
    const processTitleEl = document.querySelector(".process-title");
    if (processTitleEl) {
      const ptSplit = new SplitText(processTitleEl, {
        type: "lines",
        linesClass: "pt-line",
      });
      if (ptSplit.lines.length) {
        ptSplit.lines.forEach((line) => {
          line.style.overflow = "hidden";
        });
        gsap.from(ptSplit.lines, {
          yPercent: 110,
          duration: 1,
          ease: "power4.out",
          stagger: 0.1,
          scrollTrigger: { trigger: processTitleEl, start: "top 85%" },
        });
      }
    }

    /* ── .js-fade-up ── */
    gsap.utils.toArray(".js-fade-up").forEach((el) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          toggleActions: "play none none reverse",
        },
      });
    });

    /* ── .js-split-reveal — SplitText clip ── */
    gsap.utils.toArray(".js-split-reveal").forEach((el) => {
      if (!el) return;
      const split = new SplitText(el, {
        type: "lines",
        linesClass: "js-sr-line",
      });
      if (!split.lines.length) return;
      split.lines.forEach((line) => {
        const wrap = document.createElement("div");
        wrap.style.cssText = "overflow:hidden; display:block;";
        line.parentNode.insertBefore(wrap, line);
        wrap.appendChild(line);
      });
      gsap.from(split.lines, {
        yPercent: 105,
        duration: 1,
        ease: "power4.out",
        stagger: 0.1,
        scrollTrigger: {
          trigger: el,
          start: "top 86%",
          toggleActions: "play none none reverse",
        },
      });
    });

    /* ── Section h3 clip reveals ── */
    gsap.utils.toArray(".timeline-anim .scroll-animation").forEach((el) => {
      if (!el) return;
      gsap.from(el, {
        y: "110%",
        duration: 1,
        ease: "power4.out",
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      });
    });

    /* ── Experience2 reveals ── */
    gsap.utils.toArray(".js-exp-reveal").forEach((el, i) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        delay: i * 0.15,
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          toggleActions: "play none none reverse",
        },
      });
    });

    /* ── Stack reveals ── */
    gsap.utils.toArray(".js-stack-reveal").forEach((el, i) => {
      gsap.to(el, {
        opacity: 1,
        x: 0,
        duration: 0.85,
        ease: "power3.out",
        delay: i * 0.1,
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          toggleActions: "play none none reverse",
        },
      });
    });

    /* ═══════════════════════════════════════════════════
           STICKY HEADINGS via ScrollTrigger.pin()
           ─────────────────────────────────────────────────
           FIX: Skip pinning on mobile (< 809px).
           On mobile the Bootstrap cols stack vertically —
           the heading sits above the content naturally.
           Pinning on mobile causes the heading to float
           over the stacked content, which is the bug reported.
        ═══════════════════════════════════════════════════ */
    function pinSectionHeading(pinColId, sectionSel) {
      // ← MOBILE GUARD: no pin below 809px
      if (window.innerWidth < 809) return;

      const pinCol = document.getElementById(pinColId);
      const section = document.querySelector(sectionSel);
      if (!pinCol || !section) return;

      ScrollTrigger.create({
        trigger: section,
        start: "top 120px",
        end: "bottom bottom",
        pin: pinCol,
        pinSpacing: false,
        scrub: false,
      });
    }

    pinSectionHeading("expPinCol", ".experience2-sec");
    pinSectionHeading("stackPinCol", ".favourite-stack-sec");

    /* ── Progress lines — also skip on mobile ── */
    function addProgressLine(sectionSel, headingId) {
      if (window.innerWidth < 809) return; // ← MOBILE GUARD

      const section = document.querySelector(sectionSel);
      const heading = document.getElementById(headingId);
      if (!section || !heading) return;

      const line = document.createElement("div");
      line.style.cssText = [
        "position:absolute",
        "left:-20px",
        "top:0",
        "width:3px",
        "height:0%",
        "background:var(--primary)",
        "will-change:height",
        "pointer-events:none",
        "border-radius:2px",
      ].join(";");
      heading.style.position = "relative";
      heading.appendChild(line);

      ScrollTrigger.create({
        trigger: section,
        start: "top 60%",
        end: "bottom 60%",
        scrub: 0.8,
        onUpdate: (self) => {
          line.style.height = self.progress * 100 + "%";
        },
      });
    }

    addProgressLine(".experience2-sec", "expHeading");
    addProgressLine(".favourite-stack-sec", "stackHeading");

    /* ── Footer clip-reveal
           FIX: Changed start to 'top 90%' so it fires even
           on shorter pages (contact, work) where the footer
           enters the viewport quickly.
        ── */
    const footerText = document.querySelector(".js-footer-text");
    if (footerText) {
      // Reset first in case CSS transform is still at 110%
      gsap.set(footerText, { y: "110%" });
      gsap.to(footerText, {
        y: "0%",
        duration: 1.2,
        ease: "power4.out",
        scrollTrigger: {
          trigger: footerText,
          start: "top 98%", // ← generous threshold for short pages
          toggleActions: "play none none reverse",
        },
      });
    }

    /* ── Jarallax ── */
    if (typeof jarallax !== "undefined") {
      jarallax(document.querySelectorAll(".jarallax"), { speed: 0.6 });
    }

    /* ── Work page filter ── */
    if (document.body.classList.contains("work-page")) {
      const filters = document.querySelectorAll(".work-filter");
      const workCards = document.querySelectorAll(
        ".featured-card[data-category]",
      );

      filters.forEach((btn) => {
        btn.addEventListener("click", () => {
          filters.forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          const target = btn.dataset.filter;
          workCards.forEach((card) => {
            if (target === "all" || card.dataset.category === target) {
              card.classList.remove("is-hidden");
              gsap.fromTo(
                card,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" },
              );
            } else {
              card.classList.add("is-hidden");
            }
          });
        });
      });
    }

    /* ── Legacy data-animation fallback ── */
    scroll_animations();
  } // end initPageAnims

  /* ═══════════════════════════════════════════════════
       7. Popup Menu
    ═══════════════════════════════════════════════════ */
  $(document).on(
    "click",
    ".menu-trigger, .header-right .theme-btn",
    function (e) {
      e.preventDefault();
      $(".popup-menu-wrap").addClass("active");
      // Pause Lenis while menu is open so page doesn't scroll behind it
      lenisPause();
    },
  );
  $(document).on("click", ".popup-menu-close-btn .icon", function () {
    $(".popup-menu-wrap").removeClass("active");
    lenisStart();
  });
  $(document).on("keyup", function (e) {
    if (e.key === "Escape") {
      $(".popup-menu-wrap").removeClass("active");
      lenisStart();
    }
  });

  /* ═══════════════════════════════════════════════════
       8. Real-Time Clock
    ═══════════════════════════════════════════════════ */
  const realtimeEl = document.getElementById("realtime");
  if (realtimeEl) {
    (function tick() {
      const now = new Date();
      realtimeEl.textContent =
        String(now.getHours()).padStart(2, "0") +
        ":" +
        String(now.getMinutes()).padStart(2, "0") +
        ":" +
        String(now.getSeconds()).padStart(2, "0");
      setTimeout(tick, 500);
    })();
  }

  /* ═══════════════════════════════════════════════════
       9. Coordinates
    ═══════════════════════════════════════════════════ */
  const coordEl = document.getElementById("coordinates");
  if (coordEl) {
    fetch(
      "https://api.openweathermap.org/data/2.5/weather?q=Mumbai&appid=1906ccd7aa6d7c3683f1b293ee212f01&units=metric",
    )
      .then((r) => r.json())
      .then((data) => {
        const lat = data.coord.lat;
        const latD = Math.floor(lat);
        const latM = Math.floor((lat - latD) * 60);
        const latS = ((lat - latD) * 60 - latM) * 60;
        coordEl.textContent = `${latD}° ${latM}' ${latS.toFixed(1)}" N`;
      })
      .catch(() => {
        coordEl.textContent = "19° 4' N";
      });
  }

  /* ═══════════════════════════════════════════════════
       10. Experience Popup
    ═══════════════════════════════════════════════════ */
  $(document).on("click", ".experience-box .experience-button", function () {
    $(".experience-popup").addClass("active");
  });
  $(document).on(
    "click",
    ".experience-popup .close-experience-popup-btn",
    function () {
      $(".experience-popup").removeClass("active");
    },
  );

  /* ═══════════════════════════════════════════════════
       11. Custom GSAP Cursor
    ═══════════════════════════════════════════════════ */
  const cursorBall = document.getElementById("ball");
  if (cursorBall) {
    document.addEventListener("mousemove", (e) => {
      gsap.to(cursorBall, {
        duration: 0.25,
        x: e.clientX,
        y: e.clientY,
        opacity: 1,
        ease: "power2.out",
      });
    });
    document
      .querySelectorAll(
        "a, button, .featured-card, .process-step, .favourite-stack-box",
      )
      .forEach((el) => {
        el.addEventListener("mouseenter", () => {
          gsap.to(cursorBall, {
            duration: 0.2,
            scale: 2.5,
            opacity: 0,
            ease: "power2.out",
          });
        });
        el.addEventListener("mouseleave", () => {
          gsap.to(cursorBall, {
            duration: 0.2,
            scale: 1,
            opacity: 1,
            ease: "power2.out",
          });
        });
      });
  }
}); // end jQuery ready

/* ─────────────────────────────────────────────────────
   Legacy scroll_animations
───────────────────────────────────────────────────── */
function scroll_animations() {
  const transWidth = window.innerWidth > 809 ? "10%" : "30%";
  const animations = {
    slide_up: { y: -180 },
    slide_down: { y: 100 },
    slide_up2: { y: -100 },
    slide_down2: { y: 100 },
    fade_from_bottom: { y: 180, opacity: 0 },
    fade_from_top: { y: -180, opacity: 0 },
    fade_from_left: { x: -180, opacity: 0 },
    fade_from_right: { x: 180, opacity: 0 },
    fade_in: { opacity: 0 },
    rotate_up: { y: 180, rotation: 10, opacity: 0 },
    bronx_zoom_out: { scale: 2 },
  };
  gsap.utils.toArray(".scroll-animation").forEach((box) => {
    if (!box) return;
    const animKey = box.dataset.animation || "fade_from_bottom";
    if (!animations[animKey]) return;
    gsap.from(box, {
      ...animations[animKey],
      duration: parseFloat(box.dataset.animationDuration) || 0.9,
      scrollTrigger: {
        trigger: box,
        start: "top bottom+=" + transWidth,
        toggleActions: "play none none reverse",
        markers: false,
      },
    });
  });
}
