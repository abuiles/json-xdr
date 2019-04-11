import { toJSON } from './index'
import * as XDR from 'js-xdr'

const types = XDR.config((xdr) => {
  xdr.enum('Color', {
    red: 0,
    green: 1,
    blue: 2
  })

  xdr.typedef('Hash', xdr.opaque(2));
  xdr.typedef('Int32', xdr.int());

  xdr.struct('Price', [
    ['n', xdr.lookup('Int32')],
    ['d', xdr.lookup('Int32')],
  ]);

  xdr.enum('MemoType', {
    memoNone: 0,
    memoText: 1,
    memoId: 2,
    memoHash: 3,
    memoReturn: 4,
  });

  xdr.enum('TransactionMetaType', {
    none: 0,
    paid: 1,
    pending: 2
  });

  xdr.union('Memo', {
    switchOn: xdr.lookup('MemoType'),
    switchName: 'type',
    switches: [
      ['memoNone', xdr.void()],
      ['memoText', 'text'],
      ['memoId', 'id']
    ],
    arms: {
      text: xdr.string(28),
      id: xdr.lookup('Int32'),
      price: xdr.lookup('Price')
    },
  });

  xdr.union('TransactionMeta', {
    switchOn: xdr.lookup('TransactionMetaType'),
    switches: [
      ['none', xdr.void()],
      ['paid', 'price']
    ],
    arms: {
      price: xdr.lookup('Price')
    },
    defaultArm: xdr.void()
  });

  xdr.struct('Transaction', [
    ['meta', xdr.lookup('TransactionMeta')]
  ])

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
    ['skipList', xdr.array(xdr.lookup('Hash'), 2)],
    ['varSkipList', xdr.varArray(xdr.lookup('Hash'), 2147483647)],
    ['price', xdr.lookup('Price')],
    ['memo', xdr.lookup('Memo')],
    ['meta', xdr.lookup('TransactionMeta')]
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
      }),
      memo: types.Memo.memoText('hola'),
      meta: types.TransactionMeta.paid(new types.Price({
        n: 2,
        d: 1
      }))
    })

    expect(toJSON(types, aStruct)).toMatchSnapshot()
  })

  test('union with struct arm', () => {
    let transaction = new types.Transaction({
      meta: types.TransactionMeta.paid(new types.Price({
        n: 2,
        d: 1
      }))
    })

    expect(toJSON(types, transaction)).toMatchSnapshot()
  })

  test('union default arm', () => {
    let transaction = new types.Transaction({
      meta: types.TransactionMeta.pending()
    })

    expect(toJSON(types, transaction)).toMatchSnapshot()
  })
})
