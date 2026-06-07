"use strict";

/* ═══════════════════════════════════════════════════════════════════
   CSS MASTERY v3 — Data-driven Interactive Platform
   Master Frontend Pro Designer Mode
═══════════════════════════════════════════════════════════════════ */

/* ─── escape for safe output ─── */
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* ─── syntax highlighter (CSS) ─── */
function hl(code) {
  const lines = code.split("\n");
  return lines
    .map((line) => {
      const t = line.trim();

      // pure comment line
      if (/^\/\*.*\*\/$/.test(t)) {
        return `<span class="cmt">${esc(line)}</span>`;
      }

      // selector / at-rule line ending with {
      if (/\{\s*$/.test(line)) {
        let result = esc(line);
        // color @rules
        result = result.replace(/(@[\w-]+)/g, '<span class="prop">$1</span>');
        // color the selector (text before {)
        result = result.replace(
          /^(\s*)([^{]+?)(\s*)(\{)/,
          (_, sp, sel, sp2, br) => {
            // don't re-wrap @-colored stuff
            if (sel.includes('<span class="prop">')) {
              return `${sp}${sel}${sp2}<span class="punc">${br}</span>`;
            }
            return `${sp}<span class="sel-tok">${sel}</span>${sp2}<span class="punc">${br}</span>`;
          },
        );
        return result;
      }

      // closing brace line
      if (/^\s*\}\s*(\/\*.*\*\/)?\s*$/.test(line)) {
        return esc(line)
          .replace(/(\})/g, '<span class="punc">$1</span>')
          .replace(/(\/\*.*\*\/)/g, '<span class="cmt">$1</span>');
      }

      // declaration line: prop: value;  or  prop: value;  /* comment */
      const m = line.match(
        /^(\s*)([\w-]+)(\s*:\s*)(.+?)(;?)(\s*\/\*.*?\*\/)?(\s*)$/,
      );
      if (m && !/[{}]/.test(line)) {
        const [, sp, prop, colon, val, semi, cmt, tail] = m;
        let valHl = esc(val)
          .replace(/('|")([^'"]*)\1/g, '<span class="str">$1$2$1</span>')
          .replace(
            /\b(\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|deg|s|ms|fr|ch|ex|pt|cm|mm|in)?)\b/g,
            '<span class="num">$1</span>',
          );
        return `${sp}<span class="prop">${esc(prop)}</span>${esc(colon)}<span class="val">${valHl}</span><span class="punc">${semi || ""}</span>${cmt ? `<span class="cmt">${esc(cmt)}</span>` : ""}${tail || ""}`;
      }

      // inline-only comment
      if (/^\s*\/\*/.test(line) || /\/\*.*\*\//.test(line)) {
        return esc(line).replace(
          /(\/\*.*?\*\/)/g,
          '<span class="cmt">$1</span>',
        );
      }

      return esc(line);
    })
    .join("\n");
}

/* ─── builders ─── */

function buildSidebar(chapters) {
  let html = "";
  chapters.forEach((ch) => {
    html += `<li class="snav-ch">${ch.roman} — ${ch.title}</li>`;
    ch.sections.forEach((s) => {
      html += `<li><a href="#${s.id}" class="snav-a" data-c="${ch.cls}">${s.num} — ${s.navTitle || s.title}</a></li>`;
    });
  });
  return html;
}

function buildChapterHeader(ch) {
  return `
    <div class="ch" id="ch-${ch.cls}">
      <span class="ch__badge ${ch.cls}">${ch.roman}</span>
      <div>
        <h2 class="ch__title ${ch.cls}">${ch.title}</h2>
        <p class="ch__desc">${ch.desc}</p>
      </div>
    </div>`;
}

function buildSection(s, chCls) {
  // — info block
  let infoHtml = "";
  if (s.info && s.info.length) {
    let body = "";
    s.info.forEach((block) => {
      if (block.p) body += `<p>${block.p}</p>`;
      if (block.ul)
        body += `<ul>${block.ul.map((li) => `<li>${li}</li>`).join("")}</ul>`;
    });
    infoHtml = `
      <div class="info ${chCls}">
        <div class="info__title">◆ MALUMOT</div>
        ${body}
      </div>`;
  }

  // — values table
  let valsHtml = "";
  if (s.vals && s.vals.length) {
    valsHtml = `
      <div class="vals">
        <div class="vals__title">${s.valsTitle || "◇ Barcha qiymatlar (hammasi)"}</div>
        ${s.vals.map((v) => `<div class="vrow"><div class="vk">${v[0]}</div><div class="vd">${v[1]}</div></div>`).join("")}
      </div>`;
  }

  // — controls
  let ctrlHtml = "";
  if (s.controls && s.controls.length) {
    ctrlHtml = `<div class="controls">
      ${s.controls
        .map(
          (c) => `
        <div class="ctrl-row">
          <div class="ctrl-label">${c.label}</div>
          <div class="ctrl-btns" data-group="${c.group}">
            ${c.btns.map((b) => `<button class="btn ${chCls}${b.on ? " on" : ""}" data-val="${esc(b.val)}"${b.extra ? " " + b.extra : ""}>${b.label}</button>`).join("")}
          </div>
        </div>`,
        )
        .join("")}
    </div>`;
  }

  // — only render the demo card if there's a stage OR controls
  const hasCard =
    (s.stage && s.stage.trim() !== "") || (s.controls && s.controls.length);
  const cardHtml = hasCard
    ? `
      <div class="card">
        <div class="card__body">
          <div class="stage ${s.stageClass || ""}" id="${s.id}-stage">${s.stage}</div>
          <pre class="code" id="${s.id}-code"></pre>
        </div>
        ${ctrlHtml}
      </div>`
    : "";

  return `
    <section class="sec" id="${s.id}">
      <div class="sec__head">
        <span class="sec__num ${chCls}">${s.num}</span>
        <div>
          <h3 class="sec__title">${s.title}</h3>
          <p class="sec__desc">${s.desc}</p>
        </div>
      </div>
      ${infoHtml}
      ${cardHtml}
      ${valsHtml}
      ${s.afterCard || ""}
    </section>`;
}

/* ─── CHAPTERS data structure ─── */
const CHAPTERS = [];

/* ════════════════════════════════════════════════════════════════
   CHAPTER I — SELECTORS
════════════════════════════════════════════════════════════════ */
CHAPTERS.push({
  cls: "sel",
  roman: "I",
  title: "Selectors",
  desc: "HTML elementlarni tanlash — basic, combinators, pseudo-classes, pseudo-elements, attributes",
  sections: [
    /* ─── S01 — Basic Selectors ─── */
    {
      id: "s01",
      num: "01",
      title: "Basic Selectors",
      navTitle: "Basic selectors",
      desc: "CSS ning fundamental qismi — element, class, ID, universal va inline. Har birining o'z og'irligi (specificity) bor.",
      info: [
        {
          p: "<b>Selector</b> — qaysi HTML elementlariga stil qo'llashni belgilovchi naqsh (pattern). CSS da 5 ta asosiy selector turi mavjud, va har biri turlicha <b>specificity</b> (og'irlik) ga ega.",
        },
        {
          p: "<b>Specificity formati:</b> (inline, ID, class, element) — 4 ta sondan iborat. To'qnashuvda yuqori son g'olib bo'ladi. Bir xil bo'lsa — keyingi yozilgani g'olib (cascade qoidasi).",
        },
        {
          ul: [
            "<b>Universal</b> <code>*</code> — har bir elementni tanlaydi. Specificity: 0,0,0,0. Reset uchun ishlatiladi.",
            "<b>Element (type)</b> <code>p, div, h1</code> — teg nomi bo'yicha. Specificity: 0,0,0,1.",
            "<b>Class</b> <code>.menu</code> — class atributi bo'yicha. Specificity: 0,0,1,0. Ko'p elementga qo'llanadi, eng tavsiya etilgan.",
            "<b>ID</b> <code>#header</code> — id atributi bo'yicha. Specificity: 0,1,0,0. Sahifada bitta bo'lishi shart.",
            '<b>Inline style</b> — HTML <code>style=""</code> atributi. Specificity: 1,0,0,0. Eng kuchli.',
            "<b>!important</b> — barcha specificity ni bekor qiladi. Faqat oxirgi chora sifatida ishlatiladi.",
          ],
        },
        {
          p: "<b>Selektorlarni birlashtirish:</b> <code>p.intro</code> — element va class birga (AND). <code>.a, .b</code> — vergul bilan (OR). <code>div.btn#submit</code> — uchalasi bir vaqtda.",
        },
      ],
      stage: `
        <div class="spec">
          <div class="spec-row"><span class="k">* universal</span><div class="bar"><div class="fill" style="width:3%;background:var(--t-3)"></div></div><span class="v">0,0,0,0</span></div>
          <div class="spec-row"><span class="k">p element</span><div class="bar"><div class="fill" style="width:15%;background:var(--blue)"></div></div><span class="v">0,0,0,1</span></div>
          <div class="spec-row"><span class="k">.class</span><div class="bar"><div class="fill" style="width:40%;background:var(--pink)"></div></div><span class="v">0,0,1,0</span></div>
          <div class="spec-row"><span class="k">#id</span><div class="bar"><div class="fill" style="width:65%;background:var(--gold)"></div></div><span class="v">0,1,0,0</span></div>
          <div class="spec-row"><span class="k">style=""</span><div class="bar"><div class="fill" style="width:88%;background:linear-gradient(90deg,var(--pink),var(--blue))"></div></div><span class="v">1,0,0,0</span></div>
          <div class="spec-row"><span class="k">!important</span><div class="bar"><div class="fill" style="width:100%;background:linear-gradient(90deg,var(--gold),var(--pink))"></div></div><span class="v">∞</span></div>
        </div>`,
      controls: [
        {
          label: "Selector turi",
          group: "sel-basic",
          btns: [
            { val: "universal", label: "* universal", on: true },
            { val: "element", label: "element (p)" },
            { val: "class", label: ".class" },
            { val: "id", label: "#id" },
            { val: "compound", label: "p.class.cls2" },
            { val: "group", label: ".a, .b (group)" },
          ],
        },
      ],
      vals: [
        [
          "*",
          "<b>Universal selector</b>. Barcha elementlarni tanlaydi. Reset (<code>* { box-sizing: border-box }</code>) uchun.",
        ],
        [
          "element",
          "<b>Element selector.</b> Teg nomi bo'yicha (<code>p, div, h1, ul, a</code>...).",
        ],
        [
          ".class",
          "<b>Class selector.</b> Nuqta bilan boshlanadi. Bir nechta elementga qo'llash mumkin. Eng ko'p ishlatiladi.",
        ],
        [
          "#id",
          "<b>ID selector.</b> Diyez (#) bilan. Sahifada faqat bitta element. JavaScript bilan ham ishlaydi.",
        ],
        [
          "A, B",
          "<b>Group selector.</b> Vergul bilan. Bir nechta selektorga bir xil stil — kodni qisqartiradi.",
        ],
        [
          "A.B",
          "<b>Compound.</b> Element + class birga (AND). Masalan <code>p.intro</code> — faqat .intro class li paragrafga.",
        ],
        ["A#B", "<b>Element + ID.</b> Element va ID birga."],
        [".A.B", "<b>Multi-class.</b> Ikki class ham bor element (AND)."],
        [
          "!important",
          "Barcha specificity ni bekor qiladi. Faqat oxirgi chora — debug qiyin qiladi.",
        ],
      ],
    },

    /* ─── S02 — Combinators ─── */
    {
      id: "s02",
      num: "02",
      title: "Combinators",
      navTitle: "Combinators",
      desc: "Selektorlarni birlashtirib, elementlar orasidagi DOM munosabatini ifodalash.",
      info: [
        {
          p: "<b>Combinator</b> — ikki selector orasidagi maxsus belgi bo'lib, ular orasidagi DOM daraxtidagi munosabatni bildiradi. CSS da to'rt xil combinator bor.",
        },
        {
          ul: [
            "<b>Descendant (probel)</b> <code>A B</code> — A ichidagi <b>barcha</b> B lar, qanchalik chuqur joylashganidan qat'i nazar. Eng ko'p ishlatiladi.",
            "<b>Child (&gt;)</b> <code>A &gt; B</code> — faqat A ning <b>to'g'ridan-to'g'ri</b> bolalari B. Nabiralar tanlanmaydi.",
            "<b>Adjacent sibling (+)</b> <code>A + B</code> — A dan <b>darhol keyingi</b> bitta B (aka-uka, yonma-yon).",
            "<b>General sibling (~)</b> <code>A ~ B</code> — A dan keyingi <b>barcha</b> B aka-uka elementlar.",
          ],
        },
        {
          p: "Combinator larda <b>parent (yuqori) bo'yicha tanlash YO'Q</b> edi — endi <code>:has()</code> pseudo-class bilan mumkin (modern CSS).",
        },
        {
          p: "<b>Eslatma:</b> CSS combinators faqat <b>oldinga</b> ishlaydi (DOM tartibi bo'yicha). Sibling combinator orqaga ishlatilolmaydi.",
        },
      ],
      stage: `
        <div class="comb">
          <div class="comb-p">.parent
            <div class="comb-c">.child (direct)</div>
            <div class="comb-c">.child<div class="comb-g">.grandchild</div></div>
            <div class="comb-c">.child</div>
          </div>
          <div class="comb-s">.sibling 1 (adjacent)</div>
          <div class="comb-s">.sibling 2</div>
          <div class="comb-s">.sibling 3</div>
        </div>`,
      controls: [
        {
          label: "Combinator",
          group: "comb",
          btns: [
            { val: "descendant", label: "A B (descendant)", on: true },
            { val: "child", label: "A > B (child)" },
            { val: "adjacent", label: "A + B (adjacent)" },
            { val: "sibling", label: "A ~ B (general sibling)" },
          ],
        },
      ],
      vals: [
        [
          "A B",
          "<b>Descendant combinator</b> (probel). A ning barcha avlodlari B — chuqurlikdan qat'i nazar.",
        ],
        [
          "A &gt; B",
          "<b>Child combinator.</b> Faqat A ning to'g'ridan-to'g'ri bolalari. Nabiralar emas.",
        ],
        [
          "A + B",
          "<b>Adjacent sibling.</b> A dan darhol keyingi bitta sibling B.",
        ],
        [
          "A ~ B",
          "<b>General sibling.</b> A dan keyingi barcha sibling B lar.",
        ],
        [
          "A B C",
          "Bir nechta combinator zanjir. <code>nav ul li</code> — nav ichidagi ul ichidagi li.",
        ],
        [
          ":has(&gt; B)",
          "<b>Modern:</b> ichida B bor elementlar (parent selector — :has).",
        ],
      ],
    },

    /* ─── S03 — Pseudo-classes ─── */
    {
      id: "s03",
      num: "03",
      title: "Pseudo-classes",
      navTitle: "Pseudo-classes",
      desc: "Elementning maxsus holatini tanlash — foydalanuvchi harakati, pozitsiya, forma holati.",
      info: [
        {
          p: "<b>Pseudo-class</b> — elementning <b>maxsus holatini</b> tanlaydi. Bitta ikki nuqta <code>:</code> bilan boshlanadi (pseudo-element uchun esa <code>::</code> ikkita).",
        },
        { p: "Pseudo-class lar 5 ta katta guruhga bo'linadi:" },
        {
          ul: [
            "<b>User action:</b> <code>:hover</code> (mouse ustida), <code>:active</code> (bosilgan), <code>:focus</code> (fokusda), <code>:focus-visible</code> (faqat klaviatura).",
            "<b>Strukturaviy:</b> <code>:first-child</code>, <code>:last-child</code>, <code>:nth-child(n)</code>, <code>:nth-of-type</code>, <code>:only-child</code>, <code>:empty</code>.",
            "<b>Forma:</b> <code>:checked</code>, <code>:disabled</code>, <code>:enabled</code>, <code>:valid</code>, <code>:invalid</code>, <code>:required</code>, <code>:placeholder-shown</code>.",
            "<b>Mantiqiy:</b> <code>:not(X)</code>, <code>:is(A, B)</code>, <code>:where(A, B)</code>, <code>:has(X)</code> (parent).",
            "<b>Boshqa:</b> <code>:root</code>, <code>:target</code>, <code>:lang(en)</code>, <code>:dir(rtl)</code>.",
          ],
        },
        {
          p: "<b>:nth-child() formulasi:</b> <code>2n</code>=juft (2,4,6), <code>2n+1</code> yoki <code>odd</code>=toq, <code>3n</code>=har uchinchi, <code>n+3</code>=3-dan boshlab hammasi, <code>-n+3</code>=birinchi 3 ta.",
        },
        {
          p: "<b>:is() vs :where():</b> ikkalasi ham selektorlarni guruhlaydi, lekin <code>:where()</code> specificity ga ta'sir qilmaydi (0 og'irlik). <code>:is()</code> esa eng yuqori og'irlikni oladi.",
        },
      ],
      stage: `
        <div class="pdemo">
          <button class="pbtn" id="s03-btn">Hover / Active me</button>
          <input class="pinp" type="text" placeholder=":focus me — Tab bos"/>
          <ul class="plist">
            <li>:first-child</li>
            <li>:nth-child(2)</li>
            <li>:nth-child(odd)</li>
            <li>:last-child</li>
          </ul>
          <input class="pinp" type="text" placeholder=":disabled (passive)" disabled/>
          <label class="pchk"><input type="checkbox" checked/> :checked checkbox</label>
        </div>`,
      controls: [
        {
          label: "Pseudo-class",
          group: "pc",
          btns: [
            { val: "hover", label: ":hover", on: true },
            { val: "active", label: ":active" },
            { val: "focus", label: ":focus" },
            { val: "focus-visible", label: ":focus-visible" },
            { val: "first-child", label: ":first-child" },
            { val: "last-child", label: ":last-child" },
            { val: "nth-child", label: ":nth-child()" },
            { val: "nth-of-type", label: ":nth-of-type()" },
            { val: "not", label: ":not(X)" },
            { val: "is", label: ":is(A,B)" },
            { val: "where", label: ":where()" },
            { val: "has", label: ":has() ★" },
            { val: "checked", label: ":checked" },
            { val: "disabled", label: ":disabled / :enabled" },
            { val: "empty", label: ":empty" },
            { val: "target", label: ":target" },
          ],
        },
      ],
      vals: [
        [":hover", "Sichqoncha element ustida turganda. Mobile da ishlamaydi."],
        [":active", "Element bosilib turilgan paytda (mouse pastda)."],
        [":focus", "Element fokusda (Tab yoki click)."],
        [
          ":focus-visible",
          "<b>Modern:</b> faqat klaviatura focus (sichqoncha bilan emas). UX uchun ideal.",
        ],
        [":focus-within", "Element yoki uning bolalaridan biri focus da."],
        [":first-child", "Parent ning birinchi farzandi."],
        [":last-child", "Parent ning oxirgi farzandi."],
        [":only-child", "Parent da yagona farzand bo'lsa."],
        [
          ":nth-child(n)",
          "Formula bo'yicha. <code>2n</code>, <code>odd</code>, <code>even</code>, <code>3n+1</code>...",
        ],
        [":nth-last-child(n)", "Oxiridan boshlab hisoblaydi."],
        [
          ":first-of-type",
          "O'z tegidagilar orasida birinchi (boshqa teglarni hisobga olmay).",
        ],
        [":nth-of-type(n)", ":nth-child kabi, lekin faqat shu teg ichida."],
        [":only-of-type", "O'z tegidan yagona child bo'lsa."],
        [
          ":not(X)",
          "X selector dan tashqari elementlar. <code>li:not(.active)</code>.",
        ],
        [":is(A, B)", "Selektorlar guruhi (eng yuqori specificity ni oladi)."],
        [
          ":where(A, B)",
          ":is() kabi, lekin <b>specificity = 0</b>. Override qilish oson.",
        ],
        [
          ":has(X)",
          "<b>Parent selector (modern).</b> Ichida X bo'lgan elementlar. <code>div:has(img)</code>.",
        ],
        [
          ":root",
          "<code>&lt;html&gt;</code> elementi. Custom properties uchun ishlatiladi.",
        ],
        [":empty", "Bolalari yo'q (matn ham yo'q) elementlar."],
        [
          ":target",
          "URL hash mos kelgan element. <code>#section1:target</code>.",
        ],
        [":lang(en)", "Lang atributi mos kelgan element."],
        [":checked", "Belgilangan checkbox/radio."],
        [":disabled", "O'chirilgan input/button."],
        [":enabled", "Yoqilgan input (disabled emas)."],
        [":required", "Required atributi bor input."],
        [":optional", "Required emas input."],
        [":valid", "Forma elementi to'g'ri to'ldirilgan."],
        [":invalid", "Forma elementi noto'g'ri."],
        [":placeholder-shown", "Input da placeholder ko'rinib turganda."],
        [":in-range / :out-of-range", "Number/range input qiymati oraliqda."],
        [":read-only / :read-write", "Input tahrir qilinadimi."],
        [":default", "Default tanlangan checkbox/option."],
        [":indeterminate", "Aniq bo'lmagan holat (yarim-belgilangan)."],
        [":dir(rtl)", "Yo'nalish (RTL/LTR)."],
        [":playing / :paused", "Audio/video holati."],
      ],
    },

    /* ─── S04 — Pseudo-elements ─── */
    {
      id: "s04",
      num: "04",
      title: "Pseudo-elements",
      navTitle: "Pseudo-elements",
      desc: "Elementning bir qismini yoki virtual qo'shimcha elementni tanlash. Ikki ikki nuqta :: bilan.",
      info: [
        {
          p: "<b>Pseudo-element</b> — elementning <b>bir qismini</b> yoki <b>virtual qo'shimcha element</b> ni stillashtirish. Ikki ikki nuqta <code>::</code> bilan boshlanadi (eski sintaksis bitta <code>:</code> ham ishlaydi).",
        },
        {
          p: "<b>::before va ::after</b> — eng ko'p ishlatiladigan ikki pseudo-element. Element ichida virtual element yaratadi. <b>MAJBURIY:</b> <code>content</code> xususiyati bo'lishi shart (bo'sh bo'lsa ham <code>content: '';</code>).",
        },
        {
          ul: [
            "Icon, badge, dekoratsiya qo'shish — HTML ni o'zgartirmasdan.",
            "Hover effektlar (kengayuvchi chiziq, qatlam).",
            "Tooltip lar yaratish.",
            "CSS-only shapes va shaklllar.",
          ],
        },
        {
          p: "<b>::first-letter va ::first-line</b> — dinamik. <b>::selection</b> — foydalanuvchi belgilagan matn. <b>::placeholder</b> — input placeholder. <b>::marker</b> — ro'yxat belgisi.",
        },
        {
          p: "<b>::before va ::after dan kelib chiqadigan cheklovlar:</b> faqat content bilan, replaced element lar (img, input) da ishlamaydi.",
        },
      ],
      stage: `
        <div class="pedemo">
          <p class="pe-bf">::before — chap tomonda strelka</p>
          <p class="pe-af">::after — o'ngda belgi</p>
          <p class="pe-fl">::first-line birinchi qatorni rang qiladi. Bu matnning qolgan qismi oddiy holatda ko'rinadi va davom etadi.</p>
          <p class="pe-flt">::first-letter birinchi harfni katta qiladi, drop cap effekti.</p>
          <p class="pe-sel">::selection — bu matnni belgilab/tanlab ko'ring.</p>
          <input class="pinp pe-ph" type="text" placeholder="::placeholder rangi"/>
          <ul class="pe-mk"><li>::marker — first</li><li>::marker — second</li></ul>
        </div>`,
      controls: [
        {
          label: "Pseudo-element",
          group: "pe",
          btns: [
            { val: "before", label: "::before", on: true },
            { val: "after", label: "::after" },
            { val: "first-line", label: "::first-line" },
            { val: "first-letter", label: "::first-letter" },
            { val: "selection", label: "::selection" },
            { val: "placeholder", label: "::placeholder" },
            { val: "marker", label: "::marker" },
            { val: "backdrop", label: "::backdrop" },
            { val: "file-button", label: "::file-selector-button" },
          ],
        },
      ],
      vals: [
        [
          "::before",
          "Element OLDIDA virtual element. <code>content</code> shart. Icon, badge uchun.",
        ],
        [
          "::after",
          "Element KEYIN virtual element. <code>content</code> shart. Tooltip, decorator uchun.",
        ],
        [
          "::first-line",
          "Birinchi qator (dinamik — ekran kengligiga qarab o'zgaradi).",
        ],
        [
          "::first-letter",
          "Birinchi harf. Drop cap (magazine style) effekti uchun.",
        ],
        ["::selection", "Foydalanuvchi tanlagan matn fon va rangi."],
        ["::placeholder", "Input/textarea placeholder matni."],
        ["::marker", "Ro'yxat belgisi (bullet, raqam)."],
        ["::backdrop", "Modal/dialog/fullscreen orqa fon qatlami."],
        [
          "::file-selector-button",
          '<code>&lt;input type="file"&gt;</code> tugmasi.',
        ],
        ["::cue", "Video subtitle (track) cue lari."],
        ["::part(name)", "Web component ning ichki qismi (Shadow DOM)."],
        ["::slotted(*)", "Shadow DOM ga slot orqali joylashtirilgan element."],
      ],
    },

    /* ─── S05 — Attribute Selectors ─── */
    {
      id: "s05",
      num: "05",
      title: "Attribute Selectors",
      navTitle: "Attribute selectors",
      desc: "HTML atributlari va ularning qiymatlariga qarab elementlarni tanlash. Regex ga o'xshash pattern matching.",
      info: [
        {
          p: "<b>Attribute selector</b> — element atributlari (<code>href, type, data-*, disabled, lang</code>...) va ularning qiymatlariga qarab tanlaydi. Kvadrat qavs <code>[ ]</code> ichida yoziladi.",
        },
        {
          p: "<b>To'rt xil tekshirish:</b> mavjudligi, aniq teng, boshlanishi/tugashi/o'z ichiga olishi.",
        },
        {
          ul: [
            "<code>[attr]</code> — atribut <b>mavjud</b> (qiymatdan qat'i nazar).",
            '<code>[attr="val"]</code> — qiymat <b>aniq</b> teng (case-sensitive).',
            '<code>[attr^="val"]</code> — qiymat shu bilan <b>boshlansa</b> (^ = start).',
            '<code>[attr$="val"]</code> — qiymat shu bilan <b>tugasa</b> ($ = end).',
            '<code>[attr*="val"]</code> — qiymat shu matnni <b>o\'z ichiga olsa</b> (* = contains).',
            "<code>[attr~=\"val\"]</code> — probel bilan ajratilgan so'zlar ichida bo'lsa.",
            '<code>[attr|="val"]</code> — qiymat <code>val</code> yoki <code>val-</code> bilan boshlansa (til kodlari uchun).',
            '<code>[attr="v" i]</code> — <code>i</code> flagi — case-insensitive.',
            '<code>[attr="v" s]</code> — <code>s</code> flagi — case-sensitive (default).',
          ],
        },
        {
          p: '<b>Amaliy misollar:</b> <code>a[href^="https"]</code> — barcha xavfsiz linklar; <code>a[href$=".pdf"]</code> — PDF linklar; <code>input[type="email"]</code> — email input; <code>[data-modal]</code> — data-modal atributi bor barcha elementlar.',
        },
      ],
      stage: `
        <div class="adem">
          <a href="https://example.com">https://example.com (secure)</a>
          <a href="http://old.com">http://old.com (insecure)</a>
          <a href="#anchor">#anchor link</a>
          <a href="/doc.pdf">document.pdf</a>
          <a href="https://github.com/x">github.com (contains)</a>
          <div class="adem-box" data-status="active">data-status="active"</div>
          <div class="adem-box" data-priority="high-critical">data-priority="high-critical"</div>
          <div class="adem-box" data-tag="featured new">data-tag="featured new"</div>
        </div>`,
      controls: [
        {
          label: "Pattern",
          group: "attr",
          btns: [
            { val: "exact", label: '[a="v"] aniq', on: true },
            { val: "starts", label: '[a^="v"] starts' },
            { val: "ends", label: '[a$="v"] ends' },
            { val: "contains", label: '[a*="v"] contains' },
            { val: "exists", label: "[a] mavjud" },
            { val: "word", label: '[a~="v"] so\'z' },
            { val: "pipe", label: '[a|="v"] til' },
          ],
        },
      ],
      vals: [
        ["[attr]", "Atribut <b>mavjud</b> bo'lsa (qiymatdan qat'i nazar)."],
        ['[attr="val"]', "<b>Aniq teng</b> qiymat (case-sensitive default)."],
        ['[attr^="val"]', "<b>Boshlanadi</b> shu matn bilan (^ = start)."],
        ['[attr$="val"]', "<b>Tugaydi</b> shu matn bilan ($ = end)."],
        ['[attr*="val"]', "<b>O'z ichiga oladi</b> shu matnni (* = contains)."],
        [
          '[attr~="val"]',
          "Probel bilan ajratilgan <b>so'zlar ro'yxatida</b> shu so'z bor.",
        ],
        [
          '[attr|="val"]',
          "Qiymat <code>val</code> yoki <code>val-X</code> bilan boshlanadi (BCP til kodi).",
        ],
        [
          '[attr="v" i]',
          "<b>Case-insensitive flag.</b> Katta-kichik harfni e'tiborsiz qoldiradi.",
        ],
        [
          '[attr="v" s]',
          "<b>Case-sensitive flag.</b> Default holat (ko'pincha keraksiz).",
        ],
        [
          "A[attr]",
          'Element + atribut kombinatsiyasi. <code>a[target="_blank"]</code>.',
        ],
        [
          "A[a][b]",
          'Bir nechta atribut bir vaqtda (AND). <code>input[type="text"][required]</code>.',
        ],
      ],
    },
  ],
});

/* ════════════════════════════════════════════════════════════════
   CHAPTER II — TYPOGRAPHY
════════════════════════════════════════════════════════════════ */
CHAPTERS.push({
  cls: "typ",
  roman: "II",
  title: "Typography",
  desc: "Pixel-perfect tipografiya — font xususiyatlari, ritm, fluid o'lcham, professional text effektlar",
  sections: [
    /* ─── S06 — Font Properties ─── */
    {
      id: "s06",
      num: "06",
      title: "Font Properties",
      navTitle: "Font properties",
      desc: "font-family, font-size, font-weight, font-style, font-variant — barcha font xususiyatlari.",
      info: [
        {
          p: "Tipografiya — frontend dizaynning eng muhim qismi. Yomon tipografiya butun saytni yomon ko'rsatadi, professional tipografiya esa oddiy saytni ham nafis qiladi.",
        },
        {
          ul: [
            '<code>font-family</code> — shrift oilasi. Har doim <b>fallback</b> bering: <code>"Inter", system-ui, sans-serif</code>. System fontlar tez yuklanadi.',
            "<code>font-size</code> — o'lcham. <code>rem</code> ishlatish tavsiya etiladi (accessibility — foydalanuvchi brauzerda font o'lchamini o'zgartirsa, hammasi proporsional kattalashadi).",
            "<code>font-weight</code> — qalinlik. 100 (thin) dan 900 (black) gacha 100 li qadam. Normal = 400, bold = 700.",
            "<code>font-style</code> — <code>normal</code> / <code>italic</code> / <code>oblique</code> (sun'iy qiya). Italic — shriftning maxsus qiya versiyasi.",
            "<code>letter-spacing</code> — harflar oralig'i. Katta sarlavhalarda manfiy (-0.02em) ixcham qiladi, kichik caps da musbat (0.1em) o'qilishni yaxshilaydi.",
            "<code>line-height</code> — qatorlar balandligi. <b>Birliksiz son</b> (1.6) ishlating — meros to'g'ri ishlaydi.",
            "<code>text-transform</code> — <code>uppercase / lowercase / capitalize / none</code>.",
            "<code>font-variant</code> — <code>small-caps</code> kabi variantlar.",
            "<code>font-stretch</code> — <code>condensed</code> / <code>expanded</code> (variable font kerak).",
          ],
        },
        {
          p: "<b>Variable fonts</b> (Inter, Roboto Flex) — bitta faylda barcha weight va style. Yuklash tez, kuchli moslashuvchanlik.",
        },
        {
          p: '<b>System font stack:</b> <code>system-ui, -apple-system, "Segoe UI", Roboto</code> — har bir OS ning native shriftini ishlatadi. Yuklash darhol.',
        },
      ],
      stage: `
        <div class="font-dem" id="s06-text">
          <p style="font-weight:100;font-size:1.5rem">Thin 100 — Aa Bb</p>
          <p style="font-weight:300;font-size:1.5rem">Light 300 — Aa Bb</p>
          <p style="font-weight:400;font-size:1.5rem">Regular 400 — Aa Bb</p>
          <p style="font-weight:500;font-size:1.5rem">Medium 500 — Aa Bb</p>
          <p style="font-weight:600;font-size:1.5rem">Semibold 600 — Aa Bb</p>
          <p style="font-weight:700;font-size:1.5rem">Bold 700 — Aa Bb</p>
          <p style="font-weight:800;font-size:1.5rem">ExtraBold 800 — Aa Bb</p>
          <p style="font-style:italic;font-size:1.5rem">Italic style</p>
        </div>`,
      controls: [
        {
          label: "font-weight",
          group: "f-w",
          btns: [
            { val: "100", label: "100" },
            { val: "300", label: "300" },
            { val: "400", label: "400", on: true },
            { val: "500", label: "500" },
            { val: "600", label: "600" },
            { val: "700", label: "700" },
            { val: "800", label: "800" },
            { val: "900", label: "900" },
            { val: "bold", label: "bold" },
            { val: "normal", label: "normal" },
          ],
        },
        {
          label: "font-size",
          group: "f-s",
          btns: [
            { val: "12px", label: "12px" },
            { val: "14px", label: "14px" },
            { val: "16px", label: "16px", on: true },
            { val: "20px", label: "20px" },
            { val: "24px", label: "24px" },
            { val: "32px", label: "32px" },
          ],
        },
        {
          label: "letter-spacing",
          group: "f-ls",
          btns: [
            { val: "-0.05em", label: "-0.05em" },
            { val: "-0.02em", label: "-0.02em" },
            { val: "0", label: "0", on: true },
            { val: "0.05em", label: "0.05em" },
            { val: "0.1em", label: "0.1em" },
            { val: "0.25em", label: "0.25em" },
          ],
        },
        {
          label: "font-style",
          group: "f-st",
          btns: [
            { val: "normal", label: "normal", on: true },
            { val: "italic", label: "italic" },
            { val: "oblique", label: "oblique" },
          ],
        },
        {
          label: "text-transform",
          group: "f-tt",
          btns: [
            { val: "none", label: "none", on: true },
            { val: "uppercase", label: "UPPER" },
            { val: "lowercase", label: "lower" },
            { val: "capitalize", label: "Capitalize" },
          ],
        },
      ],
      vals: [
        [
          "font-family",
          "<code>\"Inter\", system-ui, sans-serif</code> — fallback bilan, har doim quote qo'shing ko'p so'zli nomlar uchun.",
        ],
        [
          "font-size",
          "<code>&lt;length&gt;</code> (px, rem, em) yoki keyword: <code>xx-small, x-small, small, medium, large, x-large, xx-large, xxx-large</code>.",
        ],
        [
          "font-weight",
          "<code>100, 200, 300, 400, 500, 600, 700, 800, 900</code> yoki <code>normal</code> (=400), <code>bold</code> (=700), <code>lighter</code>, <code>bolder</code>.",
        ],
        [
          "font-style",
          "<code>normal · italic · oblique · oblique &lt;angle&gt;</code> (masalan <code>oblique 14deg</code>).",
        ],
        [
          "font-variant",
          "<code>normal · small-caps · all-small-caps · petite-caps · titling-caps · unicase</code>.",
        ],
        [
          "font-stretch",
          "<code>ultra-condensed · extra-condensed · condensed · semi-condensed · normal · semi-expanded · expanded · extra-expanded · ultra-expanded</code> (variable font kerak).",
        ],
        [
          "letter-spacing",
          "<code>normal</code> yoki <code>&lt;length&gt;</code> (em, px, manfiy ham bo'ladi).",
        ],
        [
          "word-spacing",
          "So'zlar orasidagi masofa: <code>normal · &lt;length&gt;</code>.",
        ],
        [
          "line-height",
          "<code>normal · &lt;number&gt;</code> (1.6 — birliksiz, tavsiya) <code>· &lt;length&gt; · &lt;%&gt;</code>.",
        ],
        [
          "text-align",
          "<code>left · right · center · justify · start · end · match-parent</code>.",
        ],
        [
          "text-transform",
          "<code>none · uppercase · lowercase · capitalize · full-width · full-size-kana</code>.",
        ],
        [
          "text-decoration",
          "<code>none · underline · overline · line-through</code> + style/color/thickness.",
        ],
        [
          "text-decoration-style",
          "<code>solid · double · dotted · dashed · wavy</code>.",
        ],
        [
          "text-decoration-thickness",
          "<code>auto · from-font · &lt;length&gt;</code>.",
        ],
        [
          "text-decoration-skip-ink",
          "<code>auto · none · all</code> — chiziq harf ostidan o'tishi.",
        ],
        ["text-underline-offset", "Underline va matn orasidagi masofa."],
        ["text-indent", "Birinchi qator chekinish (paragraph indent)."],
        [
          "white-space",
          "<code>normal · nowrap · pre · pre-wrap · pre-line · break-spaces</code>.",
        ],
        [
          "word-break",
          "<code>normal · break-all · keep-all · break-word</code>.",
        ],
        ["overflow-wrap", "<code>normal · break-word · anywhere</code>."],
        ["hyphens", "<code>none · manual · auto</code>."],
        [
          "writing-mode",
          "<code>horizontal-tb · vertical-rl · vertical-lr</code>.",
        ],
        ["direction", "<code>ltr · rtl</code>."],
        [
          "font shorthand",
          "<code>font: style variant weight size/line-height family;</code>",
        ],
      ],
    },

    /* ─── S07 — Spacing & Rhythm ─── */
    {
      id: "s07",
      num: "07",
      title: "Spacing & Vertical Rhythm",
      navTitle: "Spacing & rhythm",
      desc: "line-height va vertikal ritm — o'qilishi qulay, professional matn uchun eng muhim qoidalar.",
      info: [
        {
          p: "<b>Vertikal ritm</b> — matn elementlari orasidagi izchil intervallar tizimi. To'g'ri ritm matnni o'qishni osonlashtiradi va sahifaga professional ko'rinish beradi.",
        },
        {
          ul: [
            "<code>line-height</code> — eng muhim. Juda kichik (1.0) — qatorlar yopishadi, juda katta (2.5) — bog'liqlik yo'qoladi. <b>Body uchun 1.5–1.7</b> ideal, sarlavhalar uchun 1–1.2.",
            "<b>Birliksiz line-height:</b> <code>line-height: 1.6</code> (em/px emas) — font-size ga proporsional, meros to'g'ri ishlaydi. Bu eng tavsiya etilgan format.",
            "<b>Type scale</b> — sarlavhalar uchun matematik nisbat. Major Third (1.25x), Perfect Fourth (1.333x), Golden Ratio (1.618x).",
            "<b>max-width: 65ch</b> — bir qatorda 50–75 belgi optimal o'qish kengligi. Juda uzun qator ko'zni charchatadi.",
            "<b>letter-spacing</b> ham ritmga ta'sir qiladi — sarlavhalarda kichik manfiy qiymat (-0.02em) ixchamlik beradi.",
          ],
        },
        {
          p: "<b>Pro qoida:</b> sarlavha bilan paragraph orasidagi bo'shliq paragraph-paragraph dan kattaroq bo'lishi kerak. Bu vizual guruh yaratadi.",
        },
      ],
      stage: `
        <div class="rhdem" id="s07-text">
          <h2 class="rh-h2" style="font-size:2.2rem;line-height:1.2">Heading Level 2</h2>
          <p class="rh-p" style="font-size:1.4rem;line-height:1.7">Vertikal ritm matn elementlarining intervalini belgilaydi. To'g'ri ritm o'quvchiga matnni oson o'qish imkonini beradi va sahifaga professional ko'rinish beradi.</p>
          <h3 class="rh-h3" style="font-size:1.7rem;line-height:1.3">Heading Level 3</h3>
          <p class="rh-p" style="font-size:1.4rem;line-height:1.7">Har bir heading va paragraf orasida izchil bo'shliq baseline grid ga asoslanadi. line-height ni o'zgartirib ko'ring.</p>
        </div>`,
      controls: [
        {
          label: "line-height",
          group: "r-lh",
          btns: [
            { val: "1", label: "1" },
            { val: "1.2", label: "1.2" },
            { val: "1.4", label: "1.4" },
            { val: "1.6", label: "1.6" },
            { val: "1.7", label: "1.7", on: true },
            { val: "2", label: "2" },
            { val: "2.5", label: "2.5" },
          ],
        },
        {
          label: "font-size",
          group: "r-fs",
          btns: [
            { val: "12px", label: "12px" },
            { val: "14px", label: "14px", on: true },
            { val: "16px", label: "16px" },
            { val: "18px", label: "18px" },
            { val: "20px", label: "20px" },
          ],
        },
        {
          label: "letter-spacing",
          group: "r-ls",
          btns: [
            { val: "-0.03em", label: "-0.03em" },
            { val: "0", label: "0", on: true },
            { val: "0.02em", label: "0.02em" },
            { val: "0.05em", label: "0.05em" },
          ],
        },
      ],
      vals: [
        [
          "line-height: normal",
          "Brauzer default (odatda ~1.2). Tavsiya etilmaydi.",
        ],
        [
          "line-height: &lt;number&gt;",
          "<b>Eng yaxshi.</b> <code>1.6</code> — birliksiz, meros to'g'ri.",
        ],
        [
          "line-height: &lt;length&gt;",
          "<code>24px</code> — qattiq qiymat, meros to'g'ri ishlamaydi.",
        ],
        ["line-height: &lt;%&gt;", "<code>160%</code> — font-size ning foizi."],
        ["Body line-height", "<b>1.5–1.7</b> — eng o'qishga qulay."],
        [
          "Heading line-height",
          "<b>1–1.2</b> — sarlavhalar zich bo'lishi kerak.",
        ],
        [
          "Type scale",
          "Major Third (1.25x), Perfect Fourth (1.333x), Golden Ratio (1.618x).",
        ],
        ["max-width: 65ch", "Optimal o'qish kengligi (~50-75 belgi)."],
        [
          "margin-bottom (heading)",
          "<b>Paragraph dan kattaroq</b> bo'lishi kerak — guruh yaratadi.",
        ],
      ],
    },

    /* ─── S08 — Fluid clamp() ─── */
    {
      id: "s08",
      num: "08",
      title: "Fluid Typography — clamp()",
      navTitle: "Fluid clamp()",
      desc: "clamp(min, preferred, max) — ekran o'lchamiga qarab avtomatik moslashuvchi o'lcham. Media query KERAK EMAS.",
      info: [
        {
          p: "<code>clamp(MIN, PREFERRED, MAX)</code> — uchta qiymat oladi va natijani <b>MIN va MAX orasida</b> ushlab turadi, oraliqda PREFERRED ga ergashadi. Bu fluid (suyuq) tipografiyaning zamonaviy va eng to'g'ri usuli.",
        },
        {
          ul: [
            "<b>MIN</b> — eng kichik ruxsat etilgan o'lcham. Telefon ekranida shu o'lcham bo'ladi. Masalan <code>1.6rem</code>.",
            "<b>PREFERRED</b> — odatda viewport birligi (<code>vw</code>) yoki kombinatsiya. <code>4vw</code> — ekran kengligining 4%.",
            "<b>MAX</b> — eng katta ruxsat etilgan o'lcham. Ultra-wide monitorda shu o'lcham. Masalan <code>4rem</code>.",
          ],
        },
        {
          p: "<b>Afzalligi:</b> bitta qator kod media query larsiz barcha ekranlarda silliq o'lchamlashni ta'minlaydi. Resize qilinganda ham silliq o'tadi (pog'onali emas).",
        },
        { p: "<b>min() va max() funksiyalari:</b>" },
        {
          ul: [
            "<code>min(90%, 1200px)</code> — kichikrog'ini tanlaydi (max-width sifatida).",
            "<code>max(2rem, 5vw)</code> — kattarog'ini tanlaydi (min-width sifatida).",
            "<code>clamp(a, b, c) = max(a, min(b, c))</code> — ikkisining kombinatsiyasi.",
          ],
        },
        {
          p: "<b>Pro formula:</b> <code>clamp(min-rem, calc(min-rem + (max - min) * ((100vw - min-vw) / (max-vw - min-vw))), max-rem)</code> — aniq sinov va xato birikmasi.",
        },
      ],
      stage: `
        <div class="cldem">
          <div class="cldem__box" id="s08-box" style="font-size:clamp(1.6rem, 4vw, 4rem)">Fluid Text</div>
          <div class="cldem__info" id="s08-info">
            <span>min: <b>1.6rem</b></span>
            <span>preferred: <b>4vw</b></span>
            <span>max: <b>4rem</b></span>
          </div>
        </div>`,
      controls: [
        {
          label: "clamp preset",
          group: "clamp",
          btns: [
            { val: "clamp(1.6rem, 4vw, 4rem)", label: "heading", on: true },
            { val: "clamp(1.4rem, 2vw, 2.4rem)", label: "subheading" },
            { val: "clamp(1.2rem, 1.5vw, 1.8rem)", label: "body" },
            { val: "clamp(1rem, 1.2vw, 1.4rem)", label: "small" },
            { val: "clamp(3rem, 8vw, 9rem)", label: "display" },
            { val: "clamp(5rem, 12vw, 14rem)", label: "hero" },
          ],
        },
      ],
      vals: [
        [
          "clamp(a, b, c)",
          "<b>b ni a va c orasida ushlaydi.</b> a ≤ result ≤ c.",
        ],
        ["min(a, b)", "Kichikrog'ini tanlaydi (max-width o'rniga)."],
        ["max(a, b)", "Kattarog'ini tanlaydi (min-width o'rniga)."],
        ["calc()", "Matematik amallar: <code>calc(100% - 20px)</code>."],
        ["1vw / 1vh", "Viewport kengligi/balandligining 1%."],
        ["1rem", "Root font-size (default 16px) ga nisbatan."],
        ["1em", "Parent font-size ga nisbatan."],
        ["1ch", '"0" raqami kengligi.'],
        ["1ex", '"x" harfi balandligi.'],
        ["1%", "Parent o'lchamiga nisbatan foiz."],
        ["1fr", "Grid uchun — qolgan joyni proporsional bo'lish."],
      ],
    },

    /* ─── S09 — Text Effects ─── */
    {
      id: "s09",
      num: "09",
      title: "Text Effects & Decorations",
      navTitle: "Text effects",
      desc: "Gradient text, text-stroke, truncation, line-clamp, animated underline, glow va boshqa professional effektlar.",
      info: [
        {
          p: "Modern CSS bilan matnga turli professional vizual effektlar berish mumkin. Hech qanday image yoki SVG kerak emas — sof CSS.",
        },
        {
          ul: [
            "<b>Gradient text</b> — <code>background-clip: text</code> + <code>-webkit-text-fill-color: transparent</code>. Gradient matnning shaklida ko'rinadi.",
            "<b>Text stroke</b> — <code>-webkit-text-stroke: 1px color</code> — matn konturi (outline). Ichki rangni <code>color: transparent</code> bilan o'chirish mumkin.",
            '<b>Truncate (1 qator)</b> — <code>white-space: nowrap + overflow: hidden + text-overflow: ellipsis</code> — uzun matn "..." bilan kesiladi.',
            "<b>Line clamp (N qator)</b> — <code>-webkit-line-clamp: 2</code> + <code>display: -webkit-box</code> + <code>-webkit-box-orient: vertical</code> + <code>overflow: hidden</code>.",
            "<b>Animated underline</b> — <code>background-size</code> animatsiyasi bilan hover da chizilib chiqadi.",
            "<b>Glow shadow</b> — <code>text-shadow</code> ning ko'p qatlami bilan neon effekt.",
          ],
        },
        {
          p: "<b>text-decoration ning yangi xususiyatlari:</b> <code>text-decoration-color</code>, <code>text-decoration-style</code> (solid/dotted/dashed/wavy/double), <code>text-decoration-thickness</code>, <code>text-underline-offset</code>.",
        },
      ],
      stage: `
        <div class="tedem">
          <p class="te-grad">Gradient Text</p>
          <p class="te-stroke">Outlined</p>
          <p class="te-trunc">Bu juda uzun matn bo'lib, sig'masa ellipsis bilan kesiladi va davom etmaydi</p>
          <p class="te-clamp">Bu matn aniq ikki qatorga cheklanadi. Uzun bo'lsa ikkinchi qatordan keyin uchta nuqta bilan kesiladi va shu yerda to'xtaydi albatta.</p>
          <p class="te-und">Animated underline (hover qiling)</p>
          <p class="te-glow">Glow shadow effect</p>
        </div>`,
      controls: [
        {
          label: "Effect",
          group: "te",
          btns: [
            { val: "gradient", label: "gradient text", on: true },
            { val: "stroke", label: "text-stroke" },
            { val: "truncate", label: "truncate (...)" },
            { val: "clamp", label: "line-clamp: 2" },
            { val: "underline", label: "animated underline" },
            { val: "glow", label: "glow shadow" },
            { val: "decoration", label: "text-decoration variants" },
          ],
        },
      ],
      vals: [
        [
          "background-clip: text",
          'Gradientni matnga "qiradi". <code>-webkit-text-fill-color: transparent</code> bilan birga.',
        ],
        ["-webkit-text-stroke", "Matn konturi: <code>1px var(--pink)</code>."],
        ["-webkit-text-stroke-width", "Faqat qalinlik."],
        ["-webkit-text-stroke-color", "Faqat rang."],
        [
          "text-overflow: ellipsis",
          "... bilan kesish. <code>nowrap + overflow:hidden</code> kerak.",
        ],
        ["text-overflow: clip", "Kesib tashlaydi (... siz)."],
        ["-webkit-line-clamp", "N qatorga cheklash."],
        [
          "text-decoration",
          "Shorthand: <code>line color style thickness</code>.",
        ],
        [
          "text-decoration-line",
          "<code>none · underline · overline · line-through · blink</code>.",
        ],
        [
          "text-decoration-style",
          "<code>solid · double · dotted · dashed · wavy</code>.",
        ],
        ["text-decoration-color", "Chiziq rangi (alohida)."],
        [
          "text-decoration-thickness",
          "<code>auto · from-font · &lt;length&gt;</code>.",
        ],
        ["text-underline-offset", "Underline va matn orasidagi masofa."],
        [
          "text-decoration-skip-ink",
          "<code>auto · none · all</code> — chiziq harf \"quyrug'i\" dan o'tadimi.",
        ],
        [
          "text-shadow",
          "<code>x y blur color</code>. Ko'p qatlam vergul bilan.",
        ],
        [
          "mix-blend-mode",
          "<code>multiply · screen · overlay</code> — fon bilan aralashish.",
        ],
      ],
    },
  ],
});

/* ════════════════════════════════════════════════════════════════
   CHAPTER III — POSITIONS
════════════════════════════════════════════════════════════════ */
CHAPTERS.push({
  cls: "pos",
  roman: "III",
  title: "Positions",
  desc: "CSS position tizimi — static, relative, absolute, fixed, sticky + z-index va stacking",
  sections: [
    /* ─── S10 — Static & Relative ─── */
    {
      id: "s10",
      num: "10",
      title: "position: static & relative",
      navTitle: "static & relative",
      desc: "static — default normal oqim. relative — o'z joyidan siljiydi, joyi saqlanadi.",
      info: [
        {
          p: "<code>position</code> elementning qanday joylashishini boshqaradi. <b>5 ta qiymati</b> bor: static (default), relative, absolute, fixed, sticky.",
        },
        {
          ul: [
            "<code>position: static</code> — <b>DEFAULT.</b> Element normal document oqimida. <code>top/right/bottom/left</code> va <code>z-index</code> <b>ta'sir etmaydi</b>. Hech narsa qilinmaganda barcha elementlar shu holatda.",
            '<code>position: relative</code> — element o\'z normal joyiga nisbatan <code>top/left</code> bilan siljiydi. <b>Eng muhim:</b> uning <b>original joyi saqlanib qoladi</b> — boshqa elementlar siljimaydi, "shaklini" ushlab turadi.',
          ],
        },
        { p: "<b>Eng muhim qoidalar:</b>" },
        {
          ul: [
            "<code>relative</code> element — <b>absolute farzandlar uchun mos yozuvlar nuqtasi</b> (positioning context) bo'lib xizmat qiladi. Shuning uchun ko'pincha offset bermasdan, faqat container sifatida ishlatiladi.",
            "<code>top: 10px</code> — element 10px pastga siljiydi. <code>bottom: 10px</code> — 10px yuqoriga.",
            "<code>inset: 10px</code> — to'rt tomonga (top/right/bottom/left) bir vaqtda.",
          ],
        },
        {
          p: "<b>Amaliy ishlatish:</b> kichik tuzatishlar (badge ni siljitish, ikon yonida tekislash), <code>absolute</code> uchun container yaratish, z-index berish uchun.",
        },
      ],
      stage: `
        <div class="posdem">
          <div class="posbox">static</div>
          <div class="posbox target" id="s10-box">target box</div>
          <div class="posbox">static</div>
        </div>`,
      controls: [
        {
          label: "position",
          group: "p10",
          btns: [
            { val: "static", label: "static", on: true },
            { val: "relative", label: "relative" },
          ],
        },
        {
          label: "top",
          group: "p10-t",
          btns: [
            { val: "0", label: "top: 0", on: true },
            { val: "8px", label: "8px" },
            { val: "16px", label: "16px" },
            { val: "-12px", label: "-12px" },
          ],
        },
        {
          label: "left",
          group: "p10-l",
          btns: [
            { val: "0", label: "left: 0", on: true },
            { val: "16px", label: "16px" },
            { val: "32px", label: "32px" },
            { val: "-16px", label: "-16px" },
          ],
        },
      ],
      vals: [
        [
          "position: static",
          "<b>Default.</b> Normal oqim, offset ta'sir etmaydi.",
        ],
        ["position: relative", "<b>O'z joyidan siljiydi</b>, joyi saqlanadi."],
        ["top", "Yuqoridan masofa (positioned element uchun)."],
        ["right", "O'ngdan masofa."],
        ["bottom", "Pastdan masofa."],
        ["left", "Chapdan masofa."],
        ["inset: 0", "Shorthand: top:0; right:0; bottom:0; left:0;"],
        ["inset: 10px", "To'rt tomonga 10px."],
        ["inset: 10px 20px", "<code>vertical horizontal</code>."],
        ["inset: 10px 20px 30px 40px", "<code>top right bottom left</code>."],
        ["inset-inline / inset-block", "Logical properties (RTL uchun)."],
      ],
    },

    /* ─── S11 — Absolute ─── */
    {
      id: "s11",
      num: "11",
      title: "position: absolute",
      navTitle: "absolute",
      desc: "Normal oqimdan butunlay chiqadi. Eng yaqin positioned (relative/absolute/fixed) ajdodga nisbatan joylashadi.",
      info: [
        {
          p: '<code>position: absolute</code> elementni <b>normal oqimdan butunlay chiqaradi</b> — u boshqa elementlar uchun "ko\'rinmas" bo\'ladi, ya\'ni joy egallamaydi. Boshqa elementlar uning ustiga "yopiladi".',
        },
        {
          ul: [
            "Element <b>eng yaqin positioned ajdodga</b> (relative/absolute/fixed bo'lgan parent) nisbatan joylashadi.",
            "Agar positioned ajdod bo'lmasa — <b>html (viewport)</b> ga nisbatan joylashadi.",
            "<code>top/right/bottom/left</code> bilan aniq pozitsiya beriladi.",
            "<b>Width va height</b> — agar berilmasa, content ga moslashadi.",
          ],
        },
        {
          p: "<b>Markazlash trick (mashhur):</b> <code>top: 50%; left: 50%; transform: translate(-50%, -50%)</code> — har qanday o'lchamdagi elementni aniq markazga qo'yadi. Yangi usul: <code>inset: 0; margin: auto</code> (width/height bilan).",
        },
        { p: "<b>Tipik ishlatilishi:</b>" },
        {
          ul: [
            "Badge, tooltip, dropdown menu.",
            "Modal close button (X) — yuqori-o'ng burchakda.",
            "Overlay qatlamlar.",
            "Custom checkbox/radio dizayni.",
            "Image ustidagi matn (hero section).",
          ],
        },
      ],
      stageClass: "top",
      stage: `
        <div class="absdem">
          <div class="absdem__wrap">
            <span class="absdem__label">position: relative (container)</span>
            <div class="absbox" id="s11-box" style="top:8px;left:8px">absolute</div>
            <div class="abssib">Normal oqim sibling</div>
            <div class="abssib">Normal oqim sibling</div>
            <div class="abssib">Normal oqim sibling</div>
          </div>
        </div>`,
      controls: [
        {
          label: "Pozitsiya",
          group: "p11",
          btns: [
            { val: "tl", label: "top-left", on: true },
            { val: "tr", label: "top-right" },
            { val: "bl", label: "bottom-left" },
            { val: "br", label: "bottom-right" },
            { val: "center", label: "center (translate)" },
            { val: "stretch", label: "stretch (inset:8px)" },
          ],
        },
      ],
      vals: [
        ["position: absolute", "<b>Oqimdan chiqadi</b>, joy egallamaydi."],
        ["top: 10px", "Positioned ajdoddan 10px pastga."],
        ["top: 50%", "Ajdodning balandligining 50% i."],
        ["top + bottom", "Ikkalasi birga — cho'zish."],
        ["inset: 0", "To'rt tomonga 0 — to'liq cho'zish (parent ni qoplaydi)."],
        ["margin: auto + inset:0", "Markazlash (width/height bilan)."],
        [
          "top:50%;left:50%;transform:translate(-50%,-50%)",
          "<b>Mashhur markazlash trick.</b> Har qanday o'lcham.",
        ],
        ["z-index", "Ustivorlik (boshqa absolute elementlardan ustun/past)."],
      ],
    },

    /* ─── S12 — Fixed & Sticky ─── */
    {
      id: "s12",
      num: "12",
      title: "position: fixed & sticky",
      navTitle: "fixed & sticky",
      desc: "fixed — viewport ga yopishadi (scroll da qimirlamaydi). sticky — chegaragacha normal, keyin yopishadi.",
      info: [
        { p: "Ikkita maxsus pozitsiya turi <b>scroll bilan bog'liq</b>:" },
        {
          ul: [
            "<code>position: fixed</code> — element <b>viewport ga</b> nisbatan joylashadi va scroll qilinganda ham <b>o'z joyida qoladi</b>. Sahifa qaysi joyda bo'lishidan qat'i nazar — har doim ko'rinib turadi.",
            "<code>position: sticky</code> — gibrid xulq. Element <b>normal oqimda</b> bo'ladi, lekin scroll ma'lum chegaraga yetganda <b>\"yopishib\" qoladi</b>. Bu fixed va relative ning aralashmasi.",
          ],
        },
        { p: "<b>fixed amaliy ishlatish:</b>" },
        {
          ul: [
            "Yuqoridagi progress bar (bu sahifada ham bor!).",
            "Floating action button (FAB) — qo'shish tugmasi.",
            "Modal/dialog overlay (butun ekranni qoplash).",
            "Mobile navigation bar (pastdagi tab bar).",
            "Cookie banner.",
          ],
        },
        { p: "<b>sticky muhim qoidalar:</b>" },
        {
          ul: [
            "<code>top</code> (yoki left/bottom/right) qiymati <b>shart</b> — qayerda yopishishni belgilaydi.",
            "Sticky faqat o'z <b>parent konteyneri ichida</b> ishlaydi — parent tugagach, qaytib oqimga qo'shiladi.",
            "Parent da <code>overflow: hidden/auto/scroll</code> bo'lsa, sticky ishlamasligi mumkin.",
            "Sibling lar bilan o'zaro ta'sir qiladi (keyingi sticky avvalgisini \"itarib\" chiqaradi).",
          ],
        },
        {
          p: "<b>sticky amaliy ishlatish:</b> table header, section navigation, sidebar (uzun sahifalarda), date separator (chat ilovalarida).",
        },
      ],
      stageClass: "scroll",
      stage: `
        <div class="stkdem">
          <h4>sticky header (top: 0) — scroll qiling ↓</h4>
          <div class="stk-content">
            <p>Scroll qiling — sariq header yuqorida yopishib qoladi.</p>
            <p>fixed dan farqi: sticky parent ichida ishlaydi.</p>
            <p>Parent tugagach sticky ham tugaydi va oqimga qaytadi.</p>
            <p>Navbar, table header, section nav uchun ideal.</p>
            <p>Scroll davom eting...</p>
            <p>fixed esa viewport ga nisbatan — parent ahamiyati yo'q.</p>
            <p>Yuqoridagi progress bar — fixed misoli.</p>
            <p>Mobile da bottom navigation — odatda fixed.</p>
            <p>Modal overlay — fixed (butun viewport ni qoplash).</p>
            <p>Chat ilovasidagi sana ajratgich — sticky.</p>
          </div>
        </div>`,
      vals: [
        [
          "position: fixed",
          "<b>Viewport ga yopishadi.</b> Scroll da qimirlamaydi.",
        ],
        [
          "position: sticky",
          "<b>Gibrid:</b> chegaragacha normal, keyin yopishadi.",
        ],
        ["top: 0 (sticky)", "<b>SHART.</b> Qayerda yopishishni belgilaydi."],
        ["top / bottom (sticky)", "Vertical sticky uchun."],
        ["left / right (sticky)", "Horizontal sticky uchun (kam ishlatiladi)."],
        [
          "z-index (fixed)",
          "Modal uchun katta qiymat: <code>z-index: 1000+</code>.",
        ],
        ["width: 100% (fixed)", "Butun viewport kengligi."],
        [
          "Parent overflow",
          "<code>hidden/auto/scroll</code> sticky ni buzishi mumkin.",
        ],
      ],
    },

    /* ─── S13 — z-index ─── */
    {
      id: "s13",
      num: "13",
      title: "z-index & Stacking Context",
      navTitle: "z-index & stacking",
      desc: 'Elementlarning "chuqurlik" tartibini boshqaradi. Faqat positioned elementlarda ishlaydi.',
      info: [
        {
          p: "<code>z-index</code> elementlarning <b>old-orqa tartibini</b> (qaysi biri ustda) boshqaradi. Katta z-index — yuqorida (oldinda) ko'rinadi.",
        },
        {
          ul: [
            "Faqat <b>positioned</b> elementlarda (relative/absolute/fixed/sticky) ishlaydi. Static elementda ta'sir etmaydi.",
            "Qiymat butun son: musbat, manfiy yoki 0. <code>z-index: -1</code> — orqaga.",
            "Default <code>z-index: auto</code> — yangi context yaratmaydi.",
          ],
        },
        {
          p: "<b>Stacking context (qatlamlash konteksti)</b> — eng muhim va chalkash tushuncha. Har bir context o'z ichida <b>alohida</b> z-index hisoblaydi.",
        },
        { p: "Yangi stacking context yaratuvchilar:" },
        {
          ul: [
            "<code>position</code> + <code>z-index</code> (auto emas).",
            "<code>opacity</code> &lt; 1 (masalan 0.99).",
            "<code>transform</code> (none dan boshqa).",
            "<code>filter</code> (none dan boshqa).",
            "<code>will-change</code> bilan ko'rsatilgan property.",
            "<code>isolation: isolate</code> — maxsus shu maqsadda.",
            "<code>contain: layout/paint</code>.",
            "flex/grid farzandi + z-index (auto emas).",
          ],
        },
        {
          p: "<b>Asosiy muammo:</b> ichki stacking context dagi element <code>z-index: 9999</code> bo'lsa ham, tashqi context dagi <code>z-index: 1</code> elementdan <b>ustun chiqolmaydi</b>.",
        },
        { p: "<b>Pro yondashuv — z-index token:</b>" },
        {
          ul: [
            "0-9 — content qatlami",
            "10-99 — dropdown, tooltip",
            "100-999 — header, sticky nav",
            "1000+ — modal, dialog",
            "9999 — toast, critical alert",
          ],
        },
      ],
      stage: `
        <div class="zdem">
          <div class="zbox" id="s13-z1" style="z-index:1;background:var(--pink);left:18px;top:18px">z:1</div>
          <div class="zbox" id="s13-z2" style="z-index:2;background:var(--blue);left:62px;top:38px">z:2</div>
          <div class="zbox" id="s13-z3" style="z-index:3;background:var(--gold);left:106px;top:24px">z:3</div>
        </div>`,
      controls: [
        {
          label: "Pink (z-1)",
          group: "z-1",
          btns: [
            { val: "-1", label: "-1" },
            { val: "0", label: "0" },
            { val: "1", label: "1", on: true },
            { val: "5", label: "5" },
            { val: "10", label: "10" },
          ],
        },
        {
          label: "Blue (z-2)",
          group: "z-2",
          btns: [
            { val: "-1", label: "-1" },
            { val: "1", label: "1" },
            { val: "2", label: "2", on: true },
            { val: "5", label: "5" },
            { val: "10", label: "10" },
          ],
        },
        {
          label: "Gold (z-3)",
          group: "z-3",
          btns: [
            { val: "-1", label: "-1" },
            { val: "1", label: "1" },
            { val: "2", label: "2" },
            { val: "3", label: "3", on: true },
            { val: "10", label: "10" },
          ],
        },
      ],
      vals: [
        ["z-index: auto", "<b>Default.</b> Yangi context yaratmaydi."],
        ["z-index: 0", "Boshqalar bilan teng (lekin context yaratadi)."],
        ["z-index: &lt;positive&gt;", "Yuqoriga — boshqa elementlardan ustun."],
        ["z-index: &lt;negative&gt;", "Pastga — boshqalar ortida."],
        [
          "Stacking context",
          "<b>Yangi qatlamlash konteksti</b> yaratuvchilar quyida.",
        ],
        ["position + z-index", "Yangi context."],
        ["opacity &lt; 1", "0.99 ham yangi context yaratadi (kutilmagan)."],
        [
          "transform: not(none)",
          "Translate, scale, rotate — context yaratadi.",
        ],
        ["filter: not(none)", "Blur, brightness ham context."],
        [
          "isolation: isolate",
          "<b>Maxsus shu maqsadda</b> yangi context yaratadi (z-index siz).",
        ],
        ["will-change", "Brauzerga ko'rsatma + context."],
        [
          "Pro token tizimi",
          "<code>--z-modal: 1000</code>, <code>--z-toast: 9999</code>.",
        ],
      ],
    },
  ],
});

/* ════════════════════════════════════════════════════════════════
   CHAPTER IV — SHADOWS
════════════════════════════════════════════════════════════════ */
CHAPTERS.push({
  cls: "shd",
  roman: "IV",
  title: "Shadows",
  desc: "box-shadow, text-shadow, drop-shadow filter — professional soya effektlar",
  sections: [
    /* ─── S14 — box-shadow ─── */
    {
      id: "s14",
      num: "14",
      title: "box-shadow",
      navTitle: "box-shadow",
      desc: "Elementga soya beradi. To'liq sintaksis: x-offset y-offset blur spread color [inset]. Ko'p soya vergul bilan.",
      info: [
        {
          p: "<code>box-shadow</code> elementning <b>to'rtburchak chegarasi (bounding box)</b> atrofida soya yaratadi. To'liq sintaksis:",
        },
        {
          p: "<code>box-shadow: &lt;x&gt; &lt;y&gt; &lt;blur&gt; &lt;spread&gt; &lt;color&gt; [inset];</code>",
        },
        {
          ul: [
            "<b>x offset</b> — gorizontal siljish. Musbat = o'ng, manfiy = chap.",
            "<b>y offset</b> — vertikal siljish. Musbat = past, manfiy = yuqori.",
            "<b>blur radius</b> — xiralashtirish darajasi. 0 = keskin, katta = yumshoq, tabiiy.",
            "<b>spread radius</b> — soyaning kengayishi/qisqarishi (<b>ixtiyoriy</b>). Musbat — soya kattaroq, manfiy — kichikroq.",
            "<b>color</b> — odatda yarim shaffof: <code>rgba(0,0,0,.4)</code>. Tabiiy ko'rinish uchun.",
            "<b>inset</b> — soyani <b>ichkariga</b> qiladi (default tashqariga). Pressed/inset effekt.",
          ],
        },
        {
          p: "<b>Pro texnika — qatlamli soya (layered shadows):</b> bitta katta soya o'rniga <b>2-3 ta soyani vergul bilan</b> qo'shing. Bu tabiiyroq, chuqurroq ko'rinadi.",
        },
        {
          p: "Misol: <code>0 1px 2px rgba(0,0,0,.3), 0 4px 8px rgba(0,0,0,.2), 0 16px 32px rgba(0,0,0,.15)</code> — uch qatlam, har biri turli o'lcham va shaffoflik.",
        },
        {
          p: "<b>Elevation tizimi (Material Design dan):</b> 5 darajali soya — har daraja uchun aniq shadow token. <code>--shadow-1, --shadow-2, ...</code>.",
        },
      ],
      stage: `
        <div class="shdem">
          <div class="shbox" id="s14-box">box-shadow</div>
        </div>`,
      controls: [
        {
          label: "Preset",
          group: "sh",
          btns: [
            { val: "soft", label: "soft", on: true },
            { val: "hard", label: "hard" },
            { val: "glow-pink", label: "glow pink" },
            { val: "glow-blue", label: "glow blue" },
            { val: "multi", label: "multi layer" },
            { val: "inset", label: "inset" },
            { val: "neuro", label: "neumorphic" },
            { val: "elev1", label: "elevation 1" },
            { val: "elev2", label: "elevation 2" },
            { val: "elev3", label: "elevation 3" },
            { val: "none", label: "none" },
          ],
        },
      ],
      vals: [
        ["box-shadow: none", "Default. Soya yo'q."],
        ["x y color", "Minimal: 3 qiymat. <code>2px 2px #000</code>."],
        ["x y blur color", "Asosiy: 4 qiymat (eng ko'p ishlatiladi)."],
        ["x y blur spread color", "To'liq: 5 qiymat. Spread bilan."],
        ["... inset", "Ichki soya (oxiriga inset qo'shing)."],
        ["shadow1, shadow2", "<b>Ko'p qatlamli</b> — vergul bilan."],
        ["rgba(0,0,0,.4)", "<b>Yarim shaffof rang</b> — tabiiyroq."],
        ["Soft preset", "<code>0 4px 16px rgba(0,0,0,.4)</code>"],
        ["Hard preset", "<code>4px 4px 0 var(--pink)</code>"],
        ["Glow effect", "<code>0 0 20px rgba(255,69,100,.5)</code> (offset 0)"],
        [
          "Multi-layer",
          "<code>0 1px 3px ..., 0 8px 24px ..., 0 0 0 1px ...</code>",
        ],
        ["Inset", "<code>inset 0 2px 8px rgba(0,0,0,.5)</code>"],
        ["Neumorphic", "<code>6px 6px 12px dark, -4px -4px 10px light</code>"],
      ],
    },

    /* ─── S15 — text-shadow ─── */
    {
      id: "s15",
      num: "15",
      title: "text-shadow",
      navTitle: "text-shadow",
      desc: "Matnga soya. Sintaksis: x-offset y-offset blur color. Spread va inset YO'Q.",
      info: [
        {
          p: "<code>text-shadow</code> matnga soya qo'shadi. Sintaksis box-shadow ga o'xshash, lekin <b>spread va inset YO'Q</b>:",
        },
        {
          p: "<code>text-shadow: &lt;x&gt; &lt;y&gt; &lt;blur&gt; &lt;color&gt;;</code>",
        },
        {
          ul: [
            "<b>Oddiy soya:</b> <code>2px 2px 4px rgba(0,0,0,.5)</code> — fon ustida matnni ajratadi (overlay matni uchun foydali).",
            "<b>Neon glow:</b> bir necha yorqin soya qatlami bir xil rang bilan — <code>0 0 10px, 0 0 20px, 0 0 40px</code>.",
            "<b>Fire effect:</b> yuqoriga qarab oq → sariq → qizil soyalar.",
            "<b>Emboss:</b> yorqin va qorong'i soya kombinatsiyasi — relyef effekti.",
            '<b>3D extrude:</b> bir nechta soya pog\'onali ofset bilan — matnga "qalinlik" beradi.',
          ],
        },
        {
          p: "<b>Accessibility:</b> matn soyasi kontrastni oshirishi mumkin, lekin o'qilishni qiyinlashtirmasligi kerak. Faqat dekorativ sarlavhalarda kuchli effekt ishlatish maqsadga muvofiq. Body matnda <code>text-shadow: none</code> tavsiya etiladi.",
        },
        {
          p: "<b>Performance:</b> text-shadow — paint qadami. Ko'p qatlamli text-shadow li elementga animatsiya berish sekin bo'lishi mumkin.",
        },
      ],
      stage: `
        <div class="tsdem">
          <p class="tstext" id="s15-text">Text Shadow</p>
        </div>`,
      controls: [
        {
          label: "Preset",
          group: "ts",
          btns: [
            { val: "glow", label: "neon glow", on: true },
            { val: "hard", label: "hard shadow" },
            { val: "multi", label: "multi color" },
            { val: "fire", label: "fire" },
            { val: "emboss", label: "emboss" },
            { val: "3d", label: "3D extrude" },
            { val: "soft", label: "soft" },
            { val: "none", label: "none" },
          ],
        },
      ],
      vals: [
        ["text-shadow: none", "Default. Soya yo'q."],
        ["x y color", "Minimal (blur=0)."],
        ["x y blur color", "Standart: 4 qiymat."],
        [
          "sh1, sh2, sh3",
          "<b>Ko'p qatlamli</b> (neon, fire effektlari uchun).",
        ],
        ["0 0 10px color", "<b>Glow</b> — offset 0, faqat blur."],
        ["1px 1px 0 #fff", "<b>Hard</b> — blur 0, keskin."],
        [
          "Neon glow",
          "<code>0 0 10px, 0 0 20px, 0 0 40px</code> bir xil rang.",
        ],
        [
          "Fire",
          "<code>0 -2px 4px #fff, 0 -4px 8px #ff0, 0 -8px 16px #f00</code>.",
        ],
        [
          "3D extrude",
          "Bir nechta soya ofset bilan: <code>1px 1px 0, 2px 2px 0, 3px 3px 0</code>.",
        ],
        ["Emboss", "<code>1px 1px white, -1px -1px black</code>."],
      ],
    },

    /* ─── S16 — drop-shadow filter ─── */
    {
      id: "s16",
      num: "16",
      title: "filter: drop-shadow()",
      navTitle: "drop-shadow",
      desc: "box-shadow dan farqli — shaffof qismlarni hisobga oladi. PNG, SVG, notekis shakllar uchun.",
      info: [
        {
          p: "<code>filter: drop-shadow()</code> ham soya beradi, lekin <b>box-shadow dan muhim farqi bor</b>:",
        },
        {
          ul: [
            "<b>box-shadow</b> — elementning <b>to'rtburchak chegarasiga</b> (bounding box) soya beradi. Shaffof qismlar hisobga olinmaydi.",
            "<b>drop-shadow</b> — elementning <b>haqiqiy shakliga</b> soya beradi. Shaffof qismlar hisobga olinadi.",
          ],
        },
        {
          p: "Demoda uchburchakka qarang: <code>box-shadow</code> to'rtburchak soya beradi (chunki bounding box to'rtburchak), <code>drop-shadow</code> esa uchburchak shaklini aniq kuzatadi.",
        },
        { p: "<b>Qachon drop-shadow ishlatiladi:</b>" },
        {
          ul: [
            "PNG ikonkalar (shaffof fon bilan).",
            "SVG ikonkalar va illustratsiyalar.",
            "<code>clip-path</code> bilan kesilgan shakllar.",
            "<code>border-radius: 50%</code> dumaloq elementlar (umuman to'g'ri ishlaydi, lekin drop-shadow yumshoqroq).",
            "<code>::before/::after</code> bilan yasalgan shakllar.",
          ],
        },
        {
          p: "<b>Sintaksis:</b> <code>filter: drop-shadow(x y blur color)</code> — spread va inset YO'Q.",
        },
        { p: "<b>Boshqa filter funksiyalari:</b>" },
        {
          ul: [
            "<code>blur(4px)</code> — xiralashtirish.",
            "<code>brightness(1.2)</code> — yorqinlik (1=normal).",
            "<code>contrast(1.5)</code> — kontrast.",
            "<code>grayscale(1)</code> — oq-qora.",
            "<code>saturate(1.5)</code> — to'yinganlik.",
            "<code>hue-rotate(90deg)</code> — rang aylantirish.",
            "<code>invert(1)</code> — rang invertatsiya.",
            "<code>sepia(1)</code> — sepia effekti.",
            "<code>opacity(.5)</code> — shaffoflik.",
            "Vergul yoki probel bilan birlashtirish mumkin.",
          ],
        },
      ],
      stageClass: "top",
      stage: `
        <div class="drdem">
          <div class="drshape" id="s16-shape">◆</div>
          <div class="drnote">drop-shadow vs box-shadow (uchburchak):</div>
          <div class="drcompare">
            <div class="drcompare__item"><div class="drtri drop">▲</div><span>drop-shadow ✓</span></div>
            <div class="drcompare__item"><div class="drtri box">▲</div><span>box-shadow ✗</span></div>
          </div>
        </div>`,
      controls: [
        {
          label: "drop-shadow",
          group: "dr",
          btns: [
            { val: "default", label: "default", on: true },
            { val: "pink", label: "pink glow" },
            { val: "blue", label: "blue glow" },
            { val: "hard", label: "hard" },
            { val: "soft", label: "soft" },
            { val: "multi", label: "multi layer" },
            { val: "none", label: "none" },
          ],
        },
      ],
      vals: [
        [
          "filter: drop-shadow(x y blur color)",
          "<b>Shaklga mos</b> soya (transparent ni hisobga oladi).",
        ],
        [
          "filter: blur(&lt;length&gt;)",
          "Xiralashtirish. <code>blur(8px)</code>.",
        ],
        [
          "filter: brightness(&lt;num&gt;)",
          "0 = qora, 1 = normal, >1 = yorqin.",
        ],
        [
          "filter: contrast(&lt;num&gt;)",
          "0 = kulrang, 1 = normal, >1 = kuchaytirilgan.",
        ],
        ["filter: grayscale(&lt;num&gt;)", "0 = original, 1 = to'liq oq-qora."],
        [
          "filter: saturate(&lt;num&gt;)",
          "0 = oq-qora, 1 = normal, >1 = jonli.",
        ],
        [
          "filter: hue-rotate(&lt;deg&gt;)",
          "Rang doirasini aylantirish. <code>180deg</code>.",
        ],
        ["filter: invert(&lt;num&gt;)", "0 = original, 1 = teskari."],
        ["filter: sepia(&lt;num&gt;)", "Sepia (eski foto) effekti."],
        ["filter: opacity(&lt;num&gt;)", "Shaffoflik (opacity property kabi)."],
        [
          "filter: a b c",
          "<b>Ko'p filter birga.</b> <code>blur(2px) brightness(1.2)</code>.",
        ],
        [
          "backdrop-filter",
          "Element <b>ortidagi</b> fonga filter (glassmorphism uchun).",
        ],
      ],
    },
  ],
});

/* ════════════════════════════════════════════════════════════════
   CHAPTER V — ANIMATIONS
════════════════════════════════════════════════════════════════ */
CHAPTERS.push({
  cls: "ani",
  roman: "V",
  title: "Animations",
  desc: "transition, @keyframes, animation properties, transform — silliq professional animatsiyalar",
  sections: [
    /* ─── S17 — transition ─── */
    {
      id: "s17",
      num: "17",
      title: "transition",
      navTitle: "transition",
      desc: "Holatlar o'zgarganda silliq animatsiya. Sintaksis: property duration timing-function delay.",
      info: [
        {
          p: "<code>transition</code> element xususiyati o'zgarganda (masalan <code>:hover</code> da) o'sha o'zgarishni <b>silliq animatsiya</b> qiladi. To'liq sintaksis:",
        },
        {
          p: "<code>transition: &lt;property&gt; &lt;duration&gt; &lt;timing-function&gt; &lt;delay&gt;;</code>",
        },
        {
          ul: [
            "<b>property</b> — qaysi xususiyat animatsiya bo'ladi. <code>all</code>, <code>transform</code>, <code>opacity</code>, <code>background-color</code>...",
            "<b>duration</b> — davomiyligi. <code>0.3s</code>, <code>300ms</code>. UI uchun <b>0.15–0.3s</b> optimal.",
            "<b>timing-function</b> — tezlik egri chizig'i (easing).",
            "<b>delay</b> — kechikish (ixtiyoriy). Stagger effekt uchun.",
          ],
        },
        { p: "<b>Easing tushunchasi (juda muhim):</b>" },
        {
          ul: [
            "<code>linear</code> — bir tekis tezlik. Robotik his qiladi.",
            "<code>ease</code> — sekin-tez-sekin (default). Universal.",
            "<code>ease-in</code> — sekin boshlanadi, tez tugaydi. Chiqib ketish uchun.",
            "<code>ease-out</code> — tez boshlanadi, sekinlaydi. <b>UI uchun eng tabiiy</b>. Kelib joylashishlar uchun.",
            "<code>ease-in-out</code> — ikkala uchida sekin. Loop animatsiyalar uchun.",
            "<code>cubic-bezier(.34, 1.56, .64, 1)</code> — spring/bounce effekt.",
            "<code>steps(N)</code> — N ta pog'ona (sprite animatsiyalar uchun).",
          ],
        },
        { p: "<b>Performance qoidalari (juda muhim):</b>" },
        {
          ul: [
            "Faqat <code>transform</code> va <code>opacity</code> ni animatsiya qiling — ular <b>GPU da ishlaydi</b> (compositor layer).",
            "<code>width, height, top, left, margin, padding</code> ni animatsiya qilish — <b>Layout reflow</b> keltirib chiqaradi (sekin, dropped frames).",
            "<code>color, background</code> — Paint qadami (o'rtacha, OK).",
            "<code>transition: all</code> — yomon odat. Aniq property yozish tavsiya etiladi.",
          ],
        },
      ],
      stage: `
        <div class="trdem">
          <div class="trbox" id="s17-box">Hover me</div>
          <div class="eased">
            <div class="eased__row"><span class="name">linear</span><div class="eased__track"><div class="eased__ball linear"></div></div></div>
            <div class="eased__row"><span class="name">ease</span><div class="eased__track"><div class="eased__ball ease"></div></div></div>
            <div class="eased__row"><span class="name">ease-out</span><div class="eased__track"><div class="eased__ball eo"></div></div></div>
            <div class="eased__row"><span class="name">spring</span><div class="eased__track"><div class="eased__ball spr"></div></div></div>
          </div>
          <button class="playbtn" id="s17-play">▶ Play easings</button>
        </div>`,
      controls: [
        {
          label: "duration",
          group: "tr-dur",
          btns: [
            { val: "0.1s", label: "0.1s" },
            { val: "0.15s", label: "0.15s" },
            { val: "0.3s", label: "0.3s", on: true },
            { val: "0.6s", label: "0.6s" },
            { val: "1s", label: "1s" },
            { val: "2s", label: "2s" },
          ],
        },
        {
          label: "timing",
          group: "tr-ease",
          btns: [
            { val: "linear", label: "linear" },
            { val: "ease", label: "ease", on: true },
            { val: "ease-in", label: "ease-in" },
            { val: "ease-out", label: "ease-out" },
            { val: "ease-in-out", label: "ease-in-out" },
            { val: "cubic-bezier(.34,1.56,.64,1)", label: "spring" },
            { val: "steps(4)", label: "steps(4)" },
          ],
        },
      ],
      vals: [
        [
          "transition: all .3s",
          "Hammasini 0.3s. Yomon — aniq property tavsiya.",
        ],
        [
          "transition: transform .3s ease-out",
          "<b>Tavsiya:</b> aniq property + easing.",
        ],
        [
          "transition-property",
          "<code>all · none · &lt;property&gt; · prop1, prop2</code>.",
        ],
        ["transition-duration", "<code>0s · &lt;time&gt;</code> (s yoki ms)."],
        ["transition-timing-function", "Easing — quyida."],
        ["transition-delay", "Kechikish: <code>0s · &lt;time&gt;</code>."],
        ["linear", "Bir tekis."],
        ["ease", "Default. Sekin-tez-sekin."],
        ["ease-in", "Sekin boshlanadi."],
        ["ease-out", "<b>Sekin tugaydi (UI uchun eng yaxshi).</b>"],
        ["ease-in-out", "Ikkala uchida sekin."],
        [
          "cubic-bezier(x1,y1,x2,y2)",
          "Maxsus egri. <code>(.34,1.56,.64,1)</code> = spring.",
        ],
        ["steps(N)", "<code>steps(4)</code> — 4 pog'ona (sprite)."],
        ["steps(N, jump-start/end/both/none)", "Pog'ona joylashuvi."],
        ["step-start", "<code>steps(1, jump-start)</code>."],
        ["step-end", "<code>steps(1, jump-end)</code>."],
      ],
    },

    /* ─── S18 — @keyframes ─── */
    {
      id: "s18",
      num: "18",
      title: "@keyframes",
      navTitle: "@keyframes",
      desc: "Ko'p bosqichli mustaqil animatsiyalar. from/to yoki foiz qiymatlar bilan.",
      info: [
        {
          p: "<code>@keyframes</code> transition dan kuchliroq — u <b>ko'p bosqichli, mustaqil, takrorlanuvchi</b> animatsiyalar yaratadi. Foydalanuvchi harakatiga bog'liq emas.",
        },
        { p: "<b>Ikki qism:</b>" },
        {
          ul: [
            "<b>1. @keyframes nom</b> — animatsiya bosqichlarini belgilash. <code>from</code>/<code>to</code> yoki foiz (<code>0%, 50%, 100%</code>).",
            "<b>2. animation</b> property — elementga qo'llash.",
          ],
        },
        { p: "<b>Misol:</b>" },
        {
          p: "<code>@keyframes bounce {<br>&nbsp;&nbsp;0%, 100% { transform: translateY(0); }<br>&nbsp;&nbsp;50% { transform: translateY(-30px); }<br>}</code>",
        },
        {
          p: "<code>.el { animation: bounce 1s ease-in-out infinite; }</code>",
        },
        { p: "<b>Foydali animatsiyalar:</b>" },
        {
          ul: [
            "<b>bounce</b> — sakrash (e'tibor tortish).",
            "<b>spin</b> — aylanish (loader uchun).",
            "<b>pulse</b> — puls (notification badge).",
            "<b>shake</b> — silkitish (xato bildirish).",
            "<b>flip</b> — aylantirish (card flip).",
            "<b>morph</b> — shakl o'zgartirish.",
            "<b>float</b> — suzuvchi effekt.",
            "<b>swing</b> — chayqalish.",
            "<b>rubber</b> — kauchuk effekt.",
            "<b>heartbeat</b> — yurak urishi.",
          ],
        },
        { p: "<b>Pro maslahatlar:</b>" },
        {
          ul: [
            "Faqat <code>transform</code> va <code>opacity</code> bilan ishlovchi keyframes — eng performant.",
            "Ko'p element animatsiya qilsangiz, <code>animation-delay</code> bilan stagger qiling.",
            "<code>prefers-reduced-motion</code> media query ni hurmat qiling — accessibility.",
          ],
        },
      ],
      stage: `<div class="kfdem"><div class="kfbox bounce" id="s18-box">◈</div></div>`,
      controls: [
        {
          label: "Animation",
          group: "kf",
          btns: [
            { val: "bounce", label: "bounce", on: true },
            { val: "spin", label: "spin" },
            { val: "pulse", label: "pulse" },
            { val: "shake", label: "shake" },
            { val: "flip", label: "flip" },
            { val: "morph", label: "morph" },
            { val: "float", label: "float" },
            { val: "swing", label: "swing" },
            { val: "rubber", label: "rubber" },
            { val: "hb", label: "heartbeat" },
            { val: "none", label: "none" },
          ],
        },
      ],
      vals: [
        ["@keyframes name", "Animatsiya bosqichlarini belgilash."],
        ["from / to", "2 bosqich (0% / 100%) — qisqartma."],
        ["0%, 50%, 100%", "<b>Ko'p bosqich</b> — foiz qiymatlar."],
        ["animation: name 1s", "Elementga qo'llash."],
        ["animation-name", "Qaysi @keyframes."],
        ["animation-duration", "<code>1s, 500ms</code>."],
        ["animation-timing-function", "Easing (transition kabi)."],
        ["animation-delay", "Boshlanish kechikishi."],
        [
          "animation-iteration-count",
          "<code>&lt;number&gt; · infinite</code>.",
        ],
        [
          "animation-direction",
          "<code>normal · reverse · alternate · alternate-reverse</code>.",
        ],
        [
          "animation-fill-mode",
          "<code>none · forwards · backwards · both</code>.",
        ],
        ["animation-play-state", "<code>running · paused</code>."],
        [
          "animation shorthand",
          "<code>name duration timing delay count direction fill-mode play-state</code>.",
        ],
      ],
    },

    /* ─── S19 — Animation Properties ─── */
    {
      id: "s19",
      num: "19",
      title: "animation properties",
      navTitle: "animation props",
      desc: "Animatsiyani to'liq boshqarish: iteration-count, direction, fill-mode, play-state, delay.",
      info: [
        {
          p: "<code>animation</code> shorthand ortida <b>8 ta alohida xususiyat</b> bor. Ularni bilish animatsiyani to'liq boshqarish imkonini beradi.",
        },
        {
          ul: [
            "<code>animation-name</code> — qaysi @keyframes.",
            "<code>animation-duration</code> — bir tsikl davomiyligi (<code>1s</code>).",
            "<code>animation-timing-function</code> — easing (<code>ease, linear, steps(), cubic-bezier()</code>).",
            "<code>animation-delay</code> — boshlanish kechikishi.",
            "<code>animation-iteration-count</code> — necha marta: <b>raqam</b> yoki <code>infinite</code>.",
            "<code>animation-direction</code> — yo'nalish: <code>normal</code>, <code>reverse</code>, <code>alternate</code> (oldinga-orqaga), <code>alternate-reverse</code>.",
            "<code>animation-fill-mode</code> — animatsiyadan oldin/keyin holat.",
            "<code>animation-play-state</code> — <code>running</code> yoki <code>paused</code> (hover da to'xtatish uchun).",
          ],
        },
        { p: "<b>fill-mode tushunchasi (eng chalkash):</b>" },
        {
          ul: [
            "<code>none</code> — default. Animatsiyadan oldin/keyin element original holatda.",
            "<code>forwards</code> — animatsiya tugagach, <b>oxirgi kadr</b> da qoladi.",
            "<code>backwards</code> — delay paytida <b>birinchi kadr</b> da turadi.",
            "<code>both</code> — ikkala xulqi: birinchi+oxirgi kadr saqlanadi.",
          ],
        },
        {
          p: "<b>alternate</b> — eng foydali direction. Silliq oldinga-orqaga, alohida reverse keyframes yozish kerak emas.",
        },
        {
          p: "<b>Pause/Resume:</b> <code>animation-play-state: paused</code> — animatsiyani to'xtatadi (joriy holatda muzlaydi). Hover da pause qilish uchun ideal.",
        },
      ],
      stage: `<div class="apdem"><div class="apbox" id="s19-box">▶</div></div>`,
      controls: [
        {
          label: "iteration-count",
          group: "ap-ic",
          btns: [
            { val: "1", label: "1" },
            { val: "3", label: "3" },
            { val: "5", label: "5" },
            { val: "infinite", label: "infinite", on: true },
          ],
        },
        {
          label: "direction",
          group: "ap-dir",
          btns: [
            { val: "normal", label: "normal", on: true },
            { val: "reverse", label: "reverse" },
            { val: "alternate", label: "alternate" },
            { val: "alternate-reverse", label: "alt-reverse" },
          ],
        },
        {
          label: "fill-mode",
          group: "ap-fm",
          btns: [
            { val: "none", label: "none", on: true },
            { val: "forwards", label: "forwards" },
            { val: "backwards", label: "backwards" },
            { val: "both", label: "both" },
          ],
        },
        {
          label: "play-state",
          group: "ap-ps",
          btns: [
            { val: "running", label: "running", on: true },
            { val: "paused", label: "paused" },
          ],
        },
      ],
      vals: [
        [
          "animation-iteration-count",
          "<code>1 · 2 · 5 · infinite · &lt;number&gt;</code>.",
        ],
        [
          "animation-direction",
          "<code>normal · reverse · alternate · alternate-reverse</code>.",
        ],
        [
          "animation-fill-mode",
          "<code>none · forwards · backwards · both</code>.",
        ],
        ["animation-play-state", "<code>running · paused</code>."],
        [
          "animation-delay",
          '<code>&lt;time&gt;</code> (manfiy ham mumkin — orqaga "tashlash").',
        ],
        [
          "animation-timing-function",
          "<code>ease · linear · steps() · cubic-bezier()</code>.",
        ],
        ["alternate", "<b>Eng foydali</b> — oldinga-orqaga avtomatik."],
        ["forwards", "Oxirgi kadrda muzlaydi."],
        ["paused", "Hozir to'xtatadi (hover da useful)."],
        [
          "Stagger",
          "<code>animation-delay: calc(var(--i) * 100ms)</code> — har birini kechikib boshlash.",
        ],
      ],
    },

    /* ─── S20 — transform ─── */
    {
      id: "s20",
      num: "20",
      title: "transform",
      navTitle: "transform",
      desc: "Element vizual o'zgarish — siljitish, aylantirish, masshtablash, qiyalash. GPU accelerated.",
      info: [
        {
          p: "<code>transform</code> elementni vizual o'zgartiradi: siljitish, aylantirish, masshtablash, qiyalash. <b>Eng muhim afzalligi:</b> u layout ni o'zgartirmaydi (boshqa elementlar joyida qoladi) va <b>GPU da ishlaydi</b> — juda performant.",
        },
        { p: "<b>2D Transform funksiyalari:</b>" },
        {
          ul: [
            "<code>translate(x, y)</code> — siljitish. <code>translateX()</code>, <code>translateY()</code>.",
            "<code>rotate(deg)</code> — aylantirish (z o'qi atrofida).",
            "<code>scale(n)</code> — kattalashtirish/kichraytirish. <code>scale(1.2)</code>=120%, <code>scale(0)</code>=ko'rinmas.",
            "<code>scaleX(n)</code>, <code>scaleY(n)</code> — alohida o'q bo'yicha.",
            "<code>skew(x, y)</code> — qiyalash. <code>skewX()</code>, <code>skewY()</code>.",
            "<code>matrix(a,b,c,d,tx,ty)</code> — barchasini bitta funksiyada (kam ishlatiladi).",
          ],
        },
        { p: "<b>3D Transform funksiyalari:</b>" },
        {
          ul: [
            "<code>translate3d(x, y, z)</code>, <code>translateZ(z)</code> — Z o'qi (chuqurlik).",
            "<code>rotateX(deg)</code> — gorizontal o'q atrofida (oldinga/orqaga).",
            "<code>rotateY(deg)</code> — vertikal o'q atrofida (chap/o'ng).",
            "<code>rotateZ(deg)</code> — <code>rotate()</code> bilan bir xil.",
            "<code>rotate3d(x, y, z, deg)</code> — maxsus 3D o'q.",
            "<code>scale3d(x, y, z)</code>.",
            "<code>perspective(value)</code> — 3D chuqurlik effekti.",
            "<code>matrix3d(...)</code> — 16 qiymatli 3D matritsa.",
          ],
        },
        { p: "<b>Muhim qoidalar:</b>" },
        {
          ul: [
            "Funksiyalar <b>o'ngdan chapga</b> qo'llaniladi. Tartib muhim! <code>translate() rotate()</code> ≠ <code>rotate() translate()</code>.",
            "<code>transform-origin</code> — o'zgarish markazi. Default: <code>50% 50%</code> (center).",
            "<code>transform-style: preserve-3d</code> — bolalar uchun 3D context.",
            "<code>perspective</code> property — parent da, perspectivani belgilaydi.",
            "<code>backface-visibility: hidden</code> — element orqasini ko'rsatmaslik.",
          ],
        },
        {
          p: "<b>Markazlash trick:</b> <code>position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);</code>",
        },
      ],
      stage: `<div class="tfdem"><div class="tfbox" id="s20-box">Transform</div></div>`,
      controls: [
        {
          label: "transform",
          group: "tf",
          btns: [
            { val: "none", label: "none", on: true },
            { val: "translate", label: "translate(x,y)" },
            { val: "translatex", label: "translateX" },
            { val: "translatey", label: "translateY" },
            { val: "rotate", label: "rotate" },
            { val: "scale", label: "scale" },
            { val: "scalex", label: "scaleX" },
            { val: "skew", label: "skew" },
            { val: "combo", label: "combo (multi)" },
            { val: "persp", label: "3D perspective" },
            { val: "rotatex", label: "3D rotateX" },
            { val: "rotatey", label: "3D rotateY" },
          ],
        },
      ],
      vals: [
        ["transform: none", "Default. O'zgarish yo'q."],
        ["translate(x, y)", "Siljitish: <code>translate(20px, -10px)</code>."],
        ["translateX(x)", "Faqat X o'qi."],
        ["translateY(y)", "Faqat Y o'qi."],
        ["translateZ(z)", "3D — chuqurlik (perspective kerak)."],
        ["translate3d(x,y,z)", "3D siljitish. GPU optimized."],
        ["rotate(deg)", "Aylantirish: <code>rotate(45deg)</code>."],
        ["rotateX/Y/Z(deg)", "3D — o'q atrofida aylantirish."],
        ["rotate3d(x,y,z,deg)", "Custom 3D o'q."],
        ["scale(n)", "Masshtab: <code>scale(1.2)</code> = 120%."],
        ["scale(x, y)", "Alohida o'lcham: <code>scale(2, 0.5)</code>."],
        ["scaleX/Y/Z(n)", "Bitta o'q bo'yicha."],
        ["skew(x, y)", "Qiyalash darajada: <code>skew(15deg, 5deg)</code>."],
        ["skewX/Y(deg)", "Bir o'q bo'yicha qiyalash."],
        [
          "perspective(value)",
          "3D chuqurlik. <code>perspective(400px)</code>.",
        ],
        ["matrix(a,b,c,d,e,f)", "2D matritsa (6 qiymat)."],
        ["matrix3d(...)", "3D matritsa (16 qiymat)."],
        [
          "transform-origin",
          "<code>center · top left · 50% 50% · 30px 50%</code>.",
        ],
        ["transform-style", "<code>flat · preserve-3d</code>."],
        [
          "perspective (property)",
          "Parent da: <code>perspective: 1000px</code>.",
        ],
        ["perspective-origin", "Perspective vanishing point."],
        ["backface-visibility", "<code>visible · hidden</code>."],
      ],
    },
  ],
});

/* ════════════════════════════════════════════════════════════════
   CHAPTER VI — RESPONSIVE
════════════════════════════════════════════════════════════════ */
CHAPTERS.push({
  cls: "res",
  roman: "VI",
  title: "Responsive",
  desc: "Media queries, fluid units, container queries — barcha qurilmalar uchun",
  sections: [
    /* ─── S21 — Media Queries ─── */
    {
      id: "s21",
      num: "21",
      title: "Media Queries",
      navTitle: "Media queries",
      desc: "Ekran o'lchami, orientatsiya, rang sxemasi va boshqa shartlarga qarab stil. Mobile-first yondashuv.",
      info: [
        {
          p: "<code>@media</code> — ma'lum shartlar bajarilganda (ekran kengligi, orientatsiya, rang sxemasi...) stilni qo'llaydi. Responsive dizaynning asosi.",
        },
        { p: "<b>Mobile-first yondashuv</b> (tavsiya etiladi):" },
        {
          ul: [
            "Avval <b>mobil</b> uchun stil yoziladi (default).",
            "Keyin <code>min-width</code> bilan kattaroq ekranlar uchun qo'shiladi.",
            "Bu kod kichikroq va performant — mobil qurilmalar ortiqcha CSS yuklanmaydi.",
          ],
        },
        { p: "<b>Misol:</b>" },
        {
          p: "<code>.grid { grid-template-columns: 1fr; }  /* mobil */<br>@media (min-width: 640px) { .grid { grid-template-columns: 1fr 1fr; } }<br>@media (min-width: 1024px) { .grid { grid-template-columns: repeat(3, 1fr); } }</code>",
        },
        { p: "<b>Media query features:</b>" },
        {
          ul: [
            "<code>min-width</code> / <code>max-width</code> — kenglik.",
            "<code>min-height</code> / <code>max-height</code> — balandlik.",
            "<code>orientation: landscape/portrait</code> — qurilma yo'nalishi.",
            "<code>aspect-ratio</code> — o'lcham nisbati.",
            "<code>resolution</code> — pixel density (Retina detection).",
            "<code>prefers-color-scheme: dark/light</code> — foydalanuvchining dark mode sozlamasi.",
            "<code>prefers-reduced-motion: reduce</code> — animatsiyani kamaytirish (accessibility).",
            "<code>prefers-contrast: high/more/less</code> — yuqori kontrast.",
            "<code>hover: hover/none</code> — sichqoncha bormi.",
            "<code>pointer: fine/coarse/none</code> — ko'rsatkich aniqligi.",
            "<code>any-hover</code>, <code>any-pointer</code> — har qanday qurilma.",
          ],
        },
        {
          p: "<b>Mantiqiy operatorlar:</b> <code>and</code> (va), <code>,</code> (yoki), <code>not</code> (emas). Misol: <code>@media (min-width: 640px) and (max-width: 1024px)</code> — oraliq.",
        },
        {
          p: "<b>Mashhur breakpoint lar:</b> 480px (telefon), 640px (katta telefon), 768px (planshet), 1024px (laptop), 1280px (desktop), 1536px (katta ekran).",
        },
      ],
      stage: `
        <div class="mqdem">
          <div class="mqdem__row">
            <div class="mqdev">
              <div class="mqscr sm"><div class="mqbar">Mobile</div><div class="mqct c1"><div class="mqbl">1</div><div class="mqbl">2</div><div class="mqbl">3</div></div></div>
              <div class="mqdev__lbl">&lt; 640px</div>
            </div>
            <div class="mqdev">
              <div class="mqscr md"><div class="mqbar">Tablet</div><div class="mqct c2"><div class="mqbl">1</div><div class="mqbl">2</div><div class="mqbl">3</div><div class="mqbl">4</div></div></div>
              <div class="mqdev__lbl">640–1024px</div>
            </div>
            <div class="mqdev">
              <div class="mqscr lg"><div class="mqbar">Desktop</div><div class="mqct c3"><div class="mqbl">1</div><div class="mqbl">2</div><div class="mqbl">3</div><div class="mqbl">4</div><div class="mqbl">5</div><div class="mqbl">6</div></div></div>
              <div class="mqdev__lbl">&gt; 1024px</div>
            </div>
          </div>
        </div>`,
      vals: [
        [
          "@media (min-width: 640px)",
          "<b>Mobile-first.</b> Shu kenglikdan katta ekran.",
        ],
        [
          "@media (max-width: 640px)",
          "<b>Desktop-first.</b> Shu kenglikdan kichik.",
        ],
        [
          "@media (min-width: A) and (max-width: B)",
          "<b>Oraliq.</b> A va B orasida.",
        ],
        ["@media (orientation: landscape)", "Yotiq holat (landscape)."],
        ["@media (orientation: portrait)", "Tik holat (portrait)."],
        ["@media (aspect-ratio: 16/9)", "Tomonlar nisbati."],
        ["@media (resolution: 2dppx)", "Pixel density (Retina = 2dppx)."],
        ["@media (prefers-color-scheme: dark)", "<b>Dark mode</b> sozlamasi."],
        ["@media (prefers-color-scheme: light)", "Light mode sozlamasi."],
        [
          "@media (prefers-reduced-motion: reduce)",
          "<b>Animatsiyani kamaytirish</b> (accessibility).",
        ],
        ["@media (prefers-contrast: more)", "Yuqori kontrast rejimi."],
        ["@media (hover: hover)", "Sichqoncha bor (desktop)."],
        ["@media (hover: none)", "Sichqoncha yo'q (touch)."],
        ["@media (pointer: fine)", "Aniq ko'rsatkich (mouse)."],
        ["@media (pointer: coarse)", "Qo'pol ko'rsatkich (touch)."],
        ["@media (forced-colors: active)", "Windows High Contrast mode."],
        ["@media print", "Chop etish uchun."],
        ["@media screen", "Ekranda (default)."],
        ["@media (color)", "Rangli displey."],
        ["Logical: and", "<code>and</code> — barcha shartlar."],
        ["Logical: comma", "<code>,</code> — yoki (OR)."],
        ["Logical: not", "<code>not</code> — inkor."],
      ],
    },

    /* ─── S22 — Fluid Units ─── */
    {
      id: "s22",
      num: "22",
      title: "Fluid Units",
      navTitle: "Fluid units",
      desc: "rem, em, vw, vh, %, ch, dvh va boshqa moslashuvchan o'lchov birliklari.",
      info: [
        {
          p: "CSS da ikki xil birlik bor: <b>absolute</b> (px, pt, cm) va <b>relative</b> (rem, em, %, vw...). Responsive dizayn uchun <b>relative birliklar</b> muhim.",
        },
        { p: "<b>Asosiy relative birliklar:</b>" },
        {
          ul: [
            "<code>rem</code> — <b>root</b> (html) font-size ga nisbatan. 1rem = 16px (default). Font-size va spacing uchun eng yaxshi. Accessibility ga mos (foydalanuvchi font o'zgartirsa proporsional kattalashadi).",
            "<code>em</code> — <b>parent</b> font-size ga nisbatan. Local masshtablash (padding, margin nisbiy) uchun.",
            "<code>%</code> — parent o'lchamiga nisbatan foiz.",
            "<code>vw / vh</code> — viewport kengligi/balandligi (1vw = ekranning 1%).",
            "<code>dvh / svh / lvh</code> — <b>dynamic/small/large viewport height</b>. <b>Mobil brauzer toolbar muammosini hal qiladi</b> — <code>100dvh</code> ishlatish tavsiya etiladi.",
            "<code>vmin / vmax</code> — viewport ning kichik/katta o'lchami.",
            '<code>ch</code> — "0" raqami kengligi. <code>max-width: 65ch</code> optimal o\'qish kengligi.',
            '<code>ex</code> — "x" harfi balandligi (kam ishlatiladi).',
            "<code>fr</code> — grid uchun — qolgan joyni proporsional bo'lish.",
          ],
        },
        { p: "<b>Absolute birliklar:</b>" },
        {
          ul: [
            "<code>px</code> — pixel. Aniq qiymat. Border, shadow uchun ishlatiladi.",
            "<code>pt</code> — punkt (chop etish uchun).",
            "<code>cm, mm, in</code> — fizik birliklar (juda kam).",
          ],
        },
        { p: "<b>Pro qoidalar:</b>" },
        {
          ul: [
            "Font-size → <code>rem</code> (accessibility).",
            "Spacing (padding, margin, gap) → <code>rem</code> yoki <code>em</code>.",
            "Full-screen height → <code>100dvh</code> (mobile-friendly).",
            "O'qish kengligi → <code>65ch</code>.",
            "Fluid o'lcham → <code>clamp(min, vw, max)</code>.",
            "Border, shadow blur → <code>px</code> (aniq).",
            "Aspect ratio → <code>fr</code> yoki <code>%</code>.",
          ],
        },
      ],
      stage: `
        <div class="unitdem">
          <div class="unit-i"><div class="unit-bar" style="width:100%;background:var(--pink)"></div><span>100% — parent kengligi</span></div>
          <div class="unit-i"><div class="unit-bar" style="width:50vw;max-width:100%;background:var(--blue)"></div><span>50vw — viewport kengligining 50%</span></div>
          <div class="unit-i"><div class="unit-bar" style="width:20rem;max-width:100%;background:var(--gold)"></div><span>20rem — root font × 20</span></div>
          <div class="unit-i"><div class="unit-bar" style="width:clamp(80px,40%,260px);background:var(--green)"></div><span>clamp(80px, 40%, 260px)</span></div>
          <div class="unit-i"><div class="unit-bar" style="width:65ch;max-width:100%;background:var(--cyan)"></div><span>65ch — optimal o'qish kengligi</span></div>
        </div>`,
      vals: [
        ["px", "<b>Pixel.</b> Aniq qiymat. Border, shadow uchun."],
        ["rem", "<b>Root</b> font-size (default 16px). Font + spacing uchun."],
        ["em", "<b>Parent</b> font-size. Local masshtablash."],
        ["%", "<b>Parent</b> o'lchamining foizi."],
        ["vw", "Viewport kengligining 1%."],
        ["vh", "Viewport balandligining 1%."],
        ["vmin", "vw va vh dan kichigi."],
        ["vmax", "vw va vh dan kattasi."],
        ["dvh", "<b>Dynamic vh</b> — mobil toolbar bilan moslashadi."],
        ["svh", "<b>Small vh</b> — toolbar ko'ringan paytda."],
        ["lvh", "<b>Large vh</b> — toolbar yashiringan paytda."],
        ["dvw, svw, lvw", "Kenglik uchun dinamik versiyalar."],
        ["ch", '<b>"0" raqami</b> kengligi (~0.5em). O\'qish kengligi uchun.'],
        ["ex", '"x" harfi balandligi.'],
        ["cap", "Capital harf balandligi."],
        ["ic", "Ideograph kenglik (CJK)."],
        ["lh", "Joriy line-height."],
        ["rlh", "Root line-height."],
        ["fr", "<b>Grid fraction</b> — qolgan joyni bo'lish."],
        ["cqw, cqh", "Container query birliklari."],
        ["cqi, cqb", "Container inline/block."],
        ["cqmin, cqmax", "Container kichik/katta o'lcham."],
        ["pt, pc", "Punkt, pica (chop etish)."],
        ["cm, mm, in", "Fizik birliklar (kam)."],
        ["deg, rad, turn", "Burchak birliklari."],
        ["s, ms", "Vaqt birliklari."],
      ],
    },

    /* ─── S23 — Container Queries ─── */
    {
      id: "s23",
      num: "23",
      title: "Container Queries",
      navTitle: "Container queries",
      desc: "Viewport emas, PARENT konteyner o'lchamiga qarab stil. Zamonaviy CSS ning kuchli xususiyati.",
      info: [
        {
          p: "<b>Container queries</b> — media query dan ham kuchliroq. Media query <b>viewport</b> (butun ekran) ga qaraydi, container query esa elementning <b>parent konteyneriga</b> qaraydi.",
        },
        {
          p: "<b>Nega muhim?</b> Bir komponent (masalan karta) turli joylarda turli kenglikda ko'rinishi mumkin — sidebar da tor, asosiy qismda keng. Media query bilan buni hal qilib bo'lmaydi, chunki u faqat ekranni biladi. Container query bilan komponent <b>o'z konteyneriga moslashadi</b> — qayerda ishlatilishidan qat'i nazar.",
        },
        { p: "<b>Ikki qadam:</b>" },
        {
          ul: [
            "<b>1.</b> Konteynerga belgilash: <code>container-type: inline-size;</code> (yoki <code>size</code>) + ixtiyoriy <code>container-name: card;</code>.",
            "<b>2.</b> Query yozish: <code>@container (min-width: 340px) { .card { flex-direction: row; } }</code>",
          ],
        },
        { p: "<b>container-type qiymatlari:</b>" },
        {
          ul: [
            "<code>normal</code> — default. Query target emas.",
            "<code>inline-size</code> — <b>eng ko'p ishlatiladi.</b> Kenglik kuzatiladi.",
            "<code>size</code> — kenglik va balandlik. Ehtiyot kerak (height kuzatish performance ga ta'sir).",
          ],
        },
        { p: "<b>Container query units (CQ units):</b>" },
        {
          ul: [
            "<code>cqw, cqh</code> — konteyner kengligi/balandligi 1%.",
            "<code>cqi, cqb</code> — inline/block o'lchami.",
            "<code>cqmin, cqmax</code> — kichik/katta o'lcham.",
          ],
        },
        {
          p: "<b>@container</b> ichida <code>min-width</code>, <code>max-width</code>, <code>aspect-ratio</code> va boshqa shartlar ishlatilishi mumkin.",
        },
        {
          p: "Demoda kartani o'ng pastdagi tutqichdan tortib kengaytiring — 340px dan keng bo'lganda layout vertikal dan gorizontal ga o'tadi. Bu <b>viewport emas, karta konteyneri</b> kengligiga bog'liq!",
        },
      ],
      stage: `
        <div class="cqdem">
          <div class="cqnote">Kartani o'ng-pastdan tortib kengaytiring ↘</div>
          <div class="cqresize">
            <div class="cqcont">
              <div class="cqcard">
                <div class="cqimg">◈</div>
                <div class="cqbody"><strong>Container Query</strong><p>Konteyner kengligiga qarab layout o'zgaradi.</p></div>
              </div>
            </div>
          </div>
          <div class="cqresize__hint">⟺ resize bilan kuzating</div>
        </div>`,
      vals: [
        [
          "container-type: inline-size",
          "<b>Eng ko'p ishlatiladi.</b> Faqat kenglik kuzatiladi.",
        ],
        ["container-type: size", "Kenglik va balandlik. Ehtiyot kerak."],
        ["container-type: normal", "Default — query target emas."],
        ["container-name: card", "Konteynerga nom berish."],
        [
          "container: name / type",
          "Shorthand: <code>container: card / inline-size</code>.",
        ],
        ["@container (min-width: X)", "Anonymous container."],
        ["@container card (min-width: X)", "Nomli container."],
        ["@container (max-width: X)", "Kichikroq holat."],
        ["@container (aspect-ratio: 1)", "Kvadrat container."],
        ["@container style(--theme: dark)", "Style query (custom property)."],
        ["cqw", "Container kengligi 1%."],
        ["cqh", "Container balandligi 1%."],
        ["cqi", "Container inline (gorizontal default)."],
        ["cqb", "Container block (vertical default)."],
        ["cqmin / cqmax", "Kichik/katta o'lcham 1%."],
      ],
    },
  ],
});

/* ════════════════════════════════════════════════════════════════
   CHAPTER VII — BEST PRACTICES
════════════════════════════════════════════════════════════════ */
CHAPTERS.push({
  cls: "bp",
  roman: "VII",
  title: "Best Practices",
  desc: "Arxitektura, performance, pro design tips — senior frontend developer darajasi",
  sections: [
    /* ─── S24 — CSS Architecture ─── */
    {
      id: "s24",
      num: "24",
      title: "CSS Architecture",
      navTitle: "Architecture",
      desc: "Custom properties, BEM, Cascade Layers, utility classes — katta loyihalarda tartib.",
      info: [
        {
          p: "Katta loyihalarda CSS tez chalkashib ketadi. Buni oldini olish uchun <b>arxitektura metodologiyalari</b> qo'llaniladi. Bular zamonaviy frontend ning senior darajadagi qoidalari.",
        },
        {
          ul: [
            "<b>CSS Custom Properties (variables)</b> — barcha rang, masofa, radius, shadow, ease qiymatlarini <code>:root</code> da <b>token</b> sifatida saqlash. Bir joydan o'zgartirsangiz — butun loyihada o'zgaradi. Theming asosi.",
            "<b>BEM</b> (Block__Element--Modifier) — nomlash konvensiyasi. Specificity ni past va tekis ushlaydi, konfliktlarni oldini oladi. <code>.card</code>, <code>.card__title</code>, <code>.card--featured</code>.",
            "<b>@layer</b> (Cascade Layers) — qaysi qoidalar ustun bo'lishini <b>aniq boshqarish</b>. Specificity urushini tugatadi. <code>@layer reset, base, components, utilities;</code>",
            "<b>Utility classes</b> — bitta vazifani bajaradigan kichik klasslar (<code>.flex, .gap-4, .text-center</code>). Tailwind CSS shu yondashuvga asoslangan. Tez prototyping uchun ideal.",
          ],
        },
        {
          p: "<b>CSS Nesting (modern):</b> SCSS ga o'xshash, lekin sof CSS. Brauzerlar 2023 dan boshlab qo'llaydi.",
        },
        {
          p: "<b>Logical Properties:</b> RTL/LTR uchun moslashuvchan — <code>margin-inline-start</code>, <code>padding-block</code>, <code>inset-inline</code>.",
        },
      ],
      stage: "",
      stageClass: "top",
      controls: null,
      afterCard: `
        <div class="bpgrid" style="margin-top:0">
          <div class="bpcard">
            <div class="bpcard__icon" style="color:var(--pink)">◈</div>
            <h4>Custom Properties (Tokens)</h4>
            <pre class="bpcode">:root {
  --color-primary: #ff4564;
  --space-md: 16px;
  --radius: 8px;
  --shadow-card: 0 4px 16px rgba(0,0,0,.4);
  --ease: cubic-bezier(.22,1,.36,1);
}
.btn {
  background: var(--color-primary);
  padding: var(--space-md);
}</pre>
          </div>
          <div class="bpcard">
            <div class="bpcard__icon" style="color:var(--blue)">⬛</div>
            <h4>BEM Naming</h4>
            <pre class="bpcode">/* Block__Element--Modifier */
.card { }
.card__title { }
.card__body { }
.card__btn { }
.card--featured { }
.card__btn--primary { }
.card__btn--disabled { }</pre>
          </div>
          <div class="bpcard">
            <div class="bpcard__icon" style="color:var(--gold)">▦</div>
            <h4>Cascade Layers</h4>
            <pre class="bpcode">@layer reset, base, tokens,
       layout, components,
       utilities;

@layer components {
  .btn { padding: 8px; }
}
/* keyingi layer ustun */</pre>
          </div>
          <div class="bpcard">
            <div class="bpcard__icon" style="color:var(--green)">◉</div>
            <h4>Utility Classes</h4>
            <pre class="bpcode">.flex { display: flex; }
.gap-4 { gap: 1rem; }
.text-center { text-align: center; }
.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
}</pre>
          </div>
          <div class="bpcard">
            <div class="bpcard__icon" style="color:var(--purple)">◐</div>
            <h4>CSS Nesting (modern)</h4>
            <pre class="bpcode">.card {
  padding: 16px;

  & .title {
    font-size: 1.5rem;
  }

  &:hover {
    transform: translateY(-2px);
  }
}</pre>
          </div>
          <div class="bpcard">
            <div class="bpcard__icon" style="color:var(--cyan)">◑</div>
            <h4>Logical Properties</h4>
            <pre class="bpcode">/* RTL/LTR moslashuvchan */
.el {
  margin-inline: auto;
  padding-block: 16px;
  inset-inline-start: 0;
  border-inline-end: 1px solid;
}</pre>
          </div>
        </div>`,
      vals: [
        [
          "--variable",
          "<code>--color-primary: #ff4564</code> — token e'lon qilish.",
        ],
        [
          "var(--variable)",
          "<code>color: var(--color-primary)</code> — ishlatish.",
        ],
        [
          "var(--x, fallback)",
          "<code>var(--color, blue)</code> — fallback bilan.",
        ],
        ["BEM Block", "<code>.card</code> — mustaqil komponent."],
        ["BEM Element", "<code>.card__title</code> — block ichidagi."],
        ["BEM Modifier", "<code>.card--featured</code> — variant."],
        ["@layer name1, name2;", "Layer larni e'lon qilish (tartib muhim)."],
        ["@layer name { ... }", "Layer ichida qoidalar."],
        ["@import url() layer()", "Import bilan layer."],
        ["Specificity layer", "Keyingi layer hamisha ustun."],
        [
          "Utility-first",
          '<code>class="flex gap-4 p-3"</code> — tez prototyping.',
        ],
        ["CSS Nesting", "<code>& .child { ... }</code> — ichki qoidalar."],
        ["margin-inline", "Logical: chap-o'ng (RTL ga moslashadi)."],
        ["padding-block", "Logical: yuqori-past."],
        ["inset-inline-start", "Logical: chap (LTR) / o'ng (RTL)."],
      ],
    },

    /* ─── S25 — Performance ─── */
    {
      id: "s25",
      num: "25",
      title: "Performance Tips",
      navTitle: "Performance",
      desc: "Rendering pipeline, layout triggers, GPU acceleration — tez va silliq CSS.",
      info: [
        { p: "Brauzer sahifani <b>uch bosqichda</b> chizadi:" },
        {
          ul: [
            "<b>1. Layout</b> — barcha element pozitsiyalarini hisoblash (eng qimmat).",
            "<b>2. Paint</b> — rang berib chizish (o'rta qimmat).",
            "<b>3. Composite</b> — qatlamlarni birlashtirish (eng arzon).",
          ],
        },
        {
          p: "Animatsiya qancha <b>kam bosqichni</b> ishga tushirsa, shuncha tez. Eng tez animatsiya — faqat <b>Composite</b> bosqichini ishlatadigan <code>transform</code> va <code>opacity</code>.",
        },
        {
          p: "<code>width, height, top, margin</code> kabilar esa butun <b>Layout</b> ni qayta hisoblaydi (reflow) — sekin, jank (sakrash) keltirib chiqaradi.",
        },
        { p: "<b>Pro qurollar:</b>" },
        {
          ul: [
            "<code>will-change: transform</code> — brauzerga oldindan ko'rsatma berish.",
            "<code>contain: layout</code> / <code>paint</code> — render ni alohida qilish.",
            "<code>content-visibility: auto</code> — ekrandan tashqari element larni o'tkazib yuborish.",
            "<code>prefers-reduced-motion</code> — animatsiyani kamaytirish.",
            "<code>@supports</code> — feature detection.",
          ],
        },
      ],
      stage: "",
      stageClass: "top",
      controls: null,
      afterCard: `
        <div class="perfgrid" style="margin-top:0">
          <div class="perf">
            <div class="perf-tag good">✓ PERFORMANT</div>
            <h4>GPU Accelerated</h4>
            <ul>
              <li>transform: translate()</li>
              <li>transform: scale()</li>
              <li>transform: rotate()</li>
              <li>opacity</li>
              <li>filter (cheklangan)</li>
            </ul>
            <p class="perf-note">Faqat Composite — eng tez, 60fps</p>
          </div>
          <div class="perf">
            <div class="perf-tag warn">⚠ PAINT TRIGGER</div>
            <h4>O'rtacha sekin</h4>
            <ul>
              <li>color</li>
              <li>background-color</li>
              <li>border-color</li>
              <li>visibility</li>
              <li>box-shadow</li>
            </ul>
            <p class="perf-note">Paint→Composite — OK</p>
          </div>
          <div class="perf">
            <div class="perf-tag bad">✗ LAYOUT REFLOW</div>
            <h4>Sekin — qochish kerak</h4>
            <ul>
              <li>width, height</li>
              <li>margin, padding</li>
              <li>top, left, right, bottom</li>
              <li>font-size</li>
              <li>display, position</li>
            </ul>
            <p class="perf-note">Layout→Paint→Composite — sekin</p>
          </div>
          <div class="perf">
            <div class="perf-tag tip">★ MODERN TOOLS</div>
            <h4>Optimizatsiya</h4>
            <ul>
              <li>will-change: transform</li>
              <li>contain: layout / paint</li>
              <li>content-visibility: auto</li>
              <li>@supports</li>
              <li>prefers-reduced-motion</li>
            </ul>
            <p class="perf-note">Modern performance API</p>
          </div>
          <div class="perf">
            <div class="perf-tag bad">✗ ANTI-PATTERNS</div>
            <h4>Qochish kerak</h4>
            <ul>
              <li>* { transition: all }</li>
              <li>chuqur nested selektor</li>
              <li>@import (blocking)</li>
              <li>ko'p !important</li>
              <li>katta box-shadow blur</li>
            </ul>
            <p class="perf-note">Sekinlik va chalkashlik</p>
          </div>
          <div class="perf">
            <div class="perf-tag good">✓ BEST PRACTICES</div>
            <h4>Yaxshi odatlar</h4>
            <ul>
              <li>aniq property animatsiya</li>
              <li>transform + opacity</li>
              <li>CSS variables</li>
              <li>cascade layers</li>
              <li>logical properties</li>
            </ul>
            <p class="perf-note">Tez va saqlash oson</p>
          </div>
        </div>`,
      vals: [
        ["will-change: transform", "GPU layer yaratadi (oldindan tayyorlash)."],
        ["contain: layout", "Element layout ini izolatsiya."],
        ["contain: paint", "Paint ni izolatsiya."],
        ["contain: strict", "To'liq izolatsiya (layout + paint + size)."],
        [
          "content-visibility: auto",
          "Off-screen elementlarni o'tkazib yuborish.",
        ],
        [
          "contain-intrinsic-size",
          "content-visibility uchun fallback o'lcham.",
        ],
        [
          "transform vs top/left",
          "<b>transform</b> 60fps, <b>top/left</b> reflow.",
        ],
        [
          "opacity vs visibility",
          "<b>opacity</b> tez (composite), <b>visibility</b> paint.",
        ],
        [
          "@supports",
          "Feature detection: <code>@supports (display: grid)</code>.",
        ],
      ],
    },

    /* ─── S26 — Pro Design Tips ─── */
    {
      id: "s26",
      num: "26",
      title: "Pro Frontend Design Tips",
      navTitle: "Pro design tips",
      desc: "Senior frontend developer va UI/UX designer foydalanadigan 12 ta professional qoida.",
      info: [
        {
          p: "Bu qoidalar sizning ishingizni <b>havaskor</b> dan <b>senior</b> ga ko'taradi. Har biri kichik, lekin birgalikda jiddiy farq qiladi.",
        },
      ],
      stage: "",
      stageClass: "top",
      controls: null,
      afterCard: `
        <div class="progrid" style="margin-top:0">

          <div class="protip">
            <div class="protip__n">01</div>
            <h4>8-Point Grid System</h4>
            <p>Barcha spacing (padding, margin, gap) larda <b>4 yoki 8 ning karralari</b>: 4, 8, 12, 16, 24, 32, 48, 64px. Ko'z vizual uyg'unlikni sezadi va dizayn izchil bo'ladi.</p>
            <div class="protip__demo">
              <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-start">
                <div style="height:4px;background:var(--pink);width:40px;border-radius:2px"></div>
                <div style="height:8px;background:var(--blue);width:80px;border-radius:2px"></div>
                <div style="height:16px;background:var(--gold);width:160px;border-radius:2px"></div>
                <div style="height:32px;background:var(--green);width:100%;border-radius:2px"></div>
              </div>
            </div>
          </div>

          <div class="protip">
            <div class="protip__n">02</div>
            <h4>60-30-10 Color Rule</h4>
            <p><b>60%</b> dominant (fon), <b>30%</b> ikkilamchi (sirt), <b>10%</b> urg'u (tugma, link). Bu nisbat har qanday dizaynda muvozanat yaratadi.</p>
            <div class="protip__demo">
              <div style="display:flex;height:40px;border-radius:6px;overflow:hidden">
                <div style="flex:6;background:var(--bg-0);display:flex;align-items:center;justify-content:center;font-family:var(--f-mono);font-size:.9rem;color:var(--t-3)">60%</div>
                <div style="flex:3;background:var(--bg-2);display:flex;align-items:center;justify-content:center;font-family:var(--f-mono);font-size:.9rem;color:var(--t-3)">30%</div>
                <div style="flex:1;background:var(--pink);display:flex;align-items:center;justify-content:center;font-family:var(--f-mono);font-size:.9rem;color:#fff">10%</div>
              </div>
            </div>
          </div>

          <div class="protip">
            <div class="protip__n">03</div>
            <h4>Visual Hierarchy</h4>
            <p>Katta/kichik, to'q/och, qalin/yupqa kontrast bilan <b>ko'zni boshqaring</b>. Foydalanuvchi avval nimaga qarashini siz hal qilasiz.</p>
            <div class="protip__demo">
              <p style="font-size:2.2rem;font-weight:800;line-height:1;color:var(--t-1)">Main Title</p>
              <p style="font-size:1.4rem;font-weight:500;color:var(--t-2);margin-top:4px">Subtitle</p>
              <p style="font-size:1.15rem;color:var(--t-3);margin-top:4px">Body description text</p>
            </div>
          </div>

          <div class="protip">
            <div class="protip__n">04</div>
            <h4>Whitespace = Design</h4>
            <p><b>Bo'shliq dizayn elementidir.</b> Yetarli padding vizual 'nafas olish' beradi. Tiqilinch layout har doim havaskor ko'rinadi.</p>
            <div class="protip__demo">
              <div style="display:flex;gap:10px;flex-wrap:wrap">
                <div style="background:var(--bg-3);padding:3px 5px;border-radius:4px;font-family:var(--f-mono);font-size:.9rem;color:var(--t-3);border:1px solid rgba(255,69,100,.2)">cramped</div>
                <div style="background:var(--bg-3);padding:12px 22px;border-radius:8px;font-family:var(--f-mono);font-size:.9rem;color:var(--t-2);border:1px solid var(--green-b)">breathing room</div>
              </div>
            </div>
          </div>

          <div class="protip">
            <div class="protip__n">05</div>
            <h4>Consistent Radius</h4>
            <p>Bir loyihada bir xil border-radius tizimi. Aralash radius (4px va 20px birga) <b>chaos</b> his qildiradi.</p>
            <div class="protip__demo">
              <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
                <div style="background:var(--pink-d);border:1px solid var(--pink-b);color:var(--pink);font-family:var(--f-mono);font-size:.9rem;padding:8px 12px;border-radius:0">0</div>
                <div style="background:var(--pink-d);border:1px solid var(--pink-b);color:var(--pink);font-family:var(--f-mono);font-size:.9rem;padding:8px 12px;border-radius:4px">4</div>
                <div style="background:var(--pink-d);border:1px solid var(--pink-b);color:var(--pink);font-family:var(--f-mono);font-size:.9rem;padding:8px 12px;border-radius:8px">8</div>
                <div style="background:var(--pink-d);border:1px solid var(--pink-b);color:var(--pink);font-family:var(--f-mono);font-size:.9rem;padding:8px 12px;border-radius:16px">16</div>
                <div style="background:var(--pink-d);border:1px solid var(--pink-b);color:var(--pink);font-family:var(--f-mono);font-size:.9rem;padding:8px 12px;border-radius:999px">pill</div>
              </div>
            </div>
          </div>

          <div class="protip">
            <div class="protip__n">06</div>
            <h4>Micro-interactions</h4>
            <p>Har bir interaktiv element <b>hover/focus/active</b> da vizual javob berishi kerak. <code>transition: 0.15–0.3s ease-out</code> optimal.</p>
            <div class="protip__demo">
              <div style="display:flex;gap:10px">
                <button style="font-family:var(--f-mono);font-size:1rem;padding:8px 16px;border-radius:6px;cursor:pointer;border:1px solid var(--bd-2);background:var(--bg-2);color:var(--t-2)">No feedback</button>
                <button onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 14px rgba(59,191,138,.3)';this.style.background='var(--green)';this.style.color='#fff'" onmouseout="this.style.transform='';this.style.boxShadow='';this.style.background='var(--green-d)';this.style.color='var(--green)'" style="font-family:var(--f-mono);font-size:1rem;padding:8px 16px;border-radius:6px;cursor:pointer;border:1px solid var(--green-b);background:var(--green-d);color:var(--green);transition:all .2s var(--ease)">Hover me ✨</button>
              </div>
            </div>
          </div>

          <div class="protip">
            <div class="protip__n">07</div>
            <h4>Focus Accessibility</h4>
            <p>Klaviatura foydalanuvchilari uchun <code>focus</code> ko'rinishi <b>shart</b>. <code>:focus-visible</code> faqat klaviatura uchun outline beradi, sichqoncha uchun emas.</p>
            <div class="protip__demo">
              <input placeholder="bad (outline:none)" style="display:block;width:100%;font-family:var(--f-mono);font-size:1rem;padding:8px 12px;margin:4px 0;background:var(--bg-2);border:1px solid var(--bd-2);border-radius:6px;color:var(--t-1);outline:none"/>
              <input placeholder="good — Tab bilan sinang" style="display:block;width:100%;font-family:var(--f-mono);font-size:1rem;padding:8px 12px;margin:4px 0;background:var(--bg-2);border:1px solid var(--bd-2);border-radius:6px;color:var(--t-1);outline:none" onfocus="this.style.borderColor='var(--green)';this.style.boxShadow='0 0 0 3px rgba(59,191,138,.25)'" onblur="this.style.borderColor='var(--bd-2)';this.style.boxShadow=''"/>
            </div>
          </div>

          <div class="protip">
            <div class="protip__n">08</div>
            <h4>Depth with Shadows</h4>
            <p>Qatlamli interfeys: yaqin elementlar <b>katta soya</b>, uzoqlari kichik. Har elevation darajasi uchun alohida shadow token.</p>
            <div class="protip__demo">
              <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end">
                <div style="background:var(--bg-2);border-radius:8px;padding:10px 14px;font-family:var(--f-mono);font-size:.92rem;color:var(--t-2);box-shadow:0 1px 3px rgba(0,0,0,.4)">level 1</div>
                <div style="background:var(--bg-2);border-radius:8px;padding:10px 14px;font-family:var(--f-mono);font-size:.92rem;color:var(--t-2);box-shadow:0 4px 12px rgba(0,0,0,.45)">level 2</div>
                <div style="background:var(--bg-2);border-radius:8px;padding:10px 14px;font-family:var(--f-mono);font-size:.92rem;color:var(--t-2);box-shadow:0 12px 32px rgba(0,0,0,.5)">level 3</div>
              </div>
            </div>
          </div>

          <div class="protip">
            <div class="protip__n">09</div>
            <h4>Color Contrast (WCAG)</h4>
            <p>O'qilishi uchun kontrast nisbati: <b>body matn 4.5:1</b>, katta matn 3:1 dan kam bo'lmasin. <b>2-3 xil rang darajasi</b> yetarli.</p>
            <div class="protip__demo">
              <p style="color:var(--t-3);font-size:1.2rem">Low contrast — yomon</p>
              <p style="color:var(--t-2);font-size:1.2rem">Medium — secondary</p>
              <p style="color:var(--t-1);font-size:1.2rem">High — primary text</p>
            </div>
          </div>

          <div class="protip">
            <div class="protip__n">10</div>
            <h4>Design Token System</h4>
            <p>Spacing, type, color, radius uchun alohida <b>token tizimi</b>. Theming va izchillikni bir joydan boshqarish imkonini beradi.</p>
            <div class="protip__demo">
              <pre class="bpcode">:root {
  --space-1: 4px;
  --space-4: 16px;
  --text-base: 16px;
  --radius: 8px;
  --shadow: 0 4px 12px rgba(0,0,0,.4);
}</pre>
            </div>
          </div>

          <div class="protip">
            <div class="protip__n">11</div>
            <h4>Smooth Scroll + Anchor</h4>
            <p>Sahifa ichi navigatsiyada <code>smooth scroll</code> va sticky header uchun <b>offset</b>. <code>scroll-padding-top</code> header balandligiga teng.</p>
            <div class="protip__demo">
              <pre class="bpcode">html {
  scroll-behavior: smooth;
  scroll-padding-top: 80px;
}</pre>
            </div>
          </div>

          <div class="protip">
            <div class="protip__n">12</div>
            <h4>Reduce Motion</h4>
            <p>Animatsiyalardan ba'zi foydalanuvchilarda <b>bosh aylanishi</b> bo'lishi mumkin (vestibular disorders). <code>prefers-reduced-motion</code> ni hurmat qiling.</p>
            <div class="protip__demo">
              <pre class="bpcode">@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01s !important;
    transition-duration: .01s !important;
  }
}</pre>
            </div>
          </div>

        </div>`,
      vals: [
        ["8-point grid", "4, 8, 12, 16, 24, 32, 48, 64px — izchillik."],
        ["60-30-10 rule", "Dominant 60% / secondary 30% / accent 10%."],
        ["Visual hierarchy", "O'lcham + qalinlik + rang kontrasti."],
        ["White space", "Bo'shliq dizayn elementi."],
        ["Border radius scale", "0, 4, 8, 16, 999px — izchil."],
        [
          "Micro-interactions",
          "<code>transition: .2s ease-out</code> har joyda.",
        ],
        [":focus-visible", "Klaviatura uchun outline (sichqoncha emas)."],
        ["Shadow elevation", "Level 1, 2, 3 — qatlamlilik."],
        ["WCAG 4.5:1", "Body matn uchun minimal kontrast."],
        ["Design tokens", "CSS variables = token tizimi."],
        ["scroll-padding-top", "Sticky header uchun anchor offset."],
        ["prefers-reduced-motion", "Accessibility — animatsiyani kamaytirish."],
      ],
    },
  ],
});

/* ════════════════════════════════════════════════════════════════
   RENDER — chapters → DOM
════════════════════════════════════════════════════════════════ */
{
  let sidebarHtml =
    '<li><a href="/" class="snav-a snav-home" data-c="home">← Bosh sahifa</a></li>';
  let contentHtml = "";
  CHAPTERS.forEach((ch) => {
    sidebarHtml += `<li class="snav-ch">${ch.roman} — ${ch.title}</li>`;
    ch.sections.forEach((s) => {
      sidebarHtml += `<li><a href="#${s.id}" class="snav-a" data-c="${ch.cls}">${s.num} — ${s.navTitle || s.title}</a></li>`;
    });
    contentHtml += buildChapterHeader(ch);
    ch.sections.forEach((s) => {
      contentHtml += buildSection(s, ch.cls);
    });
  });
  document.getElementById("snav").innerHTML = sidebarHtml;
  document.getElementById("content").innerHTML = contentHtml;
}

/* ════════════════════════════════════════════════════════════════
   INTERACTIVITY
════════════════════════════════════════════════════════════════ */
const $ = (id) => document.getElementById(id);
function setCode(id, code) {
  const el = $(id);
  if (el) el.innerHTML = hl(code);
}

/* ─── progress bar ─── */
const progressEl = $("progress");
window.addEventListener(
  "scroll",
  () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    progressEl.style.width = (window.scrollY / total) * 100 + "%";
  },
  { passive: true },
);

/* ─── burger ─── */
const sidebar = $("sidebar"),
  burger = $("burger");
burger.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  burger.classList.toggle("open");
});
document.addEventListener("click", (e) => {
  if (window.innerWidth > 980) return;
  if (!sidebar.contains(e.target) && !burger.contains(e.target)) {
    sidebar.classList.remove("open");
    burger.classList.remove("open");
  }
});

