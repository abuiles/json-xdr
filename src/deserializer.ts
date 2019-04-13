import { Struct } from "js-xdr";
// TODO: Move this to a types file
import { IStructConstructable } from "./serializer";

export default function toXDR(xdrType: any, value: any): any {
  return value;
}

export function deserializeStruct(structConstructor: IStructConstructable, payload: object): Struct {
  const attrs = {};

  structConstructor._fields.forEach(([name, type]) => {
    attrs[name] = toXDR(type, payload[name]);
  });

  return new structConstructor(attrs);
}
