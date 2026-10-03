import assert from "node:assert/strict";
import { test } from "node:test";
import { contrastRatio, DEFAULT_THEME, inkIsReadable, isHexColor, themeCss } from "./theme";

test("isHexColor aceita só #rrggbb", () => {
  assert.equal(isHexColor("#96c82d"), true);
  assert.equal(isHexColor("#02314B"), true);
  for (const bad of ["#fff", "red", "96c82d", "#12345g", ""]) assert.equal(isHexColor(bad), false, bad);
});

test("contrastRatio segue a fórmula do WCAG", () => {
  assert.equal(contrastRatio("#000000", "#ffffff").toFixed(1), "21.0");
  assert.equal(contrastRatio("#ffffff", "#ffffff").toFixed(1), "1.0");
});

test("a cor secundária precisa ser escura o bastante para texto sobre branco", () => {
  assert.equal(inkIsReadable(DEFAULT_THEME.inkColor), true);
  assert.equal(inkIsReadable("#000000"), true);
  assert.equal(inkIsReadable("#96c82d"), false); // verde claro não serve como cor de texto
  assert.equal(inkIsReadable("#ffeb3b"), false);
});

test("o texto sobre a cor principal é escuro em cores claras e branco em cores escuras", () => {
  assert.match(themeCss(DEFAULT_THEME), /--color-on-brand: #02314b/);
  assert.match(themeCss({ brandColor: "#1d4ed8", inkColor: "#02314b" }), /--color-on-brand: #ffffff/);
});

test("themeCss gera as variáveis da marca e os tons derivados", () => {
  const css = themeCss({ brandColor: "#e11d48", inkColor: "#111827" });
  assert.match(css, /--color-brand: #e11d48/);
  assert.match(css, /--color-ink: #111827/);
  assert.match(css, /--color-brand-dark: color-mix/);
  assert.match(css, /--color-ink-dark: color-mix/);
});

test("cores inválidas caem no tema padrão", () => {
  assert.match(themeCss({ brandColor: "verde", inkColor: "#zzz" }), /--color-brand: #96c82d/);
});
