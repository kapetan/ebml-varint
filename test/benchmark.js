var Benchmark = require('benchmark');

var varint = require('../');
var warint = require('../wasm');


// wasm(function(err, warint) {
//   if(err) throw err;

  var suite = new Benchmark.Suite();

  suite
    .add('js - one byte', function() {
      varint.encode(1);
    })
    .add('wasm - one byte', function() {
      warint.encode(1);
    })
    .add('js - six bytes', function() {
      varint.encode(0b000000010000000100000010000000010000000100000010);
    })
    .add('wasm - six bytes', function() {
      warint.encode(0b000000010000000100000010000000010000000100000010);
    })
    .on('cycle', function(event) {
      console.log(String(event.target));
    })
    .on('complete', function() {
      console.log('Fastest is ' + this.filter('fastest').map('name'));
    })
    .run();
// });
