export class EnumMapper {
  static stringToEnum<T extends Record<string, string | number>>(
    enumObject: T,
    value: string | null
  ): T[keyof T] | null {

    if (value === null) {
      return null;
    }

    const enumValues = Object.values(enumObject);
    if (enumValues.includes(value as T[keyof T])) {
      return value as T[keyof T];
    }
    return null;
  }
}
