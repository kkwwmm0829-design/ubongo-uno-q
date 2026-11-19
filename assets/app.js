// ============================================================
//  내 교구 — 화면과 규칙 (이 파일 하나만 바꿔서 교구를 만듭니다)
//
//  쓸 수 있는 것
//    onKey(key)  : 버튼·조이스틱이 눌릴 때마다 불림
//                  key = "A" "B" "C" "D" "UP" "DOWN" "LEFT" "RIGHT"
//    print({...}): 영수증 인쇄
//                  { title: "제목", lines: ["줄1","줄2"], big: "크게", qr: "QR 내용" }
//                  모두 선택. 결과는 onPrinted(ok, 이유) 로 돌아옴
//    beep(종류)  : "move" "ok" "no" "win"
//
//  키보드 시험: 방향키 = 조이스틱, 1 2 3 4 = 버튼 A B C D
// ============================================================

// ★★★ 여기부터 내 교구 ★★★  (평면 우봉고 — 초등 4학년)
// (원래 모스부호 코드는 assets/morse_backup.txt 에 보관)

// ================= 선생님이 고치는 곳 =================
const TIME = 60;            // 한 판 제한 시간(초)
const IDLE_MS = 90000;      // 이 시간 동안 아무것도 안 누르면 처음 화면으로 (기록도 지움)
const PLACE = '경남수학문화관 체험탐구관';
// 게임판: 글자 하나가 조각 하나 (. 은 빈칸). 정답 배치를 그대로 그린 것이라 항상 풀 수 있어요.
const PUZ = [
  { level: '쉬움',   map: ['.AA.', 'BBAC', 'BBCC', '..C.'] },
  { level: '쉬움',   map: ['AAA.', '.BAC', 'BBCC', 'B..C'] },
  { level: '보통',   map: ['AAAB', 'CADB', 'CCDB', '.DD.'] },
  { level: '보통',   map: ['AA...', 'AABCC', '.DBBC', 'DDDB.'] },
  { level: '어려움', map: ['AAA..', 'ABBBC', 'DDBCC', '.DDCC'] },
];
// ======================================================

const PC = { A: '#F2C230', B: '#E05A5A', C: '#4F86D9', D: '#4FB273', E: '#F08A3C' };

