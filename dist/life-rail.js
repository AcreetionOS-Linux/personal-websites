// ============================================================================
// life-rail.js — right-side icon bar + slide-in "life" panels (dynamic build)
//
// CLASSIC SCRIPT (not an ES module) so it also works when index.html is opened
// straight from the file system (file://) — browsers block module scripts and
// fetch() there. marked comes from assets/marked.min.js (classic UMD); the
// markdown for file:// viewing comes from assets/md-fallback.js (regenerate it
// after editing the .md files). On the live site, fetch() wins and the .md
// files are the source of truth.
//
// Features:
//   - icon rail on the right edge; monochrome flag = Politics & Views
//   - slide-in panel rendered by a REAL markdown reader (marked)
//   - hash routing: #politics opens the panel, browser Back closes it
//   - theme inheritance: reads the app's CSS variables, falls back to site
//     colors (#0a0a0f / #7c3aed)
//   - sticky Part I–XXII chips + IntersectionObserver auto-highlight
//   - live in-panel search over the rendered markdown
//   - reading progress bar
//   - scroll-aware rail (fades over the hero, collapses on scroll down)
//   - one-time gentle auto-open per session
//   - styled tooltips, flag pulse, prefers-reduced-motion respected
//   - mobile: rail becomes a bottom dock, panel goes full-screen
//
// Documents rendered (update either .md → page updates, no rebuild):
//   political-stance.md   (short views)
//   politics-deep-dive.md (Parts I–XXII)
// ============================================================================

const MARKED = window.marked;
const STYLE_ID = 'lr-style';
const MD_URL = 'political-stance.md';
const MD_URL2 = 'politics-deep-dive.md';
const MD_URL3 = 'my-story.md';
const MD_URL4 = 'not-so-great.md';
const MD_URL5 = 'the-long-road.md';
const MD_URL6 = 'stillwater.md';
const GATE_KEY = 'lr-dark-gate';
const AUTO_OPEN_KEY = 'lr-auto-open-done';

// ---------------------------------------------------------------------------
// theme — inherit the app's design tokens when it exposes them
// ---------------------------------------------------------------------------
function detectTheme() {
  const cs = getComputedStyle(document.documentElement);
  const pick = (names, fallback) => {
    for (const n of names) {
      const v = cs.getPropertyValue(n).trim();
      if (v) return v;
    }
    return fallback;
  };
  return {
    bg: pick(['--background', '--bg', '--color-bg', '--page-bg'], '#0a0a0f'),
    panel: pick(['--panel-bg', '--card-bg', '--surface'], '#121218'),
    accent: pick(['--accent', '--primary', '--color-accent', '--brand'], '#7c3aed'),
    text: pick(['--text', '--color-text', '--fg'], '#e1e1e6'),
    muted: pick(['--muted', '--color-muted'], '#a1a1aa'),
    soft: pick(['--soft', '--subtle'], 'rgba(255,255,255,.06)'),
  };
}

// ---------------------------------------------------------------------------
// icons — one per room of the house
// ---------------------------------------------------------------------------
const ICONS = [
  {
    id: 'politics',
    icon: 'fa-flag-usa', // the monochrome american flag
    label: 'Politics & Views',
    active: true,
  },
  {
    id: 'story',
    icon: 'fa-book-open',
    label: 'My Story',
    active: true,
  },
  {
    id: 'dark',
    icon: 'fa-skull',
    label: 'The Not So Great',
    active: true,
    gate: true,
  },
  {
    id: 'stillwater',
    icon: 'fa-map-location-dot',
    label: 'Coming Out in Stillwater — the real story',
    active: true,
  },
  {
    id: 'faith',
    icon: 'fa-book-bible',
    label: 'Faith — coming soon',
    inert: true,
  },
  {
    id: 'identity',
    icon: 'fa-heart',
    label: 'Identity — coming soon',
    inert: true,
  },
  {
    id: 'sexuality',
    icon: 'fa-venus-mars',
    label: 'Sexuality — coming soon',
    inert: true,
  },
];

