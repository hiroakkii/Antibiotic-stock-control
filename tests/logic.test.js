// 実行: node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../js/logic.js');

const d = (s) => L.parseDate(s);
const fmt = (x) => L.formatDate(x);

test('仕様の例: 2026/10/29 処方・有効期限2年', () => {
  const t = L.thresholds(d('2026/10/29'), 24);
  assert.equal(fmt(t.yellow), '2027/10/29');
  assert.equal(fmt(t.red), '2028/10/29');
});

test('色の切り替わりは当日から', () => {
  const p = d('2026/10/29');
  assert.equal(L.statusOf(p, 24, d('2027/10/28')), 'green');
  assert.equal(L.statusOf(p, 24, d('2027/10/29')), 'yellow');
  assert.equal(L.statusOf(p, 24, d('2028/10/28')), 'yellow');
  assert.equal(L.statusOf(p, 24, d('2028/10/29')), 'red');
  assert.equal(L.statusOf(p, 24, d('2030/01/01')), 'red');
});

test('うるう日の処方は月末に丸める', () => {
  const t = L.thresholds(d('2028/02/29'), 24);
  assert.equal(fmt(t.yellow), '2029/02/28');
  assert.equal(fmt(t.red), '2030/02/28');
});

test('奇数月は日数の半分で黄色', () => {
  const t = L.thresholds(d('2026/01/01'), 3); // 赤 2026/04/01, 90日 → 45日後
  assert.equal(fmt(t.red), '2026/04/01');
  assert.equal(fmt(t.yellow), '2026/02/15');
});

test('経過期間の表示', () => {
  assert.equal(L.elapsedText(d('2026/10/29'), d('2026/10/29')), '0日');
  assert.equal(L.elapsedText(d('2026/10/29'), d('2027/10/29')), '1年');
  assert.equal(L.elapsedText(d('2026/10/29'), d('2028/01/02')), '1年2ヶ月4日');
  assert.equal(L.elapsedText(d('2026/01/31'), d('2026/03/01')), '1ヶ月1日');
});

test('不正な日付は null', () => {
  assert.equal(L.parseDate('2026/02/30'), null);
  assert.equal(L.parseDate('abc'), null);
  assert.equal(fmt(L.parseDate('2026-10-29')), '2026/10/29');
});