/* ─── scroll-spy ─── */
const navLinks = document.querySelectorAll(".snav-a");
const spy = new IntersectionObserver(
  (entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navLinks.forEach((a) => a.classList.remove("active"));
      const a = document.querySelector(`.snav-a[href="#${en.target.id}"]`);
      if (a) {
        a.classList.add("active");
        a.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    });
  },
  { rootMargin: "-15% 0px -70% 0px" },
);
document.querySelectorAll(".sec").forEach((s) => spy.observe(s));

/* ─── fade in ─── */
const fade = new IntersectionObserver(
  (entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      fade.unobserve(en.target);
    });
  },
  { rootMargin: "0px 0px -50px 0px" },
);
document.querySelectorAll(".sec").forEach((s) => fade.observe(s));

/* ─── universal handler for button groups ─── */
document.querySelectorAll(".ctrl-btns[data-group]").forEach((group) => {
  group.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn");
    if (!btn) return;
    group.querySelectorAll(".btn").forEach((b) => b.classList.remove("on"));
    btn.classList.add("on");
    handle(group.dataset.group, btn);
  });
});

/* ════════════════════════════════════════════════════════════════
   HANDLER — har bir control group ucnun
════════════════════════════════════════════════════════════════ */
function handle(g, btn) {
  const v = btn.dataset.val;
  switch (g) {
    /* ─── S01 Basic selectors ─── */
    case "sel-basic": {
      const codes = {
        universal: `* {\n  box-sizing: border-box;\n  margin: 0;\n  padding: 0;\n}\n/* Universal — barcha elementlar */\n/* Specificity: 0,0,0,0 */`,
        element: `p {\n  line-height: 1.6;\n  color: var(--t-2);\n}\nh1 { font-size: 2rem; }\n/* Element — teg bo'yicha */\n/* Specificity: 0,0,0,1 */`,
        class: `.menu {\n  display: flex;\n  gap: 1rem;\n}\n.menu-item { padding: 8px; }\n/* Class — eng ko'p ishlatiladi */\n/* Specificity: 0,0,1,0 */`,
        id: `#header {\n  position: sticky;\n  top: 0;\n  z-index: 100;\n}\n/* ID — sahifada UNIK */\n/* Specificity: 0,1,0,0 */`,
        compound: `p.intro.large {\n  font-size: 1.5rem;\n  color: var(--blue);\n}\n/* Element + 2 class (AND) */\n/* Specificity: 0,0,2,1 */`,
        group: `.btn, .link, .icon {\n  cursor: pointer;\n  transition: .2s;\n}\n/* Group — vergul (OR) */\n/* Har biri o'z specificity siga ega */`,
      };
      setCode("s01-code", codes[v]);
      break;
    }

    /* ─── S02 Combinators ─── */
    case "comb": {
      document
        .querySelectorAll("#s02 .comb-c, #s02 .comb-g, #s02 .comb-s")
        .forEach((el) => el.classList.remove("comb-hl"));
      if (v === "descendant")
        document
          .querySelectorAll("#s02 .comb-c, #s02 .comb-g")
          .forEach((el) => el.classList.add("comb-hl"));
      if (v === "child")
        document
          .querySelectorAll("#s02 .comb-c")
          .forEach((el) => el.classList.add("comb-hl"));
      if (v === "adjacent")
        document.querySelector("#s02 .comb-s")?.classList.add("comb-hl");
      if (v === "sibling")
        document
          .querySelectorAll("#s02 .comb-s")
          .forEach((el) => el.classList.add("comb-hl"));
      const codes = {
        descendant: `.parent .child {\n  color: var(--blue);\n}\n/* A B — BARCHA avlodlar */\n/* chuqurlikdan qat'i nazar */`,
        child: `.parent > .child {\n  color: var(--blue);\n}\n/* A > B — faqat DIRECT bolalar */\n/* nabira EMAS */`,
        adjacent: `.parent + .sibling {\n  color: var(--blue);\n}\n/* A + B — DARHOL keyingi sibling */\n/* faqat BITTA */`,
        sibling: `.parent ~ .sibling {\n  color: var(--blue);\n}\n/* A ~ B — BARCHA keyingi siblings */`,
      };
      setCode("s02-code", codes[v]);
      break;
    }

    /* ─── S03 Pseudo-classes ─── */
    case "pc": {
      const codes = {
        hover: `.btn:hover {\n  background: var(--pink);\n  color: #fff;\n  transform: translateY(-2px);\n}\n/* Sichqoncha ustida */`,
        active: `.btn:active {\n  transform: scale(.96);\n  background: var(--pink-d);\n}\n/* Bosilib turilgan paytda */`,
        focus: `input:focus {\n  border-color: var(--blue);\n  box-shadow: 0 0 0 3px var(--blue-d);\n  outline: none;\n}`,
        "focus-visible": `button:focus-visible {\n  outline: 2px solid var(--blue);\n  outline-offset: 2px;\n}\n/* Faqat klaviatura focus */`,
        "first-child": `li:first-child {\n  color: var(--pink);\n  font-weight: 700;\n}\n/* Birinchi farzand */`,
        "last-child": `li:last-child {\n  color: var(--blue);\n  border-bottom: none;\n}`,
        "nth-child": `li:nth-child(odd)   { ... }  /* 1,3,5,7 */\nli:nth-child(2n)    { ... }  /* 2,4,6,8 */\nli:nth-child(3n+1)  { ... }  /* 1,4,7,10 */\nli:nth-child(-n+3)  { ... }  /* birinchi 3 */`,
        "nth-of-type": `p:nth-of-type(2) {\n  color: var(--pink);\n}\n/* 2-paragraf (boshqa teglarni\n   hisobga olmay) */`,
        not: `li:not(:first-child) {\n  opacity: .7;\n}\n/* :first-child dan tashqari */`,
        is: `:is(h1, h2, h3) {\n  font-weight: 700;\n}\n/* Bir necha selector */\n/* MAX specificity */`,
        where: `:where(h1, h2, h3) {\n  font-weight: 700;\n}\n/* :is() kabi */\n/* lekin specificity = 0 */`,
        has: `article:has(img) {\n  padding: 2rem;\n}\n/* PARENT selector (modern) */\n/* ichida img bor article */`,
        checked: `input:checked {\n  accent-color: var(--pink);\n}\n.toggle:checked + label {\n  background: var(--pink);\n}`,
        disabled: `input:disabled {\n  opacity: .4;\n  cursor: not-allowed;\n}\ninput:enabled { background: white; }`,
        empty: `div:empty {\n  display: none;\n}\n/* Bolalari yo'q element */`,
        target: `#section:target {\n  background: var(--pink-d);\n}\n/* URL hash mos kelganda */`,
      };
      setCode("s03-code", codes[v]);
      break;
    }

    /* ─── S04 Pseudo-elements ─── */
    case "pe": {
      const codes = {
        before: `.el::before {\n  content: '→';\n  position: absolute;\n  left: 10px;\n  color: var(--pink);\n}\n/* content SHART */`,
        after: `.el::after {\n  content: ' ✓';\n  color: var(--green);\n}\n/* content SHART */`,
        "first-line": `p::first-line {\n  color: var(--pink);\n  font-weight: 700;\n  letter-spacing: .04em;\n}\n/* dinamik — ekran kengligi */`,
        "first-letter": `p::first-letter {\n  font-size: 2.4em;\n  font-weight: 800;\n  color: var(--gold);\n  float: left;\n}\n/* Drop cap */`,
        selection: `::selection {\n  background: var(--pink);\n  color: white;\n}\n/* Belgilangan matn */`,
        placeholder: `input::placeholder {\n  color: var(--gold);\n  font-style: italic;\n}`,
        marker: `li::marker {\n  color: var(--purple);\n  font-size: 1.2em;\n}`,
        backdrop: `dialog::backdrop {\n  background: rgba(0,0,0,.6);\n  backdrop-filter: blur(4px);\n}\n/* Modal orqa fon */`,
        "file-button": `input[type="file"]::file-selector-button {\n  background: var(--pink);\n  color: white;\n  border-radius: 6px;\n}`,
      };
      setCode("s04-code", codes[v]);
      break;
    }

    /* ─── S05 Attribute ─── */
    case "attr": {
      const codes = {
        exact: `[data-status="active"] {\n  color: var(--green);\n}\n[type="email"] {\n  border-color: var(--blue);\n}\n/* Aniq teng qiymat */`,
        starts: `a[href^="https"] {\n  color: var(--green);\n}\na[href^="mailto:"] {\n  color: var(--pink);\n}\n/* ^ — shu bilan boshlanadi */`,
        ends: `a[href$=".pdf"] {\n  color: var(--pink);\n}\nimg[src$=".svg"] {\n  width: 24px;\n}\n/* $ — shu bilan tugaydi */`,
        contains: `[class*="btn"] {\n  cursor: pointer;\n}\na[href*="github"] {\n  font-weight: 700;\n}\n/* * — ichiga oladi */`,
        exists: `[disabled] {\n  opacity: .4;\n}\n[data-tooltip] {\n  cursor: help;\n}\n/* atribut mavjudligi */`,
        word: `[data-tag~="featured"] {\n  font-weight: 700;\n}\n/* ~ — so'zlar ro'yxatida */\n/* "featured new" → topadi */`,
        pipe: `[data-priority|="high"] {\n  color: var(--pink);\n}\n/* | — value yoki value- */\n/* "high" yoki "high-critical" */`,
      };
      setCode("s05-code", codes[v]);
      break;
    }

    /* ─── S06 Font ─── */
    case "f-w":
    case "f-s":
    case "f-ls":
    case "f-st":
    case "f-tt": {
      const stage = $("s06-text");
      const prop = {
        "f-w": "fontWeight",
        "f-s": "fontSize",
        "f-ls": "letterSpacing",
        "f-st": "fontStyle",
        "f-tt": "textTransform",
      }[g];
      stage.querySelectorAll("p").forEach((p) => (p.style[prop] = v));
      renderS06();
      break;
    }

    /* ─── S07 Rhythm ─── */
    case "r-lh":
    case "r-fs":
    case "r-ls": {
      const stage = $("s07-text");
      const map = {
        "r-lh": "lineHeight",
        "r-fs": "fontSize",
        "r-ls": "letterSpacing",
      };
      stage
        .querySelectorAll(".rh-p, .rh-h2, .rh-h3")
        .forEach((el) => (el.style[map[g]] = v));
      renderS07();
      break;
    }

    /* ─── S08 Clamp ─── */
    case "clamp": {
      $("s08-box").style.fontSize = v;
      const parts = v
        .replace("clamp(", "")
        .replace(")", "")
        .split(",")
        .map((x) => x.trim());
      $("s08-info").innerHTML =
        `<span>min: <b>${parts[0]}</b></span><span>preferred: <b>${parts[1]}</b></span><span>max: <b>${parts[2]}</b></span>`;
      setCode(
        "s08-code",
        `.heading {\n  font-size: ${v};\n  /* min, preferred, max */\n}\n/* media query KERAK EMAS\n   resize qiling — silliq o'tadi */`,
      );
      break;
    }

    /* ─── S09 Text effects ─── */
    case "te": {
      const codes = {
        gradient: `.text {\n  background: linear-gradient(135deg,\n    var(--pink), var(--blue), var(--gold));\n  -webkit-background-clip: text;\n  background-clip: text;\n  -webkit-text-fill-color: transparent;\n}`,
        stroke: `.text {\n  color: transparent;\n  -webkit-text-stroke: 1.2px var(--pink);\n  font-weight: 800;\n}`,
        truncate: `.text {\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n/* uzun matn ... bilan kesiladi */`,
        clamp: `.text {\n  display: -webkit-box;\n  -webkit-line-clamp: 2;\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n}\n/* N qatorga cheklash */`,
        underline: `.link {\n  background:\n    linear-gradient(var(--pink), var(--pink))\n    0 100% / 0 2px no-repeat;\n  transition: background-size .3s;\n}\n.link:hover {\n  background-size: 100% 2px;\n}`,
        glow: `.text {\n  text-shadow:\n    0 0 20px var(--pink),\n    0 0 40px var(--blue);\n  color: white;\n  font-weight: 700;\n}`,
        decoration: `.text {\n  text-decoration: underline wavy var(--pink);\n  text-decoration-thickness: 2px;\n  text-underline-offset: 4px;\n  text-decoration-skip-ink: auto;\n}`,
      };
      setCode("s09-code", codes[v]);
      break;
    }

    /* ─── S10 static/relative ─── */
    case "p10": {
      const box = $("s10-box");
      if (v === "relative") {
        box.style.position = "relative";
        box.textContent = "relative box";
      } else {
        box.style.position = "static";
        box.style.top = "";
        box.style.left = "";
        box.textContent = "static box";
      }
      renderS10();
      break;
    }
    case "p10-t": {
      $("s10-box").style.top = v;
      renderS10();
      break;
    }
    case "p10-l": {
      $("s10-box").style.left = v;
      renderS10();
      break;
    }

    /* ─── S11 absolute ─── */
    case "p11": {
      const box = $("s11-box");
      box.style.top =
        box.style.right =
        box.style.bottom =
        box.style.left =
        box.style.transform =
          "";
      const cfg = {
        tl: { top: "8px", left: "8px" },
        tr: { top: "8px", right: "8px" },
        bl: { bottom: "8px", left: "8px" },
        br: { bottom: "8px", right: "8px" },
        center: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
        stretch: { top: "8px", left: "8px", right: "8px", bottom: "8px" },
      }[v];
      Object.entries(cfg).forEach(([k, val]) => (box.style[k] = val));
      const lines = [".box {", "  position: absolute;"];
      ["top", "right", "bottom", "left", "transform"].forEach((k) => {
        if (cfg[k]) lines.push(`  ${k}: ${cfg[k]};`);
      });
      lines.push("}", "", ".parent { position: relative; }");
      setCode("s11-code", lines.join("\n"));
      break;
    }

    /* ─── S13 z-index ─── */
    case "z-1":
      $("s13-z1").style.zIndex = v;
      renderS13();
      break;
    case "z-2":
      $("s13-z2").style.zIndex = v;
      renderS13();
      break;
    case "z-3":
      $("s13-z3").style.zIndex = v;
      renderS13();
      break;

    /* ─── S14 box-shadow ─── */
    case "sh": {
      const presets = {
        soft: [
          "0 4px 16px rgba(0,0,0,.4), 0 1px 4px rgba(0,0,0,.3)",
          `.box {\n  box-shadow:\n    0 4px 16px rgba(0,0,0,.4),\n    0 1px 4px rgba(0,0,0,.3);\n}`,
        ],
        hard: [
          "5px 5px 0 var(--pink)",
          `.box {\n  box-shadow: 5px 5px 0 var(--pink);\n}`,
        ],
        "glow-pink": [
          "0 0 20px rgba(255,69,100,.6), 0 0 40px rgba(255,69,100,.3)",
          `.box {\n  box-shadow:\n    0 0 20px rgba(255,69,100,.6),\n    0 0 40px rgba(255,69,100,.3);\n}`,
        ],
        "glow-blue": [
          "0 0 20px rgba(74,144,255,.6), 0 0 40px rgba(74,144,255,.3)",
          `.box {\n  box-shadow:\n    0 0 20px rgba(74,144,255,.6),\n    0 0 40px rgba(74,144,255,.3);\n}`,
        ],
        multi: [
          "0 1px 3px rgba(0,0,0,.4), 0 8px 24px rgba(0,0,0,.45), 0 0 0 1px rgba(255,255,255,.05)",
          `.box {\n  box-shadow:\n    0 1px 3px rgba(0,0,0,.4),\n    0 8px 24px rgba(0,0,0,.45),\n    0 0 0 1px rgba(255,255,255,.05);\n}`,
        ],
        inset: [
          "inset 0 2px 10px rgba(0,0,0,.6)",
          `.box {\n  box-shadow: inset 0 2px 10px rgba(0,0,0,.6);\n}`,
        ],
        neuro: [
          "6px 6px 12px rgba(0,0,0,.45), -4px -4px 10px rgba(255,255,255,.04)",
          `.box {\n  box-shadow:\n    6px 6px 12px rgba(0,0,0,.45),\n    -4px -4px 10px rgba(255,255,255,.04);\n}`,
        ],
        elev1: [
          "0 1px 2px rgba(0,0,0,.4)",
          `.box {\n  box-shadow: 0 1px 2px rgba(0,0,0,.4);\n  /* elevation 1 */\n}`,
        ],
        elev2: [
          "0 4px 12px rgba(0,0,0,.4)",
          `.box {\n  box-shadow: 0 4px 12px rgba(0,0,0,.4);\n  /* elevation 2 */\n}`,
        ],
        elev3: [
          "0 12px 32px rgba(0,0,0,.5)",
          `.box {\n  box-shadow: 0 12px 32px rgba(0,0,0,.5);\n  /* elevation 3 */\n}`,
        ],
        none: ["none", `.box {\n  box-shadow: none;\n}`],
      };
      const [css, code] = presets[v];
      $("s14-box").style.boxShadow = css;
      setCode("s14-code", code);
      break;
    }

    /* ─── S15 text-shadow ─── */
    case "ts": {
      const presets = {
        glow: [
          "0 0 10px rgba(255,69,100,.9), 0 0 30px rgba(255,69,100,.5), 0 0 60px rgba(255,69,100,.3)",
          `.text {\n  text-shadow:\n    0 0 10px rgba(255,69,100,.9),\n    0 0 30px rgba(255,69,100,.5),\n    0 0 60px rgba(255,69,100,.3);\n}`,
        ],
        hard: [
          "4px 4px 0 rgba(255,69,100,.9)",
          `.text {\n  text-shadow: 4px 4px 0 rgba(255,69,100,.9);\n}`,
        ],
        multi: [
          "1px 1px 0 var(--pink), 2px 2px 0 var(--blue), 3px 3px 0 var(--gold)",
          `.text {\n  text-shadow:\n    1px 1px 0 var(--pink),\n    2px 2px 0 var(--blue),\n    3px 3px 0 var(--gold);\n}`,
        ],
        fire: [
          "0 -2px 4px #fff, 0 -4px 8px #ff0, 0 -8px 16px #f90, 0 -12px 24px rgba(255,69,100,.8)",
          `.text {\n  text-shadow:\n    0 -2px 4px #fff,\n    0 -4px 8px #ff0,\n    0 -8px 16px #f90,\n    0 -12px 24px rgba(255,69,100,.8);\n}`,
        ],
        emboss: [
          "1px 1px 1px rgba(255,255,255,.1), -1px -1px 1px rgba(0,0,0,.6)",
          `.text {\n  text-shadow:\n    1px 1px 1px rgba(255,255,255,.1),\n    -1px -1px 1px rgba(0,0,0,.6);\n}`,
        ],
        "3d": [
          "1px 1px 0 #b00, 2px 2px 0 #b00, 3px 3px 0 #b00, 4px 4px 0 #b00",
          `.text {\n  text-shadow:\n    1px 1px 0 #b00,\n    2px 2px 0 #b00,\n    3px 3px 0 #b00,\n    4px 4px 0 #b00;\n}`,
        ],
        soft: [
          "2px 2px 6px rgba(0,0,0,.5)",
          `.text {\n  text-shadow: 2px 2px 6px rgba(0,0,0,.5);\n}`,
        ],
        none: ["none", `.text {\n  text-shadow: none;\n}`],
      };
      const [css, code] = presets[v];
      $("s15-text").style.textShadow = css;
      setCode("s15-code", code);
      break;
    }

    /* ─── S16 drop-shadow ─── */
    case "dr": {
      const presets = {
        default: [
          "drop-shadow(4px 4px 8px rgba(255,69,100,.5))",
          `.shape {\n  filter: drop-shadow(4px 4px 8px rgba(255,69,100,.5));\n}`,
        ],
        pink: [
          "drop-shadow(0 0 16px rgba(255,69,100,.8)) drop-shadow(0 0 32px rgba(255,69,100,.4))",
          `.shape {\n  filter:\n    drop-shadow(0 0 16px rgba(255,69,100,.8))\n    drop-shadow(0 0 32px rgba(255,69,100,.4));\n}`,
        ],
        blue: [
          "drop-shadow(0 0 16px rgba(74,144,255,.8)) drop-shadow(0 0 32px rgba(74,144,255,.4))",
          `.shape {\n  filter:\n    drop-shadow(0 0 16px rgba(74,144,255,.8))\n    drop-shadow(0 0 32px rgba(74,144,255,.4));\n}`,
        ],
        hard: [
          "drop-shadow(5px 5px 0 rgba(255,69,100,.9))",
          `.shape {\n  filter: drop-shadow(5px 5px 0 rgba(255,69,100,.9));\n}`,
        ],
        soft: [
          "drop-shadow(0 8px 24px rgba(255,69,100,.3))",
          `.shape {\n  filter: drop-shadow(0 8px 24px rgba(255,69,100,.3));\n}`,
        ],
        multi: [
          "drop-shadow(0 0 8px var(--pink)) drop-shadow(0 0 20px var(--blue)) brightness(1.1)",
          `.shape {\n  filter:\n    drop-shadow(0 0 8px var(--pink))\n    drop-shadow(0 0 20px var(--blue))\n    brightness(1.1);\n}`,
        ],
        none: ["none", `.shape {\n  filter: none;\n}`],
      };
      const [css, code] = presets[v];
      $("s16-shape").style.filter = css;
      setCode("s16-code", code);
      break;
    }

    /* ─── S17 transition ─── */
    case "tr-dur":
      trState.dur = v;
      applyTransition();
      break;
    case "tr-ease":
      trState.ease = v;
      applyTransition();
      break;

    /* ─── S18 keyframes ─── */
    case "kf": {
      const box = $("s18-box");
      box.className = "kfbox";
      if (v !== "none") box.classList.add(v);
      const defs = {
        bounce: `@keyframes bounce {\n  0%, 100% { transform: translateY(0); }\n  50%      { transform: translateY(-30px); }\n}\n.el { animation: bounce 1s ease-in-out infinite; }`,
        spin: `@keyframes spin {\n  from { transform: rotate(0); }\n  to   { transform: rotate(360deg); }\n}\n.el { animation: spin .9s linear infinite; }`,
        pulse: `@keyframes pulse {\n  0%, 100% { transform: scale(1); opacity: 1; }\n  50%      { transform: scale(1.25); opacity: .6; }\n}\n.el { animation: pulse 1.2s ease-in-out infinite; }`,
        shake: `@keyframes shake {\n  0%, 100% { transform: translateX(0); }\n  20%, 60% { transform: translateX(-8px); }\n  40%, 80% { transform: translateX(8px); }\n}\n.el { animation: shake .5s infinite; }`,
        flip: `@keyframes flip {\n  from { transform: perspective(400px) rotateY(0); }\n  to   { transform: perspective(400px) rotateY(360deg); }\n}\n.el { animation: flip 1.4s ease-in-out infinite; }`,
        morph: `@keyframes morph {\n  0%, 100% { border-radius: 50%; }\n  50%      { border-radius: 4px; }\n}\n.el { animation: morph 1.5s infinite; }`,
        float: `@keyframes float {\n  0%, 100% { transform: translateY(0) rotate(0); }\n  50%      { transform: translateY(-18px) rotate(6deg); }\n}\n.el { animation: float 2s ease-in-out infinite; }`,
        swing: `@keyframes swing {\n  0%, 100% { transform: rotate(0); }\n  25% { transform: rotate(15deg); }\n  75% { transform: rotate(-15deg); }\n}\n.el { animation: swing .9s ease-in-out infinite; }`,
        rubber: `@keyframes rubber {\n  0%   { transform: scale(1, 1); }\n  30%  { transform: scale(1.25, .75); }\n  60%  { transform: scale(.85, 1.15); }\n  100% { transform: scale(1, 1); }\n}\n.el { animation: rubber 1s infinite; }`,
        hb: `@keyframes heartbeat {\n  0%, 100% { transform: scale(1); }\n  14%, 42% { transform: scale(1.2); }\n  28%, 70% { transform: scale(1); }\n}\n.el { animation: heartbeat 1.3s infinite; }`,
        none: `.el { animation: none; }`,
      };
      setCode("s18-code", defs[v]);
      break;
    }

    /* ─── S19 animation props ─── */
    case "ap-ic":
    case "ap-dir":
    case "ap-fm":
    case "ap-ps": {
      const box = $("s19-box");
      const map = {
        "ap-ic": "animationIterationCount",
        "ap-dir": "animationDirection",
        "ap-fm": "animationFillMode",
        "ap-ps": "animationPlayState",
      };
      box.style[map[g]] = v;
      renderS19();
      break;
    }

    /* ─── S20 transform ─── */
    case "tf": {
      const presets = {
        none: ["none", "transform: none;"],
        translate: [
          "translate(28px, -18px)",
          "transform: translate(28px, -18px);",
        ],
        translatex: ["translateX(40px)", "transform: translateX(40px);"],
        translatey: ["translateY(-20px)", "transform: translateY(-20px);"],
        rotate: ["rotate(20deg)", "transform: rotate(20deg);"],
        scale: ["scale(1.3)", "transform: scale(1.3);"],
        scalex: ["scaleX(1.5)", "transform: scaleX(1.5);"],
        skew: ["skew(14deg, 4deg)", "transform: skew(14deg, 4deg);"],
        combo: [
          "translate(10px,-8px) rotate(12deg) scale(1.1)",
          "transform: translate(10px, -8px)\n           rotate(12deg)\n           scale(1.1);",
        ],
        persp: [
          "perspective(400px) rotateY(35deg)",
          "transform: perspective(400px) rotateY(35deg);",
        ],
        rotatex: [
          "perspective(400px) rotateX(40deg)",
          "transform: perspective(400px) rotateX(40deg);",
        ],
        rotatey: [
          "perspective(400px) rotateY(40deg)",
          "transform: perspective(400px) rotateY(40deg);",
        ],
      };
      const [css, code] = presets[v];
      $("s20-box").style.transform = css;
      setCode(
        "s20-code",
        `.box {\n  ${code}\n}\n/* GPU accelerated — layout buzilmaydi */`,
      );
      break;
    }
  }
}

