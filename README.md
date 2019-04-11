# JSON <-> XDR

[![Build Status](https://travis-ci.org/abuiles/json-xdr.svg?branch=master)](https://travis-ci.org/abuiles/json-xdr)

This library augments [js-xdr](https://github.com/stellar/js-xdr) to let you convert XDR to JSON and JSON to XDR.

## Installation

via npm:

```shell
npm install --save json-xdr
```

## Usage

Given a XDR representing a Transaction struct as defined in [examples/xdr.js](https://github.com/abuiles/json-xdr/blob/master/examples/xdr.js#L2440), you can convert it to JSON like the following:

```javascript
import jsonXDR from 'json-xdr'
import types from './examples/xdr'

> jsonXDR.toJSON(types, ATransactionStruct)
{
  sourceAccount: "GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H",
  fee: 100,
  seqNum: 1234,
  timeBounds: null,
  memo: {
    discriminant: "memoNone"
  },
  operations: [
    {
      sourceAccount: "GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H",
      body: {
        discriminant: "createAccount",
        arm: {
          destination: "GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H",
          startingBalance: 200000000
        }
      }
    }
  ],
  ext: {
    discriminant: 0
  }
}
```

You can convert a JSON object to its XDR representation:

``` javascript
import jsonXDR from 'json-xdr'
import types from './examples/xdr'

let json = {
  sourceAccount: "GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H",
  fee: 100,
  seqNum: 1234,
  timeBounds: null,
  memo: {
    discriminant: "memoNone"
  },
  operations: [
    {
      sourceAccount: "GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H",
      body: {
        discriminant: "createAccount",
        arm: {
          destination: "GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H",
          startingBalance: 200000000
        }
      }
    }
  ],
  ext: {
    discriminant: 0
  }
}

let aXDRTransaction = jsonXDR.toXDR(types, json)
```

## Serialization format

### Opaque and VarOpaque

Opaque data will be serialized as a `base64` encoded string.

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
import jsonXDR from 'json-xdr'

> jsonXDR.toJSON(types, withOpaque)
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
import jsonXDR from 'json-xdr'

> jsonXDR.toJSON(types, event)
{
  attendees: 5,
  eventName: 'Lumenauts get together',
  secretSpeakers: [ 'AAA=', 'AAE=' ],
  speakers: [ 'Jed', 'Tom', 'Zac' ]
}
```

Notice how `speakers` get serialized as a JavaScript `String`  while `secretSpeakers` which is an `Opaque`, gets serialized as [documented above](#opaque-and-varopaque).
