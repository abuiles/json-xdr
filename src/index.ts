import { Hyper, UnsignedHyper } from 'js-xdr'

function serializeHyper(value: Hyper): string {
  return value.toString()
}

function serialize(xdrType: any, value: any) {
  if (value instanceof Hyper || value instanceof UnsignedHyper) {
    return serializeHyper(value)
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