const CSS = `
.card{max-width:1240px;min-height:640px;padding:22px 32px;display:flex;flex-direction:column}
#screen{flex:1;display:flex;flex-direction:column;gap:10px}
.ub-top{display:flex;justify-content:space-between;align-items:center;gap:16px}
.ub-badge{background:var(--pill);color:var(--t);border-radius:999px;padding:8px 20px;font-size:1.4rem;white-space:nowrap}
.ub-boards{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px;margin-top:6px}
.ub-bc{background:#F2F4F8;border-radius:22px;border:5px solid transparent;padding:14px 8px;display:flex;flex-direction:column;align-items:center;gap:8px;font-size:1.5rem;transition:transform .1s}
.ub-bc.sel{border-color:var(--t);background:#fff;transform:scale(1.05);box-shadow:0 6px 20px rgba(60,70,100,.15)}
.ub-bc small{font-size:1.05rem;color:#7A849E}
.ub-res{font-size:1rem;border-radius:999px;padding:3px 12px}
.ub-res.ok{background:#DDF1E3;color:#2F7D4A}.ub-res.no{background:#FBE0E0;color:#C23B3B}.ub-res.yet{color:#A6AFC3}
.ub-mini{display:grid;gap:2px}.ub-mini i{width:var(--m);height:var(--m);border-radius:3px}
.ub-mini i.on{background:#EAD8AE;outline:1px solid #C9B07A}
.ub-howto{display:flex;flex-wrap:wrap;gap:10px 18px;justify-content:center;font-size:1.2rem;color:var(--ink);margin-top:14px}
.ub-howto span{background:#F2F4F8;border-radius:999px;padding:8px 18px}.ub-howto b{color:var(--t)}
.ub-timer{display:flex;align-items:center;gap:14px;flex:1;max-width:620px}
.ub-bar{flex:1;height:18px;border-radius:999px;background:#E3E7EF;overflow:hidden}
.ub-bar i{display:block;height:100%;background:#4FB273;transition:width .1s linear}
.ub-sec{font-size:2.2rem;min-width:3.2em;text-align:right;color:var(--ink)}
.ub-low .ub-bar i{background:#E05A5A}.ub-low .ub-sec{color:#E05A5A}
.ub-hint{text-align:center;font-size:1.5rem;color:var(--t);min-height:1.4em}
.ub-play{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:22px;align-items:center;flex:1}
.ub-bw{display:flex;justify-content:center}
.ub-grid{display:grid;gap:4px}
.ub-grid i{width:var(--c);height:var(--c);border-radius:8px;position:relative}
.ub-grid i.on{background:#EAD8AE;box-shadow:inset 0 0 0 2px #C9B07A}
.ub-grid i.f{box-shadow:inset 0 -6px 0 rgba(0,0,0,.18),inset 0 3px 0 rgba(255,255,255,.35)}
.ub-grid i.g::after{content:"";position:absolute;inset:0;border-radius:8px;background:var(--pc);opacity:.8;box-shadow:0 0 0 3px #3A4663,inset 0 3px 0 rgba(255,255,255,.4)}
.ub-grid i.g.bad::after{background:repeating-linear-gradient(45deg,var(--pc) 0 9px,#fff 9px 13px);box-shadow:0 0 0 3px #E05A5A}
.ub-grid i.sel{animation:ubblink .6s infinite alternate}
@keyframes ubblink{to{filter:brightness(1.3);box-shadow:0 0 0 3px #3A4663}}
.ub-tray{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.ub-tray h3{grid-column:1/-1;margin:0;font-weight:400;font-size:1.4rem;color:var(--t)}
.ub-pc{background:#F2F4F8;border-radius:18px;border:5px solid transparent;min-height:120px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:8px}
.ub-pc.cur{border-color:var(--t);background:#fff}
.ub-pc.act{border-color:#3A4663;border-style:dashed;background:#fff}
.ub-pc.done{opacity:.45}.ub-pc small{color:#7A849E;font-size:1rem}
.ub-pc .ub-mini i{border-radius:5px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)}
.ub-note{text-align:center;font-size:1.4rem;min-height:1.6em;color:#C23B3B}
.ub-note.good{color:#2F7D4A}
.ub-guide{display:flex;flex-wrap:wrap;gap:8px 14px;justify-content:center;font-size:1.1rem;color:#7A849E}
.ub-guide span{background:#F2F4F8;border-radius:999px;padding:6px 14px}.ub-guide b{color:var(--ink)}
.ub-ov{position:fixed;inset:0;background:rgba(40,50,70,.55);display:flex;align-items:center;justify-content:center;z-index:5}
.ub-box{background:#fff;border-radius:28px;padding:30px 44px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:14px;font-size:1.35rem;box-shadow:0 12px 40px rgba(0,0,0,.25);animation:ubpop .3s ease-out}
.ub-box h2{font-size:3rem;margin:0;color:var(--ink);font-weight:400}
.ub-pm{margin:0;min-height:1.4em;color:#2F7D4A;max-width:520px}
@keyframes ubpop{from{transform:scale(.7);opacity:0}}
.ub-cert{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:28px;align-items:center;flex:1}
.ub-paper{border:4px double var(--t);border-radius:18px;padding:20px 26px}
.ub-paper h2{margin:0 0 4px;font-weight:400;font-size:2rem;color:var(--ink)}
.ub-paper .pl{color:var(--t);font-size:1.05rem}
.ub-big{font-size:2.2rem;margin:10px 0}.ub-big b{font-weight:400;color:var(--t);font-size:2.8rem}
.ub-row{display:grid;grid-template-columns:64px minmax(0,1fr) auto;align-items:center;gap:12px;padding:5px 0;border-bottom:1px dashed #D5DBE7;font-size:1.25rem}
.ub-row b{font-weight:400;color:#7A849E;white-space:nowrap}.ub-row b.ok{color:#2F7D4A}
.ub-act{display:flex;flex-direction:column;gap:16px}
.ub-opt{font-size:1.8rem;padding:18px 26px;border-radius:24px;background:var(--t);color:#fff;text-align:center}
.ub-opt small{display:block;font-size:1.05rem;opacity:.85}
.ub-opt.sub{background:#F2F4F8;color:var(--t)}
.ub-msg{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;font-size:2.6rem;text-align:center}
.ub-msg .em{font-size:5.5rem}.ub-msg small{font-size:1.3rem;color:#7A849E}
.inlog{position:fixed;right:18px;bottom:14px;background:#3A4663;color:#fff;border-radius:999px;padding:6px 16px;font-size:1rem;opacity:0;transition:opacity .2s}
.inlog.show{opacity:.85}
`;
(function setup() {
  const st = document.createElement('style');
  st.textContent = CSS;
  document.head.appendChild(st);
  document.title = '평면 우봉고';
  const app = document.getElementById('app');
  if (!document.getElementById('screen')) app.innerHTML = '<div id="screen"></div>';
  const log = document.createElement('div');
  log.className = 'inlog'; log.id = 'inlog';
  document.body.appendChild(log);
})();

