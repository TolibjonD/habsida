"use strict";

/* ═══════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════ */
const sidebar = document.getElementById("sidebar");
const hamburger = document.getElementById("hamburger");

hamburger.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  hamburger.classList.toggle("open");
});

document.addEventListener("click", (e) => {
  if (window.innerWidth > 900) return;
  if (!sidebar.contains(e.target) && !hamburger.contains(e.target)) {
    sidebar.classList.remove("open");
    hamburger.classList.remove("open");
  }
});

/* ═══════════════════════════════════════════
   ACTIVE SIDEBAR LINK (scroll spy)
═══════════════════════════════════════════ */
const allSections = document.querySelectorAll(".ds");
const navLinks = document.querySelectorAll(".sidebar__link");

const spy = new IntersectionObserver(
  (entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navLinks.forEach((l) => {
        l.classList.remove("active");
        if (l.getAttribute("href") === "#" + en.target.id)
          l.classList.add("active");
      });
    });
  },
  { rootMargin: "-15% 0px -70% 0px" },
);

allSections.forEach((s) => spy.observe(s));

/* ═══════════════════════════════════════════
   CODE BUILDER HELPERS
═══════════════════════════════════════════ */
const H = {
  sel: (s) => `<span class="cs">${s}</span>`,
  prop: (s) => `<span class="cp">${s}</span>`,
  f: (s) => `<span class="cf">${s}</span>`,
  g: (s) => `<span class="cg">${s}</span>`,
  n: (s) => `<span class="cn">${s}</span>`,
  x: (s) => `<span class="cx">${s}</span>`,
  c: (s) => `<span class="cc">${s}</span>`,
};

function cssBlock(sel, props) {
  const lines = props.map(
    ([k, v, type]) =>
      `  ${H.prop(k)}${H.x(": ")}${type === "g" ? H.g(v) : H.f(v)}${H.x(";")}`,
  );
  return `${H.sel(sel)} ${H.x("{")}\n${lines.join("\n")}\n${H.x("}")}`;
}

function setCode(id, html) {
  const el = document.getElementById(id + "-code");
  if (el) el.innerHTML = html;
}

/* ═══════════════════════════════════════════
   GENERIC BUTTON GROUP (data-css + data-stage)
═══════════════════════════════════════════ */
document.querySelectorAll(".ctrl-btns[data-stage]").forEach((group) => {
  group.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn");
    if (!btn || !btn.dataset.val) return;

    const val = btn.dataset.val;
    const css = group.dataset.css;
    const stage = document.getElementById(group.dataset.stage);
    const code = group.dataset.code;
    const type = group.dataset.type; // 'f' | 'g'

    if (!stage) return;

    if (css === "rowcol") {
      const [r, c] = val.split("|");
      stage.style.rowGap = r;
      stage.style.columnGap = c;
      stage.style.gap = "";
    } else {
      stage.style[css] = val;
    }

    // sync active within same css group
    group.querySelectorAll(".btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    renderStageCode(code, stage, type);
  });
});

/* ═══════════════════════════════════════════
   RENDER CODE FROM STAGE INLINE STYLES
═══════════════════════════════════════════ */
function renderStageCode(codeId, stage, type) {
  const s = stage.style;
  const rows = [];

  const add = (cssProp, jsProp) => {
    const v = s[jsProp];
    if (v) rows.push([cssProp, v, type]);
  };

  if (type === "f") {
    rows.push(["display", s.display || "flex", "f"]);
    add("flex-direction", "flexDirection");
    add("justify-content", "justifyContent");
    add("align-items", "alignItems");
    add("align-content", "alignContent");
    add("flex-wrap", "flexWrap");
    if (s.gap) rows.push(["gap", s.gap, "f"]);
    if (s.rowGap) rows.push(["row-gap", s.rowGap, "f"]);
    if (s.columnGap) rows.push(["column-gap", s.columnGap, "f"]);
  } else {
    rows.push(["display", s.display || "grid", "g"]);
    add("grid-template-columns", "gridTemplateColumns");
    add("grid-template-rows", "gridTemplateRows");
    if (s.gap) rows.push(["gap", s.gap, "g"]);
    if (s.rowGap) rows.push(["row-gap", s.rowGap, "g"]);
    if (s.columnGap) rows.push(["column-gap", s.columnGap, "g"]);
    add("grid-auto-flow", "gridAutoFlow");
    add("place-items", "placeItems");
    if (s.alignItems && !s.placeItems) add("align-items", "alignItems");
  }

  setCode(codeId, cssBlock(".container", rows));
}

