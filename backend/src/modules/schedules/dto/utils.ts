// Minimal alternative to @nestjs/mapped-types to keep deps small.
export function PartialType<TBase extends new (...args: any[]) => any>(Base: TBase) {
  class PartialClass extends Base {}
  return PartialClass as new (...args: any[]) => Partial<InstanceType<TBase>>;
}

