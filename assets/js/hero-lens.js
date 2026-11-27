/* Home hero "inspect lens". Starts when main.js fires "uxr:hero" (after the preloader). */
(() => {
  const hero = document.getElementById("lhHero");
  if (!hero) return;
  const base = hero.querySelector(".lh-base");
  const lens = hero.querySelector(".lh-lens");
  const ring = hero.querySelector(".lh-ring");
  const chip = hero.querySelector(".lh-chip");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const MODES = ["think", "design", "build"];

  /* split the real headline into letters */
  base.querySelectorAll(".lh-line").forEach((line) => {
    const chars = [...line.textContent];
    line.textContent = "";
    chars.forEach((c) => {
      const ch = document.createElement("span");
      ch.className = "lh-ch";
      const inner = document.createElement("span");
      inner.textContent = c;
      ch.appendChild(inner);
      line.appendChild(ch);
    });
  });

  /* the lens layer is a copy of the scene; its heading becomes a div so the page keeps one h1 */
  const copy = base.firstElementChild.cloneNode(true);
  const h1 = copy.querySelector("h1");
  const div = document.createElement("div");
  div.className = h1.className;
  div.innerHTML = h1.innerHTML;
  h1.replaceWith(div);
  copy.querySelectorAll("button").forEach((b) => (b.tabIndex = -1));
  lens.appendChild(copy);

  const letters = [base, lens].map((root) => [...root.querySelectorAll(".lh-ch")]);
  const N = letters[0].length;
  const sel = lens.querySelector(".lh-sel");
  const guides = lens.querySelector(".lh-guides");

  const LABEL = { think: "01 / THINK · sketch first", design: "02 / DESIGN · every color has a job", build: '03 / BUILD · <h1 class="hero">' };
  const SHORT = { think: "01 THINK", design: "02 DESIGN", build: "03 BUILD" };

  let W = 0, H = 0, rest = [], hlBox = null, dim = "";
  let mode = hero.dataset.mode, chosen = false, moved = false, pulse = 0, lastChip = 0;
  let started = false, visible = true, raf = 0;
  const P = letters[0].map(() => ({ x: 0, y: 0, vx: 0, vy: 0, r: 0, vr: 0 }));
  const ptr = { x: 0, y: 0 }, L = { x: 0, y: 0, r: 0 };

  const labelSel = () => {
    sel.dataset.dim = `${innerWidth > 720 ? LABEL[mode] : SHORT[mode]} · ${dim}`;
  };

  /* cap / baseline guides for DESIGN mode */
  function buildGuides() {
    guides.innerHTML = "";
    const hr = hero.getBoundingClientRect();
    base.querySelectorAll(".lh-line").forEach((line, i) => {
      const r = line.getBoundingClientRect();
      [["CAP", r.top + r.height * 0.08], ["BASE", r.bottom - r.height * 0.06]].forEach(([label, y]) => {
        const e = document.createElement("i");
        e.dataset.l = `${label} · L${i + 1}`;
        e.style.top = y - hr.top + "px";
        guides.appendChild(e);
      });
    });
  }

  /* geometry cache: resting centre of each letter, relative to the hero */
  function measure() {
    letters.forEach((set) => set.forEach((el) => (el.style.transform = "none")));
    const hr = hero.getBoundingClientRect();
    W = hr.width;
    H = hr.height;
    rest = letters[0].map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left - hr.left + r.width / 2, y: r.top - hr.top + r.height / 2 };
    });
    const r = base.querySelector(".lh-hl").getBoundingClientRect();
    hlBox = { l: r.left - hr.left, t: r.top - hr.top, r: r.right - hr.left, b: r.bottom - hr.top };
    dim = `${Math.round(r.width)}×${Math.round(r.height)}`;
    labelSel();
    buildGuides();
  }

  function setMode(m, user) {
    if (user) chosen = true;
    if (m === mode) return;
    mode = m;
    hero.dataset.mode = m;
    labelSel();
  }

  base.querySelectorAll(".lh-word").forEach((b) => {
    b.addEventListener("pointerenter", (e) => {
      if (e.pointerType === "mouse") setMode(b.dataset.m, true);
    });
    b.addEventListener("click", () => setMode(b.dataset.m, true));
  });

  function local(e) {
    const r = hero.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  hero.addEventListener("pointermove", (e) => {
    Object.assign(ptr, local(e));
    moved = true;
  });
  hero.addEventListener("pointerdown", (e) => {
    Object.assign(ptr, local(e));
    moved = true;
    pulse = 1;
  });
  hero.addEventListener("pointerenter", (e) => {
    if (e.pointerType === "mouse") document.body.classList.add("lh-over");
  });
  hero.addEventListener("pointerleave", (e) => {
    document.body.classList.remove("lh-over");
    if (e.pointerType === "mouse") moved = false;
  });

  const baseR = () => Math.max(96, Math.min(200, Math.min(W, H) * 0.27));

  function frame(t) {
    const R = baseR();
    let tx, ty;
    if (moved) {
      tx = ptr.x;
      ty = ptr.y;
    } else if (reduce) {
      tx = W / 2;
      ty = H / 2;
    } else {
      tx = W / 2 + Math.cos(t * 0.0005) * W * 0.26;
      ty = H * 0.5 + Math.sin(t * 0.0008) * H * 0.16;
    }
    const k = reduce ? 1 : 0.16;
    L.x += (tx - L.x) * k;
    L.y += (ty - L.y) * k;
    const overHl = hlBox && L.x > hlBox.l && L.x < hlBox.r && L.y > hlBox.t && L.y < hlBox.b;
    const target = R * (overHl ? 1.12 : 1) + pulse * 46;
    L.r += (target - L.r) * 0.14;
    pulse *= 0.92;

    hero.style.setProperty("--lx", L.x + "px");
    hero.style.setProperty("--ly", L.y + "px");
    hero.style.setProperty("--lr", Math.max(0, L.r) + "px");
    ring.style.width = ring.style.height = L.r * 2 + "px";
    ring.style.transform = `translate3d(${L.x - L.r - 2}px,${L.y - L.r - 2}px,0)`;

    /* letters push away from the lens */
    if (!reduce) {
      const reach = L.r * 1.6 || 1;
      for (let i = 0; i < N; i++) {
        const c = rest[i], p = P[i];
        const dx = c.x - L.x, dy = c.y - L.y, d = Math.hypot(dx, dy) || 1;
        const f = Math.max(0, 1 - d / reach);
        const push = f * f * (30 + pulse * 60);
        p.vx += ((dx / d) * push - p.x) * 0.12;
        p.vy += ((dy / d) * push * 0.6 - p.y) * 0.12;
        p.vr += ((dx / reach) * f * 5 - p.r) * 0.12;
        p.vx *= 0.76;
        p.vy *= 0.76;
        p.vr *= 0.76;
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        const s = `translate3d(${p.x.toFixed(2)}px,${p.y.toFixed(2)}px,0) rotate(${p.r.toFixed(2)}deg)`;
        letters[0][i].style.transform = s;
        letters[1][i].style.transform = s;
      }
    }

    ring.classList.toggle("below", L.y - L.r < 44);
    if (t - lastChip > 60) {
      lastChip = t;
      chip.innerHTML = `Inspect · <em>${mode}</em> · X ${String(Math.round(L.x)).padStart(4, "0")} Y ${String(Math.round(L.y)).padStart(4, "0")}`;
    }
    raf = visible ? requestAnimationFrame(frame) : 0;
  }

  /* letters rise, then the mask is released so the physics is not clipped */
  function intro() {
    if (!reduce) {
      letters.forEach((set) =>
        set.forEach((ch, i) =>
          ch.firstChild.animate([{ transform: "translateY(108%)" }, { transform: "translateY(0)" }], {
            duration: 900,
            delay: 100 + i * 55,
            easing: "cubic-bezier(.2,.8,.2,1)",
            fill: "backwards",
          }),
        ),
      );
    }
    setTimeout(() => hero.classList.remove("is-intro"), reduce ? 0 : 1600);
  }

  function start() {
    if (started) return;
    started = true;
    measure();
    L.x = W / 2;
    L.y = H / 2;
    pulse = 0.8;
    intro();
    raf = requestAnimationFrame(frame);
    if (!reduce) {
      setInterval(() => {
        if (!chosen && visible && !document.hidden) setMode(MODES[(MODES.indexOf(mode) + 1) % 3]);
      }, 3400);
    }
    /* web fonts load asynchronously: measure again once the headline font is in */
    if (document.fonts) document.fonts.load('100px "Bebas Neue"').then(measure);
  }

  /* stop animating while the hero is scrolled out of view */
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && started && !raf) raf = requestAnimationFrame(frame);
  }).observe(hero);

  let resizeTimer;
  addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => started && measure(), 120);
  });

  if (window.__uxrHeroReady) start();
  else document.addEventListener("uxr:hero", start, { once: true });
})();