// ---------------------------------------------------------------------------
// the "avoiding politics is bullshit" argument — leads the panel
// ---------------------------------------------------------------------------
const INTRO_HTML = `
  <div class="lr-intro">
    <h2>&ldquo;I don't do politics.&rdquo; &mdash; Bullshit. You do.</h2>
    <p>Avoiding politics isn't a position. It's a <em>posture</em>. And it's
    the one luxury that people who can't afford to ignore politics never get.</p>
    <p>Think about it. Your rent. Your paycheck. The laws that decide who can
    marry, who can exist, who gets healthcare and who gets handcuffed. None of
    that stops being political just because you refuse to look at it. Politics
    isn't a topic you can skip &mdash; it's the room you're already standing in.
    The only question is whether you open your eyes while you're in it.</p>
    <p>&ldquo;Staying out of it&rdquo; is an illusion. The quiet person at the
    table isn't neutral &mdash; they're the one everyone else gets to decide
    <strong>for</strong>. Silence doesn't keep the peace. It just signs the
    paperwork for whoever is loudest. You don't get to abstain from the vote
    that's happening over your own head.</p>
    <p>I know why people say it. &ldquo;I don't want to lose friends over
    it.&rdquo; &ldquo;I don't want to think about it.&rdquo; It's uncomfortable.
    It's messy. It's easier to pretend the world isn't being decided by people
    who don't have your interests at heart. But not talking about politics
    doesn't make it go away &mdash; it makes you a bystander in your own life,
    and bystanders still get collected.</p>
    <p>So here's my stance. Out loud. All of it. No mask, no hedging, no
    &ldquo;both sides&rdquo; cowardice. You don't have to agree with a word of
    it &mdash; but you're done pretending &ldquo;not talking about it&rdquo; is
    an option. That illusion ends here. ❤️</p>
  </div>
`;

// ---------------------------------------------------------------------------
// the "my story" intro — leads the story panel
// ---------------------------------------------------------------------------
const STORY_INTRO_HTML = `
  <div class="lr-intro">
    <h2>My Story</h2>
    <p>Family, foster care, the closet, the illnesses, the rebuild &mdash; everything
    that made me, in the order it made me. The good version of the rack is here;
    the parts that need a warning sign live in <strong>The Not So Great</strong>
    (skull icon on the rail).</p>
  </div>
`;