/* ═══════════════════════════════════════════
   S01 — init
═══════════════════════════════════════════ */
function setStyle(stageId, cssProp, val, btn) {
  const stage = document.getElementById(stageId);
  if (!stage) return;
  stage.style[cssProp] = val;
  // sync active in same ctrl-btns group
  const group = btn.closest(".ctrl-btns");
  if (group)
    group.querySelectorAll(".btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
}

setCode("s01", cssBlock(".container", [["display", "flex", "f"]]));

/* ═══════════════════════════════════════════
   INIT CODES — call once for each section
═══════════════════════════════════════════ */
function initCode(stageId, codeId, type) {
  const stage = document.getElementById(stageId);
  if (!stage) return;
  renderStageCode(codeId, stage, type);
}

initCode("s02-stage", "s02", "f");
initCode("s03-stage", "s03", "f");
initCode("s04-stage", "s04", "f");
initCode("s05-stage", "s05", "f");
initCode("s06-stage", "s06", "f");
initCode("s13-stage", "s13", "f");
initCode("s14-stage", "s14", "g");
initCode("s15-stage", "s15", "g");
initCode("s16-stage", "s16", "g");
initCode("s17-stage", "s17", "g");
initCode("s20-stage", "s20", "g");
initCode("s21-stage", "s21", "g");
initCode("s22-stage", "s22", "g");

/* ═══════════════════════════════════════════
   S07 — flex-grow per item
═══════════════════════════════════════════ */
document.querySelectorAll('.ctrl-btns[data-type="grow"]').forEach((group) => {
  group.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn");
    if (!btn) return;
    const item = document.getElementById(group.dataset.item);
    if (!item) return;
    const val = btn.dataset.val;
    item.style.flexGrow = val;
    item.childNodes[0].textContent = "grow:" + val;
    group.querySelectorAll(".btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderGrowCode();
  });
});

function renderGrowCode() {
  const a = document.getElementById("s07a");
  const b = document.getElementById("s07b");
  const c = document.getElementById("s07c");
  const ga = a ? a.style.flexGrow || "0" : "0";
  const gb = b ? b.style.flexGrow || "1" : "1";
  const gc = c ? c.style.flexGrow || "2" : "2";
  setCode(
    "s07",
    [
      cssBlock(".container", [
        ["display", "flex", "f"],
        ["gap", "8px", "f"],
      ]),
      "",
      cssBlock(".item-a", [["flex-grow", ga, "f"]]),
      cssBlock(".item-b", [["flex-grow", gb, "f"]]),
      cssBlock(".item-c", [["flex-grow", gc, "f"]]),
      "",
      H.c("/* " + H.x("") + "bo'sh_joy × (grow / jami_grow) */"),
    ].join("\n"),
  );
}
renderGrowCode();

/* ═══════════════════════════════════════════
   S08 — flex-shrink per item
═══════════════════════════════════════════ */
document.querySelectorAll('.ctrl-btns[data-type="shrink"]').forEach((group) => {
  group.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn");
    if (!btn) return;
    const item = document.getElementById(group.dataset.item);
    if (!item) return;
    const val = btn.dataset.val;
    item.style.flexShrink = val;
    item.textContent = "shrink:" + val;
    group.querySelectorAll(".btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderShrinkCode();
  });
});

function renderShrinkCode() {
  const a = document.getElementById("s08a");
  const b = document.getElementById("s08b");
  const c = document.getElementById("s08c");
  const sa = a ? a.style.flexShrink || "1" : "1";
  const sb = b ? b.style.flexShrink || "1" : "1";
  const sc = c ? c.style.flexShrink || "0" : "0";
  setCode(
    "s08",
    [
      cssBlock(".container", [
        ["display", "flex", "f"],
        ["gap", "6px", "f"],
      ]),
      "",
      cssBlock(".item-a", [["flex-shrink", sa, "f"]]),
      cssBlock(".item-b", [["flex-shrink", sb, "f"]]),
      cssBlock(".item-c", [["flex-shrink", sc, "f"]]),
    ].join("\n"),
  );
}
renderShrinkCode();

/* ═══════════════════════════════════════════
   S09 — flex-basis per item
═══════════════════════════════════════════ */
document.querySelectorAll('.ctrl-btns[data-type="basis"]').forEach((group) => {
  group.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn");
    if (!btn) return;
    const item = document.getElementById(group.dataset.item);
    if (!item) return;
    const val = btn.dataset.val;
    item.style.flexBasis = val;
    item.textContent = val;
    group.querySelectorAll(".btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderBasisCode();
  });
});

