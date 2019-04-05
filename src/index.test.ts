import { toJSON } from './index'
import * as XDR from 'js-xdr'

const types = XDR.config()

XDR.config((xdr) => {
  xdr.struct('Color', [
    ['version', xdr.int()],
    ['fee', xdr.uint()],
    ['fee', xdr.uint()],
    ['authorize', xdr.bool()],
    ['msg', xdr.string(11)],
    ['lat', xdr.float()],
    ['lon', xdr.double()],
    ['quadruple', xdr.quadruple()]
  ])
}, types)

describe('#toJSON', function() {
  test('converts XDR to JSON', () => {
    let color = new types.Color({
      version: -1,
      fee: 100,
      authorize: true,
      msg: 'hello world',
      lat: 37.7645352,
      lon: -122.421069,
      quadruple: 1.5
    })

    expect(toJSON(types, types.Color, color)).toMatchSnapshot()
  })
})
