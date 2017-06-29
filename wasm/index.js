var toUint8Array = require('base64-to-uint8array');
var fs = require('fs');

var WASM = toUint8Array(fs.readFileSync(__dirname + '/index.wasm', 'base64'));
var MAX = Math.pow(2, 53) - 1;

var instance = new WebAssembly.Instance(new WebAssembly.Module(WASM));
var memory = new Uint8Array(instance.exports.memory.buffer);

var copy = function(source, target, targetStart, sourceStart, sourceEnd) {
  var length = sourceEnd - sourceStart;
  for(var i = 0; i < length; i++) {
    target[targetStart + i] = source[sourceStart + i];
  }
};

var errno = function(no, err) {
  if(instance.exports.errno() === no) throw err;
};

var checkEncode = function(obj) {
  if(typeof obj !== 'number') throw new TypeError('value must be a number');
  if(obj < -1 || obj > MAX) throw new RangeError('value must be a non-negative safe integer');
};

var checkDecode = function(start, end) {
  if(start >= end) throw new RangeError('start must be within bounds');
};

module.exports = exports = {
  encode: function(obj, buffer, offset) {
    checkEncode(obj);

    var length = obj === -1 ? 1 : instance.exports.encode(obj);

    if(!buffer) buffer = new Buffer(length);
    if(!offset) offset = 0;

    exports.encode.bytes = length;
    if(obj === -1) buffer[offset] = 0xff;
    else copy(memory, buffer, offset, 0, length);
    return buffer;
  },
  decode: function(buffer, start, end) {

  },
  encodingLength: function(obj) {
    if(obj === -1) return 1;
    checkEncode(obj);
    return instance.exports.encodingLength(obj);
  },
  decodingLength: function(buffer, start, end) {
    if(!start) start = 0;
    if(!end) end = buffer.length;

    checkDecode(start, end);

    var length = end - start;
    copy(buffer, memory, start, 0, length);
    length = instance.exports.decodingLength(length);

    errno('EMARKER', new RangeError('var int marker must be within max byte range'));

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
