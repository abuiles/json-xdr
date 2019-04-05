import { toJSON } from './index'
import * as XDR from 'js-xdr';

const types = XDR.config();

XDR.config((xdr) => {
  xdr.struct('Color', [
    ['red', xdr.int()],
    ['green', xdr.int()],
    ['blue', xdr.int()]
  ]);
}, types);

describe('#toJSON', function() {
  test('converts XDR to JSON', () => {
    let color = new types.Color({
      red: 0,
      green: 1,
      blue: 2
    });

    expect(toJSON(types, types.Color, color)).toMatchSnapshot()
  });
})
