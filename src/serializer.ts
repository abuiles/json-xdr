import {
  Array as XDRArray,
  Enum,
  Hyper,
  Opaque,
  String,
  Struct,
  Union,
  UnsignedHyper,
  VarArray,
  VarOpaque,
} from "js-xdr";

export interface IStructConstructable {
  _fields: any[];
  new(object): Struct;
}

export interface IUnionConstructor {
  _switches: Map<any, any>;
  _defaultArm: any;
  new(aSwitch: any, value: any): any;
}

function serializeHyper(value: Hyper): string {
  return value.toString();
}

function serializeEnum({ name }: Enum): string {
  return name;
}

function serializeUnion(union: Union): any {
  const serialized = {
    _type: null,
  };

  if (union.switch() instanceof Enum) {
    serialized._type =  union.switch().name;
  } else {
    serialized._type =  union.switch();
  }

  const value = serialize(union.armType(), union.value());

  let arm = union.arm();
  const unionConst = union.constructor as IUnionConstructor;

  // TODO: Add helper function to union to know if current value is the default arm.
  if (!unionConst._switches.has(union.switch()) && !!unionConst._defaultArm) {
    arm = "default";
  }

  if (value !== undefined) {
    serialized[arm] = value;
  }

  return serialized;
}

function serializeString(value: string | Buffer): any {
  if (typeof value === "string") {
    return value;
  } else {
    return value.toString("utf8");
  }
}

export function serializeStruct(struct: Struct): any {
  const structConstructor: IStructConstructable = struct.constructor as IStructConstructable;
  return structConstructor._fields.reduce((json, [name, type]) => {
    json[name] = serialize(type, struct._attributes[name]);
    return json;
  }, {});
}

export default function serialize(xdrType: any, value: any): any {
  if (value instanceof Hyper || value instanceof UnsignedHyper) {
    return serializeHyper(value);
  } else if (value instanceof Enum) {
    return serializeEnum(value);
  } else if (xdrType instanceof Opaque || xdrType instanceof VarOpaque) {
    // assume value it's buffer like
    return value.toString("base64");
  } else if (xdrType instanceof XDRArray || xdrType instanceof VarArray) {
    return value.map((val) => serialize(xdrType._childType, val));
  } else if (value instanceof Array) {
    let childType;

    if (value.length > 0) {
      // We are receiving a JavaScript array, let's try to guess its elements type
      childType = value[0].constructor;
    }

    return value.map((val) => serialize(childType, val));
  } else if (xdrType instanceof String) {
    return serializeString(value);
  } else if (value instanceof Struct) {
    return serializeStruct(value);
  } else if (value instanceof Union) {
    return serializeUnion(value);
  } else {
    return value;
  }
}
