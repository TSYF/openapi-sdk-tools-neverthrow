import { ResultAsync, okAsync, errAsync } from "neverthrow";
import type { ResultBackend } from "@openapi-sdk-tools/core";
import { NeverthrowResult } from "./result";

export const neverthrowResultBackend: ResultBackend = {
  name: "neverthrow",
  fromPromise<T, E>(
    promise: Promise<T>,
    mapError: (error: unknown) => E,
  ) {
    return new NeverthrowResult(
      ResultAsync.fromPromise(promise, mapError),
    );
  },
  ok<T, E = never>(value: T) {
    return new NeverthrowResult(okAsync<T, E>(value));
  },
  err<T = never, E = unknown>(error: E) {
    return new NeverthrowResult(errAsync<T, E>(error));
  },
};