// ---------- 도형 계산 ----------
const norm = (cs) => { const mx = Math.min(...cs.map((c) => c[0])), my = Math.min(...cs.map((c) => c[1])); return cs.map((c) => [c[0] - mx, c[1] - my]).sort((a, b) => a[1] - b[1] || a[0] - b[0]); };
const rot = (cs) => norm(cs.map(([x, y]) => [-y, x]));        // 시계방향 90°
const flip = (cs) => norm(cs.map(([x, y]) => [-x, y]));       // 좌우 뒤집기
const dim = (cs) => [Math.max(...cs.map((c) => c[0])) + 1, Math.max(...cs.map((c) => c[1])) + 1];
function parse(p) {
  const W = Math.max(...p.map.map((r) => r.length)), H = p.map.length, on = new Set(), g = {};
  p.map.forEach((r, y) => [...r].forEach((ch, x) => { if (ch !== '.') { on.add(x + ',' + y); (g[ch] = g[ch] || []).push([x, y]); } }));
  return { W, H, on, map: p.map, pieces: Object.keys(g).sort().map((k) => ({ k, cells: norm(g[k]) })) };
}
const BOARDS = PUZ.map(parse);

// ---------- 상태 ----------
let S = { scr: 'home', sel: 0 };
let results = PUZ.map(() => null);
let G = null, timerId = null, idleT = null, doneT = null, lockUntil = 0;
const $ = (id) => document.getElementById(id);
const lock = (ms) => (lockUntil = Date.now() + ms);

function miniBoard(b, m, sol) {
  let h = `<div class="ub-mini" style="--m:${m}px;grid-template-columns:repeat(${b.W},${m}px)">`;
  for (let y = 0; y < b.H; y++) for (let x = 0; x < b.W; x++) {
    if (!b.on.has(x + ',' + y)) { h += '<i></i>'; continue; }
    h += sol ? `<i style="background:${PC[b.map[y][x]]}"></i>` : '<i class="on"></i>';
  }
  return h + '</div>';
}
function miniPiece(cs, k, m) {
  const [w, h] = dim(cs), s = new Set(cs.map((c) => c + ''));
  let o = `<div class="ub-mini" style="--m:${m}px;grid-template-columns:repeat(${w},${m}px)">`;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) o += s.has(x + ',' + y) ? `<i style="background:${PC[k]}"></i>` : '<i style="box-shadow:none"></i>';
  return o + '</div>';
}

