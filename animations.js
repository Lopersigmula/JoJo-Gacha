// JoJo Stands: Gacha — анимации раскрытия стендов.
// Вынесено из index.js. Подключается там через `import { createAnimations } from './animations.js'`.
//
// Чтобы добавить новую анимацию: напиши функцию async (dlg, reveal, snd, st) => {...}
// внутри createAnimations и впиши её в ANIMS (poolId -> функция) и в ANIM_LABELS (poolId -> название).
//
// Что приходит из index.js (env): ui, S, ctx, esc, ICON, normType, isUrl.

export function createAnimations(env) {
  const { ui, S, ctx, esc, ICON, normType, isUrl } = env;
  // Файл лежит в папке расширения, поэтому BASE совпадает с BASE из index.js
  const BASE = (() => { try { return new URL('.', import.meta.url).href; } catch (e) { return ''; } })();

  // ---------- анимации легендарок ----------
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let actx = null;
  function audio() {
    try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); return actx; } catch (e) { return null; }
  }
  function tone({ type = 'sine', f0, f1, dur, vol, delay = 0 }) {
    const a = audio(); if (!a) return;
    const t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t);
    if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.01, dur / 3)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
  }
  const sndBoom = () => { tone({ f0: 110, f1: 30, dur: 1.1, vol: 0.5 }); tone({ type: 'sawtooth', f0: 300, f1: 60, dur: 0.9, vol: 0.06 }); };
  const sndTick = (i) => { tone({ type: 'square', f0: i % 2 ? 1500 : 1900, dur: 0.05, vol: 0.14 }); tone({ f0: 160, f1: 60, dur: 0.14, vol: 0.4 }); };
  const sndRelease = () => tone({ f0: 180, f1: 1400, dur: 0.8, vol: 0.12 });

  // Звуки: сначала ищем файл в папке расширения (sounds/), если его нет — берём ссылку; для тиканья без файла играет синтезированный стук
  const SND = {
    start: ['sounds/za-warudo.mp3'], // 1-й звук The World: вместе с надписью, до эффекта
    stop: ['sounds/time-stop.mp3', 'https://www.myinstants.com/media/sounds/time-stop-sound-effect-eyes-of-heaven_128k-mp3cut.mp3'], // 2-й звук: в самом начале эффекта (волны)
    tick: 'sounds/tick.mp3',
    resume: 'sounds/time-resume.mp3', // второй звук The World: играет, пока слой с эффектом возвращается (нет файла — синтезированный свист)
    yes: 'sounds/yes.mp3',
    dojaan: 'sounds/dojaan.mp3',
    silver: 'sounds/silver-chariot.mp3',
    slice: 'sounds/slice.mp3',
    mrName: 'sounds/magicians-red.mp3', // голос «Magician's Red» в начале анимации, играет вместе с надписью
    hg: 'sounds/hierophant-green.mp3',
    d4name: 'sounds/funny_valentine_d4c.mp3', // голос в конце анимации D4C, играет вместе с надписью
    hdName: 'sounds/heavens-door.mp3', // (необязательно) голос «Heaven's Door» вместе с надписью
    hdFlip: 'sounds/book-flip.mp3', // (необязательно) шелест одного листа; нет файла — синтез
    hdSlam: 'sounds/book-slam.mp3', // (необязательно) хлопок книги; нет файла — синтез
    kq: 'sounds/killer-queen.mp3', // голос Killer Queen: идёт вместе с надписью, взрыв — в момент щелчка в конце записи
    thName: 'sounds/the-hand.mp3', // голос «The Hand»: играет вместе с надписью
    thErase: 'sounds/erase.mp3', // звук стирания: когда сферы уходят за экран
    kqEye: 'sounds/bokudan.mp3', // звук появления глаза
    kqImg: 'img/killer-queen.webp', // картинка внутри глаза
    swPop: 'sounds/bomb.mp3', // (необязательно) звук взрыва каждого пузыря Soft & Wet (~1 с); нет файла — синтезированный хлопок
    geLife: 'sounds/life.mp3', // (необязательно) звук Life: камень Gold Experience превращается в бабочку (~1.9 с, тихий — усиливается в коде); нет файла — без звука
    swName: 'sounds/soft-and-wet.mp3', // (необязательно) голос «Soft & Wet» вместе с надписью; нет файла — надпись держится SW_T.title, звучат синтезированные «блюп»
    kcSkip: 'sounds/kc-time-skip-bass.mp3', // (необязательно) King Crimson Time Skip Bass (~6.1 с): играет на протяжении всего Сандевистана; нет файла — синтезированный свист и щелчок
    kcSkip2: 'sounds/time-skip.mp3', // (необязательно) старый Time Skip (~3.1 с): стартует сразу после того, как закончится kcSkip (бас)
    cmName: 'sounds/c-moon.mp3', // (необязательно) звук при появлении надписи C-MOON; надпись держится по его длине
    cmPre: ['sounds/c-moon_sound1.mp3', 'sounds/c-moon_sound2.mp3', 'sounds/c-moon_sound3.mp3', 'sounds/c-moon_sound4.mp3'], // (необязательно) перед каждой сменой гравитации играет случайный из них; смена начинается, когда он закончится
    cmShift: 'sounds/gravity-shift.mp3', // (необязательно) звук самой смены гравитации: играет сразу после случайного c-moon_sound (3 раза: влево, вверх, вправо); нет файла — синтезированный гул
    mhName: 'sounds/made-in-heaven.mp3', // (необязательно) голос «Made in Heaven» вместе с надписью; нет файла — надпись держится MH_T.title, звучит синтезированный гул. Шорох свайпов и свист ускорения — синтез
    mtName: 'sounds/metallica.mp3', // (необязательно) голос «Metallica» вместе с надписью; нет файла — надпись держится MT_T.title, без звука. Звук лезвий — существующий sounds/slice.mp3
    geName: 'sounds/gold-experience.mp3', // (необязательно) голос «Gold Experience» вместе с надписью; нет файла — надпись держится GE_T.title, без звука
    kcName: 'sounds/king-crimson.mp3', // (необязательно) голос «King Crimson» вместе с надписью; нет файла — надпись держится KC_T.title, звучит синтез
    hdOpen: 'sounds/heavens-door-open.mp3', // (необязательно) распахивание врат; нет файла — синтез
    sp: ['sounds/star-platinum-voice.mp3', 'sounds/star-platinum-ora-rush.mp3', 'sounds/star-platinum-ora-single.mp3', 'sounds/star-platinum-punch.mp3'], // голос, «ора» (3 с), одиночное «ора», удар
  };
  function loadClip(urls) {
    const els = urls.map((u) => { const a = new Audio(); a.preload = 'auto'; a.src = /^https?:/.test(u) ? u : new URL(u, BASE).href; return a; });
    return {
      // играет первый рабочий источник; true — дослушал до конца, false — не удалось / слишком долго
      play: (cap = 12000) => new Promise((resolve) => {
        let i = 0, cur = null, done = false;
        const fin = (ok) => { if (done) return; done = true; clearTimeout(tm); if (!ok && cur) cur.pause(); resolve(ok); };
        const tm = setTimeout(() => fin(false), cap);
        const next = () => {
          if (done) return;
          if (i >= els.length) return fin(false);
          cur = els[i++];
          cur.onended = () => fin(true); cur.onerror = next;
          try { cur.currentTime = 0; } catch (e) { /* ещё не загружен */ }
          cur.play().catch(next);
        };
        next();
      }),
    };
  }
  // WebAudio-буфер: позволяет играть десятки наложенных голосов с разной высотой и сдвигом
  async function loadBuf(url) {
    const a = audio(); if (!a) return null;
    try {
      const r = await fetch(new URL(url, BASE).href);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const ab = await r.arrayBuffer();
      return await new Promise((res, rej) => a.decodeAudioData(ab, res, rej));
    } catch (e) { console.warn('[JoJo Stands] звук не загружен', url, e); return null; }
  }
  let sndCache = null;
  function sounds() {
    if (!sndCache) {
      const t = new Audio(); t.preload = 'auto'; t.addEventListener('error', () => { t._bad = true; }); t.src = new URL(SND.tick, BASE).href;
      sndCache = { mhName: loadBuf(SND.mhName), cmShift: loadBuf(SND.cmShift), cmName: loadBuf(SND.cmName), cmPre: SND.cmPre.map(loadBuf), swPop: loadBuf(SND.swPop), geLife: loadBuf(SND.geLife), mtName: loadBuf(SND.mtName), geName: loadBuf(SND.geName), kcName: loadBuf(SND.kcName), kcSkip: loadBuf(SND.kcSkip), kcSkip2: loadBuf(SND.kcSkip2), start: loadClip(SND.start), startBuf: loadBuf(SND.start[0]), stop: loadClip(SND.stop), stopBuf: loadBuf(SND.stop[0]), resume: loadBuf(SND.resume), tick: t, yes: loadBuf(SND.yes), dojaan: loadBuf(SND.dojaan), silver: loadClip([SND.silver]), slice: loadBuf(SND.slice), d4name: loadBuf(SND.d4name), mrName: loadBuf(SND.mrName), hg: loadClip([SND.hg]), sp: SND.sp.map(loadBuf), hdName: loadBuf(SND.hdName), hdFlip: loadBuf(SND.hdFlip), hdSlam: loadBuf(SND.hdSlam), hdOpen: loadBuf(SND.hdOpen), kq: loadBuf(SND.kq), kqEye: loadBuf(SND.kqEye), thName: loadBuf(SND.thName), thErase: loadBuf(SND.thErase), swName: loadBuf(SND.swName) };
    }
    return sndCache;
  }
  function playTick(i, snd) {
    const t = snd.tick;
    if (t._bad || t.readyState < 2) return sndTick(i);
    const c = t.cloneNode(); c.play().catch(() => sndTick(i));
  }

  const CLOCK = `<svg viewBox="0 0 200 200" width="150" height="150"><circle cx="100" cy="100" r="92" fill="rgba(10,5,25,.55)" stroke="#fde68a" stroke-width="5"/>${
    Array.from({ length: 12 }, (_, i) => `<line x1="100" y1="14" x2="100" y2="${i % 3 ? 22 : 30}" stroke="#fde68a" stroke-width="${i % 3 ? 3 : 5}" transform="rotate(${i * 30} 100 100)"/>`).join('')
  }<g class="jg-hand" style="transform-origin:100px 100px"><line x1="100" y1="112" x2="100" y2="24" stroke="#f87171" stroke-width="4" stroke-linecap="round"/></g><circle cx="100" cy="100" r="7" fill="#fde68a"/></svg>`;

  // Водяная рябь на краю волны: яркий гребень, тёмная впадина за ним и затухающие круги следом.
  // Рисуем на canvas только узкие кольца — это на порядок легче, чем фильтры на весь экран.
  const RIPPLE_PROFILE = [[5, [10, 5, 40, 0]], [2.6, [10, 5, 40, 0.35]], [1, [255, 255, 255, 0]], [0.15, [255, 255, 255, 0.95]], [-0.5, [170, 225, 255, 0.5]], [-1.6, [170, 225, 255, 0]]];
  function drawRipple(ctx, cx, cy, r, dir, k) {
    const layers = [[1, 0, 1, 1], [dir > 0 ? 0.86 : 1.14, 2 * k, 0.5, 0.7], [dir > 0 ? 0.72 : 1.28, 4 * k, 0.28, 0.5]];
    for (const [f, ex, amp, sc] of layers) {
      const c = dir > 0 ? r * f - ex : r * f + ex;
      const st = RIPPLE_PROFILE.map(([a, col]) => [c - dir * a * k * sc, col, a]).sort((x, y) => x[0] - y[0]);
      const r0 = Math.max(0, st[0][0]), r1 = st[st.length - 1][0];
      if (r1 <= 1 || r1 <= r0) continue;
      const g = ctx.createRadialGradient(cx, cy, r0, cx, cy, r1);
      st.forEach(([rad, col]) => g.addColorStop(Math.min(1, Math.max(0, (rad - r0) / (r1 - r0))), `rgba(${col[0]},${col[1]},${col[2]},${col[3] * amp})`));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, r1, 0, Math.PI * 2);
      if (r0 > 0) ctx.arc(cx, cy, r0, 0, Math.PI * 2, true);
      ctx.fill('evenodd');
    }
  }

  // Название стенда крупным текстом (пока играет звук); hide(min) ждёт минимум min мс от появления, затем плавно гасит
  // veil (необязательно) = { bg: 'rgba(...)', blur: px } — полупрозрачная цветная подложка за надписью (слой .jg-ttl-veil: z-index 65, над кусочками экрана, под надписью); появляется и гаснет вместе с ней
  function titleCard(fx, jp, en, cls, veil) {
    const d = document.createElement('div'); d.className = 'jg-ttl ' + cls; d.innerHTML = `<b>${jp}</b><small>${en}</small>`;
    fx.appendChild(d);
    let v = null;
    if (veil) {
      v = document.createElement('div'); v.className = 'jg-ttl-veil'; v.style.background = veil.bg;
      v.style.backdropFilter = v.style.webkitBackdropFilter = `blur(${veil.blur ?? 4}px)`;
      fx.insertBefore(v, d);
      v.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 350, easing: 'ease-out', fill: 'forwards' });
    }
    d.animate([{ opacity: 0, transform: 'translateY(-50%) scale(1.3)' }, { opacity: 1, transform: 'translateY(-50%) scale(1)' }], { duration: 450, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'forwards' });
    const t0 = performance.now();
    return {
      hide: (min = 1200) => {
        const wait = Math.max(0, min - (performance.now() - t0));
        setTimeout(() => {
          if (v) v.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }).finished.then(() => v.remove(), () => v.remove());
          d.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250, fill: 'forwards' }).finished.then(() => d.remove(), () => d.remove()); }, wait);
        return sleep(wait);
      },
    };
  }
  // The World: волна меняет цвета (негатив), 3 удара часов (раз в секунду), слой схлопывается в центр
  async function timeStop(dlg, reveal, snd) {
    const W = window.innerWidth, H = window.innerHeight;
    const R = Math.ceil(Math.hypot(W, H) / 2 * 1.08);
    const modal = dlg.querySelector('.jg-modal'), rc = modal.getBoundingClientRect();
    // Снимок окна с негативом считается один раз; дальше анимируется только круглая маска (дёшево)
    const cl = modal.cloneNode(true);
    cl.removeAttribute('id'); cl.querySelectorAll('[id]').forEach((e) => e.removeAttribute('id'));
    cl.querySelectorAll('[data-act]').forEach((e) => e.removeAttribute('data-act'));
    cl.querySelectorAll('.jg-toast').forEach((e) => e.remove());
    cl.style.cssText = `position:absolute;margin:0;left:${rc.left}px;top:${rc.top}px;width:${rc.width}px;height:${rc.height}px;max-height:none;animation:none`;
    const fx = document.createElement('div');
    fx.className = 'jg-fx';
    fx.innerHTML = '<div class="jg-fx-wave"><div class="jg-fx-snap"></div><div class="jg-fx-tint"></div></div><canvas class="jg-fx-canvas"></canvas><div class="jg-fx-clock">' + CLOCK + '</div>';
    fx.querySelector('.jg-fx-snap').appendChild(cl);
    dlg.appendChild(fx);
    const wave = fx.querySelector('.jg-fx-wave'), cv = fx.querySelector('.jg-fx-canvas'), clock = fx.querySelector('.jg-fx-clock'), hand = fx.querySelector('.jg-hand');
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const ctx2 = cv.getContext('2d'); ctx2.scale(dpr, dpr);
    const k = Math.max(12, Math.round(Math.min(W, H) / 18)); // толщина гребня, px
    const circ = (r) => `circle(${r}px at 50% 50%)`;
    // запускает раскрытие/схлопывание маски и рисует рябь строго в такт ей
    const sweep = (from, to, o, dir) => {
      const an = wave.animate([{ clipPath: circ(from * R) }, { clipPath: circ(to * R) }], o);
      const draw = () => {
        const pr = an.effect.getComputedTiming().progress ?? 0;
        ctx2.clearRect(0, 0, W, H);
        if (an.playState === 'running') { drawRipple(ctx2, W / 2, H / 2, (from + (to - from) * pr) * R, dir, k); requestAnimationFrame(draw); }
      };
      draw();
      return an;
    };
    ui.fx = true;
    const [bStart, bStop, bResume] = [await snd.startBuf, await snd.stopBuf, await snd.resume];
    try {
      // 1) сначала только надпись «The World» вместе с первым звуком (эффекта ещё нет)
      const t0 = performance.now();
      const ttl = titleCard(fx, 'ザ・ワールド', 'THE WORLD', 'tw', { bg: 'rgba(255,200,40,.28)', blur: 4 }); // полупрозрачный жёлтый фон за надписью
      const a = audio();
      if (a && bStart) {
        // звук стартует вместе с надписью, надпись гаснет ровно к концу звука (тишина по краям записи отрезается)
        const [s0, e0] = audibleSpan(bStart), len = e0 - s0, src = a.createBufferSource(), g = a.createGain(), t = a.currentTime;
        src.buffer = bStart; g.gain.setValueAtTime(1, t); g.gain.setValueAtTime(1, t + len - 0.04); g.gain.linearRampToValueAtTime(0.0001, t + len);
        src.connect(g); g.connect(a.destination); src.start(t, s0, len);
        ttl.hide(Math.max(600, len * 1000 - 250));
        await sleep(Math.max(900, len * 1000));
      } else {
        // запасной вариант: звук из файла/ссылки через <audio>
        const intro = snd.start.play();
        intro.then((ok) => { if (!ok && performance.now() - t0 < 2500) sndBoom(); });
        await intro;
        await ttl.hide(1100);
      }
      // 2) только теперь появляется эффект: волна расходится от центра (1.1 с)
      // сразу в начале эффекта играет time-stop; тиканье начнётся, когда он доиграет
      let stopP = null, stopLen = 0;
      if (a && bStop) {
        const [s1, e1] = audibleSpan(bStop), src = a.createBufferSource();
        src.buffer = bStop; src.connect(a.destination); src.start(a.currentTime, s1, e1 - s1); stopLen = (e1 - s1) * 1000;
      } else { stopP = snd.stop.play(); stopP.then((ok) => { if (!ok) sndBoom(); }); }
      sweep(0, 1, { duration: 1100, easing: 'cubic-bezier(.25,.6,.3,1)', fill: 'forwards' }, 1);
      await sleep(1100);
      if (stopP) await stopP; else if (stopLen > 1100) await sleep(stopLen - 1100);
      // 3) три удара часов с интервалом 1 с
      clock.animate([{ opacity: 0, transform: 'translate(-50%,-50%) scale(.6)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1)' }], { duration: 250, fill: 'forwards' });
      for (let i = 0; i < 3; i++) {
        playTick(i, snd);
        hand.style.transition = 'transform .09s cubic-bezier(.3,2,.5,1)';
        hand.style.transform = `rotate(${(i + 1) * 30}deg)`; // один тик — одно деление циферблата (30°)
        clock.firstElementChild.animate([{ transform: 'scale(1.1)' }, { transform: 'scale(1)' }], { duration: 220 });
        await sleep(i < 2 ? 1000 : 300); // дошли до трёх — почти сразу слой начинает схлопываться
      }
      // 4) слой схлопывается в центр, под ним появляется результат (0.9 с)
      if (a && bResume) { const [r0, r1] = audibleSpan(bResume), src = a.createBufferSource(); src.buffer = bResume; src.connect(a.destination); src.start(a.currentTime, r0, r1 - r0); } // второй звук — как только часы дошли до трёх и слой начал схлопываться
      else sndRelease();
      clock.animate({ opacity: [1, 0] }, { duration: 250, fill: 'forwards' });
      reveal();
      sweep(1, 0, { duration: 900, easing: 'cubic-bezier(.6,0,.3,1)', fill: 'forwards' }, -1);
      await sleep(900);
    } finally { fx.remove(); ui.fx = false; }
  }
  // ---------- D4C: «Yes! Yes! Yes! ... Dojaan!» ; в начале — надпись + голос (начало и конец совпадают) на голубом фоне ----------
  // Раскладка: сетка с нечётным числом столбцов и строк, центральная картинка ровно по центру экрана.
  function d4cLayout(W, H, total = 50) {
    const odd = (n) => 2 * Math.floor(n / 2) + 1;
    const sz = Math.sqrt((W * H) / total);
    const nc = Math.max(3, odd(W / sz)), nr = Math.max(3, odd(H / sz));
    const cw = Math.min(W / nc, 240), ch = Math.min(H / nr, 240);
    const cells = [];
    for (let j = -(nr - 1) / 2; j <= (nr - 1) / 2; j++) for (let i = -(nc - 1) / 2; i <= (nc - 1) / 2; i++) if (i || j) cells.push({ i, j });
    // сначала соседи по бокам, потом ряды выше и ниже — расходятся от центра
    cells.sort((a, b) => (a.i * a.i + a.j * a.j * 2.2) - (b.i * b.i + b.j * b.j * 2.2) || Math.random() - 0.5);
    const rnd = (r) => (Math.random() * 2 - 1) * r;
    const items = [{ x: W / 2, y: H / 2, w: cw, h: ch, rot: 0 }];
    // первые 3 клона стоят на фиксированных местах: центр и два соседа по бокам
    cells.splice(0, 2).forEach((c) => items.push({ x: W / 2 + c.i * cw + rnd(cw * 0.1), y: H / 2 + c.j * ch + rnd(ch * 0.1), w: cw * 1.3, h: ch * 1.3, rot: rnd(6) }));
    // остальные (≈47) появляются в случайных местах и ложатся друг на друга слоями; ячейки сетки гарантируют, что экран закрыт полностью
    for (let i = cells.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [cells[i], cells[j]] = [cells[j], cells[i]]; }
    const rest = cells.map((c) => ({ x: W / 2 + c.i * cw + rnd(cw * 0.18), y: H / 2 + c.j * ch + rnd(ch * 0.18) }));
    while (rest.length < 47) rest.push({ x: Math.random() * W, y: Math.random() * H });
    rest.forEach((p) => { const sc = 1.45 + Math.random() * 0.3; items.push({ x: p.x, y: p.y, w: cw * sc, h: ch * sc, rot: rnd(10) }); });
    return items;
  }
  function voice(a, dest, buf, when, rate, gain, pan) {
    const src = a.createBufferSource(); src.buffer = buf; src.playbackRate.value = rate;
    const g = a.createGain(); g.gain.value = gain; src.connect(g);
    let out = g;
    if (a.createStereoPanner) { const p = a.createStereoPanner(); p.pan.value = pan; g.connect(p); out = p; }
    out.connect(dest); src.start(a.currentTime + when);
  }

  // где в записи реально звучит голос (сек): тишину по краям отрезаем, чтобы надпись и звук начинались и кончались вместе
  function audibleSpan(buf, thr = 0.005) {
    const n = buf.length, sr = buf.sampleRate, ch = [];
    for (let c = 0; c < buf.numberOfChannels; c++) ch.push(buf.getChannelData(c));
    const loud = (i) => ch.some((d) => Math.abs(d[i]) > thr);
    let s = 0, e = n - 1;
    while (s < n && !loud(s)) s++;
    while (e > s && !loud(e)) e--;
    const from = Math.max(0, s / sr - 0.02), to = Math.min(buf.duration, e / sr + 0.05);
    return to - from < 0.2 ? [0, buf.duration] : [from, to];
  }
  async function d4cReveal(dlg, reveal, snd, st) {
    const W = window.innerWidth, H = window.innerHeight;
    const items = d4cLayout(W, H), total = items.length;
    // порции: 1 → 3 → 6 → 12 → 24 → все (≈ удвоение, интервалы сокращаются)
    const stages = [[0, 1], [1300, 3], [2300, 6], [3100, 12], [3800, 24], [4400, total]].map(([t, n]) => [t, Math.min(n, total)]).filter(([, n], i, arr) => i === 0 || n > arr[i - 1][1]);
    stages[stages.length - 1][1] = total;
    const [bufYes, bufDo, bufName] = [await snd.yes, await snd.dojaan, await snd.d4name];
    const pre = new Image(); pre.src = st.icon || '';
    if (isUrl(st.icon)) await Promise.race([pre.decode().catch(() => {}), sleep(2500)]);

    const fx = document.createElement('div');
    fx.className = 'jg-fx jg-d4c';
    const els = items.map((it) => {
      const e = document.createElement(isUrl(st.icon) ? 'img' : 'div');
      e.className = 'jg-d4-img' + (isUrl(st.icon) ? ' jg-img' : '');
      if (isUrl(st.icon)) { e.src = st.icon; e.dataset.u = st.icon; e.dataset.fb = ICON[normType(st.type)] || '✨'; e.referrerPolicy = 'no-referrer'; e.alt = ''; }
      else { e.textContent = st.icon || '✨'; e.style.fontSize = Math.min(it.w, it.h) * 0.7 + 'px'; }
      e.style.cssText += `;left:${it.x - it.w / 2}px;top:${it.y - it.h / 2}px;width:${it.w}px;height:${it.h}px`;
      fx.appendChild(e);
      return e;
    });
    dlg.appendChild(fx);
    ui.fx = true;
    const a = audio();
    let master = null;
    if (a) { master = a.createDynamicsCompressor(); master.threshold.value = -14; master.ratio.value = 6; master.connect(a.destination); }
    const rnd = (lo, hi) => lo + Math.random() * (hi - lo);
    const pose = (it, sc) => `rotate(${it.rot}deg) scale(${sc})`;
    try {
      fx.style.background = 'rgba(125,195,255,.26)'; fx.style.backdropFilter = fx.style.webkitBackdropFilter = 'blur(5px)'; // на время надписи фон лёгкий голубой и слегка размытый (радиус — в blur(...))
      fx.style.transition = 'background-color .4s, backdrop-filter .4s, -webkit-backdrop-filter .4s';
      fx.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: 'forwards' });
      // 0) надпись и голос стартуют вместе; надпись гаснет ровно к концу звука
      const [ns, ne] = bufName ? audibleSpan(bufName) : [0, 2];
      const dN = (ne - ns) * 1000;
      const ttl = titleCard(fx, 'いともたやすく行われる<br>えげつない行為', 'DIRTY DEEDS DONE DIRT CHEAP', 'd4');
      if (a && bufName) {
        const src = a.createBufferSource(), g = a.createGain(), t = a.currentTime;
        src.buffer = bufName; g.gain.setValueAtTime(1, t); g.gain.setValueAtTime(1, t + (ne - ns) - 0.04); g.gain.linearRampToValueAtTime(0.0001, t + (ne - ns));
        src.connect(g); g.connect(a.destination); src.start(t, ns, ne - ns);
      }
      ttl.hide(Math.max(600, dN - 250)); // 250 мс — плавное гашение, заканчивается вместе со звуком
      await sleep(dN);
      fx.style.background = ''; fx.style.backdropFilter = fx.style.webkitBackdropFilter = ''; // голубой фон и размытие уходят, возвращается тёмное затемнение — дальше «Yes!»
      await sleep(400);
      // 1) «Yes!» — копии появляются порциями, каждая порция говорит своё yes
      let shown = 0;
      const t0 = performance.now();
      for (let si = 0; si < stages.length; si++) {
        const [at, upto] = stages[si];
        const wait = at - (performance.now() - t0);
        if (wait > 0) await sleep(wait);
        const k = upto - shown;
        for (let n = shown; n < upto; n++) {
          const j = n - shown;
          els[n].animate([{ opacity: 0, transform: pose(items[n], 0.4) }, { opacity: 1, transform: pose(items[n], 1) }],
            { duration: 220, delay: si === 0 ? 0 : si === 1 ? (j / k) * 130 : rnd(0, 300), // группы после первой тройки: у каждого клона свой случайный старт в пределах 0.3 с
             easing: 'cubic-bezier(.2,1.5,.4,1)', fill: 'forwards' });
        }
        shown = upto;
        if (a && master && bufYes) {
          const nv = Math.min(k, 8);
          for (let v = 0; v < nv; v++) voice(a, master, bufYes, si === 0 ? 0 : (v ? rnd(0, si === 1 ? 0.13 : 0.3) : 0), si === 0 || !v ? 1 : rnd(0.94, 1.08), Math.min(1, 1.15 / Math.sqrt(nv)), si === 0 ? 0 : rnd(-0.8, 0.8));
        }
      }
      // 2) ждём, пока договорит последнее «yes», + 0.2 с — и общий «Dojaan»
      await sleep(((bufYes ? audibleSpan(bufYes)[1] / 0.94 : 0.5) + 0.3 + 0.2) * 1000);
      // 3) «Dojaan!» хором: у каждого свой старт и своя высота
      const nv = Math.min(total, 14);
      let dur = 1.6;
      if (a && master && bufDo) {
        for (let v = 0; v < nv; v++) voice(a, master, bufDo, v ? rnd(0, 0.22) : 0, v ? rnd(0.93, 1.08) : 1, Math.min(1, 1.25 / Math.sqrt(nv)), v ? rnd(-0.8, 0.8) : 0);
        dur = bufDo.duration / 0.93 + 0.25;
      }
      els.forEach((e, n) => {
        const it = items[n], dx = rnd(-3, 3), dy = rnd(-3, 3);
        e.animate([{ transform: pose(it, 1) }, { transform: `translate(${dx}px,${dy}px) rotate(${it.rot + rnd(-1.5, 1.5)}deg) scale(1.1)` }],
          { duration: 90, iterations: Infinity, direction: 'alternate', delay: rnd(0, 220), fill: 'both' });
      });
      await sleep(dur * 1000);
      // 4) все исчезают, под ними результат
      reveal(0.5);
      els.forEach((e, n) => e.animate([{ opacity: 1 }, { opacity: 0, transform: pose(items[n], 1.35) }], { duration: 420, delay: rnd(0, 120), fill: 'forwards' }));
      fx.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, delay: 100, fill: 'forwards' });
      await sleep(600);
    } finally { fx.remove(); ui.fx = false; }
  }
  // ---------- Cream: мутно-фиолетовая надпись → красный глаз → экран засасывает в зрачок → чёрный экран → медленное проявление ----------
  // Все тайминги в мс — меняй здесь.
  const CREAM_T = {
    title: 2300,      // надпись + мутно-фиолетовый фон
    eyeIn: 700,       // глаз открывается
    eyeHold: 1000,    // глаз смотрит и пульсирует перед засасыванием (≈1 с)
    suck: 1000,       // экран засасывает в зрачок
    black: 1000,      // чёрный экран
    fadeIn: 2400,     // экран медленно проявляется из чёрного (без возвращения)
  };
  const sndCreamHit = () => { tone({ f0: 80, f1: 30, dur: 1.5, vol: 0.4 }); tone({ type: 'sawtooth', f0: 220, f1: 50, dur: 1.2, vol: 0.04 }); };
  // громкая глухая вибрация: несколько басовых тонов с биениями + тремоло + приглушённый шум; мягкое насыщение (waveshaper) даёт
  // «тело» и верхние гармоники — на телефонных динамиках низ не воспроизводится, а гармоники слышны; компрессор держит громкость без треска
  function creamRumble() {
    const a = audio(); if (!a) return null;
    const t = a.currentTime, LOUD = 2.4; // LOUD — общий множитель громкости: больше — громче и плотнее (насыщение защищает от клиппинга)
    const out = a.createGain();
    out.gain.setValueAtTime(0.0001, t);
    const curve = new Float32Array(1024);
    for (let i = 0; i < curve.length; i++) { const x = i / 512 - 1; curve[i] = Math.tanh(3.6 * x); }
    const sat = a.createWaveShaper(); sat.curve = curve; sat.oversample = '2x';
    const comp = a.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 8; comp.attack.value = 0.005; comp.release.value = 0.2;
    const post = a.createGain(); post.gain.value = 1.0;
    out.connect(sat); sat.connect(comp); comp.connect(post); post.connect(a.destination);
    const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 220; lp.connect(out);
    const trem = a.createGain(); trem.gain.value = 0.62; trem.connect(lp);
    const lfo = a.createOscillator(), lfoG = a.createGain(); lfo.frequency.value = 9; lfoG.gain.value = 0.38; lfo.connect(lfoG); lfoG.connect(trem.gain); lfo.start(t);
    const oscs = [[38, 'sine', 1], [41.5, 'sine', 0.95], [55, 'sine', 0.55], [76, 'triangle', 0.5], [114, 'triangle', 0.32], [152, 'triangle', 0.16]].map(([f, type, v]) => {
      const o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.value = f; g.gain.value = v; o.connect(g); g.connect(trem); o.start(t); return { o, f };
    });
    const nb = a.createBuffer(1, a.sampleRate * 2, a.sampleRate), nd = nb.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    const ns = a.createBufferSource(), nf = a.createBiquadFilter(), ng = a.createGain();
    ns.buffer = nb; ns.loop = true; nf.type = 'lowpass'; nf.frequency.value = 130; ng.gain.value = 0.9; ns.connect(nf); nf.connect(ng); ng.connect(trem); ns.start(t);
    const ramp = (p, v, ms) => { const n = a.currentTime; p.cancelScheduledValues(n); p.setValueAtTime(p.value, n); p.linearRampToValueAtTime(v, n + ms / 1000); };
    return {
      vol: (v, ms) => ramp(out.gain, Math.max(0.0001, v * (v > 0.001 ? LOUD : 1)), ms),
      pitch: (k, ms) => oscs.forEach(({ o, f }) => ramp(o.frequency, f * k, ms)), // k<1 — тон проседает
      stop: () => { try { ramp(out.gain, 0.0001, 150); setTimeout(() => { [lfo, ns, ...oscs.map((x) => x.o)].forEach((n) => { try { n.stop(); } catch (e) { /* уже остановлен */ } }); }, 250); } catch (e) { /* ignore */ } },
    };
  }
  // запасной вариант Cream без WebGL: шар-линза (используется, если не вышел снимок окна или нет WebGL)
  async function creamVoidCss(dlg, reveal) {
    const W = window.innerWidth, H = window.innerHeight, cx = W / 2, cy = H / 2;
    const T = CREAM_T, EW = Math.min(W * 0.78, 400); // ширина глаза, px
    const modal = dlg.querySelector('.jg-modal'), rc = modal.getBoundingClientRect();
    modal.style.transformOrigin = `${cx - rc.left}px ${cy - rc.top}px`;
    const fx = document.createElement('div');
    fx.className = 'jg-fx jg-cr';
    // красный глаз: тёмная склера с венами, светящаяся радужка, вертикальный зрачок-щель, блик; веки — масштаб по Y
    const veins = [[100, 50, 14, 22], [100, 50, 40, 6], [100, 50, 60, 4], [100, 50, 150, 8], [100, 50, 186, 26], [100, 50, 52, 96], [100, 50, 150, 94], [100, 50, 24, 78], [100, 50, 176, 74]]
      .map(([x, y, ex, ey]) => `<path d="M${x},${y} Q${(x + ex) / 2 + (ey > 50 ? 6 : -6)},${(y + ey) / 2} ${ex},${ey}" stroke="#c00000" stroke-width="1.1" fill="none" opacity=".55"/>`).join('');
    fx.innerHTML = `<div class="jg-cr-black"></div><div class="jg-cr-red"></div>
      <svg class="jg-cr-eye" viewBox="0 0 200 100" width="${EW}" height="${EW / 2}">
        <defs>
          <clipPath id="crEyeClip"><path d="M4,50 Q100,-18 196,50 Q100,118 4,50Z"/></clipPath>
          <radialGradient id="crSclera" cx=".5" cy=".5" r=".62"><stop offset="0" stop-color="#4a0808"/><stop offset=".65" stop-color="#1c0303"/><stop offset="1" stop-color="#000"/></radialGradient>
          <radialGradient id="crIris" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ff7a55"/><stop offset=".5" stop-color="#f00000"/><stop offset=".85" stop-color="#7a0000"/><stop offset="1" stop-color="#3a0000"/></radialGradient>
        </defs>
        <g clip-path="url(#crEyeClip)">
          <rect width="200" height="100" fill="url(#crSclera)"/>
          ${veins}
          <circle cx="100" cy="50" r="30" fill="url(#crIris)"/>
          <circle cx="100" cy="50" r="30" fill="none" stroke="#2a0000" stroke-width="2"/>
          <ellipse class="jg-cr-pupil" cx="100" cy="50" rx="5" ry="27" fill="#000"/>
          <ellipse cx="110" cy="39" rx="4" ry="2.6" fill="#fff" opacity=".8"/>
          <path d="M4,50 Q100,-18 196,50 Q100,118 4,50Z" fill="none" stroke="#000" stroke-width="5" opacity=".7"/>
        </g>
      </svg>`;
    const black = fx.querySelector('.jg-cr-black'), red = fx.querySelector('.jg-cr-red'), eye = fx.querySelector('.jg-cr-eye'), pupil = fx.querySelector('.jg-cr-pupil');
    dlg.appendChild(fx);
    ui.fx = true;
    let dead = false, revealed = false, rumble = null;
    const doReveal = (d) => { if (revealed) return; revealed = true; reveal(d); };
    const ease = { out: (u) => 1 - Math.pow(1 - u, 3), in: (u) => Math.pow(u, 2.2), smooth: (a, b, u) => { const x = Math.min(1, Math.max(0, (u - a) / (b - a))); return x * x * (3 - 2 * x); } };
    // run: вызывает fn(u 0..1) каждый кадр в течение ms
    const run = (ms, fn) => new Promise((res) => {
      const t0 = performance.now();
      const f = (now) => { const u = Math.min(1, (now - t0) / ms); fn(u); if (u < 1 && !dead) requestAnimationFrame(f); else res(); };
      requestAnimationFrame(f);
    });
    // open — раскрытие век (0..1), sc — размер глаза, pr — ширина зрачка
    const setEye = (open, sc, pr) => { eye.style.transform = `translate(-50%,-50%) scale(${sc},${Math.max(0.001, sc * open)})`; pupil.setAttribute('rx', pr); };
    // s — масштаб окна, rot — поворот (воронка), sh — дрожь в px
    const setModal = (s, rot, sh = 0) => { modal.style.transform = `translate(${(Math.random() * 2 - 1) * sh}px,${(Math.random() * 2 - 1) * sh}px) rotate(${rot}deg) scale(${s})`; };
    try {
      // 1) надпись + мутно-фиолетовый фон (как у D4C, только фиолетовый); потом фон возвращается в норму
      fx.style.transition = 'background-color .45s, backdrop-filter .45s, -webkit-backdrop-filter .45s';
      void fx.offsetWidth;
      fx.style.background = 'rgba(95,50,150,.34)'; fx.style.backdropFilter = fx.style.webkitBackdropFilter = 'blur(4px) saturate(.85)';
      const ttl = titleCard(fx, 'クリーム', 'CREAM', 'cr');
      sndCreamHit();
      ttl.hide(T.title - 250);
      await sleep(T.title - 450);
      fx.style.background = ''; fx.style.backdropFilter = fx.style.webkitBackdropFilter = '';
      await sleep(450);
      // 2) красный глаз в центре: веки раскрываются, края экрана краснеют; висит ≈1 с и пульсирует; низкая вибрация
      rumble = creamRumble();
      if (rumble) rumble.vol(0.8, 400);
      await run(T.eyeIn, (u) => { const e = ease.out(u); setEye(e, 0.85 + 0.15 * e, 5); red.style.opacity = 0.75 * e; });
      await run(T.eyeHold, (u) => {
        const b = Math.pow(Math.max(0, Math.sin(u * Math.PI * 6)), 6); // удары «сердца» глаза
        setEye(1, 1 + 0.05 * b, 5 + 2.5 * b); red.style.opacity = 0.75 + 0.25 * b; setModal(1, 0, 1.2); // лёгкая дрожь окна в такт вибрации
      });
      // 3) экран засасывает в зрачок: окно сжимается к центру и закручивается, зрачок расширяется, всё краснеет и темнеет, глаз закрывается
      if (rumble) { rumble.vol(1.0, T.suck * 0.6); rumble.pitch(0.72, T.suck); }
      await run(T.suck, (u) => {
        const e = ease.in(u);
        setModal(Math.max(0, 1 - e), e * 140, 1.5 * (1 - u));
        setEye(u < 0.85 ? 1 : 1 - (u - 0.85) / 0.15, 1 + 0.3 * e, 5 + 36 * e);
        red.style.opacity = 1 - 0.3 * ease.smooth(0.5, 1, u);
        black.style.opacity = ease.smooth(0.7, 1, u);
      });
      setEye(0, 1, 5); black.style.opacity = 1; setModal(0, 140);
      // 4) чёрный экран
      if (rumble) rumble.vol(0.22, 300);
      await sleep(T.black);
      // 5) без возвращения: окно сразу на месте под чернотой, экран медленно проявляется
      setModal(1, 0); doReveal(1.0); red.style.opacity = 0;
      await run(T.fadeIn, (u) => { black.style.opacity = 1 - ease.smooth(0, 1, u); });
    } finally {
      dead = true;
      if (rumble) rumble.stop();
      fx.remove(); modal.style.transform = ''; modal.style.transformOrigin = ''; ui.fx = false;
      doReveal(0.2); // если что-то пошло не так — результат всё равно покажется
    }
  }
  // ---------- Cream (WebGL): окно скручивается в воронку-пустоту ----------
  // Снимок окна → текстура → твой шейдер скручивания, доработанный: пинч (затягивание), мотion-блюр по вращению,
  // хроматическая аберрация, «дышащие» лепестки, фиолетовое тёмное ядро и светящееся кольцо по краю.
  // Если WebGL/снимок недоступны — автоматически запасной вариант creamVoidCss (шар-линза).
  const CREAM_FX = {
    radius: 0.46,     // радиус воронки, доля от min(ширина, высота)
    twist: 3.2,       // угол скручивания в центре (рад) когда воронка появилась
    twistHold: 6.5,   // …и к концу «зависания»
    twistSuck: 16,    // …и в момент засасывания
    pinch: 0.3,       // затягивание к центру: появление → зависание → засасывание
    pinchHold: 0.45,
    pinchSuck: 0.95,
    core: 0.12,       // радиус тёмного ядра, доля от радиуса воронки (появление)
    coreHold: 0.16,
    aberr: 0.04,      // хроматическая аберрация
    aberrSuck: 0.07,
  };
  const SWIRL_VS = 'attribute vec2 aPos;void main(){gl_Position=vec4(aPos,0.0,1.0);}';
  const SWIRL_FS = `
precision highp float;
uniform sampler2D uScene;
uniform vec2 uResolution;
uniform vec2 uCenterPx;
uniform float uRadius;
uniform float uStrength;
uniform float uPinch;
uniform float uScale;
uniform float uCore;
uniform float uTime;
uniform float uAberr;

float hash21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }

// сцена вне текстуры прозрачна (а не «размазанный» край, как при clamp)
vec4 scene(vec2 px) {
  vec2 uv = px / uResolution;
  if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return vec4(0.0);
  return texture2D(uScene, uv);
}
// вся сцена сжимается к центру (уходит в воронку)
vec2 shrinkPx(vec2 p) { return uCenterPx + (p - uCenterPx) / max(uScale, 0.0001); }
// обратное преобразование координат выборки: поворот + затягивание
vec2 warpPx(vec2 delta, float a, float m) {
  float c = cos(a), s = sin(a);
  mat2 rot = mat2(c, -s, s, c);
  return uCenterPx + (rot * delta) * m;
}

void main() {
  vec2 px = gl_FragCoord.xy;
  vec2 delta = px - uCenterPx;
  float dist = length(delta);
  float ang0 = atan(delta.y, delta.x);
  vec4 col = scene(shrinkPx(px));
  float inside = (uRadius > 1.0 && dist < uRadius) ? 1.0 : 0.0;
  float falloff = inside * (1.0 - smoothstep(0.0, 1.0, dist / max(uRadius, 1.0)));

  if (inside > 0.5) {
    // воронка сама понемногу накручивается со временем
    float wind = uStrength + 0.8 * uTime * clamp(uStrength, 0.0, 1.0);
    // лепестки «дышат»: угол слегка гуляет по окружности и во времени
    float wob = 1.0 + 0.08 * sin(3.0 * ang0 + uTime * 2.2) * falloff;
    float angle = wind * falloff * falloff * wob;
    // затягивание: у центра берём точки из более далёких мест — содержимое сжимается к центру
    float m = 1.0 + uPinch * falloff * falloff;

    vec4 acc = vec4(0.0);
    for (int i = 0; i < 8; i++) {
      float t = float(i) / 7.0 - 0.5;
      float a = angle * (1.0 + t * 0.14);              // размытие вдоль вращения
      vec4 sr = scene(shrinkPx(warpPx(delta, a * (1.0 + uAberr), m)));
      vec4 sg = scene(shrinkPx(warpPx(delta, a, m)));
      vec4 sb = scene(shrinkPx(warpPx(delta, a * (1.0 - uAberr), m)));  // каналы чуть разъезжаются
      acc += vec4(sr.r, sg.g, sb.b, (sr.a + sg.a + sb.a) / 3.0);
    }
    vec4 distorted = acc / 8.0;
    float edge = 1.0 - smoothstep(uRadius - max(25.0, uRadius * 0.1), uRadius, dist);
    col = mix(col, distorted, edge);

    float k = clamp(uStrength * 0.25, 0.0, 1.0);
    // фиолетовый оттенок и затемнение к центру
    col.rgb = col.rgb * (1.0 - 0.35 * k * falloff) + vec3(0.07, 0.0, 0.14) * k * falloff * col.a;

    // светящиеся спиральные рукава (логарифмическая спираль), вращаются вместе с воронкой
    float arm = pow(0.5 + 0.5 * sin(ang0 * 2.0 - log(dist + 1.0) * 4.5 + uTime * 3.0), 3.0);
    float armK = arm * falloff * smoothstep(uCore * 0.8, uCore * 3.0, dist) * k * 0.4;
    col.rgb += vec3(0.55, 0.28, 0.95) * armK;
    col.a = clamp(col.a + armK, 0.0, 1.0);

    // частицы, по спирали летящие внутрь
    vec2 sp = vec2(ang0 / 6.2832 * 48.0 + log(dist + 1.0) * 3.0, log(dist + 1.0) * 14.0 + uTime * 2.5);
    vec2 id = floor(sp), f = fract(sp) - 0.5;
    float h = hash21(id);
    if (h > 0.9) {
      vec2 off = (vec2(hash21(id + 7.3), hash21(id + 3.1)) - 0.5) * 0.5;
      vec2 d2 = (f - off) * vec2(0.6, 1.0);
      float star = smoothstep(0.14, 0.0, length(d2)) * (h - 0.9) * 10.0 * falloff * smoothstep(uCore, uCore * 2.0, dist) * k;
      col.rgb += vec3(0.85, 0.75, 1.0) * star * 0.9;
      col.a = clamp(col.a + star, 0.0, 1.0);
    }
  }

  // чёрное ядро (горизонт событий) с горящим аккреционным кольцом
  if (uCore > 1.0) {
    col.rgb *= mix(0.25, 1.0, smoothstep(uCore * 0.7, uCore * 2.5, dist));
    float hz = 1.0 - smoothstep(uCore * 0.55, uCore * 0.7, dist);
    col = col * (1.0 - hz) + vec4(0.0, 0.0, 0.0, 1.0) * hz;
    float x = (dist - uCore * 0.85) / (uCore * 0.25 + 1.0);
    float disk = exp(-x * x) * (0.75 + 0.25 * cos(ang0 + 0.6 + uTime * 0.7));  // яркая сторона вращается
    float rad = clamp((dist - uCore * 0.6) / (uCore * 0.8), 0.0, 1.0);
    vec3 dc = mix(vec3(1.0, 0.92, 1.0), vec3(0.62, 0.25, 1.0), rad);
    dc = mix(dc, vec3(0.9, 0.2, 0.7), smoothstep(0.6, 1.0, rad) * 0.5);
    col.rgb += dc * disk * 1.1;
    float x2 = (dist - uCore) / (uCore * 0.9 + 1.0);
    col.rgb += vec3(0.5, 0.2, 0.9) * exp(-x2 * x2) * 0.25;
    col.a = clamp(col.a + disk + exp(-x2 * x2) * 0.25, 0.0, 1.0);
  }

  // светящееся кольцо по краю воронки, внутреннее слабое, и мягкое свечение наружу
  if (uRadius > 1.0) {
    float k = uRadius * 0.035 + 2.0;
    float x1 = (dist - uRadius) / k;
    float x2 = (dist - uRadius * 0.93 - sin(uTime * 5.0) * uRadius * 0.01) / (k * 1.6);
    float on = clamp(uStrength * 0.4, 0.0, 1.0);
    float halo = dist > uRadius ? exp(-(dist - uRadius) / (uRadius * 0.22)) * 0.22 : 0.0;
    float g = (exp(-x1 * x1) * 0.55 + exp(-x2 * x2) * 0.25 + halo) * on;
    col.rgb += vec3(0.7, 0.55, 1.0) * g;
    col.a = clamp(col.a + g, 0.0, 1.0);
  }
  gl_FragColor = col;
}`;
  function createSwirl(W, H, dpr) {
    const cv = document.createElement('canvas');
    cv.className = 'jg-cr-gl'; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) return null;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, SWIRL_VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, SWIRL_FS)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW); // один треугольник на весь экран
    const loc = gl.getAttribLocation(pr, 'aPos'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const U = {};
    ['uScene', 'uResolution', 'uCenterPx', 'uRadius', 'uStrength', 'uPinch', 'uScale', 'uCore', 'uTime', 'uAberr'].forEach((n) => { U[n] = gl.getUniformLocation(pr, n); });
    gl.uniform1i(U.uScene, 0); gl.uniform2f(U.uResolution, cv.width, cv.height); gl.uniform2f(U.uCenterPx, cv.width / 2, cv.height / 2);
    gl.viewport(0, 0, cv.width, cv.height); gl.clearColor(0, 0, 0, 0);
    return {
      cv,
      setScene(img) {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      },
      // радиусы — в CSS-пикселях, внутри переводятся в пиксели экрана
      draw(p) {
        gl.uniform1f(U.uRadius, p.radius * dpr); gl.uniform1f(U.uStrength, p.strength); gl.uniform1f(U.uPinch, p.pinch);
        gl.uniform1f(U.uScale, p.scale); gl.uniform1f(U.uCore, p.core * dpr); gl.uniform1f(U.uTime, p.time); gl.uniform1f(U.uAberr, p.aberr);
        gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES, 0, 3);
      },
      dispose() { const x = gl.getExtension('WEBGL_lose_context'); if (x) x.loseContext(); },
    };
  }
  // Снимок окна в холст размером с экран (вне окна прозрачно). Своя растеризация через SVG foreignObject:
  // стили копируются с живых элементов, картинки подгружаются с CORS, а если не вышло — вместо них эмодзи-заглушка.
  // hidePop: карточки с анимацией появления в снимок не попадают (они «выскочат» уже в настоящем окне).
  async function captureModal(modal, W, H, dpr, hidePop) {
    const rc = modal.getBoundingClientRect();
    const out = document.createElement('canvas'); out.width = Math.round(W * dpr); out.height = Math.round(H * dpr);
    const src = [modal, ...modal.querySelectorAll('*')], clone = modal.cloneNode(true), dst = [clone, ...clone.querySelectorAll('*')];
    const scrolls = [];
    for (let i = 0; i < src.length; i++) {
      const s = src[i], d = dst[i];
      if (!d || !d.style) continue;
      const cs = getComputedStyle(s);
      let css = '';
      for (let j = 0; j < cs.length; j++) css += cs[j] + ':' + cs.getPropertyValue(cs[j]) + ';';
      d.style.cssText = css + 'animation:none;transition:none;visibility:visible;';
      if (!i) { // корень кладём в (0,0) снимка: убираем всё, что могло его сдвинуть
        ['inset', 'inset-block-start', 'inset-block-end', 'inset-inline-start', 'inset-inline-end', 'right', 'bottom', 'translate', 'rotate', 'scale'].forEach((n) => d.style.removeProperty(n));
        [['position', 'absolute'], ['left', '0px'], ['top', '0px'], ['margin', '0px'], ['transform', 'none']].forEach(([n, v]) => d.style.setProperty(n, v, 'important'));
      }
      if (s instanceof HTMLInputElement) { d.setAttribute('value', s.value); if (s.checked) d.setAttribute('checked', ''); else d.removeAttribute('checked'); }
      else if (s instanceof HTMLTextAreaElement) d.textContent = s.value;
      else if (s instanceof HTMLSelectElement) [...d.options].forEach((o, n) => { if (n === s.selectedIndex) o.setAttribute('selected', ''); else o.removeAttribute('selected'); });
      if (/auto|scroll/.test(cs.overflowX + cs.overflowY)) d.style.setProperty('overflow', 'hidden', 'important'); // без белых полос прокрутки
      if (s.scrollTop || s.scrollLeft) scrolls.push([d, s.scrollLeft, s.scrollTop]);
    }
    // прокрутка: сдвигаем детей прокручиваемого блока (он сам обрезает по своим границам)
    scrolls.forEach(([d, x, y]) => [...d.children].forEach((ch) => { ch.style.transform = `translate(${-x}px,${-y}px)`; }));
    if (hidePop) clone.querySelectorAll('.jg-pop').forEach((e) => { e.style.opacity = '0'; });
    await Promise.all([...clone.querySelectorAll('img')].map(async (d) => {
      try {
        const url = d.getAttribute('src'); if (!url) throw new Error('нет src');
        const im = new Image(); im.crossOrigin = 'anonymous'; im.referrerPolicy = 'no-referrer'; im.src = url;
        await Promise.race([im.decode(), sleep(1500).then(() => { throw new Error('таймаут'); })]);
        const k = document.createElement('canvas'); k.width = im.naturalWidth; k.height = im.naturalHeight;
        k.getContext('2d').drawImage(im, 0, 0); d.src = k.toDataURL();
      } catch (e) {
        const f = document.createElement('div');
        f.style.cssText = d.style.cssText + ';display:flex;align-items:center;justify-content:center;object-fit:initial';
        f.style.fontSize = (Math.min(parseFloat(d.style.width) || 40, parseFloat(d.style.height) || 40) * 0.6) + 'px';
        f.textContent = d.dataset.fb || '✨'; d.replaceWith(f);
      }
    }));
    const xml = new XMLSerializer().serializeToString(clone);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${rc.width * dpr}" height="${rc.height * dpr}"><g transform="scale(${dpr})"><foreignObject x="0" y="0" width="${rc.width}" height="${rc.height}">${xml}</foreignObject></g></svg>`;
    const im = new Image();
    await new Promise((res, rej) => { im.onload = res; im.onerror = () => rej(new Error('SVG-снимок не загрузился')); im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); });
    out.getContext('2d').drawImage(im, rc.left * dpr, rc.top * dpr, rc.width * dpr, rc.height * dpr);
    return out;
  }
  async function creamVoid(dlg, reveal, snd, st) {
    const W = window.innerWidth, H = window.innerHeight, dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const modal = dlg.querySelector('.jg-modal');
    let gl = null;
    try {
      const shot = await captureModal(modal, W, H, dpr, false);
      shot.getContext('2d').getImageData(0, 0, 1, 1); // «заражённый» холст бросит SecurityError — тогда запасной вариант
      gl = createSwirl(W, H, dpr);
      if (gl) gl.setScene(shot);
    } catch (e) { console.warn('[JoJo Stands] Cream: WebGL-воронка недоступна, запасной вариант', e); if (gl) gl.dispose(); gl = null; }
    if (!gl) return creamVoidCss(dlg, reveal, snd, st);

    const T = CREAM_T, F = CREAM_FX, R = Math.min(W, H) * F.radius, rFull = Math.hypot(W, H) / 2 * 1.15;
    const fx = document.createElement('div');
    fx.className = 'jg-fx jg-cr';
    fx.innerHTML = '<div class="jg-cr-black"></div>';
    const black = fx.firstElementChild;
    gl.cv.style.opacity = '0'; fx.appendChild(gl.cv);
    dlg.appendChild(fx);
    ui.fx = true;
    let dead = false, revealed = false, rumble = null;
    const doReveal = (d) => { if (revealed) return; revealed = true; reveal(d); };
    const lerp = (a, b, u) => a + (b - a) * u;
    const ease = { out: (u) => 1 - Math.pow(1 - u, 3), in: (u) => Math.pow(u, 2.2), smooth: (a, b, u) => { const x = Math.min(1, Math.max(0, (u - a) / (b - a))); return x * x * (3 - 2 * x); } };
    const run = (ms, fn) => new Promise((res) => {
      const t0 = performance.now();
      const f = (now) => { const u = Math.min(1, (now - t0) / ms); fn(u); if (u < 1 && !dead) requestAnimationFrame(f); else res(); };
      requestAnimationFrame(f);
    });
    const P = { radius: 0, strength: 0, pinch: 0, scale: 1, core: 0, aberr: 0 };
    const tS = performance.now();
    const frame = () => gl.draw({ ...P, time: (performance.now() - tS) / 1000 });
    const shake = (px) => { gl.cv.style.transform = px ? `translate(${(Math.random() * 2 - 1) * px}px,${(Math.random() * 2 - 1) * px}px)` : ''; };
    try {
      // 1) надпись + мутно-фиолетовый фон (как у D4C), потом фон возвращается в норму
      fx.style.transition = 'background-color .45s, backdrop-filter .45s, -webkit-backdrop-filter .45s';
      void fx.offsetWidth;
      fx.style.background = 'rgba(95,50,150,.34)'; fx.style.backdropFilter = fx.style.webkitBackdropFilter = 'blur(4px) saturate(.85)';
      const ttl = titleCard(fx, 'クリーム', 'CREAM', 'cr');
      sndCreamHit();
      ttl.hide(T.title - 250);
      await sleep(T.title - 450);
      fx.style.background = ''; fx.style.backdropFilter = fx.style.webkitBackdropFilter = '';
      await sleep(450);
      // 2) окно подменяется текстурой (нулевой кадр = исходная картинка), в центре раскручивается воронка; низкая вибрация
      frame();
      gl.cv.animate({ opacity: [0, 1] }, { duration: 150, fill: 'forwards' });
      await sleep(170);
      modal.style.visibility = 'hidden';
      rumble = creamRumble();
      if (rumble) rumble.vol(0.8, 400);
      await run(T.eyeIn, (u) => {
        const e = ease.out(u);
        P.radius = R * e; P.strength = F.twist * e; P.pinch = F.pinch * e; P.core = R * F.core * e; P.aberr = F.aberr * e; frame();
      });
      // воронка «висит» ≈1 с: закручивается сильнее, ядро пульсирует, слегка дрожит
      await run(T.eyeHold, (u) => {
        const e = ease.smooth(0, 1, u);
        P.radius = R * (1 + Math.sin(u * Math.PI * 16) * 0.012);
        P.strength = lerp(F.twist, F.twistHold, e); P.pinch = lerp(F.pinch, F.pinchHold, e);
        P.core = R * lerp(F.core, F.coreHold, e) * (1 + Math.sin(u * Math.PI * 10) * 0.03);
        shake(1.2); frame();
      });
      // 3) поглощение: воронка раскрывается на весь экран, окно целиком уходит в центр, потом воронка схлопывается в чёрную точку
      if (rumble) { rumble.vol(1.0, T.suck * 0.6); rumble.pitch(0.72, T.suck); }
      await run(T.suck, (u) => {
        const e = ease.in(Math.min(1, u / 0.85));            // окно исчезает к 85% времени
        const cw = 1 - ease.smooth(0.8, 1, u);               // последние 20% — схлопывание воронки
        P.radius = lerp(R, rFull * 0.9, e) * cw; P.strength = lerp(F.twistHold, F.twistSuck, e); P.pinch = lerp(F.pinchHold, F.pinchSuck, e);
        P.scale = Math.max(0.0001, 1 - e); P.core = lerp(R * F.coreHold, R * 0.55, e) * cw; P.aberr = lerp(F.aberr, F.aberrSuck, e);
        black.style.opacity = ease.smooth(0.55, 0.95, u); gl.cv.style.opacity = String(1 - ease.smooth(0.85, 1, u)); shake(1.5 * (1 - u)); frame();
      });
      shake(0); gl.cv.style.display = 'none'; black.style.opacity = 1;
      // 4) чёрный экран; под ним уже готов результат (карточки «выскочат» по мере проявления)
      if (rumble) rumble.vol(0.0001, T.black);
      doReveal((T.black + 600) / 1000);
      modal.style.visibility = '';
      await sleep(T.black);
      // 5) экран просто медленно проявляется из чёрного, будто повышают яркость
      await run(T.fadeIn, (u) => { black.style.opacity = 1 - ease.smooth(0, 1, u); });
    } finally {
      dead = true;
      if (rumble) rumble.stop();
      modal.style.visibility = '';
      gl.dispose(); fx.remove(); ui.fx = false;
      doReveal(0.2); // если что-то пошло не так — результат всё равно покажется
    }
  }

  // ---------- The Hand: надпись → бледно-голубая сфера стирает полосу экрана → пауза → рой сфер стирает всё → пустота → медленное проявление (как у Cream) ----------
  // Все тайминги в мс — меняй здесь.
  const HAND_T = {
    title: 2300,      // надпись + голубоватый фон (как у D4C)
    firstDur: 100,    // одна сфера пролетает экран за 0,1 с
    gap: 200,         // заминка после ухода первой сферы
    swarmMin: 50,     // интервал между запусками сфер роя (случайный от и до)
    swarmMax: 100,
    sphereDur: 100,   // время пролёта каждой сферы роя (0,1 с)
    void: 400,        // полная пустота (чёрный экран)
    fadeIn: 2400,     // экран медленно проявляется из чёрного (как у Cream)
  };

  // Сфера The Hand — шейдер из cream_void_sphere.html (линза со скручиванием внутри диска, тёмная «пустота», светящийся край и завитки),
  // но бледно-голубой. Рисуется на отдельном прозрачном слое поверх стёртого пространства; сфер может быть до 16 одновременно.
  const HAND_FX = { twist: 2.4, dark: 0.85 }; // twist — скручивание пространства внутри сферы, dark — плотность пустоты
  const HAND_MAX = 16;
  const HAND_FS = `
precision highp float;
uniform sampler2D uScene;
uniform vec2 uResolution;
uniform vec3 uSph[${HAND_MAX}];
uniform float uPh[${HAND_MAX}];
uniform int uN;
uniform float uTime;
uniform float uTwist;
uniform float uDark;
void main() {
  vec2 px = gl_FragCoord.xy;
  float bq = 2.0; vec3 bs = vec3(0.0); float bph = 0.0;
  for (int i = 0; i < ${HAND_MAX}; i++) {
    if (i >= uN) break;
    vec3 s = uSph[i];
    float q = length(px - s.xy) / s.z;
    if (q < bq) { bq = q; bs = s; bph = uPh[i]; }
  }
  if (bq >= 1.0) { gl_FragColor = vec4(0.0); return; }
  float q = bq, r = bs.z, t = uTime + bph;
  vec2 p = px - bs.xy;
  float angle = atan(p.y, p.x);
  float tw = (1.0 - q) * (1.0 - q) * uTwist;
  float spiral = angle + tw + sin(angle * 5.0 + t * 1.4) * .035 * (1.0 - q);
  float rr = pow(q, .60 + .12 * sin(t * .7));
  vec2 warped = bs.xy + vec2(cos(spiral), sin(spiral)) * rr * r;
  warped = mix(warped, bs.xy, 0.10 * (1.0 - q));
  vec3 col = texture2D(uScene, clamp(warped / uResolution, vec2(.001), vec2(.999))).rgb;
  float edgeGlow = exp(-pow((q - .91) / .055, 2.0));
  float innerGlow = exp(-pow((q - .72) / .16, 2.0));
  float swirl = sin(angle * 7.0 - t * 1.7 + q * 20.0);
  float wisps = smoothstep(.15, .95, swirl * .5 + .5);
  vec3 tint = vec3(.45, .72, 1.0);   // бледно-голубой вместо фиолетового
  vec3 pale = vec3(.85, .96, 1.0);   // вместо розового
  float core = smoothstep(.10, .68, q);
  col = mix(col, vec3(.004, .008, .02), uDark * (1.0 - .18 * core));
  col += tint * (edgeGlow * .9 + innerGlow * .12 + wisps * edgeGlow * .18);
  col += pale * edgeGlow * (.28 + .16 * sin(t * 2.1 + angle));
  col *= 1.0 - (1.0 - smoothstep(.05, .45, q)) * .22;
  col = clamp(col, 0.0, 1.0);
  float a = 1.0 - smoothstep(.975, 1.0, q);
  gl_FragColor = vec4(col * a, a);
}`;
  function createHandGL(W, H, dpr) {
    const cv = document.createElement('canvas');
    cv.className = 'jg-th-cv'; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) return null;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, SWIRL_VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, HAND_FS)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'aPos'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const U = {};
    ['uScene', 'uResolution', 'uSph', 'uPh', 'uN', 'uTime', 'uTwist', 'uDark'].forEach((n) => { U[n] = gl.getUniformLocation(pr, n); });
    gl.uniform1i(U.uScene, 0); gl.uniform2f(U.uResolution, cv.width, cv.height);
    gl.uniform1f(U.uTwist, HAND_FX.twist); gl.uniform1f(U.uDark, HAND_FX.dark);
    gl.viewport(0, 0, cv.width, cv.height); gl.clearColor(0, 0, 0, 0);
    const arr = new Float32Array(HAND_MAX * 3), ph = new Float32Array(HAND_MAX);
    return {
      cv,
      setScene(img) {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      },
      // list: [{x, y, r, ph}] в CSS-пикселях (y сверху)
      draw(list, time) {
        const n = Math.min(list.length, HAND_MAX);
        for (let i = 0; i < n; i++) { arr[i * 3] = list[i].x * dpr; arr[i * 3 + 1] = (H - list[i].y) * dpr; arr[i * 3 + 2] = list[i].r * dpr; ph[i] = list[i].ph || 0; }
        gl.uniform3fv(U.uSph, arr); gl.uniform1fv(U.uPh, ph); gl.uniform1i(U.uN, n); gl.uniform1f(U.uTime, time);
        gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES, 0, 3);
      },
      dispose() { const x = gl.getExtension('WEBGL_lose_context'); if (x) x.loseContext(); },
    };
  }
  async function handErase(dlg, reveal, snd, st) {
    const W = window.innerWidth, H = window.innerHeight, dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const T = HAND_T, R = Math.max(22, Math.min(W, H) * 0.07), ER = R * 1.04; // R — радиус сферы, ER — радиус стирания
    const modal = dlg.querySelector('.jg-modal');
    let gl = null; // искривление пространства через WebGL; если не вышло — сферы работают без искажения
    try {
      const shot = await captureModal(modal, W, H, dpr, false);
      shot.getContext('2d').getImageData(0, 0, 1, 1);
      gl = createHandGL(W, H, dpr);
      if (gl) gl.setScene(shot);
    } catch (e) { console.warn('[JoJo Stands] The Hand: WebGL-искажение недоступно', e); if (gl) gl.dispose(); gl = null; }
    const fx = document.createElement('div');
    fx.className = 'jg-fx jg-th';
    const mk = () => { const c = document.createElement('canvas'); c.className = 'jg-th-cv'; c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); const g = c.getContext('2d'); g.scale(dpr, dpr); fx.appendChild(c); return [c, g]; };
    // слои снизу вверх: светящаяся кромка среза (гаснет) → стёртое чёрное пространство → сферы (GL) → искры
    const [rimCv, rg] = mk(), [voidCv, vg] = mk();
    if (gl) fx.appendChild(gl.cv);
    const [sphCv, sg] = mk();
    dlg.appendChild(fx);
    ui.fx = true;
    let dead = false, revealed = false;
    const [bufName, bufErase] = [await snd.thName, await snd.thErase];
    let lastErase = -1e9;
    const eraseSnd = (vol, gap = 0) => { // звук стирания; gap — минимальный интервал между повторами (мс)
      const a = audio(), now = performance.now(); if (!a || !bufErase || now - lastErase < gap) return;
      lastErase = now; const src = a.createBufferSource(), g = a.createGain(); src.buffer = bufErase; g.gain.value = vol; src.connect(g); g.connect(a.destination); src.start();
    };
    const doReveal = (d) => { if (revealed) return; revealed = true; reveal(d); };
    const ease = { smooth: (a, b, u) => { const x = Math.min(1, Math.max(0, (u - a) / (b - a))); return x * x * (3 - 2 * x); } };
    const rnd = (lo, hi) => lo + Math.random() * (hi - lo);
    const run = (ms, fn) => new Promise((res) => {
      const t0 = performance.now();
      const f = (now) => { const u = Math.min(1, (now - t0) / ms); fn(u); if (u < 1 && !dead) requestAnimationFrame(f); else res(); };
      requestAnimationFrame(f);
    });
    const diag = Math.hypot(W, H);
    // путь сферы: линия через точку (cx,cy) под углом ang, длиннее экрана, чтобы сфера входила и выходила за краем
    const mkPath = (cx, cy, ang, rev) => {
      const dx = Math.cos(ang), dy = Math.sin(ang), L = diag / 2 + R * 3.5;
      let a = { x: cx - dx * L, y: cy - dy * L }, b = { x: cx + dx * L, y: cy + dy * L };
      if (rev) [a, b] = [b, a];
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      return { a, b, nx: -(b.y - a.y) / len, ny: (b.x - a.x) / len, dx: (b.x - a.x) / len, dy: (b.y - a.y) / len, phase: rnd(0, 6.28) };
    };
    // искры: бледно-голубые частицы слетают с краёв среза
    const sparks = [];
    // запасной вариант без WebGL: чёрный диск со светящимся голубым краем
    const drawSphere = (x, y, r) => {
      const g = sg.createRadialGradient(x, y, r * 0.7, x, y, r * 1.0);
      g.addColorStop(0, 'rgba(2,5,12,1)'); g.addColorStop(0.85, 'rgba(8,16,30,1)'); g.addColorStop(0.93, 'rgba(150,215,255,.95)'); g.addColorStop(1, 'rgba(150,215,255,0)');
      sg.fillStyle = g; sg.beginPath(); sg.arc(x, y, r, 0, 6.2832); sg.fill();
    };
    const spheres = [];
    let looping = true, last = performance.now();
    // положение сферы на пути: прямая + дуга (bend) + лёгкая S-образность (s2), в px; на концах отклонение = 0, так что вход и выход остаются за экраном
    const spherePos = (s, u) => {
      const p = s.path, e = u + 0.06 * Math.sin(u * Math.PI) * (s.fast ? 0 : 1), w = s.bend * Math.sin(Math.PI * u) + s.s2 * Math.sin(2 * Math.PI * u);
      return [p.a.x + (p.b.x - p.a.x) * e + p.nx * w, p.a.y + (p.b.y - p.a.y) * e + p.ny * w];
    };
    // у каждой сферы свой изгиб: у одних почти прямая, у других заметная дуга; сторона случайная
    const curve = () => {
      const r = Math.random(), kind = r < 0.3 ? 0.05 : r < 0.65 ? 0.5 : 1, sg1 = Math.random() < 0.5 ? -1 : 1, sg2 = Math.random() < 0.5 ? -1 : 1;
      return { bend: sg1 * R * 2.6 * kind * rnd(0.7, 1), s2: sg2 * R * 1.1 * kind * rnd(0, 1) };
    };
    const loop = (now) => {
      if (!looping || dead) return;
      const dt = Math.min(50, now - last); last = now;
      sg.clearRect(0, 0, W, H);
      // кромка среза плавно гаснет (≈0.3 с)
      rg.globalCompositeOperation = 'destination-out'; rg.fillStyle = `rgba(0,0,0,${Math.min(0.5, dt / 110)})`; rg.fillRect(0, 0, W, H); rg.globalCompositeOperation = 'source-over';
      const pos = [];
      for (let i = spheres.length - 1; i >= 0; i--) {
        const s = spheres[i], u = Math.min(1, (now - s.t0) / s.dur), p = s.path, r = R * s.k, er = ER * s.k;
        // сфера летит быстро (за кадр — большой шаг), поэтому след строится по мелким подшагам вдоль кривой — без «ломаных»
        const steps = Math.max(1, Math.ceil((u - s.pu) * 56));
        let [px, py] = spherePos(s, s.pu);
        rg.strokeStyle = 'rgba(165,225,255,.95)'; rg.lineWidth = er * 2 + 9; rg.lineCap = rg.lineJoin = 'round'; rg.beginPath(); rg.moveTo(px, py); // светящаяся кромка среза
        vg.strokeStyle = '#000'; vg.lineWidth = er * 2; vg.lineCap = vg.lineJoin = 'round'; vg.beginPath(); vg.moveTo(px, py); // след: сфера стирает всё на пути
        for (let k = 1; k <= steps; k++) {
          const [x, y] = spherePos(s, s.pu + (u - s.pu) * k / steps);
          rg.lineTo(x, y); vg.lineTo(x, y);
          const ddx = x - px, ddy = y - py, len = Math.hypot(ddx, ddy);
          if (len > 0.01) { // искры вылетают с краёв среза
            const nx = -ddy / len, ny = ddx / len, tx = ddx / len, ty = ddy / len, side = Math.random() < 0.5 ? 1 : -1, sp = rnd(15, 70);
            sparks.push({ x: x + nx * side * er * rnd(0.85, 1.15), y: y + ny * side * er * rnd(0.85, 1.15), vx: nx * side * sp - tx * rnd(0, 40), vy: ny * side * sp - ty * rnd(0, 40), life: 0, max: rnd(350, 750), sz: rnd(1, 3.2) });
          }
          px = x; py = y;
        }
        rg.stroke(); vg.stroke();
        s.pu = u;
        pos.push({ x: px, y: py, r, ph: p.phase });
        if (!gl) drawSphere(px, py, r);
        if (u >= 1) { spheres.splice(i, 1); s.done && s.done(); }
      }
      if (sparks.length > 320) sparks.splice(0, sparks.length - 320);
      sg.globalCompositeOperation = 'lighter';
      for (let i = sparks.length - 1; i >= 0; i--) {
        const o = sparks[i]; o.life += dt; if (o.life >= o.max) { sparks.splice(i, 1); continue; }
        o.x += o.vx * dt / 1000; o.y += o.vy * dt / 1000; o.vx *= 0.985; o.vy *= 0.985;
        const f = 1 - o.life / o.max;
        sg.fillStyle = `rgba(190,232,255,${(f * 0.9).toFixed(3)})`; sg.beginPath(); sg.arc(o.x, o.y, o.sz * (0.4 + f * 0.6), 0, 6.2832); sg.fill();
      }
      sg.globalCompositeOperation = 'source-over';
      if (gl) gl.draw(pos, now / 1000);
      requestAnimationFrame(loop);
    };
    const launch = (path, dur, o = {}) => new Promise((res) => { spheres.push({ path, dur, t0: performance.now(), pu: 0, fast: !!o.fast, k: o.k ?? 1, bend: o.bend ?? 0, s2: o.s2 ?? 0, done: res }); });
    try {
      // 1) надпись + голубоватый размытый фон (как у D4C); экран в это время не нажимается (fx перехватывает касания)
      fx.style.transition = 'background-color .4s, backdrop-filter .4s, -webkit-backdrop-filter .4s';
      void fx.offsetWidth;
      fx.style.background = 'rgba(125,195,255,.26)'; fx.style.backdropFilter = fx.style.webkitBackdropFilter = 'blur(5px)';
      const ttl = titleCard(fx, 'ザ・ハンド', 'THE HAND', 'th');
      const ha = audio();
      if (ha && bufName) { const [ns, ne] = audibleSpan(bufName), src = ha.createBufferSource(), g = ha.createGain(); src.buffer = bufName; g.gain.value = 2.5; src.connect(g); g.connect(ha.destination); src.start(ha.currentTime, ns, ne - ns); }
      ttl.hide(T.title - 250);
      await sleep(T.title - 400);
      fx.style.background = ''; fx.style.backdropFilter = fx.style.webkitBackdropFilter = '';
      await sleep(400);
      requestAnimationFrame(loop);
      // 2) одна небольшая сфера под лёгким наклоном быстро прокатывается сбоку, стирая экран на своём пути
      const side = Math.random() < 0.5 ? 1 : -1, tilt = side * rnd(0.14, 0.3); // угол к горизонтали (≈8–17°)
      const first = mkPath(W / 2, H * rnd(0.28, 0.42), tilt, Math.random() < 0.5);
      await launch(first, T.firstDur, { fast: true, ...curve() });
      eraseSnd(1); // сфера ушла за экран
      // 3) заминка
      await sleep(T.gap);
      // 4) рой сфер разного размера: дорожки у каждой свои (с изгибом), а потом проверяется, что ими стёрт ВЕСЬ экран;
      //    если остались непокрытые места — туда летят дополнительные сферы. Порядок случайный, интервал 0.05–0.1 с
      const ang = -tilt * rnd(0.8, 1.6), dx = Math.cos(ang), dy = Math.sin(ang);
      const ext = W * Math.abs(dy) + H * Math.abs(dx), step = ER * 1.15, bendMax = R * 3.8; // bendMax — максимальный изгиб дорожки
      const n = Math.ceil((ext + bendMax * 2) / step) + 2; // дорожки с запасом за краями: изгиб не оставит голых полос у границ экрана
      const lanes = [];
      for (let i = 0; i < n; i++) { const off = (i - (n - 1) / 2) * step; lanes.push({ path: mkPath(W / 2 - dy * off, H / 2 + dx * off, ang, i % 2 === 1), k: rnd(1, 1.22), ...curve() }); }
      // карта покрытия: клетки 8 px; клетка считается стёртой, только если она заведомо внутри следа какой-то сферы
      const CS = 8, gw = Math.ceil(W / CS), gh = Math.ceil(H / CS), cov = new Uint8Array(gw * gh);
      const stamp = (ln) => {
        const rr = ER * ln.k - 6, r2 = rr * rr, span = Math.ceil(rr / CS) + 1;
        for (let i = 0; i <= 120; i++) {
          const [x, y] = spherePos(ln, i / 120), cx0 = Math.floor(x / CS), cy0 = Math.floor(y / CS);
          for (let gy = Math.max(0, cy0 - span); gy <= Math.min(gh - 1, cy0 + span); gy++) for (let gx = Math.max(0, cx0 - span); gx <= Math.min(gw - 1, cx0 + span); gx++) {
            const ddx = (gx + 0.5) * CS - x, ddy = (gy + 0.5) * CS - y; if (ddx * ddx + ddy * ddy <= r2) cov[gy * gw + gx] = 1;
          }
        }
      };
      lanes.forEach(stamp);
      for (let guard = 0; guard < 120; guard++) { // добираем пробелы прямыми дорожками точно через непокрытую клетку
        const idx = cov.indexOf(0); if (idx < 0) break;
        const qx = ((idx % gw) + 0.5) * CS, qy = (Math.floor(idx / gw) + 0.5) * CS, t = (W / 2 - qx) * dx + (H / 2 - qy) * dy;
        const ln = { path: mkPath(qx + dx * t, qy + dy * t, ang, Math.random() < 0.5), k: rnd(1.05, 1.22), bend: 0, s2: 0 };
        lanes.push(ln); stamp(ln);
      }
      for (let i = lanes.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [lanes[i], lanes[j]] = [lanes[j], lanes[i]]; }
      const flights = [];
      for (const ln of lanes) {
        flights.push(launch(ln.path, T.sphereDur * rnd(0.97, 1.03), { k: ln.k, bend: ln.bend, s2: ln.s2 }).then(() => eraseSnd(0.7, 220)));
        await sleep(rnd(T.swarmMin, T.swarmMax));
      }
      await Promise.all(flights);
      // 5) полная пустота: закрашиваем возможные щели и держим чёрный экран 0.4 с; результат подставляется под чернотой
      vg.fillStyle = '#000'; vg.fillRect(0, 0, W, H);
      sg.clearRect(0, 0, W, H); rg.clearRect(0, 0, W, H); looping = false;
      if (gl) gl.cv.style.display = 'none';
      doReveal((T.void + 600) / 1000);
      await sleep(T.void);
      // 6) экран медленно проявляется из чёрного (как у Cream)
      await run(T.fadeIn, (u) => { voidCv.style.opacity = String(1 - ease.smooth(0, 1, u)); });
    } finally {
      dead = true; looping = false;
      if (gl) gl.dispose();
      fx.remove(); ui.fx = false;
      doReveal(0.2); // если что-то пошло не так — результат всё равно покажется
    }
  }
  // ---------- Silver Chariot: изрезанный экран ----------
  const polyArea = (p) => { let a = 0; for (let i = 0; i < p.length; i++) { const q = p[(i + 1) % p.length]; a += p[i].x * q.y - q.x * p[i].y; } return Math.abs(a) / 2; };
  const polyCenter = (p) => ({ x: p.reduce((t, v) => t + v.x, 0) / p.length, y: p.reduce((t, v) => t + v.y, 0) / p.length });
  // режет выпуклый многоугольник прямой (точка p, направление d): [частьA, частьB, отрезок среза]
  function splitPoly(poly, p, d) {
    const A = [], B = [], chord = [], n = poly.length;
    const sd = poly.map((v) => d.x * (v.y - p.y) - d.y * (v.x - p.x));
    for (let i = 0; i < n; i++) {
      const a = poly[i], b = poly[(i + 1) % n], sa = sd[i], sb = sd[(i + 1) % n];
      (sa >= 0 ? A : B).push(a);
      if ((sa > 0 && sb < 0) || (sa < 0 && sb > 0)) {
        const t = sa / (sa - sb), q = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
        A.push(q); B.push(q); chord.push(q);
      }
    }
    return chord.length === 2 && A.length >= 3 && B.length >= 3 ? [A, B, chord] : null;
  }
  // 3–4 длинных пореза через весь экран, затем ещё десятки, пока не наберётся ~100 кусочков
  function scLayout(W, H, target = 80) {
    const rect = [{ x: 0, y: 0 }, { x: W, y: 0 }, { x: W, y: H }, { x: 0, y: H }];
    const rnd = (a, b) => a + Math.random() * (b - a);
    const main = [], nMain = Math.random() < 0.5 ? 3 : 4, base = rnd(0, Math.PI);
    let regions = [rect];
    for (let k = 0, guard = 0; k < nMain && guard < 50; guard++) {
      const ang = base + k * (Math.PI / nMain) + rnd(-0.2, 0.2), d = { x: Math.cos(ang), y: Math.sin(ang) };
      const p = { x: W / 2 + rnd(-0.22, 0.22) * W, y: H / 2 + rnd(-0.22, 0.22) * H };
      const full = splitPoly(rect, p, d);
      if (!full) continue;
      main.push({ a: full[2][0], b: full[2][1] });
      regions = regions.flatMap((r) => splitPoly(r, p, d)?.slice(0, 2) || [r]);
      k++;
    }
    let pieces = regions.map((poly, g) => ({ poly, g, birth: 0 }));
    const chords = [];
    for (let guard = 0; pieces.length < target && guard < 4000; guard++) {
      const order = pieces.map((q, i) => [polyArea(q.poly), i]).sort((x, y) => y[0] - x[0]);
      const [ar, i] = order[Math.min(order.length - 1, Math.floor(Math.pow(Math.random(), 2) * Math.min(8, order.length)))];
      const pc = pieces[i], c = polyCenter(pc.poly), sp = Math.sqrt(ar) * 0.18, ang = rnd(0, Math.PI);
      const s = splitPoly(pc.poly, { x: c.x + rnd(-sp, sp), y: c.y + rnd(-sp, sp) }, { x: Math.cos(ang), y: Math.sin(ang) });
      if (!s || Math.min(polyArea(s[0]), polyArea(s[1])) < ar * 0.18) continue;
      chords.push({ a: s[2][0], b: s[2][1] });
      pieces.splice(i, 1, { poly: s[0], g: pc.g, birth: chords.length }, { poly: s[1], g: pc.g, birth: chords.length });
    }
    return { main, chords, pieces, groups: regions.length };
  }

  async function silverReveal(dlg, reveal, snd) {
    const W = window.innerWidth, H = window.innerHeight;
    const rnd = (a, b) => a + Math.random() * (b - a);
    const k = Math.min(2.2, Math.max(1, Math.min(W, H) / 390)); // масштаб расхождения под размер экрана
    const modal = dlg.querySelector('.jg-modal'), rc = modal.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    // запасной вариант (если снимок в холст не получится): копия окна на каждый кусочек — тяжёлый, поэтому только как запасной
    const makeSnap = () => {
      const snap = modal.cloneNode(true);
      snap.removeAttribute('id'); snap.querySelectorAll('[id]').forEach((e) => e.removeAttribute('id'));
      snap.querySelectorAll('[data-act]').forEach((e) => e.removeAttribute('data-act'));
      snap.querySelectorAll('.jg-toast').forEach((e) => e.remove());
      snap.style.cssText = `position:absolute;margin:0;width:${rc.width}px;height:${rc.height}px;max-height:none;animation:none;box-shadow:none`;
      return snap;
    };
    const fx = document.createElement('div');
    fx.className = 'jg-fx jg-sc';
    fx.innerHTML = '<div class="jg-sc-bg"></div>';
    dlg.appendChild(fx);
    ui.fx = true;
    // звук порезов: WebAudio, общий ограничитель громкости
    const a = audio();
    let master = null;
    if (a) { master = a.createDynamicsCompressor(); master.threshold.value = -16; master.ratio.value = 8; master.connect(a.destination); }
    const sliceSnd = (delay, { vol = 1, rate = 1, pan = 0, off = 0, dur = 0 } = {}) => {
      if (!a || !master || !bufSlice) return;
      let when = delay, o = off;
      if (when < 0) { o += -when * rate; when = 0; }
      const t = a.currentTime + when, src = a.createBufferSource(), g = a.createGain();
      src.buffer = bufSlice; src.playbackRate.value = rate;
      g.gain.setValueAtTime(vol, t);
      if (dur) { g.gain.setValueAtTime(vol, t + dur - 0.05); g.gain.linearRampToValueAtTime(0.0001, t + dur); }
      src.connect(g);
      let out = g;
      if (a.createStereoPanner) { const p = a.createStereoPanner(); p.pan.value = pan; g.connect(p); out = p; }
      out.connect(master);
      src.start(t, o); if (dur) src.stop(t + dur);
    };
    let bufSlice = null;
    try {
      const sound = snd.silver.play(10000); // сначала звук
      const ttl = titleCard(fx, '銀の戦車', 'SILVER CHARIOT', 'sc', { bg: 'rgba(150,152,158,.3)', blur: 4 }); // полупрозрачный серый фон за надписью
      bufSlice = await snd.slice;
      // даём надписи появиться и поехать ДО тяжёлой работы — раньше надпись замирала, пока строились кусочки
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      await sleep(80);
      let shot = null;
      try { shot = await captureModal(modal, W, H, dpr, false); shot.getContext('2d').getImageData(0, 0, 1, 1); }
      catch (e) { console.warn('[JoJo Stands] Silver Chariot: снимок окна недоступен, запасной вариант', e); shot = null; }
      const snap = shot ? null : makeSnap();
      const L = scLayout(W, H);
      const grpC = Array.from({ length: L.groups }, () => ({ x: 0, y: 0, n: 0 }));
      L.pieces.forEach((q) => { const c = polyCenter(q.poly); q.c = c; grpC[q.g].x += c.x; grpC[q.g].y += c.y; grpC[q.g].n++; });
      const grps = grpC.map((g) => {
        g.x /= g.n; g.y /= g.n;
        const el = document.createElement('div');
        el.className = 'jg-sc-grp'; el.style.transformOrigin = `${g.x}px ${g.y}px`;
        fx.appendChild(el);
        return { el, ...g };
      });
      // кусочки: каждый показывает свой фрагмент экрана (копия окна, обрезанная многоугольником)
      L.pieces.forEach((q) => {
        const cx = q.c.x, cy = q.c.y;
        const pts = q.poly.map((v) => { const dx = v.x - cx, dy = v.y - cy, l = Math.hypot(dx, dy) || 1; return { x: v.x + (dx / l) * 0.7, y: v.y + (dy / l) * 0.7 }; });
        const bx = Math.floor(Math.min(...pts.map((v) => v.x))), by = Math.floor(Math.min(...pts.map((v) => v.y)));
        const bw = Math.ceil(Math.max(...pts.map((v) => v.x))) - bx, bh = Math.ceil(Math.max(...pts.map((v) => v.y))) - by;
        const el = document.createElement('div');
        el.className = 'jg-sc-piece';
        el.style.cssText = `left:${bx}px;top:${by}px;width:${bw}px;height:${bh}px;transform-origin:${cx - bx}px ${cy - by}px;clip-path:polygon(${pts.map((v) => `${(v.x - bx).toFixed(1)}px ${(v.y - by).toFixed(1)}px`).join(',')})`;
        if (shot) { // кусочек — маленький холст с вырезкой из одного общего снимка
          const cv = document.createElement('canvas'); cv.width = Math.max(1, Math.round(bw * dpr)); cv.height = Math.max(1, Math.round(bh * dpr));
          cv.style.cssText = `position:absolute;left:0;top:0;width:${bw}px;height:${bh}px;display:block`;
          cv.getContext('2d').drawImage(shot, bx * dpr, by * dpr, bw * dpr, bh * dpr, 0, 0, cv.width, cv.height);
          el.appendChild(cv);
        } else { const c2 = snap.cloneNode(true); c2.style.left = `${rc.left - bx}px`; c2.style.top = `${rc.top - by}px`; el.appendChild(c2); }
        grps[q.g].el.appendChild(el);
        q.el = el;
      });
      // линии порезов: обычные div, анимируются только transform/opacity (быстро, без перерисовки)
      const lines = document.createElement('div'); lines.className = 'jg-sc-lines';
      const flash = document.createElement('div'); flash.className = 'jg-sc-flash';
      fx.appendChild(lines); fx.appendChild(flash);
      const geo = (ln) => ({ len: Math.hypot(ln.b.x - ln.a.x, ln.b.y - ln.a.y), ang: Math.atan2(ln.b.y - ln.a.y, ln.b.x - ln.a.x) });
      // длинный порез: чёрный след + яркий блик, бегущий по линии
      const bigSlash = (ln, delay) => {
        const { len, ang } = geo(ln), seg = Math.max(40, len * 0.22);
        const cut = document.createElement('div'); cut.className = 'jg-sc-cut';
        cut.style.cssText = `left:${ln.a.x}px;top:${ln.a.y - 1.3}px;width:${len}px`;
        const rot = (sx) => `rotate(${ang}rad) scaleX(${sx})`;
        cut.animate([{ transform: rot(0), opacity: 1 }, { transform: rot(1), opacity: 1, offset: 0.25 }, { transform: rot(1), opacity: 1, offset: 0.6 }, { transform: rot(1), opacity: 0 }], { duration: 700, delay, fill: 'both', easing: 'linear' });
        const w = document.createElement('div'); w.className = 'jg-sc-gw';
        w.style.cssText = `left:${ln.a.x}px;top:${ln.a.y - 2}px;width:${len}px;transform:rotate(${ang}rad)`;
        const head = document.createElement('div'); head.className = 'jg-sc-head'; head.style.width = `${seg}px`;
        w.appendChild(head);
        head.animate([{ transform: `translateX(${-seg}px)` }, { transform: `translateX(${len}px)` }], { duration: 150, delay, fill: 'both', easing: 'cubic-bezier(.3,0,.2,1)' });
        lines.appendChild(cut); lines.appendChild(w);
      };
      // короткий порез: белая вспышка вдоль линии
      const smallSlash = (ln, delay) => {
        const { len, ang } = geo(ln);
        const e = document.createElement('div'); e.className = 'jg-sc-fl';
        e.style.cssText = `left:${ln.a.x}px;top:${ln.a.y - 1.5}px;width:${len}px`;
        const rot = (sx) => `rotate(${ang}rad) scaleX(${sx})`;
        e.animate([{ transform: rot(0), opacity: 1 }, { transform: rot(1), opacity: 1, offset: 0.35 }, { transform: rot(1), opacity: 0 }], { duration: 260, delay, fill: 'both', easing: 'linear' });
        lines.appendChild(e);
      };
      // дать браузеру отрисовать кусочки, пока играет звук
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      await sound;
      await ttl.hide(1400);
      await sleep(250);

      // 1) 3–4 пореза от края до края (на каждый — свой звук)
      L.main.forEach((ln, i) => {
        bigSlash(ln, i * 170);
        sliceSnd(i * 0.17 - 0.15, { vol: 1, rate: rnd(0.96, 1.05), pan: ((ln.a.x + ln.b.x) / 2 / W - 0.5) * 1.2 });
        flash.animate([{ opacity: 0.22 }, { opacity: 0 }], { duration: 160, delay: i * 170, easing: 'ease-out', fill: 'both' });
      });
      await sleep(L.main.length * 170 + 120);
      // 2) половины расходятся, на месте порезов — чёрное
      grps.forEach((g) => {
        const dx = g.x - W / 2, dy = g.y - H / 2, l = Math.hypot(dx, dy) || 1, m = rnd(13, 20) * k, a0 = rnd(0, 6.283);
        const ux = l > 4 ? dx / l : Math.cos(a0), uy = l > 4 ? dy / l : Math.sin(a0);
        g.el.animate([{ transform: 'translate(0,0) rotate(0deg)' }, { transform: `translate(${ux * m}px,${uy * m}px) rotate(${rnd(-2, 2)}deg)` }], { duration: 650, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'forwards' });
      });
      await sleep(1000);
      // 3) десятки порезов подряд — экран рассыпается на ~80 неровных кусочков (на каждый порез — звук)
      const span = 900, nC = L.chords.length;
      L.chords.forEach((ln, i) => {
        const d = (i / nC) * span;
        smallSlash(ln, d);
        sliceSnd(d / 1000, { vol: 0.17, rate: rnd(0.9, 1.3), pan: ((ln.a.x + ln.b.x) / 2 / W - 0.5) * 1.4, off: 0.12, dur: 0.28 });
      });
      const maxB = Math.max(1, ...L.pieces.map((q) => q.birth));
      L.pieces.forEach((q) => {
        const g = grps[q.g], dx = q.c.x - g.x, dy = q.c.y - g.y, l = Math.hypot(dx, dy) || 1, m = rnd(11, 20) * k, a1 = rnd(0, 6.283);
        q.sep = { x: (l > 3 ? dx / l : Math.cos(a1)) * m, y: (l > 3 ? dy / l : Math.sin(a1)) * m, r: rnd(-6, 6) };
        q.el.animate([{ transform: 'translate(0,0) rotate(0deg)' }, { transform: `translate(${q.sep.x}px,${q.sep.y}px) rotate(${q.sep.r}deg) scale(.985)` }],
          { duration: 380, delay: 60 + (q.birth / maxB) * span, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'forwards' });
      });
      await sleep(span + 450 + 500);
      // 4) кусочки опадают, чёрный фон уходит, под ними результат
      reveal(0.7);
      fx.querySelector('.jg-sc-bg').animate([{ opacity: 1 }, { opacity: 0 }], { duration: 700, delay: 250, fill: 'forwards' });
      L.pieces.forEach((q) => {
        const fall = H * rnd(0.6, 1.1), sx = rnd(-60, 60), sr = rnd(-120, 120);
        q.el.animate([
          { transform: `translate(${q.sep.x}px,${q.sep.y}px) rotate(${q.sep.r}deg) scale(.985)`, opacity: 1 },
          { opacity: 1, offset: 0.6 },
          { transform: `translate(${q.sep.x + sx}px,${q.sep.y + fall}px) rotate(${q.sep.r + sr}deg) scale(.9)`, opacity: 0 },
        ], { duration: rnd(800, 1200), delay: rnd(0, 350), easing: 'cubic-bezier(.55,0,1,.45)', fill: 'forwards' });
      });
      lines.remove();
      await sleep(1650);
    } finally { fx.remove(); ui.fx = false; }
  }
  // ---------- Magician's Red: надпись + голос → огнём вырисовывается анкх → экран заливает огнём → огонь гаснет ----------
  // WebGL: огонь считается шейдером (шумовые языки пламени вдоль контура анкха, затем «потоп» снизу вверх на весь экран),
  // окно при этом искажается тепловым маревом и краснеет. Нет WebGL — запасной вариант на CSS/SVG (mrCss).
  // Все тайминги в мс — меняй здесь.
  const MR_T = {
    dark: 800,    // экран темнеет после надписи
    draw: 2500,   // огнём вырисовывается анкх
    burn: 700,    // анкх разгорается сильнее
    flood: 1500,  // огонь заливает весь экран (снизу вверх)
    hold: 2200,   // экран полностью в огне («пара секунд»)
    die: 2900,    // огонь утихает и гаснет
  };
  const MR_N = 64; // сегментов контура анкха (то же число в шейдере)
  const MR_VS = 'attribute vec2 aPos;void main(){gl_Position=vec4(aPos,0.0,1.0);}';
  const MR_FS = `
precision highp float;
uniform sampler2D uScene;
uniform vec2 uRes;
uniform vec2 uTip;
uniform float uTime, uHasScene, uSceneA, uDark, uDrawN, uAnkh, uPow, uFlood, uDie, uFlash, uTipA;
uniform vec4 uSeg[${MR_N}];

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + vec2(17.1, 9.2); a *= 0.5; }
  return v;
}
// «температура» → цвет: чёрный → тёмно-красный → оранжевый → жёлтый → белый
vec3 fireCol(float h) {
  vec3 c = vec3(0.0);
  c = mix(c, vec3(0.42, 0.015, 0.0), smoothstep(0.04, 0.28, h));
  c = mix(c, vec3(0.95, 0.20, 0.02), smoothstep(0.24, 0.55, h));
  c = mix(c, vec3(1.0, 0.60, 0.06), smoothstep(0.50, 0.82, h));
  c = mix(c, vec3(1.0, 0.92, 0.50), smoothstep(0.80, 1.08, h));
  c = mix(c, vec3(1.0, 1.0, 0.94), smoothstep(1.08, 1.40, h));
  return c;
}
void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;     // высота экрана = 1, y вверх
  float t = uTime;
  vec2 w1 = vec2(fbm(p * vec2(4.0, 2.5) + vec2(0.0, -t * 1.4)), fbm(p * vec2(4.0, 2.5) + vec2(5.2, -t * 1.9))) - 0.5;

  // --- анкх: языки пламени вдоль контура (вверх тянутся дальше, чем вниз) ---
  float heatA = 0.0, halo = 0.0;
  if (uAnkh > 0.001) {
    vec2 pw = p + w1 * vec2(0.03, 0.045);
    float dW = 1000.0, dR = 1000.0;
    for (int i = 0; i < ${MR_N}; i++) {
      float fi = float(i);
      if (fi >= uDrawN) break;
      vec4 s = uSeg[i];
      vec2 a = s.xy, b = mix(s.xy, s.zw, clamp(uDrawN - fi, 0.0, 1.0));
      vec2 ab = b - a;
      float h = clamp(dot(pw - a, ab) / max(dot(ab, ab), 0.000001), 0.0, 1.0);
      vec2 v = pw - (a + ab * h);
      float sc = 0.3 + 0.7 * clamp((uDrawN - fi) / 8.0, 0.0, 1.0);   // свежие участки горят слабее, старые — сильнее
      dW = min(dW, length(vec2(v.x, v.y > 0.0 ? v.y * 0.4 : v.y * 1.2)) / sc);
      dR = min(dR, length(v));
    }
    float fl = 0.055 * (0.8 + 1.4 * uPow);
    float hh = clamp(1.0 - dW / fl, 0.0, 1.0);
    float n = fbm(vec2(pw.x * 10.0, pw.y * 6.0 - t * 3.6));
    heatA = hh * hh * (0.45 + 1.15 * n);
    float core = 1.0 - smoothstep(0.004, 0.017, dR);                        // раскалённое ядро контура — анкх читается чётко
    heatA = max(heatA, core * (0.98 + 0.30 * n));
    halo = exp(-dW * 10.0) * 0.6;
    heatA *= uAnkh; halo *= uAnkh;
  }
  float tipD = length(p - uTip);                                      // яркая вспышка на конце «кисти»
  heatA += uTipA * (exp(-tipD * tipD * 1100.0) * 1.5 + exp(-tipD * tipD * 70.0) * 0.4);

  // --- потоп: рваный фронт огня поднимается снизу вверх, языки вытянуты вертикально ---
  float L = uFlood * 1.9 - uDie * 2.3;
  float streak = fbm(vec2(p.x * 5.0, uv.y * 1.7 - t * 2.2) + w1 * 1.4);
  float cover = L - uv.y + (streak - 0.5) * 0.9;
  float lick = fbm(vec2(p.x * 7.5, uv.y * 3.4 - t * 4.4) + w1 * 2.2);
  float heatF = clamp(cover * 1.9, 0.0, 1.0) * (0.55 + 0.95 * lick);
  heatF *= 1.0 - 0.45 * uDie;

  float heat = max(heatA, heatF);
  float al = smoothstep(0.05, 0.42, heat);
  vec4 col = vec4(fireCol(heat) * al, al);
  col += vec4(vec3(1.0, 0.34, 0.05) * halo * 0.8, halo * 0.5) * (1.0 - col.a);   // мягкое свечение вокруг

  // --- искры ---
  float sp = 0.0;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    vec2 g = vec2(p.x * (9.0 + fi * 6.0), uv.y * (6.0 + fi * 3.0) - t * (0.7 + fi * 0.45));
    vec2 id = floor(g), f = fract(g) - 0.5;
    float h = hash(id + fi * 13.7);
    vec2 o = (vec2(hash(id + 3.1), hash(id + 7.7)) - 0.5) * 0.6;
    float life = fract(h * 7.0 + t * 0.35);
    sp += (1.0 - smoothstep(0.0, 0.1, length(f - o))) * step(0.80, h) * (1.0 - life);
  }
  float spMask = clamp(halo * 2.5 + heatF * 1.6, 0.0, 1.0);
  col.rgb += vec3(1.0, 0.72, 0.28) * sp * spMask * 1.4;
  col.a = max(col.a, sp * spMask);

  // --- окно: тепловое марево, краснеет и темнеет ---
  vec4 sc = vec4(0.0);
  if (uHasScene > 0.5) {
    vec2 sh = vec2(fbm(p * 3.0 + vec2(0.0, -t * 2.0)), fbm(p * 3.0 + vec2(7.0, -t * 2.7))) - 0.5;
    float hl = clamp(halo * 1.1 + heatF * 0.7, 0.0, 1.0);
    vec2 suv = clamp(uv + sh * 0.035 * hl * (0.35 + uFlood), 0.0, 1.0);
    sc = texture2D(uScene, suv);
    sc.rgb *= mix(vec3(1.0), vec3(0.5, 0.25, 0.2), uDark);
    sc *= uSceneA;
  }
  vec4 outc = col + sc * (1.0 - col.a);
  outc += vec4(vec3(1.0, 0.45, 0.12) * uFlash, uFlash * 0.6);     // вспышка в момент воспламенения
  gl_FragColor = outc;
}`;
  // контур анкха в координатах шейдера (высота экрана = 1, y вверх), ровно MR_N отрезков равной длины
  function mrAnkh(W, H) {
    const asp = W / H, s = Math.min(0.7 / 1.42, (0.9 * asp) / 0.84);
    const u = [[0.5, 1.45], [0.5, 0.62], [0.08, 0.62], [0.92, 0.62], [0.5, 0.62], [0.5, 0.55]]; // ножка → перекладина туда-обратно → к петле
    for (let i = 1; i <= 96; i++) { const t = (i / 96) * Math.PI * 2; u.push([0.5 - 0.2 * Math.sin(t), 0.29 + 0.26 * Math.cos(t)]); }
    const pts = u.map(([x, y]) => ({ x: (x - 0.5) * s, y: (0.74 - y) * s }));
    const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
    const total = cum[cum.length - 1], out = []; let j = 0;
    for (let k = 0; k <= MR_N; k++) {
      const d = (total * k) / MR_N;
      while (j < cum.length - 2 && cum[j + 1] < d) j++;
      const f = (d - cum[j]) / (cum[j + 1] - cum[j] || 1);
      out.push({ x: pts[j].x + (pts[j + 1].x - pts[j].x) * f, y: pts[j].y + (pts[j + 1].y - pts[j].y) * f });
    }
    return { pts: out, s };
  }
  function mrGL(W, H, dpr, segs) {
    const cv = document.createElement('canvas');
    cv.className = 'jg-mr-gl'; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) throw new Error('нет WebGL');
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, MR_VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, MR_FS)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'aPos'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
    const U = {};
    ['uScene', 'uRes', 'uTip', 'uTime', 'uHasScene', 'uSceneA', 'uDark', 'uDrawN', 'uAnkh', 'uPow', 'uFlood', 'uDie', 'uFlash', 'uTipA', 'uSeg'].forEach((n) => { U[n] = gl.getUniformLocation(pr, n); });
    const flat = new Float32Array(MR_N * 4);
    for (let i = 0; i < MR_N; i++) { flat[i * 4] = segs[i].x; flat[i * 4 + 1] = segs[i].y; flat[i * 4 + 2] = segs[i + 1].x; flat[i * 4 + 3] = segs[i + 1].y; }
    gl.uniform1i(U.uScene, 0); gl.uniform2f(U.uRes, cv.width, cv.height); gl.uniform4fv(U.uSeg, flat);
    gl.viewport(0, 0, cv.width, cv.height); gl.clearColor(0, 0, 0, 0);
    return {
      cv,
      setScene(img) {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      },
      draw(u) {
        gl.uniform1f(U.uTime, u.time); gl.uniform1f(U.uHasScene, u.hasScene); gl.uniform1f(U.uSceneA, u.sceneA); gl.uniform1f(U.uDark, u.dark);
        gl.uniform1f(U.uDrawN, u.drawN); gl.uniform1f(U.uAnkh, u.ankh); gl.uniform1f(U.uPow, u.pow); gl.uniform1f(U.uFlood, u.flood);
        gl.uniform1f(U.uDie, u.die); gl.uniform1f(U.uFlash, u.flash); gl.uniform1f(U.uTipA, u.tipA); gl.uniform2f(U.uTip, u.tip[0], u.tip[1]);
        gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES, 0, 3);
      },
      dispose() { const x = gl.getExtension('WEBGL_lose_context'); if (x) x.loseContext(); },
    };
  }
  // звук огня без файлов: рёв (коричневый шум), шипение, потрескивание; громкость и «жар» меняются по ходу анимации
  function mrFireSound() {
    const a = audio(); if (!a) return null;
    const t = a.currentTime;
    const out = a.createGain(); out.gain.value = 0.0001;
    const comp = a.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 6; out.connect(comp); comp.connect(a.destination);
    const nR = Math.floor(a.sampleRate * 3), bR = a.createBuffer(1, nR, a.sampleRate), dR = bR.getChannelData(0); let last = 0;
    for (let i = 0; i < nR; i++) { last = (last + 0.025 * (Math.random() * 2 - 1)) / 1.025; dR[i] = last * 4; }
    const roar = a.createBufferSource(); roar.buffer = bR; roar.loop = true;
    const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420;
    roar.connect(lp); lp.connect(out); roar.start(t);
    const nW = a.sampleRate * 2, bW = a.createBuffer(1, nW, a.sampleRate), dW = bW.getChannelData(0);
    for (let i = 0; i < nW; i++) dW[i] = Math.random() * 2 - 1;
    const hiss = a.createBufferSource(); hiss.buffer = bW; hiss.loop = true;
    const hp = a.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2600; const hg = a.createGain(); hg.gain.value = 0.05;
    hiss.connect(hp); hp.connect(hg); hg.connect(out); hiss.start(t);
    const pop = a.createBuffer(1, Math.floor(a.sampleRate * 0.04), a.sampleRate), pd = pop.getChannelData(0);
    for (let i = 0; i < pd.length; i++) pd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / pd.length, 3);
    let heat = 0.2;
    const timer = setInterval(() => {
      if (Math.random() > 0.15 + heat * 0.65) return;
      const s = a.createBufferSource(), g = a.createGain(), f = a.createBiquadFilter();
      s.buffer = pop; s.playbackRate.value = 0.6 + Math.random() * 1.6; g.gain.value = (0.15 + Math.random() * 0.5) * (0.3 + heat);
      f.type = 'highpass'; f.frequency.value = 900 + Math.random() * 2500; s.connect(f); f.connect(g); g.connect(out); s.start();
    }, 55);
    const ramp = (v, ms) => { const n = a.currentTime; out.gain.cancelScheduledValues(n); out.gain.setValueAtTime(out.gain.value, n); out.gain.linearRampToValueAtTime(Math.max(0.0001, v), n + ms / 1000); };
    return {
      vol: ramp,
      heat: (h) => { heat = h; lp.frequency.setTargetAtTime(350 + h * 900, a.currentTime, 0.2); },
      whoosh: () => { // вздох воспламенения: шум с растущим срезом
        const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(), n = a.currentTime;
        s.buffer = bW; f.type = 'bandpass'; f.Q.value = 0.8; f.frequency.setValueAtTime(300, n); f.frequency.exponentialRampToValueAtTime(2600, n + 0.8);
        g.gain.setValueAtTime(0.0001, n); g.gain.linearRampToValueAtTime(0.7, n + 0.25); g.gain.exponentialRampToValueAtTime(0.0001, n + 0.9);
        s.connect(f); f.connect(g); g.connect(comp); s.start(n); s.stop(n + 1);
      },
      stop: () => { clearInterval(timer); ramp(0.0001, 150); setTimeout(() => { [roar, hiss].forEach((x) => { try { x.stop(); } catch (e) { /* уже остановлен */ } }); }, 300); },
    };
  }
  // запасной вариант без WebGL: контур анкха рисуется светящимся SVG-штрихом, потом снизу поднимается огненный градиент
  async function mrCss(fx, dark, W, H, ank, reveal, fire) {
    const d = ank.pts.map((q, i) => `${i ? 'L' : 'M'}${(W / 2 + q.x * H).toFixed(1)} ${(H / 2 - q.y * H).toFixed(1)}`).join('');
    const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'jg-mr-svg'); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', d); path.setAttribute('fill', 'none'); path.setAttribute('stroke', '#ffb347'); path.setAttribute('stroke-linecap', 'round'); path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('stroke-width', String(Math.max(6, ank.s * H * 0.045))); svg.appendChild(path);
    const flood = document.createElement('div'); flood.className = 'jg-mr-flood';
    fx.appendChild(svg); fx.appendChild(flood);
    const len = path.getTotalLength();
    path.style.strokeDasharray = len; path.style.strokeDashoffset = len;
    dark.animate([{ opacity: 0 }, { opacity: 1 }], { duration: MR_T.dark, fill: 'forwards' });
    await sleep(MR_T.dark);
    if (fire) fire.vol(0.35, 600);
    path.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: MR_T.draw, easing: 'ease-in-out', fill: 'forwards' });
    await sleep(MR_T.draw + MR_T.burn);
    if (fire) { fire.whoosh(); fire.vol(0.55, MR_T.flood); }
    flood.animate([{ transform: 'translateY(100%)', opacity: 1 }, { transform: 'translateY(0%)', opacity: 1 }], { duration: MR_T.flood, easing: 'ease-in', fill: 'forwards' });
    flood.animate([{ filter: 'brightness(1)' }, { filter: 'brightness(1.25)' }, { filter: 'brightness(.9)' }, { filter: 'brightness(1.2)' }], { duration: 500, iterations: Infinity });
    await sleep(MR_T.flood);
    reveal((MR_T.hold + MR_T.die * 0.4) / 1000);
    await sleep(MR_T.hold);
    if (fire) fire.vol(0, MR_T.die);
    [svg, flood, dark].forEach((e) => e.animate([{ opacity: 1 }, { opacity: 0 }], { duration: MR_T.die, easing: 'ease-in-out', fill: 'forwards' }));
    await sleep(MR_T.die + 100);
  }

  async function mrReveal(dlg, reveal, snd) {
    const W = window.innerWidth, H = window.innerHeight, dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const modal = dlg.querySelector('.jg-modal');
    // снимок окна делаем сразу, пока играет надпись (для марева и покраснения экрана)
    const capP = captureModal(modal, W, H, dpr, false).then((c) => { c.getContext('2d').getImageData(0, 0, 1, 1); return c; }).catch((e) => { console.warn("[JoJo Stands] Magician's Red: снимок окна недоступен", e); return null; });
    const bufName = await snd.mrName;
    const fx = document.createElement('div');
    fx.className = 'jg-fx jg-mr';
    fx.innerHTML = '<div class="jg-mr-dark"></div>';
    const dark = fx.firstElementChild;
    dlg.appendChild(fx);
    ui.fx = true;
    const a = audio();
    const ank = mrAnkh(W, H);
    let gl = null, fire = null, dead = false, revealed = false, hid = false;
    const doReveal = (d) => { if (revealed) return; revealed = true; reveal(d); };
    const lerp = (x, y, u) => x + (y - x) * u;
    const sm = (e0, e1, u) => { const x = Math.min(1, Math.max(0, (u - e0) / (e1 - e0))); return x * x * (3 - 2 * x); };
    const run = (ms, fn) => new Promise((res) => {
      const t0 = performance.now();
      const f = (now) => { const u = Math.min(1, (now - t0) / ms); fn(u); if (u < 1 && !dead) requestAnimationFrame(f); else res(); };
      requestAnimationFrame(f);
    });
    try {
      // 0) надпись и голос стартуют вместе (как у D4C); фон — лёгкий оранжевый, слегка размытый; надпись гаснет ровно к концу звука
      fx.style.transition = 'background-color .4s, backdrop-filter .4s, -webkit-backdrop-filter .4s';
      void fx.offsetWidth;
      fx.style.background = 'rgba(255,120,60,.24)'; fx.style.backdropFilter = fx.style.webkitBackdropFilter = 'blur(5px)';
      const [ns, ne] = bufName ? audibleSpan(bufName) : [0, 2];
      const dN = (ne - ns) * 1000;
      const ttl = titleCard(fx, 'マジシャンズレッド', "MAGICIAN'S RED", 'mr');
      if (a && bufName) {
        const src = a.createBufferSource(), g = a.createGain(), t = a.currentTime;
        src.buffer = bufName; g.gain.setValueAtTime(1, t); g.gain.setValueAtTime(1, t + (ne - ns) - 0.04); g.gain.linearRampToValueAtTime(0.0001, t + (ne - ns));
        src.connect(g); g.connect(a.destination); src.start(t, ns, ne - ns);
      }
      ttl.hide(Math.max(600, dN - 250));
      await sleep(dN);
      fx.style.background = ''; fx.style.backdropFilter = fx.style.webkitBackdropFilter = '';
      await sleep(400);
      // WebGL-огонь (если не вышло — запасной вариант)
      const shot = await capP;
      try { gl = mrGL(W, H, dpr, ank.pts); if (shot) gl.setScene(shot); }
      catch (e) { console.warn("[JoJo Stands] Magician's Red: WebGL-огонь недоступен, запасной вариант", e); if (gl) gl.dispose(); gl = null; }
      fire = mrFireSound();
      if (!gl) { await mrCss(fx, dark, W, H, ank, doReveal, fire); return; }

      const P = { time: 0, hasScene: shot ? 1 : 0, sceneA: 1, dark: 0, drawN: 0, ankh: 0, pow: 0.25, flood: 0, die: 0, flash: 0, tipA: 0, tip: [0, 0] };
      const tipAt = (dn) => { const i = Math.min(MR_N - 1, Math.floor(dn)), f = Math.min(1, dn - i), A = ank.pts[i], B = ank.pts[i + 1]; return [lerp(A.x, B.x, f), lerp(A.y, B.y, f)]; };
      const tS = performance.now();
      const loop = () => { if (dead) return; P.time = (performance.now() - tS) / 1000; gl.draw(P); requestAnimationFrame(loop); };
      gl.cv.style.opacity = '0'; fx.appendChild(gl.cv);
      gl.draw(P);
      gl.cv.style.opacity = '1';
      if (shot) { await sleep(30); modal.style.visibility = 'hidden'; hid = true; } // вместо окна — его снимок внутри шейдера
      requestAnimationFrame(loop);
      // 1) темнеет
      if (fire) fire.vol(0.18, 900);
      await run(MR_T.dark, (u) => { dark.style.opacity = u; P.dark = 0.5 * u; });
      // 2) огнём вырисовывается анкх: «кисть» горит ярче всего на конце линии, старые участки разгораются сильнее
      await run(MR_T.draw, (u) => {
        const e = 0.4 * sm(0, 1, u) + 0.6 * u;
        P.ankh = Math.min(1, u * 8); P.drawN = e * MR_N; P.tipA = 1; P.tip = tipAt(P.drawN); P.pow = 0.25 + 0.55 * u;
        if (fire) fire.heat(0.2 + 0.3 * u);
      });
      P.drawN = MR_N; P.tipA = 0;
      if (fire) fire.vol(0.3, MR_T.burn);
      await run(MR_T.burn, (u) => { P.pow = 0.8 + 0.9 * u; });
      // 3) воспламенение: вспышка, огонь заливает весь экран снизу вверх, окно уходит под него
      if (fire) { fire.whoosh(); fire.vol(0.7, MR_T.flood); }
      run(380, (u) => { P.flash = 0.5 * Math.pow(1 - u, 2); });
      await run(MR_T.flood, (u) => {
        const e = u * u * (3 - 2 * u);
        P.flood = e; P.dark = 0.5 + 0.5 * e; P.sceneA = 1 - sm(0.45, 0.92, u); P.pow = 1.7;
        gl.cv.style.transform = `translate(${(Math.random() * 2 - 1) * 4 * (1 - u)}px,${(Math.random() * 2 - 1) * 4 * (1 - u)}px)`;
        if (fire) fire.heat(0.5 + 0.5 * e);
      });
      gl.cv.style.transform = ''; P.flood = 1; P.sceneA = 0;
      // под сплошным огнём подменяем окно настоящим (с результатом); карточки выпрыгнут, когда огонь начнёт гаснуть
      doReveal((MR_T.hold + MR_T.die * 0.4) / 1000);
      modal.style.visibility = ''; hid = false;
      await sleep(MR_T.hold);
      // 4) огонь стихает и гаснет, тьма рассеивается
      if (fire) { fire.heat(0.15); fire.vol(0, MR_T.die); }
      await run(MR_T.die, (u) => {
        const e = u * u * (3 - 2 * u);
        P.die = e; P.pow = 1.7 - 1.1 * e; dark.style.opacity = 1 - sm(0.2, 1, u); P.dark = 1;
      });
      gl.cv.animate({ opacity: [1, 0] }, { duration: 200, fill: 'forwards' });
      await sleep(250);
    } finally {
      dead = true;
      if (fire) fire.stop();
      if (hid) modal.style.visibility = '';
      if (gl) gl.dispose();
      fx.remove(); ui.fx = false;
      doReveal(0.2); // если что-то пошло не так — результат всё равно покажется
    }
  }
  // ---------- Hierophant Green: изумрудные щупальца ----------
  // 0–2.1 с: всё замирает, играет звук; 2.1–3.4: 5 горизонтальных щупалец (случайные места и наклон) вползают «из-за экрана»;
  // 3.5–6.95: три цикла «сжать → расслабить»; 7.0–7.95: щупальца отступают, показываются карточки (~8 с)
  function hgRng(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function hgPanels(r, w, D) {
    const out = []; let s = -D / 2;
    while (s < D / 2) {
      const x = r(), type = x < 0.38 ? 0 : x < 0.55 ? 1 : x < 0.72 ? 2 : x < 0.86 ? 3 : 4;
      const len = w * (type === 0 ? 0.8 + r() * 0.7 : type === 1 ? 0.95 : type === 2 ? 0.8 + r() * 0.3 : type === 3 ? 1 : 0.6 + r() * 0.4);
      out.push({ s: s + len / 2, len, type, k: 0.52 + r() * 0.2, n: 3 + Math.floor(r() * 3), lat: (r() - 0.5) * 0.08 });
      s += len + w * (0.16 + r() * 0.14);
    }
    return out;
  }
  async function hierophantReveal(dlg, reveal, snd) {
    const W = window.innerWidth, H = window.innerHeight;
    const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
    const eOut = (x) => 1 - Math.pow(1 - x, 3), eIn = (x) => x * x * x;
    const T_GROW = 2150, T_C0 = 3500, CYC = 1150, NC = 3, T_OUT = 7000, OUT = 900, T_END = 7950, T_REVEAL = 6700;
    const STR = [0.7, 0.88, 1];

    const modal = dlg.querySelector('.jg-modal');
    const fx = document.createElement('div');
    fx.className = 'jg-fx jg-hg';
    fx.innerHTML = '<div class="jg-hg-dark"></div><div class="jg-hg-tint"></div><canvas class="jg-hg-cv"></canvas>'
      + '<div class="jg-hg-ttl"><b>法皇の緑</b><small>HIEROPHANT GREEN</small></div><div class="jg-hg-go a">ゴゴゴゴ</div><div class="jg-hg-go b">ゴゴゴゴ</div>';
    dlg.appendChild(fx);
    dlg.classList.add('jg-hg-freeze'); // замораживаем все CSS-анимации интерфейса
    ui.fx = true;
    const dark = fx.querySelector('.jg-hg-dark'), tint = fx.querySelector('.jg-hg-tint'), ttl = fx.querySelector('.jg-hg-ttl');
    const goA = fx.querySelector('.jg-hg-go.a'), goB = fx.querySelector('.jg-hg-go.b'), cv = fx.querySelector('.jg-hg-cv');
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const c = cv.getContext('2d');
    modal.style.transition = 'filter .45s'; modal.style.filter = 'saturate(.35) brightness(.75)';

    // геометрия: 5 щупалец идут по горизонтали, в случайных местах и с лёгким наклоном вверх/вниз (каждый раз по-новому)
    const cx = W / 2, cy = H / 2, D = W * 1.15 + 140;
    const NB = 5, w0 = clamp(Math.min(W, H) * 0.085, 26, 60), seed = Math.floor(Math.random() * 1e9);
    const bands = Array.from({ length: NB }, (_, k) => {
      const r = hgRng(seed + k * 37), a = (r() < 0.5 ? -1 : 1) * (0.04 + r() * 0.16);
      return { k, by: H * ((k + 0.2 + 0.6 * r()) / NB), dx: Math.cos(a), dy: Math.sin(a), nx: -Math.sin(a), ny: Math.cos(a), amp: w0 * (0.5 + r() * 0.6), f1: 6.283 / (520 + r() * 260), f2: 6.283 / (230 + r() * 90), ph: r() * 6.283, sp: 0.0025 + r() * 0.0012, dir: r() < 0.5 ? -1 : 1, dl: r() * 340, wob: r() * 6.283, panels: hgPanels(r, w0, D) };
    });
    const cur = { wt: w0, amp: 0, by: 0, sa: 0, sb: 0, t: 0 };
    const setCur = (b, g, t, q) => {
      cur.sa = b.dir > 0 ? -D / 2 : D / 2 - D * g; cur.sb = b.dir > 0 ? -D / 2 + D * g : D / 2;
      cur.wt = w0 * (1 + 0.22 * q); cur.amp = b.amp * (1 - 0.78 * q); cur.by = cy + (b.by - cy) * (1 - 0.42 * q); cur.t = t;
    };
    const vis = (b, t) => (t < T_OUT ? eOut(clamp((t - T_GROW - b.dl) / 950)) : 1 - eIn(clamp((t - T_OUT - (NB - 1 - b.k) * 40) / (OUT - 200))));
    const at = (b, s) => {
      const f = (ss) => { const off = cur.amp * (Math.sin(ss * b.f1 + b.ph - cur.t * b.sp) + 0.45 * Math.sin(ss * b.f2 + b.wob + cur.t * b.sp * 0.8)); return [cx + b.dx * ss + b.nx * off, cur.by + b.dy * ss + b.ny * off]; };
      const [x, y] = f(s), [x1, y1] = f(s + 2), [x0, y0] = f(s - 2);
      let tx = x1 - x0, ty = y1 - y0; const L = Math.hypot(tx, ty) || 1; tx /= L; ty /= L;
      const hd = b.dir > 0 ? cur.sb - s : s - cur.sa;
      const w = cur.wt * (1 + 0.13 * Math.sin(s * 0.012 + b.ph)) * (0.16 + 0.84 * Math.sqrt(clamp(hd / (w0 * 2.4))));
      return { x, y, tx, ty, nx: -ty, ny: tx, w, hd };
    };
    const strip = (P, a, b2, col) => {
      c.beginPath();
      for (let i = 0; i < P.length; i++) c.lineTo(P[i].x + P[i].nx * P[i].w * a, P[i].y + P[i].ny * P[i].w * a);
      for (let i = P.length - 1; i >= 0; i--) c.lineTo(P[i].x + P[i].nx * P[i].w * b2, P[i].y + P[i].ny * P[i].w * b2);
      c.closePath(); c.fillStyle = col; c.fill();
    };
    const rr = (x, y, w, h, r) => {
      r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
    };
    const TEAL = '#27bcc2', TDARK = '#0f6f78', TSHADE = '#168c96', THL = '#8ff3f0';
    const panel = (p, pt) => {
      const w = pt.w, h = w * p.k, L = p.len, lw = Math.max(1.5, w * 0.045);
      c.save(); c.translate(pt.x + pt.nx * w * p.lat, pt.y + pt.ny * w * p.lat); c.rotate(Math.atan2(pt.ty, pt.tx));
      c.lineWidth = lw; c.strokeStyle = TDARK; c.fillStyle = TEAL; c.lineJoin = 'round';
      if (p.type === 0) {
        rr(-L / 2, -h / 2, L, h, h * 0.28); c.fill(); c.stroke();
        c.fillStyle = TSHADE; rr(-L / 2 + h * 0.1, h * 0.12, L - h * 0.2, h * 0.24, h * 0.1); c.fill();
        c.globalAlpha = 0.8; c.fillStyle = THL; rr(-L / 2 + h * 0.14, -h / 2 + h * 0.12, L * 0.55, h * 0.18, h * 0.09); c.fill(); c.globalAlpha = 1;
      } else if (p.type === 1) {
        const r = w * 0.3;
        c.beginPath(); c.arc(0, 0, r, 0, 6.283); c.fillStyle = '#e6fafc'; c.fill(); c.stroke();
        c.beginPath(); c.arc(0, 0, r * 0.62, 0, 6.283); c.fillStyle = TEAL; c.fill(); c.stroke();
        c.beginPath(); c.arc(0, 0, r * 0.3, 0.35 * Math.PI, 1.65 * Math.PI); c.stroke();
      } else if (p.type === 2) {
        const bw = L / (2 * p.n - 1);
        for (let i = 0; i < p.n; i++) { rr(-L / 2 + i * 2 * bw, -h / 2, bw, h, bw * 0.35); c.fill(); c.stroke(); }
      } else if (p.type === 3) {
        rr(-L / 2, -h * 0.4, L, h * 0.36, h * 0.12); c.fill(); c.stroke();
        c.fillStyle = TDARK; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(-L / 2 + (i + 0.5) * L / 5, h * 0.3, Math.max(1.2, w * 0.035), 0, 6.283); c.fill(); }
      } else {
        rr(-L / 2, -h / 2, L * 0.45, h, h * 0.2); c.fill(); c.stroke();
        rr(L * 0.05, -h / 2 + h * 0.15, L * 0.45, h * 0.7, h * 0.2); c.fill(); c.stroke();
      }
      c.restore();
    };
    const drawBand = (b, t, q) => {
      const g = vis(b, t); if (g <= 0.002) return;
      setCur(b, g, t, q);
      const len = cur.sb - cur.sa, n = Math.max(3, Math.ceil(len / 14)), P = [];
      for (let i = 0; i <= n; i++) P.push(at(b, cur.sa + (len * i) / n));
      c.save(); c.translate(5, 7); strip(P, -0.6, 0.6, 'rgba(0,12,6,.35)'); c.restore();
      strip(P, -0.95, 0.95, 'rgba(70,255,160,.12)'); strip(P, -0.72, 0.72, 'rgba(70,255,160,.14)');
      strip(P, -0.57, 0.57, '#17383c'); strip(P, -0.5, 0.5, '#c3e7ee');
      strip(P, 0.16, 0.5, '#86bcc6'); strip(P, -0.42, -0.16, '#f0fdff');
      for (const p of b.panels) {
        if (p.s < cur.sa + 4 || p.s > cur.sb - 4) continue;
        const pt = at(b, p.s); if (pt.hd < w0 * 1.1) continue;
        panel(p, pt);
      }
    };

    // частицы-изумруды
    const parts = [];
    const burst = (n, t, q) => {
      for (let i = 0; i < n; i++) {
        const b = bands[Math.floor(Math.random() * NB)], g = vis(b, t); if (g < 0.5) continue;
        setCur(b, g, t, q);
        const pt = at(b, (Math.random() - 0.5) * D * 0.7), sd = Math.random() < 0.5 ? -1 : 1, sp = 80 + Math.random() * 260;
        parts.push({ x: pt.x, y: pt.y, vx: pt.nx * sd * sp + pt.tx * (Math.random() - 0.5) * 120, vy: pt.ny * sd * sp + pt.ty * (Math.random() - 0.5) * 120 - 30, life: 0, max: 600 + Math.random() * 500, sz: 3 + Math.random() * 6, h: 140 + Math.random() * 40, r: Math.random() * 6.283 });
      }
      if (parts.length > 160) parts.splice(0, parts.length - 160);
    };

    // звуки
    const t0 = performance.now();
    snd.hg.play(5000).then((ok) => { if (!ok && performance.now() - t0 < 1000) sndBoom(); });
    const fired = { grow: false, out: false, rev: false, up: {}, hit: {} };
    const vib = (p) => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) { /* ignore */ } };

    try {
      await new Promise((resolve) => {
        let last = t0;
        const frame = (now) => {
          const t = now - t0, dt = Math.min(50, now - last); last = now;
          // сжатие: медленно нарастает, резко достигает пика, дрожит и отпускает
          let q = 0, ci = -1, p = 0, S = 0;
          const u = t - T_C0;
          if (u >= 0 && u < NC * CYC) {
            ci = Math.floor(u / CYC); p = (u - ci * CYC) / CYC; S = STR[ci];
            q = p < 0.36 ? eIn(p / 0.36) : p < 0.5 ? 1 + 0.03 * Math.sin(t * 0.12) : 0.5 + 0.5 * Math.cos(Math.PI * clamp((p - 0.5) / 0.5));
            q *= S;
          }
          if (t >= T_GROW && !fired.grow) { fired.grow = true; tone({ type: 'sawtooth', f0: 120, f1: 720, dur: 0.9, vol: 0.05 }); sndRelease(); }
          if (ci >= 0) {
            if (p >= 0.02 && !fired.up[ci]) { fired.up[ci] = 1; tone({ type: 'sawtooth', f0: 55, f1: 120, dur: 0.45, vol: 0.06 }); tone({ type: 'square', f0: 320, f1: 190, dur: 0.18, vol: 0.02, delay: 0.1 }); }
            if (p >= 0.34 && !fired.hit[ci]) {
              fired.hit[ci] = 1; burst(26 + ci * 10, t, q); vib(ci === 2 ? [60, 30, 90] : 40);
              if (ci === 2) sndBoom(); else { tone({ f0: 120, f1: 40, dur: 0.5, vol: 0.4 }); tone({ type: 'sawtooth', f0: 240, f1: 70, dur: 0.4, vol: 0.07 }); }
            }
          }
          if (t >= T_OUT && !fired.out) { fired.out = true; tone({ f0: 900, f1: 150, dur: 0.7, vol: 0.08 }); }
          if (t >= T_REVEAL && !fired.rev) { fired.rev = true; reveal((T_END - T_REVEAL) / 1000 - 0.35); }

          // окно приложения: сжимается вдоль щупалец, дрожит на пике
          const sh = ci >= 0 && p >= 0.34 && p < 0.55 ? S * (1 - (p - 0.34) / 0.21) * 5 : 0;
          modal.style.transform = `translate(${(Math.random() - 0.5) * 2 * sh}px,${(Math.random() - 0.5) * 2 * sh}px) scale(${1 - 0.03 * q},${1 - 0.1 * q})`;

          dark.style.opacity = t < T_OUT ? eOut(clamp(t / 450)) : 1 - clamp((t - T_OUT - 200) / (OUT - 150));
          tint.style.opacity = clamp(q * 0.8 + (t < 300 ? (1 - t / 300) * 0.7 : 0));
          const to = eOut(clamp(t / 350)) * (1 - clamp((t - 1750) / 450));
          ttl.style.opacity = to; ttl.style.transform = `translateY(-50%) scale(${1.3 - 0.3 * eOut(clamp(t / 500)) + 0.02 * clamp((t - 500) / 1500)})`;
          const E = clamp((t - (T_C0 - 350)) / 350) * (1 - clamp((t - T_OUT) / 300));
          const go = E * (0.2 + 0.8 * clamp(q));
          goA.style.opacity = go; goB.style.opacity = go * 0.85;
          goA.style.transform = `rotate(-9deg) scale(${1 + 0.2 * q}) translate(${(Math.random() - 0.5) * sh}px,${(Math.random() - 0.5) * sh}px)`;
          goB.style.transform = `rotate(7deg) scale(${1 + 0.2 * q}) translate(${(Math.random() - 0.5) * sh}px,${(Math.random() - 0.5) * sh}px)`;

          c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
          for (const b of bands) drawBand(b, t, q);
          c.globalCompositeOperation = 'lighter';
          for (let i = parts.length - 1; i >= 0; i--) {
            const o = parts[i]; o.life += dt; if (o.life >= o.max) { parts.splice(i, 1); continue; }
            const k = o.life / o.max, d = dt / 1000;
            o.x += o.vx * d; o.y += o.vy * d; o.vx *= 0.985; o.vy = o.vy * 0.985 + 160 * d; o.r += d * 4;
            c.save(); c.translate(o.x, o.y); c.rotate(o.r); c.globalAlpha = 1 - k;
            c.fillStyle = `hsl(${o.h},95%,${62 + 20 * (1 - k)}%)`; const s = o.sz * (1 - 0.5 * k);
            c.beginPath(); c.moveTo(0, -s * 1.5); c.lineTo(s, 0); c.lineTo(0, s * 1.5); c.lineTo(-s, 0); c.closePath(); c.fill(); c.restore();
          }
          c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
          if (t >= T_END) return resolve();
          requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      });
    } finally {
      fx.remove(); dlg.classList.remove('jg-hg-freeze'); ui.fx = false;
      modal.style.transform = ''; modal.style.filter = ''; modal.style.transition = '';
      if (!fired.rev) reveal(0.2);
    }
  }
  // ---------- Star Platinum: следы кулаков и ломаные порезы, экран рассыпается по ним ----------
  // надпись + «Star Pla-ti-num» → 1-е «ора-ора-ора»: на каждое «ора» маленький чёрный след кулака и короткая трещина →
  // пауза 0.5 с → 2-е «ора-ора-ора»: следы и трещины крупнее, старые подрастают → пауза 0.5 с →
  // одиночное «ОРА!»: огромный след кулака в центре, все трещины разрастаются на весь экран → 0.1 с, удар → экран рассыпается по трещинам
  async function starPlatinumReveal(dlg, reveal, snd) {
    const W = window.innerWidth, H = window.innerHeight;
    const rnd = (a, b) => a + Math.random() * (b - a);
    const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
    const ease = (x) => 1 - Math.pow(1 - x, 3);
    const k = Math.min(2.2, Math.max(1, Math.min(W, H) / 390));
    const vib = (p) => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) { /* ignore */ } };
    const modal = dlg.querySelector('.jg-modal'), rc = modal.getBoundingClientRect();
    const snap = modal.cloneNode(true);
    snap.removeAttribute('id'); snap.querySelectorAll('[id]').forEach((e) => e.removeAttribute('id'));
    snap.querySelectorAll('[data-act]').forEach((e) => e.removeAttribute('data-act'));
    snap.querySelectorAll('.jg-toast').forEach((e) => e.remove());
    snap.style.cssText = `position:absolute;margin:0;width:${rc.width}px;height:${rc.height}px;max-height:none;animation:none;box-shadow:none`;
    const fx = document.createElement('div');
    fx.className = 'jg-fx jg-sp';
    fx.innerHTML = '<div class="jg-sp-shake"><div class="jg-sp-grp"></div><canvas class="jg-sp-cracks"></canvas><div class="jg-sp-flash"></div></div><canvas class="jg-sp-dust"></canvas>';
    dlg.appendChild(fx); // fx перехватывает все касания — управление заблокировано
    ui.fx = true;
    const shake = fx.querySelector('.jg-sp-shake'), grp = fx.querySelector('.jg-sp-grp'), flash = fx.querySelector('.jg-sp-flash');
    const cv = fx.querySelector('.jg-sp-cracks'), dv = fx.querySelector('.jg-sp-dust');
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    [cv, dv].forEach((c) => { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); });
    const cc = cv.getContext('2d'), dc = dv.getContext('2d');
    const timers = [];
    let revealed = false;
    const doReveal = (d) => { if (revealed) return; revealed = true; reveal(d); };
    const flashFx = (o) => flash.animate([{ opacity: o }, { opacity: 0 }], { duration: 170, easing: 'ease-out', fill: 'both' });
    // моменты каждого «ора» в обрезанной записи (сек от начала)
    const ONS = [0.13, 0.296, 0.544, 0.754, 0.955, 1.147, 1.338, 1.516, 1.698, 1.866, 2.041, 2.216, 2.392, 2.556, 2.733, 2.899];
    const PUNCH_DELAY = 0.05, FINAL_GAP = 0.1;

    // ----- звук -----
    const a = audio();
    const noiseBuf = a ? (() => { const n = Math.floor(a.sampleRate * 0.5), b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; return b; })() : null;
    const noise = (dur, vol, f0, f1, delay = 0) => {
      if (!a || !noiseBuf) return;
      const t = a.currentTime + delay, s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
      s.buffer = noiseBuf; s.loop = true; f.type = 'bandpass'; f.Q.value = 0.8;
      f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(a.destination); s.start(t); s.stop(t + dur + 0.02);
    };
    const crackSnd = (v = 1) => { noise(0.16, 0.28 * v, 2200, 450); tone({ type: 'triangle', f0: rnd(160, 260), f1: 60, dur: 0.12, vol: 0.12 * v }); tone({ f0: 80, f1: 40, dur: 0.18, vol: 0.18 * v }); };
    const crumbleSnd = () => {
      noise(1.2, 0.45, 3500, 500); sndBoom();
      for (let i = 0; i < 10; i++) tone({ f0: rnd(110, 320), f1: 50, dur: rnd(0.08, 0.16), vol: 0.1, delay: rnd(0, 0.9) });
    };
    // at — задержка старта (с), off/dur — играть только кусок записи
    const playBuf = (buf, { vol = 1, at = 0, off = 0, dur = 0 } = {}) => {
      if (!a || !buf) return false;
      const t = a.currentTime + 0.03 + at, src = a.createBufferSource(), g = a.createGain();
      src.buffer = buf; g.gain.setValueAtTime(vol, t);
      if (dur) { g.gain.setValueAtTime(vol, t + dur - 0.05); g.gain.linearRampToValueAtTime(0.0001, t + dur); }
      src.connect(g); g.connect(a.destination);
      if (dur) src.start(t, off, dur); else src.start(t, off);
      return true;
    };

    // ----- ломаные порезы: одна и та же функция искажает и линии, и края осколков, поэтому всё рассыпается именно по ним -----
    const hash = (x, y) => { let h = (Math.round(x * 2) * 374761393 + Math.round(y * 2) * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
    const AMP = 8.5 * k, GRID = 24 * k;
    const warp = (p) => {
      if (p.x < 0.5 || p.x > W - 0.5 || p.y < 0.5 || p.y > H - 0.5) return p; // края экрана не трогаем
      return { x: p.x + (hash(p.x, p.y) - 0.5) * 2 * AMP, y: p.y + (hash(p.y + 17.3, p.x - 9.1) - 0.5) * 2 * AMP };
    };
    // точки излома вдоль отрезка — пересечения с глобальной сеткой (у совпадающих участков разных линий они одинаковы)
    const samples = (p, q) => {
      const ts = [0, 1], dx = q.x - p.x, dy = q.y - p.y;
      if (dx) for (let i = Math.ceil(Math.min(p.x, q.x) / GRID); i * GRID <= Math.max(p.x, q.x); i++) { const t = (i * GRID - p.x) / dx; if (t > 0 && t < 1) ts.push(t); }
      if (dy) for (let j = Math.ceil(Math.min(p.y, q.y) / GRID); j * GRID <= Math.max(p.y, q.y); j++) { const t = (j * GRID - p.y) / dy; if (t > 0 && t < 1) ts.push(t); }
      ts.sort((m, n) => m - n);
      return ts.map((t) => ({ x: p.x + dx * t, y: p.y + dy * t }));
    };
    const raggedPoly = (poly) => poly.flatMap((p, i) => samples(p, poly[(i + 1) % poly.length]).slice(0, -1).map(warp));

    const L = scLayout(W, H, 70);
    const lines = [...L.main, ...L.chords].map((l) => {
      const pts = samples(l.a, l.b).map(warp), cum = [0];
      for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
      // r — «радиус» видимой части вокруг точки удара s0 (вдоль линии); растёт от удара к удару
      return { pts, cum, len: cum[cum.length - 1], s0: cum[cum.length - 1] / 2, r: 0, rFrom: 0, rTo: 0, ta: 0, td: 1 };
    });
    const ptAt = (ln, s) => {
      s = clamp(s, 0, ln.len);
      for (let i = 1; i < ln.pts.length; i++) if (ln.cum[i] >= s) { const f = (s - ln.cum[i - 1]) / (ln.cum[i] - ln.cum[i - 1] || 1), q0 = ln.pts[i - 1], q1 = ln.pts[i]; return { x: q0.x + (q1.x - q0.x) * f, y: q0.y + (q1.y - q0.y) * f }; }
      return ln.pts[ln.pts.length - 1];
    };
    const nearest = (ln, pt) => { let bd = 1e9, bs = 0; for (let i = 0; i < ln.pts.length; i++) { const d = Math.hypot(ln.pts[i].x - pt.x, ln.pts[i].y - pt.y); if (d < bd) { bd = d; bs = ln.cum[i]; } } return [bd, bs]; };
    // раздаём линии по ударам: у каждого удара свой след кулака и 1–2 ближайшие к нему трещины; остатки уходят к ближайшему удару
    const assign = (set, nHits) => {
      const pool = [...set], res = [];
      for (let h = 0; h < nHits; h++) {
        if (!pool.length) { res.push(null); continue; }
        const pi = pool.splice(Math.floor(Math.random() * pool.length), 1)[0], pl = lines[pi];
        pl.s0 = pl.len * rnd(0.25, 0.75);
        const mark = ptAt(pl, pl.s0), ids = [pi];
        let best = -1, bd = 1e9, bs = 0;
        for (const j of pool) { const [d, s] = nearest(lines[j], mark); if (d < bd) { bd = d; best = j; bs = s; } }
        if (best >= 0 && bd < 150 * k) { pool.splice(pool.indexOf(best), 1); lines[best].s0 = bs; ids.push(best); }
        res.push({ mark, ids });
      }
      const live = res.filter(Boolean);
      for (const j of pool) {
        if (!live.length) break;
        let bh = live[0], bd = 1e9, bs = 0;
        for (const h of live) { const [d, s] = nearest(lines[j], h.mark); if (d < bd) { bd = d; bh = h; bs = s; } }
        lines[j].s0 = bs; bh.ids.push(j);
      }
      return res;
    };
    const idx = lines.map((_, i) => i).sort(() => Math.random() - 0.5), half = Math.ceil(idx.length / 2);
    const hitsB = assign(idx.slice(0, half), ONS.length), hitsC = assign(idx.slice(half), ONS.length);

    // ----- рисунок: следы кулаков (чёрные) и порезы в стиле Silver Chariot — чёрная линия с бегущим белым бликом на конце -----
    // след кулака спереди: 4 костяшки, сгибы пальцев и большой палец поперёк (контуры заданы SVG-путями)
    const FIST = new Path2D('M-26 -16H26Q41 -16 41 -1V8Q41 21 26 21H-26Q-41 21 -41 8V-1Q-41 -16 -26 -16ZM-22 -12A11 11 0 1 1 -44 -12A11 11 0 1 1 -22 -12ZM1 -20A12.5 12.5 0 1 1 -24 -20A12.5 12.5 0 1 1 1 -20ZM24.5 -21A13 13 0 1 1 -1.5 -21A13 13 0 1 1 24.5 -21ZM45.5 -14A12.5 12.5 0 1 1 20.5 -14A12.5 12.5 0 1 1 45.5 -14ZM-34 22A31 12.5 0 1 1 28 22A31 12.5 0 1 1 -34 22Z');
    const FIST_DET = new Path2D('M-22 -5Q-23 4 -21.5 12 M0 -8Q-.5 4 .5 12 M22 -5Q23 4 21.5 12 M-38 4Q-31 1 -25 4 M-19 2Q-11 -1 -4 2 M4 2Q11 -1 19 2 M25 4Q31 1 38 4 M-31 17Q-6 10 24 15');
    const FIST_HL = new Path2D('M-39.1 -16.2A7.4 7.4 0 0 1 -31.7 -19.3M-18.8 -25.1A8.9 8.9 0 0 1 -10.0 -28.8M3.8 -26.4A9.4 9.4 0 0 1 13.1 -30.3M25.7 -19.1A8.9 8.9 0 0 1 34.5 -22.8');
    const marks = [];
    let dirty = false;
    const addMark = (x, y, size, big) => { marks.push({ x, y, size, big, rot: rnd(-0.5, 0.5), t: performance.now() }); dirty = true; };
    const lineR = (ln, now) => (now < ln.ta ? ln.rFrom : ln.rFrom + (ln.rTo - ln.rFrom) * ease(clamp((now - ln.ta) / ln.td)));
    const grow = (ln, rTo, dur, delay = 0) => { const now = performance.now(); ln.rFrom = lineR(ln, now); ln.rTo = Math.max(rTo, ln.rFrom); ln.ta = now + delay; ln.td = dur; dirty = true; };
    const traceRange = (ln, s0, s1) => {
      const P = ptAt(ln, s0); cc.moveTo(P.x, P.y);
      for (let i = 1; i < ln.pts.length; i++) { if (ln.cum[i] <= s0) continue; if (ln.cum[i] >= s1) break; cc.lineTo(ln.pts[i].x, ln.pts[i].y); }
      const Q = ptAt(ln, s1); cc.lineTo(Q.x, Q.y);
    };
    const drawMark = (m, now) => {
      const e = ease(clamp((now - m.t) / (m.big ? 200 : 130))), sc = (m.size / 100) * (1.35 - 0.35 * e);
      const g = cc.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.size * 0.9);
      g.addColorStop(0, `rgba(0,0,0,${0.4 * e})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      cc.fillStyle = g; cc.beginPath(); cc.arc(m.x, m.y, m.size * 0.9, 0, 6.283); cc.fill();
      cc.save(); cc.translate(m.x, m.y); cc.rotate(m.rot); cc.scale(sc, sc); cc.globalAlpha = e;
      cc.lineJoin = 'round'; cc.lineCap = 'round';
      cc.lineWidth = 2.6; cc.strokeStyle = 'rgba(255,255,255,.24)'; cc.stroke(FIST); // обводка: внутренняя половина прикрыта заливкой
      cc.fillStyle = 'rgba(4,3,8,.94)'; cc.fill(FIST);
      cc.lineWidth = 1.3; cc.strokeStyle = 'rgba(150,145,172,.7)'; cc.stroke(FIST_DET);
      cc.lineWidth = 1.4; cc.strokeStyle = 'rgba(255,255,255,.3)'; cc.stroke(FIST_HL);
      cc.restore(); cc.globalAlpha = 1;
    };
    const drawAll = (now) => {
      cc.setTransform(dpr, 0, 0, dpr, 0, 0); cc.clearRect(0, 0, W, H);
      cc.lineCap = 'round'; cc.lineJoin = 'miter';
      for (const m of marks) drawMark(m, now);
      const vis = [];
      cc.lineWidth = 1.2 * k; cc.strokeStyle = 'rgba(5,4,10,.96)'; cc.beginPath();
      for (const ln of lines) {
        ln.r = lineR(ln, now); if (ln.r <= 0.5) continue;
        const lo = Math.max(0, ln.s0 - ln.r), hi = Math.min(ln.len, ln.s0 + ln.r);
        if (hi - lo < 1) continue;
        traceRange(ln, lo, hi); if (now < ln.ta + ln.td) vis.push([ln, lo, hi]);
      }
      cc.stroke();
      // белый блик на концах растущих порезов
      if (vis.length) for (const [w, col] of [[2.6 * k, 'rgba(207,230,255,.26)'], [0.9 * k, 'rgba(243,248,255,.95)']]) {
        cc.lineWidth = w; cc.strokeStyle = col; cc.beginPath();
        for (const [ln, lo, hi] of vis) { traceRange(ln, Math.max(lo, hi - 30 * k), hi); traceRange(ln, lo, Math.min(hi, lo + 30 * k)); }
        cc.stroke();
      }
    };
    const anyActive = (now) => marks.some((m) => now < m.t + 230) || lines.some((ln) => now < ln.ta + ln.td + 30);

    // ----- пыль и дрожь: один цикл кадров, управляется общим состоянием ST -----
    const ST = { run: true, shaking: true, amp: 0, ampT: 0, imp: 0, dust: 0, fog: 0, fogT: 0 };
    const dust = []; let acc = 0;
    const spawn = (big) => dust.push({ x: rnd(0, W), y: rnd(-10, 6), vx: rnd(-14, 14), vy: rnd(20, 70) * (big ? 1.5 : 1), sz: rnd(1, 3.4) * k * (big ? rnd(1.2, 2.2) : 1), life: 0, max: rnd(900, 2000), a: rnd(0.35, 0.85) });
    const burst = (n) => { for (let i = 0; i < n; i++) spawn(Math.random() < 0.3); };
    const loop = (() => {
      let last = performance.now();
      const frame = (now) => {
        if (!ST.run) return;
        const dt = Math.min(50, now - last); last = now;
        ST.amp += (ST.ampT - ST.amp) * Math.min(1, dt / 120); ST.imp *= Math.exp(-dt / 110);
        const A = ST.amp + ST.imp;
        // дрожит и картинка-осколки, и настоящее окно под ними (одинаковый сдвиг — швов не видно)
        const tr = ST.shaking && A > 0.05 ? `translate(${rnd(-1, 1) * A}px,${rnd(-1, 1) * A}px)` : '';
        shake.style.transform = tr; modal.style.transform = tr;
        if (dirty) { drawAll(performance.now()); dirty = anyActive(performance.now()); }
        acc += ST.dust * dt / 1000; while (acc >= 1) { acc -= 1; if (dust.length < 420) spawn(false); }
        ST.fog += (ST.fogT - ST.fog) * Math.min(1, dt / 300);
        dc.setTransform(dpr, 0, 0, dpr, 0, 0); dc.clearRect(0, 0, W, H);
        if (ST.fog > 0.01) {
          const g = dc.createLinearGradient(0, 0, 0, 120 * k);
          g.addColorStop(0, `rgba(205,196,182,${0.3 * ST.fog})`); g.addColorStop(1, 'rgba(205,196,182,0)');
          dc.fillStyle = g; dc.fillRect(0, 0, W, 120 * k);
        }
        const d = dt / 1000;
        for (let i = dust.length - 1; i >= 0; i--) {
          const o = dust[i]; o.life += dt;
          if (o.life >= o.max) { dust.splice(i, 1); continue; }
          o.x += o.vx * d; o.y += o.vy * d; o.vy += 90 * d; o.vx *= 0.99;
          dc.fillStyle = `rgba(212,203,188,${o.a * (1 - o.life / o.max)})`; dc.fillRect(o.x, o.y, o.sz, o.sz);
        }
        requestAnimationFrame(frame);
      };
      return () => requestAnimationFrame(frame);
    })();

    try {
      const [bVoice, bRush, bSingle, bPunch] = await Promise.all(snd.sp);
      // кусочки: каждый — копия окна, обрезанная ломаным многоугольником (пока нет порезов выглядят как обычное окно)
      L.pieces.forEach((q) => {
        const c = polyCenter(q.poly); q.c = c;
        const pts = raggedPoly(q.poly).map((v) => { const dx = v.x - c.x, dy = v.y - c.y, l = Math.hypot(dx, dy) || 1; return { x: v.x + (dx / l) * 0.7, y: v.y + (dy / l) * 0.7 }; });
        const bx = Math.floor(Math.min(...pts.map((v) => v.x))), by = Math.floor(Math.min(...pts.map((v) => v.y)));
        const bw = Math.ceil(Math.max(...pts.map((v) => v.x))) - bx, bh = Math.ceil(Math.max(...pts.map((v) => v.y))) - by;
        const el = document.createElement('div');
        el.className = 'jg-sp-piece';
        el.style.cssText = `left:${bx}px;top:${by}px;width:${bw}px;height:${bh}px;transform-origin:${c.x - bx}px ${c.y - by}px;clip-path:polygon(${pts.map((v) => `${(v.x - bx).toFixed(1)}px ${(v.y - by).toFixed(1)}px`).join(',')})`;
        const c2 = snap.cloneNode(true); c2.style.left = `${rc.left - bx}px`; c2.style.top = `${rc.top - by}px`;
        el.appendChild(c2); grp.appendChild(el); q.el = el;
      });
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      loop();
      const ttl = titleCard(fx, 'スタープラチナ', 'STAR PLATINUM', 'sp', { bg: 'rgba(140,80,230,.3)', blur: 4 }); // полупрозрачный фиолетовый фон за надписью

      // 1) надпись и «Star Pla-ti-num» (просто звук)
      const dA = bVoice ? bVoice.duration * 1000 : 2000;
      if (!playBuf(bVoice, { vol: 0.95 })) sndBoom();
      ttl.hide(Math.max(1200, dA - 250));
      await sleep(dA);

      // 2) «ора-ора-ора» + удар после каждого «ора» (через 0.05 с)
      const dR = bRush ? Math.min(3000, bRush.duration * 1000) : 3000;
      const rush = (o) => {
        if (!playBuf(bRush, { vol: o.vol })) sndBoom();
        if (bPunch) ONS.forEach((t) => playBuf(bPunch, { vol: o.pvol, at: t + PUNCH_DELAY, off: 0.05, dur: 0.2 }));
      };
      // 1-е «ора»: на каждое — маленький чёрный след кулака и короткие трещины рядом
      const hitB = (i) => {
        const h = hitsB[i]; if (!h) return;
        addMark(h.mark.x, h.mark.y, rnd(20, 30) * k, false);
        h.ids.forEach((id, j) => grow(lines[id], rnd(22, 38) * k, 130, j * 40));
        ST.imp += 1.2 * k; burst(6); crackSnd(0.25); vib(10);
      };
      rush({ vol: 0.85, pvol: 0.8 });
      ST.ampT = 0.9 * k; ST.dust = 28; ST.fogT = 0.4;
      ONS.forEach((t, i) => timers.push(setTimeout(() => hitB(i), (t + 0.03) * 1000)));
      await sleep(dR);
      ST.ampT = 0; ST.dust = 0; ST.fogT = 0;
      await sleep(500); // пауза

      // 3) 2-е «ора»: следы кулаков и трещины крупнее, а прежние трещины подрастают
      const hitC = (i) => {
        const hb = hitsB[i], hc = hitsC[i];
        if (hb) hb.ids.forEach((id) => grow(lines[id], rnd(70, 110) * k, 170));
        if (hc) {
          addMark(hc.mark.x, hc.mark.y, rnd(40, 58) * k, false);
          hc.ids.forEach((id, j) => grow(lines[id], rnd(80, 130) * k, 170, j * 40));
        }
        ST.imp += 2.4 * k; burst(10); crackSnd(0.45); flashFx(0.12); vib(14);
      };
      rush({ vol: 1, pvol: 1 });
      ST.ampT = 0.5 * k;
      ONS.forEach((t, i) => timers.push(setTimeout(() => hitC(i), (t + 0.03) * 1000)));
      await sleep(dR);
      ST.ampT = 0;
      await sleep(500); // пауза

      // 4) одиночное «ОРА!»: огромный след кулака в центре, все трещины разрастаются от него на весь экран
      const dS = bSingle ? bSingle.duration * 1000 : 950;
      if (!playBuf(bSingle, { vol: 1 })) sndBoom();
      addMark(W / 2, H / 2, Math.min(W, H) * 0.62, true);
      flashFx(0.3); vib([40, 20, 60]);
      ST.imp += 3 * k; ST.ampT = 1.6 * k; ST.dust = 90; ST.fogT = 0.7; burst(30); crackSnd(0.9);
      const spreadMs = dS * 0.75, maxD = Math.hypot(W / 2, H / 2);
      lines.forEach((ln) => {
        const p = ptAt(ln, ln.s0), d = Math.hypot(p.x - W / 2, p.y - H / 2);
        grow(ln, Math.max(ln.s0, ln.len - ln.s0) + 2, 380, 60 + (d / maxD) * spreadMs); // от центра к краям, как ударная волна
      });
      for (let i = 0; i < 6; i++) timers.push(setTimeout(() => { crackSnd(0.5); burst(12); ST.imp += 1.6 * k; vib(12); }, 80 + (i / 6) * spreadMs));
      await sleep(dS + FINAL_GAP * 1000); // заминка 0.1 с
      // удар: слабая дрожь, осколки «расшатываются» по порезам
      if (!playBuf(bPunch, { vol: 1, off: 0.05 })) sndBoom();
      vib([50, 30, 70]);
      ST.imp += 3 * k; ST.ampT = 3.5 * k; ST.dust = 200; ST.fogT = 1;
      tone({ type: 'sawtooth', f0: 48, f1: 24, dur: 1.1, vol: 0.1 }); tone({ f0: 70, f1: 28, dur: 1.0, vol: 0.3 });
      timers.push(setTimeout(() => { ST.ampT = 5 * k; }, 200));
      await sleep(450);
      L.pieces.forEach((q) => {
        const dx = q.c.x - W / 2, dy = q.c.y - H / 2, l = Math.hypot(dx, dy) || 1, m = rnd(2, 5) * k, a1 = rnd(0, 6.283);
        q.sep = { x: (l > 3 ? dx / l : Math.cos(a1)) * m, y: (l > 3 ? dy / l : Math.sin(a1)) * m, r: rnd(-2, 2) };
        q.el.animate([{ transform: 'translate(0,0) rotate(0deg)' }, { transform: `translate(${q.sep.x}px,${q.sep.y}px) rotate(${q.sep.r}deg)` }], { duration: 280, easing: 'ease-out', fill: 'forwards' });
      });
      await sleep(300);

      // 5) всё осыпается вниз, под осколками — результат
      ST.shaking = false; ST.ampT = 0; ST.amp = 0; ST.imp = 0; shake.style.transform = ''; modal.style.transform = '';
      ST.dust = 150; ST.fogT = 0;
      timers.push(setTimeout(() => { ST.dust = 0; }, 700));
      crumbleSnd(); vib([80, 40, 120]);
      doReveal(0.7);
      cv.animate({ opacity: [1, 0] }, { duration: 260, fill: 'forwards' });
      L.pieces.forEach((q) => {
        const fall = H * rnd(0.7, 1.15), sx = rnd(-45, 45), sr = rnd(-140, 140), dl = rnd(0, 320) + (1 - q.c.y / H) * 180;
        q.el.animate([
          { transform: `translate(${q.sep.x}px,${q.sep.y}px) rotate(${q.sep.r}deg)`, opacity: 1 },
          { opacity: 1, offset: 0.7 },
          { transform: `translate(${q.sep.x + sx}px,${q.sep.y + fall}px) rotate(${q.sep.r + sr}deg) scale(.92)`, opacity: 0 },
        ], { duration: rnd(850, 1250), delay: dl, easing: 'cubic-bezier(.55,0,1,.45)', fill: 'forwards' });
      });
      await sleep(1900);
    } finally {
      timers.forEach(clearTimeout); ST.run = false;
      fx.remove(); modal.style.transform = ''; ui.fx = false;
      doReveal(0.2); // если что-то пошло не так — результат всё равно покажется
    }
  }
  // ---------- Heaven's Door: экран — первый лист книги, дальше листы с кодом Таверны, перелистывание ускоряется, книгу захлопывают ----------
  // 0–≈2 с: надпись + светлый фон (+ голос, если есть sounds/heavens-door.mp3); касания блокируются всё время анимации.
  // Дальше: экран темнеет до «листа», 5 медленных перелистываний, 32 всё более быстрых (текст уже не разобрать), резкий хлопок обложкой.
  // Под закрытой обложкой подставляется результат, обложка гаснет.
  const HD_FALLBACK = `async function getChatCompletion(messages, signal) {
  const settings = await loadSettings();
  const payload = { model: settings.model, messages, stream: true, temperature: 0.9 };
  const res = await fetch('/api/backends/chat-completions/generate', {
    method: 'POST', headers: getRequestHeaders(), body: JSON.stringify(payload), signal,
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.body.getReader();
}
function saveChat(chatId, chat) {
  const data = chat.map((m, i) => ({ ...m, index: i }));
  return fetch('/api/chats/save', { method: 'POST', body: JSON.stringify({ id: chatId, data }) });
}
eventSource.on(event_types.MESSAGE_RECEIVED, async (id) => {
  const mes = chat[id];
  if (!mes || mes.is_user) return;
  mes.extra = mes.extra || {};
  mes.extra.token_count = await getTokenCountAsync(mes.mes);
  await eventSource.emit(event_types.CHARACTER_MESSAGE_RENDERED, id);
});
for (const char of characters) {
  if (char.fav) favorites.push(char.avatar);
  else others.push(char.avatar);
}
let cache = new Map(); const TTL = 60000;
export function getContext() { return { chat, characters, name1, name2, chatMetadata }; }
`;
  let hdCodeP = null;
  // Берём настоящий код Таверны (её же файлы отдаёт сервер); не получилось — запасной кусок
  function hdLoadCode() {
    if (hdCodeP) return hdCodeP;
    const files = ['/script.js', '/scripts/extensions.js', '/scripts/power-user.js', '/scripts/world-info.js', '/scripts/openai.js'];
    hdCodeP = Promise.all(files.map(async (u) => {
      try {
        const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), 3000);
        const r = await fetch(u, { signal: ctl.signal }); clearTimeout(tm);
        if (!r.ok) return null;
        const t = await r.text();
        return t.length > 3000 ? t.split('\n') : null;
      } catch (e) { return null; }
    })).then((arr) => { const ok = arr.filter(Boolean); return ok.length ? ok : [HD_FALLBACK.split('\n')]; });
    return hdCodeP;
  }
  const HD_RE = /(\/\/.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|\b(const|let|var|function|return|if|else|for|while|await|async|import|export|from|new|class|try|catch|throw|switch|case|break|of|in|true|false|null)\b|\b(\d+)\b/g;
  function hdLine(s) {
    s = s.replace(/\t/g, '  ').slice(0, 100);
    let out = '', last = 0, m;
    HD_RE.lastIndex = 0;
    while ((m = HD_RE.exec(s))) {
      out += esc(s.slice(last, m.index));
      out += `<i class="${m[1] ? 'c' : m[2] ? 's' : m[3] ? 'k' : 'n'}">${esc(m[0])}</i>`;
      last = m.index + m[0].length;
    }
    return out + esc(s.slice(last));
  }
  // Случайные куски сообщений текущего чата Таверны вместо кода. Строки уже перенесены под ширину страницы; \u0001 в начале = строка с именем
  function hdChatLines(cols, need) {
    const clean = (t) => String(t || '').replace(/<think>[\s\S]*?<\/think>/gi, ' ').replace(/```[\s\S]*?```/g, ' ').replace(/<[^>]*>/g, ' ').replace(/[*_~`#>|]+/g, '').replace(/\s+/g, ' ').trim();
    let chatArr = [];
    try { chatArr = ctx().chat || []; } catch (e) { /* нет контекста */ }
    const msgs = chatArr.filter((m) => m && !m.is_system).map((m) => ({ n: String(m.name || (m.is_user ? 'User' : '')), t: clean(m.mes) })).filter((m) => m.t.length > 12);
    if (!msgs.length) return null;
    const wrap = (txt) => {
      const out = []; let cur = '';
      for (let w of txt.split(' ')) {
        while (w.length > cols) { if (cur) { out.push(cur); cur = ''; } out.push(w.slice(0, cols)); w = w.slice(cols); }
        if (!cur) cur = w; else if (cur.length + 1 + w.length <= cols) cur += ' ' + w; else { out.push(cur); cur = w; }
      }
      if (cur) out.push(cur);
      return out;
    };
    const out = [];
    for (let guard = 0; out.length < need && guard < 80; guard++) {
      for (const m of msgs.slice().sort(() => Math.random() - 0.5)) {
        const parts = m.t.match(/[^.!?…]+[.!?…]*\s*/g) || [m.t], st = Math.floor(Math.random() * parts.length);
        let t = '';
        for (let k = st; k < parts.length && t.length < 520; k++) t += parts[k];
        out.push('\u0001' + (m.n ? m.n.slice(0, Math.max(1, cols - 2)) + ':' : '—'), ...wrap(t.trim().slice(0, 700)), '');
        if (out.length >= need) break;
      }
    }
    return out.length ? [out] : null;
  }
  // Heaven's Door v2. Хронология (~11 с):
  // титул (лучи, буквы по одной, бумажки) → экран становится страницей → 5 медленных перелистываний с изгибом листа →
  // 30 всё более быстрых (летят токены кода, полосы ветра, наезд камеры) → захлопывание обложки (ударная волна, пыль, тряска) →
  // из щели между створками пробивается свет → створки-«небесные врата» распахиваются, свет гаснет, под ним результат.
  const HD_SVG_DOOR = (() => {
    let rays = '';
    for (let a = -75; a <= 75; a += 15) { const s = Math.sin(a * Math.PI / 180), c = Math.cos(a * Math.PI / 180); rays += `<path d="M${(100 + 80 * s).toFixed(1)} ${(118 - 80 * c).toFixed(1)}L${(100 + 106 * s).toFixed(1)} ${(118 - 106 * c).toFixed(1)}"/>`; }
    return `<svg class="jg-hd-dsvg" viewBox="0 0 200 320" fill="none" stroke="#d9b45f" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><g stroke-width="1.5" opacity=".8">${rays}</g><path d="M30 312V118a70 70 0 0 1 140 0V312Z" fill="rgba(0,0,0,.4)"/><path d="M42 312V120a58 58 0 0 1 116 0V312"/><path d="M100 62V312"/><path d="M55 150h35v70H55zM110 150h35v70h-35zM55 240h35v56H55zM110 240h35v56h-35z" stroke-width="1.6"/><circle cx="92" cy="232" r="3.4" fill="#d9b45f"/><circle cx="108" cy="232" r="3.4" fill="#d9b45f"/><path d="M100 30l3.2 7.4 8 .7-6.1 5.3 1.9 7.9-7-4.2-7 4.2 1.9-7.9-6.1-5.3 8-.7z" fill="#d9b45f" stroke-width="1"/></svg>`;
  })();
  const HD_COVER = `<div class="jg-hd-cvbg"></div><div class="jg-hd-cvglow"></div>${HD_SVG_DOOR}<div class="jg-hd-cvtx"><b>ヘブンズ・ドアー</b><small>HEAVEN'S DOOR</small></div><div class="jg-hd-seam"></div>`;
  const HD_TOK = ['const', 'await', '=>', '{ }', '();', '0x1F', 'async', 'function', 'return', 'if (!', 'for (', 'null', '===', '&&', '[]', '</>', 'import', 'class', 'try {', 'JSON.parse', 'fetch(', 'chat[i]', 'mes.extra', 'emit()', '0101', 'let i'];

  async function heavensDoorReveal(dlg, reveal, snd) {
    const W = window.innerWidth, H = window.innerHeight;
    const modal = dlg.querySelector('.jg-modal'), rc = modal.getBoundingClientRect();
    const useChat = S().hdSource === 'chat';
    const codeP = useChat ? null : hdLoadCode(); // грузится, пока идёт титул
    const [bufName, bufFlip, bufSlam, bufOpen] = [await snd.hdName, await snd.hdFlip, await snd.hdSlam, await snd.hdOpen];
    const rnd = (lo, hi) => lo + Math.random() * (hi - lo);
    const el = (cls, html) => { const d = document.createElement('div'); d.className = cls; if (html) d.innerHTML = html; return d; };
    const fx = el('jg-fx jg-hd');
    dlg.appendChild(fx);
    ui.fx = true;
    const a = audio();
    let revealed = false, dead = false;
    const timers = [];
    const doReveal = (d) => { if (revealed) return; revealed = true; reveal(d); };

    // ---------- звук ----------
    let noise = null;
    if (a) { noise = a.createBuffer(1, a.sampleRate, a.sampleRate); const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const flipSnd = (when, dur, vol, f0, f1) => {
      if (!a) return;
      const src = a.createBufferSource(), g = a.createGain();
      if (bufFlip) { src.buffer = bufFlip; src.playbackRate.value = 0.9 + Math.random() * 0.3; g.gain.value = Math.min(1, vol * 3); src.connect(g); g.connect(a.destination); src.start(when); return; }
      const f = a.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 0.8; f.frequency.setValueAtTime(f0, when); f.frequency.exponentialRampToValueAtTime(f1, when + dur);
      src.buffer = noise;
      g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(vol, when + dur * 0.25); g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
      src.connect(f); f.connect(g); g.connect(a.destination); src.start(when, Math.random() * 0.6, dur + 0.05);
    };
    const slamSnd = (when) => {
      if (!a) return;
      if (bufSlam) { const s = a.createBufferSource(); s.buffer = bufSlam; s.connect(a.destination); s.start(when); return; }
      const o = a.createOscillator(), g = a.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(120, when); o.frequency.exponentialRampToValueAtTime(30, when + 0.55);
      g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(1, when + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, when + 0.6);
      o.connect(g); g.connect(a.destination); o.start(when); o.stop(when + 0.65);
      const s = a.createBufferSource(), f = a.createBiquadFilter(), g2 = a.createGain();
      f.type = 'lowpass'; f.frequency.value = 2600; s.buffer = noise;
      g2.gain.setValueAtTime(0.0001, when); g2.gain.exponentialRampToValueAtTime(0.8, when + 0.006); g2.gain.exponentialRampToValueAtTime(0.0001, when + 0.22);
      s.connect(f); f.connect(g2); g2.connect(a.destination); s.start(when, 0.1, 0.25);
    };
    const openSnd = (when) => {
      if (!a) return;
      if (bufOpen) { const s = a.createBufferSource(); s.buffer = bufOpen; s.connect(a.destination); s.start(when); return; }
      const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
      s.buffer = noise; f.type = 'lowpass'; f.frequency.setValueAtTime(140, when); f.frequency.linearRampToValueAtTime(420, when + 1.4);
      g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(0.7, when + 0.5); g.gain.exponentialRampToValueAtTime(0.0001, when + 1.6);
      s.connect(f); f.connect(g); g.connect(a.destination); s.start(when, 0, 1.7); // низкий гул створок
      [523.25, 659.25, 783.99, 1046.5].forEach((fr, i) => tone({ f0: fr, dur: 1.7, vol: 0.05, delay: (when - a.currentTime) + 0.45 + i * 0.09 })); // сияющий аккорд
    };

    // ---------- мелкие эффекты ----------
    // летящий лист бумаги
    const scrap = (host, x0, y0, x1, y1, delay, dur, sz = 1) => {
      const p = el('jg-hd-scrap'), w = rnd(14, 30) * sz, r0 = rnd(-180, 180);
      p.style.cssText = `width:${w}px;height:${w * rnd(1.2, 1.5)}px`;
      host.appendChild(p);
      p.animate([
        { transform: `translate(${x0}px,${y0}px) rotate(${r0}deg) rotate3d(1,1,0,0deg)`, opacity: 0 },
        { opacity: 1, offset: 0.12 }, { opacity: 1, offset: 0.78 },
        { transform: `translate(${x1}px,${y1}px) rotate(${r0 + rnd(-420, 420)}deg) rotate3d(1,1,0,${rnd(-240, 240)}deg)`, opacity: 0 },
      ], { duration: dur, delay, easing: 'cubic-bezier(.3,.1,.5,1)', fill: 'both' }).finished.then(() => p.remove(), () => p.remove());
    };
    const scr = el('jg-hd-layer'); scr.style.zIndex = 3; fx.appendChild(scr);

    try {
      // ================= 1) титул =================
      fx.style.transition = 'background-color .5s, backdrop-filter .5s, -webkit-backdrop-filter .5s';
      void fx.offsetWidth;
      fx.style.background = 'rgba(205,225,255,.22)'; fx.style.backdropFilter = fx.style.webkitBackdropFilter = 'blur(6px)';
      let dN = 2200;
      const vig = el('jg-hd-vig'), rays0 = el('jg-hd-rays');
      vig.style.zIndex = 1; rays0.style.zIndex = 1;
      fx.append(vig, rays0);
      vig.animate({ opacity: [0, 1] }, { duration: 700, fill: 'forwards' });
      rays0.animate({ opacity: [0, 1] }, { duration: 900, fill: 'forwards' });
      const tt = el('jg-hd-ttl', `<b>${[...'ヘブンズ・ドアー'].map((c) => `<span>${c}</span>`).join('')}</b><i class="jg-hd-ln"></i><small>HEAVEN'S DOOR</small>`);
      fx.appendChild(tt);
      tt.querySelectorAll('b span').forEach((sp, i) => sp.animate([{ opacity: 0, transform: 'translateY(-46px) scale(1.8)', filter: 'blur(9px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 520, delay: 150 + i * 80, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'both' }));
      tt.querySelector('.jg-hd-ln').animate({ width: ['0%', '62%'], opacity: [0, 1] }, { duration: 700, delay: 800, easing: 'ease-out', fill: 'both' });
      tt.querySelector('small').animate({ opacity: [0, 1], letterSpacing: ['.7em', '.34em'] }, { duration: 800, delay: 900, easing: 'ease-out', fill: 'both' });
      if (a && bufName) {
        const [ns, ne] = audibleSpan(bufName), src = a.createBufferSource(), g = a.createGain(), t = a.currentTime;
        dN = Math.max(dN, (ne - ns) * 1000 + 200);
        src.buffer = bufName; g.gain.setValueAtTime(2, t); g.gain.setValueAtTime(2, t + (ne - ns) - 0.04); g.gain.linearRampToValueAtTime(0.0001, t + (ne - ns));
        src.connect(g); g.connect(a.destination); src.start(t, ns, ne - ns);
      } else { tone({ f0: 392, dur: 1.7, vol: 0.07 }); tone({ f0: 587, dur: 1.6, vol: 0.05, delay: 0.14 }); tone({ f0: 784, dur: 1.4, vol: 0.03, delay: 0.3 }); }
      rays0.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(34deg)' }], { duration: dN + 900, easing: 'linear', fill: 'forwards' });
      for (let i = 0; i < 14; i++) { const x = rnd(0, W); scrap(scr, x, H + 40, x + rnd(-130, 130), rnd(-60, H * 0.55), rnd(0, dN * 0.55), rnd(1800, 2800)); }
      await sleep(dN);
      tt.animate({ opacity: [1, 0], transform: ['scale(1)', 'scale(1.08)'] }, { duration: 350, fill: 'forwards' });
      vig.animate({ opacity: [1, 0] }, { duration: 400, fill: 'forwards' }); rays0.animate({ opacity: [1, 0] }, { duration: 400, fill: 'forwards' });
      // под книгу: плавно в сплошной тёмный фон — без размытия, лучей и свечения на заднем плане
      fx.style.background = '#0b0617'; fx.style.backdropFilter = fx.style.webkitBackdropFilter = 'blur(0px)';
      await sleep(480);
      [tt, vig, rays0].forEach((e) => e.remove());
      fx.style.transition = 'none'; fx.style.backdropFilter = fx.style.webkitBackdropFilter = 'none';
      dlg.classList.add('jg-hd-run'); // убирает размытие подложки диалога на время книги

      // ================= 2) книга =================
      const fs = Math.max(10, Math.min(14, W / 38)), lh = Math.round(fs * 1.4), rows = Math.max(18, Math.floor((H - 60) / lh)), cols = Math.max(20, Math.floor((W - 32) / (fs * 0.62)));
      const SLOW = [950, 780, 640, 520, 430], CURL = SLOW.length, N = 8, BEND = 5;
      const sched = []; let tt0 = 0;
      SLOW.forEach((d) => { sched.push({ t: tt0, d }); tt0 += d * 0.8; });
      let iv = 230;
      for (let j = 0; j < 30; j++) { sched.push({ t: tt0, d: Math.max(150, iv * 3) }); tt0 += iv; iv = Math.max(42, iv * 0.85); }
      const nFlip = sched.length, tF = sched[CURL].t, total = Math.max(...sched.map((s) => s.t + s.d));
      let lines = null, plain = false;
      if (useChat) { lines = hdChatLines(cols, (nFlip + 3) * rows); plain = !!lines; } // нет сообщений в чате — упадём на код
      if (!lines) lines = await Promise.race([codeP || hdLoadCode(), sleep(3500).then(() => [HD_FALLBACK.split('\n')])]);
      const pos = lines.map((l) => Math.floor(Math.random() * Math.max(1, l.length - rows)));
      const pageHtml = (i, mark) => {
        const k = i % lines.length, src = lines[k], hl = new Set();
        if (mark) for (let tries = 0; hl.size < 3 && tries < 80; tries++) { const r = Math.floor(rnd(2, rows - 2)); if ((src[(pos[k] + r) % src.length] || '').trim().length > 8) hl.add(r); }
        let out = '';
        for (let r = 0; r < rows; r++) {
          const raw = src[(pos[k] + r) % src.length] || '';
          const l = plain ? (raw.charCodeAt(0) === 1 ? `<i class="k">${esc(raw.slice(1))}</i>` : esc(raw)) : hdLine(raw);
          out += hl.has(r) ? `<span class="h">${l}</span>` : l + '\n';
        }
        pos[k] += rows;
        return `<div class="jg-hd-pg"><pre>${out}</pre><span class="jg-hd-no">${i}</span></div>`;
      };
      const mkFlat = (z, inner) => { const d = el('jg-hd-leaf', inner + '<div class="jg-hd-cast"></div><div class="jg-hd-shade"></div>'); d.style.zIndex = z; return d; };
      // лист из N полос: полосы вложены друг в друга, каждая чуть довёрнута — получается изгиб
      const sw = W / N;
      const mkCurl = (z, fill) => {
        const root = el('jg-hd-leaf jg-hd-curl'); root.style.zIndex = z;
        let parent = root; const strips = [];
        for (let k = 0; k < N; k++) {
          const s = el('jg-hd-st'), c = el('jg-hd-sc'), si = el('jg-hd-si'), sk = el('jg-hd-sk'), sg = el('jg-hd-sg');
          s.style.cssText = `left:${k ? sw : 0}px;width:${sw + 1}px`;
          si.style.cssText = `left:${-k * sw}px;width:${W}px`;
          sk.style.cssText = `background-size:${W}px 100%;background-position:${-k * sw}px 0`;
          fill(si, k);
          c.append(si, sk, sg); s.appendChild(c); parent.appendChild(s); parent = s; strips.push({ s, sk, sg });
        }
        return { root, strips };
      };
      const cl = modal.cloneNode(true);
      cl.removeAttribute('id'); cl.querySelectorAll('[id]').forEach((e) => e.removeAttribute('id'));
      cl.querySelectorAll('[data-act]').forEach((e) => e.removeAttribute('data-act'));
      cl.querySelectorAll('.jg-toast').forEach((e) => e.remove());
      cl.style.cssText = `position:absolute;margin:0;left:${rc.left}px;top:${rc.top}px;width:${rc.width}px;height:${rc.height}px;max-height:none;animation:none`;
      modal.style.visibility = 'hidden'; // настоящее окно всё равно закрыто книгой; вернём перед открытием врат

      const book = el('jg-hd-book');
      book.style.cssText = `perspective:${Math.round(Math.max(W, H) * 2.2)}px;--fs:${fs}px;--lh:${lh}px;z-index:2`;
      const leaves = [], curls = [], free = [];
      let poolN = CURL;
      const c0 = mkCurl(300, (si, k) => { si.innerHTML = '<div class="jg-hd-back"></div>'; si.appendChild(k ? cl.cloneNode(true) : cl); });
      leaves[0] = c0.root; curls[0] = c0.strips;
      for (let i = 1; i < CURL; i++) { const html = pageHtml(i, true), c = mkCurl(300 - i, (si) => { si.innerHTML = html; }); c.root.style.display = 'none'; leaves[i] = c.root; curls[i] = c.strips; }
      // обложка из двух створок (после хлопка распахнётся как врата)
      const cover = el('jg-hd-leaf jg-hd-cvr'); cover.style.zIndex = 500; cover.style.transform = 'rotateY(-180deg)';
      const dl = el('jg-hd-door l'), dr = el('jg-hd-door r');
      dl.innerHTML = `<div class="jg-hd-cvc" style="width:${W}px">${HD_COVER}</div>`;
      dr.innerHTML = `<div class="jg-hd-cvc" style="width:${W}px;left:${-W / 2}px">${HD_COVER}</div>`;
      cover.append(dl, dr);
      leaves.slice().reverse().forEach((l) => book.appendChild(l));
      book.appendChild(cover);
      const light = el('jg-hd-light', '<div class="jg-hd-rays gold"></div>'); light.style.zIndex = 1; light.style.opacity = 0;
      const cv = document.createElement('canvas'); cv.className = 'jg-hd-cvs'; cv.width = W; cv.height = H; cv.style.zIndex = 4;
      const fxl = el('jg-hd-layer'); fxl.style.zIndex = 5;
      const flash = el('jg-hd-flash'); flash.style.zIndex = 6;
      fx.append(light, book, cv, fxl, flash);

      // экран «темнеет до страницы»
      const backs = [...c0.root.querySelectorAll('.jg-hd-back')];
      await Promise.all(backs.map((b) => b.animate({ opacity: [0, 1] }, { duration: 380, fill: 'forwards' }).finished.catch(() => {})));
      leaves[1].style.display = '';
      await sleep(260);

      // летящие токены кода и полосы ветра (рисуются на canvas только в быстрой фазе)
      const g = cv.getContext('2d'), toks = [], streaks = [];
      const spr = document.createElement('canvas'); spr.width = 128; spr.height = 2; // один готовый спрайт полосы ветра вместо градиента на каждый кадр
      { const sg = spr.getContext('2d'), gr = sg.createLinearGradient(0, 0, 128, 0); gr.addColorStop(0, 'rgba(80,120,220,0)'); gr.addColorStop(1, 'rgba(80,120,220,1)'); sg.fillStyle = gr; sg.fillRect(0, 0, 128, 2); }
      const TSZ = [12, 16, 20], TCOL = ['rgb(37,99,235)', 'rgb(124,58,237)', 'rgb(180,83,9)'];
      let flyT0 = 0, flyOn = false, lastF = performance.now(), cvDirty = false;
      const loop = (now) => {
        if (dead) return;
        const dt = Math.min(0.05, (now - lastF) / 1000); lastF = now;
        if (flyOn || toks.length || streaks.length) {
          cvDirty = true; g.clearRect(0, 0, W, H);
          if (flyOn) {
            const k = Math.min(1, (now - flyT0) / (total - tF)), n = Math.round(rnd(0.4, 0.8 + 2.2 * k));
            for (let i = 0; i < n && toks.length < 55; i++) toks.push({ x: rnd(-30, W * 0.2), y: rnd(0, H), vx: rnd(500, 1500) * (0.6 + k), vy: rnd(-140, 140), s: TSZ[Math.floor(rnd(0, 3))], age: 0, max: rnd(0.5, 1.1), t: HD_TOK[Math.floor(rnd(0, HD_TOK.length))], c: TCOL[Math.floor(rnd(0, 3))] });
            for (let i = 0; i < Math.round(k * 2) && streaks.length < 18; i++) streaks.push({ x: rnd(-300, W), y: rnd(0, H), v: rnd(2200, 4200), l: rnd(120, 320), a: rnd(0.15, 0.4) });
          }
          let curS = 0;
          for (let i = toks.length - 1; i >= 0; i--) {
            const p = toks[i]; p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt;
            if (p.age > p.max || p.x > W + 60) { toks.splice(i, 1); continue; }
            if (p.s !== curS) { curS = p.s; g.font = `700 ${curS}px ui-monospace,Menlo,monospace`; }
            g.globalAlpha = Math.sin(Math.PI * p.age / p.max) * 0.85; g.fillStyle = p.c; g.fillText(p.t, p.x, p.y);
          }
          for (let i = streaks.length - 1; i >= 0; i--) {
            const st = streaks[i]; st.x += st.v * dt;
            if (st.x > W + 20 || !flyOn) { streaks.splice(i, 1); continue; }
            g.globalAlpha = st.a; g.drawImage(spr, st.x - st.l, st.y, st.l, 2);
          }
        } else if (cvDirty) { g.clearRect(0, 0, W, H); cvDirty = false; }
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);

      // ================= 3) перелистывание =================
      const t0 = a ? a.currentTime + 0.05 : 0, tStart = performance.now(), LEAD = 220;
      // Плоские листы быстрой фазы создаём по мере надобности и переиспользуем: текст растеризуется несколько раз, а не по разу на каждую страницу — вот что давало лаги к концу
      const flatLeaf = (i) => {
        let lf = free.pop();
        if (!lf) { lf = mkFlat(0, pageHtml(poolN++, false)); book.appendChild(lf); }
        lf.style.zIndex = 300 - i; lf.style.display = '';
        return lf;
      };
      const built = [];
      const ensure = (j) => {
        if (j > nFlip) return null;
        if (!built[j]) { built[j] = true; if (j >= CURL) leaves[j] = flatLeaf(j); }
        if (leaves[j]) leaves[j].style.display = '';
        return leaves[j] || null;
      };
      const finishLeaf = (i) => {
        const lf = leaves[i]; if (!lf) return;
        leaves[i] = null;
        if (i < CURL) { lf.remove(); return; }
        lf.getAnimations({ subtree: true }).forEach((an) => an.cancel());
        lf.style.display = 'none'; free.push(lf);
      };
      const setupFlip = (i) => {
        if (dead) return;
        const s = sched[i], lf = leaves[i], cu = curls[i], nxC = curls[i + 1], nx = ensure(i + 1);
        if (!lf) return;
        const o = { duration: s.d, delay: Math.max(0, s.t - (performance.now() - tStart)), fill: 'forwards', easing: 'cubic-bezier(.5,.05,.35,1)' };
        lf.animate([{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(-180deg)' }], o).finished.then(() => finishLeaf(i), () => {});
        if (cu) cu.forEach(({ s: st, sg }, k) => {
          if (k) st.animate([{ transform: 'rotateY(0deg)' }, { transform: `rotateY(${BEND}deg)`, offset: 0.3 }, { transform: `rotateY(${-BEND * 0.8}deg)`, offset: 0.7 }, { transform: 'rotateY(0deg)' }], o);
          sg.animate([{ opacity: 0 }, { opacity: 0.5, offset: 0.3 }, { opacity: 0.3, offset: 0.6 }, { opacity: 0.6 }], o);
        });
        else lf.querySelector('.jg-hd-shade').animate([{ opacity: 0 }, { opacity: 0.55, offset: 0.5 }, { opacity: 0.55 }], o);
        if (nxC) nxC.forEach(({ sk }) => sk.animate([{ opacity: 0.8 }, { opacity: 0 }], o));
        else if (nx) nx.querySelector('.jg-hd-cast').animate([{ opacity: 0.75 }, { opacity: 0 }], o);
      };
      sched.forEach((s, i) => {
        const at = s.t - LEAD;
        if (at <= 0) setupFlip(i); else timers.push(setTimeout(() => setupFlip(i), at));
        const fast = i >= CURL;
        flipSnd(t0 + (s.t + s.d * 0.3) / 1000, fast ? 0.1 : 0.4, fast ? 0.1 : 0.32, fast ? 2200 : 1100, fast ? 3600 : 3200);
      });
      for (let j = 2; j <= nFlip; j++) timers.push(setTimeout(() => ensure(j), Math.max(0, sched[j - 2].t - 150))); // лист j включаем заранее, чтобы кадр не подвисал
      // быстрая фаза: наезд камеры, токены кода, листы бумаги
      book.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.07)' }], { delay: tF, duration: total - tF, easing: 'ease-in', fill: 'forwards' });
      timers.push(setTimeout(() => { flyOn = true; flyT0 = performance.now(); }, tF));
      for (let i = 0; i < 10; i++) { const y0 = rnd(0, H); scrap(scr, -40, y0, rnd(W * 0.4, W + 120), y0 + rnd(-220, 220), tF + rnd(0, total - tF - 200), rnd(500, 900), 1.2); }
      const SW = 230; // замах обложки
      await sleep(total - 40);

      // ================= 4) хлопок =================
      const last = leaves[nFlip];
      last.querySelector('.jg-hd-cast').animate({ opacity: [0, 0.85] }, { duration: SW, easing: 'ease-in', fill: 'forwards' });
      slamSnd(a ? a.currentTime + SW / 1000 : 0);
      await cover.animate([{ transform: 'rotateY(-180deg)' }, { transform: 'rotateY(0deg)' }], { duration: SW, easing: 'cubic-bezier(.65,0,.9,.55)', fill: 'forwards' }).finished.catch(() => {});
      flyOn = false;
      flash.animate({ opacity: [0.75, 0] }, { duration: 340, easing: 'ease-out' });
      fx.animate([[0, 0], [-12, 7], [11, -8], [-8, 5], [5, -4], [-3, 2], [0, 0]].map(([x, y]) => ({ transform: `translate(${x}px,${y}px)` })), { duration: 420 });
      book.animate([{ transform: 'scale(1.07)' }, { transform: 'scale(.982)', offset: 0.25 }, { transform: 'scale(1)' }], { duration: 480, easing: 'ease-out', fill: 'forwards' });
      cover.animate([{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(-5deg)', offset: 0.45 }, { transform: 'rotateY(0deg)' }], { duration: 170, easing: 'ease-out', fill: 'forwards' });
      // ударная волна, пыль, разлетающиеся листы
      const ring = el('jg-hd-ring'); fxl.appendChild(ring);
      const rs = Math.max(W, H) / 110 * 1.4;
      ring.animate([{ transform: 'translate(-50%,-50%) scale(.15)', opacity: 0.95 }, { transform: `translate(-50%,-50%) scale(${rs})`, opacity: 0 }], { duration: 700, easing: 'cubic-bezier(.1,.7,.3,1)', fill: 'forwards' }).finished.then(() => ring.remove(), () => ring.remove());
      for (let i = 0; i < 26; i++) {
        const d = el('jg-hd-dust'), s = rnd(60, 150), side = Math.floor(rnd(0, 4)), px = side < 2 ? rnd(0, W) : side === 2 ? 0 : W, py = side < 2 ? (side ? H : 0) : rnd(0, H);
        d.style.cssText = `width:${s}px;height:${s}px;left:${px - s / 2}px;top:${py - s / 2}px`; fxl.appendChild(d);
        const dx = (px < W / 2 ? 1 : -1) * rnd(10, 90) * (side < 2 ? rnd(-1, 1) : -1), dy = (py < H / 2 ? 1 : -1) * rnd(10, 90) * (side < 2 ? -1 : rnd(-1, 1));
        d.animate([{ transform: 'translate(0,0) scale(.5)', opacity: 0.55 }, { transform: `translate(${dx}px,${dy}px) scale(1.9)`, opacity: 0 }], { duration: rnd(900, 1400), easing: 'ease-out', fill: 'forwards' }).finished.then(() => d.remove(), () => d.remove());
      }
      for (let i = 0; i < 12; i++) { const ang = rnd(0, 6.283), r = rnd(0.4, 1.1) * Math.max(W, H) * 0.7; scrap(scr, W / 2, H / 2, W / 2 + Math.cos(ang) * r, H / 2 + Math.sin(ang) * r, 0, rnd(650, 1100), 1.3); }
      await sleep(520);

      // ================= 5) врата =================
      const seams = [...cover.querySelectorAll('.jg-hd-seam')], glows = [...cover.querySelectorAll('.jg-hd-cvglow')];
      seams.forEach((s) => s.animate({ opacity: [0, 1] }, { duration: 450, easing: 'ease-in', fill: 'forwards' }));
      glows.forEach((s) => s.animate({ opacity: [0, 0.9] }, { duration: 450, fill: 'forwards' }));
      openSnd(a ? a.currentTime + 0.05 : 0);
      fx.animate([[0, 0], [2, 1], [-2, -1], [1, 2], [-1, 0], [0, 0]].map(([x, y]) => ({ transform: `translate(${x}px,${y}px)` })), { duration: 450, iterations: 2 }); // дрожь перед открытием
      await sleep(600);
      // под закрытой обложкой подставляем результат; весь остальной «книжный» слой убираем, за створками остаётся только свет
      modal.style.visibility = ''; dlg.classList.remove('jg-hd-run');
      doReveal(2.0);
      [...book.children].forEach((l) => { if (l !== cover) l.style.display = 'none'; });
      light.style.opacity = 1;
      const lr = light.querySelector('.jg-hd-rays');
      lr.animate([{ transform: 'rotate(0deg) scale(.8)' }, { transform: 'rotate(60deg) scale(1.5)' }], { duration: 3200, easing: 'linear', fill: 'forwards' });
      const oo = { duration: 1000, easing: 'cubic-bezier(.6,0,.2,1)', fill: 'forwards' };
      dl.animate([{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(112deg)' }], oo);
      dr.animate([{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(-112deg)' }], oo);
      flash.animate([{ opacity: 0 }, { opacity: 0.8, offset: 0.7 }, { opacity: 0 }], { duration: 1150 });
      await sleep(1150);
      await light.animate({ opacity: [1, 0] }, { duration: 850, easing: 'ease-in', fill: 'forwards' }).finished.catch(() => {});
    } finally {
      dead = true;
      timers.forEach(clearTimeout);
      modal.style.visibility = ''; dlg.classList.remove('jg-hd-run');
      fx.remove(); ui.fx = false;
      doReveal(0.2); // если что-то пошло не так — результат всё равно покажется
    }
  }
  // ---------- Killer Queen: глаз с картинкой → надпись + голос → щелчок → серия новых WebGL-взрывов → затемнение → возврат ----------
  // Все тайминги в мс — меняй здесь. Момент щелчка берётся из самого звука автоматически (последний резкий удар после паузы).
  const KQ_T = {
    eyeIn: 1100,     // глаз раскрывается
    eyeHold: 800,    // глаз смотрит (пульсирует)
    eyeOut: 450,     // глаз закрывается — до появления надписи
    gap: 250,        // пауза между закрытием глаза и надписью
    boom: 4200,      // серия взрывов (мс)
    reveal: 2500,    // на какой мс серии взрывов (в разгар большого взрыва) под огнём появляется результат
    snapFallback: 2200, // если звука нет — через столько после начала надписи будет взрыв
  };
  // Взрывы: t — когда стартует (мс от щелчка), x/y — позиция (доля экрана), s — размер (1 = ~треть экрана), v — громкость
  const KQ_BOOMS = [
    { t: 0,    x: 0.5,  y: 0.5,  s: 1.25, v: 1 },
    { t: 380,  x: 0.24, y: 0.36, s: 0.8,  v: 0.7 },
    { t: 640,  x: 0.78, y: 0.62, s: 0.85, v: 0.75 },
    { t: 1000, x: 0.62, y: 0.26, s: 0.7,  v: 0.6 },
    { t: 1300, x: 0.3,  y: 0.74, s: 0.9,  v: 0.8 },
    { t: 1750, x: 0.5,  y: 0.5,  s: 1.6,  v: 1 },
    { t: 2300, x: 0.5,  y: 0.55, s: 2.3,  v: 1 },
  ];
  // один готовый звук взрыва: шум-буфер создаётся один раз и переиспользуется
  let kqNoise = null;
  function sndKqBoom(vol = 1, size = 1) {
    const a = audio(); if (!a) return;
    const t = a.currentTime, len = 0.9 + 0.5 * Math.min(size, 2);
    if (!kqNoise) { kqNoise = a.createBuffer(1, Math.floor(a.sampleRate * 2), a.sampleRate); const d = kqNoise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const ns = a.createBufferSource(), lp = a.createBiquadFilter(), g = a.createGain();
    ns.buffer = kqNoise; lp.type = 'lowpass'; lp.frequency.setValueAtTime(5200, t); lp.frequency.exponentialRampToValueAtTime(180, t + len);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.85 * vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    ns.connect(lp); lp.connect(g); g.connect(a.destination); ns.start(t); ns.stop(t + len + 0.05);
    tone({ f0: 110, f1: 26, dur: len, vol: 0.55 * vol }); tone({ f0: 62, f1: 24, dur: len * 1.2, vol: 0.4 * vol });
  }
  // где в записи щелчок: последний резкий удар после паузы (сек от начала файла)
  function findSnap(buf) {
    const sr = buf.sampleRate, win = Math.max(1, Math.round(sr * 0.002)), n = buf.length, ch = [];
    for (let c = 0; c < buf.numberOfChannels; c++) ch.push(buf.getChannelData(c));
    let sil = 0, snap = -1;
    for (let i = 0; i + win <= n; i += win) {
      let pk = 0;
      for (const d of ch) for (let j = i; j < i + win; j++) { const x = Math.abs(d[j]); if (x > pk) pk = x; }
      if (pk < 0.004) sil++;
      else { if ((sil * win) / sr >= 0.12) snap = i / sr; sil = 0; }
    }
    return snap > 0 ? snap : -1;
  }
  // ---------- Новые взрывы (WebGL) — общий движок для Killer Queen и Soft & Wet ----------
  // Идея: все частицы создаются один раз, а их движение считает вершинный шейдер по uniform-времени — CPU за кадр только двигает часы и делает 4 вызова draw.
  // Огонь и дым берут форму из одной тайловой шум-текстуры (128×128, считается один раз): цвет определяется «температурой» (белое ядро → жёлтый → оранжевый → тёмно-красный),
  // края прогорают через эрозию по шуму. Плюс вспышка с подсветкой экрана, ударная волна, искры и тлеющие угольки с хвостами. Один canvas, прозрачный фон.
  const BOOM_VS = `attribute vec2 aC;attribute vec2 aO;attribute vec4 aT;attribute vec4 aM;attribute vec2 aX;
uniform vec2 uRes;uniform float uTime;uniform float uKind;
varying vec2 vUv;varying float vU;varying vec4 vP;
vec2 spk(float u){float kk=1.-(1.-u)*(1.-u);return aO+vec2(cos(aM.x),sin(aM.x))*aM.y*kk+vec2(0.,aX.x*u*u);}
void main(){
  float age=(uTime-aT.x)/1000.-aT.z;float u=age/aT.y;
  if(age<0.||u>=1.){gl_Position=vec4(2.,2.,2.,1.);vUv=vec2(0.);vU=1.;vP=vec4(0.);return;}
  vec2 p;
  if(uKind<1.5){
    float k;float sz;vec2 c;
    if(uKind<.5){k=1.-pow(1.-u,2.6);sz=aM.z*(.55+.75*k);c=aO+vec2(cos(aM.x),sin(aM.x))*aM.y*k-vec2(0.,aX.x*u);}
    else{k=1.-pow(1.-u,2.2);sz=aM.z*(.5+.95*k);c=aO+vec2(cos(aM.x),sin(aM.x))*aM.y*k*vec2(1.,.9)-vec2(0.,aX.x*u);}
    float r=aT.w*6.2831+aM.w*u;float cr=cos(r),sr=sin(r);
    p=c+vec2(aC.x*cr-aC.y*sr,aC.x*sr+aC.y*cr)*sz*.5;
  }else if(uKind<2.5){p=aO+aC*aM.z;}
  else{
    vec2 h=spk(u),t=spk(max(0.,u-.07)),d=h-t;float L=length(d);vec2 n=L>.001?d/L:vec2(1.,0.);
    vec2 tl=h-n*max(L,4.);float w=aM.z*.5*(1.-u*.6)+.6;
    p=mix(tl,h,aC.x*.5+.5)+vec2(-n.y,n.x)*aC.y*w*1.6;
  }
  gl_Position=vec4(p.x/uRes.x*2.-1.,1.-p.y/uRes.y*2.,0.,1.);
  vUv=aC;vU=u;vP=vec4(aT.w,aM.y,aX.y,age);
}`;
  const BOOM_FS = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D uN;uniform float uKF,uFade;
varying vec2 vUv;varying float vU;varying vec4 vP;
vec3 heat(float h){
  vec3 c=mix(vec3(0.),vec3(.42,.035,0.),smoothstep(0.,.25,h));
  c=mix(c,vec3(1.,.26,.02),smoothstep(.2,.5,h));
  c=mix(c,vec3(1.,.66,.17),smoothstep(.45,.8,h));
  return mix(c,vec3(1.,.95,.76),smoothstep(.75,1.15,h));
}
void main(){
  float u=vU,sd=vP.x;vec2 p=vUv;float r=length(p);vec4 o=vec4(0.);vec2 so=vec2(sd*7.3,sd*3.1);
  if(uKF<.5){
    float n1=texture2D(uN,p*.45+so+vec2(0.,-u*.5)).r,n2=texture2D(uN,p*.9+so.yx-vec2(u*.4,0.)).g;
    float dn=clamp(1.-r*(.9+(n1-.5)*.9),0.,1.);dn=dn*dn*(3.-2.*dn);
    float d=dn*(.55+.9*n2),th=u*.8;
    float a=smoothstep(th,th+.3,d)*smoothstep(0.,.07,u)*(1.-smoothstep(.8,1.,r));
    o=vec4(heat(d*(1.-u*.85)*1.35)*a,a*.85);
  }else if(uKF<1.5){
    float n1=texture2D(uN,p*.5+so+vec2(u*.15,-u*.2)).b,n2=texture2D(uN,p*1.1+so.yx).a;
    float dn=clamp(1.-r*(.8+(n1-.5)*.8),0.,1.);dn=dn*dn*(3.-2.*dn);
    float d=dn*(.5+.9*n2);
    float a=smoothstep(u*.55,u*.55+.35,d)*smoothstep(0.,.15,u)*(1.-smoothstep(.55,1.,u))*(1.-smoothstep(.8,1.,r))*.62;
    float g=mix(.05,.27,d),lit=pow(1.-u,3.)*(.4+.6*sd);
    vec3 c=vec3(g*1.08,g,g*.94)+vec3(1.,.4,.08)*lit*.55*d;
    o=vec4(c*a,a);
  }else if(uKF<2.5){
    float rpx=r*vP.y*3.4,age=vP.w;
    float lt=1.-min(1.,age/.9),gw=(1.-r)*(1.-r)*.36*lt;
    float fe=age/.28,rr=vP.y*(.55+.9*fe);
    float nz=texture2D(uN,p*.7+so).r;
    float fl=fe<1.?(1.-fe)*exp(-pow(rpx/rr,2.)*2.2)*(.75+.5*nz):0.;
    vec3 t=vec3(1.,.5,.15)*gw+mix(vec3(1.,.78,.45),vec3(1.,1.,.94),exp(-pow(rpx/(rr*.5),2.)))*fl*1.4;
    float we=age/.55;
    if(vP.z>.5&&we<1.){float rg=vP.y*2.6*(1.-pow(1.-we,3.))+6.,w=(2.+10.*(1.-we))*.6;t+=vec3(1.,.92,.78)*(1.-smoothstep(0.,w,abs(rpx-rg)))*.5*(1.-we);}
    t*=1.-smoothstep(.9,1.,r);
    o=vec4(t,min(1.,max(t.r,max(t.g,t.b))));
  }else{
    float ac=abs(p.y),al=p.x*.5+.5;
    float a=(1.-smoothstep(.15,1.,ac))*smoothstep(0.,1.,al)*(1.-u);
    vec3 c=mix(vec3(1.,.5,.12),vec3(1.,.95,.75),(1.-smoothstep(0.,.45,u)));
    o=vec4(c*a*1.6,a);
  }
  gl_FragColor=o*uFade;
}`;
  let boomNoise = null, boomOK = null;
  // тайловая шум-текстура: 4 канала fbm (периодический value-noise), считается один раз за сессию
  function boomPrep() {
    if (boomNoise) return boomNoise;
    const N = 128, d = new Uint8Array(N * N * 4);
    const ih = (x, y, s) => { let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(s + 1, 1274126177); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
    const vn = (x, y, per, s) => {
      const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, u = fx * fx * (3 - 2 * fx), w = fy * fy * (3 - 2 * fy);
      const x0 = ((xi % per) + per) % per, y0 = ((yi % per) + per) % per, x1 = (x0 + 1) % per, y1 = (y0 + 1) % per;
      const a = ih(x0, y0, s), b = ih(x1, y0, s), c = ih(x0, y1, s), e = ih(x1, y1, s);
      return a + (b - a) * u + (c - a) * w + (a - b - c + e) * u * w;
    };
    for (let ch = 0; ch < 4; ch++) for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      let v = 0, am = 0.5, tot = 0;
      for (let o = 0; o < 4; o++) { const per = 4 << o; v += am * vn(x / N * per, y / N * per, per, ch * 17 + o); tot += am; am *= 0.5; }
      d[(y * N + x) * 4 + ch] = Math.max(0, Math.min(255, ((v / tot - 0.5) * 1.7 + 0.5) * 255));
    }
    boomNoise = d; return d;
  }
  function boomProgram(gl) {
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null; };
    const v = sh(gl.VERTEX_SHADER, BOOM_VS), f = sh(gl.FRAGMENT_SHADER, BOOM_FS); if (!v || !f) return null;
    const p = gl.createProgram(); gl.attachShader(p, v); gl.attachShader(p, f);
    ['aC', 'aO', 'aT', 'aM', 'aX'].forEach((n, i) => gl.bindAttribLocation(p, i, n)); // фиксированные номера атрибутов
    gl.linkProgram(p); return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
  }
  const BOOM_GL = { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false, powerPreference: 'high-performance' };
  // один раз проверяем на пустом холсте, что шейдеры собираются (если нет — будет простой 2D-вариант)
  function boomSupported() {
    if (boomOK !== null) return boomOK;
    try {
      const t = document.createElement('canvas'), gl = t.getContext('webgl', BOOM_GL);
      boomOK = !!gl && !!boomProgram(gl);
      if (gl) { const x = gl.getExtension('WEBGL_lose_context'); if (x) x.loseContext(); }
    } catch (e) { boomOK = false; }
    return boomOK;
  }
  // запасной вариант без WebGL: вспышка, огненный шар, дым, кольцо и искры градиентами
  function boomFx2D(cv, W, H, ms, onBlast, booms, noWave) {
    const q = Math.min(window.devicePixelRatio || 1, 1.25) * 0.75; cv.width = Math.round(W * q); cv.height = Math.round(H * q);
    const c = cv.getContext('2d'), U = Math.min(W, H), TAU = Math.PI * 2, rnd = (a, b) => a + Math.random() * (b - a);
    const bl = booms.map((b) => ({ ...b, R: U * 0.33 * b.s, cx: b.x * W, cy: b.y * H, done: false, sp: Array.from({ length: Math.round(24 * Math.min(b.s, 1.5)) }, () => ({ a: rnd(0, TAU), v: rnd(0.8, 2.6), l: rnd(0.45, 1.1) })) }));
    const orb = (x, y, r, rgb, al) => { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${rgb},${al})`); g.addColorStop(1, `rgba(${rgb},0)`); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); };
    const t0 = performance.now(); let shake = 0;
    return new Promise((res) => {
      const f = (now) => {
        const el = now - t0; c.setTransform(q, 0, 0, q, 0, 0); c.clearRect(0, 0, W, H); shake = 0;
        for (const b of bl) {
          const e0 = (el - b.t) / 1000; if (e0 < 0) continue;
          if (!b.done) { b.done = true; onBlast(b); }
          shake = Math.max(shake, b.s * 14 * Math.pow(Math.max(0, 1 - e0 / 0.6), 2));
          c.globalCompositeOperation = 'source-over'; if (e0 < 1.5) orb(b.cx, b.cy - b.R * 0.2 * e0, b.R * (0.9 + 0.8 * e0), '40,34,32', 0.5 * (1 - e0 / 1.5));
          c.globalCompositeOperation = 'lighter';
          if (e0 < 1) orb(b.cx, b.cy, b.R * (0.7 + 0.8 * e0), '255,150,40', 0.9 * (1 - e0));
          if (e0 < 0.3) orb(b.cx, b.cy, b.R * (0.5 + e0 * 2), '255,250,220', 1 - e0 / 0.3);
          if (!noWave && e0 < 0.55) { const we = e0 / 0.55; c.strokeStyle = `rgba(255,235,200,${0.5 * (1 - we)})`; c.lineWidth = 2 + 8 * (1 - we); c.beginPath(); c.arc(b.cx, b.cy, b.R * 2.6 * (1 - Math.pow(1 - we, 3)) + 6, 0, TAU); c.stroke(); }
          for (const p of b.sp) { const e = e0 / p.l; if (e <= 0 || e >= 1) continue; const d = b.R * 1.5 * p.v * (1 - Math.pow(1 - e, 2)); c.fillStyle = `rgba(255,190,90,${1 - e})`; c.fillRect(b.cx + Math.cos(p.a) * d - 1.5, b.cy + Math.sin(p.a) * d + b.R * e * e - 1.5, 3, 3); }
        }
        c.globalCompositeOperation = 'source-over'; cv._shake = shake;
        if (el < ms && cv.isConnected) requestAnimationFrame(f); else { c.clearRect(0, 0, W, H); res(); }
      };
      requestAnimationFrame(f);
    });
  }
  // серия взрывов на одном canvas. booms: [{t мс от старта, x/y доли экрана, s размер, v громкость}], onBlast(b) — в момент начала каждого взрыва; noWave — без ударной волны
  function boomFx(cv, W, H, ms, onBlast, booms = KQ_BOOMS, noWave = false) {
    if (!boomSupported()) return boomFx2D(cv, W, H, ms, onBlast, booms, noWave);
    const q = Math.min(window.devicePixelRatio || 1, 1.5) * 0.8; // частицы мягкие — умеренное разрешение почти не видно, зато плавно на телефоне
    cv.width = Math.round(W * q); cv.height = Math.round(H * q);
    const U = Math.min(W, H), TAU = Math.PI * 2, rnd = (a, b) => a + Math.random() * (b - a);
    // ---- частицы по слоям: 0 огонь, 1 дым, 2 вспышка/волна, 3 искры; поля: [t0 мс, жизнь с, задержка с, seed | угол, дальность, размер, вращение | подъём/гравитация, доп.] + центр
    const L = [[], [], [], []];
    for (const b of booms) {
      const R = U * 0.33 * b.s, cx = b.x * W, cy = b.y * H, s1 = Math.min(b.s, 1.6), P = (k, o) => L[k].push({ cx, cy, t: b.t, seed: Math.random(), ...o });
      for (let i = 0, n = Math.round(18 + 14 * s1); i < n; i++) P(0, { life: rnd(0.55, 1) * 0.95, dl: rnd(0, 0.06), a: rnd(0, TAU), sp: rnd(0.35, 1) * Math.sqrt(Math.random()) * R * 1.5, sz: rnd(0.5, 1) * R * 0.95, rs: rnd(-1.2, 1.2), x1: rnd(0, 0.35) * R, x2: 0 });
      for (let i = 0; i < 6; i++) P(0, { life: rnd(0.5, 0.75), dl: 0, a: rnd(0, TAU), sp: rnd(0, 0.18) * R, sz: R * rnd(1.05, 1.35), rs: rnd(-0.6, 0.6), x1: 0, x2: 0 }); // ядро огненного шара
      for (let i = 0, n = Math.round(10 + 8 * s1); i < n; i++) P(1, { life: rnd(1.1, 1.7), dl: rnd(0, 0.12), a: rnd(0, TAU), sp: rnd(0.25, 0.8) * R * 1.2, sz: rnd(0.7, 1.2) * R * 1.05, rs: rnd(-0.6, 0.6), x1: rnd(0.1, 0.5) * R, x2: 0 });
      P(2, { life: 1, dl: 0, a: 0, sp: R, sz: R * 3.4, rs: 0, x1: 0, x2: noWave ? 0 : 1 });
      for (let i = 0, n = Math.round(34 * Math.min(b.s, 1.5)); i < n; i++) P(3, { life: rnd(0.45, 1.1), dl: 0, a: rnd(0, TAU), sp: rnd(0.8, 2.6) * R * 1.5, sz: rnd(1.5, 3.8), rs: 0, x1: rnd(0.5, 1.4) * R, x2: 0 });
      for (let i = 0, n = Math.round(10 * s1); i < n; i++) P(3, { life: rnd(1.2, 2), dl: rnd(0, 0.1), a: rnd(0, TAU), sp: rnd(0.3, 0.9) * R * 1.2, sz: rnd(1.6, 2.6), rs: 0, x1: rnd(0.6, 1.2) * R, x2: 0 }); // тлеющие угольки
    }
    const total = L.reduce((n, a) => n + a.length, 0), ranges = [];
    const data = new Float32Array(total * 4 * 14), idx = new Uint16Array(total * 6);
    const CORN = [-1, -1, 1, -1, 1, 1, -1, 1];
    let pi = 0;
    for (const arr of L) {
      ranges.push([pi, arr.length]);
      for (const p of arr) {
        for (let v = 0; v < 4; v++) data.set([CORN[v * 2], CORN[v * 2 + 1], p.cx, p.cy, p.t, p.life, p.dl, p.seed, p.a, p.sp, p.sz, p.rs, p.x1, p.x2], (pi * 4 + v) * 14);
        idx.set([pi * 4, pi * 4 + 1, pi * 4 + 2, pi * 4, pi * 4 + 2, pi * 4 + 3], pi * 6); pi++;
      }
    }
    if (total * 4 > 65535) return boomFx2D(cv, W, H, ms, onBlast, booms, noWave); // слишком много частиц для 16-битных индексов
    const gl = cv.getContext('webgl', BOOM_GL), prog = gl && boomProgram(gl);
    if (!prog) { // контекст не создался: рисуем 2D-вариантом (если холст уже занят WebGL — на новом холсте рядом)
      let t = cv; if (gl) { t = document.createElement('canvas'); t.className = cv.className; cv.parentNode && cv.parentNode.insertBefore(t, cv); }
      return boomFx2D(t, W, H, ms, onBlast, booms, noWave);
    }
    gl.useProgram(prog); gl.viewport(0, 0, cv.width, cv.height);
    const vb = gl.createBuffer(), ib = gl.createBuffer(), tex = gl.createTexture();
    gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
    [[0, 2, 0], [1, 2, 8], [2, 4, 16], [3, 4, 32], [4, 2, 48]].forEach(([i, n, o]) => { gl.enableVertexAttribArray(i); gl.vertexAttribPointer(i, n, gl.FLOAT, false, 56, o); });
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 128, 128, 0, gl.RGBA, gl.UNSIGNED_BYTE, boomPrep());
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    const uRes = gl.getUniformLocation(prog, 'uRes'), uTime = gl.getUniformLocation(prog, 'uTime'), uKind = gl.getUniformLocation(prog, 'uKind'), uKF = gl.getUniformLocation(prog, 'uKF'), uFade = gl.getUniformLocation(prog, 'uFade');
    gl.uniform2f(uRes, W, H); gl.uniform1i(gl.getUniformLocation(prog, 'uN'), 0); gl.enable(gl.BLEND); gl.clearColor(0, 0, 0, 0);
    const order = booms.slice().sort((p, o) => p.t - o.t), t0 = performance.now();
    let shake = 0;
    return new Promise((res) => {
      let next = 0, over = false;
      const end = (flush) => {
        if (over) return; over = true; cv.removeEventListener('webglcontextlost', lost);
        if (flush) while (next < order.length) onBlast(order[next++]); // контекст потерян: остальные взрывы всё равно «происходят» (звук, лопание пузырей)
        const x = gl.getExtension('WEBGL_lose_context'); if (x) x.loseContext(); // освобождаем контекст — на телефоне их число ограничено
        cv._shake = 0; res();
      };
      const lost = (e) => { e.preventDefault(); end(true); };
      cv.addEventListener('webglcontextlost', lost);
      const f = (now) => {
        if (over) return;
        if (!cv.isConnected) return end(false); // анимацию закрыли раньше времени
        const el = Math.max(0, now - t0);
        while (next < order.length && el >= order[next].t) onBlast(order[next++]);
        shake = 0; for (const b of order) { const e0 = (el - b.t) / 1000; if (e0 >= 0 && e0 < 0.6) shake = Math.max(shake, b.s * 14 * Math.pow(1 - e0 / 0.6, 2)); }
        cv._shake = shake;
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(uTime, el); gl.uniform1f(uFade, el > ms - 300 ? Math.max(0, (ms - el) / 300) : 1);
        // дым — обычное смешивание; огонь, вспышка и искры — аддитивно
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.uniform1f(uKind, 1); gl.uniform1f(uKF, 1); gl.drawElements(gl.TRIANGLES, ranges[1][1] * 6, gl.UNSIGNED_SHORT, ranges[1][0] * 12);
        gl.blendFunc(gl.ONE, gl.ONE);
        gl.uniform1f(uKind, 0); gl.uniform1f(uKF, 0); gl.drawElements(gl.TRIANGLES, ranges[0][1] * 6, gl.UNSIGNED_SHORT, ranges[0][0] * 12);
        gl.uniform1f(uKind, 2); gl.uniform1f(uKF, 2); gl.drawElements(gl.TRIANGLES, ranges[2][1] * 6, gl.UNSIGNED_SHORT, ranges[2][0] * 12);
        gl.uniform1f(uKind, 3); gl.uniform1f(uKF, 3); gl.drawElements(gl.TRIANGLES, ranges[3][1] * 6, gl.UNSIGNED_SHORT, ranges[3][0] * 12);
        if (el < ms) requestAnimationFrame(f); else end(false);
      };
      requestAnimationFrame(f);
    });
  }
  async function killerQueenReveal(dlg, reveal, snd) {
    const W = window.innerWidth, H = window.innerHeight, T = KQ_T, EW = Math.min(W * 0.74, 400), EH = EW * 0.6;
    const imgUrl = new URL(SND.kqImg, BASE).href;
    const modal = dlg.querySelector('.jg-modal');
    if (modal) { const rc = modal.getBoundingClientRect(); modal.style.transformOrigin = `${W / 2 - rc.left}px ${H / 2 - rc.top}px`; }
    const fx = document.createElement('div');
    fx.className = 'jg-fx jg-kq'; // jg-fx перехватывает касания — с этого момента экран не нажимается
    const EYE = 'M3,60 Q100,-26 197,60 Q100,146 3,60Z';
    fx.innerHTML = `<div class="jg-kq-hot"></div>
            <svg class="jg-kq-eye" viewBox="0 0 200 120" width="${EW}" height="${EH}">
        <defs>
          <clipPath id="kqEyeClip"><path d="${EYE}"/></clipPath>
          <radialGradient id="kqVoid" cx=".5" cy=".5" r=".62"><stop offset="0" stop-color="#1c0638"/><stop offset=".65" stop-color="#06010f"/><stop offset="1" stop-color="#000"/></radialGradient>
          <radialGradient id="kqShade" cx=".5" cy=".5" r=".6"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".85"/></radialGradient>
          <linearGradient id="kqRim" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff7ad1"/><stop offset=".5" stop-color="#ffe08a"/><stop offset="1" stop-color="#9d7bff"/></linearGradient>
        </defs>
        <g clip-path="url(#kqEyeClip)">
          <rect width="200" height="120" fill="url(#kqVoid)"/>
          <image href="${imgUrl}" x="57" y="15" width="86" height="90" preserveAspectRatio="xMidYMid meet"/>
          <rect width="200" height="120" fill="url(#kqShade)"/>
        </g>
        <path d="${EYE}" fill="none" stroke="url(#kqRim)" stroke-width="3.4"/>
        <path d="M9,60 Q100,-17 191,60 Q100,137 9,60Z" fill="none" stroke="#ffffff" stroke-width=".9" opacity=".55"/>
      </svg>
      <canvas class="jg-kq-boom"></canvas><div class="jg-kq-flash"></div>`;
    const $q = (s) => fx.querySelector(s);
    const hot = $q('.jg-kq-hot'), eye = $q('.jg-kq-eye'), bc = $q('.jg-kq-boom'), flash = $q('.jg-kq-flash');
    dlg.appendChild(fx);
    ui.fx = true;
    let dead = false, revealed = false;
    const doReveal = (d) => { if (revealed) return; revealed = true; reveal(d); };
    const ease = { out: (u) => 1 - Math.pow(1 - u, 3), in: (u) => Math.pow(u, 2.2), io: (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2), smooth: (a, b, u) => { const x = Math.min(1, Math.max(0, (u - a) / (b - a))); return x * x * (3 - 2 * x); } };
    const run = (ms, fn) => new Promise((res) => {
      const t0 = performance.now();
      const f = (now) => { const u = Math.min(1, Math.max(0, (now - t0) / ms)); fn(u); if (u < 1 && !dead) requestAnimationFrame(f); else res(); };
      requestAnimationFrame(f);
    });
    const setEye = (open, sc) => { eye.style.transform = `translate(-50%,-50%) scale(${sc},${Math.max(0.001, sc * open)})`; };
    try {
      const bufName = await snd.kq, bufBomb = await snd.swPop;
      const pre = new Image(); pre.src = imgUrl;
      await Promise.race([pre.decode().catch(() => {}), sleep(2500)]);
      boomPrep(); boomSupported(); // заранее считаем шум и проверяем шейдеры, чтобы не было подвисания на взрыве
      // 0) глаз раскрывается (без эффектов на экране) — со звуком
      const ea = audio(), eb = await snd.kqEye;
      if (ea && eb) { const es = ea.createBufferSource(), eg = ea.createGain(); es.buffer = eb; eg.gain.value = 1.4; es.connect(eg); eg.connect(ea.destination); es.start(); }
      await run(T.eyeIn, (u) => { const e = ease.out(u); setEye(e, 0.8 + 0.2 * e); eye.style.opacity = Math.min(1, u * 4); });
      await run(T.eyeHold, (u) => { const b = Math.pow(Math.max(0, Math.sin(u * Math.PI * 4)), 4); setEye(1, 1 + 0.04 * b); });
      // 1) глаз закрывается
      await run(T.eyeOut, (u) => { const e = ease.io(u); setEye(1 - e, 1 - 0.1 * e); });
      eye.style.display = 'none';
      await sleep(T.gap);
      // 2) надпись на мутно-розовом фоне (как у D4C) + голос; по щелчку — взрыв
      fx.style.transition = 'background-color .4s';
      void fx.offsetWidth;
      fx.style.background = 'rgba(70,20,70,.55)'; // без backdrop-filter: полноэкранное размытие сильно тормозит
      const a = audio();
      const [ns, ne] = bufName ? audibleSpan(bufName) : [0, 0];
      const sn = bufName ? findSnap(bufName) : -1;
      const snapMs = sn > 0 ? Math.max(300, (sn - ns) * 1000) : T.snapFallback;
      const ttl = titleCard(fx, 'キラークイーン<br>バイツァ・ダスト', 'KILLER QUEEN · BITES THE DUST', 'kq');
      [-1, 1].forEach((s) => { // две светящиеся линии раскрываются от центра над и под надписью
        const ln = document.createElement('div'); ln.className = 'jg-kq-line'; ln.style.top = `calc(50% + ${s} * min(17vw,104px))`; fx.appendChild(ln);
        ln.animate([{ transform: 'scaleX(0)', opacity: 0 }, { transform: 'scaleX(1)', opacity: 1 }], { duration: 600, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'forwards' });
        ln._kill = () => ln.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250, fill: 'forwards' }).finished.then(() => ln.remove(), () => ln.remove());
      });
      if (a && bufName) {
        const src = a.createBufferSource(), g = a.createGain(), t = a.currentTime;
        src.buffer = bufName; g.gain.value = 3; // запись тихая — подтягиваем громкость
        src.connect(g); g.connect(a.destination); src.start(t, ns, ne - ns);
      }
      await sleep(snapMs);
      // 3) щелчок → серия реалистичных взрывов; надпись сметает
      ttl.hide(0); fx.querySelectorAll('.jg-kq-line').forEach((l) => l._kill && l._kill());
      fx.style.background = '';
      flash.animate([{ opacity: 0 }, { opacity: 0.9, offset: 0.08 }, { opacity: 0 }], { duration: 420, easing: 'ease-out' });
      hot.animate([{ opacity: 0 }, { opacity: 1, offset: 0.25 }, { opacity: 0.85, offset: 0.7 }, { opacity: 0 }], { duration: T.boom, fill: 'forwards' });
      let bmaster = null; // общий компрессор: наложение взрывов не клиппирует (как у Soft & Wet)
      if (a && bufBomb) { bmaster = a.createDynamicsCompressor(); bmaster.threshold.value = -14; bmaster.ratio.value = 6; bmaster.connect(a.destination); }
      const boom = boomFx(bc, W, H, T.boom, (b) => {
        if (a && bufBomb) { // тот же звук bomb.mp3, что у взрывов пузырей Soft & Wet: крупный взрыв ниже, громкость по размеру
          const src = a.createBufferSource(), g = a.createGain();
          src.buffer = bufBomb; src.playbackRate.value = Math.min(1.2, Math.max(0.8, 1.12 - 0.25 * b.s + (Math.random() * 0.12 - 0.06))); g.gain.value = 0.55 + 0.45 * b.v;
          src.connect(g); g.connect(bmaster); src.start();
        } else sndKqBoom(b.v, b.s); // запасной вариант, если файла нет
      });
      // дрожь — только у canvas; под большим взрывом (без затемнения) появляется результат
      await run(T.boom, (u) => {
        const sh = (bc._shake || 0) * (1 - 0.4 * u);
        bc.style.transform = sh > 0.3 ? `translate(${(Math.random() * 2 - 1) * sh}px,${(Math.random() * 2 - 1) * sh}px)` : '';
        if (!revealed && u * T.boom >= T.reveal) doReveal(0.35);
      });
      bc.style.transform = ''; await boom;
    } finally {
      dead = true;
      fx.remove(); ui.fx = false;
      if (modal) { modal.style.transform = ''; modal.style.filter = ''; modal.style.transformOrigin = ''; }
      doReveal(0.2); // если что-то пошло не так — результат всё равно покажется
    }
  }
  // ---------- Soft & Wet: надпись → рой мыльных пузырей влетает на экран → заминка → пузыри лопаются взрывами один за другим ----------
  // Все тайминги в мс — меняй здесь. Взрывы — общий WebGL-движок boomFx (огонь, дым, искры, вспышка, дрожь), но без ударной волны и мельче.
  const SW_T = {
    title: 2300,    // надпись; если положить голос в sounds/soft-and-wet.mp3, надпись будет держаться столько же, сколько звучит запись
    gap: 250,       // пауза после надписи
    fly: 2400,      // за это время все пузыри влетают на экран и успокаиваются (старты растянуты по времени)
    hold: 800,      // «заминка»: пузыри висят на месте, в последние 450 мс дрожат
    popMin: 50,     // интервал между соседними взрывами — случайный, от popMin до popMax
    popMax: 300,
    count: 30,      // сколько пузырей (= взрывов); серия длится примерно count × (popMin + popMax) / 2
    boomK: 1.5,     // размер взрыва относительно радиуса пузыря (больше — крупнее взрывы)
    revealAt: 0.6,  // после какой доли взрывов под ними появляется результат
    tail: 1400,     // сколько ещё доигрывают дым и искры после последнего взрыва
  };
  const SW_COLORS = [[0.72, 0.91, 1], [1, 0.82, 0.93], [0.79, 1, 0.91], [0.85, 0.8, 1], [1, 0.95, 0.8]]; // лёгкие оттенки плёнки
  // Пузырь рисуется как квадрат, в шейдере из него вырезается шар: нормаль, Френель, тонкоплёночная интерференция (радужные разводы),
  // отражения «софтбоксов» и оконной рамы, перевёрнутый блик на задней стенке, дрейф толщины плёнки. Всё считается на GPU.
  const SW_VS = `attribute vec2 aP;uniform vec2 uC,uS,uRes;varying vec2 vUv;
void main(){vUv=vec2(aP.x,-aP.y);vec2 px=uC+aP*uS;gl_Position=vec4(px.x/uRes.x*2.0-1.0,1.0-px.y/uRes.y*2.0,0.0,1.0);}`;
  const SW_FS = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform float uTime,uSeed,uRot,uFade,uAA;uniform vec3 uTint;varying vec2 vUv;
float hash(vec3 p){p=fract(p*0.3183099+vec3(.1,.2,.3));p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.0-2.0*f);
return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float sq(float x){return x*x;}
vec3 film(float th,float ct){vec3 wl=vec3(650.0,510.0,475.0);vec3 ph=4.0*3.14159265*1.38*th*ct/wl;
vec3 c=0.5+0.5*cos(ph+vec3(0.0,2.1,4.2));return pow(max(c,vec3(0.0)),vec3(1.45));}
void main(){
  float r2=dot(vUv,vUv);if(r2>=1.0)discard;
  float rr=sqrt(r2),z=sqrt(1.0-r2);
  vec3 N=vec3(vUv,z);
  float fres=0.025+0.975*pow(1.0-z,5.0);
  float cs=cos(uRot),sn=sin(uRot);
  vec3 p=vec3(cs*N.x+sn*N.z,N.y,-sn*N.x+cs*N.z);
  float broad=noise(p*4.0+vec3(uSeed,uTime*.035,0.0));
  float fine=noise(p*13.0+vec3(0.0,uSeed,uTime*.06));
  float th=260.0+190.0*p.y+105.0*p.x+80.0*(broad-.5)+25.0*(fine-.5);
  th+=22.0*sin(p.x*5.0+p.y*4.0+uTime*.16);
  vec3 irid=mix(film(th,mix(.55,1.0,z)),uTint,.12);
  vec3 R=vec3(2.0*z*N.x,2.0*z*N.y,2.0*z*z-1.0);
  float topBox=exp(-sq((R.x-.32)*5.0)-sq((R.y-.58)*8.0));
  float sideBox=exp(-sq((R.x+.72)*12.0)-sq((R.y-.05)*2.2));
  float lowBox=exp(-sq((R.x-.05)*7.0)-sq((R.y+.78)*13.0));
  float pin=pow(max(dot(R,normalize(vec3(-.45,.7,1.0))),0.0),100.0);
  float pin2=pow(max(dot(R,normalize(vec3(.5,-.6,1.0))),0.0),70.0);
  vec2 wq=abs(R.xy-vec2(-.38,.42))-vec2(.2,.16);
  float wbox=1.0-smoothstep(0.0,.035,max(wq.x,wq.y));
  float bars=1.0-.6*((1.0-smoothstep(0.0,.025,abs(R.x+.38)))+(1.0-smoothstep(0.0,.025,abs(R.y-.42))));
  float win=wbox*bars*step(0.0,R.z);
  float rim=pow(1.0-z,2.4),shade=smoothstep(-.95,.25,p.y);
  vec3 base=irid*(.30+.52*shade);
  base+=vec3(.62,.82,1.0)*(topBox*.92+sideBox*.40+lowBox*.24);
  base+=vec3(1.0,.98,.92)*pin*1.6+vec3(.7,.85,1.0)*pin2*.45+vec3(.92,.97,1.0)*win*.6;
  base+=vec3(.22,.60,.92)*rim*.25;
  float al=clamp(.16+fres*.78+topBox*.28+sideBox*.10+win*.3,.12,.96)*(.86+.14*shade);
  al*=clamp((1.0-rr)/uAA,0.0,1.0)*uFade;
  gl_FragColor=vec4(base,al);
}`;
  function swGL(cv, W, H, q) {
    cv.width = Math.round(W * q); cv.height = Math.round(H * q);
    try {
      const gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false }) || cv.getContext('experimental-webgl');
      if (!gl) return null;
      const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
      const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, SW_VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, SW_FS)); gl.linkProgram(pr);
      if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
      gl.useProgram(pr);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(pr, 'aP'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const U = {}; ['uC', 'uS', 'uRes', 'uTime', 'uSeed', 'uRot', 'uFade', 'uAA', 'uTint'].forEach((n) => { U[n] = gl.getUniformLocation(pr, n); });
      gl.enable(gl.BLEND); gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA); // выход — «непремноженный», холст — премноженный
      gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(U.uRes, W, H); gl.clearColor(0, 0, 0, 0);
      return {
        draw(list, tSec) {
          gl.clear(gl.COLOR_BUFFER_BIT); gl.uniform1f(U.uTime, tSec);
          for (const b of list) {
            gl.uniform2f(U.uC, b.x, b.y); gl.uniform2f(U.uS, b.sx, b.sy); gl.uniform1f(U.uSeed, b.seed); gl.uniform1f(U.uRot, b.rot); gl.uniform1f(U.uFade, b.fade);
            gl.uniform1f(U.uAA, 1.6 / Math.min(b.sx, b.sy)); gl.uniform3f(U.uTint, b.tint[0], b.tint[1], b.tint[2]);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
          }
        },
        lose() { try { const e = gl.getExtension('WEBGL_lose_context'); if (e) e.loseContext(); } catch (e) { /* ничего */ } },
      };
    } catch (e) { console.warn('[JoJo Stands] Soft & Wet: WebGL недоступен, пузыри рисуются в 2D', e); return null; }
  }
  // запасной вариант без WebGL: градиентный шар с бликами
  function swDraw2D(c, q, W, H, list) {
    c.setTransform(q, 0, 0, q, 0, 0); c.clearRect(0, 0, W, H);
    for (const b of list) {
      const R = (b.sx + b.sy) / 2, [r, g, bl] = b.tint.map((v) => Math.round(v * 255));
      c.save(); c.globalAlpha = b.fade; c.translate(b.x, b.y); c.scale(b.sx / R, b.sy / R);
      const gr = c.createRadialGradient(0, 0, R * 0.5, 0, 0, R);
      gr.addColorStop(0, 'rgba(180,225,255,.04)'); gr.addColorStop(0.82, `rgba(${r},${g},${bl},.3)`); gr.addColorStop(1, 'rgba(255,255,255,.75)');
      c.fillStyle = gr; c.beginPath(); c.arc(0, 0, R, 0, Math.PI * 2); c.fill();
      c.fillStyle = 'rgba(255,255,255,.85)'; c.beginPath(); c.ellipse(-R * 0.38, -R * 0.4, R * 0.2, R * 0.1, -0.6, 0, Math.PI * 2); c.fill();
      c.restore();
    }
  }
  // звук лопнувшего пузыря: «пшик» + короткий шумовой хлопок + глухой удар; шум идёт через общий компрессор, чтобы наложения не клиппили
  function sndSwPop(dest, vol = 1, size = 1) {
    const a = audio(); if (!a) return;
    const t = a.currentTime, len = 0.32 + 0.22 * Math.min(size, 1.5);
    if (!kqNoise) { kqNoise = a.createBuffer(1, Math.floor(a.sampleRate * 2), a.sampleRate); const d = kqNoise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const ns = a.createBufferSource(), lp = a.createBiquadFilter(), g = a.createGain();
    ns.buffer = kqNoise; lp.type = 'lowpass'; lp.frequency.setValueAtTime(4800 + Math.random() * 1200, t); lp.frequency.exponentialRampToValueAtTime(240, t + len);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5 * vol, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    ns.connect(lp); lp.connect(g); g.connect(dest || a.destination); ns.start(t, Math.random()); ns.stop(t + len + 0.05);
    tone({ f0: 1500 + Math.random() * 700, f1: 380, dur: 0.07, vol: 0.1 * vol });
    tone({ f0: 150, f1: 38, dur: len, vol: 0.3 * vol });
  }
  async function softWetReveal(dlg, reveal, snd) {
    const W = window.innerWidth, H = window.innerHeight, T = SW_T, U = Math.min(W, H), TAU = Math.PI * 2;
    const rnd = (a, b) => a + Math.random() * (b - a);
    const fx = document.createElement('div');
    fx.className = 'jg-fx jg-sw'; // jg-fx перехватывает касания — с этого момента экран не нажимается
    fx.innerHTML = '<canvas class="jg-sw-gl"></canvas><canvas class="jg-sw-boom"></canvas>';
    let glc = fx.querySelector('.jg-sw-gl'); const bc = fx.querySelector('.jg-sw-boom');
    dlg.appendChild(fx);
    ui.fx = true;
    let dead = false, revealed = false, gfx = null, c2 = null;
    const doReveal = (d) => { if (revealed) return; revealed = true; reveal(d); };
    try {
      const bufName = await snd.swName, bufPop = await snd.swPop;
      const a = audio();
      let master = null;
      if (a) { master = a.createDynamicsCompressor(); master.threshold.value = -14; master.ratio.value = 6; master.connect(a.destination); }
      // подготовка, пока идёт надпись: шейдер, холсты, спрайты огня и дыма
      const q = Math.min(window.devicePixelRatio || 1, 1.5);
      gfx = swGL(glc, W, H, q);
      if (!gfx) { const n = document.createElement('canvas'); n.className = glc.className; glc.replaceWith(n); glc = n; glc.width = Math.round(W * q); glc.height = Math.round(H * q); c2 = glc.getContext('2d'); }
      boomPrep(); boomSupported();
      // 0) надпись на лёгком голубом размытом фоне (как у D4C); с голосом — пока он звучит
      fx.style.background = 'rgba(110,200,255,.24)'; fx.style.backdropFilter = fx.style.webkitBackdropFilter = 'blur(5px)';
      fx.style.transition = 'background-color .5s, backdrop-filter .5s, -webkit-backdrop-filter .5s';
      fx.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: 'forwards' });
      const [ns, ne] = bufName ? audibleSpan(bufName) : [0, 0];
      const dN = bufName ? (ne - ns) * 1000 : T.title;
      const ttl = titleCard(fx, 'ソフト＆ウェット', 'SOFT &amp; WET', 'sw');
      if (a && bufName) {
        const src = a.createBufferSource(), g = a.createGain(), t = a.currentTime;
        src.buffer = bufName; g.gain.setValueAtTime(1, t); g.gain.setValueAtTime(1, t + (ne - ns) - 0.04); g.gain.linearRampToValueAtTime(0.0001, t + (ne - ns));
        src.connect(g); g.connect(a.destination); src.start(t, ns, ne - ns);
      } else if (a) { for (let i = 0; i < 5; i++) tone({ f0: rnd(380, 560), f1: rnd(900, 1300), dur: 0.14, vol: 0.05, delay: 0.15 + i * 0.28 + rnd(0, 0.1) }); }
      ttl.hide(Math.max(600, dN - 250));
      await sleep(dN);
      fx.style.background = 'rgba(4,16,38,.34)'; fx.style.backdropFilter = fx.style.webkitBackdropFilter = ''; // голубое размытие уходит, остаётся лёгкое затемнение — на нём пузыри читаются лучше
      await sleep(T.gap);

      // 1) пузыри: каждый стартует из-за края (чаще снизу), летит по дуге и тормозит в своей точке; точки — по сетке со случайным сдвигом, чтобы экран заполнился ровно
      const N = T.count;
      const cols = Math.max(2, Math.round(Math.sqrt(N * W / H))), rows = Math.ceil(N / cols), cells = [];
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push([(c + 0.5) / cols, (r + 0.5) / rows]);
      const shuffle = (arr) => { for (let i = arr.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; };
      shuffle(cells);
      const bubbles = cells.slice(0, N).map(([cx, cy]) => {
        const R = U * (Math.random() < 0.2 ? rnd(0.12, 0.17) : rnd(0.055, 0.105));
        const tx = Math.min(W - R * 0.6, Math.max(R * 0.6, (cx + rnd(-0.36, 0.36) / cols) * W)), ty = Math.min(H - R * 0.6, Math.max(R * 0.6, (cy + rnd(-0.36, 0.36) / rows) * H));
        const k = Math.random();
        let sx, sy;
        if (k < 0.55) { sx = rnd(-0.1, 1.1) * W; sy = H + R + rnd(30, 220); } else if (k < 0.78) { sx = -R - rnd(30, 180); sy = rnd(0.35, 1.05) * H; } else { sx = W + R + rnd(30, 180); sy = rnd(0.35, 1.05) * H; }
        const dx = tx - sx, dy = ty - sy, L = Math.hypot(dx, dy) || 1;
        return { R, tx, ty, sx, sy, nx: -dy / L, ny: dx / L, curve: rnd(-0.28, 0.28) * Math.min(L, U * 1.6), delay: Math.pow(Math.random(), 1.25) * (T.fly - 1150), dur: rnd(850, 1150), ph: rnd(0, TAU), wf: rnd(0.8, 1.4), seed: rnd(0, 30), rot0: rnd(0, TAU), rv: rnd(-0.0006, 0.0006), tint: SW_COLORS[(Math.random() * SW_COLORS.length) | 0], popAt: -1 };
      }).sort((p, o) => p.R - o.R); // крупные рисуются поверх мелких
      // расписание взрывов заранее: случайный порядок, случайный интервал popMin…popMax
      const order = shuffle(bubbles.map((_, i) => i));
      const booms = new Array(bubbles.length);
      let acc = 0;
      order.forEach((bi, n) => {
        if (n) acc += rnd(T.popMin, T.popMax);
        const b = bubbles[bi];
        booms[bi] = { idx: bi, t: acc, x: b.tx / W, y: b.ty / H, s: Math.max(0.28, (b.R * T.boomK) / (U * 0.33)), v: 0.5 + 0.5 * Math.min(1, b.R / (U * 0.12)) };
      });
      const lastT = acc, revealN = Math.ceil(bubbles.length * T.revealAt);
      const ease = (u) => 1 - Math.pow(1 - u, 3);
      let T0 = 0, shiverFrom = Infinity, popped = 0;
      const list = [];
      const frame = (now) => {
        if (dead) return;
        const clk = now - T0, sh = clk > shiverFrom ? Math.min(1, (clk - shiverFrom) / 450) : 0;
        list.length = 0;
        for (const b of bubbles) {
          const u = (clk - b.delay) / b.dur; if (u <= 0) continue;
          let fade = 1, grow = 1;
          if (b.popAt >= 0) { const pu = (now - b.popAt) / 90; if (pu >= 1) continue; fade = 1 - pu; grow = 1 + 0.3 * pu; } // лопнул: за 90 мс чуть раздувается и исчезает, дальше — огонь
          const e = ease(Math.min(1, u)), off = Math.sin(Math.PI * e) * b.curve, fl = 2 + 4 * e;
          let x = b.sx + (b.tx - b.sx) * e + b.nx * off + Math.sin(clk * 0.0013 * b.wf + b.ph) * fl, y = b.sy + (b.ty - b.sy) * e + b.ny * off + Math.cos(clk * 0.0011 * b.wf + b.ph * 1.7) * fl;
          if (sh) { x += (Math.random() * 2 - 1) * 2.6 * sh; y += (Math.random() * 2 - 1) * 2.6 * sh; }
          const wob = (0.05 * (1.6 - e) + 0.03 * sh) * Math.sin(clk * 0.0045 * b.wf + b.ph); // пузырь «дышит»: в полёте сильнее, перед взрывом снова
          list.push({ x, y, sx: b.R * grow * (1 + wob), sy: b.R * grow * (1 - wob), fade, seed: b.seed, rot: b.rot0 + clk * b.rv, tint: b.tint });
        }
        if (gfx) gfx.draw(list, clk * 0.0025); else swDraw2D(c2, q, W, H, list);
        const shk = bc._shake || 0; // дрожь от взрывов — у холста с огнём
        bc.style.transform = shk > 0.3 ? `translate(${(Math.random() * 2 - 1) * shk}px,${(Math.random() * 2 - 1) * shk}px)` : '';
        requestAnimationFrame(frame);
      };
      if (a) for (let i = 0; i < Math.min(12, bubbles.length); i++) tone({ f0: rnd(330, 620), f1: rnd(700, 1100), dur: 0.12, vol: 0.035, delay: rnd(0, (T.fly - 1150) / 1000) }); // тихие «блюп» при вылете
      T0 = performance.now(); requestAnimationFrame(frame);
      await sleep(T.fly + T.hold - 450);
      // 2) заминка: пузыри перестали двигаться, в конце начинают мелко дрожать
      shiverFrom = performance.now() - T0;
      await sleep(450);
      // 3) взрывы один за другим; на заданной доле взрывов под ними появляется результат
      fx.style.transition = 'background-color .6s';
      await boomFx(bc, W, H, lastT + T.tail, (b) => {
        bubbles[b.idx].popAt = performance.now();
        if (a && bufPop) { // файл bomb.mp3 на каждый взрыв: чуть разная высота (крупный — ниже), громкость по размеру, наложения идут через общий компрессор
          const src = a.createBufferSource(), g = a.createGain();
          src.buffer = bufPop; src.playbackRate.value = Math.min(1.2, Math.max(0.8, 1.12 - 0.25 * b.s + rnd(-0.06, 0.06))); g.gain.value = 0.55 + 0.45 * b.v;
          src.connect(g); g.connect(master || a.destination); src.start();
        } else sndSwPop(master, b.v, b.s);
        if (++popped >= revealN && !revealed) { fx.style.background = ''; doReveal(0.3); }
      }, booms, true);
    } finally {
      dead = true;
      if (gfx) gfx.lose();
      fx.remove(); ui.fx = false;
      doReveal(0.2); // если что-то пошло не так — результат всё равно покажется
    }
  }

  // ---------- King Crimson (WebGL): стирание времени в стиле Сандевистана (Cyberpunk: Edgerunners) ----------
  // Надпись (как у D4C) + голос → окно подменяется снимком-текстурой → шейдер «Сандевистан»: мир темнеет и краснеет, кадр быстро и широко
  // качается, за ним тянутся красные послеобразы (16 «кадров-призраков» с запаздыванием по времени), от центра бегут скоростные линии
  // → время замирает, призраки схлопываются → красная вспышка; результат под ней. Звук kc-time-skip-bass.mp3 идёт весь Сандевистан.
  // Нет WebGL — запасной CSS-вариант (красные тени + затемнение).
  const KC_T = {
    title: 2200,   // надпись (если есть голос — по его длине, но не короче)
    a: 1200,       // 2) включение: мир темнеет, краснеет, появляются первые послеобразы
    b: 2800,       // 3) полный ход: быстрое широкое качание кадра, длинный красный шлейф призраков, скоростные линии
    c: 1500,       // 4) время замирает: движение гаснет, призраки схлопываются
    ghostOff: 100, // послеобразы убираются за 0,1 с после начала фазы c (замирание)
    hush: 300,     // замершее мгновение перед вспышкой (a+b+c+hush ≈ 5.8 с под звук ≈ 6.1 с)
    flash: 120,    // вспышка (мс)
    tail: 550,     // след гаснет, окно уже с результатом
  };
  const KC_FS = `
precision highp float;
uniform sampler2D uScene;
uniform vec2 uRes;
uniform float uT, uA, uB, uC, uF, uG;
float h11(float p){ p = fract(p * .1031); p *= p + 33.33; p *= p + p; return fract(p); }
vec4 S(vec2 p){ p = 1. - abs(1. - mod(p, 2.)); return texture2D(uScene, clamp(p, .006, .994)); }   // зеркало за краями + отступ от крайнего пикселя: нет «растянутых» полос по бокам
// положение кадра «в полёте»: плавное качание по горизонтали и чуть по вертикали (амплитуда гаснет при замирании)
vec2 swing(float t){ return vec2(.20 * sin(t * 6.8) + .07 * sin(t * 13.1 + 1.), .03 * sin(t * 8.3 + .6)); }
vec3 CY = vec3(1., .06, .10), MG = vec3(.62, .0, .06);   // красные послеобразы: ярко-красный и тёмно-багровый
vec3 glow(vec3 c, vec3 k){ float l = dot(c, vec3(.3, .55, .15)); return k * (.25 + 1.2 * l); }
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float asp = uRes.x / uRes.y;
  vec2 c = (uv - .5) * vec2(asp, 1.);
  float r = length(c);
  float act = clamp(max(uA, uB) * (1. - .55 * uC), 0., 1.);   // общая сила эффекта (при заморозке остаётся ~половина)
  float mv = (.35 * uA + .65 * uB) * (1. - uC);                // амплитуда движения: растёт и гаснет в заморозке
  // экран слегка подтягивается к зрителю и качается
  vec2 p = .5 + (uv - .5) * (1. - .03 * act);
  vec2 sw0 = swing(uT) * mv;
  p += sw0;
  // радиальное разделение каналов (мягкое, растёт к краям)
  vec2 rd = normalize(c + .0001) * vec2(1. / asp, 1.);
  float ab = .007 * act * (.4 + r * 1.6);
  vec4 sr = S(p + rd * ab), sg = S(p), sb = S(p - rd * ab);
  vec3 col = vec3(sr.r, sg.g, sb.b);
  float a = max(max(sr.a, sg.a), sb.a);
  // мир замедляется: приглушение цвета, холодный оттенок, затемнение
  float l0 = dot(col, vec3(.3, .55, .15));
  col = mix(col, vec3(l0) * vec3(1.15, .55, .55), .60 * act);
  col *= 1. - .35 * act;
  // послеобразы: призраки показывают, где кадр был раньше (запаздывание по времени, ступенями), цвета чередуются
  vec3 gh = vec3(0.);
  float lag = .042 + .016 * uB;
  for (int i = 1; i <= 16; i++) {
    float k = float(i);
    vec2 off = (swing(uT - k * lag) * mv) - sw0;
    float wg = (1. - (k - 1.) / 16.) * .40 * act * uG;
    vec3 tint = (mod(k, 2.) < 1.) ? MG : CY;
    gh += glow(S(p + off).rgb, tint) * wg;
  }
  col = 1. - (1. - col) * (1. - clamp(gh, 0., 1.));            // экранное сложение: призраки видны и на тёмном фоне
  a = max(a, clamp(dot(gh, vec3(.4)), 0., 1.));
  // скоростные линии от центра: тонкие, разной длины, мерцают ступенями
  float x = atan(c.y, c.x) / 6.28318 * 90.;
  float id = floor(x), f = fract(x);
  float core = 1. - smoothstep(0., .16, abs(f - .5));
  float rs = .22 + .32 * h11(id * 1.7);
  float on = step(.80, h11(id + floor(uT * 13.) * 7.3));
  float sl = core * on * smoothstep(rs, rs + .28, r) * uB * (1. - .6 * uC);
  col += mix(vec3(1., .25, .2), vec3(1., .02, .12), h11(id * 3.1)) * sl * .8; a = max(a, sl * .75);
  // холодная виньетка по краям с неоновой каймой
  float vig = smoothstep(.34, .85, r) * act;
  vec3 vc = mix(vec3(.07, .0, .01), vec3(.50, .0, .06), smoothstep(.6, 1.1, r));
  col = col * (1. - vig * .75) + vc * vig * .75; a = a + (1. - a) * vig * .75;
  // заморозка: контраст и лёгкая постеризация, мир замирает
  col = (col - .5 * a) * (1. + .22 * uC) + .5 * a;
  col = mix(col, floor(col * 6. + .5) / 6., uC * .35);
  // вспышка Time Skip: бело-голубая в центре, розовая к краям
  if (uF > 0.) {
    vec3 fc = mix(vec3(1., .42, .38), vec3(.75, .0, .06), smoothstep(.05, .7, r));
    col = mix(col, fc, uF); a = mix(a, 1., uF);
  }
  a = clamp(a, 0., 1.);
  gl_FragColor = vec4(min(clamp(col, 0., 1.), vec3(a)), a);
}`;
  function createKcGL(W, H, dpr) {
    const cv = document.createElement('canvas');
    cv.className = 'jg-cr-gl'; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) return null;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, SWIRL_VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, KC_FS)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'aPos'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const U = {};
    ['uScene', 'uRes', 'uT', 'uA', 'uB', 'uC', 'uF', 'uG'].forEach((n) => { U[n] = gl.getUniformLocation(pr, n); });
    gl.uniform1i(U.uScene, 0); gl.uniform2f(U.uRes, cv.width, cv.height);
    gl.viewport(0, 0, cv.width, cv.height); gl.clearColor(0, 0, 0, 0);
    return {
      cv,
      setScene(img) {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      },
      draw(p) {
        gl.uniform1f(U.uT, p.time); gl.uniform1f(U.uA, p.a); gl.uniform1f(U.uB, p.b); gl.uniform1f(U.uC, p.c); gl.uniform1f(U.uF, p.f); gl.uniform1f(U.uG, p.g);
        gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES, 0, 3);
      },
      dispose() { const x = gl.getExtension('WEBGL_lose_context'); if (x) x.loseContext(); },
    };
  }
  // синтезированные звуки: глухой удар на надписи (если нет голоса), тихий нарастающий свист Сандевистана, запасной щелчок (если нет time-skip.mp3)
  const sndKcTitle = () => { tone({ f0: 74, f1: 38, dur: 1.3, vol: 0.5 }); tone({ type: 'sawtooth', f0: 230, f1: 52, dur: 1.0, vol: 0.05 }); };
  const sndKcSandy = (totalMs) => { tone({ f0: 180, f1: 1100, dur: totalMs / 1000, vol: 0.035 }); tone({ f0: 54, f1: 96, dur: totalMs / 1000, vol: 0.12 }); };
  const sndKcSnap = () => { tone({ type: 'square', f0: 2600, f1: 80, dur: 0.07, vol: 0.28 }); tone({ f0: 95, f1: 32, dur: 0.55, vol: 0.5 }); tone({ f0: 1400, f1: 180, dur: 0.35, vol: 0.08 }); };
  async function kingCrimsonReveal(dlg, reveal, snd, st) {
    const W = window.innerWidth, H = window.innerHeight, dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    const modal = dlg.querySelector('.jg-modal');
    const T = KC_T;
    const fx = document.createElement('div');
    fx.className = 'jg-fx jg-kc';
    fx.innerHTML = '<div class="jg-kc-red"></div>';
    const redL = fx.firstElementChild;
    dlg.appendChild(fx);
    ui.fx = true; // с этого момента нажатия не проходят (слой .jg-fx их перехватывает)
    let dead = false, revealed = false, gl = null;
    const doReveal = (d) => { if (revealed) return; revealed = true; reveal(d); };
    const bufName = await snd.kcName, bufSkip = await snd.kcSkip, bufSkip2 = await snd.kcSkip2;
    // снимок окна → текстура; если не вышло — запасной вариант без WebGL
    try {
      const shot = await captureModal(modal, W, H, dpr, false);
      shot.getContext('2d').getImageData(0, 0, 1, 1);
      gl = createKcGL(W, H, dpr);
      if (gl) gl.setScene(shot);
    } catch (e) { console.warn('[JoJo Stands] King Crimson: WebGL недоступен, запасной вариант', e); if (gl) gl.dispose(); gl = null; }
    const ease = { out: (u) => 1 - Math.pow(1 - u, 3), in: (u) => Math.pow(u, 2), smooth: (a, b, u) => { const x = Math.min(1, Math.max(0, (u - a) / (b - a))); return x * x * (3 - 2 * x); } };
    const run = (ms, fn) => new Promise((res) => {
      const t0 = performance.now();
      const f = (now) => { const u = Math.min(1, (now - t0) / ms); fn(u); if (u < 1 && !dead) requestAnimationFrame(f); else res(); };
      requestAnimationFrame(f);
    });
    const P = { a: 0, b: 0, c: 0, f: 0, g: 1 };
    const tS = performance.now();
    const frame = () => { if (gl) gl.draw({ ...P, time: (performance.now() - tS) / 1000 }); };
    const shake = (px) => { const el = gl ? gl.cv : modal; el.style.transform = px ? `translate(${(Math.random() * 2 - 1) * px}px,${(Math.random() * 2 - 1) * px}px)` : ''; };
    try {
      // 1) надпись как у D4C: на время надписи фон тёмно-красный и слегка размытый; нажатия не работают
      fx.style.transition = 'background-color .4s, backdrop-filter .4s, -webkit-backdrop-filter .4s';
      fx.style.background = 'rgba(120,10,30,.34)'; fx.style.backdropFilter = fx.style.webkitBackdropFilter = 'blur(5px)';
      const a = audio();
      let dT = T.title;
      if (a && bufName) {
        const [ns, ne] = audibleSpan(bufName);
        dT = Math.max(T.title, (ne - ns) * 1000 + 300);
        const src = a.createBufferSource(), g = a.createGain(), t = a.currentTime;
        src.buffer = bufName; g.gain.setValueAtTime(1, t); g.gain.setValueAtTime(1, t + (ne - ns) - 0.04); g.gain.linearRampToValueAtTime(0.0001, t + (ne - ns));
        src.connect(g); g.connect(a.destination); src.start(t, ns, ne - ns);
      } else sndKcTitle();
      const ttl = titleCard(fx, 'キング・クリムゾン', 'KING CRIMSON', 'kcr');
      ttl.hide(dT - 250);
      await sleep(dT - 450);
      fx.style.background = ''; fx.style.backdropFilter = fx.style.webkitBackdropFilter = '';
      await sleep(450);
      // 2) окно подменяется текстурой; включается Сандевистан: мир темнеет и синеет, появляются голубые и розовые послеобразы
      if (gl) { fx.appendChild(gl.cv); frame(); await sleep(60); modal.style.visibility = 'hidden'; }
      // звук King Crimson Time Skip Bass играет с самого начала Сандевистана (~6.1 с); нет файла — синтезированный свист
      let skipped = false;
      if (a && bufSkip) {
        const s = a.createBufferSource(), g = a.createGain(); s.buffer = bufSkip; g.gain.value = 1; s.connect(g); g.connect(a.destination); s.start(); skipped = true;
        // когда бас закончится — сразу следом старый Time Skip
        if (bufSkip2) { const s2 = a.createBufferSource(), g2 = a.createGain(); s2.buffer = bufSkip2; g2.gain.value = 1; s2.connect(g2); g2.connect(a.destination); s2.start(a.currentTime + bufSkip.duration); }
      } else sndKcSandy(T.a + T.b + T.c);
      await run(T.a, (u) => {
        P.a = ease.out(Math.min(1, u * 1.25));
        if (gl) frame(); else modal.style.filter = `brightness(${1 - 0.3 * P.a}) saturate(${1 - 0.5 * P.a}) drop-shadow(${22 * P.a}px 0 0 rgba(255,20,40,.6)) drop-shadow(${-22 * P.a}px 0 0 rgba(150,0,20,.5))`;
      });
      // 3) полный ход: длинный шлейф послеобразов, скоростные линии, кадр плавно «летит» из стороны в сторону
      await run(T.b, (u) => {
        P.a = 1; P.b = ease.smooth(0, 0.35, u);
        if (gl) frame(); else modal.style.transform = `translateX(${Math.sin(u * 42) * 60 * P.b}px)`;
      });
      // 4) время замирает: движение гаснет, призраки схлопываются в одно изображение (звук ещё идёт)
      await run(T.c, (u) => {
        P.c = ease.smooth(0, 0.5, u); P.b = 1 - 0.7 * P.c; P.a = 1; P.g = Math.max(0, 1 - u * T.c / T.ghostOff);
        if (gl) frame(); else { modal.style.transform = ''; modal.style.filter = `brightness(.8) saturate(.55) drop-shadow(${22 * P.g}px 0 0 rgba(255,20,40,.55)) drop-shadow(${-22 * P.g}px 0 0 rgba(150,0,20,.45))`; }
      });
      // замершее мгновение
      P.c = 1; P.b = 0.3; P.a = 1; P.g = 0; frame();
      await sleep(T.hush);
      // 5) красная вспышка — и изображение уже в новом состоянии (если файла со звуком нет — запасной щелчок)
      if (!skipped) { // баса нет: на вспышке играет старый Time Skip, а если и его нет — синтезированный щелчок
        if (a && bufSkip2) { const s = a.createBufferSource(), g = a.createGain(); s.buffer = bufSkip2; g.gain.value = 1; s.connect(g); g.connect(a.destination); s.start(); } else sndKcSnap();
      }
      P.f = 1; frame(); modal.style.filter = '';
      doReveal(0.05);
      modal.style.visibility = '';
      redL.style.opacity = 1;
      await sleep(T.flash);
      if (gl) gl.cv.style.display = 'none';
      modal.style.transform = '';
      redL.style.transition = `opacity ${T.tail}ms ease-out`; void redL.offsetWidth; redL.style.opacity = 0;
      await sleep(T.tail);
    } finally {
      dead = true;
      modal.style.visibility = ''; modal.style.transform = ''; modal.style.filter = '';
      if (gl) gl.dispose();
      fx.remove(); ui.fx = false;
      doReveal(0.2); // если что-то пошло не так — результат всё равно покажется
    }
  }
  // ---------- Gold Experience (WebGL/GLSL): камень → расходящиеся золотые трещины → живые узоры под коркой → бабочка → улетает ----------
  // Весь рисунок — один фрагментный шейдер GE_FS на прозрачном холсте поверх затемнённого окна (снимок окна не нужен).
  // Камень: SDF + псевдо-нормаль + шум. Трещины: 9 рваных радиальных трещин от точки удара (сужаются, на кончике горячая точка, фронт бежит наружу)
  // + сеть мелких трещин (Вороной). Потом жилы (ridge-шум), потом камень выгорает изнутри наружу.
  // Бабочка — настоящая 3D-сцена в шейдере: 4 крыла (плоскости с шарниром у тела, трассировка луча, угол взмаха, перспектива, обе стороны крыла),
  // тело из эллипсоидов (мех груди, кольца брюшка, глаза), усики с булавой, жилкование с развилками, чёрная кайма с пятнами, чешуйки,
  // подсветка насквозь, размытие движения (3 выборки по времени). Крылья раскрываются из сложенного положения (угол phiOpen).
  // Нет WebGL — запасной вариант с эмодзи 🪨 → 🦋.
  const GE_T = {
    title: 1500,   // надпись (если есть голос — по его длине, но не короче)
    stone: 650,    // 1) камень проявляется в центре
    hold: 400,     //    обычный камень, тишина
    crack: 1500,   // 2) золотые трещины расходятся по камню от точки удара
    vein: 1600,    // 3) под коркой текут светящиеся органические узоры
    morph: 2200,   // 4) камень выгорает изнутри наружу, из него проступает бабочка и раскрывает крылья (посередине — вспышка)
    live: 800,     // 5) бабочка оживает: взмахи, парение
    fly: 1900,     //    улетает за верхний край экрана, оставляя золотую пыль; на середине полёта проявляется результат
    tail: 300,
  };
  const GE_FS = `
precision highp float;
uniform vec2 uRes;
uniform float uT, uSt, uCr, uVn, uMo, uLf, uFp, uFl, uFh;
float hash11(float p){ p = fract(p * .1031); p *= p + 33.33; p *= p + p; return fract(p); }
float hash21(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec2 hash22(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx + p3.yz) * p3.zy); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(hash21(i), hash21(i + vec2(1., 0.)), f.x), mix(hash21(i + vec2(0., 1.)), hash21(i + vec2(1., 1.)), f.x), f.y);
}
float fbm3(vec2 p){
  float a = .5, s = 0.;
  for (int i = 0; i < 3; i++) { s += a * noise(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p + vec2(3.1, 1.7); a *= .5; }
  return s;
}
float smin(float a, float b, float k){ float h = clamp(.5 + .5 * (b - a) / k, 0., 1.); return mix(b, a, h) - k * h * (1. - h); }
float smax(float a, float b, float k){ return -smin(-a, -b, k); }
vec3 hot(float k){ return mix(vec3(1., .52, .06), vec3(1., .95, .62), clamp(k, 0., 1.)); }
vec3 rotZ(vec3 v, float a){ float c = cos(a), s = sin(a); return vec3(c * v.x - s * v.y, s * v.x + c * v.y, v.z); }
vec3 rotX(vec3 v, float a){ float c = cos(a), s = sin(a); return vec3(v.x, c * v.y - s * v.z, s * v.y + c * v.z); }

// ---------- камень и трещины ----------
float vor(vec2 p, out vec2 cp){
  vec2 ip = floor(p), fp = fract(p);
  float f1 = 8., f2 = 8.; cp = vec2(0.);
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 o = hash22(ip + g); o = .5 + .45 * sin(6.2831 * o);
      vec2 r = g + o - fp; float d = dot(r, r);
      if (d < f1) { f2 = f1; f1 = d; cp = ip + g + o; } else if (d < f2) { f2 = d; }
    }
  }
  return sqrt(f2) - sqrt(f1);
}
// трещины: 9 рваных радиальных трещин от точки удара (сужаются к концу, на кончике горячая точка, фронт бежит наружу)
// + сеть мелких трещин (границы ячеек Вороного), которая растекается следом за фронтом. x — линии, y — свечение рядом, z — горячие кончики
vec3 cracks(vec2 q, float prog){
  vec2 imp = vec2(-.03, .04);
  vec2 cq = q - imp;
  float r = length(cq), an = atan(cq.y, cq.x);
  float lines = 0., glw = 0., tip = 0.;
  for (int j = 0; j < 9; j++) {
    float fj = float(j);
    float a0 = (fj + .7 * hash11(fj * 3.7 + .5)) * .69813;
    float len = .26 + .24 * hash11(fj * 5.1 + 1.3);
    float reach = prog * (len + .04);
    float wob = (noise(vec2(r * 9., fj * 7.3)) - .5) * 1.1 + .35 * sin(r * 17. + fj * 2.1);
    float da = an - (a0 + wob * (.25 + r));
    da = abs(mod(da + 3.14159, 6.28318) - 3.14159);
    float dist = da * r;
    float k = clamp(r / len, 0., 1.);
    float wd = mix(.012, .0032, k);
    float vis = 1. - smoothstep(reach - .03, reach, r);
    float st = smoothstep(0., .03, r);
    lines = max(lines, (1. - smoothstep(wd * .45, wd, dist)) * vis * st);
    glw = max(glw, exp(-dist * 22.) * vis * st * .55);
    tip = max(tip, exp(-pow((r - reach) / .035, 2.)) * (1. - smoothstep(wd * .5, wd * 2.5, dist)) * step(.001, prog));
  }
  vec2 w = q + .05 * vec2(noise(q * 8.), noise(q * 8. + 9.)) - .025;
  vec2 cp;
  float e = vor(w * 6.5, cp);
  float t = length(cp / 6.5 - imp) * .9 + .12 * hash21(cp);
  float v = 1. - smoothstep(prog * .5 - .05, prog * .5, t);
  float net = (1. - smoothstep(0., .075, e)) * v * smoothstep(0., .03, r) * .85;
  return vec3(max(lines, net), max(glw, exp(-e * 8.) * v * .3), tip);
}
vec2 veins(vec2 q, float t){
  vec2 w = q * 3.6;
  vec2 wp = w + .7 * vec2(noise(w * 1.1 + vec2(t, 0.)), noise(w * 1.1 + vec2(7., -t)));
  float n1 = fbm3(wp * 1.2 + vec2(0., -t * .6));
  float r1 = 1. - abs(2. * n1 - 1.);
  vec2 w2 = q * 7.5 + vec2(t * .4, 3.);
  float n2 = fbm3(w2 + .5 * vec2(noise(w2 * 1.3), noise(w2 * 1.3 + 5.)));
  float r2 = 1. - abs(2. * n2 - 1.);
  return vec2(pow(r1, 14.) + pow(r2, 16.) * .6, pow(r1, 4.) * .5 + pow(r2, 5.) * .25);
}
float rockD(vec2 q){
  vec2 s = vec2(q.x, q.y * 1.22 + .02);
  float a = atan(s.x, s.y);
  float r = .27 * (1. + .085 * sin(3. * a + 1.2) + .055 * sin(5. * a + .4) + .03 * sin(9. * a + 2.));
  float d = (length(s) - r) * .85;
  return smax(d, -(q.y + .20), .05);
}

// ---------- бабочка (настоящая 3D-сцена: ray-plane для крыльев, ray-эллипсоиды для тела) ----------
// расстояние до отрезка со знаком по правилу чётности (для многоугольника крыла)
float segD(vec2 p, vec2 a, vec2 b, inout float sg){
  vec2 pa = p - a, ba = b - a;
  float d = length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0., 1.));
  bool c1 = a.y > p.y, c2 = b.y > p.y;
  if (c1 != c2) { float xi = a.x + (p.y - a.y) * (b.x - a.x) / (b.y - a.y); if (p.x < xi) sg = -sg; }
  return d;
}
// переднее крыло: прямая передняя кромка к скруглённой вершине, выпуклый внешний край, задний угол
float foreSDF(vec2 p){
  float sg = 1.;
  float d = segD(p, vec2(.0, .03), vec2(.28, .285), sg);
  d = min(d, segD(p, vec2(.28, .285), vec2(.36, .205), sg));
  d = min(d, segD(p, vec2(.36, .205), vec2(.325, .04), sg));
  d = min(d, segD(p, vec2(.325, .04), vec2(.12, -.02), sg));
  d = min(d, segD(p, vec2(.12, -.02), vec2(.0, .03), sg));
  return sg * d - .03;
}
// заднее крыло: округлое, с волнистым краем
float hindSDF(vec2 p){
  float sg = 1.;
  float d = segD(p, vec2(.0, .0), vec2(.19, .03), sg);
  d = min(d, segD(p, vec2(.19, .03), vec2(.275, -.07), sg));
  d = min(d, segD(p, vec2(.275, -.07), vec2(.245, -.215), sg));
  d = min(d, segD(p, vec2(.245, -.215), vec2(.125, -.29), sg));
  d = min(d, segD(p, vec2(.125, -.29), vec2(.02, -.2), sg));
  d = min(d, segD(p, vec2(.02, -.2), vec2(.0, .0), sg));
  return sg * d - .04 + .004 * sin(atan(p.y + .12, p.x - .15) * 16.);
}
// рисунок крыла (координаты w в плоскости крыла от шарнира): веер жилок с развилками, чёрная кайма с двумя рядами белых пятен,
// чёрная вершина с пятнами, градиент золото-янтарь, чешуйки; ventral=1 — нижняя сторона (светлее, спокойнее)
vec3 wingTex(vec2 w, float fore, float e, float ventral){
  vec2 rp = w - vec2(.0, mix(-.03, .0, fore));
  float r = length(rp);
  float an = atan(rp.x, rp.y);
  float sw = .6 * sin(r * 8. + fore * 2.) * r * 3.;
  float fa = fract(an / .17 + sw);
  float fv = abs(fa - .5) * .17;
  float fv2 = abs(fract(an / .085 + sw * 2.) - .5) * .085;
  float wv = .0028 + .010 * exp(-r * 14.);
  float vein = (1. - smoothstep(wv * .5, wv, fv * r)) * smoothstep(.035, .10, r);
  float vein2 = (1. - smoothstep(wv * .35, wv * .6, fv2 * r)) * smoothstep(.15, .26, r);
  float fuzz = 1. - smoothstep(.02, .13, r);
  vec3 orange = mix(vec3(.88, .30, .03), vec3(1., .68, .08), smoothstep(.0, .2, r));
  orange = mix(orange, vec3(1., .82, .20), smoothstep(.16, .40, r) * .5);
  float mott = fbm3(w * 18.);
  orange *= (.88 + .24 * mott) * (.90 + .22 * (1. - abs(fa - .5) * 2.));
  vec3 pale = mix(vec3(.95, .62, .20), vec3(1., .82, .38), smoothstep(.0, .3, r)) * (.88 + .24 * mott);
  vec3 base = mix(orange, pale, ventral);
  vec3 dark = vec3(.035, .016, .008);
  float dk = clamp(vein * mix(1., .55, ventral) + vein2 * .7, 0., 1.);
  base = mix(base, dark, dk * .88);
  float bw = mix(.032, .022, ventral);
  float bord = 1. - smoothstep(bw, bw + .02 + .01 * noise(w * 40.), e);
  base = mix(base, mix(dark, vec3(.35, .2, .06), ventral * .6), bord * mix(.97, .6, ventral));
  vec2 cw = w - mix(vec2(.15, -.12), vec2(.17, .12), fore);
  float pa = atan(cw.y, cw.x);
  float d1 = length(vec2((fract(pa * 3.) - .5) * .073, e - .026));
  float d2 = length(vec2((fract(pa * 3. + .5) - .5) * .073, e - .052));
  float outer = fore > .5 ? smoothstep(.85, .55, pa) * smoothstep(-1.7, -1.2, pa) : smoothstep(.9, .5, pa) * smoothstep(-2.9, -2.5, pa);
  float spots = max(1. - smoothstep(.0075, .0115, d1), (1. - smoothstep(.004, .0075, d2)) * .9) * smoothstep(.0, .01, e) * outer;
  base = mix(base, vec3(1., .96, .80), spots);
  if (fore > .5) {
    float apx = 1. - smoothstep(.04, .11, length(w - vec2(.30, .265)));
    base = mix(base, dark, apx * mix(.9, .45, ventral));
    float s3 = max(1. - smoothstep(.009, .014, length(w - vec2(.285, .22))), max(1. - smoothstep(.007, .012, length(w - vec2(.315, .165))), 1. - smoothstep(.006, .010, length(w - vec2(.255, .255)))));
    base = mix(base, vec3(1., .82, .40), s3);
  }
  base = mix(base, mix(vec3(.50, .26, .06), vec3(.85, .55, .14), noise(w * vec2(160., 160.))), fuzz * .85);
  base *= .96 + .08 * noise(w * vec2(150., 110.));
  return base;
}
// пересечение луча с плоскостью крыла (шарнир у тела, угол взмаха phi); возвращает (t, u, v, sdf) в плоскости крыла, side = ±1 — правое/левое
vec4 wingTest(vec3 O, vec3 D, float phi, float side, float fore){
  O.x *= side; D.x *= side;
  float cp = cos(phi), sp = sin(phi);
  vec3 H0 = vec3(.03, .02, mix(-.004, .004, fore));
  vec3 nrm = vec3(-sp, 0., cp);
  float den = dot(nrm, D);
  if (abs(den) < .0001) return vec4(1e9, 0., 0., 1.);
  float t = dot(nrm, H0 - O) / den;
  if (t < 0.) return vec4(1e9, 0., 0., 1.);
  vec3 P = O + D * t - H0;
  vec2 uv = vec2(dot(P, vec3(cp, 0., sp)), P.y);
  float sdf = fore > .5 ? foreSDF(uv) : hindSDF(uv);
  return vec4(t, uv, sdf);
}
float rayEll(vec3 O, vec3 D, vec3 c, vec3 r, out vec3 nrm){
  nrm = vec3(0., 0., 1.);
  vec3 o = (O - c) / r, d = D / r;
  float a = dot(d, d), b = dot(o, d), cc = dot(o, o) - 1.;
  float h = b * b - a * cc;
  if (h < 0.) return 1e9;
  float t = (-b - sqrt(h)) / a;
  if (t < 0.) return 1e9;
  nrm = normalize((o + d * t) / r);
  return t;
}
float raySeg(vec3 O, vec3 D, vec3 A, vec3 B){
  vec3 e = B - A, w0 = O - A;
  float b = dot(D, e), c = dot(e, e), d = dot(D, w0), f = dot(e, w0);
  float u = clamp((f - b * d) / max(c - b * b, .000001), 0., 1.);
  float s = max(b * u - d, 0.);
  return length(O + D * s - (A + e * u));
}
// одна выборка бабочки: луч в системе координат бабочки (голова вдоль +y, спина к +z), время tm (для размытия движения), L — свет; возвращает премультиплицированный цвет
vec4 butterfly(vec3 O, vec3 D, float tm, float phiOpen, vec3 L){
  float wt = tm * 28.;
  float phf = phiOpen + uFp * (.15 + .80 * sin(wt));
  float phh = phiOpen * .9 - .10 + uFp * (.10 + .72 * sin(wt - .45));
  float tw = 1e9, sd = 1., fr = 1., ph = 0.;
  vec4 wb = vec4(0.);
  vec4 w1 = wingTest(O, D, phf, 1., 1.);
  if (w1.w < .004 && w1.x < tw) { tw = w1.x; wb = w1; sd = 1.; fr = 1.; ph = phf; }
  vec4 w2 = wingTest(O, D, phf, -1., 1.);
  if (w2.w < .004 && w2.x < tw) { tw = w2.x; wb = w2; sd = -1.; fr = 1.; ph = phf; }
  vec4 w3 = wingTest(O, D, phh, 1., 0.);
  if (w3.w < .004 && w3.x < tw) { tw = w3.x; wb = w3; sd = 1.; fr = 0.; ph = phh; }
  vec4 w4 = wingTest(O, D, phh, -1., 0.);
  if (w4.w < .004 && w4.x < tw) { tw = w4.x; wb = w4; sd = -1.; fr = 0.; ph = phh; }
  // тело: грудь, брюшко (два сегмента), голова, глаза
  float tb = 1e9, bid = 0.;
  vec3 nb = vec3(0., 0., 1.), nn;
  float tt = rayEll(O, D, vec3(0., .065, 0.), vec3(.042, .072, .045), nn); if (tt < tb) { tb = tt; nb = nn; bid = 1.; }
  tt = rayEll(O, D, vec3(0., -.12, -.003), vec3(.030, .10, .030), nn); if (tt < tb) { tb = tt; nb = nn; bid = 2.; }
  tt = rayEll(O, D, vec3(0., -.27, -.010), vec3(.022, .12, .022), nn); if (tt < tb) { tb = tt; nb = nn; bid = 2.; }
  tt = rayEll(O, D, vec3(0., .165, .015), vec3(.030, .028, .030), nn); if (tt < tb) { tb = tt; nb = nn; bid = 3.; }
  tt = rayEll(O, D, vec3(.022, .175, .032), vec3(.013, .013, .013), nn); if (tt < tb) { tb = tt; nb = nn; bid = 4.; }
  tt = rayEll(O, D, vec3(-.022, .175, .032), vec3(.013, .013, .013), nn); if (tt < tb) { tb = tt; nb = nn; bid = 4.; }
  vec3 V = -D;
  vec3 col = vec3(0.);
  float al = 0.;
  if (tw < tb) {
    vec3 axr = vec3(cos(ph) * sd, 0., sin(ph));
    vec3 nd = vec3(-sin(ph) * sd, 0., cos(ph));
    float ventral = dot(nd, V) < 0. ? 1. : 0.;
    float sgn = 1. - 2. * ventral;
    vec3 nw = normalize(nd * sgn + axr * (.55 * wb.y) * sgn);
    float e = max(-wb.w, 0.);
    vec3 base = wingTex(wb.yz, fr, e, ventral);
    float dif = max(dot(nw, L), 0.);
    float back = max(dot(-nw, L), 0.);
    col = base * (.50 + .62 * dif) + base * vec3(1., .72, .35) * back * .45;
    float spc = pow(max(dot(reflect(-L, nw), V), 0.), 20.);
    col += vec3(1., .9, .6) * spc * .25 * (1. - ventral * .5) * (.6 + .8 * noise(wb.yz * 70.));
    col += vec3(1., .75, .3) * exp(-e * 45.) * .03 + vec3(1., .8, .4) * pow(1. - abs(dot(nw, V)), 3.) * .12;
    col += vec3(1., .6, .15) * .10 * uLf * (.5 + .5 * sin(uT * 3. - length(wb.yz) * 14.));
    al = 1. - smoothstep(-.0018, .0018, wb.w);
  } else if (tb < 1e8) {
    vec3 P = O + D * tb;
    float dif = max(dot(nb, L), 0.);
    vec3 bc; float gl2 = 0.;
    if (bid < 1.5) {
      float fur = noise(P.xy * vec2(300., 110.)) * .6 + noise(P.xy * vec2(620., 220.)) * .4;
      bc = mix(vec3(.06, .035, .02), vec3(.70, .42, .11), pow(fur, 1.6) * 1.5);
      vec2 cs = fract(P.xy * vec2(42., 38.)) - .5;
      bc = mix(bc, vec3(1., .95, .8), (1. - smoothstep(.12, .2, length(cs))) * smoothstep(.015, .03, abs(P.x)));
    } else if (bid < 2.5) {
      bc = vec3(.035, .025, .02);
      bc = mix(bc, vec3(.9, .65, .25), smoothstep(.65, .95, sin(P.y * 140.)) * .35);
      gl2 = .35;
    } else if (bid < 3.5) {
      bc = vec3(.03, .02, .015);
      vec2 cs = fract(P.xy * vec2(70., 70.)) - .5;
      bc = mix(bc, vec3(1., .95, .8), (1. - smoothstep(.12, .2, length(cs))) * smoothstep(.012, .022, abs(P.x)) * .8);
    } else { bc = vec3(.01); gl2 = 1.; }
    col = bc * (.35 + .9 * dif) + vec3(1., .9, .7) * pow(max(dot(reflect(-L, nb), V), 0.), 30.) * gl2;
    col += vec3(1., .7, .25) * pow(1. - max(dot(nb, V), 0.), 3.) * .25;
    al = 1.;
  }
  vec4 res = vec4(col * al, al);
  // усики с булавой (поверх)
  float aa = 0.;
  for (int s = 0; s < 2; s++) {
    float sg = s == 0 ? 1. : -1.;
    vec3 Oa = vec3(O.x * sg, O.y, O.z), Da = vec3(D.x * sg, D.y, D.z);
    aa = max(aa, 1. - smoothstep(.0035, .0058, raySeg(Oa, Da, vec3(.012, .185, .03), vec3(.05, .27, .06))));
    aa = max(aa, 1. - smoothstep(.0035, .0058, raySeg(Oa, Da, vec3(.05, .27, .06), vec3(.095, .35, .075))));
    aa = max(aa, 1. - smoothstep(.0085, .0125, raySeg(Oa, Da, vec3(.095, .35, .075), vec3(.115, .385, .078))));
  }
  res.rgb = vec3(.30, .19, .07) * aa + res.rgb * (1. - aa);
  res.a = aa + res.a * (1. - aa);
  return res;
}
// траектория полёта: плавный разгон, змейка, уход за верхний край
vec2 flyPos(float u, float top){
  float s = u * u * (1.4 - .4 * u);
  return vec2(.32 * sin(u * 6.5) * smoothstep(0., .25, u) + .10 * u, (top + .95) * s);
}
void main(){
  float S = min(uRes.x, uRes.y);
  vec2 p = (gl_FragCoord.xy - .5 * uRes) / S;
  float top = .5 * uRes.y / S;
  float px = 1.5 / S;
  float appear = smoothstep(0., 1., uSt);
  float hov = smoothstep(.75, 1., uMo);
  float wt0 = uT * 28.;
  vec2 pos = flyPos(uFl, top) + vec2(0., .025 * sin(uT * 3.1) * hov * (1. - uFl) + .06 * uFp + .018 * sin(wt0 - 1.) * uFp);
  vec2 dir = flyPos(min(uFl + .02, 1.), top) - flyPos(max(uFl - .02, 0.), top);
  float ang = atan(dir.x, max(dir.y, .0005)) * .5 * smoothstep(0., .1, uFl) + .10 * sin(uT * 5.3) * uFp;
  vec2 dp = p - pos;
  float sc = mix(.86, 1., appear) * (1. - .30 * uFl);
  vec2 q = rotZ(vec3(dp, 0.), ang).xy / sc;
  vec2 imp = vec2(-.03, .04);
  vec3 Lw = normalize(vec3(-.45, .6, .65));
  float lm = smoothstep(.2, .9, uMo);
  vec3 gcol = vec3(1., .70, .18);
  vec4 acc = vec4(0.);
  // тень под камнем
  acc.a = (1. - smoothstep(0., 1., length((p - pos - vec2(0., -.215 * sc)) / vec2(.30, .055)))) * .55 * appear * (1. - lm) * (1. - uFl);
  // аура и вспышка превращения
  float I = .06 * uCr + .26 * uVn + .30 * lm + .25 * uFp + 1.1 * uFh;
  float dR = rockD(q);
  acc.rgb += gcol * exp(-max(dR, 0.) * 5.5) * I * appear * .45 * (1. - lm);
  acc.rgb += gcol * exp(-length(dp) / sc * 3.2) * (.22 * lm + .25 * uFp + .5 * uFh) * .6;
  acc.rgb += vec3(1., .9, .6) * uFh * exp(-length(p - pos) * 2.8) * .7;

  // камень: серо-бурый, шумный; трещины расходятся от точки удара; потом жилы; потом камень выгорает изнутри наружу
  if (dR < .02 && uMo < .98) {
    float inside = 1. - smoothstep(-px, px, dR);
    vec2 eo = vec2(.004, 0.);
    vec2 g = vec2(rockD(q + eo.xy) - rockD(q - eo.xy), rockD(q + eo.yx) - rockD(q - eo.yx)) / .008;
    float e = max(-dR, 0.);
    vec3 n = normalize(vec3(g * pow(1. - clamp(e / .11, 0., 1.), 2.) * 1.7, 1.));
    vec2 bp = q * 10.;
    float h0 = fbm3(bp);
    vec2 hg = vec2(fbm3(bp + vec2(.07, 0.)) - h0, fbm3(bp + vec2(0., .07)) - h0);
    n = normalize(n + vec3(-hg * 8., 0.));
    float df = max(dot(n, Lw), 0.);
    float spec = pow(max(dot(reflect(-Lw, n), vec3(0., 0., 1.)), 0.), 14.);
    float rn = fbm3(q * 6. + 2.3);
    vec3 rock = mix(vec3(.20, .19, .18), vec3(.52, .49, .45), rn) * (.82 + .36 * noise(q * 45.));
    vec3 lit = rock * (.30 + df) + vec3(.55, .52, .48) * spec * .12;
    lit *= mix(.55, 1., smoothstep(0., .13, e));
    vec3 ck = cracks(q, uCr);
    vec2 vn = veins(q, uT * .5);
    float front = smoothstep(0., .4, uVn * 1.55 - length(q - imp) * 1.5 - .12 * noise(q * 5. + 2.));
    float pul = .8 + .2 * sin(uT * 7. + q.x * 9. + q.y * 7.);
    lit *= 1. - .45 * vn.y * front - .45 * ck.y * (1. - ck.x);
    vec3 emis = hot(.15 + .6 * ck.x) * ck.x * 1.25 * (1. + .6 * uVn) + gcol * ck.y * .45 + vec3(1., .9, .55) * ck.z * .9
      + (hot(vn.x) * vn.x * 1.3 + gcol * vn.y * .45) * front * pul;
    emis += vec3(1., .9, .55) * exp(-length(q - imp) * 26.) * smoothstep(0., .06, uCr) * (1. - smoothstep(.08, .5, uCr)) * 1.4;
    float K = 1.15 - uMo * 1.35 - (length(q) / .30 * .55 + noise(q * 9. + 3.) * .45);
    float keep = smoothstep(0., .12, K);
    float edgeB = smoothstep(0., .05, K) * (1. - smoothstep(.05, .22, K)) * smoothstep(0., .1, uMo);
    vec3 surf = lit + emis + gcol * exp(-e * 26.) * .30 * uVn * front + hot(.5) * edgeB * 1.0;
    float oa = inside * appear * keep;
    acc.rgb = surf * oa + acc.rgb * (1. - oa);
    acc.a = oa + acc.a * (1. - oa);
  }

  // бабочка: настоящая 3D-сцена в системе координат бабочки; крылья раскрываются из сложенного положения, на взмахах — размытие движения
  float sb = sc * mix(.40, .70, smoothstep(.05, .95, uMo));
  if (uMo > .02 && length(dp) < .70 * sb) {
    float camZ = 2.4;
    float pitch = .30 + .10 * sin(wt0 - .6) * uFp;
    vec3 Ol = rotX(rotZ(vec3(0., 0., camZ), ang), pitch);
    vec3 Dl = rotX(rotZ(normalize(vec3(dp / sb, -camZ)), ang), pitch);
    vec3 Ll = rotX(rotZ(Lw, ang), pitch);
    float phiOpen = mix(1.45, .22, smoothstep(.25, .95, uMo));
    vec4 bf = vec4(0.);
    float ns = uFp > .05 ? 3. : 1.;
    for (int k = 0; k < 3; k++) { if (float(k) < ns) bf += butterfly(Ol, Dl, uT - float(k) * .012, phiOpen, Ll); }
    bf /= ns;
    float xg = uLf * 1.35 - length(dp / sb) * 1.55 - .16 * noise(dp * 9. + uT * .3);
    float band = smoothstep(0., .04, xg) * (1. - smoothstep(.04, .2, xg));
    float a0 = bf.a;
    bf *= smoothstep(0., .16, xg);
    acc.rgb = bf.rgb + acc.rgb * (1. - bf.a);
    acc.a = bf.a + acc.a * (1. - bf.a);
    acc.rgb += hot(.55) * band * a0 * 1.0;
  }

  // искры вокруг и золотая пыль за бабочкой
  vec3 spk = vec3(0.);
  float amb = (.9 * uVn + .6 * lm) * (1. - smoothstep(0., .25, uFl)) * appear;
  if (amb > .01) {
    for (int i = 0; i < 24; i++) {
      float fi = float(i);
      float h1 = hash11(fi * 1.7 + .3), h2 = hash11(fi * 3.1 + 5.1), h3 = hash11(fi * 7.7 + 2.2);
      float ph = fract(uT * (.10 + .16 * h1) + h2);
      vec2 spp = pos + vec2((h1 - .5) * .95, -.12 + ph * (.45 + .4 * h3)) + .03 * vec2(sin(uT * 2. + fi), cos(uT * 2.4 + fi * 1.3));
      vec2 dd = p - spp;
      float tw = .55 + .45 * sin(uT * 9. + fi * 4.);
      spk += mix(gcol, vec3(1., .95, .7), h3) * exp(-dot(dd, dd) / (.00006 + .00008 * h2)) * tw * ph * (1. - ph) * 4. * amb;
    }
  }
  if (uFl > .002) {
    for (int j = 1; j <= 18; j++) {
      float fj = float(j);
      float u2 = uFl - fj * .024;
      float ok = step(0., u2);
      vec2 tp = flyPos(max(u2, 0.), top) + vec2(.07 * sin(fj * 2.7 + uT * 4.), .04 * cos(fj * 1.9 + uT * 3.) - .008 * fj + .06 * uFp);
      vec2 dd = p - tp;
      spk += mix(gcol, vec3(1., .95, .7), .45) * exp(-dot(dd, dd) / (.0001 + .00001 * fj)) * (1. - fj / 19.) * ok;
    }
  }
  acc.rgb += spk;

  vec3 col = clamp(acc.rgb, 0., 1.);
  float a = clamp(max(acc.a, max(col.r, max(col.g, col.b))), 0., 1.);
  gl_FragColor = vec4(min(col, vec3(a)), a);
}`;
  function createGeGL(W, H, dpr) {
    const cv = document.createElement('canvas');
    cv.className = 'jg-cr-gl'; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) return null;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, SWIRL_VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, GE_FS)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'aPos'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = {};
    ['uRes', 'uT', 'uSt', 'uCr', 'uVn', 'uMo', 'uLf', 'uFp', 'uFl', 'uFh'].forEach((n) => { U[n] = gl.getUniformLocation(pr, n); });
    gl.uniform2f(U.uRes, cv.width, cv.height);
    gl.viewport(0, 0, cv.width, cv.height); gl.clearColor(0, 0, 0, 0);
    return {
      cv,
      draw(p) {
        gl.uniform1f(U.uT, p.time); gl.uniform1f(U.uSt, p.st); gl.uniform1f(U.uCr, p.cr); gl.uniform1f(U.uVn, p.vn); gl.uniform1f(U.uMo, p.mo);
        gl.uniform1f(U.uLf, p.lf); gl.uniform1f(U.uFp, p.fp); gl.uniform1f(U.uFl, p.fl); gl.uniform1f(U.uFh, p.fh);
        gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES, 0, 3);
      },
      dispose() { const x = gl.getExtension('WEBGL_lose_context'); if (x) x.loseContext(); },
    };
  }
  // синтезированные звуки: тёплый аккорд на надписи, глухой стук камня, щелчки трещин, нарастающий «пульс жизни», взмахи, звон на вылете
  async function goldExperienceReveal(dlg, reveal, snd, st) {
    const W = window.innerWidth, H = window.innerHeight, dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(2.4e6 / (window.innerWidth * window.innerHeight))); // родное разрешение экрана (до 2×) для чёткости, но не больше ~2.4 Мпикс ради скорости
    const T = GE_T;
    const fx = document.createElement('div');
    fx.className = 'jg-fx jg-ge';
    dlg.appendChild(fx);
    ui.fx = true; // с этого момента нажатия не проходят (слой .jg-fx их перехватывает)
    let dead = false, revealed = false, gl = null, em = null, bgOff = false;
    const timers = [];
    const doReveal = (d) => { if (revealed) return; revealed = true; reveal(d); };
    const bufName = await snd.geName, bufLife = await snd.geLife;
    try { gl = createGeGL(W, H, dpr); } catch (e) { console.warn('[JoJo Stands] Gold Experience: WebGL недоступен, запасной вариант', e); if (gl) gl.dispose(); gl = null; }
    const ease = { out: (u) => 1 - Math.pow(1 - u, 3), smooth: (a, b, u) => { const x = Math.min(1, Math.max(0, (u - a) / (b - a))); return x * x * (3 - 2 * x); } };
    const run = (ms, fn) => new Promise((res) => {
      const t0 = performance.now();
      const f = (now) => { const u = Math.min(1, (now - t0) / ms); fn(u); if (u < 1 && !dead) requestAnimationFrame(f); else res(); };
      requestAnimationFrame(f);
    });
    const P = { st: 0, cr: 0, vn: 0, mo: 0, lf: 0, fp: 0, fl: 0, fh: 0 };
    const tS = performance.now();
    const emFrame = () => { // запасной вариант без WebGL: эмодзи камень → бабочка
      if (!em) return;
      const g = Math.max(P.cr * 0.4, P.vn), t = (performance.now() - tS) / 1000;
      if (P.mo > 0.5 && em.textContent !== '🦋') em.textContent = '🦋';
      const sx = 1 - 0.55 * P.fp * (0.5 + 0.5 * Math.sin(t * 30)), s = (0.85 + 0.15 * P.st) * (1 - 0.3 * P.fl) * (1 + 0.25 * P.fh);
      em.style.opacity = P.st;
      em.style.filter = `drop-shadow(0 0 ${6 + 26 * g}px rgba(251,191,36,${0.4 + 0.5 * g})) brightness(${1 + 0.3 * g})`;
      em.style.transform = `translate(-50%,calc(-50% - ${P.fl * H * 0.75}px)) rotate(${Math.sin(P.fl * 12) * 10 * P.fl}deg) scale(${s * (P.mo > 0.5 ? sx : 1)},${s})`;
    };
    const loop = () => { if (dead) return; if (gl) gl.draw({ ...P, time: (performance.now() - tS) / 1000 }); else emFrame(); requestAnimationFrame(loop); };
    try {
      // 0) надпись: золотистое затемнение, голос (если есть файл) или синтезированный аккорд; нажатия заблокированы
      fx.style.transition = 'background-color .5s, backdrop-filter .5s, -webkit-backdrop-filter .5s';
      fx.style.background = 'rgba(40,26,0,.5)'; fx.style.backdropFilter = fx.style.webkitBackdropFilter = 'blur(5px)';
      const a = audio();
      let dT = T.title;
      if (a && bufName) {
        const [ns, ne] = audibleSpan(bufName);
        dT = Math.max(T.title, (ne - ns) * 1000 + 300);
        const src = a.createBufferSource(), g = a.createGain(), t = a.currentTime;
        src.buffer = bufName; g.gain.setValueAtTime(1.8, t); g.gain.setValueAtTime(1.8, t + (ne - ns) - 0.04); g.gain.linearRampToValueAtTime(0.0001, t + (ne - ns));
        src.connect(g); g.connect(a.destination); src.start(t, ns, ne - ns);
      }
      const ttl = titleCard(fx, 'ゴールド・エクスペリエンス', 'GOLD EXPERIENCE', 'ge');
      ttl.hide(dT - 250);
      await sleep(dT);
      fx.style.background = 'rgba(8,5,0,.66)'; fx.style.backdropFilter = fx.style.webkitBackdropFilter = 'blur(7px)';
      if (gl) { fx.appendChild(gl.cv); } else { em = document.createElement('div'); em.className = 'jg-ge-em'; em.textContent = '🪨'; em.style.opacity = 0; fx.appendChild(em); }
      requestAnimationFrame(loop);
      // 1) камень появляется в центре — обычный, серый
      await run(T.stone, (u) => { P.st = ease.out(u); });
      await sleep(T.hold);
      // 2) золотые трещины бегут по поверхности от точки удара
      await run(T.crack, (u) => { P.cr = u; });
      // 3) под коркой пробуждаются светящиеся органические узоры: текут, пульсируют, вокруг поднимаются искры
      await run(T.vein, (u) => { P.vn = ease.smooth(0, 1, u); });
      // 4) форма течёт и превращается в бабочку; шкура камня сменяется крыльями волной от центра; на середине — вспышка
      if (a && bufLife) { // звук Life на превращении камня в бабочку (файл тихий — усиливаем)
        const s = a.createBufferSource(), g = a.createGain(); s.buffer = bufLife; g.gain.value = 3; s.connect(g); g.connect(a.destination); s.start();
      }
      await run(T.morph, (u) => { P.mo = u; P.lf = ease.smooth(0.15, 0.85, u); P.fh = Math.exp(-Math.pow((u - 0.62) / 0.13, 2)); });
      P.mo = 1; P.lf = 1; P.fh = 0;
      // 5) бабочка оживает: взмахи набирают силу, парит
      await run(T.live, (u) => { P.fp = ease.smooth(0, 0.8, u); });
      // 6) улетает вверх, оставляя золотую пыль; на середине полёта затемнение уходит, проявляется результат
      await run(T.fly, (u) => {
        P.fp = 1; P.fl = u;
        if (u > 0.5 && !bgOff) {
          bgOff = true;
          fx.style.transition = 'background-color .9s, backdrop-filter .9s, -webkit-backdrop-filter .9s';
          fx.style.background = ''; fx.style.backdropFilter = fx.style.webkitBackdropFilter = '';
          doReveal(0.1);
        }
      });
      await sleep(T.tail);
    } finally {
      dead = true;
      timers.forEach((t) => { clearTimeout(t); clearInterval(t); });
      if (gl) gl.dispose();
      fx.remove(); ui.fx = false;
      doReveal(0.2); // если что-то пошло не так — результат всё равно покажется
    }
  }
  // ============================ Metallica ============================
  // Идея: надпись как у D4C → экран кажется обычным, но проступают металлические отражения и серебристые нити под поверхностью;
  // микрочастицы собираются в узор «схемы кровообращения», который натягивает «ткань» экрана (рельеф с освещением, как покрывало на предметах);
  // по щелчку сеть мгновенно прорастает иглами и лезвиями, изображение искажается магнитным полем; на пике окно подменяется результатом.
  // Всё считает один фрагментный шейдер MT_FS; сеть и лезвия строятся на CPU один раз (во время надписи) и грузятся текстурами.
  const MT_T = {
    vol: 2.2,    // громкость голоса надписи (исходник тихий: пик −8 дБ; ×2.2 даёт пик ≈ −1 дБ, больше — будет клиппинг)
    title: 2000,  // надпись (если есть голос sounds/metallica.mp3 — по его длине, но не короче)
    snap: 5500,   // мс от начала эффекта: сеть → иглы и лезвия (до этого: отражения 0–2.6 с, сеть и частицы 1.1–5.1 с, натяжение 4.85–5.5 с)
    swap: 6900,   // пик искажения: окно подменяется результатом
    end: 8300,    // конец (после swap: вспышка спадает, лезвия рассыпаются)
  };
  function mtRng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const MT_FS = `
precision highp float;
uniform sampler2D uScene;
uniform sampler2D uNet;
uniform sampler2D uBlade;
uniform vec2 uRes;
uniform vec2 uCss;
uniform float uT, uA, uB, uG, uK, uBl, uD, uF, uR, uX, uS;

float h11(float p){p=fract(p*.1031);p*=p+33.33;p*=p+p;return fract(p);}
float h21(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
vec2 h22(vec2 p){vec3 q=fract(vec3(p.xyx)*vec3(.1031,.103,.0973));q+=dot(q,q.yzx+33.33);return fract((q.xx+q.yz)*q.zy);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1.,0.)),f.x),mix(h21(i+vec2(0.,1.)),h21(i+vec2(1.,1.)),f.x),f.y);}
vec4 SC(vec2 u){u=1.-abs(1.-abs(u));return texture2D(uScene,u);}
float lum(vec4 c){return dot(c.rgb,vec3(.3,.59,.11))+c.a*.25;}

// два полюса магнита (медленно вращаются вокруг центра)
vec2 gP1, gP2, fdir; float fpot, fpsi;
void field(vec2 P){
  vec2 c=uCss*.5; float w=uT*.55;
  vec2 ax=vec2(sin(w)*uCss.x*.30,cos(w)*uCss.y*.22);
  gP1=c+ax; gP2=c-ax;
  vec2 a=P-gP1, b=P-gP2;
  float la=dot(a,a)+60., lb=dot(b,b)+60.;
  vec2 E=a/la-b/lb;
  fdir=E/(length(E)+1e-5);
  fpot=.5*log(la)-.5*log(lb);
  fpsi=atan(a.y,a.x)-atan(b.y,b.x);
}

// видимость лезвия в точке: покрытие × рост от основания к острию × рассыпание
float bladeVis(vec4 b, vec2 P){
  if(b.a<.004) return 0.;
  float al=b.g, id=h11(floor(b.b*255.+.5)*1.37+.7);
  float grow=clamp((uBl-id*.5)/.30,0.,1.);
  grow=1.-pow(1.-grow,3.);
  float v=mix(1.-smoothstep(grow-.05,grow,al),1.,step(.999,grow));
  float q=vn(P*.28)*.5+h21(floor(P*.8))*.15+(1.-al)*.35;
  float thr=uX*1.15-.05;
  float alive=smoothstep(thr,thr+.04,q);
  return b.a*v*alive;
}

// металлическая пыль: частицы слоя тянутся по прямым к ближайшей линии сети (обратное отображение — без поиска по экрану)
float pLayer(vec2 P, vec2 gdir, float dd, float k, float cs, float seed, float scat){
  vec2 H=P+gdir*dd*(k/(1.-k));
  vec2 cid=floor(H/cs);
  float acc=0.;
  float srcM=1.-smoothstep(36.,50.,dd/(1.-k));
  if(srcM<.01) return 0.;
  for(int j=-1;j<=1;j++){
    for(int i=-1;i<=1;i++){
      vec2 c=cid+vec2(float(i),float(j));
      float lf=h21(c*1.73+seed+3.1);
      if(lf>.26) continue;
      vec2 r2=h22(c+seed);
      vec2 pos=(c+r2)*cs;
      vec2 dr=vec2(sin(uT*(.5+lf*1.5)+lf*40.),cos(uT*(.4+lf*1.7)+lf*23.))*cs*.2*(1.-k);
      vec2 sc=(h22(c*2.1+seed+9.)-.5)*2.*cs*.9*scat;
      vec2 off=pos+dr+sc-H;
      float al=dot(off,gdir);
      vec2 cur=(off-al*gdir)+gdir*al*(1.-k);
      float rad=cs*(.11+.07*h21(c+9.7));
      float tw=.3+.7*pow(.5+.5*sin(uT*(1.5+lf*6.)+lf*50.),5.);
      float ap=smoothstep(lf*.5+.12,lf*.5+.6,uA);
      acc+=exp(-dot(cur,cur)/(rad*rad))*tw*ap*(1.-scat)*srcM;
    }
  }
  return acc;
}

vec3 envMap(vec3 r, float id){
  float y=r.y*.5+.5;
  vec3 base=mix(vec3(.025,.032,.05),vec3(.60,.69,.82),smoothstep(.12,.95,y));
  float hor=smoothstep(.07,.0,abs(r.y-.1));
  float band=pow(.5+.5*sin(r.x*7.+r.y*3.+id*6.),8.);
  float kl=pow(max(dot(r,normalize(vec3(-.5,.55,.68))),0.),60.);
  return base+vec3(.9,.95,1.)*band*.85+vec3(1.,.97,.9)*hor*.55+vec3(1.)*kl*1.5;
}

void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  vec2 P=uv*uCss;
  field(P);
  float vis=1.-smoothstep(.05,.7,uX);

  // ---------- сеть (рельеф «ткани»)
  vec2 e=vec2(2.4)/uCss;
  vec4 n0=texture2D(uNet,uv);
  vec4 nxp=texture2D(uNet,uv+vec2(e.x,0.)), nxm=texture2D(uNet,uv-vec2(e.x,0.));
  vec4 nyp=texture2D(uNet,uv+vec2(0.,e.y)), nym=texture2D(uNet,uv-vec2(0.,e.y));
  float dN=n0.r*16., dF=n0.g*56.;
  float d=mix(dN,dF,smoothstep(13.,16.,dN));
  vec2 gN=vec2(nxp.r-nxm.r,nyp.r-nym.r)*16.;
  vec2 gF=vec2(nxp.g-nxm.g,nyp.g-nym.g)*56.;
  vec2 gd=mix(gN,gF,smoothstep(12.,15.,dN));
  vec2 gdir=gd/(length(gd)+1e-4);
  float tt=n0.b, rr=1.3+n0.a*4.6;
  float front=uB*1.12;
  float gv=smoothstep(0.,.09,front-tt)*vis;
  float fg=exp(-pow((front-tt-.015)/.03,2.))*vis*(1.-smoothstep(.9,1.05,uB))*exp(-d/(rr*.9));

  float x=d/(rr*2.2);
  float h1=pow(1.+x*x,-1.5), dh1=-3.*x*pow(1.+x*x,-2.5);
  float h2=exp(-x*x*3.), dh2=-6.*x*h2;
  float dh=(.93*dh1+.07*dh2)/(rr*2.2);
  float pf=sin((tt*16.-uT*1.9)*6.2832);
  float pulse=.5+.5*smoothstep(.2,1.,pf);
  float H0=rr*1.9*(1.+uK*.45+.18*pulse*gv+.7*fg);
  float wob=1.+uK*.18*sin(uT*58.+tt*45.);
  float slope=dh*H0*gv*wob;
  vec2 nxy=-slope*gdir;
  vec3 N=normalize(vec3(nxy,1.));

  // ---------- магнитное искажение
  float cr=length((P-uCss*.5)/uCss.y);
  float ring=exp(-pow((cr-uR*1.5)/.07,2.))*(1.-uR)*step(.001,uR);
  vec2 rdir=normalize(P-uCss*.5+vec2(1e-3));
  float rip=sin(fpot*8.-uT*14.);
  float amp=uD*(7.+11.*uD);
  vec2 dM=fdir*rip*amp+vec2(-fdir.y,fdir.x)*sin(fpot*4.+uT*6.+fpsi*2.)*amp*.35;
  float row=floor(P.y/11.), tk=floor(uT*9.);
  float rh=h11(row+tk*17.);
  dM.x+=step(.86,rh)*(rh-.86)*260.*uD*step(.5,h11(tk+row*.3));
  dM+=rdir*ring*18.;
  vec2 dRel=nxy*(2.4+rr*.7);
  vec2 dTot=dM+dRel;
  vec2 cb=fdir*3.2*uD/uCss;
  vec2 su=uv+dTot/uCss;
  vec4 sg=SC(su);
  float sr=SC(su+cb).r, sb=SC(su-cb).b;
  vec3 col=vec3(sr,sg.g,sb)*uS;
  float al=sg.a*uS;

  // ---------- едва заметные металлические отражения (фаза A)
  vec3 add=vec3(0.);
  if(uA>.001){
    vec2 dir=vec2(.8,.6), prp=vec2(-.6,.8);
    float bnd=pow(.5+.5*sin(dot(P/uCss.y,dir)*5.-uT*.7),5.);
    float ed=length(vec2(lum(SC(su+vec2(1.5,0.)/uCss))-lum(sg),lum(SC(su+vec2(0.,1.5)/uCss))-lum(sg)));
    add+=vec3(.82,.9,1.)*ed*bnd*uA*1.15*uS;
    float sk=vn(vec2(dot(P,dir)*.012,dot(P,prp)*.9));
    float b2=pow(.5+.5*sin(dot(P/uCss.y,dir)*2.6-uT*.4+1.),3.);
    add+=vec3(.7,.8,.95)*b2*(.3+.7*sk)*uA*.075;
    // серебристые нити, плывущие под поверхностью
    vec2 wq=P*.012;
    wq+=vec2(vn(wq*2.1+uT*.05),vn(wq*2.1+7.3-uT*.04))*1.6;
    float ln=abs(fract(wq.x*3.+wq.y*1.3)-.5);
    float thin=1.-smoothstep(0.,.05,ln);
    float msk=smoothstep(.45,.8,vn(P*.006+vec2(uT*.06,0.)));
    add+=vec3(.78,.86,1.)*thin*msk*uA*.2*(1.-smoothstep(.15,.6,uB))*(.5+.5*sin(uT*.8+P.x*.01));
    float lm=dot(col,vec3(.3,.59,.11));
    col=mix(col,vec3(lm)*vec3(.93,.98,1.06),uA*.22*uS);
    col*=1.-.1*uA*uS*length((uv-.5)*vec2(1.,1.2));
  }

  // ---------- освещённый рельеф
  vec3 L=normalize(vec3(-.5,.55,.68));
  float sh=(dot(N,L)-L.z)*1.35;
  float dk=clamp(-sh,0.,.4), lt=clamp(sh,0.,.42);
  col*=1.-dk; al+=(1.-al)*dk*.5;
  vec3 ag=vec3(.74,.82,.95);
  add+=ag*lt*.3;
  vec3 Hh=normalize(L+vec3(0.,0.,1.));
  add+=vec3(.9,.94,1.)*pow(max(dot(N,Hh),0.),20.)*smoothstep(.02,.18,abs(slope))*.22*gv;

  // ---------- частицы
  float pk=uG*smoothstep(-.05,.2,front+.18-tt)*(1.-smoothstep(40.,56.,dF))*(1.-uX);
  pk=min(pk,.82);
  float pa=pLayer(P,gdir,dF,pk,6.5,1.7,uX)+.8*pLayer(P,gdir,dF,pk,10.5,8.3,uX);
  add+=vec3(.86,.92,1.)*min(pa,1.3)*.5*(1.-.7*uBl)*(1.-.85*pk);

  // ---------- силовые линии (железные опилки)
  if(uD>.001){
    float ln2=abs(fract(fpsi*16./6.2832)-.5)*2.;
    float lm2=1.-smoothstep(0.,.07,ln2);
    float dash=.45+.55*vn(vec2(fpot*26.-uT*3.,fpsi*16.));
    add+=vec3(.8,.9,1.)*lm2*dash*uD*.38;
  }

  col+=add; al=max(al,max(add.r,max(add.g,add.b)));
  col=min(col,vec3(1.));

  // ---------- лезвия и иглы
  vec2 uvB=uv+dM*.45/uCss;
  if(uBl>.001){
    vec4 bl=texture2D(uBlade,uvB);
    float cov=bladeVis(bl,P);
    float shd=.5*(bladeVis(texture2D(uBlade,uvB+vec2(-4.,7.)/uCss),P)+bladeVis(texture2D(uBlade,uvB+vec2(-8.,13.)/uCss),P));
    float sd=shd*(1.-cov)*.55;
    col*=1.-sd; al+=(1.-al)*sd*.6;
    if(cov>.003){
      float a=bl.r*2.-1., aa=bl.g;
      float ang=bl.b*6.2831853;
      float id=h11(floor(bl.b*255.+.5)*1.37+.7);
      float fa=abs(a);
      float tl=(a/(fa+.05))*mix(.75,1.5,smoothstep(.78,1.,fa));
      vec2 pr=vec2(-sin(ang),-cos(ang));
      vec3 nb=normalize(vec3(pr*tl,1.));
      vec3 R=reflect(vec3(0.,0.,-1.),nb);
      vec3 bc=envMap(R,id)*vec3(.92,.96,1.04);
      bc+=vec3(.9,.95,1.)*pow(max(sin((aa*2.2-uT*5.+id*9.)*3.1416),0.),14.)*.5;
      bc=mix(bc,bc*.3,smoothstep(.88,1.,fa)*.75);
      bc+=vec3(1.,.97,.9)*exp(-pow((1.-aa)/.05,2.))*.5;
      float edgeG=exp(-pow((fa-.0)/.08,2.))*.18;
      bc+=edgeG;
      float ex=exp(-pow((uX*1.15-.05-(vn(P*.28)*.5+h21(floor(P*.8))*.15+(1.-aa)*.35))/.05,2.))*step(.001,uX);
      bc+=vec3(1.,.85,.6)*ex*1.2;
      col=col*(1.-cov)+min(bc,vec3(1.5))*cov;
      al=al*(1.-cov)+cov;
    }
  }

  // ---------- вспышка и волна магнитного импульса
  float fl=uF*(.65+.35*vn(P*.02+uT));
  col+=vec3(.82,.9,1.)*fl*1.1;
  col+=vec3(.7,.85,1.)*ring*.5;
  al=max(al,max(fl,ring*.5));
  col=clamp(col,0.,1.);
  al=clamp(max(al,max(col.r,max(col.g,col.b))),0.,1.);
  gl_FragColor=vec4(col,al);
}`;

  // сеть «кровообращения»: центр — «сердце», от него артерии с ветвлением; ветки не пересекаются (упираются в чужую ветку и замыкаются)
  function mtGenNet(W, H, cx, cy, rnd) {
    const segs = [], branches = [], nodes = [], DS = 5, cell = 20, M = 14;
    const gw = Math.ceil(W / cell) + 4, gh = Math.ceil(H / cell) + 4, occ = new Int32Array(gw * gh);
    const cellAt = (x, y) => { const i = Math.floor(x / cell) + 2, j = Math.floor(y / cell) + 2; return (i < 0 || j < 0 || i >= gw || j >= gh) ? -1 : j * gw + i; };
    const RC = (r) => r; // класс толщины 0..1 → радиус в шейдере 1.3 + 4.6·класс
    const queue = [], trunks = 6, span = Math.max(W, H);
    for (let k = 0; k < trunks; k++) queue.push({ x: cx, y: cy, ang: (k / trunks) * Math.PI * 2 + (rnd() - 0.5) * 0.5, len: span * (0.5 + rnd() * 0.35), depth: 0, pl: 0, rad: 1, parent: -1 });
    let nid = 0;
    while (queue.length && segs.length < 2600) {
      const b = queue.shift(), id = nid++;
      const pts = [{ x: b.x, y: b.y, t: b.pl, r: b.rad }];
      let x = b.x, y = b.y, ang = b.ang0 !== undefined ? b.ang0 : b.ang, av = 0, pl = b.pl, run = 0, nextBr = 30 + rnd() * 30;
      const steps = Math.floor(b.len / DS), wander = 0.05 + (1 - b.rad) * 0.10, bias = (rnd() - 0.5) * 0.025;
      for (let s = 0; s < steps; s++) {
        av = av * 0.88 + (rnd() - 0.5) * wander * 0.42;
        ang += av + bias;
        if (b.ang0 !== undefined && s < 10) ang += (b.ang - ang) * 0.22; // ветка плавно отходит от родителя, а не ломается под углом
        const nx = x + Math.cos(ang) * DS, ny = y + Math.sin(ang) * DS;
        if (nx < -M || ny < -M || nx > W + M || ny > H + M) break;
        const ci = cellAt(nx, ny);
        let hit = false;
        if (ci >= 0) { const o = occ[ci]; if (o && o - 1 !== id && o - 1 !== b.parent && s > 2) hit = true; else if (!o) occ[ci] = id + 1; }
        pl += DS; x = nx; y = ny;
        pts.push({ x, y, t: pl, r: b.rad * (1 - 0.3 * s / Math.max(1, steps)) });
        if (hit) break;
        run += DS;
        if (run >= nextBr && b.depth < 5 && b.rad > 0.12) {
          run = 0; nextBr = (34 + rnd() * 50) * (0.7 + b.rad * 0.9);
          const nch = rnd() < 0.22 ? 2 : 1;
          for (let q = 0; q < nch; q++) {
            const side = nch === 2 ? (q ? 1 : -1) : (rnd() < 0.5 ? -1 : 1), sp = [0.5, 0.75, 1.0, 1.25][Math.floor(rnd() * 4)] + (rnd() - 0.5) * 0.2;
            queue.push({ x, y, ang0: ang, ang: ang + side * sp, len: Math.max(30, (steps - s) * DS * (0.45 + rnd() * 0.35)) + 20, depth: b.depth + 1, pl, rad: b.rad * (0.55 + rnd() * 0.2), parent: id });
          }
          nodes.push({ x, y, t: pl, r: Math.min(1, b.rad * 1.08 + 0.04) });
        }
      }
      if (pts.length < 3) continue;
      for (let pass = 0; pass < 4; pass++) { const sx = pts.map((p) => p.x), sy = pts.map((p) => p.y); for (let i = 1; i < pts.length - 1; i++) { pts[i].x = sx[i - 1] * 0.25 + sx[i] * 0.5 + sx[i + 1] * 0.25; pts[i].y = sy[i - 1] * 0.25 + sy[i] * 0.5 + sy[i + 1] * 0.25; } }
      for (let i = 1; i < pts.length; i++) segs.push({ x0: pts[i - 1].x, y0: pts[i - 1].y, x1: pts[i].x, y1: pts[i].y, t0: pts[i - 1].t, t1: pts[i].t, r0: RC(pts[i - 1].r), r1: RC(pts[i].r) });
      const e = pts[pts.length - 1];
      nodes.push({ x: e.x, y: e.y, t: e.t, r: Math.min(1, e.r * 1.05 + 0.03) });
      branches.push({ pts, depth: b.depth, rad0: b.rad });
      // «вена» рядом с крупными артериями: параллельная тонкая линия
      if (b.depth <= 1 && b.rad > 0.5) {
        const sd = rnd() < 0.5 ? -1 : 1, off = [];
        for (let i = 0; i < pts.length; i++) {
          const a0 = pts[Math.max(0, i - 1)], a1 = pts[Math.min(pts.length - 1, i + 1)], tx = a1.x - a0.x, ty = a1.y - a0.y, tl = Math.hypot(tx, ty) || 1, d = 4.6 * pts[i].r + 8;
          off.push({ x: pts[i].x - ty / tl * d * sd, y: pts[i].y + tx / tl * d * sd, t: pts[i].t + 1.5, r: pts[i].r * 0.42 });
        }
        for (let i = 1; i < off.length; i++) segs.push({ x0: off[i - 1].x, y0: off[i - 1].y, x1: off[i].x, y1: off[i].y, t0: off[i - 1].t, t1: off[i].t, r0: off[i - 1].r, r1: off[i].r });
      }
    }
    let maxT = 1; for (const sg of segs) maxT = Math.max(maxT, sg.t0, sg.t1);
    for (const sg of segs) { sg.t0 /= maxT; sg.t1 /= maxT; }
    for (const n of nodes) { n.t /= maxT; segs.push({ x0: n.x, y0: n.y, x1: n.x, y1: n.y, t0: n.t, t1: n.t, r0: n.r, r1: n.r }); }
    return { segs, branches, nodes, maxT };
  }
  // растр сети: R — расстояние до ближайшей линии (0..16 px), G — то же до 56 px (дальнее поле), B — порядок роста, A — толщина
  async function mtRasterNet(W, H, segs) {
    const ns = Math.min(1, Math.sqrt(300000 / (W * H)));
    const nw = Math.max(8, Math.round(W * ns)), nh = Math.max(8, Math.round(H * ns)), kx = nw / W, ky = nh / H, N = nw * nh;
    const D = new Float32Array(N).fill(9999), T = new Float32Array(N), R = new Float32Array(N), REACH = 18;
    for (let si = 0; si < segs.length; si++) {
      const s = segs[si];
      const i0 = Math.max(0, Math.floor((Math.min(s.x0, s.x1) - REACH) * kx - 0.5)), i1 = Math.min(nw - 1, Math.ceil((Math.max(s.x0, s.x1) + REACH) * kx - 0.5));
      const j0 = Math.max(0, Math.floor((Math.min(s.y0, s.y1) - REACH) * ky - 0.5)), j1 = Math.min(nh - 1, Math.ceil((Math.max(s.y0, s.y1) + REACH) * ky - 0.5));
      const vx = s.x1 - s.x0, vy = s.y1 - s.y0, vv = vx * vx + vy * vy || 1e-6;
      for (let j = j0; j <= j1; j++) {
        const py = (j + 0.5) / ky, row = j * nw;
        for (let i = i0; i <= i1; i++) {
          const px = (i + 0.5) / kx;
          let u = ((px - s.x0) * vx + (py - s.y0) * vy) / vv; u = u < 0 ? 0 : u > 1 ? 1 : u;
          const dx = px - (s.x0 + vx * u), dy = py - (s.y0 + vy * u), d2 = dx * dx + dy * dy, idx = row + i;
          if (d2 < D[idx]) { D[idx] = d2; T[idx] = s.t0 + (s.t1 - s.t0) * u; R[idx] = s.r0 + (s.r1 - s.r0) * u; }
        }
      }
      if (si % 500 === 499) await sleep(0);
    }
    for (let i = 0; i < N; i++) D[i] = D[i] >= 9999 ? 9999 : Math.sqrt(D[i]);
    // дальнее поле: два прохода «фаски» (погрешность до ~8% — нужна только для направления притяжения частиц)
    const sx = 1 / kx, sy = 1 / ky, sdg = Math.hypot(sx, sy);
    const relax = (i, k, c) => { const v = D[k] + c; if (v < D[i]) { D[i] = v; T[i] = T[k]; R[i] = R[k]; } };
    for (let j = 0; j < nh; j++) for (let i = 0; i < nw; i++) {
      const p = j * nw + i;
      if (i > 0) relax(p, p - 1, sx); if (j > 0) { relax(p, p - nw, sy); if (i > 0) relax(p, p - nw - 1, sdg); if (i < nw - 1) relax(p, p - nw + 1, sdg); }
    }
    for (let j = nh - 1; j >= 0; j--) for (let i = nw - 1; i >= 0; i--) {
      const p = j * nw + i;
      if (i < nw - 1) relax(p, p + 1, sx); if (j < nh - 1) { relax(p, p + nw, sy); if (i < nw - 1) relax(p, p + nw + 1, sdg); if (i > 0) relax(p, p + nw - 1, sdg); }
    }
    const data = new Uint8Array(N * 4), cl = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);
    for (let i = 0; i < N; i++) {
      const d = D[i], o = i * 4;
      data[o] = cl(Math.round(d / 16 * 255)); data[o + 1] = cl(Math.round(d / 56 * 255)); data[o + 2] = cl(Math.round(T[i] * 255)); data[o + 3] = cl(Math.round(R[i] * 255));
    }
    return { data, w: nw, h: nh };
  }
  // иглы и лезвия вдоль сети: R — поперечная координата, G — вдоль (0 основание … 1 остриё), B — угол, A — покрытие
  function mtMakeBlades(W, H, branches, bs, rnd) {
    const bw = Math.round(W * bs), bh = Math.round(H * bs), buf = new Uint8Array(bw * bh * 4), list = [];
    const add = (x, y, ang, L, w0, kind) => list.push({ x, y, ang, L, w0, kind });
    for (const br of branches) {
      const pts = br.pts; let acc = rnd() * 12;
      for (let i = 1; i < pts.length; i++) {
        const p = pts[i], q = pts[i - 1]; acc += Math.hypot(p.x - q.x, p.y - q.y);
        const gap = 60 - 30 * p.r + rnd() * 50;
        if (br.depth > 3) continue;
        if (acc < gap) continue; acc = 0;
        const tan = Math.atan2(p.y - q.y, p.x - q.x), ang = tan + (rnd() < 0.5 ? -1 : 1) * (Math.PI / 2 + (rnd() - 0.5) * 1.1);
        if (rnd() < 0.55) add(p.x, p.y, ang, 22 + rnd() * (34 + 60 * p.r), 0.9 + rnd() * 0.7, 0);
        else add(p.x, p.y, ang, 28 + rnd() * (38 + 70 * p.r), 2.2 + p.r * 3.2 + rnd() * 1.4, 1);
      }
      if (pts.length > 2) {
        const e = pts[pts.length - 1], e0 = pts[pts.length - 2], ta = Math.atan2(e.y - e0.y, e.x - e0.x);
        add(e.x, e.y, ta + (rnd() - 0.5) * 0.2, 46 + rnd() * (44 + 80 * br.rad0), 2.8 + br.rad0 * 3.4, 1);
        const nn = 2;
        for (let k = 0; k < nn; k++) add(e.x, e.y, ta + (rnd() - 0.5) * 1.7, 20 + rnd() * 50, 0.9 + rnd() * 0.5, 0);
      }
    }
    while (list.length > 420) { const k = Math.floor(rnd() * list.length); if (list[k].L < 55 || rnd() < 0.2) list.splice(k, 1); }
    list.sort((a, b) => a.L - b.L);
    const sstep = (a, b, x) => { const u = Math.min(1, Math.max(0, (x - a) / (b - a))); return u * u * (3 - 2 * u); };
    for (const b of list) {
      const a01 = (((b.ang / (Math.PI * 2)) % 1) + 1) % 1, Bv = Math.round(a01 * 255), an = Bv / 255 * Math.PI * 2;
      const ux = Math.cos(an), uy = Math.sin(an), L = b.L, ex = b.x + ux * L, ey = b.y + uy * L, pad = b.w0 + 1.5;
      const i0 = Math.max(0, Math.floor((Math.min(b.x, ex) - pad) * bs)), i1 = Math.min(bw - 1, Math.ceil((Math.max(b.x, ex) + pad) * bs));
      const j0 = Math.max(0, Math.floor((Math.min(b.y, ey) - pad) * bs)), j1 = Math.min(bh - 1, Math.ceil((Math.max(b.y, ey) + pad) * bs));
      const pw = b.kind ? 0.85 : 1.15;
      for (let j = j0; j <= j1; j++) {
        const py = (j + 0.5) / bs;
        for (let i = i0; i <= i1; i++) {
          const px = (i + 0.5) / bs, dx = px - b.x, dy = py - b.y, s = dx * ux + dy * uy;
          if (s < -0.6 || s > L) continue;
          const c = -dx * uy + dy * ux, xx = Math.max(0, s) / L;
          const hw = Math.max(0.05, b.w0 * (0.55 + 0.45 * sstep(0, 0.26, xx)) * Math.pow(1 - xx, pw));
          let cov = 0.5 + (hw - Math.abs(c)) * bs;
          if (cov <= 0) continue; if (cov > 1) cov = 1;
          if (s < 0) cov *= Math.max(0, 1 + s / 0.6);
          const o = (j * bw + i) * 4, A = Math.round(cov * 255);
          if (buf[o + 3] > A) continue;
          const r = Math.round((c / hw * 0.5 + 0.5) * 255);
          buf[o] = r < 0 ? 0 : r > 255 ? 255 : r; buf[o + 1] = Math.round(xx * 255); buf[o + 2] = Bv; buf[o + 3] = A;
        }
      }
    }
    return { data: buf, w: bw, h: bh, count: list.length };
  }
  function createMtGL(W, H, dpr) {
    const cv = document.createElement('canvas');
    cv.className = 'jg-cr-gl'; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) return null;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, SWIRL_VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, MT_FS)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'aPos'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const mk = (unit) => { const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]].forEach(([a, b]) => gl.texParameteri(gl.TEXTURE_2D, a, b)); return t; };
    const tScene = mk(0), tNet = mk(1), tBlade = mk(2);
    const U = {};
    ['uScene', 'uNet', 'uBlade', 'uRes', 'uCss', 'uT', 'uA', 'uB', 'uG', 'uK', 'uBl', 'uD', 'uF', 'uR', 'uX', 'uS'].forEach((n) => { U[n] = gl.getUniformLocation(pr, n); });
    gl.uniform1i(U.uScene, 0); gl.uniform1i(U.uNet, 1); gl.uniform1i(U.uBlade, 2);
    gl.uniform2f(U.uRes, cv.width, cv.height); gl.uniform2f(U.uCss, W, H);
    gl.viewport(0, 0, cv.width, cv.height); gl.clearColor(0, 0, 0, 0);
    const up = (unit, tex, w, h, data) => { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tex); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, data); };
    return {
      cv,
      setScene(img) { gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tScene); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img); },
      setNet(n) { up(1, tNet, n.w, n.h, n.data); },
      setBlade(b) { up(2, tBlade, b.w, b.h, b.data); },
      draw(p) {
        gl.uniform1f(U.uT, p.time);
        ['A', 'B', 'G', 'K', 'Bl', 'D', 'F', 'R', 'X', 'S'].forEach((k) => gl.uniform1f(U['u' + k], p[k.toLowerCase()]));
        gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES, 0, 3);
      },
      dispose() { const x = gl.getExtension('WEBGL_lose_context'); if (x) x.loseContext(); },
    };
  }
  async function metallicaReveal(dlg, reveal, snd, st) {
    const W = window.innerWidth, H = window.innerHeight, dpr = Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(1.4e6 / (W * H)));
    const modal = dlg.querySelector('.jg-modal'), T = MT_T;
    const fx = document.createElement('div');
    fx.className = 'jg-fx jg-mt';
    dlg.appendChild(fx);
    ui.fx = true; // с этого момента нажатия не проходят (слой .jg-fx их перехватывает)
    let dead = false, revealed = false, gl = null, swapped = false, snapped = false, fb = null;
    const doReveal = (d) => { if (revealed) return; revealed = true; reveal(d); };
    const bufName = await snd.mtName, bufSlice = await snd.slice;
    const sm = (a, b, x) => { const u = Math.min(1, Math.max(0, (x - a) / (b - a))); return u * u * (3 - 2 * u); };
    // подготовка идёт параллельно надписи: снимок окна, сеть, лезвия, текстуры
    const prepare = async () => {
      try {
        const shot = await captureModal(modal, W, H, dpr, false);
        shot.getContext('2d').getImageData(0, 0, 1, 1);
        const g = createMtGL(W, H, dpr);
        if (!g) throw new Error('нет WebGL');
        gl = g; gl.setScene(shot);
        await sleep(0);
        const rc = modal.getBoundingClientRect(), rnd = mtRng((Math.random() * 4294967295) >>> 0);
        const net = mtGenNet(W, H, rc.left + rc.width / 2, rc.top + rc.height * 0.46, rnd);
        await sleep(0);
        gl.setNet(await mtRasterNet(W, H, net.segs));
        gl.setBlade(mtMakeBlades(W, H, net.branches, dpr, rnd));
      } catch (e) { console.warn('[JoJo Stands] Metallica: WebGL недоступен, запасной вариант', e); if (gl) gl.dispose(); gl = null; }
    };
    const P = { time: 0, a: 0, b: 0, g: 0, k: 0, bl: 0, d: 0, f: 0, r: 0, x: 0, s: 1 };
    const params = (t) => {
      const sn = T.snap, sw = T.swap, ts = t - sn;
      P.a = sm(0, 2600, t);
      P.b = sm(1700, 5100, t);
      P.g = sm(1100, 4800, t);
      P.k = t < sn ? sm(sn - 650, sn, t) : 0;
      P.bl = ts < 0 ? 0 : 1 - Math.pow(1 - Math.min(1, ts / 750), 2);
      P.d = ts < 0 || t >= sw ? 0 : sm(0, 140, ts) * (0.78 + 0.22 * Math.sin(ts / 85)) * (1 - 0.35 * sm(sw - 400, sw, t));
      P.r = ts < 0 ? 0 : t < sw ? Math.min(1, ts / 950) : Math.min(1, (t - sw) / 900);
      P.f = ts < 0 ? 0 : t < sw ? Math.max(0.55 * Math.exp(-ts / 120), sm(sw - 110, sw, t)) : Math.exp(-(t - sw) / 150);
      P.x = t < sw + 40 ? 0 : sm(sw + 40, T.end - 250, t);
      P.s = swapped ? 0 : 1;
    };
    const play = (buf, rate, vol) => { const a = audio(); if (!a || !buf) return; const s = a.createBufferSource(), g = a.createGain(); s.buffer = buf; s.playbackRate.value = rate; g.gain.value = vol; s.connect(g); g.connect(a.destination); s.start(); };
    try {
      // 1) надпись как у D4C: холодный серо-стальной размытый фон; нажатия не работают; параллельно готовятся снимок, сеть и лезвия
      fx.style.transition = 'background-color .4s, backdrop-filter .4s, -webkit-backdrop-filter .4s';
      fx.style.background = 'rgba(20,26,36,.40)'; fx.style.backdropFilter = fx.style.webkitBackdropFilter = 'blur(5px)';
      const a = audio();
      let dT = T.title;
      if (a && bufName) {
        const [ns, ne] = audibleSpan(bufName);
        dT = Math.max(T.title, (ne - ns) * 1000 + 300);
        const src = a.createBufferSource(), g = a.createGain(), t0 = a.currentTime;
        src.buffer = bufName; g.gain.setValueAtTime(T.vol, t0); g.gain.setValueAtTime(T.vol, t0 + (ne - ns) - 0.04); g.gain.linearRampToValueAtTime(0.0001, t0 + (ne - ns));
        src.connect(g); g.connect(a.destination); src.start(t0, ns, ne - ns);
      }
      const ttl = titleCard(fx, 'メタリカ', 'METALLICA', 'mt');
      ttl.hide(dT - 250);
      const prep = prepare();
      await sleep(dT - 450);
      fx.style.background = ''; fx.style.backdropFilter = fx.style.webkitBackdropFilter = '';
      await Promise.all([sleep(450), prep]);
      // 2) окно подменяется текстурой: экран выглядит обычным — и начинается превращение
      if (gl) { fx.appendChild(gl.cv); params(0); gl.draw(P); await sleep(60); modal.style.visibility = 'hidden'; }
      else { fb = document.createElement('div'); fb.className = 'jg-mt-fb'; fx.appendChild(fb); }
      const t0 = performance.now();
      await new Promise((res) => {
        const f = () => {
          if (dead) return res();
          const t = performance.now() - t0;
          if (!snapped && t >= T.snap) { snapped = true; [[1, .9], [1.18, .7], [.86, .8]].forEach(([r, v], i) => setTimeout(() => { if (!dead) play(bufSlice, r, v); }, i * 70)); }
          if (!swapped && t >= T.swap) { // пик искажения: настоящее окно (с результатом) под вспышкой
            swapped = true; modal.style.visibility = ''; modal.style.transform = ''; modal.style.filter = '';
            doReveal(0.05);
            modal.animate([{ filter: 'brightness(1.9) saturate(.3)' }, { filter: 'none' }], { duration: 750, easing: 'ease-out' });
          }
          params(t); P.time = t / 1000;
          if (gl) gl.draw(P);
          else { // запасной вариант без WebGL: холодный фильтр, серебряные линии, тряска и вспышки
            if (!swapped) {
              modal.style.filter = `saturate(${1 - 0.45 * P.a}) brightness(${1 - 0.1 * P.a}) contrast(${1 + 0.2 * P.a})`;
              modal.style.transform = P.d > 0 ? `translate(${(Math.random() * 2 - 1) * 10 * P.d}px,${(Math.random() * 2 - 1) * 4 * P.d}px) skewX(${Math.sin(t / 40) * 3 * P.d}deg)` : '';
            }
            fb.style.opacity = P.b * (1 - P.x) * (0.6 + 0.4 * Math.sin(t / 90 * (1 + P.k * 3)));
            fb.style.boxShadow = `inset 0 0 ${120 * P.f}px ${60 * P.f}px rgba(200,225,255,${Math.min(1, P.f)})`;
          }
          if (t < T.end) requestAnimationFrame(f); else res();
        };
        requestAnimationFrame(f);
      });
    } finally {
      dead = true;
      if (gl) gl.dispose();
      fx.remove(); ui.fx = false;
      if (modal) { modal.style.visibility = ''; modal.style.transform = ''; modal.style.filter = ''; }
      doReveal(0.2); // если что-то пошло не так — результат всё равно покажется
    }
  }
  // ---------- C-MOON: гравитация меняется — весь интерфейс окна сваливается влево, потом вверх, потом вправо ----------
  const CM_T = {
    title: 1900, // надпись на зеленоватом фоне (как у D4C)
    pause: 450,  // после надписи интерфейс ещё на месте, потом первый звук
    pre: 400,    // запасная длина подготовки к смене, если нет ни одного c-moon_sound (обычно подготовка длится столько, сколько играет выбранный c-moon_sound)
    fall: 2100,  // сколько длится каждая гравитация (потом следующий звук)
    peel: 550,   // «отрыв»: куски, что ближе к стороне падения, срываются раньше (мс на всю ширину/высоту экрана)
    tail: 650,   // после последней гравитации: всё гаснет в зелёной вспышке, показывается результат
    G: 2.6,      // ускорение в высотах экрана за секунду²
    cap: 460,    // максимум кусков (если слов больше — соседние слова одной строки склеиваются)
  };
  const CM_BOX = ['backgroundColor', 'backgroundImage', 'backgroundSize', 'backgroundPosition', 'backgroundRepeat', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderTopStyle', 'borderRightStyle', 'borderBottomStyle', 'borderLeftStyle', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 'borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius', 'boxShadow'];
  const CM_SVG = ['fill', 'fillOpacity', 'stroke', 'strokeWidth', 'strokeOpacity', 'strokeDasharray', 'opacity', 'fontSize', 'fontFamily', 'fontWeight', 'textAnchor', 'dominantBaseline', 'letterSpacing'];
  const sndCmShift = () => { tone({ f0: 80, f1: 24, dur: 1.2, vol: 0.5 }); tone({ type: 'sawtooth', f0: 220, f1: 40, dur: 0.9, vol: 0.05 }); tone({ f0: 1100, f1: 140, dur: 0.5, vol: 0.05 }); };
  // обходит окно и собирает всё, что должно упасть, в порядке отрисовки:
  // { k:'b' коробка с фоном/рамкой/тенью | 'm' картинка, svg, поле ввода | 't' текст (слова) | 'x' спрятать без копии }
  function cmGather(modal, W, H, ox, oy) {
    const top = modal.parentElement, csC = new Map();
    const gcs = (e) => { let c = csC.get(e); if (!c) { c = getComputedStyle(e); csC.set(e, c); } return c; };
    const clipOf = (el) => { // область, за которую содержимое не вылезает (прокручиваемые блоки, само окно, экран)
      let L = ox, T = oy, R = ox + W, B = oy + H;
      for (let e = el.parentElement; e && e !== top; e = e.parentElement) {
        const c = gcs(e);
        if (c.overflowX !== 'visible' || c.overflowY !== 'visible') { const b = e.getBoundingClientRect(); L = Math.max(L, b.left); T = Math.max(T, b.top); R = Math.min(R, b.right); B = Math.min(B, b.bottom); }
      }
      return { L, T, R, B };
    };
    const eff = (el) => { let o = 1; for (let e = el; e && e !== top; e = e.parentElement) o *= parseFloat(gcs(e).opacity); return o; }; // прозрачность родителей тоже
    const alpha = (c) => { if (!c || c === 'transparent') return 0; const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return 1; const p = m[1].split(/[ ,/]+/).filter(Boolean); return p.length > 3 ? parseFloat(p[3]) : 1; };
    const hasBox = (c) => alpha(c.backgroundColor) > 0.01 || c.backgroundImage !== 'none' || c.boxShadow !== 'none' || ['Top', 'Right', 'Bottom', 'Left'].some((s) => parseFloat(c['border' + s + 'Width']) > 0 && !/none|hidden/.test(c['border' + s + 'Style']) && alpha(c['border' + s + 'Color']) > 0.01);
    const list = [], rg = document.createRange(), plates = new Map(); // plates: элемент → его кусок-плашка (к ней привязывается текст)
    for (const el of [modal, ...modal.querySelectorAll('*')]) {
      if (/^(SCRIPT|STYLE|NOSCRIPT|OPTION|BR)$/i.test(el.tagName) || (el.parentElement && el.parentElement.closest('svg'))) continue;
      const cs = gcs(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const media = /^(IMG|SVG|CANVAS|VIDEO|INPUT|SELECT|TEXTAREA)$/i.test(el.tagName), r = el.getBoundingClientRect(), cl = clipOf(el);
      if (r.width >= 1 && r.height >= 1) {
        const L = Math.max(r.left, cl.L), T = Math.max(r.top, cl.T), R = Math.min(r.right, cl.R), B = Math.min(r.bottom, cl.B);
        if (R - L >= 1 && B - T >= 1) {
          const rr = { left: L, top: T, width: R - L, height: B - T };
          if (media) list.push((R - L) * (B - T) / (r.width * r.height) > 0.85 ? { k: 'm', el, cs, r: rr, op: eff(el) } : { k: 'x', el });
          else if (hasBox(cs)) { const bi = { k: 'b', el, cs, r: rr, op: eff(el) }; list.push(bi); plates.set(el, bi); }
        }
      }
      if (media) continue;
      for (const n of el.childNodes) {
        if (n.nodeType !== 3 || !/\S/.test(n.nodeValue)) continue;
        const words = [], re = /\S+/g;
        let m;
        while ((m = re.exec(n.nodeValue))) {
          rg.setStart(n, m.index); rg.setEnd(n, m.index + m[0].length);
          if (!rg.getClientRects().length) continue;
          const b = rg.getBoundingClientRect(), cx = (b.left + b.right) / 2, cy = (b.top + b.bottom) / 2;
          if (b.width < 1 || b.height < 1 || cx < cl.L || cx > cl.R || cy < cl.T || cy > cl.B) continue;
          words.push({ s: m.index, e: m.index + m[0].length, emo: /^[\p{Extended_Pictographic}\uFE0F\u200D\u20E3]+$/u.test(m[0]), r: { left: b.left, top: b.top, right: b.right, bottom: b.bottom, width: b.width, height: b.height } });
        }
        if (words.length) { let pl = null; for (let e = el; e && e !== top; e = e.parentElement) { if (plates.has(e)) { pl = plates.get(e); break; } } list.push({ k: 't', n, el, cs, words, op: eff(el), pl }); } // pl — ближайшая плашка под текстом (или null)
        else list.push({ k: 'x', el, txt: 1 });
      }
    }
    return list;
  }
  async function cMoonReveal(dlg, reveal, snd, st) {
    const T = CM_T;
    const modal = dlg.querySelector('.jg-modal');
    const fx = document.createElement('div');
    fx.className = 'jg-fx jg-cm';
    dlg.appendChild(fx);
    ui.fx = true; // с этого момента нажатия не проходят (слой .jg-fx их перехватывает)
    const fb = fx.getBoundingClientRect(), W = fb.width || window.innerWidth, H = fb.height || window.innerHeight;
    let dead = false, revealed = false;
    const marks = []; // [элемент, класс] — всё, что прячем у настоящего окна; убирается перед показом результата
    const mark = (el, c) => { el.classList.add(c); marks.push([el, c]); };
    const unmark = () => { marks.forEach(([el, c]) => el.classList.remove(c)); marks.length = 0; };
    const doReveal = (d) => { if (revealed) return; revealed = true; unmark(); reveal(d); };
    const bufShift = await snd.cmShift, bufName = await snd.cmName, bufPre = (await Promise.all(snd.cmPre)).filter(Boolean);
    const rnd = (a, b) => a + Math.random() * (b - a);
    const pcs = [], ign = new Set();
    // ---------- физика: AABB-коробки, гравитация задаётся вектором (gx, gy) ----------
    const SUB = 1 / 120, REST = 0.28, FR = 0.18, WF = 0.03, G = T.G * H;
    let gx = 0, gy = 0, tick = 0;
    const ov = (a, b) => Math.abs(a.x - b.x) < a.hw + b.hw && Math.abs(a.y - b.y) < a.hh + b.hh;
    const solve = (a, b) => {
      const ia = a.hold > 0 ? 0 : a.im, ib = b.hold > 0 ? 0 : b.im, s = ia + ib;
      if (!s) return;
      const dx = b.x - a.x, dy = b.y - a.y, ox = a.hw + b.hw - Math.abs(dx), oy = a.hh + b.hh - Math.abs(dy);
      if (ox <= 0 || oy <= 0) return;
      a.touch = b.touch = 1;
      if (ox < oy) {
        const n = dx < 0 ? -1 : 1;
        a.x -= n * ox * ia / s; b.x += n * ox * ib / s;
        const rv = (b.vx - a.vx) * n;
        if (rv < 0) { const j = -(1 + (rv < -90 ? REST : 0)) * rv / s; a.vx -= j * ia * n; b.vx += j * ib * n; }
        const tv = b.vy - a.vy; a.vy += tv * FR * ia / s; b.vy -= tv * FR * ib / s;
      } else {
        const n = dy < 0 ? -1 : 1;
        a.y -= n * oy * ia / s; b.y += n * oy * ib / s;
        const rv = (b.vy - a.vy) * n;
        if (rv < 0) { const j = -(1 + (rv < -90 ? REST : 0)) * rv / s; a.vy -= j * ia * n; b.vy += j * ib * n; }
        const tv = b.vx - a.vx; a.vx += tv * FR * ia / s; b.vx -= tv * FR * ib / s;
      }
    };
    const walls = (p) => {
      if (p.hold > 0) return;
      if (p.x - p.hw < 0) { p.x = p.hw; if (p.vx < 0) p.vx = p.vx < -90 ? -p.vx * REST : 0; p.vy *= 1 - WF; p.touch = 1; }
      else if (p.x + p.hw > W) { p.x = W - p.hw; if (p.vx > 0) p.vx = p.vx > 90 ? -p.vx * REST : 0; p.vy *= 1 - WF; p.touch = 1; }
      if (p.y - p.hh < 0) { p.y = p.hh; if (p.vy < 0) p.vy = p.vy < -90 ? -p.vy * REST : 0; p.vx *= 1 - WF; p.touch = 1; }
      else if (p.y + p.hh > H) { p.y = H - p.hh; if (p.vy > 0) p.vy = p.vy > 90 ? -p.vy * REST : 0; p.vx *= 1 - WF; p.touch = 1; }
    };
    const stepAll = (dt) => {
      const N = pcs.length;
      for (const p of pcs) {
        p.touch = 0;
        if (p.hold > 0) { p.hold -= dt * 1000; if (p.hold <= 0) p.va = rnd(-1.4, 1.4) * p.spin; continue; }
        p.vx += gx * G * dt; p.vy += gy * G * dt;
        p.vx *= 1 - 0.12 * dt; p.vy *= 1 - 0.12 * dt;
        p.x += p.vx * dt; p.y += p.vy * dt;
      }
      if ((tick++ & 3) === 0) for (const k of ign) if (!ov(pcs[(k / N) | 0], pcs[k % N])) ign.delete(k); // вложенные куски (кнопка и её подпись) не сталкиваются, пока не разошлись
      const cell = 70, grid = new Map(), seen = new Set(), pairs = [];
      for (let i = 0; i < N; i++) {
        const p = pcs[i], x0 = Math.floor((p.x - p.hw - 2) / cell), x1 = Math.floor((p.x + p.hw + 2) / cell), y0 = Math.floor((p.y - p.hh - 2) / cell), y1 = Math.floor((p.y + p.hh + 2) / cell);
        for (let cx = x0; cx <= x1; cx++) for (let cy = y0; cy <= y1; cy++) {
          const k = cx * 4096 + cy; let b = grid.get(k);
          if (!b) { b = []; grid.set(k, b); }
          for (const j of b) { const key = j * N + i; if (!seen.has(key) && !ign.has(key)) { seen.add(key); pairs.push(j, i); } }
          b.push(i);
        }
      }
      for (let it = 0; it < 3; it++) {
        for (let k = 0; k < pairs.length; k += 2) solve(pcs[pairs[k]], pcs[pairs[k + 1]]);
        for (const p of pcs) walls(p);
      }
      for (const p of pcs) {
        if (p.hold > 0) continue;
        if (p.touch) p.va += ((p.rest - p.a) * 40 - p.va * 7) * dt; else p.va *= 1 - 0.3 * dt;
        p.a += p.va * dt;
      }
    };
    let box = null;
    const draw = (sh) => {
      for (const p of pcs) p.el.style.transform = `translate3d(${p.x - p.w / 2 + (sh ? rnd(-sh, sh) : 0)}px,${p.y - p.h / 2 + (sh ? rnd(-sh, sh) : 0)}px,0) rotate(${p.a + (sh ? rnd(-sh, sh) * 0.012 * p.spin : 0)}rad)`;
    };
    const simulate = (ms, shAmp = 0) => new Promise((res) => {
      const t0 = performance.now();
      let prev = t0, acc = 0;
      const f = (now) => {
        if (dead) return res();
        acc += Math.min(0.05, Math.max(0, (now - prev) / 1000)); prev = now;
        let n = 0;
        while (acc >= SUB && n < 4) { stepAll(SUB); acc -= SUB; n++; }
        if (n === 4) acc = 0;
        draw(shAmp ? shAmp * Math.min(1, Math.max(0, (now - t0) / ms)) : 0);
        if (now - t0 < ms) requestAnimationFrame(f); else res();
      };
      requestAnimationFrame(f);
    });
    // звук из буфера (тишина по краям отрезается); возвращает длину в мс
    const playBuf = (buf) => {
      const a = audio();
      if (!a || !buf) return 0;
      const [ns, ne] = audibleSpan(buf), src = a.createBufferSource();
      src.buffer = buf; src.connect(a.destination); src.start(a.currentTime, ns, ne - ns);
      return (ne - ns) * 1000;
    };
    let lastPre = -1;
    const playPre = () => { // случайный c-moon_sound (не тот же, что в прошлый раз); возвращает его длину, мс — столько длится подготовка к смене
      if (!bufPre.length) return T.pre;
      let k;
      do k = Math.floor(Math.random() * bufPre.length); while (bufPre.length > 1 && k === lastPre);
      lastPre = k;
      return playBuf(bufPre[k]) || T.pre;
    };
    const playShift = () => { if (!playBuf(bufShift)) sndCmShift(); }; // gravity-shift в момент смены; нет файла — синтез
    // ---------- эффекты: свечение со стороны падения, вспышка, ударное кольцо, скоростные линии ----------
    const flash = document.createElement('div'); flash.className = 'jg-cm-flash';
    const edge = document.createElement('div'); edge.className = 'jg-cm-edge';
    const anim = (el, kf, o) => { try { return el.animate(kf, o); } catch (e) { return null; } };
    const prelude = (dx, dy, ms) => { // перед сменой: у стены, куда потянет, разгорается свечение
      edge.style.background = `linear-gradient(${dx < 0 ? 'to right' : dx > 0 ? 'to left' : 'to bottom'},rgba(134,239,172,.6),rgba(34,197,94,.18) 22%,transparent 46%)`;
      anim(edge, [{ opacity: 0 }, { opacity: 1 }], { duration: ms, fill: 'forwards', easing: 'ease-in' });
    };
    const burst = (dx, dy) => {
      const L = Math.max(W, H), done = (el) => { const a = anim(el, [], { duration: 1 }); return () => el.remove(); };
      anim(flash, [{ opacity: 0 }, { opacity: 1, offset: 0.12 }, { opacity: 0 }], { duration: 520, easing: 'ease-out' });
      anim(edge, [{ opacity: 1 }, { opacity: 0 }], { duration: 1100, fill: 'forwards', easing: 'ease-out' });
      const ring = document.createElement('div'); ring.className = 'jg-cm-ring'; fx.appendChild(ring);
      const ra = anim(ring, [{ transform: 'translate(-50%,-50%) scale(.1)', opacity: 0.95 }, { transform: `translate(-50%,-50%) scale(${L / 55})`, opacity: 0 }], { duration: 800, easing: 'cubic-bezier(.1,.7,.3,1)' });
      if (ra) ra.finished.then(() => ring.remove(), () => ring.remove()); else ring.remove();
      for (let i = 0; i < 20; i++) { // линии, летящие в сторону падения
        const s = document.createElement('div'), len = rnd(90, 280), th = rnd(1.5, 3.2), hz = dx !== 0;
        s.className = 'jg-cm-sk';
        s.style.cssText = hz ? `width:${len}px;height:${th}px;top:${rnd(0, H)}px;background:linear-gradient(${dx < 0 ? 'to left' : 'to right'},transparent,rgba(200,255,220,.95))` : `height:${len}px;width:${th}px;left:${rnd(0, W)}px;background:linear-gradient(${dy < 0 ? 'to top' : 'to bottom'},transparent,rgba(200,255,220,.95))`;
        fx.appendChild(s);
        const f0 = hz ? (dx < 0 ? W : -len) : (dy < 0 ? H : -len), f1 = hz ? (dx < 0 ? -len : W) : (dy < 0 ? -len : H);
        const tr = (v) => (hz ? `translate3d(${v}px,0,0)` : `translate3d(0,${v}px,0)`);
        const sa = anim(s, [{ transform: tr(f0), opacity: 1 }, { transform: tr(f1), opacity: 1 }], { duration: rnd(380, 720), delay: rnd(0, 280), easing: 'cubic-bezier(.4,0,.8,.6)', fill: 'both' });
        if (sa) sa.finished.then(() => s.remove(), () => s.remove()); else s.remove();
      }
      if (box) anim(box, [{ translate: '0 0' }, { translate: `${dx * 10}px ${dy * 10}px`, offset: 0.25 }, { translate: '0 0' }], { duration: 480, easing: 'ease-out' }); // толчок всего интерфейса
    };
    const shift = (dx, dy) => {
      gx = dx; gy = dy;
      const span = dx ? W : H;
      for (const p of pcs) {
        const d = dx < 0 ? p.x - p.hw : dx > 0 ? W - p.x - p.hw : dy < 0 ? p.y - p.hh : H - p.y - p.hh;
        p.hold = Math.max(0, d) / span * T.peel + rnd(0, 120); p.vx = p.vy = p.va = 0;
      }
      burst(dx, dy);
    };
    try {
      // 1) надпись как у D4C, но зеленоватый фон; нажатия не работают
      fx.style.background = 'rgba(110,220,150,.26)'; fx.style.backdropFilter = fx.style.webkitBackdropFilter = 'blur(5px)';
      fx.style.transition = 'background-color .4s, backdrop-filter .4s, -webkit-backdrop-filter .4s';
      anim(fx, [{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: 'forwards' });
      let dT = T.title;
      if (bufName) dT = Math.max(T.title, playBuf(bufName) + 300); // звук c-moon — вместе с появлением текста; надпись держится по его длине
      const ttl = titleCard(fx, 'シー・ムーン', 'C-MOON', 'cm');
      ttl.hide(dT - 250);
      await sleep(dT - 450);
      fx.style.background = ''; fx.style.backdropFilter = fx.style.webkitBackdropFilter = '';
      // 2) интерфейс окна → отдельные куски поверх экрана (коробки, картинки, слова), у настоящего окна всё прячется
      const list = cmGather(modal, W, H, fb.left, fb.top);
      const nW = list.reduce((s, it) => s + (it.k === 't' && !it.pl ? it.words.length : 0), 0), nO = list.filter((it) => it.k === 'b' || it.k === 'm').length;
      const per = Math.max(1, Math.ceil(nW / Math.max(120, T.cap - nO)));
      box = document.createElement('div');
      box.style.cssText = 'position:absolute;inset:0;pointer-events:none';
      const add = (e, r, o) => { // o: { k: доля коробки столкновений по ширине/высоте, op }
        const w = r.width, h = r.height;
        e.classList.add('jg-cm-w'); e.style.width = w + 'px'; e.style.height = h + 'px';
        if (o.op < 0.995) e.style.opacity = o.op;
        box.appendChild(e);
        pcs.push({ el: e, x: r.left - fb.left + w / 2, y: r.top - fb.top + h / 2, w, h, hw: Math.max(2, w / 2 * o.fw), hh: Math.max(2, h / 2 * o.fh), im: 1000 / (w * h), spin: Math.min(1, 140 / Math.max(w, h)), vx: 0, vy: 0, a: 0, va: 0, rest: 0, hold: 0, touch: 0 });
        pcs[pcs.length - 1].rest = rnd(-0.06, 0.06) * pcs[pcs.length - 1].spin;
      };
      const emoji = [];
      for (const it of list) {
        if (it.k === 'x') { mark(it.el, it.txt ? 'jg-cm-t' : 'jg-cm-h'); continue; }
        const { el, cs } = it;
        if (it.k === 'b') {
          const e = document.createElement('div');
          for (const k of CM_BOX) e.style[k] = cs[k];
          e.style.boxSizing = 'border-box';
          it.pe = e; // кусок плашки: текст, что на ней лежит, едет внутри него
          add(e, it.r, { fw: 0.98, fh: 0.98, op: it.op });
          mark(el, 'jg-cm-b');
        } else if (it.k === 'm') {
          const e = el.cloneNode(true);
          e.removeAttribute('id'); e.querySelectorAll('[id]').forEach((x) => x.removeAttribute('id')); e.removeAttribute('data-act');
          for (let i = 0; i < cs.length; i++) e.style.setProperty(cs[i], cs.getPropertyValue(cs[i]));
          Object.assign(e.style, { margin: '0', transform: 'none', translate: 'none', animation: 'none', transition: 'none', boxSizing: 'border-box', display: /^svg$/i.test(el.tagName) ? 'block' : cs.display === 'inline' ? 'block' : cs.display });
          if (/^(INPUT|TEXTAREA|SELECT)$/i.test(el.tagName)) { e.value = el.value; e.checked = el.checked; }
          if (/^svg$/i.test(el.tagName)) { // у svg внутренние стили зависят от селекторов окна — переносим вычисленные значения
            const src = el.querySelectorAll('*'), dst = e.querySelectorAll('*');
            src.forEach((s, i) => { const c = getComputedStyle(s); for (const k of CM_SVG) dst[i].style[k] = c[k]; });
          }
          add(e, it.r, { fw: 0.98, fh: 0.98, op: it.op });
          mark(el, 'jg-cm-h');
        } else {
          const col = /^svg$/i.test(el.tagName) ? cs.fill : cs.color, pl = it.pl && it.pl.pe ? it.pl : null; // pl — плашка, к которой привязан текст
          for (let i = 0; i < it.words.length;) {
            const grp = [it.words[i++]];
            if (!pl && !grp[0].emo) while (grp.length < per && i < it.words.length && !it.words[i].emo && Math.abs(it.words[i].r.top - grp[0].r.top) < grp[0].r.height * 0.5) grp.push(it.words[i++]);
            const a = grp[0], b = grp[grp.length - 1];
            const left = a.r.left, right = Math.max(...grp.map((g) => g.r.right)), tp = Math.min(...grp.map((g) => g.r.top)), bt = Math.max(...grp.map((g) => g.r.bottom));
            const e = document.createElement('span');
            e.textContent = it.n.nodeValue.slice(a.s, b.e).replace(/\s+/g, ' ');
            Object.assign(e.style, { fontFamily: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight, fontStyle: cs.fontStyle, letterSpacing: cs.letterSpacing, textTransform: cs.textTransform, color: /^(rgb|#|hsl)/.test(col) ? col : '#fff', lineHeight: (bt - tp) + 'px', textShadow: (cs.textShadow !== 'none' ? cs.textShadow + ',' : '') + '0 0 8px rgba(134,239,172,.55)' });
            if (pl) { // текст на плашке: не отдельное тело, а ребёнок её куска — падает и крутится вместе с ней
              const bw = parseFloat(pl.cs.borderLeftWidth) || 0, tw = parseFloat(pl.cs.borderTopWidth) || 0, rel = pl.op > 0.01 ? it.op / pl.op : it.op;
              e.className = 'jg-cm-c';
              Object.assign(e.style, { left: (left - pl.r.left - bw) + 'px', top: (tp - pl.r.top - tw) + 'px', width: (right - left) + 'px', height: (bt - tp) + 'px' });
              if (rel < 0.995) e.style.opacity = rel;
              pl.pe.appendChild(e);
            } else add(e, { left, top: tp, width: right - left, height: bt - tp }, { fw: 0.96, fh: 0.84, op: it.op });
            if (a.emo) emoji.push({ n: it.n, s: a.s, e: a.e });
          }
          mark(el, 'jg-cm-t');
        }
      }
      // эмодзи цветом не скрыть: заворачиваем их в span и прячем через visibility (с конца, чтобы не сбить смещения)
      emoji.sort((p, q) => (p.n === q.n ? q.s - p.s : 0));
      for (const em of emoji) {
        try { const r2 = document.createRange(); r2.setStart(em.n, em.s); r2.setEnd(em.n, em.e); const sp = document.createElement('span'); sp.className = 'jg-cm-h'; r2.surroundContents(sp); } catch (e) { /* не вышло — эмодзи останется на месте */ }
      }
      mark(modal, 'jg-cm-go');
      const N = pcs.length;
      for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) if (ov(pcs[i], pcs[j])) ign.add(i * N + j);
      fx.appendChild(edge); fx.appendChild(box); fx.appendChild(flash);
      draw(0);
      await sleep(450);
      // 3) три смены гравитации: влево → вверх → вправо; перед каждой играет звук
      await simulate(T.pause);
      for (const [dx, dy] of [[-1, 0], [0, -1], [1, 0]]) {
        const pm = playPre(); // 1) случайный c-moon_sound: дрожь и свечение у стены
        prelude(dx, dy, pm);
        await simulate(pm, 3.4);
        playShift(); // 2) gravity-shift и сама смена гравитации
        shift(dx, dy);
        await simulate(T.fall);
      }
      // 4) всё гаснет в зелёной вспышке, результат проявляется
      anim(box, [{ opacity: 1 }, { opacity: 0 }], { duration: T.tail, easing: 'ease-in', fill: 'forwards' });
      anim(flash, [{ opacity: 0 }, { opacity: 0.9, offset: 0.3 }, { opacity: 0 }], { duration: T.tail + 250, easing: 'ease-out' });
      doReveal(0.1);
      await simulate(T.tail);
    } finally {
      dead = true;
      unmark();
      fx.remove(); ui.fx = false;
      doReveal(0.2); // если что-то пошло не так — результат всё равно покажется
    }
  }
  // ---------- Made in Heaven (WebGL/GLSL): ускорение времени — «свайпы» экрана влево с нарастающей скоростью, пока кадр не смажется ----------
  // 1) надпись как у D4C (нажатия заблокированы `ui.fx`), параллельно окно снимается в текстуру (`captureModal`) на тёмном фоне;
  // 2) экран сдвигается влево с ПОСТОЯННОЙ скоростью, на его место сразу приходит следующий экран (как свайп) — снимок окна, каждый раз с чуть другим
  //    оттенком/яркостью (оттенок «проворачивается» на каждом экране, чем дальше — тем сильнее); свайпы идут один за другим, каждый быстрее и с меньшей паузой;
  // 3) после последнего свайпа скорость плавно растёт по экспоненте (`ramp`, `vMax` экранов/с), время выдержки (`shut`) тоже растёт — кадр размазывается
  //    в горизонтальные полосы (разделение каналов, скоростные линии), в конце всё в белую вспышку и проявляется результат.
  // Один фрагментный шейдер `MH_FS`: 24 выборки вдоль движения (размытие в движении), смещение выборок свое у каждой строки пикселей — получаются штрихи.
  // Без WebGL — 2D-холст (несколько копий снимка с усреднением); без снимка — окно просто ездит влево с CSS-размытием.
  const MH_T = {
    title: 1500,   // надпись (если есть голос — по его длине, но не короче)
    pre: 250,      // экран стоит неподвижно перед первым свайпом (дальше экраны идут подряд, без остановок)
    swipes: [[900, 0], [700, 0], [540, 0], [420, 0], [320, 0], [245, 0], [185, 0], [140, 0]], // [длительность движения, пауза после], мс: каждый свайп — ровно 1 экран с постоянной скоростью; паузы 0 — экраны идут друг за другом, скорость растёт ступенями
    ramp: 1700,    // непрерывное ускорение после свайпов (скорость растёт от скорости последнего свайпа до vMax)
    vMax: 80,      // скорость в конце, экранов/с (на последнем свайпе ≈7)
    shut0: 0.035,  // «выдержка» размытия, с (длина размытия = скорость × выдержка)
    shut1: 0.13,   // выдержка в конце ускорения (кадр полностью размазывается)
    flash: 460,    // финал: из центра расходится световая волна с лучами и заливает экран белым (в 2D/CSS-вариантах — простая белая вспышка)
    tail: 900,     // белый уходит, окно с результатом «собирается» из света (яркость и размытие спадают)
  };
  const MH_BG = 'rgb(14,8,28)'; // фон за окном на снимке (затемнённая подложка диалога)
  const MH_FS = `
precision highp float;
uniform sampler2D uScene;
uniform vec2 uRes;
uniform float uT, uP, uV, uShut, uGr, uFl;
float h11(float p){ p = fract(p * .1031); p *= p + 33.33; p *= p + p; return fract(p); }
float h21(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float n1(float x){ float i = floor(x), f = fract(x); f = f * f * (3. - 2. * f); return mix(h11(i), h11(i + 1.), f); }
vec3 hueRot(vec3 c, float a){ float s = sin(a), co = cos(a); vec3 k = vec3(.57735); return c * co + cross(k, c) * s + k * dot(k, c) * (1. - co); }
// каждый следующий экран чуть другой: оттенок проворачивается, яркость плавает (первый экран не меняется)
vec3 grade(vec3 c, float idx){
  float g = uGr * smoothstep(0., 1.2, idx);
  c = mix(c, hueRot(c, idx * 1.15), g * .85);
  return c * (1. + g * .22 * sin(idx * 2.3));
}
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float s0 = uv.x + uP;                       // координата на «ленте» экранов; целая часть — номер экрана
  float L = uV * uShut;                       // длина размытия в экранах
  float jr = h21(vec2(floor(gl_FragCoord.y * .5), floor(uT * 60.))) * .75 + h21(gl_FragCoord.xy + uT) * .25;  // смещение выборок: общее у строки → горизонтальные штрихи
  float ck = clamp(L * 7., 0., 1.) * .9;      // сила разделения каналов вдоль движения
  vec3 acc = vec3(0.), ws = vec3(0.);
  for (int i = 0; i < 24; i++) {
    float t = (float(i) + jr) / 24.;
    float s = s0 + (t - .5) * L;
    float idx = floor(s);
    vec3 c = texture2D(uScene, vec2(clamp(s - idx, .004, .996), uv.y)).rgb;
    vec3 w = vec3(max(0., 1. + ck * (t - .5) * 2.4), 1., max(0., 1. - ck * (t - .5) * 2.4));
    acc += grade(c, idx) * w; ws += w;
  }
  vec3 col = acc / max(ws, vec3(.001));
  // шов между экранами (пока движение медленное): тень на краю нового экрана и лёгкая — на уходящем
  float u0 = fract(s0), idx0 = floor(s0);
  float seam = (1. - smoothstep(0., .07, L)) * smoothstep(.05, .5, uV);
  col *= 1. - seam * (.55 * (1. - smoothstep(0., .07, u0)) * step(.5, idx0) + .3 * smoothstep(.94, 1., u0));
  // скорость: цвета не сереют при размазывании (насыщенность и свечение растут), холодный «свет времени», лучи из центра, скоростные линии, виньетка
  float vk = smoothstep(4., 45., uV);
  vec2 cc = (uv - .5) * vec2(uRes.x / uRes.y, 1.);
  float rr = length(cc), ang = atan(cc.y, cc.x);
  float lum = dot(col, vec3(.3, .55, .15));
  col = mix(vec3(lum), col, 1. + .9 * vk);
  col += col * col * .7 * vk;
  col *= mix(vec3(1.), vec3(.92, 1., 1.12), vk * .6);
  float rays = pow(n1(ang * 9. + uT * 1.5) * n1(ang * 23. - uT * 2.3), 2.2);
  float glow = exp(-rr * 2.4);
  col += vec3(.75, .82, 1.) * rays * glow * vk * .9 + vec3(.8, .85, 1.) * glow * glow * vk * .25;
  float row = floor(gl_FragCoord.y / max(1., uRes.y / 420.));
  float sl = step(.90, h11(row * 1.73 + floor(uT * 40.) * .37)) * step(.35, h11(row * .71 + floor(s0 * 5.)));
  col += vec3(.75, .85, 1.) * sl * .30 * vk;
  col *= 1. + .3 * vk;
  float vg = smoothstep(1.15, .25, rr);
  col *= mix(1., vg, .4 * vk);
  // финал: из центра расходится световая волна (яркое кольцо, лучи, тонкая тёмная кромка впереди) и заливает экран белым
  if (uFl > 0.) {
    float edge = uFl * 1.5 - rr;
    float body = smoothstep(-.02, .3, edge);
    float ring = exp(-pow(edge * 7., 2.)) * (1. - uFl * .6);
    float br = pow(n1(ang * 11. + uT * 3.) * n1(ang * 29.), 2.);
    col *= 1. - .45 * exp(-pow((edge + .08) * 12., 2.)) * (1. - body);
    col = mix(col, vec3(1.), body);
    col += vec3(.7, .8, 1.) * ring * (.8 + 1.5 * br);
    col = mix(col, vec3(1.), smoothstep(.85, 1., uFl));
  }
  gl_FragColor = vec4(clamp(col, 0., 1.), 1.);
}`;
  function createMhGL(W, H, dpr) {
    const cv = document.createElement('canvas');
    cv.className = 'jg-cr-gl'; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const gl = cv.getContext('webgl', { alpha: false, antialias: false });
    if (!gl) return null;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, SWIRL_VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, MH_FS)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'aPos'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const U = {};
    ['uScene', 'uRes', 'uT', 'uP', 'uV', 'uShut', 'uGr', 'uFl'].forEach((n) => { U[n] = gl.getUniformLocation(pr, n); });
    gl.uniform1i(U.uScene, 0); gl.uniform2f(U.uRes, cv.width, cv.height);
    gl.viewport(0, 0, cv.width, cv.height);
    return {
      cv,
      setScene(img) {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      },
      draw(p) {
        gl.uniform1f(U.uT, p.time); gl.uniform1f(U.uP, p.p); gl.uniform1f(U.uV, p.v); gl.uniform1f(U.uShut, p.shut); gl.uniform1f(U.uGr, p.gr); gl.uniform1f(U.uFl, p.fl || 0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      },
      dispose() { const x = gl.getExtension('WEBGL_lose_context'); if (x) x.loseContext(); },
    };
  }
  // запасной вариант без WebGL: копии снимка со сдвигами усредняются (alpha = 1/(i+1) даёт равные веса)
  function mh2D(cv, shot, P) {
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, L = P.v * P.shut * w, n = L > 3 ? 8 : 1, base = -(P.p % 1) * w;
    c.clearRect(0, 0, w, h);
    for (let i = 0; i < n; i++) {
      const o = n > 1 ? (i / (n - 1) - 0.5) * L : 0;
      let x = (base - o) % w; if (x > 0) x -= w;
      c.globalAlpha = 1 / (i + 1);
      c.drawImage(shot, x, 0, w, h); c.drawImage(shot, x + w, 0, w, h);
    }
    c.globalAlpha = 1;
  }
  // дорожка времени: положение ленты экранов p (в экранах) и скорость v (экранов/с) в момент ms; si — номер текущего движения (для звука), ph — прогресс ускорения 0..1
  function mhTrack(T) {
    const segs = []; let t = T.pre, p = 0;
    T.swipes.forEach(([d, h]) => { segs.push({ t0: t, t1: t + d, p0: p }); t += d; p += 1; t += h; });
    const v0 = 1000 / T.swipes[T.swipes.length - 1][0], k = Math.log(T.vMax / v0), tb = t, pb = p, Ts = T.ramp / 1000;
    const at = (ms) => {
      if (ms >= tb) { const tau = Math.min(ms - tb, T.ramp) / 1000; return { p: pb + v0 * Ts / k * (Math.exp(k * tau / Ts) - 1), v: v0 * Math.exp(k * tau / Ts), ph: Math.min(1, (ms - tb) / T.ramp), si: segs.length }; }
      let done = 0;
      for (let i = 0; i < segs.length; i++) { const s = segs[i]; if (ms >= s.t0 && ms < s.t1) return { p: s.p0 + (ms - s.t0) / (s.t1 - s.t0), v: 1000 / (s.t1 - s.t0), ph: 0, si: i }; if (ms >= s.t1) done++; }
      return { p: done, v: 0, ph: 0, si: -1 };
    };
    return { at, segs, total: tb + T.ramp };
  }
  // синтезированные звуки (голос — необязательный файл): гул на надписи, шорох на каждом свайпе (выше и громче), нарастающий свист ускорения, удар на вспышке
  const sndMhTitle = () => { tone({ f0: 130, f1: 62, dur: 1.4, vol: 0.4 }); tone({ type: 'triangle', f0: 880, f1: 1320, dur: 1.2, vol: 0.04 }); };
  function mhNoise(a, dur, f0, f1, vol, peak, q = 1.1) {
    const n = Math.max(256, Math.floor(a.sampleRate * dur)), buf = a.createBuffer(1, n, a.sampleRate), ch = buf.getChannelData(0);
    for (let k = 0; k < n; k++) ch[k] = Math.random() * 2 - 1;
    const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(), t = a.currentTime;
    s.buffer = buf; f.type = 'bandpass'; f.Q.value = q;
    f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * peak); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(a.destination); s.start(t);
  }
  const sndMhWhoosh = (ms, i) => { const a = audio(); if (a) mhNoise(a, ms / 1000 * 1.15, 260 * Math.pow(1.28, i), 260 * Math.pow(1.28, i) * 3.2, 0.12 + 0.025 * i, 0.35); };
  const sndMhRise = (ms) => { const a = audio(); if (!a) return; mhNoise(a, ms / 1000, 600, 7000, 0.4, 0.85, 0.8); tone({ type: 'sawtooth', f0: 180, f1: 2400, dur: ms / 1000, vol: 0.05 }); };
  const sndMhBoom = () => { tone({ f0: 90, f1: 28, dur: 1.2, vol: 0.45 }); tone({ f0: 2400, f1: 400, dur: 0.5, vol: 0.06 }); };
  async function madeInHeavenReveal(dlg, reveal, snd, st) {
    const W = window.innerWidth, H = window.innerHeight, dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    const modal = dlg.querySelector('.jg-modal');
    const T = MH_T;
    const fx = document.createElement('div');
    fx.className = 'jg-fx jg-mh';
    fx.innerHTML = '<div class="jg-mh-fl" style="position:absolute;inset:0;background:#f4f6ff;opacity:0;pointer-events:none"></div>';
    const white = fx.firstElementChild;
    dlg.appendChild(fx);
    ui.fx = true; // с этого момента нажатия не проходят (слой .jg-fx их перехватывает)
    let dead = false, revealed = false, gl = null, c2 = null, mode = 'css';
    const doReveal = (d) => { if (revealed) return; revealed = true; reveal(d); };
    const bufName = await snd.mhName;
    // снимок окна на тёмном фоне — готовится, пока играет надпись
    const shotP = (async () => {
      const raw = await captureModal(modal, W, H, dpr, false);
      const shot = document.createElement('canvas'); shot.width = raw.width; shot.height = raw.height;
      const g = shot.getContext('2d'); g.fillStyle = MH_BG; g.fillRect(0, 0, shot.width, shot.height); g.drawImage(raw, 0, 0);
      g.getImageData(0, 0, 1, 1); // «заражённый» холст бросит SecurityError — тогда запасной вариант
      return shot;
    })().catch((e) => { console.warn('[JoJo Stands] Made in Heaven: снимок окна не вышел, запасной вариант', e); return null; });
    const sm = (a, b, u) => { const x = Math.min(1, Math.max(0, (u - a) / (b - a))); return x * x * (3 - 2 * x); };
    try {
      // 1) надпись как у D4C: бледно-фиолетовый размытый фон, нажатия не работают
      fx.style.transition = 'background-color .4s, backdrop-filter .4s, -webkit-backdrop-filter .4s';
      fx.style.background = 'rgba(255,255,255,.93)'; fx.style.backdropFilter = fx.style.webkitBackdropFilter = 'blur(6px)';
      const a = audio();
      let dT = T.title;
      if (a && bufName) {
        const [ns, ne] = audibleSpan(bufName);
        dT = Math.max(T.title, (ne - ns) * 1000 + 300);
        const src = a.createBufferSource(), g = a.createGain(), t = a.currentTime;
        src.buffer = bufName; g.gain.setValueAtTime(1, t); g.gain.setValueAtTime(1, t + (ne - ns) - 0.04); g.gain.linearRampToValueAtTime(0.0001, t + (ne - ns));
        src.connect(g); g.connect(a.destination); src.start(t, ns, ne - ns);
      } else sndMhTitle();
      const ttl = titleCard(fx, 'メイド・イン・ヘブン', 'MADE IN HEAVEN', 'mh');
      ttl.hide(dT - 250);
      await sleep(dT - 450);
      fx.style.background = ''; fx.style.backdropFilter = fx.style.webkitBackdropFilter = '';
      await sleep(450);
      // 2) окно подменяется холстом с тем же кадром (WebGL → 2D → CSS)
      const shot = await shotP;
      if (shot) {
        try { gl = createMhGL(W, H, dpr); if (gl) { gl.setScene(shot); mode = 'gl'; } } catch (e) { console.warn('[JoJo Stands] Made in Heaven: WebGL недоступен, 2D-вариант', e); if (gl) gl.dispose(); gl = null; }
        if (!gl) { c2 = document.createElement('canvas'); c2.className = 'jg-cr-gl'; c2.width = Math.round(W * dpr); c2.height = Math.round(H * dpr); mode = '2d'; }
      }
      const cv = gl ? gl.cv : c2;
      const P = { p: 0, v: 0, shut: T.shut0, gr: 0.35, fl: 0 };
      const tS = performance.now();
      const draw = () => {
        if (mode === 'gl') gl.draw({ ...P, time: (performance.now() - tS) / 1000 });
        else if (mode === '2d') mh2D(c2, shot, P);
        else { modal.style.transform = `translateX(${-(P.p % 1) * W}px)`; modal.style.filter = `blur(${Math.min(14, P.v * P.shut * W * 0.08)}px)`; }
      };
      if (cv) { fx.insertBefore(cv, white); draw(); await sleep(60); modal.style.visibility = 'hidden'; }
      // 3) свайпы с нарастающей скоростью → непрерывное ускорение → смаз
      const trk = mhTrack(T);
      let lastSi = -2;
      const t0 = performance.now();
      await new Promise((res) => {
        const f = (now) => {
          const ms = now - t0, s = trk.at(ms);
          P.p = s.p; P.v = s.v; P.shut = T.shut0 + (T.shut1 - T.shut0) * sm(0.45, 1, s.ph); P.gr = Math.min(1, 0.35 + s.p * 0.15);
          if (s.si !== lastSi) {
            lastSi = s.si;
            if (s.si >= 0 && s.si < trk.segs.length) sndMhWhoosh(trk.segs[s.si].t1 - trk.segs[s.si].t0, s.si);
            else if (s.si === trk.segs.length) sndMhRise(T.ramp);
          }
          draw();
          if (ms < trk.total && !dead) requestAnimationFrame(f); else res();
        };
        requestAnimationFrame(f);
      });
      // 4) финал: световая волна из центра заливает экран белым — под ней настоящее окно с результатом, оно «собирается» из света
      sndMhBoom();
      if (mode === 'gl') {
        const vEnd = P.v, pEnd = P.p;
        await new Promise((res) => {
          const tb = performance.now();
          const f = (now) => {
            const u = Math.min(1, (now - tb) / T.flash);
            P.fl = u * u * (3 - 2 * u); P.p = pEnd + vEnd * (now - tb) / 1000;
            draw();
            if (u < 1 && !dead) requestAnimationFrame(f); else res();
          };
          requestAnimationFrame(f);
        });
        white.style.transition = 'none'; white.style.opacity = 1;
      } else { white.style.transition = `opacity ${T.flash}ms ease-in`; white.style.opacity = 1; await sleep(T.flash + 30); }
      modal.style.transform = ''; modal.style.filter = ''; modal.style.visibility = '';
      if (cv) cv.style.display = 'none';
      doReveal(0.05);
      try { modal.animate([{ filter: 'brightness(2.6) blur(12px)', transform: 'scale(1.07)' }, { filter: 'brightness(1) blur(0px)', transform: 'scale(1)' }], { duration: T.tail, easing: 'cubic-bezier(.2,.7,.2,1)' }); } catch (e) { /* без анимации окна */ }
      void white.offsetWidth;
      white.style.transition = `opacity ${T.tail}ms ease-out`; white.style.opacity = 0;
      await sleep(T.tail);
    } finally {
      dead = true;
      modal.style.visibility = ''; modal.style.transform = ''; modal.style.filter = '';
      if (gl) gl.dispose();
      fx.remove(); ui.fx = false;
      doReveal(0.2); // если что-то пошло не так — результат всё равно покажется
    }
  }
  // poolId стенда -> анимация (добавляй сюда новые)
  const ANIMS = { 'the-world': timeStop, 'dirty-deeds-done-dirt-cheap': d4cReveal, 'cream': creamVoid, 'the-hand': handErase, 'silver-chariot': silverReveal, 'magicians-red': mrReveal, 'hierophant-green': hierophantReveal, 'star-platinum': starPlatinumReveal, 'heavens-door': heavensDoorReveal, 'killer-queen': killerQueenReveal, 'soft-and-wet': softWetReveal, 'king-crimson': kingCrimsonReveal, 'gold-experience': goldExperienceReveal, 'metallica': metallicaReveal, 'c-moon': cMoonReveal, 'made-in-heaven': madeInHeavenReveal };

  const ANIM_LABELS = { 'the-world': 'The World', 'dirty-deeds-done-dirt-cheap': 'D4C', 'cream': 'Cream', 'the-hand': 'The Hand', 'silver-chariot': 'Silver Chariot', 'magicians-red': "Magician's Red", 'hierophant-green': 'Hierophant Green', 'star-platinum': 'Star Platinum', 'heavens-door': "Heaven's Door", 'killer-queen': 'Killer Queen', 'soft-and-wet': 'Soft & Wet', 'king-crimson': 'King Crimson', 'gold-experience': 'Gold Experience', 'metallica': 'Metallica', 'c-moon': 'C-MOON', 'made-in-heaven': 'Made in Heaven' };

  return { sounds, ANIMS, ANIM_LABELS };
}
