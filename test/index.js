var test = require('tape');

// var varint = require('../');
var varint = require('../wasm');

var buffer = function() {
  var args = Array.prototype.slice.call(arguments);
  return new Buffer(args);
};

test('zero value', function(t) {
  var result = varint.encode(0);

  t.deepEquals(result, buffer(0b10000000));
  t.equals(varint.encode.bytes, 1);

  result = varint.decode(result);

  t.equals(result, 0);
  t.equals(varint.decode.bytes, 1);

  t.end();
});

test('two byte int', function(t) {
  var result = varint.encode(0b0000000100000010);

  t.deepEquals(result, buffer(0b01000001, 0b00000010));
  t.equals(varint.encode.bytes, 2);

  result = varint.decode(result);

  t.equals(result, 0b0000000100000010);
  t.equals(varint.decode.bytes, 2);

  t.end();
});

test('three byte int', function(t) {
  var result = varint.encode(0b000000010000000100000010);

  t.deepEquals(result, buffer(0b00100001, 0b00000001, 0b00000010));
  t.equals(varint.encode.bytes, 3);

  result = varint.decode(result);

  t.equals(result, 0b000000010000000100000010);
  t.equals(varint.decode.bytes, 3);

  t.end();
});

test('six byte int', function(t) {
  var result = varint.encode(0b000000010000000100000010000000010000000100000010);

  t.deepEquals(result, buffer(
    0b00000101, 0b00000001, 0b00000010,
    0b00000001, 0b00000001, 0b00000010));
  t.equals(varint.encode.bytes, 6);

  result = varint.decode(result);

  t.equals(result, 0b000000010000000100000010000000010000000100000010);
  t.equals(varint.decode.bytes, 6);

  t.end();
});

test('eight byte int', function(t) {
  var i = Math.pow(2, 53) - 1;
  var result = varint.encode(i);

  t.deepEquals(result, buffer(
    0b00000001, 0b00011111, 0b11111111, 0b11111111,
    0b11111111, 0b11111111, 0b11111111, 0b11111111));
  t.equals(varint.encode.bytes, 8);

  result = varint.decode(result);

  t.equals(result, i);
  t.equals(varint.decode.bytes, 8);

  t.end();
});

test('minus one value', function(t) {
  var result = varint.encode(-1);

  t.deepEquals(result, buffer(0b11111111));
  t.equals(varint.encode.bytes, 1);

  result = varint.decode(result);

  t.equals(result, -1);
  t.equals(varint.decode.bytes, 1);

  t.end();
});

test('all ones', function(t) {
  var i = Math.pow(2, 14) - 1;
  var result = varint.encode(i);

  t.deepEquals(result, buffer(0b00100000, 0b00111111, 0b11111111));
  t.equals(varint.encode.bytes, 3);

  result = varint.decode(result);

  t.equals(result, i);
  t.equals(varint.decode.bytes, 3);

  t.end();
});

test('encode big int', function(t) {
  t.throws(function() {
    varint.encode(Math.pow(2, 53));
  }, /RangeError/);

  t.end();
});

test('decode invalid marker', function(t) {
  t.throws(function() {
    varint.decode(buffer(0));
  }, /RangeError/);

  t.end();
});

test('decode zero-padded int', function(t) {
  var result = varint.decode(buffer(
    0b00000000, 0b01000000, 0b00000000, 0b00011111,
    0b11111111, 0b11111111, 0b11111111, 0b11111111,
    0b11111111, 0b11111111
  ));

  t.equals(result, Math.pow(2, 53) - 1);
  t.equals(varint.decode.bytes, 10);

  t.end();
});

test('decode eight byte all ones', function(t) {
  var result = varint.decode(buffer(
    0b00000001, 0b11111111, 0b11111111, 0b11111111,
    0b11111111, 0b11111111, 0b11111111, 0b11111111
  ));

  t.equals(result, -1);
  t.equals(varint.decode.bytes, 8);

  t.end();
});

test('decode ten byte all ones', function(t) {
  var result = varint.decode(buffer(
    0b00000000, 0b01111111, 0b11111111, 0b11111111,
    0b11111111, 0b11111111, 0b11111111, 0b11111111,
    0b11111111, 0b11111111
  ));

  t.equals(result, -1);
  t.equals(varint.decode.bytes, 10);

  t.end();
});
