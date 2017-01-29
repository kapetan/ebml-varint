# ebml-varint

Encode and decode EBML variable sized integers.

	npm install ebml-varint

# Usage

The interfaces exposes the two methods `encode(num, [buffer], [offset])` and `decode(buffer, [start], [end])` for converting a number from and to a buffer. Additionally the method `encodingLength(num)` returns the number of bytes required to encode a given integer, and `decodingLength(buffer, [start], [end])` returns the number of bytes the integer occupies in the buffer.

```javascript
var varint = require('ebml-varint');

var buffer = varint.encode(256); // Returns a buffer with two bytes [0x41, 0x00]
var num = varint.decode(buffer); // Returns the number 256

varint.encodingLength(256); // Returns two
varint.decodingLength(buffer); // Also returns two
```

Note that Javascript can only accurately represent integers up to `2^53 - 1`, the encode method will throw an error if trying to encode an integer bigger than that.
