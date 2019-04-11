import { toJSON } from './index'
import * as XDR from 'js-xdr'

const types = XDR.config((xdr) => {
  xdr.enum('Color', {
    red: 0,
    green: 1,
    blue: 2
  })

  xdr.typedef("Hash", xdr.opaque(2));
  xdr.typedef("Int32", xdr.int());

  xdr.struct("Price", [
    ["n", xdr.lookup("Int32")],
    ["d", xdr.lookup("Int32")],
  ]);

  xdr.struct('aStruct', [
    ['version', xdr.int()],
    ['fee', xdr.uint()],
    ['authorize', xdr.bool()],
    ['msg', xdr.string(11)],
    ['lat', xdr.float()],
    ['lon', xdr.double()],
    ['theVoid', xdr.void()],
    ['offerId', xdr.uhyper()],
    ['signedSequence', xdr.hyper()],
    ['color', xdr.lookup('Color')],
    ['opaque', xdr.opaque(3)],
    ['varOpaque', xdr.varOpaque(2)],
    ["skipList", xdr.array(xdr.lookup("Hash"), 2)],
    ["varSkipList", xdr.varArray(xdr.lookup("Hash"), 2147483647)],
    ['price', xdr.lookup('Price')]
  ])
})

describe('#toJSON', function() {
  test('converts XDR to JSON', () => {
    let aStruct = new types.aStruct({
      version: -1,
      fee: 100,
      authorize: true,
      msg: 'hello world',
      lat: 37.7645352,
      lon: -122.421069,
      theVoid: undefined,
      signedSequence: XDR.Hyper.fromString('-1059'),
      offerId: XDR.UnsignedHyper.fromString('12345'),
      color: types.Color.green(),
      opaque: Buffer.from([0, 0, 1]),
      varOpaque: Buffer.from([0, 1]),
      skipList: [Buffer.from([0, 0]), Buffer.from([0, 1])],
      varSkipList: [Buffer.from([0, 0]), Buffer.from([0, 1]), Buffer.from([1, 1])],
      price: new types.Price({
        n: 2,
        d: 1
      })
    })

    expect(toJSON(types, aStruct)).toMatchSnapshot()
  })
})
