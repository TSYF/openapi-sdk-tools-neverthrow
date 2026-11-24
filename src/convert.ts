import { ResultAsync, ok, err, type Result } from "neverthrow";
import { type SdkResultAsync } from "@openapi-sdk-tools/core";
import { NeverthrowResult } from "./result";

/**
 * Converts any SdkResultAsync into a real neverthrow ResultAsync.
 *
 * Works whether or not the neverthrow plugin is active: when another backend
 * produced the result, it is converted through `.match()`.
 */
export function toResultAsync<T, TCode extends string, E>(
  result: SdkResultAsync<T, TCode, E>,
): ResultAsync<T, E> {
  if (result.native instanceof NeverthrowResult) {
    return result.native.native;
  }

  return new ResultAsync<T, E>(
    result.match<Result<T, E>>(
      (value) => ok<T, E>(value),
      (error) => err<T, E>(error),
    ),
  );
}
