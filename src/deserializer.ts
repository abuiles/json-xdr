import { Array, Enum, Hyper, Opaque, Struct, Union, UnsignedHyper, VarArray, VarOpaque } from "js-xdr";
// TODO: Move this to a types file
import { IStructConstructable, IUnionConstructor } from "./serializer";

function toUnion(unionConstructor: IUnionConstructor, value): Union {
  const discriminant = unionConstructor[value._type]();
  let arm = discriminant._arm;
  let armType = discriminant._armType;

  // TODO: Handle void and default
  if (!unionConstructor._switches.has(discriminant._switch) && unionConstructor._defaultArm) {
    armType = unionConstructor._defaultArm;
    arm = "default";
  }

  return unionConstructor[value._type](toXDR(armType, value[arm]));
}

export default function toXDR(xdrType: any, value: any): any {
  if (xdrType === Hyper || xdrType === UnsignedHyper) {
    return xdrType.fromString(value);
  } else if (Object.getPrototypeOf(xdrType) === Enum) {
    // TODO: Make it easier in js-xdr to check for instances of ChildEnum
    return xdrType.fromName(value);
  } else if (xdrType instanceof Opaque || xdrType instanceof VarOpaque) {
    // Assume Opaque and VarOpaque are passed as base64 encoded.
    // Optionally we could pass through if it is a buffer instance.
    return Buffer.from(value, "base64");
  } else if (xdrType instanceof Array || xdrType instanceof VarArray) {
    return value.map((val) => toXDR(xdrType._childType, val));
  } else if (Object.getPrototypeOf(xdrType) === Struct) {
    return deserializeStruct(xdrType, value);
  } else if (Object.getPrototypeOf(xdrType) === Union) {
    return toUnion(xdrType, value);

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
