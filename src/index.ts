import { Hyper, UnsignedHyper, Enum, Struct, Opaque } from 'js-xdr'

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

function serialize(xdrType: any, value: any) {
  if (value instanceof Hyper || value instanceof UnsignedHyper) {
    return serializeHyper(value)
  } else if (value instanceof Enum) {
    return serializeEnum(value)
  } else if (xdrType instanceof Opaque) {
    // assume value it's buffer like
    return value.toString('base64')
  } else {
    return value
  }
}

export function toJSON(types: object, structType: StructConstructable, struct: Struct): any {
  return structType._fields.reduce(function(json, [name, type]) {
    json[name] = serialize(type, struct._attributes[name])
    return json
  }, {})
}
