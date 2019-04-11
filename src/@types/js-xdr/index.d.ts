// Type definitions for js-xdr v1.1.1
// Project: https://github.com/stellar/js-xdr
// Definitions by: Adolfo Builes <https://github.com/abuiles>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 3.4.1
declare module 'js-xdr' {
  import * as Long from 'long'

  export class Array {
    _childType: any
    _length: number
  }

  export class ChildStruct extends Struct {
  }

  export function config(fn: any, types?: any): any;

  export class Enum {
    name: string
    value: number
  }

  export class Hyper extends Long {
  }

  export class Opaque {
  }

  export class Struct {
    _attributes: object
  }

  export class Union {
    switch(): any
    armType(): any
    value(): any
    arm(): any
  }

  export class UnsignedHyper extends Long {
  }

  export class VarArray {
    _childType: any
    _length: number
  }

  export class VarOpaque {
  }
}