/* ─── per-section render helpers ─── */
function renderS06() {
  const p = $("s06-text").querySelector("p");
  setCode(
    "s06-code",
    `.text {\n  font-weight: ${p.style.fontWeight || "400"};\n  font-size: ${p.style.fontSize || "16px"};\n  letter-spacing: ${p.style.letterSpacing || "0"};\n  font-style: ${p.style.fontStyle || "normal"};\n  text-transform: ${p.style.textTransform || "none"};\n}`,
  );
}
function renderS07() {
  const p = $("s07-text").querySelector(".rh-p");
  setCode(
    "s07-code",
    `p {\n  line-height: ${p.style.lineHeight || "1.7"};\n  font-size: ${p.style.fontSize || "14px"};\n  letter-spacing: ${p.style.letterSpacing || "0"};\n}\n/* birliksiz line-height meros to'g'ri */`,
  );
}
function renderS10() {
  const b = $("s10-box");
  if (b.style.position === "relative") {
    setCode(
      "s10-code",
      `.box {\n  position: relative;\n  top: ${b.style.top || "0"};\n  left: ${b.style.left || "0"};\n}\n/* joyi saqlanadi */`,
    );
  } else {
    setCode(
      "s10-code",
      `.box {\n  position: static;\n}\n/* top/left ishlamaydi */`,
    );
  }
}
function renderS13() {
  setCode(
    "s13-code",
    `.box-pink { position: relative; z-index: ${$("s13-z1").style.zIndex || "1"}; }\n.box-blue { position: relative; z-index: ${$("s13-z2").style.zIndex || "2"}; }\n.box-gold { position: relative; z-index: ${$("s13-z3").style.zIndex || "3"}; }\n/* katta z-index = ustda */`,
  );
}
const trState = { dur: "0.3s", ease: "ease" };
function applyTransition() {
  $("s17-box").style.transition = `all ${trState.dur} ${trState.ease}`;
  setCode(
    "s17-code",
    `.box {\n  transition: all ${trState.dur} ${trState.ease};\n}\n.box:hover {\n  transform: translateY(-5px) scale(1.06);\n}\n/* transform + opacity = GPU */`,
  );
}
function renderS19() {
  const s = $("s19-box").style;
  setCode(
    "s19-code",
    `.box {\n  animation-name: bounce;\n  animation-duration: 1.5s;\n  animation-iteration-count: ${s.animationIterationCount || "infinite"};\n  animation-direction: ${s.animationDirection || "normal"};\n  animation-fill-mode: ${s.animationFillMode || "none"};\n  animation-play-state: ${s.animationPlayState || "running"};\n}`,
  );
}

