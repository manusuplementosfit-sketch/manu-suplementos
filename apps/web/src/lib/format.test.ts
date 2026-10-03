import assert from "node:assert/strict";
import { test } from "node:test";
import { parseBRL } from "./format";

test('parseBRL entende milhar com ponto ("5.000" é cinco mil)', () => {
  assert.equal(parseBRL("5.000"), 500000);
  assert.equal(parseBRL("1.250.000"), 125000000);
});

test("parseBRL entende vírgula decimal e números simples", () => {
  assert.equal(parseBRL("5.000,00"), 500000);
  assert.equal(parseBRL("1.299,90"), 129990);
  assert.equal(parseBRL("149,9"), 14990);
  assert.equal(parseBRL("5000"), 500000);
  assert.equal(parseBRL("80"), 8000);
});

test("parseBRL continua aceitando ponto decimal", () => {
  assert.equal(parseBRL("149.9"), 14990);
  assert.equal(parseBRL("89.90"), 8990);
});

test("parseBRL devolve null para vazio ou texto", () => {
  assert.equal(parseBRL(""), null);
  assert.equal(parseBRL("abc"), null);
});
