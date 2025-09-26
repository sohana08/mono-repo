/* eslint-disable @typescript-eslint/no-explicit-any */
// libs/shared-config/src/lib/decorators/fields.ts
import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  NotEquals,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

const ToUndefinedIfEmpty = () =>
  Transform(({ value }) => (value === '' ? undefined : value));

/* =========================
 * Helpers
 * ========================= */

// Allow null to bypass other validators (undefined is controlled via required:false)
export function IsNullable(opts?: { each?: boolean }): PropertyDecorator {
  // Skip subsequent validators when value is null/undefined
  return ValidateIf((_obj, value) => !(value === null || value === undefined), opts as any);
}

// Ensure a single input becomes an array for array fields
export function ToArray(): PropertyDecorator {
  return Transform(({ value }) => {
    if (value === undefined || value === null) return value;
    return Array.isArray(value) ? value : [value];
  });
}

// Strong boolean coercion for common string/number forms
export function ToBoolean(): PropertyDecorator {
  const coerce = (v: any) => {
    if (typeof v === 'boolean') return v;
    if (typeof v === 'number') return v !== 0;
    if (typeof v === 'string') {
      const s = v.trim().toLowerCase();
      if (['true', '1', 'yes', 'y', 'on'].includes(s)) return true;
      if (['false', '0', 'no', 'n', 'off'].includes(s)) return false;
    }
    return v; // let IsBoolean() fail if not coerced
  };
  return Transform(({ value }) => (Array.isArray(value) ? value.map(coerce) : coerce(value)));
}

// Safer number coercion (lets IsNumber/IsInt validate invalids)
export function ToNumber(): PropertyDecorator {
  const coerce = (v: any) => {
    if (v === '' || v === null || v === undefined) return v;
    const n = Number(v);
    return Number.isNaN(n) ? v : n;
  };
  return Transform(({ value }) => (Array.isArray(value) ? value.map(coerce) : coerce(value)));
}

// Trim strings
export function Trim(): PropertyDecorator {
  return Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  );
}

// Case transforms
export function ToLowerCase(): PropertyDecorator {
  return Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  );
}
export function ToUpperCase(): PropertyDecorator {
  return Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  );
}

/* =========================
 * Option types
 * ========================= */

type Constructor<T = any> = new (...args: any[]) => T;

type BaseFieldOpts = {
  each?: boolean;     // array of values
  required?: boolean; // default: true
  nullable?: boolean; // allow null as a value
  swagger?: boolean;  // include ApiProperty (default: true)
};

export type IBooleanFieldOptions = BaseFieldOpts;

export type INumberFieldOptions = BaseFieldOpts & {
  int?: boolean;      // integer only
  min?: number;
  max?: number;
  isPositive?: boolean;
};

export type IStringFieldOptions = BaseFieldOpts & {
  minLength?: number;
  maxLength?: number;
  trim?: boolean;
  toLowerCase?: boolean;
  toUpperCase?: boolean;
  pattern?: RegExp;   // Matches(regex)
};

export type IEnumFieldOptions = BaseFieldOpts & {
  enumName?: string;  // Swagger enumName (nice for OpenAPI)
};

export type IClassFieldOptions = BaseFieldOpts;

/* =========================
 * ClassField (nested DTO)
 * ========================= */

export function ClassField<TClass extends Constructor>(
  getClass: () => TClass,
  options: Omit<ApiPropertyOptions, 'type'> & IClassFieldOptions = {},
): PropertyDecorator {
  const clazz = getClass();
  const decs: PropertyDecorator[] = [];

  if (options.each) decs.push(ToArray());

  // Transform nested objects into class instances
  decs.push(Type(() => clazz));

  // Validate nested class (and arrays of nested)
  decs.push(ValidateNested({ each: options.each }));

  // Required vs optional
  if (options.required === false) decs.push(IsOptional());
  else decs.push(IsDefined());

  // Nullability (undefined handled by IsOptional)
  if (options.nullable) decs.push(IsNullable({ each: options.each }));
  else decs.push(NotEquals(null, { each: options.each }));

  // Swagger schema
  if (options.swagger !== false) {
    decs.push(
      ApiProperty({
        type: () => clazz,
        isArray: options.each,
        nullable: options.nullable,
        ...options,
      }),
    );
  }

  return applyDecorators(...decs);
}

/* =========================
 * BooleanField (+ Optional)
 * ========================= */

export function BooleanField(
  options: Omit<ApiPropertyOptions, 'type'> & IBooleanFieldOptions = {},
): PropertyDecorator {
  const decs: PropertyDecorator[] = [];

  if (options.each) decs.push(ToArray());
  decs.push(ToBoolean());

  if (options.required === false) decs.push(IsOptional());
  else decs.push(IsDefined());

  if (options.nullable) decs.push(IsNullable({ each: options.each }));
  else decs.push(NotEquals(null, { each: options.each }));

  decs.push(IsBoolean({ each: options.each }));

  if (options.swagger !== false) {
    decs.push(
      ApiProperty({
        type: Boolean,
        isArray: options.each,
        nullable: options.nullable,
        ...options,
      }),
    );
  }

  return applyDecorators(...decs);
}