function renderBasisCode() {
  const a = document.getElementById("s09a");
  const b = document.getElementById("s09b");
  const c = document.getElementById("s09c");
  const ba = a ? a.style.flexBasis || "auto" : "auto";
  const bb = b ? b.style.flexBasis || "150px" : "150px";
  const bc = c ? c.style.flexBasis || "30%" : "30%";
  setCode(
    "s09",
    [
      cssBlock(".container", [
        ["display", "flex", "f"],
        ["gap", "8px", "f"],
      ]),
      "",
      cssBlock(".item-a", [["flex-basis", ba, "f"]]),
      cssBlock(".item-b", [["flex-basis", bb, "f"]]),
      cssBlock(".item-c", [["flex-basis", bc, "f"]]),
    ].join("\n"),
  );
}
renderBasisCode();

/* ═══════════════════════════════════════════
   S10 — flex shorthand
═══════════════════════════════════════════ */
document
  .querySelectorAll('.ctrl-btns[data-type="shorthand"]')
  .forEach((group) => {
    group.addEventListener("click", (e) => {
      const btn = e.target.closest(".btn");
      if (!btn) return;
      const fa = btn.dataset.a;
      const fb = btn.dataset.b;
      const fc = btn.dataset.c;
      if (!fa) return;

      const a = document.getElementById("s10a");
      const b = document.getElementById("s10b");
      const c = document.getElementById("s10c");
      if (a) {
        a.style.flex = fa;
        a.textContent = "flex:" + fa;
      }
      if (b) {
        b.style.flex = fb;
        b.textContent = "flex:" + fb;
      }
      if (c) {
        c.style.flex = fc;
        c.textContent = "flex:" + fc;
      }

      group
        .querySelectorAll(".btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const expand = (v) =>
        ({ 1: "1 1 0%", auto: "1 1 auto", none: "0 0 auto" })[v] || v;
      setCode(
        "s10",
        [
          cssBlock(".container", [
            ["display", "flex", "f"],
            ["gap", "8px", "f"],
          ]),
          "",
          cssBlock(".item-a", [["flex", fa, "f"]]) +
            "\n" +
            H.c("/* = " + expand(fa) + " */"),
          cssBlock(".item-b", [["flex", fb, "f"]]),
          cssBlock(".item-c", [["flex", fc, "f"]]),
        ].join("\n"),
      );
    });
  });

// init s10
setCode(
  "s10",
  [
    cssBlock(".container", [
      ["display", "flex", "f"],
      ["gap", "8px", "f"],
    ]),
    "",
    cssBlock(".item-a", [["flex", "1", "f"]]) +
      "\n" +
      H.c("/* = flex: 1 1 0% */"),
    cssBlock(".item-b", [["flex", "1", "f"]]),
    cssBlock(".item-c", [["flex", "2", "f"]]),
  ].join("\n"),
);

/* ═══════════════════════════════════════════
   S11 — align-self
═══════════════════════════════════════════ */
document
  .querySelectorAll('.ctrl-btns[data-type="alignself"]')
  .forEach((group) => {
    group.addEventListener("click", (e) => {
      const btn = e.target.closest(".btn");
      if (!btn) return;
      const val = btn.dataset.val;
      const target = document.getElementById("s11target");
      if (target) target.style.alignSelf = val;
      group
        .querySelectorAll(".btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderAlignSelfCode();
    });
  });

function renderAlignSelfCode() {
  const container = document.getElementById("s11-stage");
  const target = document.getElementById("s11target");
  const ca = container ? container.style.alignItems || "stretch" : "stretch";
  const sa = target ? target.style.alignSelf || "auto" : "auto";
  setCode(
    "s11",
    [
      cssBlock(".container", [
        ["display", "flex", "f"],
        ["align-items", ca, "f"],
      ]),
      "",
      cssBlock(".target", [["align-self", sa, "f"]]),
      "",
      H.c("/* align-self container'ning align-items ini override qiladi */"),
    ].join("\n"),
  );
}
renderAlignSelfCode();

// also update when container align-items changes
document
  .querySelectorAll('.ctrl-btns[data-stage="s11-stage"]')
  .forEach((group) => {
    group.addEventListener("click", () => setTimeout(renderAlignSelfCode, 10));
  });

/* ═══════════════════════════════════════════
   S12 — order per item
═══════════════════════════════════════════ */
document.querySelectorAll('.ctrl-btns[data-type="order"]').forEach((group) => {
  group.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn");
    if (!btn) return;
    const item = document.getElementById(group.dataset.item);
    if (!item) return;
    const val = parseInt(btn.dataset.val);
    item.style.order = val;
    // update small label inside
    const small = item.querySelector("small");
    if (small) small.textContent = "order:" + val;
    group.querySelectorAll(".btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderOrderCode();
  });
});

function renderOrderCode() {
  const ids = ["s12a", "s12b", "s12c", "s12d"];
  const orders = ids.map((id) => {
    const el = document.getElementById(id);
    return el ? el.style.order || "0" : "0";
  });
  setCode(
    "s12",
    [
      cssBlock(".container", [
        ["display", "flex", "f"],
        ["gap", "8px", "f"],
      ]),
      "",
      ...orders.map((o, i) =>
        cssBlock(".item-" + (i + 1), [["order", o, "f"]]),
      ),
      "",
      H.c("/* kichik order = oldin vizual ko'rinadi */"),
    ].join("\n"),
  );
}
renderOrderCode();

/* ═══════════════════════════════════════════
   S18 — grid-template-areas
═══════════════════════════════════════════ */
const areaLayouts = {
  classic: {
    cols: "150px 1fr",
    rows: "50px 1fr 42px",
    areas: '"header header" "sidebar main" "footer footer"',
    items: [
      { sel: ".bg.g0", area: "header", label: "header" },
      { sel: ".bg.g2", area: "sidebar", label: "sidebar" },
      { sel: ".bg.g1", area: "main", label: "main" },
      { sel: ".bg.g3", area: "footer", label: "footer" },
    ],
  },
  holygrail: {
    cols: "130px 1fr 130px",
    rows: "50px 1fr 42px",
    areas: '"header header header" "left main right" "footer footer footer"',
    items: [
      { sel: ".bg.g0", area: "header", label: "header" },
      { sel: ".bg.g2", area: "left", label: "left" },
      { sel: ".bg.g1", area: "main", label: "main" },
      { sel: ".bg.g3", area: "right", label: "right" },
    ],
  },
  magazine: {
    cols: "1fr 1fr 1fr",
    rows: "80px 80px 50px",
    areas: '"hero hero aside" "hero hero aside" "footer footer footer"',
    items: [
      { sel: ".bg.g0", area: "hero", label: "hero" },
      { sel: ".bg.g2", area: "aside", label: "aside" },
      { sel: ".bg.g1", area: "footer", label: "footer" },
      { sel: ".bg.g3", area: "", label: "" },
    ],
  },
};

document.querySelectorAll('.ctrl-btns[data-type="areas"]').forEach((group) => {
  group.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn");
    if (!btn || !btn.dataset.layout) return;

    const cfg = areaLayouts[btn.dataset.layout];
    const stage = document.getElementById("s18-stage");
    if (!stage || !cfg) return;

    stage.style.gridTemplateColumns = cfg.cols;
    stage.style.gridTemplateRows = cfg.rows;
    stage.style.gridTemplateAreas = cfg.areas;

    cfg.items.forEach((item) => {
      const el = stage.querySelector(item.sel);
      if (!el) return;
      el.style.gridArea = item.area;
      el.style.display = item.area ? "" : "none";
      el.textContent = item.label;
    });

    group.querySelectorAll(".btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const areaLines = cfg.areas.split('" "').map((a, i, arr) => {
      const clean = a.replace(/"/g, "").trim();
      return '    "' + clean + '"';
    });
    setCode(
      "s18",
      [
        cssBlock(".container", [
          ["display", "grid", "g"],
          ["grid-template-columns", cfg.cols, "g"],
          ["grid-template-rows", cfg.rows, "g"],
        ]) +
          "\n" +
          `  ${H.prop("grid-template-areas")}${H.x(":")} \n` +
          cfg.areas
            .split('" "')
            .map((a) => {
              const clean = a.replace(/"/g, "").trim();
              return `    ${H.x('"')}${H.g(clean)}${H.x('"')}`;
            })
            .join("\n") +
          H.x(";") +
          "\n" +
          H.x("}"),
        "",
        ...cfg.items
          .filter((i) => i.area)
          .map((i) => cssBlock("." + i.label, [["grid-area", i.area, "g"]])),
      ].join("\n"),
    );
  });
});