// ---------------------------------------------------------------------------
// css — prefixed `lr-` so it can't fight the rest of the site
// ---------------------------------------------------------------------------
const CSS = `
/* ---- file:// fallback backdrop (main app can't run from disk) ---- */
body.lr-naked{background:var(--lr-bg, #0a0a0f);min-height:100vh;margin:0;}

.lr-rail{
  position:fixed;top:96px;right:12px;z-index:9992;
  display:flex;flex-direction:column;gap:10px;
  transition:opacity .25s ease,transform .25s ease;
}
.lr-rail-away{opacity:0;pointer-events:none;transform:translateX(60px);}
.lr-rail-collapse{opacity:.3;transform:translateX(16px);}
@media (min-width:561px){ .lr-rail:hover{opacity:1!important;transform:none!important;} }

.lr-rail-btn{
  width:46px;height:46px;border-radius:12px;
  border:1px solid rgba(255,255,255,.09);
  background:var(--lr-bg-soft, rgba(10,10,15,.72));
  color:var(--lr-text, #e1e1e6);
  display:flex;align-items:center;justify-content:center;
  font-size:19px;line-height:1;
  cursor:pointer;
  box-shadow:0 4px 14px rgba(0,0,0,.35);
  transition:background .2s,border-color .2s,color .2s,transform .15s,box-shadow .2s;
}
.lr-rail-btn:hover{background:rgba(124,58,237,.18);border-color:rgba(124,58,237,.55);color:#fff;transform:translateY(-1px);}
.lr-rail-btn:active{transform:translateY(1px);}
.lr-rail-btn:focus-visible{outline:2px solid var(--lr-accent, #7c3aed);outline-offset:2px;}
.lr-rail-btn.active{
  background:rgba(124,58,237,.22);border-color:rgba(124,58,237,.6);color:#fff;
  animation:lrPulse 2.4s ease-in-out infinite;
}
@keyframes lrPulse{
  0%,100%{box-shadow:0 0 12px rgba(124,58,237,.35),0 4px 14px rgba(0,0,0,.35);}
  50%{box-shadow:0 0 26px rgba(124,58,237,.65),0 4px 14px rgba(0,0,0,.35);}
}
.lr-rail-btn.inert{opacity:.32;cursor:default;box-shadow:none;animation:none;}
.lr-rail-btn.inert:hover{background:var(--lr-bg-soft, rgba(10,10,15,.72));border-color:rgba(255,255,255,.09);color:var(--lr-text, #e1e1e6);transform:none;}

.lr-tooltip{
  position:fixed;z-index:9995;transform:translateY(-50%);
  background:#1a1a22;border:1px solid rgba(255,255,255,.12);
  color:#e4e4e7;font-size:12px;line-height:1.4;padding:6px 10px;border-radius:8px;
  white-space:nowrap;pointer-events:none;
  opacity:0;visibility:hidden;transition:opacity .15s ease,visibility .15s;
}
.lr-tooltip-show{opacity:1;visibility:visible;}

.lr-panel{
  position:fixed;top:96px;right:68px;z-index:9993;
  width:min(620px,calc(100vw - 92px));
  max-height:calc(100vh - 160px);
  background:var(--lr-panel, #121218);
  border:1px solid rgba(255,255,255,.09);
  border-radius:16px;
  box-shadow:0 24px 70px rgba(0,0,0,.6);
  display:flex;flex-direction:column;
  transform:translateX(calc(100% + 90px));
  opacity:0;pointer-events:none;
  transition:transform .4s cubic-bezier(.22,.9,.24,1),opacity .32s ease;
}
.lr-panel.lr-open{transform:translateX(0);opacity:1;pointer-events:auto;}

.lr-progress{
  position:absolute;top:0;left:0;height:3px;width:0%;
  background:linear-gradient(90deg,var(--lr-accent, #7c3aed),#c084fc);
  border-radius:99px 0 0 0;z-index:6;
}

.lr-backdrop{
  position:fixed;inset:0;z-index:9991;
  background:rgba(5,5,9,.55);
  opacity:0;visibility:hidden;
  transition:opacity .3s ease,visibility .3s;
}
.lr-backdrop.lr-open{opacity:1;visibility:visible;}

.lr-panel-head{
  display:flex;align-items:center;justify-content:space-between;gap:12px;
  padding:16px 18px 14px;
  border-bottom:1px solid rgba(255,255,255,.07);
}
.lr-panel-title{
  display:flex;align-items:center;gap:10px;
  font-size:16px;font-weight:600;color:#f4f4f5;letter-spacing:.2px;
}
.lr-panel-title i{color:var(--lr-accent, #7c3aed);font-size:17px;}
.lr-close{
  width:32px;height:32px;border-radius:9px;
  border:1px solid rgba(255,255,255,.1);
  background:rgba(255,255,255,.05);color:#a1a1aa;
  font-size:14px;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  transition:background .2s,color .2s,border-color .2s;
}
.lr-close:hover{background:rgba(124,58,237,.2);color:#fff;border-color:rgba(124,58,237,.5);}
.lr-close:focus-visible{outline:2px solid var(--lr-accent, #7c3aed);outline-offset:2px;}

.lr-panel-body{
  flex:1;min-height:0;
  overflow-y:auto;padding:0 22px 26px;
  scrollbar-width:thin;scrollbar-color:rgba(124,58,237,.5) transparent;
}
.lr-panel-body::-webkit-scrollbar{width:8px;}
.lr-panel-body::-webkit-scrollbar-thumb{background:rgba(124,58,237,.45);border-radius:99px;}

/* ---- sticky nav: part chips + search ---- */
.lr-toc{
  position:sticky;top:0;z-index:4;
  display:flex;align-items:center;gap:8px;
  padding:10px 0;margin:0 -22px 4px;
  background:var(--lr-panel, #121218);
  border-bottom:1px solid rgba(255,255,255,.06);
}
.lr-toc-chips{
  display:flex;gap:6px;overflow-x:auto;flex:1;min-width:0;
  scrollbar-width:none;
}
.lr-toc-chips::-webkit-scrollbar{display:none;}
.lr-toc-chip{
  flex:0 0 auto;padding:4px 11px;border-radius:99px;
  border:1px solid rgba(255,255,255,.12);
  background:rgba(255,255,255,.05);color:#a1a1aa;
  font-size:11.5px;cursor:pointer;white-space:nowrap;
  transition:background .15s,color .15s,border-color .15s;
}
.lr-toc-chip:hover{background:rgba(124,58,237,.15);color:#e4e4e7;}
.lr-toc-chip.active{background:rgba(124,58,237,.28);border-color:rgba(124,58,237,.65);color:#fff;}
.lr-toc-chip:focus-visible{outline:2px solid var(--lr-accent, #7c3aed);outline-offset:1px;}

.lr-search-wrap{position:relative;flex:0 0 auto;}
.lr-search{
  width:150px;padding:5px 10px 5px 28px;border-radius:99px;
  border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);
  color:#e4e4e7;font-size:12px;outline:none;
  transition:border-color .15s,width .2s;
}
.lr-search:focus{border-color:var(--lr-accent, #7c3aed);width:190px;}
.lr-search::placeholder{color:#71717a;}
.lr-search-icon{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:#71717a;font-size:11px;pointer-events:none;}
.lr-search-count{display:block;font-size:10.5px;color:#71717a;margin:4px 2px 0;min-height:12px;}

.lr-intro h2{
  margin:18px 0 12px;font-size:22px;line-height:1.25;color:#fff;
}
.lr-intro p{margin:0 0 12px;color:#d4d4d8;line-height:1.65;font-size:14.5px;}
.lr-intro p em{color:#e4e4e7;}
.lr-intro p strong{color:#c084fc;}

.lr-divider{
  display:flex;align-items:center;gap:12px;
  margin:22px 0 18px;color:#71717a;font-size:11.5px;letter-spacing:.4px;text-transform:uppercase;
}
.lr-divider::before,.lr-divider::after{content:"";flex:1;height:1px;background:rgba(255,255,255,.08);}
.lr-divider code{background:rgba(124,58,237,.14);color:#c084fc;padding:1px 6px;border-radius:5px;font-size:11px;}

/* ---- markdown rendering (the actual reader output) ---- */
.lr-md{color:#d4d4d8;font-size:14.5px;line-height:1.7;}
.lr-md h1,.lr-md h2,.lr-md h3,.lr-md h4{color:#fff;line-height:1.3;margin:26px 0 10px;}
.lr-md h1{font-size:23px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,.09);}
.lr-md h2{font-size:19px;margin-top:32px;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,.07);scroll-margin-top:96px;}
.lr-md h2:first-of-type{margin-top:0;}
.lr-md h3{font-size:16.5px;color:#c084fc;}
.lr-md h4{font-size:15px;}
.lr-md p{margin:0 0 13px;}
.lr-md strong{color:#f4f4f5;}
.lr-md em{color:#e4e4e7;}
.lr-md a{color:#a78bfa;text-decoration:none;border-bottom:1px dotted rgba(167,139,250,.4);}
.lr-md a:hover{border-bottom-color:#a78bfa;}
.lr-md ul,.lr-md ol{margin:0 0 13px;padding-left:24px;}
.lr-md li{margin:4px 0;}
.lr-md li::marker{color:#7c3aed;}
.lr-md blockquote{
  margin:16px 0;padding:10px 16px;
  border-left:3px solid var(--lr-accent, #7c3aed);background:rgba(124,58,237,.08);
  border-radius:0 10px 10px 0;color:#e4e4e7;font-style:italic;
}
.lr-md blockquote p{margin:0;}
.lr-md hr{border:none;height:1px;background:linear-gradient(90deg,rgba(124,58,237,.5),rgba(255,255,255,.06));margin:26px 0;}
.lr-md code{
  background:rgba(124,58,237,.14);color:#c084fc;
  padding:2px 6px;border-radius:5px;font-size:13px;
}
.lr-md pre{
  background:#0a0a0f;border:1px solid rgba(255,255,255,.07);border-radius:10px;
  padding:14px;overflow-x:auto;margin:14px 0;
}
.lr-md pre code{background:none;padding:0;color:#e4e4e7;}
.lr-loading{color:#71717a;font-style:italic;padding:8px 0;}
.lr-error{
  border:1px solid rgba(239,68,68,.35);background:rgba(239,68,68,.08);
  color:#fca5a5;padding:12px 14px;border-radius:10px;font-size:13.5px;line-height:1.6;
}

/* ---- discretion gate (The Not So Great) ---- */
.lr-gate{
  border:1px solid rgba(239,68,68,.35);background:rgba(239,68,68,.05);
  border-radius:14px;padding:22px 20px;margin:4px 0 18px;
}
.lr-gate-badge{
  display:inline-block;background:rgba(239,68,68,.16);color:#fca5a5;
  border:1px solid rgba(239,68,68,.45);padding:4px 12px;border-radius:999px;
  font-size:11px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;margin-bottom:12px;
}
.lr-gate h2{color:#fff;font-size:20px;margin:0 0 10px;}
.lr-gate h3{color:#fca5a5;font-size:14px;margin:16px 0 6px;}
.lr-gate p{color:#d4d4d8;font-size:13.5px;line-height:1.65;margin:0 0 10px;}
.lr-gate-agree{
  display:flex;gap:10px;align-items:flex-start;color:#e4e4e7;
  font-size:13px;line-height:1.55;margin:14px 0;
  border:1px solid rgba(255,255,255,.09);background:rgba(10,10,15,.35);
  padding:12px 14px;border-radius:10px;cursor:pointer;
}
.lr-gate-agree input{margin-top:3px;accent-color:#7c3aed;width:16px;height:16px;flex:none;}
.lr-gate-btns{display:flex;gap:10px;flex-wrap:wrap;}
.lr-gate-enter{
  background:linear-gradient(135deg,#7c3aed,#a21caf);color:#fff;border:none;
  padding:11px 18px;border-radius:10px;font:600 13.5px system-ui,sans-serif;cursor:pointer;
}
.lr-gate-enter:disabled{opacity:.35;cursor:not-allowed;}
.lr-gate-close{
  background:transparent;color:#a1a1aa;border:1px solid rgba(255,255,255,.14);
  padding:11px 18px;border-radius:10px;font:600 13.5px system-ui,sans-serif;cursor:pointer;
}
.lr-gate-close:hover{color:#fff;border-color:rgba(255,255,255,.3);}

/* ---- mobile: rail becomes a bottom dock, panel goes full-screen ---- */
@media (max-width:560px){
  .lr-rail{
    top:auto;bottom:18px;right:auto;left:50%;transform:translateX(-50%);
    flex-direction:row;gap:8px;
  }
  .lr-rail-away,.lr-rail-collapse{transform:translateX(-50%);}
  .lr-rail-btn{width:44px;height:44px;font-size:17px;border-radius:12px;}
  .lr-tooltip{display:none;}
  .lr-panel{
    top:0;right:0;bottom:0;width:100vw;max-height:100vh;
    border-radius:0;border:none;
  }
  .lr-panel-body{padding:0 16px 28px;}
  .lr-toc{margin:0 -16px 4px;padding:10px 4px;}
  .lr-search{width:120px;}
  .lr-search:focus{width:150px;}
}

@media (prefers-reduced-motion: reduce){
  .lr-rail,.lr-panel,.lr-backdrop,.lr-rail-btn{transition:none!important;}
  .lr-rail-btn.active{animation:none!important;}
}
`;

