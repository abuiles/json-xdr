# JSON <-> XDR

[![Build Status](https://travis-ci.org/abuiles/json-xdr.svg?branch=master)](https://travis-ci.org/abuiles/json-xdr)

This library extends [js-xdr](https://github.com/stellar/js-xdr) to let you convert XDR to JSON and JSON to XDR.

## Installation

via npm:

```shell
npm install --save json-xdr
```

## Usage

The examples below will use the following XDR definition:

``` javascript
const XDR = require('js-xdr')

const types = XDR.config((xdr) => {
  xdr.typedef("Hash", xdr.opaque(2));
  xdr.typedef('Int32', xdr.int());

  xdr.struct("Price", [
    ["n", xdr.lookup("Int32")],
    ["d", xdr.lookup("Int32")],
  ]);

  xdr.enum("MemoType", {
      memoNone: 0,
      memoText: 1,
      memoId: 2,
      memoHash: 3,
      memoReturn: 4,
  });

  xdr.union("Memo", {
    switchOn: xdr.lookup("MemoType"),
    switchName: "type",
    switches: [
      ["memoNone", xdr.void()],
      ["memoText", "text"],
      ["memoId", "id"]
    ],
    arms: {
      text: xdr.string(28),
      id: xdr.lookup("Int32")
    },
  });

  xdr.typedef('CounterInt', xdr.option(xdr.int()));

  xdr.struct('Event', [
    ["attendees", xdr.int()],
    ["eventName", xdr.string(50)],
    ["secretSpeakers", xdr.array(xdr.lookup("Hash"), 2)],
    ["speakers", xdr.varArray(xdr.string())],
    ["price", xdr.lookup("Price")],
    ["memo", xdr.lookup("Memo")],
    ['meta', xdr.lookup('TransactionMeta')],
    ['counter', xdr.lookup("CounterInt")]
  ])

  xdr.enum("TransactionMetaType", {
    none: 0,
    paid: 1
  });

  xdr.union("TransactionMeta", {
    switchOn: xdr.lookup("TransactionMetaType"),
    switches: [
      ["none", xdr.void()],
      ["paid", "price"]
    ],
    arms: {
      price: xdr.lookup("Price")
    },
    defaultArm: xdr.void()
  });
})
```

### Serializing from XDR to JSON


You can convert an XDR struct to JSON using the function `toJSON`.


``` javascript
import { toJSON } from 'json-xdr';

let event = new types.Event({
  attendees: 5,
  eventName: "Lumenauts get together",
  secretSpeakers: [Buffer.from([0, 0]), Buffer.from([0, 1])],
  speakers: ['Jed', 'Tom', 'Zac'],
  price: new types.Price({
    n: 2,
    d: 1
  }),
  memo: types.Memo.memoText("foo"),
  meta: types.TransactionMeta.paid(new types.Price({
    n: 2,
    d: 1
  })),
  counter: 2
})

let payload = toJSON(event);

console.log(payload)

// Output
// {
//   "attendees": 5,
//   "eventName": "Lumenauts get together",
//   "secretSpeakers": [
//     "AAA=",
//     "AAE="
//   ],
//   "speakers": [
//     "Jed",
//     "Tom",
//     "Zac"
//   ],
//   "price": {
//     "n": 2,
//     "d": 1
//   },
//   "memo": {
//     "_type": "memoText",
//     "text": "foo"
//   },
//   "meta": {
//     "_type": "paid",
//     "price": {
//       "n": 2,
//       "d": 1
//     }
//   },
//   "counter": 2
// }
```

### Serializing from JSON to XDR

Given a JSON object representing a struct from your types definition, you can convert it to XDR using the function `toXDR`.

``` javascript
import { toXDR } from 'json-xdr';

let payload = {
  "attendees": 5,
  "eventName": "Lumenauts get together",
  "secretSpeakers": [
    "AAA=",
    "AAE="
  ],
  "speakers": [
    "Jed",
    "Tom",
    "Zac"
  ],
  "price": {
    "n": 2,
    "d": 1
  },
  "memo": {
    "_type": "memoText",
    "text": "foo"
  },
  "meta": {
    "_type": "paid",
    "price": {
      "n": 2,
      "d": 1
    }
  },
  "counter": 2
}

let event = toXDR(types.Event, payload)

assert.ok(xdrEvent instanceof types.Event)
```

## Serialization format

JavaScript native types are used when possible, for example, `String`,
`Integer`, `Array` and `null`. However there are some types which
don't have an equivalent representation. For those types the
serialization and deserialization is done using the following rules.

### Opaque and VarOpaque

Opaque and Variable Opaque data are represented in `js-xdr` using a binary data buffer. Buffers are serializer as a `base64` encoded string.

For the following definition:

``` javascript
const types = XDR.config((xdr) => {
  xdr.struct('withOpaque', [
    ['opaque', xdr.opaque(3)],
    ['varOpaque', xdr.varOpaque(2)]
  ])
})

let withOpaque = new types.withOpaque({
  opaque: Buffer.from([0, 0, 1]),
  varOpaque: Buffer.from([0, 1])
})
```

Calling `#toJSON` will result in:

``` javascript
{
  opaque: 'AAAB',
  varOpaque: 'AAE='
}
```

### Array

`Array` and `VarArray` are serialized as a JavaScript Arrays and then for each element we
apply the serialization rules defined in this library.

For the following definition:


``` javascript
const types = XDR.config((xdr) => {
  xdr.typedef("Hash", xdr.opaque(2));

  xdr.struct('Event', [
    ["attendees", xdr.int()],
    ["eventName", xdr.string(50)],
    ["secretSpeakers", xdr.array(xdr.lookup("Hash"), 2)],
    ["speakers", xdr.varArray(xdr.string())]
  ])
})

let event = new types.Event({
  attendees: 5,
  eventName: "Lumenauts get together",
  secretSpeakers: [Buffer.from([0, 0]), Buffer.from([0, 1])],
  speakers: ['Jed', 'Tom', 'Zac']
})
```

Calling `#toJSON` will result in:

``` javascript
{
  attendees: 5,
  eventName: 'Lumenauts get together',
  secretSpeakers: [ 'AAA=', 'AAE=' ],
  speakers: [ 'Jed', 'Tom', 'Zac' ]
}
```

Notice how `speakers` get serialized as a JavaScript `String`  while `secretSpeakers` which is an `Opaque`, get serialized as [base64, which is documented above](#opaque-and-varopaque).

### Union

Unions are serialized as a JavaScript object, the discriminant is
store in the property `_type`. If there is an arm for the given
discriminant, then a property with the arm's name is set in the object
and its value should contain a type as defined in the XDR declaration.

The following struct has two properties of type union: `memo` and `meta`.

``` javascript
let event = new types.Event({
  attendees: 5,
  eventName: "Lumenauts get together",
  secretSpeakers: [Buffer.from([0, 0]), Buffer.from([0, 1])],
  speakers: ['Jed', 'Tom', 'Zac'],
  price: new types.Price({
    n: 2,
    d: 1
  }),
  memo: types.Memo.memoText("foo"),
  meta: types.TransactionMeta.paid(new types.Price({
    n: 2,
    d: 1
  })),
  counter: 2
})
```

The code below shows the result after calling `toJSON(event)`, notice how the `memo` property has an object
with the key `_type: "memoText"` and a property matching the arm declaration `text` with a string value of `foo`.

Similarly, the property `meta` has an object with `_type: "paid"`, with the arm `price` which contains a Struct of type `Price`.

``` javascript
{
  ...,
  "memo": {
    "_type": "memoText",
    "text": "foo"
  },
  "meta": {
    "_type": "paid",
    "price": {
      "n": 2,
      "d": 1
    }
  }
}
```

#### Default Arms

Given the following definition:

``` javascript
xdr.union("TransactionMeta", {
  switchOn: xdr.lookup("TransactionMetaType"),
  switches: [
    ["none", xdr.void()],
    ["paid", "price"]
  ],
  arms: {
    price: xdr.lookup("Price")
  },
  defaultArm: xdr.string(3)
});
```

If the union instance uses the default arm, it will be serialized like the following:

``` javascript
{
  ...,
  "meta": {
    "_type": "pending",
    "default": "foo"
  }
}
```

#### Void Arms

If there is no arm for the discriminant, only the `_type` property will appear on the object.

``` javascript
{
  ...,
  "meta": {
    "_type": "withVoidArm",
  }
}
```

## Examples

You can find more examples in the test [here](https://github.com/abuiles/json-xdr/blob/master/src/index.test.ts#L90).
