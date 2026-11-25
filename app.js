(function () {
  const TYPES = {
    energy:   { name: 'Energy',         sub: 'sugars, tissue, prey', cls: 't-energy' },
    nitrogen: { name: 'Nitrogen',       sub: 'protein and ammonium', cls: 't-nitrogen' },
    phos:     { name: 'Phosphorus',     sub: 'scarce in many Iberian soils', cls: 't-phos' },
    seeds:    { name: 'Seeds & spores', sub: 'living cargo', cls: 't-seeds' }
  };
  const GROUPS = { plant: 'Plant', fungus: 'Fungus or microbe', invert: 'Invertebrate', bird: 'Bird', mammal: 'Mammal', pool: 'Store or source' };
  const CONF = { E: 'documented', L: 'likely', D: 'debated', U: 'unknown' };
  const svgNS = 'http://www.w3.org/2000/svg';
  const $ = id => document.getElementById(id);
  const el = (tag, attrs, parent) => {
    const e = document.createElementNS(svgNS, tag);
    for (const k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const svg = $('map');
  const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const state = { eco: 0, scn: 'baseline', sel: null, story: 0, types: new Set(Object.keys(TYPES)), showUnk: true,
                  removed: new Set(), motion: !reduced, focus: null, focusLabel: '' };
  let eco, N, edges, nodeEls, gParts, h = {};

  const ecosystems = window.ECOSYSTEMS || [];
  if (!ecosystems.length) { document.body.textContent = 'No ecosystem data found.'; return; }

  /* ---------- build ---------- */
  function build() {
    eco = ecosystems[state.eco]; N = eco.nodes;
    state.sel = null; state.story = 0; state.scn = eco.scenarios[0].id; state.removed.clear(); state.focus = null;
    $('place').textContent = eco.place; $('intro').textContent = eco.intro; $('notes').textContent = eco.omitted || '';
    svg.innerHTML = '';
    const v = eco.view;
    svg.setAttribute('viewBox', `0 0 ${v.w} ${v.h}`);
    el('rect', { x: 0, y: 0, width: v.w, height: v.h, fill: 'var(--sky)' }, svg);
    el('path', { d: `${v.ground} V${v.h} H0 Z`, fill: 'var(--soil)' }, svg);
    el('path', { d: v.ground, fill: 'none', stroke: 'var(--ink)', 'stroke-opacity': .35, 'stroke-width': 1.5 }, svg);
    v.labels.forEach(([t, x, y]) => { el('text', { x, y, class: 'zone-label' }, svg).textContent = t; });
    const defs = el('defs', {}, svg);
    Object.keys(TYPES).forEach(k => {
      const m = el('marker', { id: 'ar-' + k, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 9, markerHeight: 9, markerUnits: 'userSpaceOnUse', orient: 'auto' }, defs);
      el('path', { d: 'M0 1 L9 5 L0 9 z', class: 'mk ' + TYPES[k].cls }, m);
    });
    const gEdges = el('g', {}, svg); gParts = el('g', {}, svg); const gNodes = el('g', {}, svg);

    const seen = {};
    edges = eco.edges.map(([f, t, ty, w, conf, lab, note]) => {
      const a = N[f], b = N[t], pair = f + '>' + t, id = pair + ':' + ty;
      const idx = seen[pair] = (seen[pair] ?? -1) + 1;
      const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
      const sx = a.x + ux * (a.r + 3), sy = a.y + uy * (a.r + 3), ex = b.x - ux * (b.r + 9), ey = b.y - uy * (b.r + 9);
      const bend = len * (0.12 + 0.09 * idx), cx = (sx + ex) / 2 + uy * bend, cy = (sy + ey) / 2 - ux * bend;
      const d = `M${sx.toFixed(1)} ${sy.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
      const g = el('g', { class: `edge ${TYPES[ty].cls} c-${conf}` }, gEdges);
      const ghost = el('path', { d, class: 'ghost', 'stroke-width': baseWidth(w) }, g);
      const line = el('path', { d, class: 'line', 'stroke-width': baseWidth(w), 'marker-end': `url(#ar-${ty})` }, g);
      const hit = el('path', { d, class: 'hit' }, g);
      const o = { id, f, t, ty, w, conf, lab, note, g, ghost, line, len: line.getTotalLength(), on: false, eff: 1, parts: [], model: conf === 'E' || conf === 'L' };
      if (conf === 'D' || conf === 'U') {
        const mid = line.getPointAtLength(o.len / 2);
        o.qm = el('text', { x: mid.x, y: mid.y + 6, class: 'qm' }, g); o.qm.textContent = '?';
      }
      const show = () => { g.classList.add('hover'); readEdge(o); };
      hit.addEventListener('pointerenter', show); hit.addEventListener('click', ev => { ev.stopPropagation(); show(); });
      hit.addEventListener('pointerleave', () => { g.classList.remove('hover'); readDefault(); });
      if (o.model) for (let k = 0; k < Math.ceil(w * 1.3); k++)
        o.parts.push({ k, vis: false, off: Math.random(), c: el('circle', { r: (2.2 + w * 0.35).toFixed(1), class: 'particle ' + TYPES[ty].cls }, gParts) });
      return o;
    });

    nodeEls = {};
    Object.entries(N).forEach(([id, n]) => {
      const g = el('g', { class: 'node' + (n.y > v.soilY ? ' soil' : ''), tabindex: 0, role: 'button', 'aria-label': n.n + ', ' + GROUPS[n.g] }, gNodes);
      const fill = `var(--${n.g})`;
      const body = n.s === 's' ? el('rect', { x: n.x - n.r, y: n.y - n.r, width: n.r * 2, height: n.r * 2, rx: 9, fill, class: 'body' }, g)
                               : el('circle', { cx: n.x, cy: n.y, r: n.r, fill, class: 'body' }, g);
      el('text', { x: n.x, y: n.y + n.r + 18, class: 'lbl' }, g).textContent = n.n;
      const dlt = el('text', { x: n.x, y: n.y + n.r + 35, class: 'dlt' }, g);
      g.addEventListener('click', ev => { ev.stopPropagation(); select(state.sel === id ? null : id); });
      g.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); select(state.sel === id ? null : id); } });
      nodeEls[id] = { g, body, dlt };
    });
    renderControls();
    refresh();
  }
  const baseWidth = w => (0.9 + w * 0.85).toFixed(2);

  /* ---------- scenario model ---------- */
  const scenario = () => eco.scenarios.find(s => s.id === state.scn) || eco.scenarios[0];

  // Each organism's supply index is the weakest of its input types. A type's index is the
  // weighted inflow from documented and likely flows, scaled by the source's own index and
  // any scenario factor, divided by the reference inflow. Debated and unknown flows are excluded.
  function compute() {
    const s = scenario(), ids = Object.keys(N);
    const a0 = {}; ids.forEach(id => { a0[id] = state.removed.has(id) ? 0 : (s.abundance?.[id] ?? 1); });
    const fac = o => s.edges?.[o.id] ?? 1;
    const model = edges.filter(o => o.model), base = {};
    model.forEach(o => { const b = base[o.t] ??= {}; b[o.ty] = (b[o.ty] || 0) + o.w; });
    let cur = {}; ids.forEach(id => { cur[id] = a0[id]; });
    for (let it = 0; it < 40; it++) {
      const next = {};
      ids.forEach(id => {
        const types = base[id];
        if (!types) { next[id] = a0[id]; return; }
        let m = 1;
        for (const ty in types) {
          let sum = 0;
          model.forEach(o => { if (o.t === id && o.ty === ty) sum += o.w * fac(o) * cur[o.f]; });
          m = Math.min(m, Math.min(1, sum / types[ty]));
        }
        next[id] = a0[id] * m;
      });
      cur = next;
    }
    h = cur;
    edges.forEach(o => { o.eff = fac(o) * h[o.f]; });
  }

  /* ---------- state -> view ---------- */
  const stories = () => [...eco.stories, { t: 'Open questions', kind: 'unknown', x: 'Flows we suspect, argue about, or cannot yet measure. They are drawn dashed or dotted, and they stay out of the scenario arithmetic.' }];
  const isBase = () => scenario().id === eco.scenarios[0].id && !state.removed.size;

  function refresh() {
    compute();
    const st = stories()[state.story], cset = st.nodes ? new Set(st.nodes) : null, near = new Set(), ref = isBase();
    edges.forEach(o => {
      const vis = state.types.has(o.ty) && (state.showUnk || o.model) && !state.removed.has(o.f) && !state.removed.has(o.t);
      let hot = true, focused = true;
      if (state.sel) hot = o.f === state.sel || o.t === state.sel;
      else if (state.focus) hot = state.focus.has(o.id);
      else if (st.kind === 'unknown') hot = !o.model;
      else if (cset) hot = cset.has(o.f) && cset.has(o.t);
      focused = state.sel || state.focus || st.kind === 'unknown' || cset;
      o.on = vis && hot;
      o.g.style.display = vis ? '' : 'none';
      o.g.classList.toggle('dim', !hot);
      o.g.classList.toggle('hot', hot && !!focused);
      const live = o.eff >= 0.04;
      o.line.style.display = live ? '' : 'none';
      o.line.setAttribute('stroke-width', baseWidth(Math.min(o.w * o.eff, 6)));
      o.ghost.style.display = !ref && Math.abs(o.eff - 1) > 0.05 ? '' : 'none';
      if (o.qm) o.qm.style.display = live ? '' : 'none';
      o.parts.forEach(p => { p.vis = o.on && live && p.k < o.w * o.eff * 1.3; p.c.style.visibility = p.vis ? 'visible' : 'hidden'; });
      if (vis && hot && state.sel) { near.add(o.f); near.add(o.t); }
    });
    for (const id in N) {
      const { g, body, dlt } = nodeEls[id], hv = h[id], gone = state.removed.has(id);
      let dim = false;
      if (state.sel) dim = id !== state.sel && !near.has(id);
      else if (state.focus) dim = !edges.some(o => state.focus.has(o.id) && (o.f === id || o.t === id));
      else if (st.kind === 'unknown') dim = !edges.some(o => !o.model && (o.f === id || o.t === id));
      else if (cset) dim = !cset.has(id);
      g.classList.toggle('sel', state.sel === id);
      g.classList.toggle('removed', gone);
      g.classList.toggle('low', !gone && hv < 0.6);
      g.classList.toggle('dim', dim && !gone);
      g.setAttribute('aria-pressed', state.sel === id);
      body.setAttribute('fill-opacity', ref ? 1 : (0.35 + 0.65 * Math.min(hv, 1)).toFixed(2));
      const pct = Math.round((hv - 1) * 100);
      dlt.textContent = !ref && !gone && Math.abs(pct) >= 5 ? (pct < 0 ? '▼ ' : '▲ ') + Math.abs(pct) + '%' : '';
    }
    gParts.style.display = state.motion ? '' : 'none';
    renderControls(); renderPanel(); renderStatus();
  }

  function select(id) { state.sel = id; state.focus = null; if (id) state.story = 0; refresh(); }
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { state.focus = null; select(null); } });
  svg.addEventListener('click', () => { state.focus = null; select(null); });

  /* ---------- controls ---------- */
  let controlsFor = null;
  function renderControls() {
    if (controlsFor !== eco) {
      controlsFor = eco;
      // ecosystem select
      $('ecobar').hidden = ecosystems.length < 2;
      $('ecosel').innerHTML = ecosystems.map((e, i) => `<option value="${i}">${e.name}</option>`).join('');
      $('ecosel').value = state.eco;
      // chips
      const chips = $('chips'); chips.querySelectorAll('.chip').forEach(c => c.remove());
      Object.entries(TYPES).forEach(([k, t]) => {
        const b = document.createElement('button'); b.className = 'chip'; b.style.setProperty('--c', `var(--${k})`);
        b.dataset.k = k; b.title = t.sub;
        b.innerHTML = `<span class="sw"></span>${t.name}<span class="n">${edges.filter(e => e.ty === k).length}</span>`;
        b.onclick = () => { state.types.has(k) ? state.types.delete(k) : state.types.add(k); refresh(); };
        chips.appendChild(b);
      });
      const u = document.createElement('button'); u.className = 'chip'; u.id = 'unkchip'; u.style.setProperty('--c', 'var(--muted)');
      u.innerHTML = `<span class="sw"></span>Debated &amp; unknown<span class="n">${edges.filter(e => !e.model).length}</span>`;
      u.onclick = () => { state.showUnk = !state.showUnk; refresh(); };
      chips.appendChild(u);
      // scenarios
      const sb = $('scenarios'); sb.querySelectorAll('.scn').forEach(c => c.remove());
      eco.scenarios.forEach(s => {
        const b = document.createElement('button'); b.className = 'scn'; b.textContent = s.name; b.dataset.id = s.id;
        b.onclick = () => { state.scn = s.id; state.sel = null; state.focus = null; state.removed.clear(); refresh(); };
        sb.appendChild(b);
      });
      // stories
      const cb = $('chapters'); cb.querySelectorAll('.chap').forEach(c => c.remove());
      stories().forEach((c, i) => {
        const b = document.createElement('button'); b.className = 'chap'; b.textContent = c.t;
        b.onclick = () => { state.story = i; state.sel = null; state.focus = null; refresh(); };
        cb.appendChild(b);
      });
    }
    $('chips').querySelectorAll('.chip[data-k]').forEach(b => b.setAttribute('aria-pressed', state.types.has(b.dataset.k)));
    $('unkchip').setAttribute('aria-pressed', state.showUnk);
    $('scenarios').querySelectorAll('.scn').forEach(b => b.setAttribute('aria-pressed', b.dataset.id === state.scn));
    $('chapters').querySelectorAll('.chap').forEach((b, i) => b.setAttribute('aria-pressed', state.story === i && !state.sel && !state.focus));
    $('motion').setAttribute('aria-pressed', state.motion); $('motion').textContent = state.motion ? 'Motion on' : 'Motion off';
  }
  $('motion').onclick = () => { state.motion = !state.motion; refresh(); };
  $('ecosel').onchange = e => { state.eco = +e.target.value; controlsFor = null; build(); };

  /* ---------- readouts and panel ---------- */
  function readDefault() { $('readout').innerHTML = 'Hover or tap a flow to read it. Click an organism to follow what it takes in and gives out.'; }
  function readEdge(o) {
    $('readout').innerHTML = `<b>${N[o.f].n} → ${N[o.t].n}</b> · ${TYPES[o.ty].name.toLowerCase()} · ${o.lab} · <b>${CONF[o.conf]}</b>${o.note ? '<br>' + o.note : ''}`;
  }
  const sw = k => `<span class="sw" style="--c:var(--${k})"></span>`;
  const cf = c => `<span class="cf">${CONF[c]}</span>`;
  const pctText = v => { const p = Math.round((v - 1) * 100); return (p < 0 ? '▼ ' : '▲ ') + Math.abs(p) + '%'; };

  function rowsFor(list, dir) {
    if (!list.length) return '<p class="tag">Nothing on the flows currently shown</p>';
    return '<ul class="rows">' + list.map(o => {
      const other = dir === 'in' ? o.f : o.t;
      return `<li><button class="row" data-id="${other}">${sw(o.ty)}<span class="who">${dir === 'in' ? 'From' : 'To'} ${N[other].n}</span><span class="what">${cf(o.conf)}${o.lab}</span></button></li>`;
    }).join('') + '</ul>';
  }

  function renderPanel() {
    const p = $('panel'), s = scenario();
    if (state.sel) {
      const id = state.sel, n = N[id];
      const ok = o => state.types.has(o.ty) && (state.showUnk || o.model) && !state.removed.has(o.f) && !state.removed.has(o.t);
      const ins = edges.filter(o => o.t === id && ok(o)), outs = edges.filter(o => o.f === id && ok(o));
      const hv = h[id], moved = !isBase() && Math.abs(hv - 1) >= 0.05;
      p.innerHTML = `<p class="tag">${GROUPS[n.g]}</p><h2>${n.n}</h2><p>${n.d}</p>
        ${moved ? `<p><b>${pctText(hv)}</b> against the reference state in this scenario.</p>` : ''}
        <h3>Takes in</h3>${rowsFor(ins, 'in')}<h3>Gives out</h3>${rowsFor(outs, 'out')}
        <button class="btn" id="rm">${state.removed.has(id) ? 'Restore ' + n.n : 'Remove ' + n.n + ' from the map'}</button>`;
      $('rm').onclick = () => { state.removed.has(id) ? state.removed.delete(id) : state.removed.add(id); refresh(); };
    } else {
      const st = stories()[state.story];
      let html = `<p class="tag">Story</p><h2>${st.t}</h2><p>${st.x}</p>`;
      if (st.kind === 'unknown') {
        html += '<ul class="rows">' + eco.unknowns.map((u, i) => `<li><button class="row" data-u="${i}"><span></span><span class="who">${u.t}</span><span class="what">${u.x}</span></button></li>`).join('') + '</ul>';
      }
      if (s.id !== eco.scenarios[0].id) {
        const hit = Object.keys(N).filter(id => !state.removed.has(id) && Math.abs(h[id] - 1) >= 0.05).sort((a, b) => Math.abs(h[b] - 1) - Math.abs(h[a] - 1)).slice(0, 6);
        html += `<h3>Scenario</h3><h2 style="font-size:1.2rem">${s.name}</h2><p>${s.summary}</p>
          <h3>What this assumes</h3><ul class="plain">${s.changes.map(([c, t]) => `<li>${cf(c)}${t}</li>`).join('')}</ul>
          <h3>Most affected</h3>${hit.length ? '<ul class="rows">' + hit.map(id => `<li><button class="row" data-id="${id}"><span></span><span class="who">${N[id].n}</span><span class="what">${pctText(h[id])} supply index</span></button></li>`).join('') + '</ul>' : '<p class="tag">No organism moves by 5% or more</p>'}
          <h3>What we do not know</h3><ul class="plain">${s.unknowns.map(t => `<li>${t}</li>`).join('')}</ul>`;
      } else if (state.story === 0) {
        html += `<h3>Reference state</h3><p>${s.summary}</p><p class="tag">Pick a scenario above to change the flows</p>`;
      }
      p.innerHTML = html;
      p.querySelectorAll('[data-u]').forEach(b => b.onclick = () => {
        const u = eco.unknowns[+b.dataset.u]; state.focus = new Set(u.edges); state.sel = null; refresh();
      });
    }
    p.querySelectorAll('[data-id]').forEach(b => b.onclick = () => select(b.dataset.id));
  }

  function renderStatus() {
    const s = $('status');
    if (!state.removed.size) { s.hidden = true; return; }
    const rem = [...state.removed].map(i => N[i].n).join(', ');
    const low = Object.keys(N).filter(id => !state.removed.has(id) && h[id] < 0.6).map(id => `${N[id].n} (${pctText(h[id])})`);
    s.hidden = false;
    s.innerHTML = `<span><b>Removed:</b> ${rem}.</span><span><b>Short of supply:</b> ${low.length ? low.join('; ') : 'nobody. The map has other routes.'}</span><button class="btn" id="restore">Restore everything</button>`;
    $('restore').onclick = () => { state.removed.clear(); refresh(); };
  }

  /* ---------- flow particles ---------- */
  function frame(t) {
    if (state.motion && !document.hidden) {
      for (const o of edges) {
        for (const p of o.parts) {
          if (!p.vis) continue;
          const k = (t * (0.00005 + o.w * 0.000012) + p.off) % 1, pt = o.line.getPointAtLength(k * o.len);
          p.c.setAttribute('cx', pt.x.toFixed(1)); p.c.setAttribute('cy', pt.y.toFixed(1));
        }
      }
    }
    requestAnimationFrame(frame);
  }

  readDefault();
  build();
  requestAnimationFrame(frame);
})();
