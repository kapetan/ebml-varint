var toUint8Array = require('base64-to-uint8array');
var fs = require('fs');

var WASM = toUint8Array(fs.readFileSync(__dirname + '/index.wasm', 'base64'));
var MAX = Math.pow(2, 53) - 1;
var PADDING = 9;

var instance = new WebAssembly.Instance(new WebAssembly.Module(WASM), {
  console: { log: function(i) { console.log('wasm:', i) } }
});
var memory = new Uint8Array(instance.exports.memory.buffer);

var copy = function(source, target, targetStart, sourceStart, length, pad) {
  var len = length + (pad ? PADDING : 0);
  for(var i = 0; i < len; i++) {
    target[targetStart + i] = i < length ? source[sourceStart - i] : 0;
  }
};

var checkEncode = function(obj) {
  if(typeof obj !== 'number') throw new TypeError('value must be a number');
  if(obj < 0 || obj > MAX) throw new RangeError('value must be a non-negative safe integer');
};

var checkDecode = function(start, end) {
  if(start >= end) throw new RangeError('start must be within bounds');
};

var checkErrno = function() {
  var errno = instance.exports.errno();
  if(errno === instance.exports.EMARKER) throw new RangeError('var int marker must be within max byte range');
  if(errno === instance.exports.ELENGTH) throw new RangeError('var int length must be within bounds');
};

module.exports = exports = {
  encode: function(obj, buffer, offset, escape) {
    checkEncode(obj);

    var length = instance.exports.encode(obj, escape ? 1 : 0);

    if(!buffer) buffer = new Buffer(length);
    if(!offset) offset = 0;

    exports.encode.bytes = length;
    copy(memory, buffer, offset, length - 1, length, false);
    return buffer;
  },
  decode: function(buffer, start, end) {
    if(!start) start = 0;
    if(!end) end = buffer.length;

    checkDecode(start, end);

    var length = end - start;
    copy(buffer, memory, 0, end - 1, length, true);
    var n = instance.exports.decode(length - 1);
    exports.decode.bytes = instance.exports.decodingLength(length - 1);

    checkErrno();
    return n;
  },
  encodingLength: function(obj, escape) {
    checkEncode(obj);
    return instance.exports.encodingLength(obj, escape ? 1 : 0);
  },
  decodingLength: function(buffer, start, end) {
    if(!start) start = 0;
    if(!end) end = buffer.length;

    checkDecode(start, end);

    var length = end - start;
    copy(buffer, memory, 0, end - 1, length, true);
    length = instance.exports.decodingLength(length - 1);

    checkErrno();
    return length;
  }
};

// module.exports = function(cb) {
//   var supported = typeof WebAssembly !== 'undefined';
//   if(!supported) return cb(new Error('WebAssembly not supported'));

//   WebAssembly.instantiate(WASM)
//     .then(function(w) {
//       var memory = new Uint8Array(w.instance.exports.memory.buffer);

//       cb(null, {
//         encode: function(obj, buffer, offset) {
//           var length = w.instance.exports.encode(obj);

//           if(!buffer) buffer = new Buffer(length);
//           if(!offset) offset = 0;

//           copy(memory, buffer, offset, length);
//           return buffer;
//         },
//         decode: function(buffer, start, end) {

//         },
//         encodingLength: function(obj) {
//           return w.instance.exports.encodingLength(obj);
//         },
//         decodingLength: function(buffer, start, end) {

//         }
//       });
//     })
//     .catch(cb);
// };
