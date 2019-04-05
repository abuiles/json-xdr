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

> jsonXDR.toJSON(ATransactionStruct)
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

let aXDRTransaction = jsonXDR.toXDR(types, types.Transaction, json)
```
