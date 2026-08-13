// ============================================================================
// life-rail.js — right-side icon bar + slide-in "life" panels
//
// The rail lives on the right edge of the page. Each icon is a door into a
// part of Natalie's life. Only icons with content are live; the rest wait
// patiently, dimmed, until they get their own panels.
//
// The politics panel is rendered by a REAL markdown reader: it fetches
// `political-stance.md` (the short views) and `politics-deep-dive.md` (the
// long-form history/science/afterlife deep dive) from the repo root and
// renders them with the site's own local copy of marked. Update either .md
// and the page updates. No rebuild.
//
// Adding a new live icon: add an entry to ICONS with `active: true` and a
// `render()` function. That's the whole ceremony.
// ============================================================================

import { marked } from '/assets/marked.esm-Bau4Sef4.js';

const STYLE_ID = 'lr-style';
const MD_URL = 'political-stance.md';
const MD_URL2 = 'politics-deep-dive.md';

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
// css — prefixed `lr-` so it can't fight the rest of the site
// ---------------------------------------------------------------------------
const CSS = `
.lr-rail{
  position:fixed;top:96px;right:12px;z-index:9992;
  display:flex;flex-direction:column;gap:10px;
}
.lr-rail-btn{
  width:46px;height:46px;border-radius:12px;
  border:1px solid rgba(255,255,255,.09);
  background:rgba(10,10,15,.72);
  color:#e1e1e6;
  display:flex;align-items:center;justify-content:center;
  font-size:19px;line-height:1;
  cursor:pointer;
  box-shadow:0 4px 14px rgba(0,0,0,.35);
  transition:background .2s,border-color .2s,color .2s,transform .15s,box-shadow .2s;
}
.lr-rail-btn:hover{background:rgba(124,58,237,.18);border-color:rgba(124,58,237,.55);color:#fff;}
.lr-rail-btn:active{transform:translateY(1px);}
.lr-rail-btn:focus-visible{outline:2px solid #7c3aed;outline-offset:2px;}
.lr-rail-btn.active{
  background:rgba(124,58,237,.22);border-color:rgba(124,58,237,.6);color:#fff;
  box-shadow:0 0 18px rgba(124,58,237,.35),0 4px 14px rgba(0,0,0,.35);
}
.lr-rail-btn.inert{opacity:.32;cursor:default;box-shadow:none;}
.lr-rail-btn.inert:hover{background:rgba(10,10,15,.72);border-color:rgba(255,255,255,.09);color:#e1e1e6;}

.lr-panel{
  position:fixed;top:96px;right:68px;z-index:9993;
  width:min(620px,calc(100vw - 92px));
  max-height:calc(100vh - 160px);
  background:#121218;
  border:1px solid rgba(255,255,255,.09);
  border-radius:16px;
  box-shadow:0 24px 70px rgba(0,0,0,.6);
  display:flex;flex-direction:column;
  transform:translateX(calc(100% + 90px));
  opacity:0;pointer-events:none;
  transition:transform .4s cubic-bezier(.22,.9,.24,1),opacity .32s ease;
}
.lr-panel.lr-open{transform:translateX(0);opacity:1;pointer-events:auto;}

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
.lr-panel-title i{color:#7c3aed;font-size:17px;}
.lr-close{
  width:32px;height:32px;border-radius:9px;
  border:1px solid rgba(255,255,255,.1);
  background:rgba(255,255,255,.05);color:#a1a1aa;
  font-size:14px;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  transition:background .2s,color .2s,border-color .2s;
}
.lr-close:hover{background:rgba(124,58,237,.2);color:#fff;border-color:rgba(124,58,237,.5);}
.lr-close:focus-visible{outline:2px solid #7c3aed;outline-offset:2px;}

.lr-panel-body{
  overflow-y:auto;padding:20px 22px 26px;
  scrollbar-width:thin;scrollbar-color:rgba(124,58,237,.5) transparent;
}
.lr-panel-body::-webkit-scrollbar{width:8px;}
.lr-panel-body::-webkit-scrollbar-thumb{background:rgba(124,58,237,.45);border-radius:99px;}

.lr-intro h2{
  margin:0 0 12px;font-size:22px;line-height:1.25;color:#fff;
}
.lr-intro h2 strong{color:#c084fc;}
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
.lr-md h2{font-size:19px;margin-top:32px;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,.07);}
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
  border-left:3px solid #7c3aed;background:rgba(124,58,237,.08);
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

@media (max-width:560px){
  .lr-rail{top:80px;right:8px;}
  .lr-panel{top:80px;right:60px;max-height:calc(100vh - 140px);}
}
`;

