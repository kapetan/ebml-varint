var test = require('tape');

var varint = require('../');
// var varint = require('../wasm');

var buffer = function() {
  var args = Array.prototype.slice.call(arguments);
  return new Buffer(args);
};

test('zero value', function(t) {
  var i = 0;
  var buf = buffer(0b10000000);
  var result = varint.encode(i);

  t.deepEquals(result, buf);
  t.equals(varint.encode.bytes, 1);
  t.equals(varint.encodingLength(i), 1);

  result = varint.decode(result);

  t.equals(result, i);
  t.equals(varint.decode.bytes, 1);
  t.equals(varint.decodingLength(buf), 1);

  t.end();
});

test('two byte int', function(t) {
  var i = 0b0000000100000010;
  var buf = buffer(0b01000001, 0b00000010);
  var result = varint.encode(i);

  t.deepEquals(result, buf);
  t.equals(varint.encode.bytes, 2);
  t.equals(varint.encodingLength(i), 2);

  result = varint.decode(result);

  t.equals(result, i);
  t.equals(varint.decode.bytes, 2);
  t.equals(varint.decodingLength(buf), 2);

  t.end();
});

test('three byte int', function(t) {
  var i = 0b000000010000000100000010;
  var buf = buffer(0b00100001, 0b00000001, 0b00000010);
  var result = varint.encode(i);

  t.deepEquals(result, buf);
  t.equals(varint.encode.bytes, 3);
  t.equals(varint.encodingLength(i), 3);

  result = varint.decode(result);

  t.equals(result, i);
  t.equals(varint.decode.bytes, 3);
  t.equals(varint.decodingLength(buf), 3);

  t.end();
});

test('six byte int', function(t) {
  var i = 0b000000010000000100000010000000010000000100000010;
  var buf = buffer(
    0b00000101, 0b00000001, 0b00000010,
    0b00000001, 0b00000001, 0b00000010);

  var result = varint.encode(i);

  t.deepEquals(result, buf);
  t.equals(varint.encode.bytes, 6);
  t.equals(varint.encodingLength(i), 6);

  result = varint.decode(result);

  t.equals(result, i);
  t.equals(varint.decode.bytes, 6);
  t.equals(varint.decodingLength(buf), 6);

  t.end();
});

test('eight byte int', function(t) {
  var i = Math.pow(2, 53) - 1;
  var buf = buffer(
    0b00000001, 0b00011111, 0b11111111, 0b11111111,
    0b11111111, 0b11111111, 0b11111111, 0b11111111);

  var result = varint.encode(i);

  t.deepEquals(result, buf);
  t.equals(varint.encode.bytes, 8);
  t.equals(varint.encodingLength(i), 8);

  result = varint.decode(result);

  t.equals(result, i);
  t.equals(varint.decode.bytes, 8);
  t.equals(varint.decodingLength(buf), 8);

  t.end();
});

test('all ones', function(t) {
  var i = Math.pow(2, 14) - 1;
  var buf = buffer(0b01111111, 0b11111111);
  var result = varint.encode(i);

  t.deepEquals(result, buf);
  t.equals(varint.encode.bytes, 2);
  t.equals(varint.encodingLength(i), 2);

  result = varint.decode(result);

  t.equals(result, i);
  t.equals(varint.decode.bytes, 2);
  t.equals(varint.decodingLength(buf), 2);

  t.end();
});

test('with offset', function(t) {
  var i = 0b0000000100000010;
  var buf = buffer(0b00000000, 0b01000001, 0b00000010, 0b00000000);
  var result = varint.encode(i, Buffer.alloc(4), 1);

  t.deepEquals(result, buf);
  t.equals(varint.encode.bytes, 2);

  result = varint.decode(buf, 1);

  t.equals(result, i);
  t.equals(varint.decode.bytes, 2);
  t.equals(varint.decodingLength(buf, 1), 2);

  t.end();
});

test('minus one value', function(t) {
  t.throws(function() {
    varint.encode(-1);
  }, /RangeError/);

  t.throws(function() {
    varint.encodingLength(-1);
  }, /RangeError/);

  t.end();
});

test('encode big int', function(t) {
  t.throws(function() {
    varint.encode(Math.pow(2, 53));
  }, /RangeError/);

  t.throws(function() {
    varint.encodingLength(Math.pow(2, 53));
  }, /RangeError/);

  t.end();
});

test('decode invalid marker', function(t) {
  t.throws(function() {
    varint.decode(buffer(0));
  }, /RangeError/);

  t.throws(function() {
    varint.decodingLength(buffer(0));
  }, /RangeError/);

  t.end();
});

test('decode zero-padded int', function(t) {
  var buf = buffer(
    0b00000000, 0b01000000, 0b00000000, 0b00011111,
    0b11111111, 0b11111111, 0b11111111, 0b11111111,
    0b11111111, 0b11111111
  );

  var result = varint.decode(buf);

  t.equals(result, Math.pow(2, 53) - 1);
  t.equals(varint.decode.bytes, 10);
  t.equals(varint.decodingLength(buf), 10);

  t.end();
});

// test('decode eight byte all ones', function(t) {
//   var result = varint.decode(buffer(
//     0b00000001, 0b11111111, 0b11111111, 0b11111111,
//     0b11111111, 0b11111111, 0b11111111, 0b11111111
//   ));

//   t.equals(result, -1);
//   t.equals(varint.decode.bytes, 8);

//   t.end();
// });

// test('decode ten byte all ones', function(t) {
//   var result = varint.decode(buffer(
//     0b00000000, 0b01111111, 0b11111111, 0b11111111,
//     0b11111111, 0b11111111, 0b11111111, 0b11111111,
//     0b11111111, 0b11111111
//   ));

//   t.equals(result, -1);
//   t.equals(varint.decode.bytes, 10);

//   t.end();
// });
