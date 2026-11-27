/* Home "Favourite Stack": one idea moving through four tools. */
(() => {
  const root = document.getElementById("fs");
  if (!root) return;
  const tabs = [...root.querySelectorAll(".fs-tool")];
  const panels = [...root.querySelectorAll(".fs-panel")];
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
    }, 4500);
  }

  const toggle = (button, on, label) => {
    button.setAttribute("aria-pressed", on);
    button.textContent = label;
  };

  /* FigJam */
  const flow = root.querySelector(".fs-flow");
  root.querySelector("#fs-connect").addEventListener("click", (e) => {
    const on = flow.classList.toggle("fs-joined");
    toggle(e.currentTarget, on, on ? "Scatter again" : "Connect the flow");
  });

  /* Figma */
  const card = root.querySelector("#fs-design");
  root.querySelectorAll(".fs-props input").forEach((input) => {
    input.addEventListener("input", () => {
      card.style.setProperty(input.dataset.var, input.value + "px");
      input.nextElementSibling.textContent = input.value;
    });
  });

  /* Adobe XD */
  const proto = root.querySelector(".fs-proto");
  proto.querySelector(".fs-card .fs-cta").addEventListener("click", () => proto.classList.add("fs-next"));
  proto.querySelector(".fs-back").addEventListener("click", () => proto.classList.remove("fs-next"));

  /* code */
  const live = root.querySelector("#fs-live");
  const codeColour = root.querySelector("#fs-code-colour");
  const codeLabel = root.querySelector("#fs-code-label");
  const swatches = [...root.querySelectorAll(".fs-swatch")];
  swatches.forEach((s) =>
    s.addEventListener("click", () => {
      live.style.setProperty("--accent", s.dataset.c);
      codeColour.textContent = s.dataset.c;
      swatches.forEach((x) => x.setAttribute("aria-pressed", x === s));
    }),
  );
  root.querySelector("#fs-label").addEventListener("input", (e) => {
    const text = e.target.value.trim() || "Join";
    live.textContent = text;
    codeLabel.textContent = text;
  });
})();