// init s18
setCode(
  "s18",
  [
    cssBlock(".container", [
      ["display", "grid", "g"],
      ["grid-template-columns", "150px 1fr", "g"],
      ["grid-template-rows", "50px 1fr 42px", "g"],
    ]),
    "",
    cssBlock(".header", [["grid-area", "header", "g"]]),
    cssBlock(".sidebar", [["grid-area", "sidebar", "g"]]),
    cssBlock(".main", [["grid-area", "main", "g"]]),
    cssBlock(".footer", [["grid-area", "footer", "g"]]),
  ].join("\n"),
);

/* ═══════════════════════════════════════════
   S19 — grid-column / grid-row span
═══════════════════════════════════════════ */
document.querySelectorAll('.ctrl-btns[data-type="gcol"]').forEach((group) => {
  group.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn");
    if (!btn) return;
    const item = document.getElementById("s19a");
    if (!item) return;
    item.style.gridColumn = btn.dataset.val;
    item.textContent = btn.dataset.val;
    group.querySelectorAll(".btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderS19Code();
  });
});

document.querySelectorAll('.ctrl-btns[data-type="grow19"]').forEach((group) => {
  group.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn");
    if (!btn) return;
    const item = document.getElementById("s19a");
    if (!item) return;
    item.style.gridRow = btn.dataset.val;
    group.querySelectorAll(".btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderS19Code();
  });
});

