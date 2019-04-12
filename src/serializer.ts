import { Array, Hyper, UnsignedHyper, Enum, Struct, Opaque, Union, VarArray, VarOpaque } from 'js-xdr'

interface StructConstructable {
  new(object): Struct
  _fields: [string, any][]
}

interface UnionConstructor {
  new(object): Struct
  _switches: Map<any, any>
  _defaultArm: any
}

function serializeHyper(value: Hyper): string {
  return value.toString()
}

function serializeEnum({ name }: Enum): string {
  return name
}

function serializeUnion(union: Union): any {

  let serialized = {
    _type: union.switch().name
  }

  let value = serialize(union.armType(), union.value())

  let arm = union.arm()
  let unionConst = union.constructor as UnionConstructor

  // TODO: Add helper function to union to know if current value is the default arm.
  if (!unionConst._switches.has(union.switch()) && !!unionConst._defaultArm) {
    arm = 'default'
  }

  if (value !== undefined) {
    serialized[arm] = value
  }

  return serialized;
}

export function serializeStruct(struct: Struct): any {
  const structConstructor: StructConstructable = struct.constructor as StructConstructable
  return structConstructor._fields.reduce(function(json, [name, type]) {
    json[name] = serialize(type, struct._attributes[name])
    return json
  }, {})
}

export default function serialize(xdrType: any, value: any): any {
  if (value instanceof Hyper || value instanceof UnsignedHyper) {
    return serializeHyper(value)
  } else if (value instanceof Enum) {
    return serializeEnum(value)
  } else if (xdrType instanceof Opaque || xdrType instanceof VarOpaque) {
    // assume value it's buffer like
    return value.toString('base64')
  } else if (xdrType instanceof Array || xdrType instanceof VarArray) {
    return value.map(val => serialize(xdrType._childType, val))
  } else if (value instanceof Struct) {
    return serializeStruct(value)
  } else if (value instanceof Union) {
    return serializeUnion(value)
  } else {
    return value
  }
}