// ---------------------------------------------------------------------------
// boot pieces
// ---------------------------------------------------------------------------
function injectStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = CSS;
  document.head.appendChild(el);
}

function applyTheme(root) {
  const t = detectTheme();
  const s = root.style;
  s.setProperty('--lr-bg', t.bg);
  s.setProperty('--lr-panel', t.panel);
  s.setProperty('--lr-accent', t.accent);
  s.setProperty('--lr-text', t.text);
  s.setProperty('--lr-muted', t.muted);
  s.setProperty('--lr-bg-soft', t.soft || 'rgba(10,10,15,.72)');
}

function buildRail() {
  const rail = document.createElement('div');
  rail.className = 'lr-rail';
  rail.setAttribute('aria-label', 'Parts of my life');
  rail.innerHTML = ICONS.map((ic) => {
    const inert = ic.inert ? ' inert' : '';
    const tabindex = ic.inert ? ' tabindex="-1" aria-disabled="true"' : ' tabindex="0"';
    return (
      '<button class="lr-rail-btn' + (ic.active ? ' active' : '') + inert + '"' +
      ' id="lr-btn-' + ic.id + '"' +
      ' data-room="' + ic.id + '"' +
      ' type="button"' +
      ' aria-label="' + ic.label + '"' +
      tabindex +
      '><i class="fa-solid ' + ic.icon + '" aria-hidden="true"></i></button>'
    );
  }).join('');
  document.body.appendChild(rail);
  applyTheme(rail);
  return rail;
}

