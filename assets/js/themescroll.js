/**
 * themescroll.js — UX//RAW Portfolio
 *
 * CHANGES FROM ORIGINAL:
 *  1. ScrollSmoother.create() REMOVED — main.js owns the single smoother
 *     instance. Two smoothers on the same page fight each other.
 *  2. gsap.registerPlugin() REMOVED — already called in main.js.
 *  3. .scaleDown animation REMOVED — full-image-sec no longer exists in
 *     the HTML (replaced by process-sec). Querying a missing class causes
 *     "GSAP target .scaleDown not found" on every scroll event.
 *  4. #back-to-top scroll-to handled by main.js via ScrollToPlugin —
 *     removed the duplicate listener here to avoid double-firing.
 *  5. gsap.config({ trialWarn: false }) kept — suppresses trial warnings.
 *  6. console.clear() REMOVED — makes debugging harder.
 *  7. All sticky pin logic (stickyEls, stickyEls2, stickyEls3, stickyEls4,
 *     ShowcaseOverlapping) kept exactly as original — these drive the
 *     About section sticky title and any other sticky-statement elements.
 */

$(function () {
  gsap.config({ trialWarn: false });

  /* ── Sticky Elements ── */
  const stickyEls = document.querySelectorAll(".sticky-statement");
  const stickyEls3 = document.querySelectorAll(".sticky-statement3");
  const stickyEls4 = document.querySelectorAll(".sticky-statement4");
  const isMobile = () => window.innerWidth < 809;

  stickyEls.forEach((panel) => {
    gsap.to(panel, {
      y: () =>
        panel.offsetHeight < window.innerHeight
          ? 0
          : -(panel.offsetHeight - window.innerHeight),
      ease: "none",
      scrollTrigger: {
        trigger: panel,
        start: () =>
          panel.offsetHeight < window.innerHeight ? "top 10%" : "bottom bottom",
        end: () =>
          panel.offsetHeight < window.innerHeight
            ? "bottom 90%"
            : "bottom bottom",
        scrub: true,
        pin: !isMobile(),
        pinSpacing: false,
        invalidateOnRefresh: true,
      },
    });
  });

  stickyEls.forEach((element) => {
    ScrollTrigger.create({
      trigger: element,
      pin: !isMobile(),
      start: "top top+=100",
      end: "+=700",
      markers: false,
    });
  });

  stickyEls3.forEach((element) => {
    ScrollTrigger.create({
      trigger: element,
      pin: !isMobile(),
      start: "top top+=100",
      end: "+=700",
      markers: false,
    });
  });

  stickyEls4.forEach((element) => {
    ScrollTrigger.create({
      trigger: element,
      pin: !isMobile(),
      start: "top top+=100",
      end: "+=1200",
      markers: false,
    });
  });

  /* ── About section title sticky (ShowcaseOverlapping) ── */
  function ShowcaseOverlapping() {
    gsap.utils.toArray(".about-sec").forEach((pinnedSection) => {
      const transformTextsAnim =
        pinnedSection.querySelectorAll(".sticky-statement2");

      function setImagesProperties() {
        gsap.set(transformTextsAnim, { height: window.innerHeight });
      }

      setImagesProperties();
      window.addEventListener("resize", setImagesProperties);

      transformTextsAnim.forEach((transformTextAnim, i, arr) => {
        const durationMultiplier = arr.length - i - 1;

        ScrollTrigger.create({
          trigger: transformTextAnim,
          start: function () {
            const centerPin =
              (window.innerHeight - transformTextAnim.offsetHeight) / 2;
            return "top +=" + centerPin;
          },
          end: function () {
            const durationHeight =
              transformTextAnim.offsetHeight * durationMultiplier +
              (transformTextAnim.offsetHeight -
                transformTextAnim.offsetHeight) /
                2;
            return "+=" + durationHeight;
          },
          pin: true,
          pinSpacing: false,
          scrub: true,
        });

        const animationProperties = {
          y: 500,
          scale: 0.65,
          opacity: 0,
          zIndex: 0,
          duration: 0.05,
          ease: 0.05,
        };

        ScrollTrigger.create({
          trigger: transformTextAnim,
          start: function () {
            return "top top";
          },
          end: function () {
            const durationHeight =
              transformTextAnim.offsetHeight +
              (transformTextAnim.offsetHeight -
                transformTextAnim.offsetHeight) /
                2;
            return "+=" + durationHeight;
          },
          scrub: true,
          animation: gsap.to(transformTextAnim, animationProperties),
        });
      });
    });
  }

  if (!isMobile()) {
    ShowcaseOverlapping();
  }
});
