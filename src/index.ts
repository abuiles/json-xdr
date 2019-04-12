import { Struct } from "js-xdr";
import { deserializeStruct } from "./deserializer";
import { IStructConstructable, serializeStruct } from "./serializer";

export function toJSON(types: object, struct: Struct): any {
  return serializeStruct(struct);
}

export function toXDR(structType: IStructConstructable, payload: object) {
  return deserializeStruct(structType, payload);
}
