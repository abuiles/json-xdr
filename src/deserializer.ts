import { Hyper, Struct, UnsignedHyper } from "js-xdr";
// TODO: Move this to a types file
import { IStructConstructable } from "./serializer";

function toHyper(value: string): Hyper {
  return Hyper.fromString(value);
}

function toUnsignedHyper(value: string): UnsignedHyper {
  return UnsignedHyper.fromString(value);
}

export default function toXDR(xdrType: any, value: any): any {
  if (xdrType === Hyper) {
    return toHyper(value);
  } else if (xdrType === UnsignedHyper) {
    return toUnsignedHyper(value);
  } else {
    return value;
  }
}

export function deserializeStruct(structConstructor: IStructConstructable, payload: object): Struct {
  const attrs = {};

  structConstructor._fields.forEach(([name, objectType]) => {
    attrs[name] = toXDR(objectType, payload[name]);
  });

  return new structConstructor(attrs);
}
