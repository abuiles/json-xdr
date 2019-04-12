import { Struct } from "js-xdr";
// TODO: Move this to a types file
import { IStructConstructable } from "./serializer";

export function deserializeStruct(structType: IStructConstructable, payload: object): Struct {
  return new structType(payload);
}
