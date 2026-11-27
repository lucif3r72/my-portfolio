/* Home "Favourite Stack": one idea moving through four tools. */
(() => {
  const root = document.getElementById("fs");
  if (!root) return;
  const $ = (s) => root.querySelector(s);
  const $$ = (s) => [...root.querySelectorAll(s)];
  const tabs = $$(".fs-tool");
  const panels = $$(".fs-panel");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stacked = matchMedia("(max-width: 860px)");
  let current = 0, touched = false, visible = false;

  function show(i) {
    current = i;
    tabs.forEach((t, n) => {
      t.setAttribute("aria-selected", n === i);
      t.tabIndex = n === i ? 0 : -1;
    });
    panels.forEach((p, n) => p.classList.toggle("fs-on", n === i));
  }

  tabs.forEach((t, i) => {
    t.addEventListener("click", () => {
      touched = true;
      show(i);
      /* stacked panels differ in height: keep the pinned sections below aligned */
      if (stacked.matches) setTimeout(() => window.ScrollTrigger && window.ScrollTrigger.refresh(), 100);
    });
    t.addEventListener("keydown", (e) => {
      const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!step) return;
      e.preventDefault();
      const next = (i + step + tabs.length) % tabs.length;
      show(next);
      tabs[next].focus();
    });
  });

  /* moves along the process on its own until someone interacts; desktop only, only while on screen */
  ["pointerdown", "keydown"].forEach((type) => root.addEventListener(type, () => (touched = true)));
  new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.35 }).observe(root);
  if (!reduce) {
    setInterval(() => {
      if (visible && !touched && !stacked.matches && !document.hidden) show((current + 1) % tabs.length);
    }, 5000);
  }

  /* 1 FigJam: connect the journey, vote on notes */
  const board = $(".fs-board");
  $("#fs-connect").addEventListener("click", (e) => {
    const on = board.classList.toggle("fs-joined");
    e.currentTarget.setAttribute("aria-pressed", on);
    e.currentTarget.textContent = on ? "Disconnect" : "Connect journey";
  });
  $$(".fs-sticky").forEach((note) =>
    note.addEventListener("click", () => {
      const votes = note.querySelector(".fs-votes");
      if (votes.children.length >= 5) votes.innerHTML = "";
      else votes.appendChild(document.createElement("i"));
    }),
  );

  /* 2 Figma: pick a layer, change fill and radius */
  const screen = $(".fs-screen");
  const layerButtons = $$(".fs-layer-btn");
  const pick = (name) => {
    $$(".fs-screen [data-layer]").forEach((el) => el.classList.toggle("fs-pick", el.dataset.layer === name));
    layerButtons.forEach((b) => b.setAttribute("aria-pressed", b.dataset.pick === name));
  };
  layerButtons.forEach((b) => b.addEventListener("click", () => pick(b.dataset.pick)));
  $$(".fs-screen [data-layer]").forEach((el) => el.addEventListener("click", () => pick(el.dataset.layer)));
  const fills = $$(".fs-fill");
  fills.forEach((s) =>
    s.addEventListener("click", () => {
      screen.style.setProperty("--accent", s.dataset.c);
      fills.forEach((x) => x.setAttribute("aria-pressed", x === s));
    }),
  );
  $("#fs-rad").addEventListener("input", (e) => {
    screen.style.setProperty("--rad", e.target.value + "px");
    $("#fs-rad-out").textContent = e.target.value;
  });

  /* 3 Adobe XD: tap the hotspot to follow the wire */
  const boards = $$(".fs-ab");
  const wires = $$(".fs-wire");
  const dots = $$(".fs-dots i");
  const goTo = (i) => {
    boards.forEach((b, n) => {
      b.classList.toggle("fs-active", n === i);
      b.querySelector(".fs-hot").tabIndex = n === i ? 0 : -1;
    });
    wires.forEach((w, n) => w.classList.toggle("fs-live", n < i));
    dots.forEach((d, n) => d.classList.toggle("fs-active", n === i));
  };
  boards.forEach((b, i) =>
    b.querySelector(".fs-hot").addEventListener("click", () => {
      const next = (i + 1) % boards.length;
      goTo(next);
      boards[next].querySelector(".fs-hot").focus({ preventScroll: true });
    }),
  );

  /* 4 code: the preview and the code stay in step */
  const fileTabs = $$(".fs-file-tab");
  const files = $$(".fs-code");
  const openFile = (i) => {
    fileTabs.forEach((t, n) => t.setAttribute("aria-selected", n === i));
    files.forEach((f, n) => f.classList.toggle("fs-show", n === i));
  };
  fileTabs.forEach((t, i) => t.addEventListener("click", () => openFile(i)));
  let cups = 1;
  const extra = $("#fs-extra");
  const update = () => {
    $("#fs-cups").textContent = cups;
    $("#fs-code-cups").textContent = cups;
    $("#fs-code-extra").textContent = extra.checked;
    $("#fs-total").textContent = `Order ${cups} ${cups === 1 ? "cup" : "cups"}${extra.checked ? " + shot" : ""}`;
  };
  $("#fs-minus").addEventListener("click", () => { cups = Math.max(1, cups - 1); openFile(0); update(); });
  $("#fs-plus").addEventListener("click", () => { cups = Math.min(9, cups + 1); openFile(0); update(); });
  extra.addEventListener("change", () => { openFile(0); update(); });
  const accents = $$(".fs-accent");
  accents.forEach((s) =>
    s.addEventListener("click", () => {
      $(".fs-preview").style.setProperty("--accent", s.dataset.c);
      $("#fs-code-accent").textContent = s.dataset.c;
      openFile(1);
      accents.forEach((x) => x.setAttribute("aria-pressed", x === s));
    }),
  );
})();