// ---------- 게임 ----------
function startGame(i) {
  const b = BOARDS[i];
  G = {
    i, b, mode: 'move', sel: 0, act: 0, end: Date.now() + TIME * 1000, left: TIME, note: '', noteCls: '', over: null,
    ps: b.pieces.map((p) => {   // 조각은 매번 돌리거나 뒤집힌 채로 나옴
      let cs = p.cells; const r = 1 + Math.floor(Math.random() * 3);
      for (let n = 0; n < r; n++) cs = rot(cs);
      if (Math.random() < 0.5) cs = flip(cs);
      return { k: p.k, cells: cs, placed: false, x: 0, y: 0 };
    }),
  };
  S = { scr: 'play', sel: i };
  clearInterval(timerId); timerId = setInterval(tick, 100);
  lock(300); beep('ok'); render();
}
function tick() {
  if (!G || G.over) return;
  const l = Math.max(0, (G.end - Date.now()) / 1000);
  if (Math.ceil(l) !== Math.ceil(G.left) && l <= 10 && l > 0) beep('move');
  G.left = l;
  const t = document.querySelector('.ub-timer');
  if (t) { t.classList.toggle('ub-low', l <= 10); t.querySelector('.ub-bar i').style.width = (l / TIME * 100) + '%'; t.querySelector('.ub-sec').textContent = Math.ceil(l) + '초'; }
  if (l <= 0) finish(false);
}
function occ(skip) { const m = {}; G.ps.forEach((p, j) => { if (p.placed && j !== skip) p.cells.forEach((c) => (m[(p.x + c[0]) + ',' + (p.y + c[1])] = j)); }); return m; }
function fits(p, skip) { const o = occ(skip); return p.cells.every((c) => { const k = (p.x + c[0]) + ',' + (p.y + c[1]); return G.b.on.has(k) && o[k] === undefined; }); }
function clamp(p) { const [w, h] = dim(p.cells); p.x = Math.max(0, Math.min(G.b.W - w, p.x)); p.y = Math.max(0, Math.min(G.b.H - h, p.y)); }
function finish(ok) {
  clearInterval(timerId);
  const left = Math.ceil(G.left);
  results[G.i] = { ok, used: TIME - left };
  G.over = ok ? 'win' : 'lose';
  beep(ok ? 'win' : 'no'); lock(800); render();
}
function afterGame() {
  G = null;
  if (results.every(Boolean)) S = { scr: 'cert', sel: 0 };
  else { const n = results.findIndex((r) => !r); S = { scr: 'home', sel: n >= 0 ? n : 0 }; }
  lock(300); render();
}
function goHome(clear) {
  clearInterval(timerId); clearTimeout(doneT);
  if (clear) results = PUZ.map(() => null);
  G = null; S = { scr: 'home', sel: 0 }; lock(300); render();
}

// ---------- 입력 ----------
// A 판·조각 고르기 · B 시계방향 90° 돌리기 · C 뒤집기 · D 완성·다음 단계(시작, 놓기, 다음, 인쇄)
// 조이스틱 ▲▼◀▶ = 조각을 한 칸씩 옮기기 (첫 화면에서는 ◀▶로 판 고르기)
const NAMES = { A: 'A 고르기', B: 'B 돌리기', C: 'C 뒤집기', D: 'D 다음', UP: '▲', DOWN: '▼', LEFT: '◀', RIGHT: '▶' };
let logT = null;
function onKey(key) {
  const log = $('inlog'); // 들어온 입력을 오른쪽 아래에 잠깐 보여 줌 (배선 확인용)
  if (log) { log.textContent = '입력 ' + (NAMES[key] || key); log.classList.add('show'); clearTimeout(logT); logT = setTimeout(() => log.classList.remove('show'), 900); }
  resetIdle();
  safe(key);
}
function safe(k) { try { handleKey(k); } catch (e) { console.error(e); const log = $('inlog'); if (log) { log.textContent = '오류: ' + e.message; log.classList.add('show'); } } }

// A: 다음 조각으로 바꾸기. 놓은 조각도 차례대로 다시 골라 고칠 수 있음.
//    다시 들었던 조각을 고치지 않고 A로 지나가면 그 자리에 도로 놓아 둠
function nextPiece() {
  const n = G.ps.length, cur = G.act, p0 = G.ps[cur];
  if (G.lift === cur && fits(p0, cur)) p0.placed = true;
  G.lift = -1;
  const next = (cur + 1) % n, p = G.ps[next];
  if (p.placed) { p.placed = false; G.lift = next; G.note = '놓았던 조각을 다시 골랐어요 · 고쳐서 D로 놓기 (A = 그대로 두고 다음)'; G.noteCls = 'good'; }
  else { p.x = 0; p.y = 0; }
  G.act = next; G.sel = next; clamp(p);
}

