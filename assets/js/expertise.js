/* Home "My Expertise": layers list + live canvas. */
(() => {
  const root = document.getElementById('xp');
  const layers = [...root.querySelectorAll('.xp-layer')];
  const boards = [...root.querySelectorAll('.xp-board')];
  const chip = document.getElementById('xp-chip');
  /* the section height can change: tell ScrollTrigger so the sections below stay aligned */
  let refreshTimer;
  const refresh = () => {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => window.ScrollTrigger && window.ScrollTrigger.refresh(), 500);
  };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 0, touched = false, visible = false;

  function show(i) {
    current = i;
    refresh();
    layers.forEach((l, n) => { l.classList.toggle('xp-is-on', n === i); l.querySelector('button').setAttribute('aria-expanded', n === i); });
    boards.forEach((b, n) => b.classList.toggle('xp-is-on', n === i));
    chip.innerHTML = `Inspect · <em>${boards[i].dataset.name}</em> · 0${i + 1}/05`;
  }
  const stacked = matchMedia('(max-width: 860px)');
  layers.forEach((l, i) => l.querySelector('button').addEventListener('click', () => {
    touched = true;
    show(i);
    /* on phones the canvas sits under the list: bring it into view */
    if (stacked.matches) root.querySelector('.xp-canvas').scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
  }));

  /* cycles on its own until someone interacts; only while on screen */
  ['pointerdown', 'keydown'].forEach(t => root.addEventListener(t, () => (touched = true)));
  new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: .4 }).observe(root);
  if (!reduce) setInterval(() => { if (visible && !touched && !stacked.matches && !document.hidden) show((current + 1) % layers.length); }, 4200);

  /* 1 app */
  const screens = [
    '<b>HOME</b><div class="xp-tile"></div><div class="xp-bar"></div><div class="xp-bar" style="width:70%"></div><div class="xp-row"><div class="xp-tile"></div><div class="xp-tile"></div></div>',
    '<b>SEARCH</b><div class="xp-bar" style="height:30px"></div>' + '<div class="xp-row"><div class="xp-bar"></div></div>'.repeat(6),
    '<b>PROFILE</b><div class="xp-avatar"></div><div class="xp-bar" style="width:60%"></div><div class="xp-bar"></div><div class="xp-bar" style="height:38px"></div><div class="xp-bar" style="height:38px"></div>'
  ];
  const screen = document.getElementById('xp-screen');
  const tabs = [...root.querySelectorAll('.xp-tabs button')];
  const openTab = i => { screen.innerHTML = screens[i]; tabs.forEach((t, n) => t.setAttribute('aria-selected', n === i)); };
  tabs.forEach((t, i) => t.addEventListener('click', () => openTab(i)));
  openTab(0);

  /* 2 web */
  document.getElementById('xp-vw').addEventListener('input', e => document.getElementById('xp-browser').style.setProperty('--vw', e.target.value));

  /* 3 systems */
  const kit = document.getElementById('xp-kit');
  const swatches = [...root.querySelectorAll('.xp-swatch')];
  swatches.forEach(s => s.addEventListener('click', () => {
    kit.style.setProperty('--accent', s.dataset.c);
    swatches.forEach(x => x.setAttribute('aria-pressed', x === s));
  }));
  document.getElementById('xp-radius').addEventListener('click', e => {
    const on = e.target.getAttribute('aria-pressed') !== 'true';
    e.target.setAttribute('aria-pressed', on);
    kit.style.setProperty('--rad', on ? '18px' : '6px');
  });

  /* 4 research: columns are themes */
  const themes = ['Navigation', 'Trust', 'Speed'];
  const colours = ['#A1DEFC', '#FDFD96', '#FFA2A0'];
  const notes = [
    [0, "Can't find settings", 4, 6, -5], [1, 'Is this secure?', 38, 2, 4], [2, 'Too many steps', 67, 12, -3],
    [2, 'Form takes ages', 10, 34, 6], [0, 'Where is back?', 44, 28, -6], [1, 'Why ask this?', 66, 46, 5],
    [1, 'Who sees my data?', 2, 66, -4], [2, 'Loading again', 34, 58, 3], [0, 'Menu is hidden', 62, 76, -7]
  ];
  const wall = document.getElementById('xp-wall');
  themes.forEach((t, i) => {
    const h = document.createElement('div');
    h.className = 'xp-theme'; h.textContent = t; h.style.left = i * 34.5 + '%';
    wall.appendChild(h);
  });
  const row = [0, 0, 0];
  notes.forEach(([t, text, x, y, r]) => {
    const n = document.createElement('div');
    n.className = 'xp-note'; n.textContent = text;
    n.style.cssText = `--c:${colours[t]};--x:${x}%;--y:${y}%;--r:${r}deg;--sx:${t * 34.5}%;--sy:${32 + row[t]++ * 80}px`;
    wall.appendChild(n);
  });
  document.getElementById('xp-sort').addEventListener('click', e => {
    const on = wall.classList.toggle('xp-sorted');
    e.target.setAttribute('aria-pressed', on);
    e.target.textContent = on ? 'Scatter again' : 'Group the notes';
  });

  /* 5 prototype */
  const frames = [...root.querySelectorAll('.xp-frame')];
  frames.forEach((f, i) => f.querySelector('.xp-hot').addEventListener('click', () => {
    frames.forEach((x, n) => x.classList.toggle('xp-is-on', n === (i + 1) % frames.length));
  }));
})();