function renderS19Code() {
  const item = document.getElementById("s19a");
  const gc = item ? item.style.gridColumn || "span 2" : "span 2";
  const gr = item ? item.style.gridRow || "span 1" : "span 1";
  setCode(
    "s19",
    [
      cssBlock(".container", [
        ["display", "grid", "g"],
        ["grid-template-columns", "repeat(4, 1fr)", "g"],
        ["gap", "8px", "g"],
      ]),
      "",
      cssBlock(".item-a", [
        ["grid-column", gc, "g"],
        ["grid-row", gr, "g"],
      ]),
    ].join("\n"),
  );
}
renderS19Code();

/* ═══════════════════════════════════════════
   S23 — grid lines
═══════════════════════════════════════════ */
document.querySelectorAll('.ctrl-btns[data-type="glines"]').forEach((group) => {
  group.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn");
    if (!btn) return;
    const item = document.getElementById("s23a");
    if (!item) return;
    const val = btn.dataset.val.replace("/", " / ");
    item.style.gridColumn = val;
    item.textContent = "col " + btn.dataset.val;
    group.querySelectorAll(".btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderS23Code();
  });
});

function renderS23Code() {
  const item = document.getElementById("s23a");
  const gc = item ? item.style.gridColumn || "1 / 3" : "1 / 3";
  setCode(
    "s23",
    [
      cssBlock(".container", [
        ["display", "grid", "g"],
        ["grid-template-columns", "repeat(4, 1fr)", "g"],
        ["grid-template-rows", "repeat(3, 56px)", "g"],
        ["gap", "8px", "g"],
      ]),
      "",
      cssBlock(".item-a", [["grid-column", gc, "g"]]),
      cssBlock(".item-full", [["grid-column", "1 / -1", "g"]]),
      "",
      H.c("/* -1 = oxirgi chiziq (full width) */"),
    ].join("\n"),
  );
}
renderS23Code();

/* ═══════════════════════════════════════════
   S25 — real layout code (static)
═══════════════════════════════════════════ */
setCode(
  "s25",
  [
    H.c("/* 1. Grid — sahifa skeleti */"),
    cssBlock(".page", [
      ["display", "grid", "g"],
      [
        "grid-template-areas",
        '"header header" "sidebar main" "footer footer"',
        "g",
      ],
      ["grid-template-columns", "110px 1fr", "g"],
      ["grid-template-rows", "46px 1fr 38px", "g"],
      ["gap", "7px", "g"],
    ]),
    "",
    H.c("/* 2. Flex — nav ichida */"),
    cssBlock(".header", [
      ["display", "flex", "f"],
      ["align-items", "center", "f"],
      ["justify-content", "space-between", "f"],
    ]),
    "",
    H.c("/* 3. Grid — kartalar ichida */"),
    cssBlock(".cards", [
      ["display", "grid", "g"],
      ["grid-template-columns", "repeat(3, 1fr)", "g"],
      ["gap", "7px", "g"],
    ]),
  ].join("\n"),
);

/* ═══════════════════════════════════════════
   INTERSECTION OBSERVER — fade in sections
═══════════════════════════════════════════ */
const fadeObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.style.transition = "opacity .5s ease, transform .5s ease";
      en.target.style.opacity = "1";
      en.target.style.transform = "translateY(0)";
      fadeObs.unobserve(en.target);
    });
  },
  { rootMargin: "0px 0px -60px 0px" },
);

document.querySelectorAll(".ds").forEach((s) => {
  s.style.opacity = "0";
  s.style.transform = "translateY(16px)";
  fadeObs.observe(s);
});
