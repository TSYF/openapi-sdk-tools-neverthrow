import { isSdkResult, type SdkResultAsync } from "@openapi-sdk-tools/core";
import type { ResultAsync } from "neverthrow";
import { toResultAsync } from "./convert";

type UnwrapSdkResult<R> = R extends SdkResultAsync<infer T, any, infer E>
  ? ResultAsync<T, E>
  : R;

/**
 * Maps a generated client type to one whose methods return neverthrow
 * ResultAsync instead of the core SdkResultAsync facade.
 */
export type NeverthrowClient<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? (...args: A) => UnwrapSdkResult<R>
    : T[K] extends readonly unknown[]
      ? T[K]
      : T[K] extends object
        ? NeverthrowClient<T[K]>
        : T[K];
};

/**
 * Wraps a generated client (including root clients with nested sub-clients)
 * so every SdkResultAsync return becomes a native neverthrow ResultAsync.
 *
 * @example
 * const client = neverthrowClient(
 *   new TicketResultClient({ baseUrl, plugins: [neverthrowPlugin()] }),
 * );
 * client.ticket.getAll(); // ResultAsync<GetTicketDto[], TicketGetAllErrors>
 */
export function neverthrowClient<T extends object>(
  client: T,
): NeverthrowClient<T> {
  return new Proxy(client, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);

      if (prop === "constructor" || isSdkResult(value)) {
        return value;
      }

      if (typeof value === "function") {
        return (...args: unknown[]) => {
          const result = value.apply(target, args);
          return isSdkResult(result) ? toResultAsync(result) : result;
        };
      }

      if (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
      ) {
        return neverthrowClient(value);
      }

      return value;
    },
  }) as NeverthrowClient<T>;
}