function buildPanel() {
  const wrap = document.createElement('div');
  wrap.innerHTML =
    '<div class="lr-panel" id="lr-panel" role="dialog" aria-modal="true" aria-labelledby="lr-title">' +
    '  <div class="lr-progress" id="lr-progress"></div>' +
    '  <div class="lr-panel-head">' +
    '    <div class="lr-panel-title"><i class="fa-solid fa-flag-usa" aria-hidden="true"></i><span id="lr-title">Politics &amp; Views</span></div>' +
    '    <button class="lr-close" id="lr-close" type="button" aria-label="Close panel">✕</button>' +
    '  </div>' +
    '  <div class="lr-panel-body" id="lr-body">' +
    '    <div class="lr-toc">' +
    '      <div class="lr-toc-chips" id="lr-toc-chips" aria-label="Jump to section"></div>' +
    '      <div class="lr-search-wrap">' +
    '        <i class="fa-solid fa-magnifying-glass lr-search-icon" aria-hidden="true"></i>' +
    '        <input class="lr-search" id="lr-search" type="text" placeholder="Search views…" aria-label="Search the views">' +
    '        <span class="lr-search-count" id="lr-search-count"></span>' +
    '      </div>' +
    '    </div>' +
    INTRO_HTML +
    '    <div class="lr-divider"><span>my actual views — rendered from <code>political-stance.md</code> + <code>politics-deep-dive.md</code></span></div>' +
    '    <div class="lr-md" id="lr-content"><div class="lr-loading">reading my views… ❤️</div></div>' +
    '  </div>' +
    '</div>' +
    '<div class="lr-backdrop" id="lr-backdrop"></div>';
  document.body.appendChild(wrap);
  applyTheme(wrap.querySelector('.lr-panel'));
}

// ---------------------------------------------------------------------------
// content loading (the markdown reader), room-aware
// ---------------------------------------------------------------------------
const ROOM_META = {
  politics: { icon: 'fa-flag-usa', title: 'Politics & Views', files: [MD_URL, MD_URL2] },
  story: { icon: 'fa-book-open', title: 'My Story', files: [MD_URL3, MD_URL5] },
  dark: { icon: 'fa-skull', title: 'The Not So Great', files: [MD_URL4] },
  stillwater: { icon: 'fa-map-location-dot', title: 'Coming Out in Stillwater', files: [MD_URL6] },
};

