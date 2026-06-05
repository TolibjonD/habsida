/* ═══════════════════════════════════════════
   FLEX CONTROLLER
═══════════════════════════════════════════ */
const flex = {
  state: {
    direction: "row",
    justify: "flex-start",
    align: "stretch",
    wrap: "nowrap",
  },

  stage: document.getElementById("flex-stage"),
  code: document.getElementById("flex-code"),

  apply() {
    const s = this.stage.style;
    s.flexDirection = this.state.direction;
    s.justifyContent = this.state.justify;
    s.alignItems = this.state.align;
    s.flexWrap = this.state.wrap;
    this.renderCode();
  },

  renderCode() {
    const { direction, justify, align, wrap } = this.state;
    const isCol = direction.startsWith("column");

    this.code.innerHTML = [
      tag("t-selector", ".container") + tag("t-punct", " {"),
      `  ${prop("display")}${val("flex", "flex")}${punc(";")}`,
      `  ${prop("flex-direction")}${val(direction, "flex")}${punc(";")}`,
      `  ${prop(isCol ? "align-items" : "justify-content")}${val(justify, "flex")}${punc(";")}`,
      `  ${prop(isCol ? "justify-content" : "align-items")}${val(align, "flex")}${punc(";")}`,
      `  ${prop("flex-wrap")}${val(wrap, "flex")}${punc(";")}`,
      tag("t-punct", "}"),
    ].join("\n");
  },
};

/* ═══════════════════════════════════════════
   GRID CONTROLLER
═══════════════════════════════════════════ */
const grid = {
  state: {
    cols: "repeat(3, 1fr)",
    gap: "8px",
    span: "1",
    galign: "stretch",
  },

  stage: document.getElementById("grid-stage"),
  code: document.getElementById("grid-code"),

  apply() {
    const s = this.stage.style;
    s.gridTemplateColumns = this.state.cols;
    s.gap = this.state.gap;
    s.alignItems = this.state.galign;

    const firstBox = this.stage.querySelector(".box--grid");
    if (firstBox) {
      firstBox.style.gridColumn =
        this.state.span === "1" ? "" : `span ${this.state.span}`;
    }

    this.renderCode();
  },

  renderCode() {
    const { cols, gap, span, galign } = this.state;

    this.code.innerHTML = [
      tag("t-selector", ".container") + tag("t-punct", " {"),
      `  ${prop("display")}${val("grid", "grid")}${punc(";")}`,
      `  ${prop("grid-template-columns")}${val(cols, "grid")}${punc(";")}`,
      `  ${prop("gap")}${val(gap, "grid")}${punc(";")}`,
      `  ${prop("align-items")}${val(galign, "grid")}${punc(";")}`,
      tag("t-punct", "}"),
      "",
      tag("t-selector", ".item--first") + tag("t-punct", " {"),
      `  ${prop("grid-column")}${val("span " + span, "grid")}${punc(";")}`,
      tag("t-punct", "}"),
    ].join("\n");
  },
};

/* ═══════════════════════════════════════════
   CODE HELPERS
═══════════════════════════════════════════ */
function tag(cls, text) {
  return `<span class="${cls}">${text}</span>`;
}
function prop(name) {
  return tag("t-prop", name) + tag("t-punct", ": ");
}
function punc(char) {
  return tag("t-punct", char);
}
function val(value, type) {
  const cls = type === "grid" ? "t-val-grid" : "t-val-flex";
  return tag(cls, value);
}

/* ═══════════════════════════════════════════
   EVENT DELEGATION — single listener per section
═══════════════════════════════════════════ */
document.getElementById("flex-controls").addEventListener("click", (e) => {
  const btn = e.target.closest(".btn");
  if (!btn) return;

  const { prop: p, val: v } = btn.dataset;
  if (!p || !v) return;

  flex.state[p] = v;
  flex.apply();

  syncActive(btn, "btn--flex");
});

document.getElementById("grid-controls").addEventListener("click", (e) => {
  const btn = e.target.closest(".btn");
  if (!btn) return;

  const { prop: p, val: v } = btn.dataset;
  if (!p || !v) return;

  grid.state[p] = v;
  grid.apply();

  syncActive(btn, "btn--grid");
});

/* ═══════════════════════════════════════════
   SYNC ACTIVE BUTTON STATE
═══════════════════════════════════════════ */
function syncActive(clickedBtn, btnClass) {
  const group = clickedBtn.closest(".control-group__btns");
  if (!group) return;
  group
    .querySelectorAll(`.${btnClass}`)
    .forEach((b) => b.classList.remove("active"));
  clickedBtn.classList.add("active");
}

/* ═══════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */
flex.apply();
grid.apply();