function handleKey(k) {
  if (Date.now() < lockUntil) return;
  if (S.scr === 'home') {
    if (k === 'A' || k === 'RIGHT') { S.sel = (S.sel + 1) % 5; beep('move'); }
    else if (k === 'LEFT') { S.sel = (S.sel + 4) % 5; beep('move'); }
    else if (k === 'D') return startGame(S.sel);
    else return;
    return render();
  }
  if (S.scr === 'cert') {
    if (k === 'D') return doPrint();
    if (k === 'A') {
      if (S.ask) return goHome(true);
      S.ask = true; beep('no'); return render();
    }
    if (S.ask) { S.ask = false; render(); }
    return;
  }
  if (S.scr === 'printing') return;
  if (S.scr === 'done') {
    if (k === 'D') return S.ok ? goHome(true) : doPrint();
    if (k === 'A') return goHome(true);
    return;
  }
  if (S.scr !== 'play' || !G) return;
  if (G.over) {   // 판이 끝난 창: C = 이 판 인쇄 (성공했을 때), D = 다음 단계
    if (k === 'D') afterGame();
    else if (k === 'C' && G.over === 'win') printStage();
    return;
  }
  G.note = ''; G.noteCls = '';
  const p = G.ps[G.act];
  if (k === 'UP') p.y--;
  else if (k === 'DOWN') p.y++;
  else if (k === 'LEFT') p.x--;
  else if (k === 'RIGHT') p.x++;
  else if (k === 'B') p.cells = rot(p.cells);
  else if (k === 'C') p.cells = flip(p.cells);
  else if (k === 'A') { nextPiece(); beep('move'); return render(); }
  else if (k === 'D') {
    if (fits(p, G.act)) {
      p.placed = true; beep('ok');
      if (G.ps.every((q) => q.placed)) return finish(true);
      const nx = G.ps.findIndex((q) => !q.placed);
      const q = G.ps[nx]; q.x = 0; q.y = 0; clamp(q); G.act = nx; G.sel = nx;
    } else { G.note = '여기에는 놓을 수 없어요! 자리를 다시 맞춰 봐요 (A = 다른 조각)'; beep('no'); }
    return render();
  } else return;
  beep('move'); clamp(p); render();
}