// ---------------------------------------------------------------------------
// boot
// ---------------------------------------------------------------------------
function injectStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = CSS;
  document.head.appendChild(el);
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
      ' type="button"' +
      ' title="' + ic.label + '"' +
      ' aria-label="' + ic.label + '"' +
      tabindex +
      '><i class="fa-solid ' + ic.icon + '" aria-hidden="true"></i></button>'
    );
  }).join('');
  document.body.appendChild(rail);
  return rail;
}

function buildPanel() {
  const wrap = document.createElement('div');
  wrap.innerHTML =
    '<div class="lr-panel" id="lr-panel" role="dialog" aria-modal="true" aria-labelledby="lr-title">' +
    '  <div class="lr-panel-head">' +
    '    <div class="lr-panel-title"><i class="fa-solid fa-flag-usa" aria-hidden="true"></i><span id="lr-title">Politics &amp; Views</span></div>' +
    '    <button class="lr-close" id="lr-close" type="button" aria-label="Close panel">✕</button>' +
    '  </div>' +
    '  <div class="lr-panel-body" id="lr-body">' +
    INTRO_HTML +
    '    <div class="lr-divider"><span>my actual views — rendered from <code>political-stance.md</code> + <code>politics-deep-dive.md</code></span></div>' +
    '    <div class="lr-md" id="lr-content"><div class="lr-loading">reading my views… ❤️</div></div>' +
    '  </div>' +
    '</div>' +
    '<div class="lr-backdrop" id="lr-backdrop"></div>';
  document.body.appendChild(wrap);
}

async function loadViews() {
  const el = document.getElementById('lr-content');
  try {
    const [res, res2] = await Promise.all([
      fetch(MD_URL, { cache: 'no-store' }),
      fetch(MD_URL2, { cache: 'no-store' }),
    ]);
    if (!res.ok) throw new Error(MD_URL + ' → HTTP ' + res.status);
    if (!res2.ok) throw new Error(MD_URL2 + ' → HTTP ' + res2.status);
    const [md, md2] = await Promise.all([res.text(), res2.text()]);
    // joined with a markdown horizontal rule — marked turns it into an <hr>
    el.innerHTML = marked.parse(md + '\n\n---\n\n' + md2);
  } catch (err) {
    el.innerHTML =
      '<div class="lr-error">couldn&rsquo;t read the views (' +
      err.message +
      '). The files should live in the repo root as <code>political-stance.md</code> and <code>politics-deep-dive.md</code>.</div>';
  }
}

function wire() {
  const panel = document.getElementById('lr-panel');
  const backdrop = document.getElementById('lr-backdrop');
  const closeBtn = document.getElementById('lr-close');
  const flag = document.getElementById('lr-btn-politics');
  const prevOverflow = document.body.style.overflow;

  function setOpen(open) {
    panel.classList.toggle('lr-open', open);
    backdrop.classList.toggle('lr-open', open);
    flag.classList.toggle('active', open);
    flag.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : prevOverflow;
    if (open) closeBtn.focus();
  }

  flag.addEventListener('click', () => {
    const willOpen = !panel.classList.contains('lr-open');
    setOpen(willOpen);
    if (willOpen && document.getElementById('lr-content').querySelector('.lr-loading')) {
      loadViews();
    }
  });
  closeBtn.addEventListener('click', () => setOpen(false));
  backdrop.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('lr-open')) setOpen(false);
  });
}

// build everything first, then pre-load the views quietly so the panel is
// instant when opened
injectStyle();
buildRail();
buildPanel();
wire();
loadViews();
