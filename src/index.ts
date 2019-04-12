import { Struct } from "js-xdr";
import { serializeStruct } from "./serializer";

export function toJSON(types: object, struct: Struct): any {
  return serializeStruct(struct);
}
