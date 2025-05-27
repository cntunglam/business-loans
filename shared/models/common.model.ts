import { z } from "zod";

export type AwaitedRT<T extends (...args: any) => any> = Awaited<ReturnType<T>>;
export type NonNullRT<T extends (...args: any) => { data?: any }> = NonNullable<ReturnType<T>["data"]>;

export const emailSchema = z.string().email();
export const getPhoneSchema = () => z.string();
export const zodBoolean = z.union([z.enum(["true", "false"]), z.boolean()]).transform((value) => {
  if (typeof value === "boolean") {
    return value;
  }
  return value === "true";
});

export const zodNullableDateTime = z.union([z.string().datetime(), z.null()]).transform((value) => {
  if (value === null) return null;
  return new Date(value);
});
export const zodPageNumber = z.coerce.number().int().positive().optional().default(1);
