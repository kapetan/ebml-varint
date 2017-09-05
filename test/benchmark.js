var Benchmark = require('benchmark');

var varint = require('../');
var warint = require('../wasm');

var suite = function(name, fn) {
  var suite = new Benchmark.Suite(name);

  suite
    .add('js', fn(varint))
    .add('wasm', fn(warint))
    .on('start', function() {
      console.log('#', name);
    })
    .on('cycle', function(event) {
      console.log(String(event.target));
    })
    .on('complete', function() {
      console.log('Fastest is ' + this.filter('fastest').map('name'));
    })
    .run();
};

suite('encode six bytes', function(varint) {
  return () => varint.encode(0b000000010000000100000010000000010000000100000010);
});

suite('encode one bytes', function(varint) {
  return () => varint.encode(1);
});

suite('decode six bytes', function(varint) {
  var buffer = new Buffer([
    0b00000101, 0b00000001, 0b00000010,
    0b00000001, 0b00000001, 0b00000010
  ]);

  return () => varint.decode(buffer);
});

suite('decode one byte', function(varint) {
  var buffer = new Buffer([0b10000001]);

  return () => varint.decode(buffer);
});

suite('encoding length six bytes', function(varint) {
  return () => varint.encodingLength(0b000000010000000100000010000000010000000100000010);
});

suite('encoding length one byte', function(varint) {
  return () => varint.encodingLength(1);
});

suite('decoding length six bytes', function(varint) {
  var buffer = new Buffer([
    0b00000101, 0b00000001, 0b00000010,
    0b00000001, 0b00000001, 0b00000010
  ]);

  return () => varint.decodingLength(buffer);
});

suite('decoding length one byte', function(varint) {
  var buffer = new Buffer([0b10000001]);

  return () => varint.decodingLength(buffer);
});
