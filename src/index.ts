import deserialize from "./deserializer";
import serialize from "./serializer";

export function toJSON(xdr: any): object {
  return serialize(xdr.constructor, xdr);
}

export function toXDR(typeDefinition: any, payload: object) {
  return deserialize(typeDefinition, payload);
}