// If you ever want it:
export const BooleanFieldOptional = (opts: Omit<ApiPropertyOptions, 'type'> & IBooleanFieldOptions = {}) =>
  BooleanField({ ...opts, required: false });

/* =========================
 * NumberField (+ Optional)
 * ========================= */

export function NumberField(
  options: Omit<ApiPropertyOptions, 'type'> & INumberFieldOptions = {},
): PropertyDecorator {
  const decs: PropertyDecorator[] = [];

  if (options.each) decs.push(ToArray());
  decs.push(Type(() => Number));
  decs.push(ToNumber());

  if (options.required === false) decs.push(IsOptional());
  else decs.push(IsDefined());

  if (options.nullable) decs.push(IsNullable({ each: options.each }));
  else decs.push(NotEquals(null, { each: options.each }));

  if (options.int) decs.push(IsInt({ each: options.each }));
  else decs.push(IsNumber({}, { each: options.each }));

  if (typeof options.min === 'number') decs.push(Min(options.min, { each: options.each }));
  if (typeof options.max === 'number') decs.push(Max(options.max, { each: options.each }));
  if (options.isPositive) decs.push(IsPositive({ each: options.each }));

  if (options.swagger !== false) {
    decs.push(
      ApiProperty({
        type: Number,
        isArray: options.each,
        nullable: options.nullable,
        minimum: options.min,
        maximum: options.max,
        ...options,
      }),
    );
  }

  return applyDecorators(...decs);
}

export const NumberFieldOptional = (
  opts: Omit<ApiPropertyOptions, 'type'> & INumberFieldOptions = {},
) => NumberField({ ...opts, required: false });

/* =========================
 * StringField (+ Optional)
 * ========================= */
export function StringField(
  options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {},
): PropertyDecorator {
  const decs: PropertyDecorator[] = [];

  if (options.each) decs.push(ToArray());

  // transforms first
  decs.push(Type(() => String));
  if (options.trim !== false) decs.push(Trim());
  if (options.toLowerCase) decs.push(ToLowerCase());
  if (options.toUpperCase) decs.push(ToUpperCase());

  // required vs optional
  if (options.required === false) decs.push(IsOptional());
  else decs.push(IsDefined());

  // nullability
  if (options.nullable) decs.push(IsNullable({ each: options.each }));
  else decs.push(NotEquals(null, { each: options.each }));

  // validators
  decs.push(IsString({ each: options.each }));

  // default min length: only if required (or explicit)
  const minLen =
    typeof options.minLength === 'number'
      ? options.minLength
      : options.required !== false
        ? 1
        : undefined;
  if (typeof minLen === 'number') decs.push(MinLength(minLen, { each: options.each }));

  if (typeof options.maxLength === 'number') decs.push(MaxLength(options.maxLength, { each: options.each }));
  if (options.pattern) decs.push(Matches(options.pattern, { each: options.each }));

  // swagger
  if (options.swagger !== false) {
    decs.push(
      ApiProperty({
        type: String,
        isArray: options.each,
        nullable: options.nullable,
        required: options.required !== false,
        minLength: minLen,
        maxLength: options.maxLength,
        ...options,
      }),
    );
  }

  return applyDecorators(...decs);
}



export function StringFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required'> & IStringFieldOptions = {},
): PropertyDecorator {
  const decs: PropertyDecorator[] = [];
  decs.push(ToUndefinedIfEmpty());                 // '' -> undefined
  if (options.each) decs.push(ToArray());
  decs.push(IsOptional());                         // short-circuits others when undefined
  decs.push(StringField({ required: false, ...options }));
  // ensure Swagger shows required: false
  if (options.swagger !== false) {
    decs.push(ApiProperty({ type: String, required: false, isArray: options.each, nullable: options.nullable, ...options }));
  }
  return applyDecorators(...decs);
}
/* =========================
 * EnumField (+ Optional)
 * ========================= */

export function EnumField<TEnum extends object>(
  getEnum: () => TEnum,
  options: Omit<ApiPropertyOptions, 'enum' | 'type'> & IEnumFieldOptions = {},
): PropertyDecorator {
  const enumObj = getEnum();
  const decs: PropertyDecorator[] = [];

  if (options.each) decs.push(ToArray());

  // required vs optional
  if (options.required === false) decs.push(IsOptional());
  else decs.push(IsDefined());

  // nullability
  if (options.nullable) decs.push(IsNullable({ each: options.each }));
  else decs.push(NotEquals(null, { each: options.each }));

  // validation
  decs.push(IsEnum(enumObj as any, { each: options.each }));

  // swagger
  if (options.swagger !== false) {
    decs.push(
      ApiProperty({
        enum: enumObj as any,
        enumName: options.enumName,
        isArray: options.each,
        nullable: options.nullable,
        ...options,
      }),
    );
  }

  return applyDecorators(...decs);
}

export const EnumFieldOptional = <TEnum extends object>(
  getEnum: () => TEnum,
  opts: Omit<ApiPropertyOptions, 'enum' | 'type'> & IEnumFieldOptions = {},
) => EnumField(getEnum, { ...opts, required: false });
