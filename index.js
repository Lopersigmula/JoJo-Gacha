import { createAnimations } from './animations.js';
(() => {
  const MODULE = 'jojo_stands';
  const PROMPT_KEY = 'jojo_stands_prompt';
  const RV = { A: 5, B: 4, C: 3, D: 2, E: 1 };
  const STATS = [['power', 'Сила'], ['speed', 'Скорость'], ['range', 'Дальность'], ['durability', 'Стойкость'], ['precision', 'Точность'], ['potential', 'Потенциал']];
  const TYPES = ['Ближнего боя', 'Дальнего действия', 'Автоматический', 'Привязанный к предмету', 'Колония', 'Стационарный', 'Симбиотический'];
  const ICON = { 'Ближнего боя': '👊', 'Дальнего действия': '🎯', 'Автоматический': '🤖', 'Привязанный к предмету': '📕', 'Колония': '🐦', 'Стационарный': '🏛️', 'Симбиотический': '🧬' };
  const ORDER = ['common', 'rare', 'epic', 'legendary'];
  const RAR = { common: { label: 'Обычный', color: '#9ca3af' }, rare: { label: 'Редкий', color: '#38bdf8' }, epic: { label: 'Эпический', color: '#c084fc' }, legendary: { label: 'Легендарный', color: '#fbbf24' } };
  // веса рангов [A,B,C,D,E] по редкости
  const RANK_W = { common: [0, 5, 30, 35, 30], rare: [3, 20, 40, 27, 10], epic: [15, 35, 35, 12, 3], legendary: [40, 40, 15, 5, 0] };

  // Пул стендов лежит в папке расширения: stands.json (редактируется вручную).
  let POOL = [];
  let poolError = '';
  const BASE = (() => { try { return new URL('.', import.meta.url).href; } catch (e) { return ''; } })();
  function notify(type, msg) {
    const d = document.getElementById('jg_overlay');
    if (d && d.open) {
      const t = $(`<div class="jg-toast jg-toast-${type}">${esc(msg)}</div>`);
      $(d).find('.jg-modal').append(t);
      setTimeout(() => t.fadeOut(300, () => t.remove()), 2600);
    } else toastr[type](msg);
  }
  function normType(t) {
    t = String(t || '').trim();
    if (TYPES.includes(t)) return t;
    const l = t.toLowerCase().slice(0, 5);
    return (l && TYPES.find((x) => x.toLowerCase().startsWith(l))) || TYPES[0];
  }
  const PART_NAMES = ['Phantom Blood', 'Battle Tendency', 'Stardust Crusaders', 'Diamond is Unbreakable', 'Golden Wind', 'Stone Ocean', 'Steel Ball Run', 'JoJolion', 'The JOJOLands'];
  const canonPart = (x) => { const t = String(x || '').trim(); if (!t) return 'Другие'; const k = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, ''); return PART_NAMES.find((n) => k(n) === k(t)) || t; };
  // путь к картинке относительно папки расширения (img/...) превращаем в адрес, который понимает браузер
  function resolveIcon(ic) {
    ic = String(ic || '').trim();
    if (!ic || /^(https?:)?\/\/|^\/|^data:/i.test(ic)) return ic;
    try { return new URL(ic, BASE).pathname; } catch (e) { return ic; }
  }
  function normStand(p) {
    if (!p || !p.name || !ORDER.includes(p.rarity)) return null;
    const stats = {};
    STATS.forEach(([k]) => { const v = String(p.stats?.[k] ?? 'C').toUpperCase(); stats[k] = RV[v] ? v : 'C'; });
    return { id: String(p.id || p.name), name: String(p.name), rarity: p.rarity, type: String(p.type || '').trim() || TYPES[0], icon: resolveIcon(p.icon), part: canonPart(p.part), stats, ability: p.ability || '', limits: p.limits || '', personality: p.personality || '' };
  }
  // Стенды из stands.json нельзя редактировать, поэтому их данные (редкость, текст и т.д.) всегда берутся из пула
  function syncCollection() {
    try {
      const s = S(); let changed = false;
      for (const st of s.collection) {
        const p = st.poolId && POOL.find((x) => x.id === st.poolId);
        if (!p) continue;
        for (const k of ['name', 'type', 'icon', 'rarity', 'part', 'ability', 'limits', 'personality']) if (st[k] !== p[k]) { st[k] = p[k]; changed = true; }
        if (JSON.stringify(st.stats) !== JSON.stringify(p.stats)) { st.stats = { ...p.stats }; changed = true; }
      }
      if (changed) ctx().saveSettingsDebounced();
    } catch (e) { console.warn('[JoJo Stands] sync', e); }
  }
  async function loadPool() {
    try {
      const r = await fetch(new URL('stands.json', BASE).href, { cache: 'no-store' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const data = await r.json();
      const raw = (Array.isArray(data) ? data : data.stands || []).map(normStand).filter(Boolean);
      const list = [...new Map(raw.map((p) => [p.id, p])).values()]; // одинаковые id: побеждает последний
      if (!list.length) throw new Error('пул пуст');
      POOL = list; poolError = '';
      syncCollection();
    } catch (e) {
      POOL = []; poolError = String(e.message || e);
      console.error('[JoJo Stands] stands.json', e);
      notify('error', 'Не удалось загрузить stands.json: ' + poolError);
    }
  }

  const DEFAULTS = {
    arrows: 3, pulls: 0, pity: { epic: 0, leg: 0 }, msgCount: 0, collection: [], fold: [],
    enabled: true, source: 'pool', hdSource: 'code', msgPerArrow: 5, statView: 'radar',
    rates: { common: 0, rare: 90, epic: 9, legendary: 1 }, pityEpic: 10, pityLeg: 50,
  };

  const ctx = () => SillyTavern.getContext();
  const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const ui = { tab: 'gacha', sel: null, sub: 'mine', results: [], busy: false, fx: false, pdelay: 0, dev: false, devTaps: 0, devT: 0 }; // dev — скрытый режим разработчика (не сохраняется, при каждом запуске выключен); devTaps/devT — счётчик нажатий на «Настройки»

  function S() {
    const c = ctx();
    if (!c.extensionSettings[MODULE]) c.extensionSettings[MODULE] = structuredClone(DEFAULTS);
    const s = c.extensionSettings[MODULE];
    for (const k in DEFAULTS) if (!(k in s)) s[k] = structuredClone(DEFAULTS[k]);
    return s;
  }
  const saveS = () => { ctx().saveSettingsDebounced(); refreshPrompt(); };
  function C() {
    const md = ctx().chatMetadata;
    if (!md[MODULE]) md[MODULE] = { equipped: [], energy: {} };
    return md[MODULE];
  }
  const saveC = () => { ctx().saveMetadata(); refreshPrompt(); };
  const setPath = (o, path, v) => { const p = path.split('.'); const l = p.pop(); p.reduce((a, k) => a[k], o)[l] = v; };

  // ---------- влияние на roleplay ----------
  function buildPrompt(list, c) {
    const out = [
      "[Stand system (JoJo's Bizarre Adventure rules). Stands are spiritual manifestations of a user's fighting spirit. " +
      "Normally only other Stand users can see or touch them. Follow each Stand's stats, ability and limitations strictly; never invent extra powers. " +
      'Ranks: A = extremely high, B = high, C = average, D = low, E = minimal. A Stand cannot act beyond its range. ' +
      'Damage to a close-range Stand is felt by its user. Using the Stand drains Stand energy; at 0 the Stand vanishes and its user is exhausted. ' +
      'Narrate Stand actions vividly and consistently with these rules.',
    ];
    for (const st of list) {
      const stats = STATS.map(([k]) => `${k} ${st.stats[k]}`).join(', ');
      const en = c.energy[st.id] ?? st.maxEnergy;
      out.push(`\nStand: "${st.name}" — owner: ${st.owner}. Type: ${st.type}. Stats: ${stats}.` +
        (st.ability ? `\nAbility: ${st.ability}` : '') + (st.limits ? `\nLimitations: ${st.limits}` : '') +
        (st.personality ? `\nBehavior/personality: ${st.personality}` : '') + `\nStand energy: ${en}/${st.maxEnergy}.`);
    }
    return out.join('') + ']';
  }
  function refreshPrompt() {
    const s = S(), c = C();
    const list = s.enabled ? c.equipped.map((id) => s.collection.find((x) => x.id === id)).filter(Boolean) : [];
    ctx().setExtensionPrompt(PROMPT_KEY, list.length ? buildPrompt(list, c) : '', 1, 2, false, 0);
  }

  // ---------- гача ----------
  function wchoose(w, items) {
    const t = w.reduce((a, b) => a + (+b || 0), 0);
    if (!t) return items[0];
    let x = Math.random() * t;
    for (let i = 0; i < items.length; i++) { x -= (+w[i] || 0); if (x < 0) return items[i]; }
    return items[items.length - 1];
  }
  function rollRarity() {
    const s = S(), p = s.pity;
    p.epic++; p.leg++;
    let r;
    if (s.pityLeg > 0 && p.leg >= s.pityLeg) r = 'legendary';
    else if (s.pityEpic > 0 && p.epic >= s.pityEpic) r = wchoose([s.rates.epic, s.rates.legendary], ['epic', 'legendary']);
    else r = wchoose(ORDER.map((k) => s.rates[k]), ORDER);
    if (r === 'legendary') { p.leg = 0; p.epic = 0; } else if (r === 'epic') p.epic = 0;
    return r;
  }
  function rollStats(rarity) {
    const st = {};
    STATS.forEach(([k]) => (st[k] = wchoose(RANK_W[rarity], ['A', 'B', 'C', 'D', 'E'])));
    return st;
  }
  function fromPool(p) {
    return { id: uid(), poolId: p.id, name: p.name, type: p.type, icon: p.icon, rarity: p.rarity, part: p.part, stats: { ...p.stats }, ability: p.ability, limits: p.limits, personality: p.personality, owner: '{{user}}', maxEnergy: 100, copies: 1, ts: Date.now() };
  }
  async function llmStand(rarity) {
    const stats = rollStats(rarity);
    const q = `Invent a unique original JoJo-style Stand (rarity: ${rarity}) fitting the story. Stats: ${STATS.map(([k]) => `${k} ${stats[k]}`).join(', ')}. ` +
      'Higher rarity means a more creative and powerful ability, but always with clear limitations. Reply in Russian, strictly in this format, no extra text:\n' +
      `Название: <Stand name in English style>\nТип: <one of: ${TYPES.join(', ')}>\nСпособность: ...\nОграничения: ...\nХарактер стенда: ...`;
    const reply = await ctx().generateQuietPrompt({ quietPrompt: q });
    const pick = (key) => (reply.match(new RegExp(`${key}:\\s*(.+)`, 'i')) || [])[1]?.trim();
    const name = pick('Название');
    if (!name) throw new Error('bad format');
    const type = TYPES.find((t) => (pick('Тип') || '').includes(t)) || TYPES[0];
    return { id: uid(), name, type, rarity, stats, ability: pick('Способность') || '', limits: pick('Ограничения') || '', personality: pick('Характер стенда') || '', owner: '{{user}}', maxEnergy: 100, copies: 1, ts: Date.now() };
  }
  async function makeStand(rarity) {
    const s = S();
    if (s.source === 'llm') {
      try { const st = await llmStand(rarity); s.collection.push(st); return { stand: st, dup: false }; }
      catch (e) { console.warn('[JoJo Stands] LLM fallback', e); }
    }
    let cands = POOL.filter((p) => p.rarity === rarity);
    if (!cands.length) {
      const i = ORDER.indexOf(rarity);
      const alt = [...ORDER.slice(0, i).reverse(), ...ORDER.slice(i + 1)].find((r) => POOL.some((p) => p.rarity === r));
      cands = POOL.filter((p) => p.rarity === alt);
    }
    const pick = cands[Math.floor(Math.random() * cands.length)];
    const have = s.collection.find((x) => x.poolId === pick.id || x.name === pick.name);
    if (have) { have.copies = (have.copies || 1) + 1; return { stand: have, dup: true }; }
    const st = fromPool(pick);
    s.collection.push(st);
    return { stand: st, dup: false };
  }
  // ---------- анимации легендарок: см. animations.js ----------
  const { sounds, ANIMS, ANIM_LABELS } = createAnimations({
    ui, S, ctx, esc, ICON, normType,
    isUrl: (s) => isUrl(s), // isUrl объявлен ниже по файлу, поэтому обращаемся к нему лениво
  });

  // Анимация находится по poolId, а если id в stands.json другой (heavens_door, heaven-s-door…) — по имени карты
  const animNorm = (x) => String(x || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  function animFor(st) {
    if (!st) return null;
    if (ANIMS[st.poolId]) return ANIMS[st.poolId];
    const keys = [st.poolId, st.name].map(animNorm).filter(Boolean);
    for (const id of Object.keys(ANIMS)) { const ks = [animNorm(id), animNorm(ANIM_LABELS[id])]; if (keys.some((k) => ks.includes(k))) return ANIMS[id]; }
    return null;
  }
  async function runAnim(st, reveal, snd) {
    try { await animFor(st)($('#jg_overlay')[0], reveal, snd, st); }
    catch (e) { console.error('[JoJo Stands] анимация', st && st.name, e); notify('error', 'Ошибка анимации: ' + (e.message || e)); }
  }
  // проиграть анимацию из настроек для просмотра (результат не выдаётся, стрелы не тратятся)
  async function previewAnim(id) {
    const fn = ANIMS[id], dlg = $('#jg_overlay')[0];
    if (!fn || ui.busy || ui.fx || !dlg.open) return;
    const stand = POOL.find((p) => p.id === id) || { id, name: ANIM_LABELS[id] || id, icon: '', type: TYPES[0], rarity: 'legendary' };
    ui.busy = true;
    try { await fn(dlg, () => {}, sounds(), stand); }
    catch (e) { console.warn('[JoJo Stands] preview', id, e); notify('error', 'Ошибка анимации: ' + (e.message || e)); }
    finally { ui.busy = false; ui.fx = false; render(); }
  }

  async function pull(n) {
    const s = S();
    if (ui.busy || ui.fx) return;
    const snd = sounds(); // грузим звуки сразу по клику
    if (s.arrows < n) { notify('warning', 'Не хватает стрел'); return; }
    if (s.source !== 'llm' && !POOL.length) { notify('error', 'Пул стендов не загружен (stands.json)'); return; }
    ui.busy = true; s.arrows -= n; ui.results = []; render();
    const res = [];
    for (let i = 0; i < n; i++) res.push(await makeStand(rollRarity()));
    s.pulls += n;
    const hit = res.find((r) => animFor(r.stand));
    const reveal = (delay) => { ui.results = res; ui.busy = false; ui.pdelay = hit ? (delay ?? 0.55) : 0; saveS(); render(); ui.pdelay = 0; };
    if (hit) { saveS(); await runAnim(hit.stand, reveal, snd); }
    else reveal();
  }

  // ===== DEV-ONLY (УДАЛИТЬ ПЕРЕД РЕЛИЗОМ): выбить конкретную карточку из пула, без трат стрел и без влияния на гарантии =====
  async function devPull(id) {
    const s = S(), pick = POOL.find((p) => p.id === id);
    if (!ui.dev || ui.busy || ui.fx || !pick) return;
    const snd = sounds();
    ui.busy = true; ui.results = []; render();
    const have = s.collection.find((x) => x.poolId === pick.id || x.name === pick.name);
    let r;
    if (have) { have.copies = (have.copies || 1) + 1; r = { stand: have, dup: true }; }
    else { const st = fromPool(pick); s.collection.push(st); r = { stand: st, dup: false }; }
    const res = [r], hit = animFor(r.stand) ? r : null;
    const reveal = (delay) => { ui.results = res; ui.busy = false; ui.pdelay = hit ? (delay ?? 0.55) : 0; saveS(); render(); ui.pdelay = 0; };
    if (hit) { saveS(); await runAnim(hit.stand, reveal, snd); }
    else reveal();
  }
  function devPanel(dis) {
    if (!ui.dev || !POOL.length) return '';
    const cur = ui.devPick && POOL.some((p) => p.id === ui.devPick) ? ui.devPick : POOL[0].id;
    const opts = ORDER.map((r) => { const ps = POOL.filter((p) => p.rarity === r); return ps.length ? `<optgroup label="${esc(r)}">${ps.map((p) => `<option value="${esc(p.id)}" ${p.id === cur ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</optgroup>` : ''; }).join('');
    return `<div class="jg-set jg-dev"><div class="jg-devh">🛠 DEV: выбить нужную карточку — удалить перед релизом</div>
      <div class="jg-row"><select id="jg_dev_pick" class="jg-in" style="width:auto;flex:1;text-align:left">${opts}</select><button class="jg-btn gold" data-act="devPull" ${dis}>Выбить</button></div></div>`;
  }
  // ===== /DEV-ONLY =====

  // ---------- бонусные стрелы ----------
  function onMessageSent() {
    const s = S();
    if (!(s.msgPerArrow > 0)) return;
    s.msgCount++;
    if (s.msgCount >= s.msgPerArrow) { s.msgCount = 0; s.arrows += 1; notify('info', 'Новая стрела за активность 🏹'); }
    saveS();
    if ($('#jg_overlay').prop('open')) $('#jg_arrows').text(`🏹 ${s.arrows}`);
  }

  // ---------- интерфейс ----------
  const badge = (r) => `<span class="jg-badge" style="--c:${RAR[r].color}">${RAR[r].label}</span>`;
  const isUrl = (s) => /^(https?:)?\/\/|^\/|^data:image\//i.test(s || '');
  // Картинки: 5 попыток загрузки, потом эмодзи. Состояние хранится по URL и переживает перерисовку.
  const IMG_TRIES = 5;
  const imgTry = new Map();
  const imgFail = new Set();
  function iconHtml(st) {
    const fb = ICON[normType(st.type)] || '✨';
    if (isUrl(st.icon)) {
      if (imgFail.has(st.icon)) return fb;
      return `<img class="jg-img" src="${esc(st.icon)}" data-u="${esc(st.icon)}" data-fb="${fb}" alt="" loading="lazy" referrerpolicy="no-referrer">`;
    }
    return esc(st.icon || fb);
  }
  function onImgError(e) {
    const img = e.target;
    if (!(img instanceof HTMLImageElement) || !img.classList.contains('jg-img')) return;
    const u = img.dataset.u;
    const n = (imgTry.get(u) || 0) + 1;
    imgTry.set(u, n);
    if (n < IMG_TRIES) {
      setTimeout(() => { if (img.isConnected) img.src = u + (u.includes('?') ? '&' : '?') + 'jgr=' + Date.now(); }, 600 * n);
    } else {
      imgFail.add(u);
      img.replaceWith(document.createTextNode(img.dataset.fb || '✨'));
    }
  }
  function onImgLoad(e) {
    const img = e.target;
    if (img instanceof HTMLImageElement && img.classList.contains('jg-img')) { imgTry.delete(img.dataset.u); imgFail.delete(img.dataset.u); }
  }
  // Полная очистка данных о картинках. Файлы из папки расширения (img/...) не трогаем.
  const isLocalImg = (u) => { try { return !!BASE && new URL(u, location.href).href.startsWith(BASE); } catch (e) { return false; } };
  const noQuery = (u) => String(u).split('?')[0];
  async function wipeImages() {
    const s = S(); const remote = new Set(); let own = 0, purged = 0;
    for (const st of s.collection) {
      if (!isUrl(st.icon) || isLocalImg(st.icon)) continue;
      remote.add(noQuery(st.icon));
      // свои стенды (не из stands.json): ссылку или встроенную картинку стираем насовсем
      if (!st.poolId || !POOL.some((p) => p.id === st.poolId)) { st.icon = ''; own++; }
    }
    POOL.forEach((p) => { if (isUrl(p.icon) && !isLocalImg(p.icon)) remote.add(noQuery(p.icon)); });
    const tried = imgTry.size + imgFail.size;
    imgTry.clear(); imgFail.clear(); // счётчики попыток и список «не загрузилось»
    document.querySelectorAll('#jg_overlay img.jg-img').forEach((im) => { if (!isLocalImg(im.currentSrc || im.src)) im.removeAttribute('src'); });
    try { // кэш картинок, если Таверна/браузер положили их в Cache Storage
      if (window.caches) for (const name of await caches.keys()) {
        const cache = await caches.open(name);
        for (const req of await cache.keys()) if (remote.has(noQuery(req.url)) && await cache.delete(req)) purged++;
      }
    } catch (e) { console.warn('[JoJo Stands] wipeImages cache', e); }
    saveS();
    return { own, purged, tried };
  }
  function card(st, o = {}) {
    const on = C().equipped.includes(st.id);
    const tag = o.tag || (on ? '<div class="jg-tag on">В чате</div>' : '');
    return `<div class="jg-card r-${st.rarity} ${o.pop ? 'jg-pop' : ''}" style="${o.pop ? `animation-delay:${o.i * 0.12 + ui.pdelay}s` : ''}" data-act="open" data-id="${st.id}">
      ${tag}<div class="jg-ico">${iconHtml(st)}</div><div class="jg-name">${esc(st.name)}</div>${badge(st.rarity)}
      <div class="jg-chips">${STATS.map(([k]) => `<i class="rk-${st.stats[k]}">${st.stats[k]}</i>`).join('')}</div></div>`;
  }

  function viewGacha() {
    const s = S(), dis = ui.busy ? 'disabled' : '';
    const bar = (v, m) => `<div class="jg-pity"><div style="width:${m > 0 ? Math.min(100, (v / m) * 100) : 0}%"></div></div>`;
    const results = ui.busy
      ? '<div class="jg-busy">🏹 Стрела летит…</div>'
      : ui.results.length
        ? `<h3 class="jg-h3">Результат</h3><div class="jg-results">${ui.results.map((r, i) =>
          card(r.stand, { pop: true, i, tag: `<div class="jg-tag ${r.dup ? 'dup' : ''}">${r.dup ? `Дубль ×${r.stand.copies}` : 'НОВЫЙ'}</div>` })).join('')}</div>`
        : '';
    return `<div class="jg-banner"><div class="jg-bow">🏹</div><h2>Стрела Стендов</h2>
      <div class="jg-sub">Выстрели и пробуди дух внутри. Всего выстрелов: ${s.pulls}</div>
      ${s.pityEpic > 0 ? `<div class="jg-pityrow">Гарантия эпика: ещё ${Math.max(0, s.pityEpic - s.pity.epic)}</div>${bar(s.pity.epic, s.pityEpic)}` : ''}
      ${s.pityLeg > 0 ? `<div class="jg-pityrow">Гарантия легендарного: ещё ${Math.max(0, s.pityLeg - s.pity.leg)}</div>${bar(s.pity.leg, s.pityLeg)}` : ''}
      <div class="jg-btns">
        <button class="jg-btn" data-act="pull" data-n="1" ${dis}>Выстрел ×1<small>1 🏹</small></button>
        <button class="jg-btn gold" data-act="pull" data-n="10" ${dis}>Выстрел ×10<small>10 🏹</small></button>
      </div></div>${devPanel(dis)}${results}`; // DEV-ONLY: devPanel — удалить перед релизом
  }

  const PARTS = ['Phantom Blood', 'Battle Tendency', 'Stardust Crusaders', 'Diamond is Unbreakable', 'Golden Wind', 'Stone Ocean', 'Steel Ball Run', 'JoJolion', 'The JOJOLands'];
  const OTHER = 'Другие';
  const partOf = (st) => (st.poolId && POOL.find((p) => p.id === st.poolId)?.part) || st.part || OTHER;
  const byName = (a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' });
  const byRarName = (a, b) => ORDER.indexOf(b.rarity) - ORDER.indexOf(a.rarity) || byName(a, b); // редкость ↓, внутри — по алфавиту
  const partRank = (n) => { const i = PARTS.indexOf(n); return i < 0 ? (n === OTHER ? 999 : 500) : i; };
  function groupParts(items, fn) {
    const m = new Map();
    items.forEach((x) => { const k = fn(x); if (!m.has(k)) m.set(k, []); m.get(k).push(x); });
    return [...m.entries()].sort((a, b) => partRank(a[0]) - partRank(b[0]) || a[0].localeCompare(b[0]));
  }
  const foldKey = (part) => ui.sub + '|' + part;
  const isFold = (part) => S().fold.includes(foldKey(part));
  const partHead = (part, count) => `<h3 class="jg-h3 jg-part" data-act="fold" data-k="${esc(part)}"><span><span class="jg-arr">${isFold(part) ? '▸' : '▾'}</span> ${esc(part)}</span> <small>${count}</small></h3>`;
  const owned = (p) => S().collection.find((x) => x.poolId === p.id || x.name === p.name);
  function lockedCard(p) {
    return `<div class="jg-card jg-locked"><div class="jg-ico">🔒</div><div class="jg-name">${esc(p.name)}</div></div>`;
  }
  function viewCatalog() {
    if (!POOL.length) return '<div class="jg-empty">Пул стендов не загружен (stands.json).</div>';
    const got = POOL.filter((p) => owned(p)).length;
    const groups = groupParts(POOL, (p) => p.part || OTHER).map(([part, items]) => {
      const have = items.map((p) => ({ p, o: owned(p) }));
      const mine = have.filter((x) => x.o).map((x) => x.o).sort(byRarName);
      const lock = have.filter((x) => !x.o).map((x) => x.p).sort(byName); // закрытые — только по алфавиту, чтобы не выдавать редкость
      return partHead(part, `${mine.length} / ${items.length}`) + (isFold(part) ? '' : `<div class="jg-grid">${mine.map((x) => card(x)).join('')}${lock.map(lockedCard).join('')}</div>`);
    }).join('');
    return `<h3 class="jg-h3">Открыто: ${got} / ${POOL.length}</h3>${groups}`;
  }
  function viewCollection() {
    const s = S(), c = C();
    if (ui.sel) {
      const st = s.collection.find((x) => x.id === ui.sel);
      if (st) return viewDetail(st, c);
      ui.sel = null;
    }
    const subs = `<div class="jg-subtabs"><div class="jg-sub-tab ${ui.sub === 'mine' ? 'active' : ''}" data-act="sub" data-v="mine">Мои стенды</div><div class="jg-sub-tab ${ui.sub === 'all' ? 'active' : ''}" data-act="sub" data-v="all">Все стенды</div></div>`;
    if (ui.sub === 'all') return subs + viewCatalog();
    if (!s.collection.length) return subs + '<div class="jg-empty">Коллекция пуста.<br>Выстрели стрелой во вкладке «Гача».</div>';
    const sorted = [...s.collection].sort(byRarName);
    const active = sorted.filter((x) => c.equipped.includes(x.id));
    const groups = groupParts(sorted, partOf).map(([part, items]) =>
      partHead(part, items.length) + (isFold(part) ? '' : `<div class="jg-grid">${items.map((x) => card(x)).join('')}</div>`)).join('');
    return subs + `<h3 class="jg-h3">Собрано: ${s.collection.length}</h3>` +
      (active.length ? `<h3 class="jg-h3">В этом чате</h3><div class="jg-grid">${active.map((x) => card(x)).join('')}</div>` : '') + groups;
  }

  // Шестиугольная диаграмма характеристик в стиле аниме (фон прозрачный, линии берут цвет текста темы)
  const RADAR_NAMES = [['Разрушительная', 'сила'], ['Скорость'], ['Радиус'], ['Выносливость'], ['Точность'], ['Потенциал', 'развития']];
  function radarSvg(st) {
    const cx = 320, cy = 320, U = 30.5, RIN = 185;
    const pt = (r, i) => { const a = (i * 60 * Math.PI) / 180; return [cx + r * Math.sin(a), cy - r * Math.cos(a)]; };
    const f = (n) => n.toFixed(1);
    const poly = STATS.map(([k], i) => pt(RV[st.stats[k]] * U, i).map(f).join(',')).join(' ');
    const axes = STATS.map((_, i) => { const [x, y] = pt(RIN, i); return `<line x1="${cx}" y1="${cy}" x2="${f(x)}" y2="${f(y)}"/>`; }).join('');
    // внешнее кольцо-линейка: два тонких круга и 24 засечки
    const ticks = Array.from({ length: 24 }, (_, i) => {
      const a = (i * 15 * Math.PI) / 180, s1 = Math.sin(a), c1 = Math.cos(a);
      return `<line x1="${f(cx + 289 * s1)}" y1="${f(cy - 289 * c1)}" x2="${f(cx + 307 * s1)}" y2="${f(cy - 307 * c1)}"/>`;
    }).join('');
    const scale = ['E', 'D', 'C', 'B', 'A'].map((t, n) => `<text class="rs" x="${cx + 9}" y="${f(cy - (n + 1) * U)}" dominant-baseline="central">${t}</text>`).join('');
    const labels = STATS.map(([k], i) => {
      const [lx, ly] = pt(i === 0 ? 256 : 262, i), [rx, ry] = pt(i === 0 ? 212 : 220, i);
      let rot = i * 60; if (rot > 90 && rot < 270) rot -= 180;
      const names = RADAR_NAMES[i];
      const tsp = names.map((t, j) => `<tspan x="0" y="${names.length === 1 ? 0 : (j === 0 ? -10.5 : 10.5)}">${t}</tspan>`).join('');
      return `<text class="rn" transform="translate(${f(lx)},${f(ly)}) rotate(${rot})" text-anchor="middle" dominant-baseline="central">${tsp}</text>` +
        `<text class="rr" x="${f(rx)}" y="${f(ry)}" text-anchor="middle" dominant-baseline="central">${st.stats[k]}</text>`;
    }).join('');
    const aria = STATS.map(([k], i) => `${RADAR_NAMES[i].join(' ')}: ${st.stats[k]}`).join(', ');
    return `<svg class="jg-radar" viewBox="0 0 640 640" role="img" aria-label="${esc(aria)}">` +
      `<g fill="none" stroke="currentColor"><circle cx="${cx}" cy="${cy}" r="291" stroke-width="2.5"/><circle cx="${cx}" cy="${cy}" r="305" stroke-width="2.5"/>` +
      `<circle cx="${cx}" cy="${cy}" r="${RIN}" stroke-width="2.5"/><g stroke-width="7">${ticks}</g></g>` +
      `<polygon points="${poly}" fill="#e9604c" fill-opacity=".9"/>` +
      `<g stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="0.1 8">${axes}</g>` +
      `${scale}${labels}</svg>`;
  }

  function viewDetail(st, c) {
    const on = c.equipped.includes(st.id);
    const en = c.energy[st.id] ?? st.maxEnergy;
    const list = STATS.map(([k, label]) => `<div class="jg-stat"><span>${label}</span><div class="jg-seg">${[1, 2, 3, 4, 5].map((n) => `<b class="${n <= RV[st.stats[k]] ? 'on' : ''}"></b>`).join('')}</div><em>${st.stats[k]}</em></div>`).join('');
    const radarMode = S().statView !== 'list';
    const stats = `<div class="jg-stathead"><label class="jg-field" style="margin:0">Характеристики</label><button class="jg-mini" data-act="statView" title="Переключить вид характеристик">${radarMode ? '☰ Список' : '⬡ Диаграмма'}</button></div>${radarMode ? radarSvg(st) : list}`;
    const ro = !!st.poolId; // стенды из stands.json нельзя редактировать
    const f = (key, label, area) => ro
      ? `<label class="jg-field">${label}</label><div class="jg-ro">${esc(st[key]) || '—'}</div>`
      : `<label class="jg-field">${label}</label>${area
        ? `<textarea class="jg-in jf" data-id="${st.id}" data-f="${key}">${esc(st[key])}</textarea>`
        : `<input class="jg-in jf" data-id="${st.id}" data-f="${key}" value="${esc(st[key])}">`}`;
    return `<span class="jg-back" data-act="back">← К коллекции</span>
      <div class="jg-dhead"><div class="jg-ico">${iconHtml(st)}</div><h2 style="margin:4px 0">${esc(st.name)}</h2>${badge(st.rarity)} <small>${esc(st.type)}${st.copies > 1 ? ` · дублей: ${st.copies - 1}` : ''}</small></div>
      <div class="jg-row" style="margin:0 0 8px"><button class="jg-btn ghost" data-act="reloadImg" data-id="${st.id}">🖼️ Загрузить фото снова</button></div>${isUrl(st.icon) && imgFail.has(st.icon) ? '<div class="jg-imgnote">Фото не загрузилось после 5 попыток</div>' : ''}
      ${stats}${f('ability', 'Способность', 1)}${f('limits', 'Ограничения', 1)}${f('personality', 'Характер', 1)}
      ${on ? `<label class="jg-field">Энергия: ${en}/${st.maxEnergy}</label><div class="jg-bar"><div style="width:${Math.max(0, Math.min(100, (en / st.maxEnergy) * 100))}%"></div></div>
        <div class="jg-row"><button class="jg-btn ghost" data-act="en" data-id="${st.id}" data-d="-10">−10</button><button class="jg-btn ghost" data-act="en" data-id="${st.id}" data-d="10">+10</button><button class="jg-btn ghost" data-act="en" data-id="${st.id}" data-d="full">Полная</button></div>` : ''}
      <div class="jg-row"><button class="jg-btn ${on ? 'ghost' : ''}" data-act="equip" data-id="${st.id}">${on ? 'Убрать из чата' : 'Призвать в этом чате'}</button>
      <button class="jg-btn danger" data-act="del" data-id="${st.id}">Отказаться от Стенда</button></div>`;
  }

  function viewSettings() {
    const s = S();
    const num = (k, label, v) => `<label class="jg-line">${label}<input type="number" class="jg-in js" data-k="${k}" value="${v}"></label>`;
    return `<div class="jg-set"><label class="jg-line">Система стендов включена<input type="checkbox" class="js" data-k="enabled" ${s.enabled ? 'checked' : ''}></label></div>
      <div class="jg-set"><label class="jg-line">Источник стендов
        <select class="jg-in js" data-k="source" style="width:150px"><option value="pool" ${s.source === 'pool' ? 'selected' : ''}>Встроенный пул</option><option value="llm" ${s.source === 'llm' ? 'selected' : ''}>Генерация LLM</option></select></label></div>
      <div class="jg-set"><label class="jg-line">Пул: ${POOL.length ? `${POOL.length} стендов (stands.json)` : `<span style="color:#f87171">не загружен${poolError ? ': ' + esc(poolError) : ''}</span>`}</label>
        <div class="jg-row"><button class="jg-btn ghost" data-act="reloadPool">↻ Перечитать stands.json</button></div></div>
      ${ui.dev ? `<h3 class="jg-h3">Стрелы</h3>
      <div class="jg-set">${num('msgPerArrow', 'Сообщений за 1 стрелу (0 = выкл.)', s.msgPerArrow)}</div>
      <div class="jg-row"><button class="jg-btn ghost" data-act="addArrows" data-n="10">+10 🏹</button><button class="jg-btn ghost" data-act="addArrows" data-n="100">+100 🏹</button></div>` : ''}
      ${ui.dev ? `<h3 class="jg-h3">Шансы (в относительных весах)</h3>
      <div class="jg-set">${ORDER.map((k) => num('rates.' + k, RAR[k].label, s.rates[k])).join('')}</div>
      <div class="jg-set">${num('pityEpic', 'Гарантия эпика через (0 = выкл.)', s.pityEpic)}${num('pityLeg', 'Гарантия легендарного через (0 = выкл.)', s.pityLeg)}</div>` : ''}
      <h3 class="jg-h3">Heaven's Door</h3>
      <div class="jg-set"><label class="jg-line">Текст на страницах книги
        <select class="jg-in js" data-k="hdSource" style="width:170px"><option value="code" ${s.hdSource !== 'chat' ? 'selected' : ''}>Код Таверны</option><option value="chat" ${s.hdSource === 'chat' ? 'selected' : ''}>Сообщения из чата</option></select></label></div>
      ${ui.dev ? `<h3 class="jg-h3">Анимации (просмотр)</h3>
      <div class="jg-set"><div class="jg-anims">${Object.keys(ANIMS).map((id) => `<button class="jg-btn ghost" data-act="preview" data-anim="${id}">▶ ${esc(ANIM_LABELS[id] || id)}</button>`).join('')}</div></div>` : ''}
      <h3 class="jg-h3">Картинки</h3>
      <div class="jg-set"><div class="jg-imgnote" style="margin:0 0 8px;color:#9ca3af">Стирает счётчики попыток и список незагрузившихся фото, свои картинки у созданных вручную стендов и кэш этих картинок. Файлы из папки расширения (img/) остаются.</div>
        <div class="jg-row"><button class="jg-btn danger" data-act="wipeImg">🗑 Удалить данные о картинках</button></div></div>
      <div class="jg-row"><button class="jg-btn danger" data-act="reset">Сбросить всё</button></div>`;
  }

  function render() {
    const s = S();
    $('#jg_arrows').text(`🏹 ${s.arrows}`);
    $('.jg-tab').each(function () { $(this).toggleClass('active', $(this).data('v') === ui.tab); });
    const html = ui.tab === 'gacha' ? viewGacha() : ui.tab === 'collection' ? viewCollection() : viewSettings();
    $('#jg_body').html(html);
    const vk = ui.tab + '|' + (ui.sel || '') + '|' + (ui.tab === 'collection' ? ui.sub : '');
    if (vk !== ui.vk) { ui.vk = vk; $('#jg_body').scrollTop(0); } // при смене вкладки/страницы стенда прокрутка — с самого начала
  }

  function mount() {
    $('body').append(`<dialog class="jg-overlay" id="jg_overlay"><div class="jg-modal">
      <div class="jg-head"><div class="jg-title">STAND ARROW</div><div class="jg-arrows" id="jg_arrows"></div><div class="jg-x" data-act="close">✕</div></div>
      <div class="jg-tabs">
        <div class="jg-tab" data-act="tab" data-v="gacha">🎲 Гача</div>
        <div class="jg-tab" data-act="tab" data-v="collection">📖 Коллекция</div>
        <div class="jg-tab" data-act="tab" data-v="settings">⚙️ Настройки</div>
      </div><div class="jg-body" id="jg_body"></div></div></dialog>`);

    const dlg = document.getElementById('jg_overlay');
    dlg.addEventListener('error', onImgError, true);
    dlg.addEventListener('load', onImgLoad, true);
    dlg.addEventListener('cancel', (e) => { if (ui.fx) e.preventDefault(); });

    $('#extensionsMenu').append(`<div id="jg_open_menu" class="list-group-item flex-container flexGap5" data-jg-open><div class="fa-solid fa-hand-fist extensionsMenuExtensionButton"></div>JoJo: Gacha</div>`);
    $('#extensions_settings2').append(`<div class="inline-drawer"><div class="inline-drawer-toggle inline-drawer-header"><b>JoJo: Gacha</b><div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div></div>
      <div class="inline-drawer-content"><div class="menu_button" data-jg-open><i class="fa-solid fa-hand-fist"></i> Открыть интерфейс стендов</div></div></div>`);

    $(document).on('click', '[data-jg-open]', () => { const d = $('#jg_overlay')[0]; if (!d.open) d.showModal(); render(); });
    $('#jg_overlay').on('click', function (e) { if (e.target === this && !ui.fx) this.close(); });

    $('#jg_overlay').on('change', '#jg_dev_pick', function () { ui.devPick = String(this.value); }); // DEV-ONLY: удалить перед релизом

    $('#jg_overlay').on('click', '[data-act]', function () {
      const a = $(this).data('act'), id = $(this).data('id'), s = S(), c = C();
      const st = s.collection.find((x) => x.id === id);
      switch (a) {
        case 'close': $('#jg_overlay')[0].close(); return;
        case 'tab': {
          const v = $(this).data('v');
          if (v === 'settings') { // 5 нажатий подряд (пауза между ними не больше 1.5 с) на «Настройки» включают/выключают режим разработчика
            const now = Date.now();
            ui.devTaps = now - ui.devT < 1500 ? ui.devTaps + 1 : 1; ui.devT = now;
            if (ui.devTaps >= 5) { ui.devTaps = 0; ui.dev = !ui.dev; notify('info', ui.dev ? '🛠 Режим разработчика включён' : 'Режим разработчика выключен'); }
          } else ui.devTaps = 0;
          ui.tab = v; ui.sel = null; break;
        }
        case 'pull': pull(Number($(this).data('n'))); return;
        case 'preview': previewAnim(String($(this).data('anim'))); return;
        case 'devPull': if (!ui.dev) return; devPull(String($('#jg_dev_pick').val())); return; // DEV-ONLY: удалить перед релизом
        case 'open': ui.tab = 'collection'; ui.sel = id; break;
        case 'back': ui.sel = null; break;
        case 'fold': {
          const k = foldKey(String($(this).data('k'))), i = s.fold.indexOf(k);
          if (i >= 0) s.fold.splice(i, 1); else s.fold.push(k);
          ctx().saveSettingsDebounced(); break;
        }
        case 'sub': ui.sub = $(this).data('v'); ui.sel = null; break;
        case 'statView': s.statView = s.statView === 'list' ? 'radar' : 'list'; ctx().saveSettingsDebounced(); break;
        case 'equip':
          if (c.equipped.includes(id)) c.equipped = c.equipped.filter((x) => x !== id); else c.equipped.push(id);
          saveC(); break;
        case 'en': {
          if (!st) break;
          const cur = c.energy[id] ?? st.maxEnergy, d = $(this).data('d');
          c.energy[id] = d === 'full' ? st.maxEnergy : Math.max(0, Math.min(st.maxEnergy, cur + Number(d)));
          saveC(); break;
        }
        case 'del':
          if (!confirm('Отказаться от этого стенда? Он будет удалён из коллекции.')) return;
          s.collection = s.collection.filter((x) => x.id !== id); c.equipped = c.equipped.filter((x) => x !== id);
          ui.sel = null; saveS(); saveC(); break;
        case 'reloadPool': loadPool().then(() => { if (POOL.length) notify('success', `Пул загружен: ${POOL.length}`); render(); }); return;
        case 'reloadImg':
          if (st && isUrl(st.icon)) { imgFail.delete(st.icon); imgTry.delete(st.icon); notify('info', 'Загружаю фото…'); }
          else notify('info', 'У этого стенда нет ссылки на фото (сейчас эмодзи). Укажите ссылку в поле icon в stands.json.');
          break;
        case 'wipeImg':
          if (!confirm('Удалить все данные расширения о картинках (кроме файлов из папки расширения)?')) return;
          wipeImages().then((r) => { notify('success', `Картинки очищены: свои иконки ${r.own}, из кэша ${r.purged}, записей о попытках ${r.tried}`); render(); }); return;
        case 'addArrows': s.arrows += Number($(this).data('n')); saveS(); break;
        case 'reset':
          if (!confirm('Сбросить коллекцию, стрелы и настройки?')) return;
          ctx().extensionSettings[MODULE] = structuredClone(DEFAULTS); c.equipped = []; c.energy = {};
          ui.results = []; ui.sel = null; saveS(); saveC(); break;
      }
      render();
    });

    $('#jg_overlay').on('input change', '.jf', function () {
      const st = S().collection.find((x) => x.id === $(this).data('id'));
      if (!st) return;
      st[$(this).data('f')] = this.value; saveS();
    });
    $('#jg_overlay').on('change', '.js', function () {
      const s = S();
      const v = this.type === 'checkbox' ? this.checked : this.type === 'number' ? Number(this.value) || 0 : this.value;
      setPath(s, $(this).data('k'), v); saveS();
    });
  }

  $(() => {
    mount();
    const { eventSource, event_types } = ctx();
    eventSource.on(event_types.CHAT_CHANGED, () => { refreshPrompt(); if ($('#jg_overlay').prop('open')) render(); });
    eventSource.on(event_types.MESSAGE_SENT, onMessageSent);
    refreshPrompt();
    loadPool().then(() => { if ($('#jg_overlay').prop('open')) render(); });
  });
})();
