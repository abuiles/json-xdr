import { toJSON } from './index'
import * as XDR from 'js-xdr'

const types = XDR.config()

XDR.config((xdr) => {
  xdr.struct('Color', [
    ['version', xdr.int()],
    ['fee', xdr.uint()],
    ['fee', xdr.uint()],
    ['authorize', xdr.bool()]
  ])
}, types)

describe('#toJSON', function() {
  test('converts XDR to JSON', () => {
    let color = new types.Color({
      version: -1,
      fee: 100,
      authorize: true
    })

    expect(toJSON(types, types.Color, color)).toMatchSnapshot()
  })
})
