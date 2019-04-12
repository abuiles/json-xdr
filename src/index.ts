import { Struct } from "js-xdr";
import { IStructConstructable, serializeStruct } from "./serializer";

export function toJSON(types: object, struct: Struct): any {
  return serializeStruct(struct);
}

export function toXDR(structType: IStructConstructable, json: object) {
  return json;
}