// ---------- 확인증 인쇄 (영수증 프린터) ----------
function stamp() { const d = new Date(), z = (v) => String(v).padStart(2, '0'); return `${d.getFullYear()}.${z(d.getMonth() + 1)}.${z(d.getDate())} ${z(d.getHours())}:${z(d.getMinutes())}`; }
const rLine = (r) => (r.ok ? `성공 (${r.used}초)` : '도전 완료');
function stampK() { const d = new Date(), z = (v) => String(v).padStart(2, '0'); return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${z(d.getHours())}:${z(d.getMinutes())}`; }
// 아이가 실제로 채운 모양 그대로 (글자 하나가 조각 하나, . 은 빈칸)
function stageGrid() {
  const o = occ(-1), rows = [];
  for (let y = 0; y < G.b.H; y++) { let r = ''; for (let x = 0; x < G.b.W; x++) { const j = o[x + ',' + y]; r += j === undefined ? '.' : G.ps[j].k; } rows.push(r); }
  return rows;
}
// 판 하나를 성공했을 때 그 판만 인쇄: 성공 글자 + 판 그림 + 오늘 날짜·시간
function printStage() {
  if (G.printing === 'wait') return;
  if (G.printing === 'ok') { G.printMsg = '이 판은 벌써 인쇄했어요 · D로 다음 단계'; beep('no'); return render(); }
  const r = results[G.i];
  G.printing = 'wait'; G.printMsg = '🖨️ 인쇄 중…'; beep('ok'); render();
  clearTimeout(doneT);
  doneT = setTimeout(() => onPrinted(false, '프린터 응답 없음 (20초)'), 20000);
  if (LOCAL) return setTimeout(() => onPrinted(false, '보드 없음 — 키보드 시험 모드에서는 인쇄되지 않아요'), 600);
  print({ title: `평면 우봉고 ${G.i + 1}번 판`, lines: [PLACE, `${PUZ[G.i].level} · 조각 ${G.ps.length}개 · ${r.used}초 만에 완성`],
          big: '성공!', grid: stageGrid(), time: stampK() });
}
function doPrint() {
  const ok = results.filter((r) => r.ok).length;
  const lines = [PLACE, '', '이름 : ____________________', ''];
  results.forEach((r, i) => lines.push(`${i + 1}번 판 (${PUZ[i].level})   ${rLine(r)}`));
  lines.push('', '조각을 돌리고 뒤집으며 도형과', '공간 감각을 키웠음을 확인합니다.');
  const qr = `${PLACE}\n평면 우봉고 체험확인증\n${stampK()}\n5문제 중 ${ok}문제 성공\n` + results.map((r, i) => `${i + 1}번 판(${PUZ[i].level}) ${rLine(r)}`).join('\n');
  S = { scr: 'printing' }; lock(500); render();
  clearTimeout(doneT);
  doneT = setTimeout(() => onPrinted(false, '프린터 응답 없음 (20초)'), 20000); // 응답이 안 오면 멈추지 않게
  if (LOCAL) return setTimeout(() => onPrinted(false, '보드 없음 — 키보드 시험 모드에서는 인쇄되지 않아요'), 600);
  print({ title: '평면 우봉고 체험 확인증', lines, big: `${ok}/5 성공`, qr, time: stampK() });
}
function onPrinted(ok, why) {
  if (S.scr === 'play' && G && G.printing === 'wait') {   // 판 인쇄 결과
    clearTimeout(doneT);
    G.printing = ok ? 'ok' : 'fail';
    G.printMsg = ok ? '인쇄했어요! 영수증을 가져가세요' : '인쇄 실패 — ' + (why || '') + ' (C로 다시)';
    beep(ok ? 'win' : 'no'); return render();
  }
  if (S.scr !== 'printing') return;
  clearTimeout(doneT);
  S = { scr: 'done', ok, why: why || '' };
  beep(ok ? 'win' : 'no'); lock(800); render();
  if (ok) doneT = setTimeout(() => goHome(true), 8000);   // 인쇄되면 잠시 후 다음 친구 차례
}
function resetIdle() {
  clearTimeout(idleT);
  idleT = setTimeout(() => { if (S.scr !== 'printing' && (S.scr !== 'home' || results.some(Boolean))) goHome(true); }, IDLE_MS);
}

// ---------- 화면 ----------
function render() {
  const el = $('screen');
  if (!el) return;
  el.innerHTML = { home: vHome, play: vPlay, cert: vCert, printing: vPrinting, done: vDone }[S.scr]();
}

function vHome() {
  const done = results.filter(Boolean).length;
  return `<h1>평면 우봉고</h1>
  <p class="sub">A로 판을 고르고 D로 시작해요 — 한 판에 1분, 모두 5문제 (도전한 판 ${done}/5)</p>
  <div class="ub-boards">${BOARDS.map((b, i) => {
    const r = results[i];
    return `<div class="ub-bc${i === S.sel ? ' sel' : ''}">${i + 1}번 판${miniBoard(b, 18)}<small>${PUZ[i].level} · 조각 ${b.pieces.length}개</small>
      ${r ? (r.ok ? `<span class="ub-res ok">성공 ${r.used}초</span>` : '<span class="ub-res no">도전 완료</span>') : '<span class="ub-res yet">아직 안 함</span>'}</div>`;
  }).join('')}</div>
  <div class="ub-howto">
    <span><b>A</b> 판·조각 고르기</span><span><b>B</b> 90° 돌리기</span>
    <span><b>C</b> 뒤집기</span><span><b>D</b> 완성·다음 단계</span>
    <span>조이스틱 <b>▲▼◀▶</b> 조각 옮기기</span>
  </div>`;
}

function vPlay() {
  const b = G.b, el = $('screen');
  const avail = Math.min((el ? el.clientWidth : 1100) * 0.55, 600);
  const c = Math.max(40, Math.min(92, Math.floor(avail / b.W) - 4));
  const o = occ(G.mode === 'move' ? G.act : -1), ghost = {};
  let bad = false;
  if (G.mode === 'move') { const p = G.ps[G.act]; bad = !fits(p, G.act); p.cells.forEach((q) => (ghost[(p.x + q[0]) + ',' + (p.y + q[1])] = 1)); }
  let cells = '';
  for (let y = 0; y < b.H; y++) for (let x = 0; x < b.W; x++) {
    const k = x + ',' + y, j = o[k];
    let cls = b.on.has(k) ? 'on' : '', st = '';
    if (j !== undefined) { cls += ' f'; st = `background:${PC[G.ps[j].k]};`; if (G.mode === 'pick' && j === G.sel) cls += ' sel'; }
    if (ghost[k]) { cls += ' g' + (bad ? ' bad' : ''); st += `--pc:${PC[G.ps[G.act].k]}`; }
    cells += `<i class="${cls}" style="${st}"></i>`;
  }
  const l = G.left, placed = G.ps.filter((p) => p.placed).length;
  const hint = '조이스틱으로 옮기고, 맞는 자리를 찾으면 D로 놓아요';
  const over = !G.over ? '' : G.over === 'win'
    ? `<div class="ub-ov"><div class="ub-box"><h2>성공!</h2><p>${G.i + 1}번 판을 <b>${results[G.i].used}초</b> 만에 채웠어요</p>${miniBoard(b, 30, true)}<p class="ub-pm">${G.printMsg || ''}</p><p><b>C</b> = 이 판 인쇄 · <b>D</b> = 다음 단계</p></div></div>`
    : `<div class="ub-ov"><div class="ub-box"><h2>시간 끝!</h2><p>이렇게 놓으면 딱 맞아요. 다음에 다시 도전해 봐요</p>${miniBoard(b, 30, true)}<p><b>D</b> = 다음 단계</p></div></div>`;
  return `<div class="ub-top"><span class="ub-badge">${G.i + 1}번 판 · ${PUZ[G.i].level}</span>
    <div class="ub-timer${l <= 10 ? ' ub-low' : ''}"><div class="ub-bar"><i style="width:${l / TIME * 100}%"></i></div><span class="ub-sec">${Math.ceil(l)}초</span></div></div>
  <div class="ub-hint">${hint}</div>
  <div class="ub-play"><div class="ub-bw"><div class="ub-grid" style="--c:${c}px;grid-template-columns:repeat(${b.W},${c}px)">${cells}</div></div>
    <div class="ub-tray"><h3>조각 상자 (${placed}/${G.ps.length} 놓음)</h3>${G.ps.map((p, j) => `
      <div class="ub-pc${G.mode === 'pick' && j === G.sel ? ' cur' : ''}${G.mode === 'move' && j === G.act ? ' act' : ''}${p.placed ? ' done' : ''}">${miniPiece(p.cells, p.k, 24)}
      <small>${p.placed ? '놓음' : j === G.act ? '옮기는 중' : '조각 ' + (j + 1) + ' · A로 고르기'}</small></div>`).join('')}</div></div>
  <div class="ub-note ${G.noteCls}">${G.note}</div>
  <div class="ub-guide"><span><b>A</b> 다른 조각</span><span><b>B</b> 90° 돌리기</span><span><b>C</b> 뒤집기</span><span><b>▲▼◀▶</b> 옮기기</span><span><b>D</b> 놓기</span></div>${over}`;
}

function vCert() {
  const ok = results.filter((r) => r.ok).length;
  return `<h1>체험 확인증</h1>
  <div class="ub-cert"><div class="ub-paper"><span class="pl">${PLACE}</span><h2>평면 우봉고 체험 확인증</h2>
    <div class="ub-big">5문제 중 <b>${ok}</b>문제 성공!</div>
    ${results.map((r, i) => `<div class="ub-row">${miniBoard(BOARDS[i], 11, r.ok)}<span>${i + 1}번 판 · ${PUZ[i].level}</span><b class="${r.ok ? 'ok' : ''}">${rLine(r)}</b></div>`).join('')}</div>
    <div class="ub-act">
      <div class="ub-opt">확인증 인쇄하기<small>D 버튼 — QR코드가 들어간 영수증이 나와요</small></div>
      <div class="ub-opt sub">${S.ask ? '한 번 더 A를 누르면 기록을 지우고 처음으로' : '다음 친구 시작'}<small>A 버튼 두 번</small></div>
    </div></div>`;
}
function vPrinting() { return '<div class="ub-msg"><span class="em">🖨️</span>인쇄 중…<small>잠깐만 기다려 주세요</small></div>'; }
function vDone() {
  return S.ok
    ? '<div class="ub-msg"><span class="em">🎉</span>확인증을 가져가세요!<small>잠시 후 다음 친구 차례로 넘어가요 · D 를 누르면 바로</small></div>'
    : `<div class="ub-msg"><span class="em">😢</span>인쇄 실패<small>${S.why}</small><small>D 다시 인쇄 · A 처음으로</small></div>`;
}

addEventListener('resize', () => { if (S.scr === 'play') render(); });

// 컴퓨터에서 파일로 연 경우 (보드 화면이 아님) → 키보드 시험 모드라고 알려 줌
const LOCAL = location.protocol === 'file:';
if (LOCAL) setTimeout(() => { const c = $('conn'); if (c) c.textContent = '키보드 시험 모드 — 진짜 버튼은 보드 화면(http://보드IP:7000)에서'; }, 0);

// 한글 입력기가 켜져 있어 숫자·방향키가 'Process' 로 올 때도 받기
const CODE_KB = { Digit1: 'A', Digit2: 'B', Digit3: 'C', Digit4: 'D', Numpad1: 'A', Numpad2: 'B', Numpad3: 'C', Numpad4: 'D',
  ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT' };
document.addEventListener('keydown', (e) => {
  if (e.key === 'Process' && CODE_KB[e.code]) { e.preventDefault(); onKey(CODE_KB[e.code]); }
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') goHome(true); });

render();
// ★★★ 여기까지 내 교구 ★★★


// ---------- 아래는 고치지 않아도 됨 ----------
let print = () => onPrinted(false, '보드 없음');
(function () {
  try {
    const ui = new WebUI();
    ui.on_connect(() => (document.getElementById('conn').textContent = '● 보드 연결됨'));
    ui.on_disconnect(() => (document.getElementById('conn').textContent = '○ 보드 끊김'));
    ui.on_message('input', (d) => onKey(d.key));
    ui.on_message('print_response', (r) => onPrinted(!!(r && r.ok), r && r.via));
    print = (data) => ui.send_message('print', data);
  } catch (e) {
    document.getElementById('conn').textContent = '보드 없음 — 키보드 시험 모드';
  }
  const KB = { ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT', 1: 'A', 2: 'B', 3: 'C', 4: 'D' };
  document.addEventListener('keydown', (e) => { if (KB[e.key]) { e.preventDefault(); onKey(KB[e.key]); } });
})();

let _ac = null;
function beep(kind) {
  const F = { move: [[660, 0.04]], ok: [[660, 0.1], [880, 0.1], [1320, 0.1]], no: [[220, 0.15], [180, 0.15]],
              win: [[523, 0.12], [659, 0.12], [784, 0.12], [1046, 0.2]] }[kind] || [[660, 0.05]];
  try {
    _ac = _ac || new (window.AudioContext || window.webkitAudioContext)();
    let t = _ac.currentTime;
    F.forEach(([f, len]) => {
      const o = _ac.createOscillator(), g = _ac.createGain();
      o.type = 'square'; o.frequency.value = f; g.gain.value = 0.06;
      o.connect(g); g.connect(_ac.destination); o.start(t); o.stop(t + len * 0.9); t += len;
    });
  } catch (e) {}
}