let PANEL_API = null; // set by wire(); lets the gate close the panel

function renderGate() {
  const meta = ROOM_META.dark;
  const headIcon = document.querySelector('.lr-panel-title i');
  const title = document.getElementById('lr-title');
  if (headIcon) headIcon.className = 'fa-solid ' + meta.icon;
  if (title) title.textContent = meta.title;
  const el = document.getElementById('lr-content');
  el.innerHTML =
    '<div class="lr-gate">' +
    '  <span class="lr-gate-badge">⚠ Discretion advised</span>' +
    '  <h2>The Not So Great</h2>' +
    '  <p>This section contains the parts of my life that don&rsquo;t make the highlights reel: mental illness, psychosis, intrusive violent thoughts, instability, grief, and loss. It is raw, first-person, and unflattering.</p>' +
    '  <p>If you&rsquo;re under 18, in a fragile place, or just not here for someone else&rsquo;s darkness &mdash; close this. There is nothing here you need to save anyone from, and none of it is advice.</p>' +
    '  <h3>Disclaimer</h3>' +
    '  <p>This is a first-person account of lived experience. It is not medical advice, it is not a diagnosis of anyone but me, and it is not representative of anyone else with these conditions. If you are struggling, please talk to a professional or call/text <strong>988</strong> (US Suicide &amp; Crisis Lifeline) or your local emergency number. I am not a doctor &mdash; I am a patient who writes things down.</p>' +
    '  <label class="lr-gate-agree"><input type="checkbox" id="lr-gate-check" />' +
    '    <span>I understand this content is raw, personal, and may be disturbing. I agree that the author is <strong>not liable</strong> for how I interpret or react to it, and I accept full responsibility for choosing to read on.</span></label>' +
    '  <div class="lr-gate-btns">' +
    '    <button class="lr-gate-enter" id="lr-gate-enter" type="button" disabled>I agree — show me</button>' +
    '    <button class="lr-gate-close" id="lr-gate-close" type="button">No thanks, close it</button>' +
    '  </div>' +
    '</div>';
  const check = el.querySelector('#lr-gate-check');
  const enter = el.querySelector('#lr-gate-enter');
  check.addEventListener('change', () => {
    enter.disabled = !check.checked;
  });
  enter.addEventListener('click', () => {
    try {
      sessionStorage.setItem(GATE_KEY, '1');
    } catch (e) {
      /* private mode — still proceed this session */
    }
    loadRoomContent('dark');
  });
  el.querySelector('#lr-gate-close').addEventListener('click', () => {
    if (PANEL_API) PANEL_API.setOpen(false);
  });
}

function renderViews(room, texts) {
  const el = document.getElementById('lr-content');
  const meta = ROOM_META[room] || ROOM_META.politics;
  const headIcon = document.querySelector('.lr-panel-title i');
  const title = document.getElementById('lr-title');
  if (headIcon) headIcon.className = 'fa-solid ' + meta.icon;
  if (title) title.textContent = meta.title;
  const intro = room === 'politics' ? INTRO_HTML : room === 'story' ? STORY_INTRO_HTML : '';
  const divider =
    '<div class="lr-divider"><span>rendered from <code>' + meta.files.join('</code> + <code>') + '</code></span></div>';
  // joined with a markdown horizontal rule — marked turns it into an <hr>
  el.innerHTML = intro + divider + MARKED.parse(texts.join('\n\n---\n\n'));
  buildSections();
  buildToc();
}

async function loadRoomContent(room) {
  const el = document.getElementById('lr-content');
  const meta = ROOM_META[room] || ROOM_META.politics;
  if (room === 'dark') {
    let agreed = false;
    try {
      agreed = sessionStorage.getItem(GATE_KEY) === '1';
    } catch (e) {
      agreed = false;
    }
    if (!agreed) {
      renderGate();
      return;
    }
  }
  el.innerHTML = '<div class="lr-loading">reading… ❤️</div>';
  let texts;
  try {
    const res = await Promise.all(meta.files.map((u) => fetch(u, { cache: 'no-store' })));
    const bad = res.find((r) => !r.ok);
    if (bad) throw new Error('HTTP ' + bad.status);
    texts = await Promise.all(res.map((r) => r.text()));
  } catch (err) {
    // fetch is blocked on file:// — use the embedded copies instead
    const fb = (window.LR_MD_FALLBACK || {});
    const fbk = {
      politics: fb.stance && fb.deep ? [fb.stance, fb.deep] : null,
      story: fb.story && fb.road ? [fb.story, fb.road] : (fb.story ? [fb.story] : null),
      dark: fb.dark ? [fb.dark] : null,
      stillwater: fb.stillwater ? [fb.stillwater] : null,
    }[room];
    if (fbk) {
      texts = fbk;
    } else {
      el.innerHTML =
        '<div class="lr-error">couldn&rsquo;t read (' + err.message +
        '). The files should live in the repo root as <code>' + meta.files.join('</code>, <code>') + '</code>.</div>';
      return;
    }
  }
  renderViews(room, texts);
}