/* ─── easing play button ─── */
const playBtn = $("s17-play");
if (playBtn) {
  playBtn.addEventListener("click", () => {
    const balls = document.querySelectorAll("#s17 .eased__ball");
    balls.forEach((b) => b.classList.remove("go"));
    void document.body.offsetHeight;
    requestAnimationFrame(() => balls.forEach((b) => b.classList.add("go")));
    setTimeout(() => balls.forEach((b) => b.classList.remove("go")), 1300);
  });
}

/* ════════════════════════════════════════════════════════════════
   INITIAL CODE RENDER — all sections
════════════════════════════════════════════════════════════════ */
setCode(
  "s01-code",
  `/* Universal */\n* { box-sizing: border-box; }\n\n/* Element */\np { line-height: 1.6; }\n\n/* Class */\n.menu { display: flex; }\n\n/* ID */\n#header { position: sticky; }\n\n/* Group */\nh1, h2, h3 { font-weight: 700; }`,
);
setCode(
  "s02-code",
  `.parent .child {\n  color: var(--blue);\n}\n/* A B — BARCHA avlodlar */`,
);
setCode(
  "s03-code",
  `.btn:hover {\n  background: var(--pink);\n  color: #fff;\n  transform: translateY(-2px);\n}`,
);
setCode(
  "s04-code",
  `.el::before {\n  content: '→';\n  position: absolute;\n  left: 10px;\n  color: var(--pink);\n}\n/* content SHART */`,
);
setCode(
  "s05-code",
  `[data-status="active"] {\n  color: var(--green);\n}\n[type="email"] {\n  border-color: var(--blue);\n}\n/* Aniq teng qiymat */`,
);
renderS06();
renderS07();
setCode(
  "s08-code",
  `.heading {\n  font-size: clamp(1.6rem, 4vw, 4rem);\n}\n/* media query KERAK EMAS */`,
);
setCode(
  "s09-code",
  `.text {\n  background: linear-gradient(135deg,\n    var(--pink), var(--blue), var(--gold));\n  -webkit-background-clip: text;\n  background-clip: text;\n  -webkit-text-fill-color: transparent;\n}`,
);
renderS10();
setCode(
  "s11-code",
  `.box {\n  position: absolute;\n  top: 8px;\n  left: 8px;\n}\n\n.parent { position: relative; }`,
);
setCode(
  "s12-code",
  `/* fixed — viewport ga */\n.navbar {\n  position: fixed;\n  top: 0; left: 0;\n  width: 100%;\n  z-index: 1000;\n}\n\n/* sticky — konteyner ichida */\n.header {\n  position: sticky;\n  top: 0;\n  z-index: 10;\n}`,
);
renderS13();
handle("sh", { dataset: { val: "soft" } });
handle("ts", { dataset: { val: "glow" } });
setCode(
  "s16-code",
  `/* drop-shadow — shaklga mos */\n.shape {\n  filter: drop-shadow(4px 4px 8px rgba(255,69,100,.5));\n}\n\n/* box-shadow — to'rtburchakka */\n.box {\n  box-shadow: 4px 4px 8px rgba(0,0,0,.4);\n}`,
);
applyTransition();
handle("kf", { dataset: { val: "bounce" } });
$("s18-box").className = "kfbox bounce";
renderS19();
setCode("s20-code", `.box {\n  transform: none;\n}\n/* GPU accelerated */`);
setCode(
  "s21-code",
  `/* Mobile-first */\n.grid {\n  grid-template-columns: 1fr;\n}\n\n@media (min-width: 640px) {\n  .grid { grid-template-columns: 1fr 1fr; }\n}\n\n@media (min-width: 1024px) {\n  .grid { grid-template-columns: repeat(3, 1fr); }\n}`,
);
setCode(
  "s22-code",
  `.text { font-size: 1rem; }       /* rem */\n.pad  { padding: 1em; }          /* em */\n.hero { height: 100dvh; }        /* mobile-safe */\n.read { max-width: 65ch; }       /* o'qish */\n.cont { width: clamp(300px, 90%, 1200px); }\n.col  { width: 50vw; }           /* viewport */\n.gap  { gap: 1fr; }              /* grid */`,
);
setCode(
  "s23-code",
  `/* 1. Konteyner belgilash */\n.wrapper {\n  container-type: inline-size;\n  container-name: card;\n}\n\n/* 2. Container query */\n@container (min-width: 340px) {\n  .card {\n    flex-direction: row;\n  }\n}\n\n/* viewport EMAS, parent konteyner! */`,
);
