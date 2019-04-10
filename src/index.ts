import { Hyper, UnsignedHyper, Enum } from 'js-xdr'

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
  } else {
    return value
  }
}

export function toJSON(types: any, structType: any, struct: any): any {
  return structType._fields.reduce(function(json, [name, type]) {
    json[name] = serialize(type, struct._attributes[name])
    return json
  }, {})
}