// ---------------------------------------------------------------------------
// TOC + search over the rendered sections
// ---------------------------------------------------------------------------
let sections = [];

function buildSections() {
  const content = document.getElementById('lr-content');
  sections = [];
  const heads = content.querySelectorAll('h2');
  heads.forEach((h) => {
    const els = [h];
    let sib = h.nextElementSibling;
    while (sib && sib.tagName !== 'H2') {
      els.push(sib);
      sib = sib.nextElementSibling;
    }
    sections.push({
      el: h,
      els,
      text: els.map((e) => e.textContent).join(' ').toLowerCase(),
    });
  });
}

function chipLabel(text) {
  const m = text.match(/^Part (\w+) —\s*(.+)/);
  if (m) {
    const short = m[2].split(':')[0].split(' — ')[0].trim().split(' ').slice(0, 3).join(' ');
    return 'Part ' + m[1] + ' · ' + short;
  }
  return text.split(':')[0].trim().split(' ').slice(0, 3).join(' ');
}

// bounded eased scroll for the panel body (avoids CSS scroll-behavior:smooth
// turning even tiny programmatic scrolls into long animations)
function smoothScrollTo(body, target, duration) {
  const start = body.scrollTop;
  const delta = Math.max(0, target) - start;
  if (Math.abs(delta) < 2) return;
  const t0 = performance.now();
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const step = (now) => {
    const p = Math.min(1, (now - t0) / duration);
    body.scrollTop = start + delta * ease(p);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function buildToc() {
  const chips = document.getElementById('lr-toc-chips');
  const body = document.getElementById('lr-body');
  chips.innerHTML = '';
  sections.forEach((s, i) => {
    s.el.id = 'lr-sec-' + i;
    const chip = document.createElement('button');
    chip.className = 'lr-toc-chip';
    chip.type = 'button';
    chip.textContent = chipLabel(s.el.textContent);
    chip.addEventListener('click', () => {
      const targetTop =
        s.el.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop - 92;
      smoothScrollTo(body, targetTop, 450);
    });
    chips.appendChild(chip);
  });

  // highlight the chip for the section nearest the top of the panel
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const idx = Number(entry.target.id.replace('lr-sec-', ''));
        chips.querySelectorAll('.lr-toc-chip').forEach((c, ci) => {
          c.classList.toggle('active', ci === idx);
        });
      });
    },
    { root: body, rootMargin: '-80px 0px -70% 0px', threshold: 0 }
  );
  sections.forEach((s) => observer.observe(s.el));
}

function wireSearch() {
  const input = document.getElementById('lr-search');
  const count = document.getElementById('lr-search-count');
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    let shown = 0;
    sections.forEach((s) => {
      const hit = !q || s.text.includes(q);
      s.els.forEach((e) => {
        e.style.display = hit ? '' : 'none';
      });
      if (hit) shown++;
    });
    count.textContent = q ? shown + '/' + sections.length + ' parts match' : '';
  });
}

// ---------------------------------------------------------------------------
// reading progress bar
// ---------------------------------------------------------------------------
function wireProgress() {
  const body = document.getElementById('lr-body');
  const bar = document.getElementById('lr-progress');
  let raf = null;
  const update = () => {
    const max = body.scrollHeight - body.clientHeight;
    bar.style.width = (max > 0 ? (body.scrollTop / max) * 100 : 0) + '%';
  };
  const onScroll = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      update();
      raf = null;
    });
  };
  // native scroll on the panel body + a capture-phase window listener so the
  // bar tracks even if the panel's own event doesn't reach us
  body.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('scroll', onScroll, { capture: true, passive: true });
  update();
}

// ---------------------------------------------------------------------------
// scroll-aware rail
// ---------------------------------------------------------------------------
function wireRailMotion(rail) {
  let lastY = window.scrollY;
  let ticking = false;
  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y < 90) {
          rail.classList.add('lr-rail-away');
          rail.classList.remove('lr-rail-collapse');
        } else if (y > lastY + 120) {
          rail.classList.add('lr-rail-collapse');
          rail.classList.remove('lr-rail-away');
        } else if (y < lastY - 60) {
          rail.classList.remove('lr-rail-collapse', 'lr-rail-away');
        }
        lastY = y;
        ticking = false;
      });
    },
    { passive: true }
  );
}

