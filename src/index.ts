import { Array, Hyper, UnsignedHyper, Enum, Struct, Opaque, VarArray, VarOpaque } from 'js-xdr'

interface StructConstructable {
  new(object): Struct
  _fields: [string, any][]
}

function serializeHyper(value: Hyper): string {
  return value.toString()
}

function serializeEnum({ name }: Enum): string {
  return name
}

function serialize(xdrType: any, value: any): any {
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
  } else {
    return value
  }
}

function serializeStruct(struct: Struct): any {
  const structConstructor: StructConstructable = struct.constructor as StructConstructable
  return structConstructor._fields.reduce(function(json, [name, type]) {
    json[name] = serialize(type, struct._attributes[name])
    return json
  }, {})
}

export function toJSON(types: object, struct: Struct): any {
  return serializeStruct(struct);
}
