import type { SdkPlugin } from "@openapi-sdk-tools/core";
import { neverthrowResultBackend } from "./backend";

/**
 * Result-handling plugin backed by neverthrow.
 *
 * @example
 * NestSdkModule.register(TicketResultClient, {
 *   baseUrl: "https://api.example.com",
 *   plugins: [neverthrowPlugin()],
 * });
 */
export function neverthrowPlugin(): SdkPlugin {
  return {
    name: "neverthrow",
    result: neverthrowResultBackend,
  };
}
