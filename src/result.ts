import { ResultAsync, ok, err, type Result } from "neverthrow";
import type { ResultLike } from "@openapi-sdk-tools/core";

/**
 * Adapts neverthrow's ResultAsync to the kernel's ResultLike contract.
 * The native ResultAsync is exposed for plugin-specific helpers.
 */
export class NeverthrowResult<T, E> implements ResultLike<T, E> {
  constructor(readonly native: ResultAsync<T, E>) {}

  match<A>(okFn: (value: T) => A, errFn: (error: E) => A): Promise<A> {
    return this.native.match(okFn, errFn);
  }

  map<U>(fn: (value: T) => U): ResultLike<U, E> {
    return new NeverthrowResult(this.native.map(fn));
  }

  mapErr<F>(fn: (error: E) => F): ResultLike<T, F> {
    return new NeverthrowResult(this.native.mapErr(fn));
  }

  andThen<U, F>(fn: (value: T) => ResultLike<U, F>): ResultLike<U, E | F> {
    return new NeverthrowResult(
      this.native.andThen((value) => toResultAsyncLike(fn(value))),
    );
  }

  orElse<U, F>(fn: (error: E) => ResultLike<U, F>): ResultLike<T | U, F> {
    return new NeverthrowResult(
      this.native.orElse((error) => toResultAsyncLike(fn(error))),
    );
  }
}

/**
 * Converts any ResultLike into a real neverthrow ResultAsync. Results already
 * backed by neverthrow are returned as-is.
 */
export function toResultAsyncLike<T, E>(
  result: ResultLike<T, E>,
): ResultAsync<T, E> {
  if (result instanceof NeverthrowResult) {
    return result.native;
  }

  return new ResultAsync<T, E>(
    result.match<Result<T, E>>(
      (value) => ok<T, E>(value),
      (error) => err<T, E>(error),
    ),
  );
}