// ---------------------------------------------------------------------------
// styled tooltips
// ---------------------------------------------------------------------------
function wireTooltips(rail) {
  const tip = document.createElement('div');
  tip.className = 'lr-tooltip';
  document.body.appendChild(tip);
  let hideTimer = null;
  const show = (btn) => {
    const r = btn.getBoundingClientRect();
    tip.textContent = btn.getAttribute('aria-label') || '';
    tip.style.top = r.top + r.height / 2 + 'px';
    tip.style.right = window.innerWidth - r.left + 12 + 'px';
    tip.classList.add('lr-tooltip-show');
  };
  const hide = () => tip.classList.remove('lr-tooltip-show');
  rail.querySelectorAll('.lr-rail-btn').forEach((btn) => {
    btn.addEventListener('mouseenter', () => {
      clearTimeout(hideTimer);
      show(btn);
    });
    btn.addEventListener('mouseleave', () => {
      hideTimer = setTimeout(hide, 80);
    });
    btn.addEventListener('focusin', () => {
      clearTimeout(hideTimer);
      show(btn);
    });
    btn.addEventListener('focusout', hide);
  });
}

// ---------------------------------------------------------------------------
// wiring: open/close, room switching, hash routing, keys
// ---------------------------------------------------------------------------
function wire() {
  const panel = document.getElementById('lr-panel');
  const backdrop = document.getElementById('lr-backdrop');
  const closeBtn = document.getElementById('lr-close');
  const prevOverflow = document.body.style.overflow;
  let currentRoom = 'politics';

  function roomHash(room) {
    return '#lr-' + room;
  }

  function roomFromHash() {
    const m = location.hash.match(/^#lr-([a-z]+)$/);
    if (m && ROOM_META[m[1]]) return m[1];
    return null;
  }

  function setOpen(open, opts) {
    const silent = opts && opts.silent;
    panel.classList.toggle('lr-open', open);
    backdrop.classList.toggle('lr-open', open);
    const btn = document.getElementById('lr-btn-' + currentRoom);
    if (btn) {
      btn.classList.toggle('active', open);
      btn.setAttribute('aria-expanded', String(open));
    }
    document.body.style.overflow = open ? 'hidden' : prevOverflow;
    if (open && !silent) {
      const h = roomHash(currentRoom);
      if (location.hash !== h) history.pushState(null, '', h);
      closeBtn.focus();
    } else if (!open) {
      const h = roomHash(currentRoom);
      if (location.hash === h) {
        history.replaceState(null, '', location.pathname + location.search);
      }
      if (!sessionStorage.getItem(AUTO_OPEN_KEY)) sessionStorage.setItem(AUTO_OPEN_KEY, '1');
    }
  }

  function openRoom(room) {
    currentRoom = room;
    setOpen(true);
    const content = document.getElementById('lr-content');
    if (!content.querySelector('.lr-md') || content.querySelector('.lr-loading')) {
      loadRoomContent(room);
    } else if (room === 'dark') {
      // re-check the gate each time the dark room is opened fresh
      loadRoomContent(room);
    }
  }

  function syncFromHash() {
    const want = roomFromHash();
    if (want) {
      if (!panel.classList.contains('lr-open')) {
        currentRoom = want;
        setOpen(true, { silent: true });
        loadRoomContent(want);
      } else if (want !== currentRoom) {
        currentRoom = want;
        setOpen(true, { silent: true });
        loadRoomContent(want);
      }
    } else if (panel.classList.contains('lr-open')) {
      setOpen(false);
    }
  }

  document.querySelectorAll('.lr-rail-btn').forEach((btn) => {
    if (btn.hasAttribute('inert') || btn.getAttribute('aria-disabled') === 'true') return;
    btn.addEventListener('click', () => openRoom(btn.getAttribute('data-room') || 'politics'));
  });
  closeBtn.addEventListener('click', () => setOpen(false));
  backdrop.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('lr-open')) setOpen(false);
  });
  window.addEventListener('hashchange', syncFromHash);

  // gentle one-time auto-open per session (desktop only)
  function maybeAutoOpen() {
    if (roomFromHash()) return;
    if (sessionStorage.getItem(AUTO_OPEN_KEY)) return;
    if (window.innerWidth < 768) return;
    sessionStorage.setItem(AUTO_OPEN_KEY, '1');
    setTimeout(() => setOpen(true, { silent: true }), 900);
  }

  PANEL_API = { setOpen, openRoom, syncFromHash, maybeAutoOpen };
  return { setOpen, syncFromHash, maybeAutoOpen };
}

// ---------------------------------------------------------------------------
// boot — build first, then pre-load so the panel is instant
// ---------------------------------------------------------------------------
injectStyle();
const rail = buildRail();
buildPanel();
wireProgress();
wireSearch();
wireRailMotion(rail);
wireTooltips(rail);
const w = wire();
w.maybeAutoOpen();
w.syncFromHash();
loadRoomContent('politics');
