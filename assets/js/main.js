/**
 * ================================================================
 *  MAIN.JS — UX//RAW Portfolio  v5
 *
 *  FIXES in this version:
 *   • .scaleDown warning — themescroll.js removed from HTML;
 *     any needed scroll effects absorbed here
 *   • Empty GSAP target warnings — all selectors guarded with
 *     element existence checks before animating
 *   • Sticky heading broken inside ScrollSmoother — replaced
 *     CSS position:sticky with GSAP ScrollTrigger.pin() which
 *     works correctly inside transform-based scroll containers
 *   • Bootstrap col-lg-5/col-lg-7 structure used for layout;
 *     custom sticky-sec-wrap/sticky-col/scroll-col removed
 * ================================================================
 */

$(function () {
  /* ═══════════════════════════════════════════════════
       1. GSAP Plugin Registration
    ═══════════════════════════════════════════════════ */
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, ScrollToPlugin, SplitText);

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
       3. UX//RAW Preloader — CMH split-panel wipe
    ═══════════════════════════════════════════════════ */
  let marqueeTween = null;

  (function initPreloader() {
    const preloader = document.getElementById("uxrPreloader");
    if (!preloader) {
      unlockScroll();
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
       4. ScrollSmoother — single instance for the whole page
          Exposed as window.uxrSmoother so themescroll.js
          can reference it without creating a second instance.
    ═══════════════════════════════════════════════════ */
  const smoother = ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    smooth: 1.4,
    effects: true,
    normalizeScroll: true,
  });
  window.uxrSmoother = smoother; // expose globally

  const btt = document.querySelector("#back-to-top");
  if (btt) {
    btt.addEventListener("click", () => {
      gsap.to(smoother, { scrollTop: 0, duration: 1.2, ease: "power3.inOut" });
    });
  }

  /* ═══════════════════════════════════════════════════
       5. Hero entrance
    ═══════════════════════════════════════════════════ */
  function initHeroAnims() {
    // Guard — hero-line-inner may not exist on non-home pages
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

    // Guard — hero-anim-item / hero-footer-wrap
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

    // Guard — header
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
       6. Page animations (fired after preloader)
    ═══════════════════════════════════════════════════ */
  function initPageAnims() {
    initHeroAnims();

    /* ── Marquee ──
           Store tween ref → use gsap.to(tween, {timeScale}) NOT
           gsap.to(domEl, {timeScale}) which causes GSAP warnings
        ── */
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
            // Tween the GSAP tween object — not the DOM element
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

    /* ── Featured / Expertise card reveals — stagger per row ── */
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

    /* ── .js-split-reveal — guarded SplitText clip ── */
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

    /* ── Section header h3 clip reveals ── */
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
           WHY NOT CSS position:sticky?
           ScrollSmoother moves #smooth-content using
           transform:translateY() — the browser's layout engine
           never sees a real scrollTop change on any ancestor,
           so position:sticky has nothing to hook onto and
           the heading scrolls away normally.

           ScrollTrigger.pin() works because it listens to
           ScrollSmoother's virtual scroll position and uses
           GSAP transforms to hold the element in place —
           exactly the same mechanism ScrollSmoother itself uses.

           HOW IT WORKS:
           • pin: true — GSAP holds #expPinCol in place
           • pinSpacing: false — the section keeps its natural
             height (no extra spacer div added)
           • start: "top 120px" — pin starts when col-lg-5 top
             reaches 120px from viewport top (below header)
           • end: "bottom bottom" — pin releases when the
             section bottom reaches the viewport bottom
        ═══════════════════════════════════════════════════ */
    function pinSectionHeading(pinColId, sectionSel) {
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

    /* ── Sticky progress lines ──
           Injected inside the heading, animates via scrub
        ── */
    function addProgressLine(sectionSel, headingId) {
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

    /* ── Footer clip-reveal ── */
    const footerText = document.querySelector(".js-footer-text");
    if (footerText) {
      gsap.to(footerText, {
        y: "0%",
        duration: 1.2,
        ease: "power4.out",
        scrollTrigger: {
          trigger: footerText,
          start: "top 92%",
          toggleActions: "play none none reverse",
        },
      });
    }

    /* ── Jarallax ── */
    if (typeof jarallax !== "undefined") {
      jarallax(document.querySelectorAll(".jarallax"), { speed: 0.6 });
    }

    /* ── Work page filter ──
           Fires only on .work-page body class.
           Toggles .is-hidden on cards by data-category.
           Relies on CSS display:none for .is-hidden.
        ── */
    if (document.body.classList.contains("work-page")) {
      const filters = document.querySelectorAll(".work-filter");
      const workCards = document.querySelectorAll(
        ".featured-card[data-category]",
      );

      filters.forEach((btn) => {
        btn.addEventListener("click", () => {
          // Update active state
          filters.forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");

          const target = btn.dataset.filter;

          workCards.forEach((card) => {
            if (target === "all" || card.dataset.category === target) {
              card.classList.remove("is-hidden");
              // Re-animate revealed cards
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
    },
  );
  $(document).on("click", ".popup-menu-close-btn .icon", function () {
    $(".popup-menu-wrap").removeClass("active");
  });
  $(document).on("keyup", function (e) {
    if (e.key === "Escape") $(".popup-menu-wrap").removeClass("active");
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
       9. Coordinates (Weather API)
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
   Legacy scroll_animations — data-animation fallback
   (guards added: skips unknown animKey silently)
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
    if (!animations[animKey]) return; // silently skip unknown keys (e.g. scaleDown)
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
