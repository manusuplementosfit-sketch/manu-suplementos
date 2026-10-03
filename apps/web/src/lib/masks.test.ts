import assert from "node:assert/strict";
import { test } from "node:test";
import { parseBRL } from "./format";
import { maskMoney, maskPhone } from "./masks";

test("maskMoney preenche da direita para a esquerda, como em app de banco", () => {
  assert.equal(maskMoney("1"), "R$ 0,01");
  assert.equal(maskMoney("15"), "R$ 0,15");
  assert.equal(maskMoney("150"), "R$ 1,50");
  assert.equal(maskMoney("1500"), "R$ 15,00");
  assert.equal(maskMoney("500000"), "R$ 5.000,00");
  assert.equal(maskMoney("123456789"), "R$ 1.234.567,89");
});

test("maskMoney aceita texto já formatado ou vindo do banco e ignora letras", () => {
  assert.equal(maskMoney("5000,00"), "R$ 5.000,00");
  assert.equal(maskMoney("R$ 1.299,90"), "R$ 1.299,90");
  assert.equal(maskMoney("0,00"), "R$ 0,00");
  assert.equal(maskMoney("R$ 12,3a4"), "R$ 12,34");
});

test("maskMoney sem números fica vazio (campo opcional continua em branco)", () => {
  assert.equal(maskMoney(""), "");
  assert.equal(maskMoney("R$ "), "");
});

test("o valor mascarado é lido corretamente ao salvar", () => {
  assert.equal(parseBRL(maskMoney("500000")), 500000);
  assert.equal(parseBRL(maskMoney("14990")), 14990);
});

test("maskPhone formata celular e fixo com DDD", () => {
  assert.equal(maskPhone("88999990000"), "(88) 99999-0000");
  assert.equal(maskPhone("8833334444"), "(88) 3333-4444");
});

test("maskPhone formata enquanto a pessoa digita", () => {
  assert.equal(maskPhone("8"), "(8");
  assert.equal(maskPhone("88"), "(88");
  assert.equal(maskPhone("889"), "(88) 9");
  assert.equal(maskPhone("8899999"), "(88) 9999-9");
  assert.equal(maskPhone(""), "");
});

test("maskPhone limita a 11 números e ignora o resto", () => {
  assert.equal(maskPhone("(88) 99999-00001234"), "(88) 99999-0000");
  assert.equal(maskPhone("abc88999990000"), "(88) 99999-0000");
});
