var MAX = Math.pow(2, 53) - 1;

var encodingLength = function(obj, escape) {
  if(typeof obj !== 'number') throw new TypeError('value must be a number');
  if(obj < 0 || obj > MAX) throw new RangeError('value must be a non-negative safe integer');

  var length = 8;

  for(var i = 1; i <= 7; i++) {
    if(obj < Math.pow(2, 7 * i)) {
      length = i;
      break;
    }
  }

  if(escape && obj === Math.pow(2, 7 * length) - 1) length++;
  return length;
};

var decodingLength = function(buffer, start, end) {
  if(!start) start = 0;
  if(!end) end = buffer.length;

  if(start >= end) throw new RangeError('start must be within bounds');

  var length = 1;

  for(var i = start; i < end; i++) {
    var b = buffer[i];

    if(!b) length += 8;
    else {
      for(var j = 0; j < 8; j++) {
        if((b << j) & 0x80) return j + length;
      }
    }
  }

  throw new RangeError('var int marker must be within max byte range');
};

module.exports = exports = {
  encode: function(obj, buffer, offset, escape) {
    var length = encodingLength(obj, escape);

    if(!buffer) buffer = new Buffer(length);
    if(!offset) offset = 0;

    exports.encode.bytes = length;

    var marker = Math.floor((length - 1) / 8);

    for(var i = length - 1, mul = 1; i >= 0; i--, mul *= 0x100) {
      var b = Math.floor(obj / mul);
      if(i === marker) b = b | (0x80 >> (length - 1));
      buffer[offset + i] = b;
    }

    return buffer;
  },
  decode: function(buffer, start, end) {
    if(!start) start = 0;
    if(!end) end = buffer.length;

    var length = decodingLength(buffer, start, end);
    if(start + length > end) throw new RangeError('var int length must be within bounds');

    exports.decode.bytes = length;

    var n = 0;
    var marker = Math.floor((length - 1) / 8);

    for(var i = length - 1, mul = 1; i >= marker; i--, mul *= 0x100) {
      var b = buffer[start + i];
      if(i === marker) b = b ^ (0x80 >> ((length - 1) % 8));
      n += b * mul;
    }

    return n;
  },
  encodingLength: encodingLength,
  decodingLength: decodingLength
};
